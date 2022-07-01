import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { UntypedFormGroup} from '@angular/forms';
import { DataItem } from '../bcp-map-data.service';
import { BcpFilterValuesService } from '../bcp-filter-values.service';
import { BcpUser, BcpUserService } from '../bcp-user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'bcp-record-reporter',
  templateUrl: './bcp-record-reporter.component.html',
  styleUrls: ['./bcp-record-reporter.component.css']
})
export class BcpRecordReporterComponent implements OnInit, OnDestroy {
 
  @Input()
  gunForm: UntypedFormGroup;

  edit: boolean;
  currentUser: BcpUser;
  
  _gun: DataItem;
  @Input()
  set gun(gun: DataItem) {
    this._gun=gun;
    this.updateForm();
  };

  get gun(): DataItem {
    return this._gun
  }

  formSubscription: Subscription;
  userSubscription: Subscription;

  keys =[
    'muzzle_code',
    'cas_code',
    'button_code',
  ]

  mouldings: string;

  constructor(public DATA_VALUES: BcpFilterValuesService,
              public user: BcpUserService ) {
                this.userSubscription= user.user.subscribe(user => this.onUserChange(user));
               }

  ngOnInit(): void {
    this.formSubscription = this.gunForm.valueChanges.subscribe(event => this.formChanged(event));
    this.updateForm();
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  onUserChange(user: BcpUser): void{
    this.currentUser = user;
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
    this.mouldings = "";
    for (let c of this.gun.moulding_code)
        this.mouldings += c;
  }

  formChanged(event){
    this.keys.forEach(key => 
      this.gun[key] = this.gunForm.value[key]
    );
  }

  mouldingChange(event){
    this.mouldings += event
    this.gun.moulding_code.push(event);
  }

  mouldingEdit(event){
    if (this.edit) {
      this.mouldings = event.currentTarget.value;
      this.gun.moulding_code = [];
      for (let c of event.currentTarget.value) {
        this.gun.moulding_code.push(c);
      }
    }
  }

}
