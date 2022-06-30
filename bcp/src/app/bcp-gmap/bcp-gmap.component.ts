import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { BcpFilterValuesService } from '../bcp-filter-values.service';
import { GoogleMap } from '@angular/google-maps';
import { DataItem, Marker } from '../bcp-map-data.service';



@Component({
  selector: 'app-bcp-gmap',
  templateUrl: './bcp-gmap.component.html',
  styleUrls: ['./bcp-gmap.component.scss']
})
export class BcpGmapComponent implements OnInit {


  private map: google.maps.Map;
  @ViewChild(GoogleMap, {static: false}) my_map: GoogleMap;

  private marker: Marker

  private _loc: google.maps.LatLng
  
  @Input()
  set location(loc: google.maps.LatLng){
    this._loc = loc
    this.displayLoc.lat = loc.lat().toLocaleString();
    this.displayLoc.lng = loc.lng().toLocaleString();
  }

  get location() :google.maps.LatLng { return this._loc}

  displayLoc: LatLng = new LatLng();

  @Input()
  options: google.maps.MapOptions;


  _viewport: google.maps.LatLngBounds;

  @Input()
  set viewport(vp: google.maps.LatLngBounds){
    this._viewport = vp;
    if (this.map && vp) this.makeMap();
  }

  get viewport() {
    return this._viewport;
  }

  private quality: string;

  @Input()
  set gun(gun: DataItem) {
    this.quality = gun.quality;
    if (this.map) this.makeMap();
  }


  @Output()
  newLocation$: EventEmitter<google.maps.LatLng> = new EventEmitter<google.maps.LatLng>();

  @Output()
  newBounds$: EventEmitter<google.maps.LatLngBounds> = new EventEmitter<google.maps.LatLngBounds>();

  constructor(public DATA_VALUES: BcpFilterValuesService) {
    this.quality = this.DATA_VALUES.RECORD_QUALITIES[1];
   }

  ngOnInit(): void {
  }

  loaded($event) {
    if (!this.map) {
      this.map = this.my_map.googleMap;
      this.makeMap();
    }
  }

  makeMap(): void {
    if (this.viewport) {
      if (!this.viewport.contains(this.location)) {
        this.viewport.extend(this.location);
      }
      this.map.fitBounds(this.viewport, 0)
    } else {
      this.map.setCenter(this.location);
      this.map.setZoom(1);
    }
    let options: google.maps.MarkerOptions = {
      draggable: true,
    }
    if (! this.marker) {
      let icon: google.maps.Icon = {'url':''};
      if (this.quality == this.DATA_VALUES.RECORD_QUALITIES[1]) icon.url = '../assets/cannon_bronze.png';
      else if (this.quality == this.DATA_VALUES.RECORD_QUALITIES[2]) icon.url = '../assets/cannon_silver.png';
      else if (this.quality == this.DATA_VALUES.RECORD_QUALITIES[3]) icon.url = '../assets/cannon_gold.png';
      this.marker=new Marker(options);
      this.marker.setPosition(this.location);
      this.marker.setIcon(icon);
      this.marker.setMap(this.map);
      this.marker.addListener("dragend", event => this.markerDragged(event));
    }

  }

  markerDragged(event){
    this.location = event.latLng;
    this.newLocation$.next(this.location);
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => this.showPosition(position), this.showError);
      this.map.setZoom(17);
    } else {
          alert("Geolocation is not supported by this browser.");
    }
  }

  private showPosition(position: GeolocationPosition) {
    this.location = new google.maps.LatLng(position.coords.latitude,position.coords.longitude );
    this.map.setCenter(this.location);
    this.marker.setPosition(this.location);
    this.newLocation$.next(this.location);
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
    this.location = new google.maps.LatLng(parseFloat(this.displayLoc.lat), parseFloat(this.displayLoc.lng));
    this.map.setCenter(this.location);
    this.marker.setPosition(this.location);
    this.newLocation$.next(this.location);
  }
}

export class LatLng{
  lat: string;
  lng: string;

  constructor(lat?:string, lng?:string) {
    this.lat = lat || "0";
    this.lng = lng || "0";
  }
}