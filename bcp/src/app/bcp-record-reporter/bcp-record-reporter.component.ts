import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import { DataItem } from '../bcp-map-data.service';
import {BcpFilterValuesService} from '../bcp-filter-values.service';
import {BcpUserService, BcpUser, BcpUserStanding} from '../bcp-user.service'

@Component({
  selector: 'bcp-record-reporter',
  templateUrl: './bcp-record-reporter.component.html',
  styleUrls: ['./bcp-record-reporter.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class BcpRecordReporterComponent implements OnInit, AfterViewInit {

  _gun: DataItem;
  @Input()
  set gun(gun: DataItem) {
    this._gun=gun;
    if (this.cannonSvg) this.updateSvg();
  };

  get gun(): DataItem {
    return this._gun
  }

  scale: string = 'metres';

  @ViewChild('cannon', {static:true}) cannon :ElementRef;
  @ViewChild(NgModel, {static: false}) model: NgModel;
  private cannonSvg: any;


  constructor(public DATA_VALUES: BcpFilterValuesService, public user: BcpUserService ) { }

  ngOnInit(): void {
    
  }

  ngAfterViewInit() : void {
    this.cannon.nativeElement.onload = () => {
      this.cannonSvg = this.cannon.nativeElement.contentDocument;
      this.updateSvg()
    }
    this.model.update.subscribe( () => { if (this.cannonSvg) this.updateSvg()});
  }


  scaleToggle($event){
    if ($event.checked) {
      this.scale = "mm";
      let keys = Object.keys(this.gun.measurements);
      keys.forEach(key => this.gun.measurements[key]*= 1000 )
      } else {
        this.scale = "metres";
      let keys = Object.keys(this.gun.measurements);
      keys.forEach(key => this.gun.measurements[key]*= 0.001 )
      };
      this.updateSvg();
    }
  
  updateSvg(): void {
    this.cannonSvg.getElementById('length-text').firstElementChild.innerHTML = this.gun.measurements['length'] ? this.gun.measurements['length'] : 0;
    this.cannonSvg.getElementById('br-text').firstElementChild.innerHTML = this.gun.measurements['baseRing'] ? this.gun.measurements['baseRing'] : 0;
    this.cannonSvg.getElementById('muzzle-text').firstElementChild.innerHTML = this.gun.measurements['muzzle'] ? this.gun.measurements['muzzle'] : 0;
    this.cannonSvg.getElementById('bore-text').firstElementChild.innerHTML = this.gun.measurements['bore'] ? this.gun.measurements['bore'] : 0;
    this.cannonSvg.getElementById('tp-text').firstElementChild.innerHTML =  this.gun.measurements['trunnionPosition'] ? this.gun.measurements['trunnionPosition'] : 0 ;
    this.cannonSvg.getElementById('tw-text').firstElementChild.innerHTML = this.gun.measurements['trunnionWidth'] ? this.gun.measurements['trunnionWidth'] : 0 ;
    this.cannonSvg.getElementById('td-text').firstElementChild.innerHTML = this.gun.measurements['trunnionDiameter'] ? this.gun.measurements['trunnionDiameter']: 0 ;
    this.cannonSvg.getElementById('to-text').firstElementChild.innerHTML = this.gun.measurements['trunnionOffset'] ? this.gun.measurements['trunnionOffset'] : 0 ;
    }; 
  

}
