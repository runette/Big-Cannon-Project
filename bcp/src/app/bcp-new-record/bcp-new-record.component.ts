import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { BcpFilterValuesService } from '../bcp-filter-values.service';
import { GalleryItem  } from 'ng-gallery';
import { BcpApiService } from '../bcp-api.service';
import { MatStepper } from '@angular/material/stepper';
import { BcpPhotosComponent } from '../bcp-photos/bcp-photos.component';
import { BcpMapDataService } from '../bcp-map-data.service';
import { Router } from '@angular/router';
import { BcpUser, BcpUserService } from '../bcp-user.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-bcp-new-record',
  templateUrl: './bcp-new-record.component.html',
  styleUrls: ['./bcp-new-record.component.scss']
})
export class BcpNewRecordComponent implements OnInit, OnDestroy {

  locationView: string = "latLng";
  marker: google.maps.Marker
  location: google.maps.LatLng;
  images: GalleryItem[] = [];
  geocode: any;
  site: string = "";
  currentUser: BcpUser;
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild(BcpPhotosComponent) photo: BcpPhotosComponent;
  userSubscription: Subscription;

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

  constructor(public DATA_VALUES: BcpFilterValuesService,
              private user: BcpUserService,
              private api: BcpApiService,
              private mapData: BcpMapDataService,
              private router: Router,
              public userData: BcpUserService,
              private changDetect: ChangeDetectorRef){
    this.location = new google.maps.LatLng(52,0);
    this.userSubscription =  userData.user.subscribe(user => this.userChange(user))
   }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  userChange(user): void{
    this.currentUser = user;
  }

  locationUpdate(pos: google.maps.LatLng) {
    this.location = pos;
  }

  acceptPosition():void {
    if (this.user.current_user) {
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.GET_LOCATION, {
          lat: this.location.lat(),
          lng: this.location.lng()
        } 
      ).subscribe({next: response => this.newGeo(response), error: e => console.error(e)})
      )
    }
  }


  newGeo(response): void{
    this.geocode = response;
    this.site = response.country;
    try {
      this.site = response.places[0].name;
    } catch {};
    this.stepper.selectedIndex = 1;
    this.changDetect.detectChanges();
  }

  acceptSite():void {
    if (this.site) this.stepper.selectedIndex = 2;
  }

  acceptPhoto(files: FileList): void {
    let data = this.geocode;
    data['current_site'] = this.site;
    let folderName: string = "prod";
    if (this.currentUser && this.currentUser.test_user) folderName = "dev";

    if (this.user.current_user) {
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.ADDRECORD, data ).subscribe({
        next: response => {
          this.mapData.add(response);
          this.photo.send_file(files, `${folderName}/${response['gunid']}`, response['gunid']);
          this.router.navigate(["/database","entry"], {queryParams:{"gunid":response['gunid']}});
        }
      }
      ))
    }
  }
}