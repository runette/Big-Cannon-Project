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
  FETCH_SITES = `${environment.apiUrl}/fetch_sites`;
  GET_LOCATION = `${environment.apiUrl}/get_location`;
  ADDPHOTO = `${environment.apiUrl}/add_photo`;
  ADDRECORD = `${environment.apiUrl}/add_record`;
  SETRECORD = `${environment.apiUrl}/set_record`;
  ADDSITE = `${environment.apiUrl}/add_site`;

  constructor( private http: HttpClient) { }

  public apiPost(token: string, url:string, body: {} = {}, observe: "body" = "body"): Observable<object> {
    return this.http.post(
      url, body,{
        headers: {
        'Authorization': `Bearer ${ token ? token : "null"}`
        },
        observe: observe,
        responseType: 'json'
  })};

}
