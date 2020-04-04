namespace google.maps {
    export class LocateControl {
        constructor (map: Map, args: LocateControlOptions ) {
            let options = args;
            let status: LocateControlStatus = 'off';
            let watch: number;
            var my_position: Position;
            let icon = document.getElementById("locate-icon");
            map.controls[options.position ? options.position : ControlPosition.BOTTOM_LEFT].push(options.div);
            let marker: Circle = new Circle({
                strokeColor: '#0000FF',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#0000FF',
                fillOpacity: 0.35,
            });
            if (! options.locationOptions) options.locationOptions = {
                enableHighAccuracy: true,
                timeout: 100000,
                maximumAge: 1000000,
            }
            options.div.addEventListener('click', function() {
                if(navigator.geolocation && status === 'off' ) {
                    status = 'on';
                    icon.classList.remove("locate-moved");
                    icon.classList.add("locate-selected");
                    watch = navigator.geolocation.watchPosition(function(position) {
                        my_position = position;
                        let latlng = new LatLng(position.coords.latitude, position.coords.longitude);
                        marker.setMap(map);
                        marker.setCenter(latlng);
                        marker.setRadius(position.coords.accuracy); 
                        if (options.pan && status !== 'moved') map.setCenter(latlng);
                        if (options.zoom && status !== 'moved') map.setZoom( options.zoomTo ? options.zoomTo : 17)
                    }, function(e) { console.log(e.message)},options.locationOptions);
                } else if (status == 'on' ) {
                    status = 'off';
                    icon.classList.remove("locate-selected");
                    navigator.geolocation.clearWatch(watch);
                    marker.setMap(null);

                } else if (status == 'moved') {
                    status = 'on';
                    icon.classList.remove("locate-moved");
                    icon.classList.add("locate-selected");
                    let latlng = new LatLng(my_position.coords.latitude, my_position.coords.longitude);
                    map.setCenter(latlng);
                }
            });
            map.addListener('dragstart', function(){
                status = "moved";
                icon.classList.remove("locate-selected");
                icon.classList.add("locate-moved");
            })
        }
    }

    export interface LocateControlOptions {
        div: HTMLElement;
        position?: ControlPosition;
        zoom?: boolean;
        zoomTo?: number;
        pan?: boolean;
        locationOptions?:LocationOptions;
    }

    export interface LocationOptions {
        enableHighAccuracy?: boolean;
        timeout?: number;
        maximumAge?: number;
    }

    export type LocateControlStatus = 'off' |  "on" | 'moved'
}
