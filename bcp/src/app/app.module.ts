import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { environment } from '../environments/environment';
import { GalleryModule } from 'ng-gallery';
import { StorageModule } from '@angular/fire/storage';

import {MatToolbarModule} from '@angular/material/toolbar';
import {LayoutModule} from '@angular/cdk/layout';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacySlideToggleModule as MatSlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {MatStepperModule} from '@angular/material/stepper';
import {MatLegacyProgressBarModule as MatProgressBarModule} from '@angular/material/legacy-progress-bar';
import {MatBadgeModule} from '@angular/material/badge';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {ScrollingModule } from '@angular/cdk/scrolling';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';

import { BcpHomeComponent } from './bcp-home/bcp-home.component';
import { BcpDatabaseComponent } from './bcp-database/bcp-database.component';
import { BcpNewRecordComponent } from './bcp-new-record/bcp-new-record.component';
import { GooglemapLocateComponent } from './googlemap-locate/googlemap-locate.component';
import { BcpDataCardComponent } from './bcp-data-card/bcp-data-card.component';
import { BcpRecordDetailComponent } from './bcp-record-detail/bcp-record-detail.component';
import { BcpRecordObserverComponent } from './bcp-record-observer/bcp-record-observer.component';
import { BcpRecordReporterComponent } from './bcp-record-reporter/bcp-record-reporter.component';
import { BcpRecordSurveyorComponent } from './bcp-record-surveyor/bcp-record-surveyor.component';
import { BcpList2stringPipe } from './bcp-list2string.pipe';
import { BcpHelpComponent } from './bcp-help/bcp-help.component';
import { BcpLoginComponent } from './bcp-login/bcp-login.component';
import { BcpGmapComponent } from './bcp-gmap/bcp-gmap.component';
import { BcpPhotosComponent } from './bcp-photos/bcp-photos.component';
import { BcpPrivacyComponent } from './bcp-privacy/bcp-privacy.component';
import { BcpTorComponent } from './bcp-tor/bcp-tor.component';
import { BcpV2Component } from './bcp-v2/bcp-v2.component';
import { BcpSiteCardComponent } from './bcp-site-card/bcp-site-card.component';
import { BcpSiteDetailComponent } from './bcp-site-detail/bcp-site-detail.component';
import { BcpSiteSelectorComponent } from './bcp-site-selector/bcp-site-selector.component';
import { BcpListInputComponent, UrlProcessPipe } from './bcp-list-input/bcp-list-input.component';

@NgModule({
  declarations: [
    AppComponent,
    BcpHomeComponent,
    BcpDatabaseComponent,
    BcpNewRecordComponent,
    GooglemapLocateComponent,
    BcpDataCardComponent,
    BcpRecordDetailComponent,
    BcpRecordObserverComponent,
    BcpRecordReporterComponent,
    BcpRecordSurveyorComponent,
    BcpList2stringPipe,
    BcpHelpComponent,
    BcpLoginComponent,
    BcpGmapComponent,
    BcpPhotosComponent,
    BcpPrivacyComponent,
    BcpTorComponent,
    BcpV2Component,
    BcpSiteCardComponent,
    BcpSiteDetailComponent,
    BcpSiteSelectorComponent,
    BcpListInputComponent,
    UrlProcessPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    LayoutModule,
    FlexLayoutModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    GoogleMapsModule,
    MatExpansionModule,
    MatListModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatSidenavModule,
    MatInputModule,
    MatChipsModule,
    BrowserModule,
    MatStepperModule,
    NgxAuthFirebaseUIModule.forRoot(environment.firebaseui),
    MatGridListModule,
    MatRadioModule,
    GalleryModule,
    MatProgressBarModule,
    StorageModule,
    MatBadgeModule,
    MatTooltipModule,
    ScrollingModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
