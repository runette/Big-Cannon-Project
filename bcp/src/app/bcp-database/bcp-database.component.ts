///<reference types='google.maps' />
///<reference path='../googlemap-locate/google-locate-control.ts' />
import { Component, ViewChild, OnInit, AfterViewInit, ElementRef} from '@angular/core';
import {GoogleMap, MapInfoWindow, MapMarker} from '@angular/google-maps';
import { BcpFilterValuesService, Material, GunCategory, RecordQuality, Order } from '../bcp-filter-values.service';
import { BcpMapDataService, DataItem } from '../bcp-map-data.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {LocateControlOptions} from '../googlemap-locate/google-locate-control';
import {MarkerClustererOptions, MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';


@Component({
  selector: 'app-bcp-database',
  templateUrl: './bcp-database.component.html',
  styleUrls: ['./bcp-database.component.scss']
})
export class BcpDatabaseComponent implements OnInit, AfterViewInit{
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
    algorithm: new SuperClusterAlgorithm({
      maxZoom: 12,
    }),
    markers: [ new google.maps.Marker(
      {icon:{
        url:'../assets/m'
      }}
    )]
  }
  
  invisMarker: google.maps.MarkerOptions = {visible: false, opacity: 0};

  map: google.maps.Map;
  @ViewChild(GoogleMap, {static: false}) my_map: GoogleMap;
  @ViewChild(MapInfoWindow, {static: false}) mapInfo: MapInfoWindow;
  @ViewChild(MapMarker, {static: false}) mapMarker: MapMarker;
  @ViewChild("bounding_box", {static: false}) boundingBoxElement: ElementRef;
  mc: MarkerClusterer;

  cluster: boolean= false;
  hereText:string="Here";
  ownText:string="Everyone";
  clusterText:string="Ungrouped";
  selectedMarker: DataItem[];

  constructor(public FILTER_TEXT: BcpFilterValuesService, public data: BcpMapDataService, private breakpointObserver: BreakpointObserver) { }

  ngOnInit():void {
    this.data.$newData.subscribe({
      next: () => this.loadMarkers()
    });
    this.data.$clearMarkers.subscribe({
      next: () => this.mc.clearMarkers()
    })
    this.selectedMarker=[];
  }
  ngAfterViewInit() {
    
  }

  loaded($event) {
    if (!this.map) {
      this.clusterOptions.map = this.my_map.googleMap;
      this.mc = new MarkerClusterer(this.clusterOptions );
      this.onBoundsChanged();
      this.loadMarkers();
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
    this.data.here = $event.checked;
    if ($event.checked) this.hereText="Here"; else this.hereText="All";
  }

  onBoundsChanged(): void {
    let proj = this.my_map.getProjection();
    let bounds = this.my_map.getBounds();
    if (this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small])) {
      this.data.boundingBox = bounds;
    } else {
      let ne = bounds.getNorthEast();
      let sw = bounds.getSouthWest();
      let bottomLeft = proj.fromLatLngToPoint(sw);
      let topRight = proj.fromLatLngToPoint(ne);
      let scale = 1 << this.my_map.getZoom();
      this.data.boundingBox = new google.maps.LatLngBounds(
        proj.fromPointToLatLng( new google.maps.Point(
          10/scale + bottomLeft.x,
          (this.boundingBoxElement.nativeElement.offsetHeight + 73 )/scale + topRight.y
        )),
        proj.fromPointToLatLng ( new google.maps.Point( 
          (this.boundingBoxElement.nativeElement.offsetWidth + 10)/ scale + bottomLeft.x,
          73/scale + topRight.y
        ))
      );
    }
  }

  public loadMarkers( ) {
    if (this.mc && this.data.filteredData) {
      let mapInfo = this.mapInfo;
      let mapMarker = this.mapMarker;
      let data = this.data;
      let selectedMarker = this.selectedMarker;
      let markers: google.maps.Marker[] = [];
      // var entry: DataItem;
      for (let entry of this.data.filteredData) {
        if (! entry.marker){
          let options: google.maps.MarkerOptions = {
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
            mapMarker.marker = this;
            mapInfo.open(mapMarker);
          });
          markers.push(marker)
          entry.marker = marker;
        };
      }
      this.mc.addMarkers(markers);
    }
  }
}
