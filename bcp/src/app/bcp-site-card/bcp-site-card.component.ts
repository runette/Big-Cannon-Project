import { Component, OnInit , Input, ElementRef } from '@angular/core';
import { Site } from '../bcp-site-data.service';

@Component({
  selector: 'app-bcp-site-card',
  templateUrl: './bcp-site-card.component.html',
  styleUrls: ['./bcp-site-card.component.scss']
})
export class BcpSiteCardComponent implements OnInit {

  
  @Input()
  site: Site;

  showImage: boolean = true;
  numberOfCols: number = 10;

  @Input()
  showGuns: boolean = true;

  constructor( private ref: ElementRef) { }

  ngOnInit(): void {
    if ( this.ref && this.ref.nativeElement) {
      if (this.ref.nativeElement.offsetWidth < 350) {
        this.showImage = false;
        this.numberOfCols = 8;
      }
    }
  }
}

