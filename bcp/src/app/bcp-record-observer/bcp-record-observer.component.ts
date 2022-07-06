///<reference types='google.maps' />
import { Component, OnInit, Input, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { DataItem } from '../bcp-map-data.service';
import { Site, BcpSiteDataService } from '../bcp-site-data.service';
import { BcpFilterValuesService}  from '../bcp-filter-values.service';
import { BcpUser, BcpUserService } from '../bcp-user.service';
import { GalleryItem, ImageItem } from 'ng-gallery';
import { Subscription } from 'rxjs';
import { BcpPhotosComponent } from '../bcp-photos/bcp-photos.component';
import { BcpApiService } from '../bcp-api.service';


@Component({
  selector: 'bcp-record-observer',
  templateUrl: './bcp-record-observer.component.html',
  styleUrls: ['./bcp-record-observer.component.css']
})
export class BcpRecordObserverComponent implements OnInit, OnDestroy {

  private _gun: DataItem
  @ViewChild(BcpPhotosComponent) photo: BcpPhotosComponent;

  @Input()
  gunForm: UntypedFormGroup;

  edit: boolean;
  editAttribution: boolean = false;

  @Input()
  set gun(value: DataItem) { 
    this._gun = value;
    this.site = this.sites.fetch(value.site_id);
    this.updateGun();
  }

  get gun(): DataItem { return this._gun};

  private _site: Site;
  get site(): Site{
    return this. _site;
  }

  set site(site: Site) {
    this._site = site;
    if (site) this.viewport = site.geocode.geometry.viewport;
  }
  viewport: google.maps.LatLngBounds;

  currentUser: BcpUser;

  images: GalleryItem[] = [];

  formSubscription: Subscription;
  userSubscription: Subscription;

  keys =[
    'location',
    'material',
    'category',
    'description',
    'site_id',
    'display_name',
    'context',
    'collection',
    'coll_name',
    'coll_ref',
    'markings',
    'mark_details',
    'interpretation',
    'inter_details',
    'country',
    'web_links',
    'urls',
    'attributions'
  ]


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
              public user: BcpUserService,
              public sites: BcpSiteDataService,
              public changeDetect: ChangeDetectorRef,
              private api: BcpApiService,
              ) {
                this.userSubscription = user.user.subscribe(user => this.onUserChange(user));
               }

  ngOnInit(): void {
    this.updateGun();
    this.formSubscription = this.gunForm.valueChanges.subscribe(event => this.formChanged(event));
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  onUserChange(user: BcpUser): void{
    this.currentUser = user;
  }

  updateGun(): void {
    if (this.currentUser && this.currentUser.fireUserData && this.gun) {
      this.edit = this.currentUser.fireUserData.uid == this.gun.userId ? true : false || this.currentUser.standing != "OBSERVER";
    }
    if(this.gunForm) 
      this.keys.forEach(key => {this.gunForm.patchValue({
          [key]: this.gun[key]
        }, {
          emitEvent: false
        });
        if (this.edit) 
          this.gunForm.controls[key]?.enable({emitEvent: false}) 
        else 
          this.gunForm.controls[key]?.disable({emitEvent: false}) 
      }
      )
    this.images = []
    for (let image of this.gun.images) {
      this.images.push(new ImageItem({src: image.original, thumb: image.s200? image.s200 : image.original}));
    }
  }

  formChanged(event: any) {
    this.keys.forEach(key => {
      this.gun[key] = this.gunForm.value[key];
      this.site = this.sites.fetch(this.gun.site_id);
    });
  }

  siteChanged(site: Site) {
    if (this.edit && site) {
      const old_site= this.sites.fetch(this.gun.site_id);
      old_site.guns = old_site.guns.filter(item => item != this.gun.gunid)
      if (old_site.guns.length < 1) {
        this.sites.remove(site)
      };
      if (! site.id) {
        let data = {
          source: "Google",
          place_id: site.geocode.place_id
        }
        this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.ADDSITE, data ).subscribe({
          next: response => {
            this.sites.add(response);
            this.gunForm.patchValue({site_id: response['id']})
          }
        }))
      } else {
        site.guns.push(this.gun.gunid)
        this.gunForm.patchValue({site_id: site.id})
      }
    }
  }

  locationUpdate($event){
    if (this.edit) {
      this.gunForm.patchValue({location:$event})
    }
  }

  acceptPhoto(){
    let folderName: string = "prod";
    if (this.currentUser && this.currentUser.test_user) folderName = "dev";
    this.photo.send_file(`/${folderName}/${this.gun.gunid}`, this.gun.gunid)
  }
}
