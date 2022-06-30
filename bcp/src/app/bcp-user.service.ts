import { Injectable, OnDestroy } from '@angular/core';
import {BcpApiService} from './bcp-api.service';
import {Subscription, BehaviorSubject} from 'rxjs';
import {AuthProcessService} from 'ngx-auth-firebaseui';
import { User }  from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class BcpUserService implements OnDestroy {

  user: BehaviorSubject<BcpUser> = new BehaviorSubject<BcpUser>(null);
  login: boolean = false;
  token: string;
  current_user: User ;
  current_respose: any;

  private subscriptions: Subscription[] = [];

  constructor(private auth: AuthProcessService, private api: BcpApiService) {
    this.subscriptions.push(auth.user$.subscribe( u => {
      if (u) {
          this.getUser(u);
      } else {
        this.user.next(null);
        this.login = false;
      }
    }));
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public getUser(user: User): void{
    if (user != this.current_user) {
      user.getIdToken().then( token => this.api.apiPost( token, this.api.FETCH_USER ).subscribe({next: response => {
        this.login = true;
        this.current_respose = response;
        this.current_user = user;
        this.user.next(new BcpUser(user, response));
      },
      error: e => console.error(e)}
      ),
      e => console.error(e))
    }
  }
}

export class BcpUser {
  name: string;
  id: string;
  fireUserData?: fireUserData;
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

export interface fireUserData{
  photoURL?: string;
  uid?: string;
}

export type BcpUserStanding = "OBSERVER" | "RECORDER" | "SURVEYOR" | "ADMIN";
