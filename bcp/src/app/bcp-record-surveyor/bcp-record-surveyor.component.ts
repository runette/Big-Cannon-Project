import { Component, OnInit, Input } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { DataItem } from '../bcp-map-data.service';
import {BcpFilterValuesService} from '../bcp-filter-values.service';
import {BcpUserService, BcpUser, BcpUserStanding} from '../bcp-user.service'

@Component({
  selector: 'bcp-record-surveyor',
  templateUrl: './bcp-record-surveyor.component.html',
  styleUrls: ['./bcp-record-surveyor.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class BcpRecordSurveyorComponent implements OnInit {
 
  @Input() gun: DataItem;

  constructor(public DATA_VALUES: BcpFilterValuesService, public user: BcpUserService ) { }

  ngOnInit(): void {
    let a;
  }



}
