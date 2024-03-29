import { Injectable, OnDestroy } from '@angular/core';
import { BcpUserService } from './bcp-user.service';
import { BcpApiService } from './bcp-api.service';
import { Subject, Subscription } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ValidationError } from 'webpack';

@Injectable({
  providedIn: 'root'
})
export class BcpSiteDataService implements OnDestroy{

  filteredSites: MapSites;
  $newData: Subject<boolean>;
  $clearMarkers: Subject<boolean>;
  data: MapSites

  private _boundingBox: google.maps.LatLngBounds;
  private _here: boolean = true;
  private _namespace: string= "";

  private transaction: number;
  private subscriptions: Subscription[] = [];

  set boundingBox(bbox: google.maps.LatLngBounds) {
    this._boundingBox = bbox;
    this.setFilter();
  }

  get boundingBox(): google.maps.LatLngBounds {
    return this._boundingBox;
  }

  set here(value: boolean){
    this._here = value;
    this.setFilter();
  }

  get here(): boolean {
    return this._here;
  }

  constructor(private user: BcpUserService, private api: BcpApiService) { 
    this.$newData = new Subject<boolean>();
    this.transaction = 0;
    this.subscriptions.push(this.user.user.subscribe({
      next: u => {
        let ns = "prod";
        if (u) {
          if (u.test_user) ns="test";
          if (u.train_user) ns="train";
        }
        if (ns != this._namespace) {
          this._namespace = ns;
          this.transaction++;
          this.data = [];
          this.getSiteData();
        }
      }
    }))
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public setFilter():void {
    if (this.data) {
      this.filteredSites=this.data.filter(item => {
        return  (
          !this.here || this.boundingBox && 
          this.boundingBox.intersects(new Geo(item.geocode.geometry).viewport)
        );
      });
      this.siteSort();
      this.$newData.next(true);
    }
  }

  public siteSort(): void {
    if (this.filteredSites) {
      this.filteredSites.sort( (a,b) => {
        return a.display_name.localeCompare(b.display_name);
      })
    }
  }

  public getSiteData(cursor: string = "", page_size: number = 10): void{
    if (this.user.current_user) {
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.FETCH_SITES, {"cursor": cursor, "transaction": this.transaction, page_size: page_size},"response" as "body" ).subscribe({next: response => {
        this.loadSiteData( response as HttpResponse<any>);
        this.setFilter();
      },
      error: e => console.error(e)}
      ),
      e => console.error(e))
    } else {
      this.api.apiPost( null, this.api.FETCH_SITES, {"cursor": cursor, "transaction": this.transaction, page_size: page_size}, "response" as "body" ).subscribe({next: response => {
        this.loadSiteData( response as HttpResponse<any>);
        this.setFilter();
      },
      error: e => console.error(e)}
      )
    }
  }

  private loadSiteData(response: HttpResponse<any> ) {
    if (response && response.status === 200 && response.body["transaction"] == this.transaction) {
      let cursor: string = response.body["cursor"]
      this.getSiteData(cursor, 200);
      for (let item of response.body["sites"]) {
        this.data.push(this.loadDataitem(item));
      }
    }
  }

  loadDataitem(data: any): Site {
    return new Site(data);
  }

  fetch(id: number): Site {
    return this.data.find( site => site.id === id)
  }

  add(indata: any): void {
    let site = new Site(indata);
    const index = this.data.indexOf(this.data.find( item => item.id == site.id))
    this.data.splice(index, 1)
    this.data.push(site);
    this.setFilter();
  }

  remove(site: Site): void {
    const index = this.data.indexOf(site);
    this.data.splice(index, 1)
    this.setFilter();
  }
}

export class Site{
  id?: number;
  display_name?: string;
  geocode?: Geocode;
  country?: string;
  attribution?: string;
  guns?: number[];
  type?: string;

  constructor(site: object) {
    for (let o in site) {
      if (o != "geocode") {
        this[o] = site[o];
      } else {
        this.geocode = new Geocode(site["geocode"]);
      }
    }
  }

  static fromGeocode(geocode: any): Site{
    let name;
    if ("formatted_address" in geocode) {
      name = geocode.formatted_address;
    } else {
      name= geocode.name;
    }
    return new Site({
      display_name: name,
      geocode: geocode,
      guns: []
    })
  }
}

export type MapSites = Site[];

export class Geocode{
  business_status?: string;
  formatted_address?: string;
  geometry?: Geo;
  icon?: string;
  name?: string;
  photos?: string[];
  place_id?: string;
  plus_code?: string;
  types?: string[];
  website?: string;
  url?:string;

  constructor(geocode: object) {
    for (let o in geocode) {
      if (o != "geometry") {
        this[o] = geocode[o];
      } else {
        this.geometry = new Geo(geocode["geometry"]);
      }
    }
  }
}

export class Geo {
  location: google.maps.LatLngLiteral
  viewport: google.maps.LatLngBoundsLiteral

  constructor(geo: object) {
    this.location = geo['location']
    try {
      let sw: google.maps.LatLngLiteral = geo["viewport"]["southwest"];
      let ne: google.maps.LatLngLiteral = geo["viewport"]["northeast"]
      if ( ne && sw) {
        this.viewport = {
          east: ne.lng,
          west: sw.lng,
          north: ne.lat,
          south: sw.lat
        };
      } else {
        throw new Error();
      }
    } catch {
      this.viewport = geo['viewport'];
    }
  }
}
