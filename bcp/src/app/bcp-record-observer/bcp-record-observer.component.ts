///<reference types='googlemaps' />
import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataItem } from '../bcp-map-data.service';
import { BcpFilterValuesService}  from '../bcp-filter-values.service';
import { BcpUser, BcpUserService } from '../bcp-user.service';
import { GalleryItem, ImageItem } from 'ng-gallery';
import { Subscription } from 'rxjs';
import { BcpPhotosComponent } from '../bcp-photos/bcp-photos.component';


@Component({
  selector: 'bcp-record-observer',
  templateUrl: './bcp-record-observer.component.html',
  styleUrls: ['./bcp-record-observer.component.css']
})
export class BcpRecordObserverComponent implements OnInit, OnDestroy {

  private _gun: DataItem
  @ViewChild(BcpPhotosComponent) photo: BcpPhotosComponent;

  @Input()
  gunForm: FormGroup;

  edit: boolean;

  @Input()
  set gun(value: DataItem) { 
    this._gun = value;
    this.updateGun();
  }

  get gun(): DataItem { return this._gun};

  currentUser: BcpUser;

  images: GalleryItem[] = [];

  formSubscription: Subscription;
  userSubscription: Subscription;

  keys =[
    'location',
    'material',
    'category',
    'description',
    'site',
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
              public user: BcpUserService) {
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
          this.gunForm.controls[key].enable({emitEvent: false}) 
        else 
          this.gunForm.controls[key].disable({emitEvent: false}) 
      }
      )
    this.images = []
    for (let image of this.gun.images) {
      this.images.push(new ImageItem({src: image.original, thumb: image.s200}));
    }
  }

  formChanged(event: any) {
    this.keys.forEach(key => 
      this.gun[key] = this.gunForm.value[key]
    );
  }

  locationUpdate($event){
    if (this.edit) {
      this.gunForm.patchValue({location:$event})
    }
  }

  acceptPhoto(files: FileList){
    let folderName: string = "prod";
    if (this.currentUser && this.currentUser.test_user) folderName = "dev";
    this.photo.send_file(files,`/${folderName}/${this.gun.gunid}`, this.gun.gunid)
  }
}
