///<reference types='googlemaps' />
///<reference path='../googlemap-locate/google-locate-control.ts' />
import { Component, ViewChild, OnInit} from '@angular/core';
import {GoogleMap, MapInfoWindow, MapMarker} from '@angular/google-maps';
import { BcpFilterValuesService, Material, GunCategory, RecordStatus, RecordQuality, Order } from '../bcp-filter-values.service';
import { BcpMapDataService, DataItem } from '../bcp-map-data.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {LocateControlOptions} from '../googlemap-locate/google-locate-control';
import {MarkerClustererOptions} from '@google/markerclustererplus';
import MarkerClusterer from '@google/markerclustererplus';


@Component({
  selector: 'app-bcp-database',
  templateUrl: './bcp-database.component.html',
  styleUrls: ['./bcp-database.component.scss']
})
export class BcpDatabaseComponent implements OnInit{
  options: google.maps.MapOptions = {
    zoom: 2,
    center: {lat: 0, lng: 0},
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
  clusterOptions: MarkerClustererOptions = {
    averageCenter: true,
    maxZoom: 12,
    imagePath: '../assets/m',
  }
  
  invisMarker: google.maps.ReadonlyMarkerOptions = {visible: false, opacity: 0};

  map: google.maps.Map;
  @ViewChild(GoogleMap, {static: false}) my_map: GoogleMap;
  @ViewChild(MapInfoWindow, {static: false}) mapInfo: MapInfoWindow;
  @ViewChild(MapMarker, {static: false}) mapMarker: MapMarker;
  mc: MarkerClusterer;

  cluster: boolean= false;
  here: boolean=false;
  hereText:string="All";
  ownText:string="Everyone";
  clusterText:string="Ungrouped";
  selectedMarker: DataItem[];

  constructor(public FILTER_TEXT: BcpFilterValuesService, public data: BcpMapDataService) { }

  ngOnInit():void {
    this.data.$newData.subscribe({
      next: () => this.loadMarkers()
    });
    this.selectedMarker=[]
    
  }


  loaded($event) {
    if (!this.map) {
      this.map = this.my_map._googleMap;
      this.mc = new MarkerClusterer(this.map, [], this.clusterOptions );
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

  onZoomEnd($event):void{

  }

  public loadMarkers( ) {
    if (this.mc) {
      let mapInfo = this.mapInfo;
      let mapMarker = this.mapMarker;
      let data = this.data;
      let selectedMarker = this.selectedMarker;
      let markers: google.maps.Marker[] = [];
      // var entry: DataItem;
      for (let i=0; i< this.data.filteredData.length; i++) {
        let entry = this.data.filteredData[i];
        let options: google.maps.ReadonlyMarkerOptions = {
          draggable: false,
        }
        let icon: google.maps.Icon = {'url':''};
        if (entry.quality == this.FILTER_TEXT.RECORD_QUALITIES[1]) icon.url = '../assets/cannon_bronze.png';
        else if (entry.quality == this.FILTER_TEXT.RECORD_QUALITIES[2]) icon.url = '../assets/cannon_silver.png';
        else if (entry.quality == this.FILTER_TEXT.RECORD_QUALITIES[3]) icon.url = '../assets/cannon_gold.png';
        let marker=new google.maps.Marker(options);
        marker.setPosition(entry.location);
        marker.setIcon(icon);
        marker.addListener('click', function (e) {
          selectedMarker[0] = data.filteredData.find(item => item.location == this.getPosition())
          mapMarker._marker = this;
          mapInfo.open(mapMarker);
      });
        markers.push(marker)};
      this.mc.clearMarkers();
      this.mc.addMarkers(markers);
    }
  }

}
