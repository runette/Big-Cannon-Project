import { Injectable } from '@angular/core';
import {  Material, GunCategory, RecordStatus, RecordQuality, Order } from './bcp-filter-values.service';
import {BcpUserService} from './bcp-user.service'
import { AngularFireAuth } from '@angular/fire/auth';
import {BcpApiService} from './bcp-api.service';


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

  private data : MapData;

  constructor(private user: BcpUserService, private auth: AngularFireAuth, private api: BcpApiService) { 

    auth.auth.onAuthStateChanged( user => {
      if (user) {
        this.getMapData()
      }
    });

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
              (!this.ownRecords || item.user_id == this.user.user.fireUserData.uid) 
    })
    this.filteredData.sort( (a,b) => {
      if (this.order === 'Order') return a.gunid - b.gunid;
      if (this.order === "Date Ascending") return (a.date.getMilliseconds() - b.date.getMilliseconds())/10000;
      if (this.order === "Date Descending") return (b.date.getMilliseconds() - a.date.getMilliseconds())/10000;
    })
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
      mapData[i] = {};
      if (data[i].hasOwnProperty('lat')) mapData[i].location = new google.maps.LatLng(data[i].lat, data[i].lng);
      if (data[i].hasOwnProperty('date')) mapData[i].date = new Date(data[i].date);
      let keys = ['gunid', 'material','quality', 'description', 'owner', 'site', 'displayName', 'context', 'collection', 'collName', 'collRef', 'images', 'markings', 'markDetails', 'interpretations', 'interDetails', 'country', 'geocode', 'userId', 'status', 'measurements', 'mouldingCode', 'muzzleCode', 'casCode', 'buttonCode', 'category', 'thumbnail' ];
      let items = ['gunid', 'type','quality', 'description', 'owner', 'site', 'display_name', 'context', 'collection', 'coll_name', 'coll-ref', 'images', 'markings', 'mark_details', 'interpretations', 'inter_details', 'country', 'geocode', 'user_id', 'status', 'measurements', 'moulding_code', 'muzzle_code', 'cas_code', 'button_code', 'category' , 'thumbnail'];
      
      for (let j = 0; j < items.length; j++) if (data[i].hasOwnProperty(items[j])) mapData[i][keys[j]] = data[i][items[j]]
    }
    return mapData
  }

}

export interface DataItem {
  gunid?: number;
  images?: {[key:string]:string}[];
  owner?: string;
  location?: google.maps.LatLng;
  material?: Material;
  category?: GunCategory;
  description?:string;
  date?: Date;
  site?: string;
  displayName?: string;
  context?: string;
  collection?: boolean;
  collName?: string;
  collRef?: string;
  markings?: boolean;
  markDetails?: string;
  interpretations?: boolean;
  interDetails?: string;
  country?: string;
  geocode?: Geocode;
  user_id?: string;
  status?: RecordStatus;
  measurements?: Measurements;
  mouldingCode?: string;
  muzzleCode?: string;
  casCode?: string;
  buttonCode?: string;
  thumbnail?:string;
  quality?: RecordQuality;
}

export type MapData = DataItem[];

export interface Measurements {
  scale: boolean;
  length?: number;
  baseRing?: number;
  muzzle?: number;
  bore?: number;
  trunnionPosition?: number;
  trunnionWidth?: number;
  trunnionDiameter?: number;
  trunnionOffset?: number;
}

export interface Geocode{
  places: [{[key:string]:string}];
  geolocation: [{[key:string]:string}];
  default?: string;
  country?: string;
}
