import { Injectable } from '@angular/core';
import { Material, GunCategory, RecordStatus, RecordQuality, Order } from './bcp-filter-values.service';
import { BcpUserService } from './bcp-user.service'
import { AngularFireAuth } from '@angular/fire/auth';
import { BcpApiService } from './bcp-api.service';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BcpMapDataService {

  private _material: Material = "All";
  private _gunCategory: GunCategory = "All";
  private _recordQuality : RecordQuality = "All";
  private _recordStatus : RecordStatus = "All";
  private _order : Order = "Order";
  private _ownRecords : boolean = false;
  private _boundingBox: google.maps.LatLngBounds;

  filteredData: MapData;
  $newData: Subject<boolean>;

  private data : MapData;

  constructor(private user: BcpUserService, private auth: AngularFireAuth, private api: BcpApiService) { 
    this.getMapData()
    this.$newData = new Subject<boolean>();
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
    this.setFilter();
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
    this.setFilter();
  }

  get boundingBox(): google.maps.LatLngBounds {
    return this._boundingBox;
  }


  public setFilter():void {
    this.filteredData=this.data.filter(item => {
      return  (this.gunCategory === 'All' || item.category == this.gunCategory) && 
              (this.material === 'All' || item.material == this.material) && 
              (this.recordQuality === 'All' || item.quality == this.recordQuality) &&
              (this.recordStatus === 'All'|| item.status == this.recordStatus) &&
              (!this.ownRecords || item.userId == this.user.user.getValue().fireUserData.uid) 
    })
    this.filteredData.sort( (a,b) => {
      if (this.order === 'Order') return b.gunid - a.gunid;
      if (this.order === "Latest First") return b.gunid - a.gunid;
      if (this.order === "Oldest First") return a.gunid - b.gunid;
    })
    this.$newData.next(true);
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

  
  public getMapData(): void{
    this.auth.idToken.subscribe(token => {
      this.api.apiPost(token, this.api.FETCH_MAP ).subscribe(response => {
          this.data = this.loadMapData(response['entries'] as [{[key:string]: any}]);
          this.setFilter();
      },
      error => {})
    },
    error => {})
  }



  private loadMapData(data: [{[key:string]:any}]) : MapData {
    let mapData : MapData = [];
    for ( let i = 0; i < data.length; i++) {
      mapData[i] = this.loadDataitem(data[i]);
    }
    return mapData
  }

  loadDataitem(data: any): DataItem {
    let dataItem: DataItem = {};
    if (data.hasOwnProperty('lat'))
      dataItem.location = new google.maps.LatLng(data.lat, data.lng);
    if (data.hasOwnProperty('date'))
      dataItem.date = new Date(data.date);
    let keys = ['gunid', 'material','quality', 'description', 'owner', 'site', 'display_name', 'context', 'collection', 'coll_name', 'coll_ref', 'images', 'markings', 'mark_details', 'interpretation', 'inter_details', 'country', 'geocode', 'userId', 'status', 'measurements', 'moulding_code', 'muzzle_code', 'cas_code', 'button_code', 'category', 'thumbnail' ];
    let items = ['gunid', 'type','quality', 'description', 'owner', 'site', 'display_name', 'context', 'collection', 'coll_name', 'coll_ref', 'images', 'markings', 'mark_details', 'interpretation', 'inter_details', 'country', 'geocode', 'user_id', 'status', 'measurements', 'moulding_code', 'muzzle_code', 'cas_code', 'button_code', 'category' , 'thumbnail'];
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
  site?: string;
  display_name?: string;
  context?: string;
  collection?: boolean;
  coll_name?: string;
  coll_ref?: string;
  markings?: boolean;
  mark_details?: string;
  interpretation?: boolean;
  inter_details?: string;
  country?: string;
  geocode?: Geocode;
  userId?: string;
  status?: RecordStatus;
  measurements?: Measurements;
  moulding_code?: string[];
  muzzle_code?: string;
  cas_code?: string;
  button_code?: string;
  thumbnail?:string;
  quality?: RecordQuality;
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

export interface Geocode{
  places: [{[key:string]:string}];
  geolocation: [{[key:string]:string}];
  default?: string;
  country?: string;
}
