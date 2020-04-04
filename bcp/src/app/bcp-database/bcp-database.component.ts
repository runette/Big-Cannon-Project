///<reference types='googlemaps' />
///<reference path='../googlemap-locate/google-locate-control.ts' />
import { Component, ViewChild} from '@angular/core';
import {GoogleMap} from '@angular/google-maps';
import { BcpFilterValuesService, Material, GunCategory, RecordStatus, RecordQuality, Order } from '../bcp-filter-values.service';
import { BcpMapDataService } from '../bcp-map-data.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-bcp-database',
  templateUrl: './bcp-database.component.html',
  styleUrls: ['./bcp-database.component.scss']
})
export class BcpDatabaseComponent {
  markerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  options: google.maps.MapOptions = {
    zoom: 7,
    center: {lat: 24, lng: 12},
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    zoomControlOptions:{
        position: google.maps.ControlPosition.LEFT_BOTTOM},
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: true,
    fullscreenControl: false,
  } 
  locateOptions: google.maps.LocateControlOptions= {
    position: google.maps.ControlPosition.LEFT_BOTTOM,
    pan: true,
    zoom: true,
    zoomTo: 17
  }
  map: google.maps.Map;
  @ViewChild(GoogleMap, {static: false}) my_map: GoogleMap;

  cluster: boolean= false;

  constructor(public FILTER_TEXT: BcpFilterValuesService, public data: BcpMapDataService) { }


  loaded($event) {
    if (!this.map) {
      this.map = this.my_map._googleMap;
    }
  }

  setCategory (cat: GunCategory) {
    this.data.gunCategory = cat;
  }

  setMaterial (mat: Material) {
    this.data.material = mat;
  }

  setQuality (qual: RecordQuality) {
    this.data.recordQuality = qual;
  }

  setOrder (order: Order) {
    this.data.order = order;
  }

  setCluster ($event: MatSlideToggleChange) {
    this.cluster = $event.checked;
  }

  setOwn ($event: MatSlideToggleChange) {
    this.data.ownRecords = $event.checked;
  }

}
