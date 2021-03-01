import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {environment} from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BcpApiService {

  FETCH_USER = `${environment.apiUrl}/fetch_user`;
  FETCH_MAP = `${environment.apiUrl}/fetch_map`;
  GET_LOCATION = `${environment.apiUrl}/get_location`;
  ADDPHOTO = `${environment.apiUrl}/add_photo`;
  ADDRECORD = `${environment.apiUrl}/add_record`;
  SETRECORD = `${environment.apiUrl}/set_record`;

  constructor( private http: HttpClient) { }

  public apiPost(token: string, url:string, body: {} = {}): Observable<object> {
    return this.http.post(
      url, body,{
        headers: {
        'Authorization': `Bearer ${ token ? token : "null"}`
        },
        responseType: 'json'
  })};

}
