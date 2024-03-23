import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { BcpFilterValuesService } from '../bcp-filter-values.service';
import { GoogleMap } from '@angular/google-maps';
import { DataItem } from '../bcp-map-data.service';

@Component({
  selector: 'app-bcp-gmap',
  templateUrl: './bcp-gmap.component.html',
  styleUrls: ['./bcp-gmap.component.scss']
})
export class BcpGmapComponent implements OnInit {


  map: google.maps.Map;
  @ViewChild(GoogleMap, {static: false}) my_map: GoogleMap;

  marker: google.maps.LatLngLiteral;
  markerOptions: google.maps.MarkerOptions = {
    draggable: true,
  };
  markerIcon: google.maps.Icon = {'url':'../assets/cannon_bronze.png'};
  locationWaiting: boolean = false;

  private _loc: google.maps.LatLngLiteral
  private _viewport: google.maps.LatLngBoundsLiteral;
  private _quality: string;
  
  @Input()
  set location(loc: google.maps.LatLngLiteral){
    this._loc = loc
    this.displayLoc.lat = loc.lat.toLocaleString();
    this.displayLoc.lng = loc.lng.toLocaleString();
  }

  get location() :google.maps.LatLngLiteral { return this._loc}

  displayLoc: BcpLatLng = new BcpLatLng();

  @Input()
  options: google.maps.MapOptions;

  @Input()
  set viewport(vp: google.maps.LatLngBoundsLiteral){
    this._viewport = vp;
    if (this.map && vp) this.makeMap();
  }

  get viewport() {
    return this._viewport;
  }

  @Input()
  set gun(gun: DataItem) {
    this._quality = gun.quality;
    if (this.map) this.makeMap();
  }

  @Output()
  newLocation$: EventEmitter<google.maps.LatLngLiteral> = new EventEmitter<google.maps.LatLngLiteral>();

  @Output()
  newBounds$: EventEmitter<google.maps.LatLngBounds> = new EventEmitter<google.maps.LatLngBounds>();

  constructor(public DATA_VALUES: BcpFilterValuesService) {
    this._quality = this.DATA_VALUES.RECORD_QUALITIES[1];
   }

  ngOnInit(): void {
  }

  loaded(_: any) {
    if (!this.map) {
      this.map = this.my_map.googleMap;
      this.makeMap();
    }
  }

  makeMap(): void {
    google.maps.importLibrary('maps').then( (_) => {
      if (this.viewport) {
        let vp = new google.maps.LatLngBounds(this.viewport);
        if (!vp.contains(this.location)) {
          vp.extend(this.location);
        }
        this.map.fitBounds(vp, 10)
        this._viewport = vp.toJSON();
      } else {
        this.map.setCenter(this.location);
        this.map.setZoom(1);
      }
      if (this._quality == this.DATA_VALUES.RECORD_QUALITIES[1]) this.markerIcon.url = '../assets/cannon_bronze.png';
      else if (this._quality == this.DATA_VALUES.RECORD_QUALITIES[2]) this.markerIcon.url = '../assets/cannon_silver.png';
      else if (this._quality == this.DATA_VALUES.RECORD_QUALITIES[3]) this.markerIcon.url = '../assets/cannon_gold.png';
      this.marker = this.location;
    })
  }

  markerDragged($event: { latLng: google.maps.LatLng; }){
    this.location = $event.latLng.toJSON();
    this.newLocation$.next(this.location);
  }

  getLocation() {
    if (navigator.geolocation) {
      this.locationWaiting = true;
      navigator.geolocation.getCurrentPosition(position => {
        this.showPosition(position), this.showError;
        this.locationWaiting = false
      });
      this.map.setZoom(17);
    } else {
          alert("Geolocation is not supported by this browser.");
    }
  }

  private showPosition(position: GeolocationPosition) {
    google.maps.importLibrary('maps').then( (_) => {
      this.location = new google.maps.LatLng(position.coords.latitude,position.coords.longitude ).toJSON();
      this.map.setCenter(this.location);
      this.marker = this.location;
      this.newLocation$.next(this.location);
    })
  }

  private showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
          alert( "User denied the request for Geolocation.");
          break;
      case error.POSITION_UNAVAILABLE:
          alert( "Location information is unavailable.");
          break;
      case error.TIMEOUT:
          alert("The request to get user location timed out.");
          break;
      case error.UNKNOWN_ERROR:
          alert("An unknown error occurred.");
          break;
    }
  }

  set() {
    google.maps.importLibrary('maps').then( (_) => {
      this.location = new google.maps.LatLng(
        parseFloat(this.displayLoc.lat), 
        parseFloat(this.displayLoc.lng)
      ).toJSON();
      this.map.setCenter(this.location);
      this.marker = this.location;
    })
  }
}

export class BcpLatLng{
  lat: string;
  lng: string;

  constructor(lat?:string, lng?:string) {
    this.lat = lat || "0";
    this.lng = lng || "0";
  }
}