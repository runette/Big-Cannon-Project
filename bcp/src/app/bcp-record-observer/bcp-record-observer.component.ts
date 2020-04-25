///<reference types='googlemaps' />
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { DataItem } from '../bcp-map-data.service';
import {BcpFilterValuesService} from '../bcp-filter-values.service';
import {BcpUserService, BcpUser, BcpUserStanding} from '../bcp-user.service';
import {GoogleMap} from '@angular/google-maps';

@Component({
  selector: 'bcp-record-observer',
  templateUrl: './bcp-record-observer.component.html',
  styleUrls: ['./bcp-record-observer.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class BcpRecordObserverComponent implements OnInit {

  @Input()
  gun: DataItem;

  map: google.maps.Map;
  @ViewChild(GoogleMap, {static: false}) my_map: GoogleMap;

  locationView: string = "latLng";
  marker: google.maps.Marker

  options = {
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: true,
    fullscreenControl: true,
    center:{lat:0, lng:0}
}

  constructor(public DATA_VALUES: BcpFilterValuesService, public user: BcpUserService ) { }

  ngOnInit(): void {
  }
  
  loaded($event) {
    if (!this.map) {
      this.map = this.my_map._googleMap;
      this.map.setCenter(this.gun.location);
      let options: google.maps.ReadonlyMarkerOptions = {
        draggable: true,
      }
      let icon: google.maps.Icon = {'url':''};
      if (this.gun.quality == this.DATA_VALUES.RECORD_QUALITIES[1]) icon.url = '../assets/cannon_bronze.png';
      else if (this.gun.quality == this.DATA_VALUES.RECORD_QUALITIES[2]) icon.url = '../assets/cannon_silver.png';
      else if (this.gun.quality == this.DATA_VALUES.RECORD_QUALITIES[3]) icon.url = '../assets/cannon_gold.png';
      this.marker=new google.maps.Marker(options);
      this.marker.setPosition(this.gun.location);
      this.marker.setIcon(icon);
      this.marker.setMap(this.map);
    }
  }

  locationViewChange($event) {
    this.locationView = $event.value
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition, this.showError);
    } else {
          alert("Geolocation is not supported by this browser.");
    }
  }

  private showPosition(position: Position) {
    this.gun.location = new google.maps.LatLng(position.coords.latitude,position.coords.longitude );
    this.resetMap;
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

  resetMap(): void {
    this.map.setCenter(this.gun.location);
    this.marker.setPosition(this.gun.location);
  }
}
