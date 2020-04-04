namespace google.maps {

    export class LocateControl {
        public marker: Circle;
        constructor (map: Map, args: LocateControlOptions, el: HTMLElement ) {
            let options = args;
            map.controls[options.position ? options.position : ControlPosition.BOTTOM_LEFT].push(el);
            this.marker = new Circle({
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
        }
    }

    export interface LocateControlOptions {
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
