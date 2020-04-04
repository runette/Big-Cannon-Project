import { Component, OnInit} from '@angular/core';
import { DataItem } from '../bcp-map-data.service';

@Component({
  selector: 'app-bcp-record-detail',
  templateUrl: './bcp-record-detail.component.html',
  styleUrls: ['./bcp-record-detail.component.css']
})
export class BcpRecordDetailComponent implements OnInit {

  record: DataItem;
  edit: boolean= false;

  constructor() { }

  ngOnInit(): void {
  }

}
