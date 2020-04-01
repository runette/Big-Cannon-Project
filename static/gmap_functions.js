(function ($, callback) {
        window.initMap = function () {
            let location_uk = {lat: 0, lng: 0};
            let mapOptions = {
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
            let div = $('#locate')[0];
            let options = {
                div: div,
                position: this.google.maps.ControlPosition.LEFT_BOTTOM,
                pan: true,
                zoom: true,
                zoomTo: 17
            }
            let locateControl = new this.google.maps.LocateControl(map, options);
            callback($);
        };
    if (!sessionStorage.getItem('database')) {
        $.ajax({
            type: 'post',
            url: "/map_fetch",
            success: function (data) {
                sessionStorage.setItem('database', data);
                sessionStorage.setItem('entryPath', JSON.parse(data).entryPath);
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
        $material = $('#material'),
        $type = $('#type'),
        $order = $('#order'),
        arrEntries;
        window.dataBase = JSON.parse(sessionStorage.getItem('database'));
        var pagesize = window.innerWidth < 1000 ? 5 : 10;

    /* map functions */

    function refreshMap() {
        deleteMarkers();
        arrEntries = applyFilter(getEntries());
        sessionStorage.setItem('current_view', JSON.stringify(arrEntries))
        initMarkerClusterer();
        let w = map.getDiv().offsetWidth;
        if (w >= 1000) {padding = {
            bottom: 0,
            left: 0,
            top: 100,
            right: 400
        }} else {padding = {
            bottom: 0,
            left: 0,
            top: 0,
            right: 0
        }
        }
        let padding

        if(bounds) {
            map.fitBounds(bounds, padding);
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
        var filename,
            href = dataBase['entryPath'] + entry["anchor_id"];;
        if (!entry['filename']) {
            filename = dataBase['defaultThumb'];
        }
        else {
            filename =  entry['filename'];
        }
        return ['<div class="info" style="width: 300px;">', '<div class="card " onClick="location.href=' + "'" + href + "'" + '"><div class="row no-gutters"><div class="col-2">', '<img class="card-img" src="' + filename + '"  width="32px"/></div>', '<div class="col-10"><div class="card-body"><div class="h6 card-title text-truncate">' + entry["site"] + '</div>', '<div class="card-text"><p>', entry['category'] == "Not Known" ? "" : entry['category'] + ", ", entry["anchor_type"] == "Not Known" ? "" : entry["anchor_type"], '</p></div></div></div>', '</div></div>', '</div>'].join('');
    }

    function getEntries() {
        if (dataBase.entries && $.isArray(dataBase.entries)) {
            return dataBase.entries;
        }

        return [];
    }

    function applyFilter(entries) {
        var material = $material.val(),
            type = $type.val(),
            order = $order.val(),
            isSearchMaterial = material != '',
            isSearchType = type != '',
            fiterredEntries;

        sessionStorage.setItem("filter", JSON.stringify({type: type,
            material: material, order:order}))

        fiterredEntries = entries.filter(function (entry) {
            if (isSearchMaterial && entry.anchor_type !== material) {
                return false;
            }
            if (isSearchType && entry.category !== type) {
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

        return ['<div class="card " onClick="location.href=' + "'" + href + "'" + '"><div class="row no-gutters"><div class="col-2">', '<img class="card-img" src="' + filename + '"  width="32px"/></div>', '<div class="col-8"><div class="card-body"><div class="h5 card-title text-truncate">' + entry["site"] + '</div>', '<div class="card-text"><p>', entry['category'] == "Not Known" ? "" : entry['category'] + ", ", entry["anchor_type"] == "Not Known" ? "" : entry["anchor_type"], '</p><small class=text-muted>' + entry["names"] + '</small></div></div></div>', '<div class="col-2 status">', '<span class="quality' + entry["quality"] + '"></span>', '</div></div></div>'].join('');
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

        if ( entries.length > pagesize) {
            let total = 10,
                totalPages = Math.ceil(entries.length / pagesize),
                i = 0,
                html = '';
            if (currentPage <= 0) {
                html += '<li class="page-item disabled"><span class="page-link">&laquo;</span></li>';
                window.prevPage = -1;
            }
            else {
                html += '<li class="page-item"><btn class="page-link"  data-page="'+(currentPage-1)+'"><span>&laquo;</span></a></li>';
                window.prevPage=currentPage-1;
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
                var p = i + 1;
                var a = '';
                if (i === currentPage) {
                    a = 'active';
                }
                html += '<li class="page-item ' + a + '"><btn class="page-link" data-page="' + i + '">' + p + '</li>';
            }
            $pagination.html(html);
            var next = currentPage + 1;
            if (next >= totalPages) {
                var $next = $('<li class="page-item disabled"><span class="page-link">&raquo;</span></li>');
                nextPage=-1;
            }
            else {
                var $next = $('<li class="page-item"><btn class="page-link"  data-page="' + next + '"><span>&raquo;</span></a></li>');
                window.nextPage=next;
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
                                    currentPage = Math.floor(idx / pagesize) ;
                                    break;
                                }
                    }
                }
            else {
                currentPage = 0
            }
        }
        if (entries && entries.length) {
            var pageSize = Math.min(pagesize, entries.length),
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
    var mc = new Hammer(document.getElementById('table-entries'), {
        domEvents: true,
    });
    // listen to events...
        mc.on("swipeleft", function(ev) {
            if (nextPage != -1) {
                initTableEntries(arrEntries, nextPage);
                };
         });
         mc.on("swiperight", function(ev) {
         if (prevPage != -1) {
                initTableEntries(arrEntries, prevPage);
                };
         });
    initSearchForm();
    updateTableEntries();
});
