import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Site, BcpSiteDataService } from '../bcp-site-data.service';
import { BcpUserService } from '../bcp-user.service';
import { BcpApiService } from '../bcp-api.service';
import { Subscription,  } from 'rxjs';

const SOURCES = ["Google"]

@Component({
  selector: 'app-bcp-site-selector',
  templateUrl: './bcp-site-selector.component.html',
  styleUrls: ['./bcp-site-selector.component.scss']
})
export class BcpSiteSelectorComponent implements OnInit, OnDestroy {

  @Input()
  set site_id(site_id: number) {
    this.site = this.sites.fetch(site_id);
  }

  @Input()
  site: Site;

  @Output()
  newSite$: EventEmitter<Site> = new EventEmitter<Site>();

  addSite: boolean = false;
  closestSites: [site: Site, distance: number][] = [];
  candidateSites: [site: Site, distance: number][] = [];
  source: string = "Google";
  private _location: google.maps.LatLngLiteral;
  private subscriptions: Subscription[] = [];

  fetchSitesWaiting: boolean = false;

  @Input()
  get location() {
    return this._location;
    }
  
  set location(loc: google.maps.LatLngLiteral) {
    google.maps.importLibrary('geometry').then( (_) => {
      this._location = loc;
      if (this._location.lat == 0 && this._location.lng == 0) {
        navigator.geolocation.getCurrentPosition(position => this.location = {lat:position.coords.latitude,lng:position.coords.longitude }, this.showError);
      } else {
        this.closestSites = []
        this.sites.data.forEach( site => {
          if (new google.maps.LatLngBounds(site.geocode.geometry.viewport).contains(this._location)
            ) {
            this.closestSites.push([site, google.maps.geometry.spherical.computeDistanceBetween(loc, site.geocode.geometry.location)])
          };
        });
        this.closestSites.sort( (a,b) => a[1] - b[1])
      }
    });
  }

  SOURCES = SOURCES;

  constructor(
    public sites: BcpSiteDataService,
    private changDetect: ChangeDetectorRef,
    public user: BcpUserService,
    private api: BcpApiService,
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( sub => sub.unsubscribe());
  }

  getSites():void {
    if (this.user.current_user) {
      this.fetchSitesWaiting = true;
      this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.GET_LOCATION, {
          lat: this.location.lat,
          lng: this.location.lng,
          source: this.source
        } 
      ).subscribe({next: response => this.newGeo(response), error: e => console.error(e)})
      )
    }
  }

  newGeo(response: any): void{
    google.maps.importLibrary('geometry').then( (_) => {
      let map = ["geolocation", "places"]
      for (let key of map) {
        let data = response[key];
        for (let geocode of data) {
          let site = Site.fromGeocode(geocode);
          if (new google.maps.LatLngBounds(site.geocode.geometry.viewport).contains(this.location)) {
            this.candidateSites = [...this.candidateSites,
              [site, 
              google.maps.geometry.spherical.computeDistanceBetween(
                this.location, site.geocode.geometry.location
              )]
            ];
          }
        }
      }
      this.candidateSites.sort( (a,b) => a[1] - b[1]);
      this.fetchSitesWaiting = false;
    })
  }
  
  private showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
          alert( "User denied the request for Geolocation.");
          break;
      case error.POSITION_UNAVAILABLE:
          alert( "Location information is unavailable.");
          break;
      case error.TIMEOUT:
          alert("The request to get user location timed out.");
          break;
      case error.UNKNOWN_ERROR:
          alert("An unknown error occurred.");
          break;
    }
  }

  setSite(site: Site): void {
    this.site = site;
    this.newSite$.emit(site);
  }
}
