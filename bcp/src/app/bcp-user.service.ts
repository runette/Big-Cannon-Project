import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase/app';
import {Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BcpUserService {

  user: BcpUser;
  login: boolean = false;
  token: string;

  constructor(private auth: AngularFireAuth, private http: HttpClient) {
    auth.auth.onAuthStateChanged( user => {
      if (user) {
        user.getIdToken().then( token => this.token = token);
        this.getUser(this.token).subscribe( response => {
          this.user = new BcpUser(user, response)
        }),
        error => {
          this.user = null;
          this.login = false;
          console.error(error)
          return
        }
        this.login = true
      } else {
        this.user = null;
        this.login = false;
      }
    });
  }

  private getUser(token: string): Observable<object> {
    return this.http.post(
      `http://localhost:8000/_ah/api/bcp/fetch_user`,{

      },{
        headers: {
        'Authorization': `Bearer ${token}`
        },
        responseType: 'json'
  })};
}

export class BcpUser {
  name: string;
  id: string;
  fireUserData?: User;
  standing: BcpUserStanding;
  test_user: boolean;

  constructor(user : User, buser: {[key:string]:any}) {
    this.id = buser.uid;
    this.fireUserData = user;
    this.name = buser.name;
    this.standing = buser.standing as BcpUserStanding;
    this.test_user = buser.test;
  }

}

export type BcpUserStanding = "OBSERVER" | "RECORDER" | "SURVEYOR" | "ADMIN";
