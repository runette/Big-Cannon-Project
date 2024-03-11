import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { BcpFilterValuesService } from '../bcp-filter-values.service';
import { GalleryItem, ImageItem  } from 'ng-gallery';
import { BcpApiService } from '../bcp-api.service';
import { MatStepper } from '@angular/material/stepper';
import { BcpPhotosComponent } from '../bcp-photos/bcp-photos.component';
import { BcpMapDataService } from '../bcp-map-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BcpUser, BcpUserService } from '../bcp-user.service';
import { Subscription } from 'rxjs';
import { Site, BcpSiteDataService, Geo } from '../bcp-site-data.service';
import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';
import { ParamMap } from '@angular/router';

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

  private _location: google.maps.LatLngLiteral;
  private _site: Site;
  private _files: File[] = [];
  private _urls: string[] = [];

  marker: google.maps.Marker
  images: GalleryItem[] = [];
  geocode: any;
  description: string = "";
  context: string = "";
  pages: string[];
  attributions: string[];

  currentUser: BcpUser;
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild(BcpPhotosComponent) photo: BcpPhotosComponent;
  subscriptions: Subscription[] = [];
  viewport: google.maps.LatLngBoundsLiteral;
  steponeCompleted: boolean = false;
  steptwoCompleted: boolean = false;

  fabIcon: string = "skip_next";
  fabActive: boolean = false;
  fabTooltip: string = "Next Step";

  options = {
    zoom: 12,
    mapTypeId: "roadmap",
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
    let geo =  new Geo(site.geocode.geometry)
    this.viewport =geo.viewport;
    if (new google.maps.LatLngBounds(this.viewport).contains(this.location)) {
      this.steponeCompleted = true;
      this.fabActive = true;
    } else {
      this.location = geo.location;
      this.steponeCompleted = true;
      this.fabActive = true;
    }
  } else {
    this.steponeCompleted=false;
    this.fabActive = false;
  }
}

get location (){
  return this._location;
}

set location (loc){
  this._location = loc;
  if (this.viewport) {
    this.steponeCompleted = true;
    this.fabActive = true;
  } else {
    this.steponeCompleted = false;
    this.fabActive = false;
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
              public changeDetect: ChangeDetectorRef
              ){
    this.location = {lat:0, lng:0};
    this.subscriptions.push (userData.user.subscribe(user => this.userChange(user)));
  }

  ngOnInit(): void {
        this.subscriptions.push(this.request.queryParamMap.subscribe((pmap: ParamMap) => {
          if (pmap.has('site_id'))
            this.site = this.sites.fetch(parseInt(pmap.get("site_id")));
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( sub => sub.unsubscribe());
  }

  userChange(user): void{
    this.currentUser = user;
  }

  acceptPhoto(flag: boolean): void {
    if (! flag ) return;
    if (! this.site.id) {
      let data = {
        source: "Google",
        place_id: this.site.geocode.place_id
      }
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.ADDSITE, data ).subscribe({
        next: response => {
          this.site = new Site(response['site'])
          this.sites.add(this.site)
          this.addGun();
        }
      })
      );
    } else {
      this.addGun();
    }
  }

  addGun(): void {
    let data = {
      "location": this.location,
      "site_id": this.site.id,
      "description": this.description,
      "context": this.context,
      "image_urls": this._urls,
      "urls": this.pages,
      "attributions": this.attributions
    }
    let folderName: string = "prod";
    if (this.currentUser && this.currentUser.test_user) folderName = "dev";

    if (this.user.current_user) {
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.ADDRECORD, data ).subscribe({
        next: response => {
          const gun = response['gun'];
          const sites = response['sites'];
          this.mapData.add(gun);
          for (const site of sites) {
            if (site) {
              this.sites.add(site);
            }
          };

          this.photo.send_file( `${folderName}/${gun['gunid']}`, gun['gunid']);
          this.router.navigate(["/database","entry"], {queryParams:{"gunid":gun['gunid']}});
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

  fabAction(): void{
    if (this.stepper.selectedIndex == 1 && this.steponeCompleted && this.steptwoCompleted) {
      this.acceptPhoto(true);
    } else {
      this.stepper.next();
    }
  }

  selectionChange(event: StepperSelectionEvent): void{
    if (event.selectedIndex == 0) {
      this.fabActive = this.steponeCompleted;
    } else {
      this.fabActive = this.steptwoCompleted;
    }
  }

  newImageUrl(urls: string[]): void {
    this._urls = urls;
    const flag = this._files.length > 0 || this._urls.length > 0;
    this.steptwoCompleted=flag;
    this.fabActive=flag;
    this.setImages();
  }

  newImage(files: FileList): void {
    const flag = files.length > 0 || this._urls.length > 0;
    this.steptwoCompleted=flag;
    this.fabActive=flag;
    this._files = Array.from(files)
    this.setImages();
  }

  setImages():void {
    this.images = []
    for (let file of this._files) {
      const url = URL.createObjectURL(file)
      this.images.push(new ImageItem({src: url}));
    }
    for (let url of this._urls) {
      try {
        const urlObj = new URL(url);
        this.images.push(new ImageItem({src: url}));
      } catch {

      }
     
    }
  }

  imageError($event: any): void {
    if ($event) {
      this.steptwoCompleted = false;
      this.fabActive = false;
    }
  }
}