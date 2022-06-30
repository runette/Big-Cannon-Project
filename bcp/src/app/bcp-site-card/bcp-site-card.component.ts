import { Component, OnInit, Input } from '@angular/core';
import { Site } from '../bcp-site-data.service';

@Component({
  selector: 'app-bcp-site-card',
  templateUrl: './bcp-site-card.component.html',
  styleUrls: ['./bcp-site-card.component.scss']
})
export class BcpSiteCardComponent implements OnInit {

  
  @Input()
  site: Site;

  constructor() { }

  ngOnInit(): void {
  }

}

