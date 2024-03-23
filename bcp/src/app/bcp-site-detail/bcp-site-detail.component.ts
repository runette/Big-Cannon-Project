import { Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { BcpSiteDataService, Site, MapSites } from '../bcp-site-data.service';
import { BcpMapDataService, DataItem } from '../bcp-map-data.service';
import { BcpUserService } from '../bcp-user.service';
import { BcpApiService } from '../bcp-api.service';
import { Router,ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BcpFilterValuesService } from '../bcp-filter-values.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MarkerData } from '../bcp-database/bcp-database.component';

@Component({
  selector: 'app-bcp-site-detail',
  templateUrl: './bcp-site-detail.component.html',
  styleUrls: ['./bcp-site-detail.component.scss']
})
export class BcpSiteDetailComponent implements OnInit, OnDestroy {

  public site: Site;
  public edit: boolean = false;
  private subscriptions: Subscription[] = [];
  private index: number = 0;
  private map: google.maps.Map;
  private site_id: number;

  fabIcon: string = "add";
  fabTooltip: string = "Add a new Gun to this Site"
  guns: DataItem[] = [];
  markerPositions: MarkerData[] = [];

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
  };

  icon: google.maps.Icon = {'url':''};

  options = {
    zoom: 12,
    mapTypeId: 'roadmap',
    zoomControl: true,
    mapTypeControl: false,  
    scaleControl: true,
    streetViewControl: false,
    rotateControl: true,
    fullscreenControl: true,
    center:{lat:0, lng:0}
  }

  constructor(public sites: BcpSiteDataService,
              public data: BcpMapDataService,
              private router: Router,
              private request: ActivatedRoute,
              public user: BcpUserService,
              private api: BcpApiService,
              public DATA_VALUES: BcpFilterValuesService,
              private changeDet: ChangeDetectorRef,
              private _snackBar: MatSnackBar,
            ) {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.subscriptions.push( this.request.queryParamMap.subscribe(pmap => {
      this.site_id = parseInt(pmap.get("site_id"))
      this.updateSite();
    }))
    this.subscriptions.push( this.sites.$newData.subscribe( () => {
      this.updateSite();
    }))
    this.subscriptions.push( this.data.$newData.subscribe( () => this.getGuns()));
  }

  updateSite() : void {
    this.changeDet.reattach();
    if (this.site_id){
      this.site = this.sites.fetch(this.site_id);
      this.index = this.sites.filteredSites?.findIndex(element => element.id ===  this.site_id);
      this.getGuns();
    }
  }

  getGuns(): void {
    this.guns = this.data.data.filter( item => this.site.guns.includes( item.gunid ))
  }

  loaded(map: google.maps.Map): void {
    google.maps.importLibrary('maps').then( (_) => {
      if (map) this.map = map;
      this.map.fitBounds(this.site.geocode.geometry.viewport,0);
      
      for (let gun of this.guns) {
        if (gun.quality == this.DATA_VALUES.RECORD_QUALITIES[1]) this.icon.url = '../assets/cannon_bronze.png';
        else if (gun.quality == this.DATA_VALUES.RECORD_QUALITIES[2]) this.icon.url = '../assets/cannon_silver.png';
        else if (gun.quality == this.DATA_VALUES.RECORD_QUALITIES[3]) this.icon.url = '../assets/cannon_gold.png';
        this.markerPositions.push({position: new google.maps.LatLng(gun.location), icon:this.icon});
      }
    })
  }

  submit(){}

  next(): void {
    let data: MapSites = this.sites.filteredSites;
    this.index++;
    if ( this.index >= data.length) {
        this.index = 0;
        }
    this.site = data[this.index];
    this.guns = this.data.data.filter( item => this.site.guns.includes( item.gunid ))
    this.loaded(null);
    let urlPath = window.location.href.split("=")[0] + "=" + this.site.id;
    window.history.pushState({},"", urlPath);
  }
  last() {
    let data: MapSites = this.sites.filteredSites;
    this.index--;
    if ( this.index < 0) {
        this.index = data.length - 1;
        }
    this.site = data[this.index];
    this.guns = this.data.data.filter( item => this.site.guns.includes( item.gunid ))
    this.loaded(null);
    let urlPath = window.location.href.split("=")[0] + "=" + this.site.id;
    window.history.pushState({},"", urlPath);
  }

  nameChanged(name: string): void {
    this.site.display_name=name;
    this.edit=false;
    if (this.user.current_user) {
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.SETRECORD, this.site ).subscribe({next: response => {
          this.site = response;
        },
        error: e => console.error(e)
      }),
      e => console.error(e)
      )
      this.fabIcon = "add";
    } else {
      this.router.navigate(['/login']);
    }
  }

link_here() {
    if (!navigator.clipboard){
      const el = document.createElement('textarea');  // Create a <textarea> element
      el.value = window.location.href;                                 // Set its value to the string that you want copied
      el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
      el.style.position = 'absolute';                 
      el.style.left = '-9999px';                      // Move outside the screen to make it invisible
      document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
      const selected =            
          document.getSelection().rangeCount > 0        // Check if there is any content selected previously
              ? document.getSelection().getRangeAt(0)     // Store selection if found
              : false;                                    // Mark as false to know no selection existed before
      el.select();                                    // Select the <textarea> content
      document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
      document.body.removeChild(el);                  // Remove the <textarea> element
      if (selected) {                                 // If a selection existed before copying
          document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
          document.getSelection().addRange(selected);   // Restore the original selection
      };
      this._snackBar.open("Permalink copied", "close", {
        duration: 3000
      })
  } else{
      navigator.clipboard.writeText( window.location.href).then(
        () => {
          this._snackBar.open("Permalink copied", "close", {
            duration: 3000
          })
        }
      );
    }    
  };
}
