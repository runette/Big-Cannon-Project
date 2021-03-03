import { Component } from '@angular/core';
import {BcpUserService, BcpUser} from './bcp-user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bcp';
  badgeText = "";
  badgeColor = "primary";
  userSubscription: Subscription;

  constructor(public userData: BcpUserService){
    this.userSubscription = this.userData.user.subscribe(user => this.onUserChange(user));
  }

  onUserChange(user: BcpUser){
    if (user) {
      this.badgeColor = "primary"
      this.badgeText = user.standing[0] + user.standing[1].toLowerCase();
      if (user.test_user) {
        this.badgeColor = "warn";
        this.badgeText = "Tst"
      }
      if (user.train_user) {
        this.badgeColor = "accent"
        this.badgeText = "Trn"
      }
    } else {
      this.badgeColor = "primary";
      this.badgeText = "";
    }
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
