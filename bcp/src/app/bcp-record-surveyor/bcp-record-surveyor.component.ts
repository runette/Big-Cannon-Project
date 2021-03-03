import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataItem } from '../bcp-map-data.service';
import { BcpFilterValuesService } from '../bcp-filter-values.service';
import { BcpUser, BcpUserService } from '../bcp-user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'bcp-record-surveyor',
  templateUrl: './bcp-record-surveyor.component.html',
  styleUrls: ['./bcp-record-surveyor.component.css']
})
export class BcpRecordSurveyorComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  gunForm: FormGroup;

  edit: boolean;

  currentUser: BcpUser;
  
  _gun: DataItem;
  @Input()
  set gun(gun: DataItem) {
    this._gun=gun;
    this.updateForm();
    if (this.cannonSvg) this.updateSvg();
  };

  get gun(): DataItem {
    return this._gun
  }

  scale: number = 1;

  keys = ['length','base_ring', 'muzzle', 'bore', 'trunnion_position', 'trunnion_width', 'trunnion_diameter', 'trunnion_offset'];
  elements = ['length-text','br-text','muzzle-text','bore-text','tp-text','tw-text','td-text','to-text'];
  formSubscription: Subscription;
  userSubscription: Subscription;

  @ViewChild('cannon', {static:true}) cannon :ElementRef;
  private cannonSvg: any;

  constructor(public DATA_VALUES: BcpFilterValuesService,
              public user: BcpUserService ) { 
                this.userSubscription = user.user.subscribe(user => this.onUserChange(user));
  }

  ngOnInit(): void {
    this.formSubscription = this.gunForm.valueChanges.subscribe(event => this.formChanged(event));
    this.updateForm();
  }

  ngAfterViewInit() : void {
    this.cannon.nativeElement.onload = () => {
      this.cannonSvg = this.cannon.nativeElement.contentDocument;
      this.updateSvg()
    }
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  onUserChange(user: BcpUser): void{
    this.currentUser = user;
  }

  scaleToggle($event){
    if (! $event.checked) {
        this.scale = 1;
      } else {
        this.scale = 1000;
      };
      this.updateForm();
      this.updateSvg();
    }

  formChanged($event){
    this.keys.forEach(key => this.gun.measurements[key] = Math.round(parseFloat(this.gunForm.value[key]) * this.scale));
    this.updateSvg();
  }
  
  updateSvg(): void {
    for (let i = 0; i< this.keys.length; i++){
      this.cannonSvg.getElementById(this.elements[i]).firstElementChild.innerHTML = this.gunForm.value[this.keys[i]] ? this.gunForm.value[this.keys[i]] : "";
    };
  }

  updateForm(){
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
  }
}
