(function ($, callback) {
        window.initMap = function () {
            location_uk = {lat: 52, lng: 0};
            mapOptions = {
                zoom: 7,
                center: location_uk,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                zoomControl: true,
                zoomControlOptions:{
                    position: google.maps.ControlPosition.LEFT_BOTTOM},
                mapTypeControl: false,
                scaleControl: true,
                streetViewControl: false,
                rotateControl: true,
                fullscreenControl: false,
            };
            window.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
            window.infoWindow = new google.maps.InfoWindow();
            callback($);
        };
    if (!sessionStorage.getItem('database')) {
        $.ajax({
            type: 'post',
            url: "/map_fetch",
            success: function (data) {
                sessionStorage.setItem('database', data);
                callback($)
                }
            })
        }
    
})(window.jQuery, function ($) {

    var MIN_ZOOM = 7,
        MAX_ZOOM = 12;

    var $doc = $(document),
        $html = $('html, body'),
        map,
        bounds,
        markers = [],
        markerClusterer,
        mcOptions = {
            maxZoom: 12,
            imagePath: '/img/m'
        },
        infoWindow,

        //entries

        $tableEntries = $('#table-entries'),
        $noData = $('.no-data'),
        $anchorType = $('#anchor-type'),
        $quality = $('#quality'),
        $order = $('#order'),
        arrEntries;
        dataBase = JSON.parse(sessionStorage.getItem('database'));

    /* map functions */

    function refreshMap() {
        deleteMarkers();
        arrEntries = applyFilter(getEntries());
        sessionStorage.setItem('current_view', JSON.stringify(arrEntries))
        initMarkerClusterer();

        if(bounds) {
            map.fitBounds(bounds);
        }
    }

    function getIcon(icon) {
        if (!dataBase || !dataBase.icons[icon]) {
            return dataBase.icons['none'];
        }

        return dataBase.icons[icon];
    }

    /* marker */
    function initMarkerClusterer() {
        if (!arrEntries.length) {
            return;
        }
        bounds = null;
        if (arrEntries.length > 1) {
            bounds = new google.maps.LatLngBounds();
            bounds.extend ({lat:50, lng:-6});
            bounds.extend ({lat:59, lng:2});
        }

        addMarkers();

        markerClusterer = new MarkerClusterer(map, markers, mcOptions);
    }
    
    function addMarkers() {
        for (var i = 0, l = arrEntries.length; i < l; i++) {
            addMarker(arrEntries[i]);
        }
    }

    function addMarker(entry) {
        var marker = new google.maps.Marker({
            position: {lat: parseFloat(entry.latitude), lng: parseFloat(entry.longitude)},
            // map: map,
        });

        if (getIcon(entry.quality)) {
            marker.setIcon(getIcon(entry.quality));
        }

        if(bounds) {
            bounds.extend(marker.position);
        }

        var content = generateContent(entry);
        marker.addListener('click', function (e) {
            e.cancelBubble = true;
            e.returnValue = false;
            if (e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault();
            }

            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    }

    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    function clearMarkers() {
        if (markerClusterer) {
            markerClusterer.clearMarkers();
        }
        setMapOnAll(null);
    }

    function deleteMarkers() {
        clearMarkers();
        markers = [];
    }

    function generateContent(entry) {
        var filename;
        if (!entry['filename']) {
            filename = dataBase['defaultThumb'];
        }
        else {
            filename =  entry['filename'];
        }
        return [
            '<div class="info" style="width: 300px;">',
            '<a href="' + (BaseUrl + '/database/entry?gun_id=' + entry.anchor_id) + '" style="text-decoration: none;">',
            '<div class="info-inner" style="width: 100%;">',
            '<div style="width: 30%;float: left;padding: 5px 0 0;">',
            '<img src="' + filename + '" style="width: 100%; height: auto;">',
            '</div>',
            '<div style="overflow: hidden; padding-left: 10px;">',
            '<p style="margin-bottom: 0;"><strong>Site: </strong>' + (entry.site == '' ? 'unknown' : entry.site) + '</p>',
            '<p style="margin-bottom: 0;"><strong>Type: </strong>' + entry.anchor_type + '</p>',
            entry.location ? '<p style="margin-bottom: 0;"><strong>Location: </strong>' + entry.location + '</p>' : "",
            '</div>',
            '</div>',
            '</a>',
            '</div>'
        ].join('');
    }

    function getEntries() {
        if (dataBase.entries && $.isArray(dataBase.entries)) {
            return dataBase.entries;
        }

        return [];
    }

    function applyFilter(entries) {
        var anchorType = $anchorType.val(),
            quality = $quality.val(),
            order = $order.val(),
            isSearchAnchorType = anchorType != '',
            isSearchQuality = quality != '',
            fiterredEntries;
            
        sessionStorage.setItem("filter", JSON.stringify({type:anchorType, quality:quality, order:order}))

        fiterredEntries = entries.filter(function (entry) {
            if (isSearchAnchorType && entry.anchor_type !== anchorType) {
                return false;
            }
            if (isSearchQuality && entry.quality !== quality) {
                return false;
            }

            return true;
        });

        if (order != '') {
            fiterredEntries = sortAnchorByDateSubmitted(fiterredEntries, order);
        }

        return fiterredEntries;
    }

    function sortAnchorByDateSubmitted(fiterredEntries, order) {
        if (order == dataBase.sort['asc']) {
            return fiterredEntries.sort(function (a, b) {
                return a.anchor_id - b.anchor_id;
            });
        }
        else if (order == dataBase.sort['desc']) {
            return fiterredEntries.sort(function (a, b) {
                return b.anchor_id - a.anchor_id;
            });
        }
        return fiterredEntries;
    }

    /* end of map functions */

    function scrollToElement($el) {
        if ($el && $el.length) {
            $html.animate({
                scrollTop: $el.offset().top
            }, 700);
        }
    }

    function generateEntry(entry) {
        var filename, href = dataBase['entryPath'] +  entry["anchor_id"];

        if (!entry['filename']) {
            filename = dataBase['defaultThumb'];
        }
        else {
            filename = entry['filename'];
        }

        return [
            '<div class="card " onClick="location.href=' + "'" + href + "'" + '"><div class="row no-gutters"><div class="col-2">',
            '<img class="card-img" src="' + filename + '"  width="32px"/></div>',
            '<div class="col-8"><div class="card-body"><div class="h5 card-title text-truncate">' + entry["site"] + '</div>',
            '<div class="card-text">' + entry["anchor_type"] + '</div>',
            '<div class="card-text"><small class=text-muted>' + entry["names"] + '</small></div></div></div>', 
            '<div class="col-2 status">',
            '<span class="quality' + entry["quality"] + '"></span>',
            '</div></div></div>',
        ].join('');
    }

    function updateTableEntries(current_page) {
        refreshMap();
        initTableEntries(arrEntries, current_page);
    }

    function updatePaginations(entries, currentPage) {
        var $pagination = $('.pagination');

        if (!$pagination.length) {
            $pagination = $('<ul class="pagination pagination-sm"></ul>').insertAfter($tableEntries);
        }

        if (dataBase.pageSize && entries.length && entries.length > dataBase.pageSize) {
            let total = 10,
                totalPages = Math.ceil(entries.length / dataBase.pageSize),
                i = 0,
                html = '';

            if (currentPage <= 0) {
                html += '<li class="page-item disabled"><span class="page-link">&laquo;</span></li>';
            }
            else {
                html += '<li class="page-item"><btn class="page-link"  data-page="'+(currentPage-1)+'"><span>&laquo;</span></a></li>';
            }

            if (totalPages < total){
                total = totalPages;
            } else {
            if (currentPage + 5 >= totalPages) {
                i = Math.max(0, totalPages - 10);
                total = totalPages;
            } else {
                if (currentPage - 5 > 0) {
                    i = currentPage - 5;
                    total = currentPage + 5;
                    }
                };
                };

            for (; i < total; i++) {
                var p = i + 1,
                    a = '';
                if (i === currentPage) {
                    a = 'active';
                }
                html += '<li class="page-item ' + a + '"><btn class="page-link" data-page="' + i + '">' + p + '</li>';
            }
            $pagination.html(html);
            var next = currentPage + 1;
            if (next >= totalPages) {
                var $next = $('<li class="page-item disabled"><span class="page-link">&raquo;</span></li>');
            }
            else {
                var $next = $('<li class="page-item"><btn class="page-link"  data-page="' + next + '"><span>&raquo;</span></a></li>');
            }
            $pagination.append($next);
        }
        else {
            $pagination.html('');
        }
    }

    function initTableEntries(data, currentPage) {
        var entries;
        if ($.isArray(data)) {
            entries = data;
        }
        else {
            entries = getEntries();
        }
        let gunid = sessionStorage.getItem('gunid')
        if (currentPage == null) {
            if (gunid){
                for (let idx = 0; idx<entries.length; idx++ ){
                                if (entries[idx].anchor_id == gunid){
                                    currentPage = Math.floor(idx / dataBase.pageSize) ;
                                    break;
                                }
                    }
                }
            else {
                currentPage = 0
            }
        }
        if (entries && entries.length) {
            var pageSize = Math.min(dataBase['pageSize'], entries.length),
                i = currentPage * pageSize,
                l = i + pageSize,
                html = '';
            for (; i < l; i++) {
                if (entries[i]) {
                html += generateEntry(entries[i]);
                }
            }

            $tableEntries.html(html);
            $noData.addClass('hide');
            $tableEntries.removeClass('hide');
        }
        else {
            $tableEntries.empty();
            $noData.removeClass('hide');
            $tableEntries.addClass('hide');
        }

        updatePaginations(entries, currentPage);
    }

    function initSearchForm() {
        var $form = $('#search');
        $form
            .on('submit', function (e) {
                e.preventDefault();
                e.stopPropagation();
                submitForm();

            })
            .find('input[type=text], select').on('change', function (e) {
                e.preventDefault();
                e.stopPropagation();
                submitForm();
            });


        $doc.on('click', '[data-page]', function (e) {
            e.preventDefault();
            var $target = $(this);

            if ($target.parent().hasClass('active')) {
                return;
            }

            initTableEntries(arrEntries, $target.data('page'));
            sessionStorage.removeItem('gunid')
            //scrollToElement($tableEntries);
        });}

    function submitForm() {
        sessionStorage.removeItem('gunid');
        updateTableEntries();
    }
        

    $doc.on('click', '.clickable-row', function (e) {
        e.preventDefault();
        e.stopPropagation();

        window.location.href = $(this).data('href');
    });
    
    map = window.map;
    infoWindow = window.infoWindow;
    if (sessionStorage.getItem('filter')){
            let filter = JSON.parse(sessionStorage.getItem('filter'));
            $('#anchor-type').val(filter.type);
            $('#quality').val(filter.quality);
            $('#order').val(filter.order);
        }
    initSearchForm();
    updateTableEntries();
    //resize
     //   $(window).off('resize.map').on('resize.map', function () {
     //       if(map.getZoom()< MIN_ZOOM){
     //           map.setZoom(MIN_ZOOM);
     //       }
     //   });
});
