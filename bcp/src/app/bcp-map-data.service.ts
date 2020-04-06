import { Injectable } from '@angular/core';
import {  Material, GunCategory, RecordStatus, RecordQuality, Order } from './bcp-filter-values.service';



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

  constructor() { 
    this.data= [{
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

    }];
    this.setFilter();
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
    this.filteredData = this.data
  }

}

export interface DataItem {
  gunid: number;
  images: {[key:string]:string}[];
  name?: string;
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
