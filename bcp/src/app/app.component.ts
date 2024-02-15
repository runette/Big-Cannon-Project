import { Component, SecurityContext, Inject, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BcpUserService, BcpUser } from './bcp-user.service';
import { Subscription } from 'rxjs';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { BcpPreferencesService, CookieStatus } from './bcp-preferences.service'
import { BcpMapDataService } from './bcp-map-data.service';
import { BcpSiteDataService } from './bcp-site-data.service';


const CookieDialogConfig : MatDialogConfig = {
  closeOnNavigation: false,
  disableClose: true,
  position: {
    top: '5%',
    left: '10%'
  },
  minWidth: '80%',
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit{
  title = 'bcp';
  badgeText = "";
  badgeHint = "Login";
  badgeColor = "primary";
  current_user: BcpUser;
  subs: Subscription[] = [];
  photoUrl: SafeUrl;

  constructor(private user: BcpUserService, 
              private sanitizer: DomSanitizer,
              private dialog: MatDialog,
              private prefs: BcpPreferencesService,
              private data: BcpMapDataService, 
              private sites: BcpSiteDataService,
            ){
    this.subs.push(
      this.user.user.subscribe({
        next: u => {
          this.onUserChange(u);
        }
      }
    ))
  }

  ngAfterViewInit(): void {
    if (! this.prefs.data) { 
      this.prefs.data = {
        cookie_status: CookieStatus.NONE
      };
    }
    if (this.prefs.data.cookie_status == CookieStatus.NONE) {
      CookieDialogConfig.data=this.prefs;
      this.dialog.open(CookieDialog, CookieDialogConfig)
    }
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

@Component({
  selector: 'cookie-dialog',
  templateUrl: './cookie_dialog.component.html',
})
export class CookieDialog {
  constructor(
    public dialogRef: MatDialogRef<CookieDialog>,
    @Inject(MAT_DIALOG_DATA) public prefs: BcpPreferencesService,
  ) {
    if (this.prefs.data.cookie_status ==CookieStatus.NONE ) this.prefs.data = {cookie_status:CookieStatus.ALL};
  }

  change(event:any): void {
    let data = this.prefs.data;
    if (event.checked) {
      data.cookie_status = CookieStatus.ALL;
    } else {
      data.cookie_status = CookieStatus.NOT_SOCIAL;
    }
    this.prefs.data = data;
  }
}
