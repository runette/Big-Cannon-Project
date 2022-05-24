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


  private map: google.maps.Map;
  @ViewChild(GoogleMap, {static: false}) my_map: GoogleMap;

  private marker: google.maps.Marker

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

  private quality: string;

  @Input()
  set gun(gun: DataItem) {
    this.quality = gun.quality;
    if (this.map) {
      this.marker.setPosition(this.location);
      this.map.setCenter(this.location);
      let icon: google.maps.Icon = {'url':''};
      if (this.quality == this.DATA_VALUES.RECORD_QUALITIES[1]) icon.url = '../assets/cannon_bronze.png';
      else if (this.quality == this.DATA_VALUES.RECORD_QUALITIES[2]) icon.url = '../assets/cannon_silver.png';
      else if (this.quality == this.DATA_VALUES.RECORD_QUALITIES[3]) icon.url = '../assets/cannon_gold.png';
      this.marker.setIcon(icon);
    }
  }


  @Output()
  newLocation$: EventEmitter<google.maps.LatLng> = new EventEmitter<google.maps.LatLng>();

  buttonTitle = "Center"

  constructor(public DATA_VALUES: BcpFilterValuesService) {
    this.quality = this.DATA_VALUES.RECORD_QUALITIES[1];
   }

  ngOnInit(): void {
  }

  loaded($event) {
    if (!this.map) {
      this.map = this.my_map.googleMap;
      this.map.setCenter(this.location);
      let options: google.maps.MarkerOptions = {
        draggable: true,
      }
      let icon: google.maps.Icon = {'url':''};
      if (this.quality == this.DATA_VALUES.RECORD_QUALITIES[1]) icon.url = '../assets/cannon_bronze.png';
      else if (this.quality == this.DATA_VALUES.RECORD_QUALITIES[2]) icon.url = '../assets/cannon_silver.png';
      else if (this.quality == this.DATA_VALUES.RECORD_QUALITIES[3]) icon.url = '../assets/cannon_gold.png';
      this.marker=new google.maps.Marker(options);
      this.marker.setPosition(this.location);
      this.marker.setIcon(icon);
      this.marker.setMap(this.map);
      this.marker.addListener("dragend", event => this.markerDragged(event));
    }
  }

  markerDragged(event){
    this.location = event.latLng;
    this.buttonTitle = "Center";
    this.newLocation$.next(this.location);
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => this.showPosition(position), this.showError);
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
    if (this.buttonTitle == "Center") {
      this.map.setCenter(this.location);
      this.marker.setPosition(this.location);
      return;
    }
    this.location = new google.maps.LatLng(parseFloat(this.displayLoc.lat), parseFloat(this.displayLoc.lng));
    this.map.setCenter(this.location);
    this.marker.setPosition(this.location);
    this.buttonTitle = "Center";
    this.newLocation$.next(this.location);
  }

  dirtyLoc(){
    this.buttonTitle = "Set";
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