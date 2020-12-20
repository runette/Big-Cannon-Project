import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {BcpApiService} from './bcp-api.service';
import {Observable, BehaviorSubject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BcpUserService {

  user: BehaviorSubject<BcpUser> = new BehaviorSubject<BcpUser>(null);
  login: boolean = false;
  token: string;
  current_user: any;
  current_respose: any;

  constructor(private auth: AngularFireAuth, private api: BcpApiService) {
    auth.user.subscribe( user => {
      if (user) {
          this.getUser(user);
      } else {
        this.user.next(null);
        this.login = false;
      }
    });
  }

  public getUser(user): void{
    if (user != this.current_user) {
      this.auth.idToken.subscribe(token => {
        this.api.apiPost(token, this.api.FETCH_USER ).subscribe(response => {
          this.user.next(new BcpUser(user, response));
          this.login = true;
          this.current_respose = response;
        },
        error => {})
      },
      error => {})
    }
  }
}

export class BcpUser {
  name: string;
  id: string;
  fireUserData?: any;
  standing: BcpUserStanding;
  test_user: boolean;

  constructor(user : any, buser: {[key:string]:any}) {
    this.id = buser.uid;
    this.fireUserData = user;
    this.name = buser.name;
    this.standing = buser.standing as BcpUserStanding;
    this.test_user = buser.test;
  }

}

export type BcpUserStanding = "OBSERVER" | "RECORDER" | "SURVEYOR" | "ADMIN";
