import { Component, OnInit, Input } from '@angular/core';
import { DataItem } from '../bcp-map-data.service';
import { Site } from '../bcp-site-data.service';

@Component({
  selector: 'app-bcp-data-card',
  templateUrl: './bcp-data-card.component.html',
  styleUrls: ['./bcp-data-card.component.css']
})
export class BcpDataCardComponent implements OnInit {
  @Input()
  record: DataItem;
  
  @Input()
  site: Site;

  constructor() { }

  ngOnInit(): void {
  }

}
