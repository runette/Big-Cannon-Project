import { Injectable } from '@angular/core';
import {  Material, GunCategory, RecordStatus, RecordQuality, Order } from './bcp-filter-values.service';
import {BcpUserService} from './bcp-user.service'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { database } from 'firebase';


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

  constructor(private user: BcpUserService, private auth: AngularFireAuth, private http: HttpClient) { 

    auth.auth.onAuthStateChanged( user => {
      if (user) {
        this.getMapData().subscribe( response => {
          this.data = this.loadMapData(response['entries'] as [{[key:string]: any}]);
          this.setFilter();
        })
      }
    });

    /* this.filteredData= [{
      gunid: 10102,
      site: "Test Gun",
      location: new google.maps.LatLng(52.0,0.0),
      category: "Breech Loading",
      material: "Cast Iron",
      images:[{
        original: "https://www.googleapis.com/download/storage/v1/b/ultima-ratio-221014.appspot.com/o/prod%2F24%2FIMG_20190313_144734.jpg%2Foriginal?generation=1552481422926554&alt=media",
        s200: "https://www.googleapis.com/download/storage/v1/b/ultima-ratio-221014.appspot.com/o/prod%2F24%2FIMG_20190313_144734.jpg%2Foriginal?generation=1552481422926554&alt=media",
        s32: "https://www.googleapis.com/download/storage/v1/b/ultima-ratio-221014.appspot.com/o/prod%2F24%2FIMG_20190313_144734.jpg%2Foriginal?generation=1552481422926554&alt=media"
      },
      {
        original: "https://www.googleapis.com/download/storage/v1/b/ultima-ratio-221014.appspot.com/o/prod%2F24%2FIMG_20190313_144734.jpg%2Foriginal?generation=1552481422926554&alt=media",
        s200: "https://www.googleapis.com/download/storage/v1/b/ultima-ratio-221014.appspot.com/o/prod%2F24%2FIMG_20190313_144734.jpg%2Foriginal?generation=1552481422926554&alt=media"
      },
    ],
    description:"a short description",
    name: "Paul Harwood",
    date: new Date(),
    displayName: "A Test Gun",
    context: "The Context",
    collection: true,
    collName: "The Collection",
    collRef: "02-33-54",
    markings: true,
    markDetails: "The Markeings",
    interpretations: true,
    interDetails: "The Interpretations",
    country: "UK",
    geocode: {places:[{name:"places name"}], geolocation:[{formatted_address: " geolocation result"}]},
    user_id: "string",
    status: "Auto",
    measurements: {length: 10, scale: false},
    mouldingCode: "ABC",
    muzzleCode: "B",
    casCode: "C",
    buttonCode: "D",
    }];  */

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


  private setFilter():void {
    this.filteredData=this.data;
  }

  private getMapData(): Observable<object>{
    return this.apiPost(this.user.token, 'http://localhost:8000/_ah/api/bcp/fetch_map')
  }

  private apiPost(token: string, url:string, body: {} = {}): Observable<object> {
    return this.http.post(
      url, body,{
        headers: {
        'Authorization': `Bearer ${token}`
        },
        responseType: 'json'
  })};

  private loadMapData(data: [{[key:string]:any}]) : MapData {
    let mapData : MapData = [];
    for ( let i = 0; i < data.length; i++) {
      mapData[i] = {};
      if (data[i].hasOwnProperty('lat')) mapData[i].location = new google.maps.LatLng(data[i].lat, data[i].lng);
      if (data[i].hasOwnProperty('date')) mapData[i].date = new Date(data[i].date);
      let keys = ['gunid', 'material','quality', 'description', 'owner', 'site', 'displayName', 'context', 'collection', 'collName', 'collRef', 'images', 'markings', 'markDetails', 'interpretations', 'interDetails', 'country', 'geocode', 'userId', 'status', 'measurements', 'mouldingCode', 'muzzleCode', 'casCode', 'buttonCode', 'category' ];
      let items = ['gunid', 'type','quality', 'description', 'owner', 'site', 'display_name', 'context', 'collection', 'coll_name', 'coll-ref', 'images', 'markings', 'mark_details', 'interpretations', 'inter_details', 'country', 'geocode', 'user_id', 'status', 'measurements', 'moulding_code', 'muzzle_code', 'cas_code', 'button_code', 'category' ];
      
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
  thumbnail?:string
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
