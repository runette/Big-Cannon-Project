///<reference types='google.maps' />
///<reference path='../googlemap-locate/google-locate-control.ts' />
import { Component,
         ViewChild,
         OnInit,
         AfterViewInit,
         OnDestroy,
         ElementRef,
         ChangeDetectorRef,
         QueryList,
         ViewChildren,
         NgZone,
        } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { BcpFilterValuesService,
         Material,
         GunCategory,
         RecordQuality,
         Order,
        } from '../bcp-filter-values.service';
import { BcpMapDataService, DataItem } from '../bcp-map-data.service';
import { BcpSiteDataService } from '../bcp-site-data.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LocateControlOptions } from '../googlemap-locate/google-locate-control';
import { SuperClusterAlgorithm, MarkerClustererOptions } from '@googlemaps/markerclusterer';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription, Subject } from 'rxjs';

export interface MarkerData {
  position: google.maps.LatLng;
  icon: google.maps.Icon
}


@Component({
  selector: 'app-bcp-database',
  templateUrl: './bcp-database.component.html',
  styleUrls: ['./bcp-database.component.scss'],
})
export class BcpDatabaseComponent implements OnInit, AfterViewInit, OnDestroy {
  options: google.maps.MapOptions = {
    zoom: 2.5,
    center: {lat: 50, lng: 80},
    mapTypeId: 'roadmap',
    zoomControl: true,
    zoomControlOptions:{
        position: 6.0},
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: true,
    fullscreenControl: false,
  } 
  locateOptions: LocateControlOptions= {
    position: 6.0,
    pan: true,
    zoom: true,
    zoomTo: 17
  }
  clusterOptions: MarkerClustererOptions = {
    algorithm: new SuperClusterAlgorithm({
      maxZoom: 12
    })
  }

  infoOptions = {
    minWidth: 375,
  }

  invisMarker: google.maps.MarkerOptions = {visible: false, opacity: 0};
  subscriptions: Subscription[] = [];

  map: google.maps.Map;
  @ViewChild(MapInfoWindow, {static: false}) mapInfo: MapInfoWindow;
  @ViewChild("bounding_box", {static: false}) boundingBoxElement: ElementRef;

  @ViewChildren(MapMarker) _markers: QueryList<MapMarker>;

  markerPositions: MarkerData[] = [];
  selectedMarker: DataItem;

  apiLoaded = new Subject<void>();

  constructor(public FILTER_TEXT: BcpFilterValuesService, 
              public data: BcpMapDataService, 
              public sites: BcpSiteDataService,
              private breakpointObserver: BreakpointObserver,
              private changeDet: ChangeDetectorRef,
              private zone: NgZone,
              ) { }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions){
      sub.unsubscribe();
    }
  }

  ngOnInit():void {
    this.subscriptions.push(this.data.$newData.subscribe({
      next: () => this.loadMarkers()
    }));
    this.subscriptions.push(this.data.$clearMarkers.subscribe({
      next: () => {
        this.loadMarkers();
      }
    }));
    this.subscriptions.push(this.sites.$newData.subscribe({
      next: () => this.updateSites(),
    }));
    const screenWidth: number = window.innerWidth;
    if (screenWidth < 600) {
      this.options.center = {lat: 30, lng: 20};
      this.options.zoom = 0;
    }
  }
  
  ngAfterViewInit() {
  }

  loaded($event) {
    let map = $event;
    this.apiLoaded.next();
    google.maps.event.addListenerOnce($event, "idle", () =>{
      this.map = map;
      if (this.data.nativeBounds) {
        this.map.fitBounds(this.data.nativeBounds, 0)
      } else {
        this.onBoundsChanged();
      }
      this.loadMarkers();
    })
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
    this.data.cluster = $event.checked;
    if ($event.checked) {
      this.data.clusterText="Sites";
      this.data.ownRecords=false;
      this.data.recordStatus= 'All';
      this.data.recordQuality= 'All';
      this.data.gunCategory='All';
      this.data.material= "All";
    }
    else {
      this.data.clusterText="Guns";
    }
  }

  setOwn ($event: MatSlideToggleChange) {
    this.data.ownRecords = $event.checked;
    if ($event.checked) this.data.ownText="Mine"; else this.data.ownText="Everyone";
  }

  setHere($event: MatSlideToggleChange) {
    this.data.here = $event.checked;
    this.sites.here = $event.checked;
    if ($event.checked) this.data.hereText="Here"; else this.data.hereText="All";
  }

  onBoundsChanged(): void {
    if (this.map){
      let proj = this.map.getProjection();
      let bounds = this.map.getBounds();
      this.data.nativeBounds = bounds;
      let ne = bounds.getNorthEast();
      let sw = bounds.getSouthWest();
      // if zoomed too close - the calculation will fail because the bounds are limited to +-180. +-90
      let oob = Math.abs(ne.lat()) == 90 ||
                Math.abs(ne.lng()) == 180 ||
                Math.abs(sw.lat()) == 90 ||
                Math.abs(sw.lng()) == 180;
      // if out of bounds or on a small screen - the map is the bounding box
      if (oob || this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small])) {
        this.data.boundingBox = bounds;
        this.sites.boundingBox = bounds;
      // otherwise - the dotted line box is the bounding box
      } else {

        let bottomLeft = proj.fromLatLngToPoint(sw);
        let topRight = proj.fromLatLngToPoint(ne);
        let scale = 1 << this.map.getZoom();
        let boundingBox = new google.maps.LatLngBounds(
          proj.fromPointToLatLng( new google.maps.Point(
            10/scale + bottomLeft.x,
            (this.boundingBoxElement.nativeElement.offsetHeight + 73 )/scale + topRight.y
          )),
          proj.fromPointToLatLng ( new google.maps.Point( 
            (this.boundingBoxElement.nativeElement.offsetWidth + 10)/ scale + bottomLeft.x,
            73/scale + topRight.y
          ))
        );
        this.data.boundingBox = boundingBox;
        this.sites.boundingBox = boundingBox;
      }
    }
  }

  public updateSites( ): void {
    this.changeDet.detectChanges();
  }

  public loadMarkers( ): void {
    google.maps.importLibrary('maps').then( (_) => {
      this.zone.run((_) => {
        if ( this.data.filteredData && this.data.filteredData.length > 0) { 
          for (let entry of this.data.filteredData) {
            let icon: google.maps.Icon = {'url':''};
            if (entry.quality == this.FILTER_TEXT.RECORD_QUALITIES[1]) icon.url = '../assets/cannon_bronze.png';
            else if (entry.quality == this.FILTER_TEXT.RECORD_QUALITIES[2]) icon.url = '../assets/cannon_silver.png';
            else if (entry.quality == this.FILTER_TEXT.RECORD_QUALITIES[3]) icon.url = '../assets/cannon_gold.png';
            let md = {position: new google.maps.LatLng(entry.location), icon:icon}
            if ( ! this.markerPositions.find( item => item.position.equals(md.position))) this.markerPositions.push(md)
          }
        }
      });
    });
  }

  public markerClick($event: { latLng: google.maps.LatLng; }) {
    this.selectedMarker = this.data.filteredData.find(item =>  $event.latLng.equals(new google.maps.LatLng(item.location)) )
    let marker = this._markers.find(item => item.getPosition().equals($event.latLng));
    this.mapInfo.open(marker);
  }
}
