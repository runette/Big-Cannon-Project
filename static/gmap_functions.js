(function ($, callback) {
    $.ajax({
        type: 'post',
        url: "/map_fetch",
        success: function (data) {
            response = JSON.parse(data);
            callback($,response)
        }
    });
    window.initMap = function () {
        location_uk = {lat: 52, lng: 0};
        mapOptions = {
            zoom: 7,
            center: location_uk,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: true,
            fullscreenControl: true
        };

        window.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

        window.infoWindow = new google.maps.InfoWindow();

    };
})(window.jQuery, function ($, AnchorGmap) {

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
        $location = $('#location'),
        $anchorType = $('#anchor-type'),
        $quality = $('#quality'),
        $order = $('#order'),
        arrEntries;

    /* map functions */

    function refreshMap() {
        deleteMarkers();
        arrEntries = applyFilter(getEntries());
        initMarkerClusterer();

        if(bounds) {
            map.fitBounds(bounds);
        }
    }

    function getIcon(icon) {
        if (!AnchorGmap || !AnchorGmap.icons[icon]) {
            return AnchorGmap.icons['none'];
        }

        return AnchorGmap.icons[icon];
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
            map.setCenter(marker.position);

            if (map.getZoom() < MIN_ZOOM) {
                map.setZoom(MIN_ZOOM);
            }
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
            filename = AnchorGmap['defaultThumb'];
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
            '<p style="margin-bottom: 0;"><strong>Type: </strong>' + entry.anchor_type + '</p>',
            '<p style="margin-bottom: 0;"><strong>From: </strong>' + (entry.site == '' ? 'unknown' : entry.site) + '</p>',
            '<p style="margin-bottom: 0;"><strong>Location: </strong>' + entry.location + '</p>',
            '</div>',
            '</div>',
            '</a>',
            '</div>'
        ].join('');
    }

    function getEntries() {
        if (AnchorGmap.entries && $.isArray(AnchorGmap.entries)) {
            return AnchorGmap.entries;
        }

        return [];
    }

    function applyFilter(entries) {
        var location = $location.val().trim().toLowerCase(),
            anchorType = $anchorType.val(),
            quality = $quality.val(),
            order = $order.val(),
            isSearchLocation = location != '',
            isSearchAnchorType = anchorType != '',
            isSearchQuality = quality != '',
            fiterredEntries;

        fiterredEntries = entries.filter(function (entry) {
            if (isSearchLocation && entry.location.toLowerCase().indexOf(location) == -1){
                return false;
            }
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
        if (order == AnchorGmap.sort['asc']) {
            return fiterredEntries.sort(function (a, b) {
                return a.anchor_id - b.anchor_id;
            });
        }
        else if (order == AnchorGmap.sort['desc']) {
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
        var filename, href = AnchorGmap['entryPath'] +  entry["anchor_id"];

        if (!entry['filename']) {
            filename = AnchorGmap['defaultThumb'];
        }
        else {
            filename = entry['filename'];
        }

        return [
            '<tr class="clickable-row" data-href="' + href + '">',
            '<td >',
            '<span><img class="img-thumbnail" src="' + filename + '" alt /></span>',
            '</td>',
            '<td>' + entry["anchor_id"] + '</td>',
            '<td>' + entry["anchor_type"] + '</td>',
            '<td>' + entry["location"] + '</td>',
            '<td>' + entry["nationality"] + '</td>',
            '<td>' + entry["names"] + '</td>',
            '<td class="status">',
            '<span class="' + entry["quality"] + '"></span>',
            '</td>',
            '</tr>'
        ].join('');
    }

    function updateTableEntries() {
        refreshMap();
        initTableEntries(arrEntries);
    }

    function updatePaginations(entries, curentPage) {
        var $pagination = $('.pagination');

        if (!$pagination.length) {
            $pagination = $('<ul class="pagination"></ul>').insertAfter($tableEntries);
        }

        if (AnchorGmap.pageSize && entries.length && entries.length > AnchorGmap.pageSize) {
            var total = 10,
                totalPages = Math.floor(entries.length / AnchorGmap.pageSize),
                i = 0,
                html = '';

            if (curentPage <= 0) {
                html += '<li class="prev disabled"><span>«</span></li>';
            }
            else {
                html += '<li class="prev"><a href="/database?page=' + curentPage + '" data-page="'+(curentPage-1)+'">«</a></li>';
            }

            if (curentPage - 5 > 0) {
                i = curentPage - 5;
                total = curentPage + 5
            }
            if (curentPage + 5 > totalPages) {
                i = Math.max(0, totalPages - 10);
                total = totalPages;
            }

            for (; i < total; i++) {
                var p = i + 1,
                    a = '';
                if (i == curentPage) {
                    a = 'active';
                }
                html += '<li class="' + a + '"><a href="/database?page=' + p + '" data-page="' + i + '">' + p + '</li>';
            }
            $pagination.html(html);
            var next = curentPage + 1;
            if (next >= totalPages) {
                var $next = $('<li class="next disabled"><span>»</span></li>');
            }
            else {
                var $next = $('<li class="next"><a href="/database?page=' + (next + 1) + '" data-page="' + next + '">»</a></li>');
            }
            $pagination.append($next);
        }
        else {
            $pagination.html('');
        }
    }

    function initTableEntries(data, curentPage) {
        var entries;
        if ($.isArray(data)) {
            entries = data;
        }
        else {
            entries = getEntries();
        }
        if (curentPage == null) {
            curentPage = 0;
        }

        if (entries && entries.length) {
            var pageSize = Math.min(AnchorGmap['pageSize'], entries.length),
                i = curentPage * pageSize,
                l = i + pageSize,
                html = '';
            for (; i < l; i++) {
                html += generateEntry(entries[i]);
            }

            $tableEntries.children('tbody').html(html);
            $noData.addClass('hide');
            $tableEntries.removeClass('hide');
        }
        else {
            $tableEntries.children('tbody').empty();
            $noData.removeClass('hide');
            $tableEntries.addClass('hide');
        }

        updatePaginations(entries, curentPage);
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
            scrollToElement($tableEntries);
        });

        function submitForm() {
            updateTableEntries();
        }
    }

    function initialize() {
        initTableEntries();
        initSearchForm();

        $doc.on('click', '.clickable-row', function (e) {
            e.preventDefault();
            e.stopPropagation();

            window.location.href = $(this).data('href');
        });
    }


    map = window.map;
    infoWindow = window.infoWindow;
    $(initialize);
    refreshMap();
    //resize
        $(window).off('resize.map').on('resize.map', function () {
            if(map.getZoom()< MIN_ZOOM){
                map.setZoom(MIN_ZOOM);
            }
        });
});
