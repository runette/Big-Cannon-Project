import { Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BcpSiteDataService, Site, MapSites } from '../bcp-site-data.service';
import { BcpMapDataService, DataItem } from '../bcp-map-data.service';
import { BcpUserService } from '../bcp-user.service';
import { BcpApiService } from '../bcp-api.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BcpFilterValuesService } from '../bcp-filter-values.service';

@Component({
  selector: 'app-bcp-site-detail',
  templateUrl: './bcp-site-detail.component.html',
  styleUrls: ['./bcp-site-detail.component.scss']
})
export class BcpSiteDetailComponent implements OnInit, OnDestroy {

  public site: Site;
  public edit: boolean = false;
  private pmap: ParamMap;
  private subscriptions: Subscription[] = [];
  private index: number = 0;
  private map: google.maps.Map;
  private site_id: number;

  fabIcon: string = "add";
  fabTooltip: string = "Add a new Gun to this Site"
  guns: DataItem[] = [];
  markerPositions: google.maps.LatLng[] = [];

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
  };

  icon: google.maps.Icon = {'url':''};

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

  constructor(public sites: BcpSiteDataService,
              public data: BcpMapDataService,
              private router: Router,
              private request: ActivatedRoute,
              public user: BcpUserService,
              private api: BcpApiService,
              public DATA_VALUES: BcpFilterValuesService,
              private changeDet: ChangeDetectorRef,
            ) 
    {

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.subscriptions.push( this.request.queryParamMap.subscribe(pmap => {
      this.pmap = pmap;
      this.site_id = parseInt(pmap.get("site_id"))
      this.updateSite();
    }))
    this.subscriptions.push( this.sites.$newData.subscribe( () => {
      this.updateSite();
    }))
  }

  updateSite() : void {
    this.changeDet.reattach();
    if (this.site_id){
      this.site = this.sites.fetch(this.site_id);
      this.index = this.sites.filteredSites?.findIndex(element => element.id ===  this.site_id);
    }
    this.guns = this.data.data.filter( item => this.site.guns.includes( item.gunid ))
  }

  loaded(map: google.maps.Map): void {
    if (map) this.map = map;
    this.map.fitBounds(this.site.geocode.geometry.viewport,0);
    
    for (let gun of this.guns) {
      if (gun.quality == this.DATA_VALUES.RECORD_QUALITIES[1]) this.icon.url = '../assets/cannon_bronze.png';
      else if (gun.quality == this.DATA_VALUES.RECORD_QUALITIES[2]) this.icon.url = '../assets/cannon_silver.png';
      else if (gun.quality == this.DATA_VALUES.RECORD_QUALITIES[3]) this.icon.url = '../assets/cannon_gold.png';
      this.markerPositions.push(gun.location);
    }

  }

  submit(){}

  next(): void {
    let data: MapSites = this.sites.filteredSites;
    this.index++;
    if ( this.index >= data.length) {
        this.index = 0;
        }
    this.site = data[this.index];
    this.guns = this.data.data.filter( item => this.site.guns.includes( item.gunid ))
    this.loaded(null);
    let urlPath = window.location.href.split("=")[0] + "=" + this.site.id;
    window.history.pushState({},"", urlPath);
  }
  last() {
    let data: MapSites = this.sites.filteredSites;
    this.index--;
    if ( this.index < 0) {
        this.index = data.length - 1;
        }
    this.site = data[this.index];
    this.guns = this.data.data.filter( item => this.site.guns.includes( item.gunid ))
    this.loaded(null);
    let urlPath = window.location.href.split("=")[0] + "=" + this.site.id;
    window.history.pushState({},"", urlPath);
  }

  nameChanged(name: string): void {
    this.site.display_name=name;
    this.edit=false;
    if (this.user.current_user) {
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.SETRECORD, this.site ).subscribe({next: response => {
          this.site = response;
        },
        error: e => console.error(e)
      }),
      e => console.error(e)
      )
      this.fabIcon = "add";
    } else {
      this.router.navigate(['/login']);
    }
  }
}
