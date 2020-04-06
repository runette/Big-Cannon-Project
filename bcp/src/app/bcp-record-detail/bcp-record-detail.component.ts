import { Component, OnInit, OnChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { DataItem } from '../bcp-map-data.service';
import {BcpMapDataService} from '../bcp-map-data.service';


@Component({
  selector: 'app-bcp-record-detail',
  templateUrl: './bcp-record-detail.component.html',
  styleUrls: ['./bcp-record-detail.component.scss']
})
export class BcpRecordDetailComponent implements OnInit, OnChanges {

  gun: DataItem;
  edit: boolean= false;
  index: number;
  currentScreen: string = "observer";



  constructor(public request: ActivatedRoute, public mapData: BcpMapDataService ) {

   }

  ngOnChanges(): void {
    let a;
  }

  ngOnInit(): void {
    this.request.queryParamMap.subscribe(pmap => {
      this.index = this.mapData.filteredData.findIndex(element => element.gunid ===  parseInt(pmap.get('gunid')));
      this.gun = this.mapData.filteredData[this.index];
    });
  }
}
