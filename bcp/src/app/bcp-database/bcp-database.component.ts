///<reference types='googlemaps' />
///<reference path='../googlemap-locate/google-locate-control.ts' />
import { Component, ViewChild} from '@angular/core';
import {GoogleMap} from '@angular/google-maps';
import { BcpFilterValuesService, Material, GunCategory, RecordStatus, RecordQuality, Order } from '../bcp-filter-values.service';
import { BcpMapDataService } from '../bcp-map-data.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {LocateControlOptions} from '../googlemap-locate/google-locate-control'

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
  locateOptions: LocateControlOptions= {
    position: google.maps.ControlPosition.LEFT_BOTTOM,
    pan: true,
    zoom: true,
    zoomTo: 17
  }
  map: google.maps.Map;
  @ViewChild(GoogleMap, {static: false}) my_map: GoogleMap;

  cluster: boolean= false;
  here: boolean=false;
  hereText:string="All";
  ownText:string="Everyone";
  clusterText:string="Ungrouped";

  constructor(public FILTER_TEXT: BcpFilterValuesService, public data: BcpMapDataService) { }


  loaded($event) {
    if (!this.map) {
      this.map = this.my_map._googleMap;
    }
  }

  setCategory (cat: GunCategory) {
    this.data.gunCategory = cat;
    this.data.setFilter();
  }

  setMaterial (mat: Material) {
    this.data.material = mat;
    this.data.setFilter();
  }

  setQuality (qual: RecordQuality) {
    this.data.recordQuality = qual;
    this.data.setFilter();
  }

  setOrder (order: Order) {
    this.data.order = order;
  }

  setCluster ($event: MatSlideToggleChange) {
    this.cluster = $event.checked;
    if ($event.checked) this.clusterText="Grouped"; else this.clusterText="Ungrouped";
  }

  setOwn ($event: MatSlideToggleChange) {
    this.data.ownRecords = $event.checked;
    if ($event.checked) this.ownText="Mine"; else this.ownText="Everyone";
  }

  setHere($event: MatSlideToggleChange) {
    this.here = $event.checked;
    if ($event.checked) this.hereText="Here"; else this.hereText="All";
  }

}
