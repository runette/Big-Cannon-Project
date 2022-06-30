import { Component, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
  badgeHint = "Login";
  badgeColor = "primary";
  current_user: BcpUser;
  subs: Subscription[] = [];
  photoUrl: SafeUrl;

  constructor(private user: BcpUserService, 
              private sanitizer: DomSanitizer
            ){
    this.subs.push(
      this.user.user.subscribe({
        next: u => {
          this.onUserChange(u);
        }
      }
    ))
  }

  onUserChange(user: BcpUser){
    if (user) {
      this.current_user = user;
      this.photoUrl = `url('${this.sanitizer.sanitize( SecurityContext.URL, user.fireUserData.photoURL)}')`;
      this.badgeColor = "accent"
      this.badgeText = user.standing[0] + user.standing[1].toLowerCase();
      this.badgeHint = `${user.name} : ${user.standing.toString()}`
      if (user.test_user) {
        this.badgeColor = "warn";
        this.badgeText = "Tst";
        this.badgeHint = "Testing User";
      }
      if (user.train_user) {
        this.badgeColor = "warn"
        this.badgeText = "Trn";
        this.badgeHint = "Training User";
      }
    } else {
      this.badgeColor = "primary";
      this.badgeText = "";
      this.current_user = null;
      this.photoUrl = null;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
