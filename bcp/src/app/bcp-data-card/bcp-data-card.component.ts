import { Component, OnInit, Input } from '@angular/core';
import { DataItem } from '../bcp-map-data.service';

@Component({
  selector: 'app-bcp-data-card',
  templateUrl: './bcp-data-card.component.html',
  styleUrls: ['./bcp-data-card.component.css']
})
export class BcpDataCardComponent implements OnInit {
  @Input()
  record: DataItem

  constructor() { }

  ngOnInit(): void {
  }

}
