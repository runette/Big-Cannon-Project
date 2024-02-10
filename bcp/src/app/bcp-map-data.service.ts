import { Injectable, OnDestroy } from '@angular/core';
import { Material, GunCategory, RecordStatus, RecordQuality, Order } from './bcp-filter-values.service';
import { BcpUserService } from './bcp-user.service';
import { BcpApiService } from './bcp-api.service';
import { Subject, Subscription } from 'rxjs';
import { HttpResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class BcpMapDataService implements OnDestroy{

  private _material: Material = "All";
  private _gunCategory: GunCategory = "All";
  private _recordQuality : RecordQuality = "All";
  private _recordStatus : RecordStatus = "All";
  private _order : Order = "Latest First";
  private _ownRecords : boolean = false;
  private _boundingBox: google.maps.LatLngBounds;
  private _here: boolean = true;

  cluster: boolean= true;
  hereText:string="Here";
  ownText:string="Everyone";
  clusterText:string="Sites";
  nativeBounds: google.maps.LatLngBounds;

  filteredData: MapData;
  geoFilteredData: MapData;
  $newData: Subject<boolean>;
  $clearMarkers: Subject<boolean>;

  data : MapData;
  private transaction: number;
  private subscriptions: Subscription[] = [];

  constructor(
      private user: BcpUserService,
      private api: BcpApiService,
      ) { 
    this.$newData = new Subject<boolean>();
    this.$clearMarkers = new Subject<boolean>();
    this.transaction = 0;
    this.subscriptions.push(this.user.user.subscribe({
      next: () => {
        this.$clearMarkers.next(true);
        this.transaction++;
        this.data = [];
        this.getMapData();
      }
    }))
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  set material(value: Material) {
    this._material = value;
    this.setFilter();
  }
  get material():Material{
    return this._material;
  }

  set gunCategory(value: GunCategory) {
    this._gunCategory = value;
    this.setFilter();
  }
  get gunCategory():GunCategory{
    return this._gunCategory;
  }

  set recordQuality(value: RecordQuality) {
    this._recordQuality = value;
    this.setFilter();
  }
  get recordQuality():RecordQuality{
    return this._recordQuality;
  }

  set recordStatus(value: RecordStatus) {
    this._recordStatus = value;
    this.setFilter();
  }
  get recordStatus():RecordStatus{
    return this._recordStatus;
  }

  set order(value: Order) {
    this._order = value;
    this.gunSort();
  }
  get order():Order{
    return this._order;
  }

  set ownRecords(value: boolean) {
    this._ownRecords = value;
    this.setFilter();
  }
  get ownRecords():boolean{
    return this._ownRecords;
  }

  set boundingBox(bbox: google.maps.LatLngBounds) {
    this._boundingBox = bbox;
    this.geoFilter();
  }

  get boundingBox(): google.maps.LatLngBounds {
    return this._boundingBox;
  }

  set here(value: boolean){
    this._here = value;
    this.geoFilter();
  }

  get here(): boolean {
    return this._here;
  }

  public setFilter():void {
    if (this.data) {
      this.filteredData=this.data.filter(item => {
        return  (this.gunCategory === 'All' || item.category == this.gunCategory) && 
                (this.material === 'All' || item.material == this.material) && 
                (this.recordQuality === 'All' || item.quality == this.recordQuality) &&
                (this.recordStatus === 'All'|| item.status == this.recordStatus) &&
                (!this.ownRecords || item.userId == this.user.user.getValue().fireUserData.uid);
      });
      this.geoFilter();
      this.$newData.next(true);
    }
  }

  public geoFilter():void {
    if (this.filteredData && this.filteredData.length > 0) {
      this.geoFilteredData = this.filteredData.filter(item => {
        return (!this.here || this.boundingBox && this.boundingBox.contains(item.location));
      })
      this.gunSort();
    }
  }

  public gunSort(): void {
    if (this.geoFilteredData) {
      this.geoFilteredData.sort( (a,b) => {
        if (this.order === "Latest First") return b.gunid - a.gunid;
        if (this.order === "Oldest First") return a.gunid - b.gunid;
      })
    }
  }

  public add(indata: any) {
    let record = this.loadDataitem(indata); 
    this.data.push(record);
    this.filteredData.push(record);
    this.$newData.next(true);
  }

  public update(indata: any) {
    let data = this.data;
    let filteredData = this.filteredData;
    let record = this.loadDataitem(indata); 
    data.forEach(function(item, i) {if (item.gunid == record.gunid ) data[i] = record});
    filteredData.forEach(function(item, i) {if (item.gunid == record.gunid ) filteredData[i] = record});
    this.$newData.next(true);
  }

  public getMapData(cursor: string = ""): void{
    if (this.user.current_user) {
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.FETCH_MAP, {"cursor": cursor, "transaction": this.transaction},"response" as "body" ).subscribe({next: response => {
        this.loadMapData( response as HttpResponse<any>);
        this.setFilter();
      },
      error: e => console.error(e)}
      ),
      e => console.error(e))
    } else {
      this.api.apiPost( null, this.api.FETCH_MAP, {"cursor": cursor, "transaction": this.transaction}, "response" as "body" ).subscribe({next: response => {
        this.loadMapData( response as HttpResponse<any>);
        this.setFilter();
      },
      error: e => console.error(e)}
      )
    }
  }

  private loadMapData(response: HttpResponse<any> ) {
    if (response && response.status === 200 && response.body["transaction"] == this.transaction) {
      let cursor: string = response.body["cursor"]
      this.getMapData(cursor);
      for (let item of response.body["entries"]) {
        this.data.push(this.loadDataitem(item));
      }
    }
  }

  loadDataitem(data: any): DataItem {
    let dataItem: DataItem = {};
    if (data.hasOwnProperty('lat'))
      dataItem.location = new google.maps.LatLng(data.lat, data.lng);
    if (data.hasOwnProperty('date'))
      dataItem.date = new Date(data.date);
    let keys = ['gunid', 'material','quality', 'description', 'owner', 'site_id', 'display_name', 'context', 'collection', 'coll_name', 'coll_ref', 'images', 'markings', 'mark_details', 'interpretation', 'inter_details', 'country', 'geocode', 'userId', 'status', 'measurements', 'moulding_code', 'muzzle_code', 'cas_code', 'button_code', 'category', 'thumbnail', "attributions", "web_links", "urls" ];
    let items = ['gunid', 'type',  'quality', 'description', 'owner', 'site_id', 'display_name', 'context', 'collection', 'coll_name', 'coll_ref', 'images', 'markings', 'mark_details', 'interpretation', 'inter_details', 'country', 'geocode', 'user_id', 'status', 'measurements', 'moulding_code', 'muzzle_code', 'cas_code', 'button_code', 'category', 'thumbnail', "attributions", "web_links", "urls" ];
    for (let j = 0; j < items.length; j++)
      if (data.hasOwnProperty(items[j]))
        dataItem[keys[j]] = data[items[j]]
    return dataItem
  }
}

export interface DataItem {
  gunid?: number;
  images?: [{[key:string]:string}];
  owner?: string;
  location?: google.maps.LatLng;
  material?: Material;
  category?: GunCategory;
  description?:string;
  date?: Date;
  site_id?: number;
  display_name?: string;
  context?: string;
  collection?: boolean;
  coll_name?: string;
  coll_ref?: string;
  markings?: boolean;
  mark_details?: string;
  interpretation?: boolean;
  inter_details?: string;
  country_of_origin?: string
  userId?: string;
  status?: RecordStatus;
  measurements?: Measurements;
  moulding_code?: string[];
  muzzle_code?: string;
  cas_code?: string;
  button_code?: string;
  thumbnail?:string;
  quality?: RecordQuality;
  attributions?: string[];
  web_links?:boolean;
  urls?: string[];
}

export type MapData = DataItem[];

export interface Measurements {
  scale: boolean;
  length?: number;
  base_ring?: number;
  muzzle?: number;
  bore?: number;
  trunnion_position?: number;
  trunnion_width?: number;
  trunnion_diameter?: number;
  trunnion_offset?: number;
}