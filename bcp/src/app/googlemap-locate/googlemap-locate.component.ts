///<reference types='google.maps' />
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

  locateStatus: LocateControlStatus = 'off';

  private watch: number;
  private control: LocateControl;
  private position: GeolocationPosition;

  constructor() { }

  ngOnInit(): void {
  }

  @Input() set map(map: google.maps.Map){
    if (map) {
      this._map = map;
      let locateStatus= this.locateStatus
      this.control = new LocateControl(map, this.options, this.div.nativeElement );
      map.addListener('dragstart', function(){
        locateStatus = "moved";
      });
      map.addListener('zoomstart', function(){
        locateStatus = "moved";
      })
    }
  }
  get map(): google.maps.Map {
    return this._map
  }

  onClick(){
    if(navigator.geolocation && this.locateStatus === 'off' ) {
        let marker = this.control.marker;
        let options = this.options;
        let map = this.map;
        this.locateStatus = 'on';
        let locateStatus = this.locateStatus  
        let position = this.position;
        this.watch = navigator.geolocation.watchPosition(my_position => {
            position = my_position;
            let latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            marker.setMap(map);
            marker.setCenter(latlng);
            marker.setRadius(position.coords.accuracy);
            if (options.pan && this.locateStatus !== 'moved') map.setCenter(latlng);
            if (options.zoom && this.locateStatus !== 'moved') map.setZoom( this.options.zoomTo ? this.options.zoomTo : 17)
        }, function(e) { console.log(e.message)},options.locationOptions);
    } else if (this.locateStatus == 'on' ) {
        this.locateStatus = 'off';
        navigator.geolocation.clearWatch(this.watch);
        this.control.marker.setMap(null);

    } else if (this.locateStatus == 'moved') {
        this.locateStatus = 'on';
        let latlng = new google.maps.LatLng(this.position.coords.latitude, this.position.coords.longitude);
        this.map.setCenter(latlng);
    }
  }
}
