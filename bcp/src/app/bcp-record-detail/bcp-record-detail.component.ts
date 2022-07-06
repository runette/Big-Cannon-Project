import { Component, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DataItem, MapData } from '../bcp-map-data.service';
import { BcpMapDataService } from '../bcp-map-data.service';
import { BcpUser, BcpUserService } from '../bcp-user.service';
import { Subscription } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { BcpApiService } from '../bcp-api.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bcp-record-detail',
  templateUrl: './bcp-record-detail.component.html',
  styleUrls: ['./bcp-record-detail.component.scss']
})
export class BcpRecordDetailComponent implements OnInit, OnDestroy {

  gun: DataItem;
  gunForm: UntypedFormGroup;
  edit: boolean= false;
  index: number;
  currentScreen: string = "observer";
  currentUser: BcpUser;
  userSubscription: Subscription;
  pmapSubscription: Subscription;
  dataSubscription: Subscription;
  pmap: ParamMap;
  fabIcon: string = "add";
  fabTooltip: string = "add a new Gun record";

  constructor(public request: ActivatedRoute,
              public user: BcpUserService,
              private api: BcpApiService,
              private mapData: BcpMapDataService,
              public userData: BcpUserService,
              private fb: UntypedFormBuilder,
              private router: Router,
              private _snackBar: MatSnackBar
               ) {
      this.userSubscription = this.userData.user.subscribe(user => this.onUserChange(user));
      this.dataSubscription = this.mapData.$newData.subscribe( flag => this.onMap());
      this.gunForm = this.fb.group({
        location: null,
        material: null,
        category: null,
        description: null,
        site_id: null,
        display_name: null,
        context: null,
        collection: null,
        coll_name: null,
        coll_ref: null,
        markings: null,
        mark_details: null,
        interpretation: null,
        inter_details: null,
        country: null,
        length: null,
        base_ring: null,
        muzzle: null,
        bore: null,
        trunnion_position: null,
        trunnion_width:  null,
        trunnion_diameter: null,
        trunnion_offset: null,
        moulding_code: null,
        muzzle_code: null,
        cas_code: null,
        button_code: null,
        attributions: null,
        web_links: null,
        urls: null
      })
      this.gunForm.valueChanges.subscribe(event => this.formChanged(event));
   }

  onUserChange(user: BcpUser): void{
      this.currentUser = user;
      if (user && user.fireUserData && this.gun) {
        this.edit = user.fireUserData.uid == this.gun.userId ? true : false || user.standing != "OBSERVER";
      }
  }

  ngOnInit(): void {
    this.pmapSubscription = this.request.queryParamMap.subscribe(pmap => {
      this.pmap = pmap;
      if (this.mapData.filteredData) this.onMap();
    });
  }

  onMap(): void{
      const thisGun = parseInt(this.pmap.get('gunid'));
      this.index = this.mapData.filteredData.findIndex(element => element.gunid ===  thisGun);
      let gun = this.mapData.filteredData[this.index];
      this.edit = false;
      if (this.currentUser && this.currentUser.fireUserData && gun) {
        this.edit = this.currentUser.fireUserData.uid == gun.userId ? true : false || this.currentUser.standing != "OBSERVER";
      };
      this.gun = gun;
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.pmapSubscription.unsubscribe();
    this.dataSubscription.unsubscribe();
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

  next() {
    let data: MapData = this.mapData.filteredData;
    this.index++;
    if ( this.index >= data.length) {
        this.index = 0;
        }
    let gun = this.mapData.filteredData[this.index];
    this.edit = false;
    if (this.currentUser && this.currentUser.fireUserData && gun) {
      this.edit = this.currentUser.fireUserData.uid == gun.userId ? true : false || this.currentUser.standing != "OBSERVER";
    };
    this.gun = gun;
    let urlPath = window.location.href.split("=")[0] + "=" + this.gun.gunid;
    window.history.pushState({},"", urlPath);
  };

  last() {
    let data: MapData = this.mapData.filteredData;
    this.index--;
    if ( this.index < 0) {
        this.index = data.length - 1;
        }
    let gun = this.mapData.filteredData[this.index];
    this.edit = false;
    if (this.currentUser && this.currentUser.fireUserData && gun) {
      this.edit = this.currentUser.fireUserData.uid == gun.userId ? true : false || this.currentUser.standing != "OBSERVER";
    };
    this.gun = gun;
    let urlPath = window.location.href.split("=")[0] + "=" + this.gun.gunid;
    window.history.pushState({},"", urlPath);
  };

  formChanged(event: any){
    this.fabIcon = "save";
    this.fabTooltip= "Save this Gun record";
  }

  submit(){
    if (this.user.current_user) {
      if (this.fabIcon == "save"){
        this.user.current_user.getIdToken().then( token => this.api.apiPost( token, this.api.SETRECORD, this.gun ).subscribe({next: response => {
              this.mapData.update(response);
            },
            error: e => console.error(e)
          }),
          e => console.error(e)
        )
        this.fabIcon = "add";
        this.fabTooltip = "add a new Gun record";
      } else {
        this.router.navigate(["new_record","site_id", this.gun.site_id]);
      }
      
    } else {
      this.router.navigate(['/login']);
    }
  }
}
