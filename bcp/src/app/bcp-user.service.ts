import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase/app';
import {BcpApiService} from './bcp-api.service';


@Injectable({
  providedIn: 'root'
})
export class BcpUserService {

  user: BcpUser;
  login: boolean = false;
  token: string;

  constructor(private auth: AngularFireAuth, private api: BcpApiService) {
    auth.auth.onAuthStateChanged( user => {
      if (user) {
          this.getUser(user);
      } else {
        this.user = null;
        this.login = false;
      }
    });
  }

  public getUser(user): void{
    this.auth.idToken.subscribe(token => {
      this.api.apiPost(token, this.api.FETCH_USER ).subscribe(response => {
        this.user = new BcpUser(user, response);
        this.login = true;
      },
      error => {})
    },
    error => {})
  }
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
