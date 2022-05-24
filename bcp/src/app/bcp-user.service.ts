import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
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

  constructor(private auth: Auth, private api: BcpApiService) {
    auth.onAuthStateChanged( user => {
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
      this.api.apiPost(user.getIdToken(), this.api.FETCH_USER ).subscribe({next: response => {
        this.user.next(new BcpUser(user, response));
        this.login = true;
        this.current_respose = response;
      },
      error: e => console.error(e)}
      )
    }
  }
}

export class BcpUser {
  name: string;
  id: string;
  fireUserData?: any;
  standing: BcpUserStanding;
  test_user: boolean;
  train_user: boolean;

  constructor(user : any, buser: {[key:string]:any}) {
    this.id = buser.uid;
    this.fireUserData = user;
    this.name = buser.name;
    this.standing = buser.standing as BcpUserStanding;
    this.test_user = buser.test;
    this.train_user = buser.train;
  }

}

export type BcpUserStanding = "OBSERVER" | "RECORDER" | "SURVEYOR" | "ADMIN";
