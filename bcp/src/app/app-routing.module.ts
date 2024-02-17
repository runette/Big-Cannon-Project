import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {BcpHomeComponent} from './bcp-home/bcp-home.component';
import {BcpDatabaseComponent} from './bcp-database/bcp-database.component';
import {BcpNewRecordComponent} from './bcp-new-record/bcp-new-record.component';
import {BcpRecordDetailComponent} from './bcp-record-detail/bcp-record-detail.component';
import {BcpHelpComponent} from './bcp-help/bcp-help.component';
import {BcpLoginComponent} from './bcp-login/bcp-login.component';
import {BcpPrivacyComponent} from './bcp-privacy/bcp-privacy.component';
import {BcpTorComponent} from './bcp-tor/bcp-tor.component';
import { BcpSiteDetailComponent } from './bcp-site-detail/bcp-site-detail.component';


const routes: Routes = [
{ path: '', component: BcpHomeComponent },
{ path: 'database', component: BcpDatabaseComponent },
{ path: 'new_record', component: BcpNewRecordComponent},
{ path: 'database/entry', component: BcpRecordDetailComponent, canDeactivate: [
  (component: BcpRecordDetailComponent) => component.dirty? confirm(
    'WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes.'
  ): true
]},
{ path: 'database/site', component:BcpSiteDetailComponent},
{ path: 'recording', component: BcpHelpComponent},
{ path: 'login', component: BcpLoginComponent},
{ path: 'privacy', component: BcpPrivacyComponent},
{ path: 'tor', component: BcpTorComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
