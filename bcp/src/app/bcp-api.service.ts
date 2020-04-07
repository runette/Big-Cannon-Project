import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {environment} from '../environments/environment';
import { AngularFireAuth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class BcpApiService {

  FETCH_USER = `${environment.apiUrl}/fetch_user`;
  FETCH_MAP = `${environment.apiUrl}/fetch_map`;

  constructor(private auth: AngularFireAuth, private http: HttpClient) { }

  public getToken():Promise<string> {
    let thisToken: string;
    return this.auth.idToken.toPromise();
  }

  public apiPost(token: string, url:string, body: {} = {}): Observable<object> {
    return this.http.post(
      url, body,{
        headers: {
        'Authorization': `Bearer ${token}`
        },
        responseType: 'json'
  })};

}
