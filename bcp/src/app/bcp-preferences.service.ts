import { Injectable } from '@angular/core';

export enum CookieStatus {
  ALL,
  NOT_SOCIAL,
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
    if (this._data) return this._data;
    let storedData = localStorage.getItem('prefs')
    if ( storedData ) {
      this._data =  JSON.parse( storedData )
      return this._data;
    }
    return null;
  }

  set data(value: PreferenceData) {
    this._data = value;
    localStorage.setItem('prefs', JSON.stringify(value))
  }
  
  constructor() { }
}
