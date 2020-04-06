///<reference types='googlemaps' />
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import {LocateControl, LocateControlOptions, LocateControlStatus} from  './google-locate-control';

@Component({
  selector: 'app-googlemap-locate',
  templateUrl: './googlemap-locate.component.html',
  styleUrls: ['./googlemap-locate.component.scss']
})
export class GooglemapLocateComponent implements OnInit {
  @ViewChild('div', {"static": false}) div: ElementRef;

  private _map: google.maps.Map;
  
  @Input()
  options: LocateControlOptions

  status: LocateControlStatus = 'off';

  private watch: number;
  private control: LocateControl;
  private position: Position;

  constructor() { }

  ngOnInit(): void {
  }

  @Input() set map(map: google.maps.Map){
    if (map) {
      this._map = map;
      let status= this.status
      this.control = new LocateControl(map, this.options, this.div.nativeElement );
      map.addListener('dragstart', function(){
        status = "moved";
      });
      map.addListener('zoomstart', function(){
        status = "moved";
      })
    }
  }
  get map(): google.maps.Map {
    return this._map
  }

  onClick(){
    if(navigator.geolocation && this.status === 'off' ) {
        this.status = 'on';
        let position = this.position;
        this.watch = navigator.geolocation.watchPosition(function(my_position) {
            position = my_position;
            let latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            this.control.marker.setMap(this._map);
            this.control.marker.setCenter(latlng);
            this.control.marker.setRadius(position.coords.accuracy); 
            if (this.options.pan && status !== 'moved') this.map.setCenter(latlng);
            if (this.options.zoom && status !== 'moved') this.map.setZoom( this.options.zoomTo ? this.options.zoomTo : 17)
        }, function(e) { console.log(e.message)},this.options.locationOptions);
    } else if (status == 'on' ) {
        status = 'off';
        navigator.geolocation.clearWatch(this.watch);
        this.control.marker.setMap(null);

    } else if (status == 'moved') {
        status = 'on';
        let latlng = new google.maps.LatLng(this.position.coords.latitude, this.position.coords.longitude);
        this.map.setCenter(latlng);
    }
  }
}
