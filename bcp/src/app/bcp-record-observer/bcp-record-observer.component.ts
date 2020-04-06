import { Component, OnInit, Input } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { DataItem } from '../bcp-map-data.service';
import {BcpFilterValuesService} from '../bcp-filter-values.service';
import {BcpUserService, BcpUser, BcpUserStanding} from '../bcp-user.service'

@Component({
  selector: 'bcp-record-observer',
  templateUrl: './bcp-record-observer.component.html',
  styleUrls: ['./bcp-record-observer.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class BcpRecordObserverComponent implements OnInit {

  @Input()
  gun: DataItem;

  constructor(public DATA_VALUES: BcpFilterValuesService, public user: BcpUserService ) { }

  ngOnInit(): void {
  }

}
