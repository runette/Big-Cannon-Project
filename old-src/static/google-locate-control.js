var google;
(function (google) {
    var maps;
    (function (maps) {
        var LocateControl = /** @class */ (function () {
            function LocateControl(map, args) {
                var options = args;
                var status = 'off';
                var watch;
                var my_position;
                var icon = document.getElementById("locate-icon");
                map.controls[options.position ? options.position : maps.ControlPosition.BOTTOM_LEFT].push(options.div);
                var marker = new maps.Circle({
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#0000FF',
                    fillOpacity: 0.35
                });
                if (!options.locationOptions)
                    options.locationOptions = {
                        enableHighAccuracy: true,
                        timeout: 100000,
                        maximumAge: 1000000
                    };
                options.div.addEventListener('click', function () {
                    if (navigator.geolocation && status === 'off') {
                        status = 'on';
                        icon.classList.remove("locate-moved");
                        icon.classList.add("locate-selected");
                        watch = navigator.geolocation.watchPosition(function (position) {
                            my_position = position;
                            var latlng = new maps.LatLng(position.coords.latitude, position.coords.longitude);
                            marker.setMap(map);
                            marker.setCenter(latlng);
                            marker.setRadius(position.coords.accuracy);
                            if (options.pan && status !== 'moved')
                                map.setCenter(latlng);
                            if (options.zoom && status !== 'moved')
                                map.setZoom(options.zoomTo ? options.zoomTo : 17);
                        }, function (e) { console.log(e.message); }, options.locationOptions);
                    }
                    else if (status == 'on') {
                        status = 'off';
                        icon.classList.remove("locate-selected");
                        navigator.geolocation.clearWatch(watch);
                        marker.setMap(null);
                    }
                    else if (status == 'moved') {
                        status = 'on';
                        icon.classList.remove("locate-moved");
                        icon.classList.add("locate-selected");
                        var latlng = new maps.LatLng(my_position.coords.latitude, my_position.coords.longitude);
                        map.setCenter(latlng);
                    }
                });
                map.addListener('dragstart', function () {
                    status = "moved";
                    icon.classList.remove("locate-selected");
                    icon.classList.add("locate-moved");
                });
            }
            return LocateControl;
        }());
        maps.LocateControl = LocateControl;
    })(maps = google.maps || (google.maps = {}));
})(google || (google = {}));
