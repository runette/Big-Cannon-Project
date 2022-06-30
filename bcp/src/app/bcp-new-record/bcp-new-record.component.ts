import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { BcpFilterValuesService } from '../bcp-filter-values.service';
import { GalleryItem  } from 'ng-gallery';
import { BcpApiService } from '../bcp-api.service';
import { MatStepper } from '@angular/material/stepper';
import { BcpPhotosComponent } from '../bcp-photos/bcp-photos.component';
import { BcpMapDataService } from '../bcp-map-data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { BcpUser, BcpUserService } from '../bcp-user.service';
import { Subscription } from 'rxjs';
import { Site, BcpSiteDataService } from '../bcp-site-data.service';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';

@Component({
  selector: 'app-bcp-new-record',
  templateUrl: './bcp-new-record.component.html',
  styleUrls: ['./bcp-new-record.component.scss'], 
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {showError: true},
    },
  ],
})
export class BcpNewRecordComponent implements OnInit, OnDestroy {

  marker: google.maps.Marker
  location: google.maps.LatLng;
  images: GalleryItem[] = [];
  geocode: any;
  _site: Site;
  site_id: number;

  currentUser: BcpUser;
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild(BcpPhotosComponent) photo: BcpPhotosComponent;
  subscriptions: Subscription[] = [];
  viewport: google.maps.LatLngBounds;
  steponeCompleted: boolean = false;
  steptwoCompleted: boolean = false;

  options = {
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: true,
    fullscreenControl: true,
    center:{lat:0, lng:0}
}

get site() {
  return this._site;
}

set site(site: Site) {
  this._site = site;
  if (site) {
    this.steponeCompleted = true;
    this.viewport = site.geocode.geometry.viewport;
  } else {
    this.steponeCompleted=false;
  }
}

  constructor(public DATA_VALUES: BcpFilterValuesService,
              public user: BcpUserService,
              private api: BcpApiService,
              private mapData: BcpMapDataService,
              private router: Router,
              public userData: BcpUserService,
              public request: ActivatedRoute,
              private sites: BcpSiteDataService,
              ){
    this.location = new google.maps.LatLng(0,0);
    this.subscriptions.push (userData.user.subscribe(user => this.userChange(user)));
  }

  ngOnInit(): void {
        this.subscriptions.push(this.request.queryParamMap.subscribe(pmap => {
      this.site_id = parseInt(pmap.get("site_id"));
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( sub => sub.unsubscribe());
  }

  userChange(user): void{
    this.currentUser = user;
  }

  acceptPhoto(files: FileList): void {
    if (! this.site.id) {
      let data = {
        source: "Google",
        place_id: this.site.geocode.place_id
      }
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.ADDSITE, data ).subscribe({
        next: response => {
          this.sites.add(response);
          this.site = this.sites.fetch(response['id'])
          this.addGun(files);
        }
      })
      );
    } else {
      this.addGun(files);
    }
  }

  addGun(files: FileList): void {
    let data = {
      "location": this.location,
      "site_id": this.site.id
    }
    let folderName: string = "prod";
    if (this.currentUser && this.currentUser.test_user) folderName = "dev";

    if (this.user.current_user) {
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.ADDRECORD, data ).subscribe({
        next: response => {
          this.mapData.add(response);
          this.sites.fetch(response["site_id"]).guns.push(response['gunid'])
          this.photo.send_file(files, `${folderName}/${response['gunid']}`, response['gunid']);
          this.router.navigate(["/database","entry"], {queryParams:{"gunid":response['gunid']}});
        }
      }
      ))
    }
  }

  private showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
          alert( "User denied the request for Geolocation.");
          break;
      case error.POSITION_UNAVAILABLE:
          alert( "Location information is unavailable.");
          break;
      case error.TIMEOUT:
          alert("The request to get user location timed out.");
          break;
      case error.UNKNOWN_ERROR:
          alert("An unknown error occurred.");
          break;
    }
  }
}