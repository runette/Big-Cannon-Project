import { Injectable } from '@angular/core';

export enum CookieStatus {
  ALL,
  NONE,
}

export interface PreferenceData {
  cookie_status: CookieStatus,
}

@Injectable({
  providedIn: 'root'
})
export class BcpPreferencesService {

  private _data: PreferenceData;

  get data(): PreferenceData {
    if (this.data) return this._data;
    let storedData = localStorage.getItem('prefs')
    if ( storedData ) {
      return JSON.parse( storedData )
    }
    return null;
  }

  set data(value: PreferenceData) {
    this._data = value;
    localStorage.setItem('prefs', JSON.stringify(value))
  }
  
  constructor() { }
}
