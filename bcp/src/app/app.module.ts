import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FlexLayoutModule} from "@angular/flex-layout";
import {GoogleMapsModule} from '@angular/google-maps';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { environment } from '../environments/environment';
import { GalleryModule } from 'ng-gallery';
import { AngularFireStorageModule } from '@angular/fire/storage';

import {MatToolbarModule} from '@angular/material/toolbar';
import {LayoutModule} from '@angular/cdk/layout';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatRadioModule} from '@angular/material/radio';
import {MatStepperModule} from '@angular/material/stepper';
import {MatProgressBarModule} from '@angular/material/progress-bar';
 


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
    //AngularFireModule.initializeApp(environment.firebase),
    NgxAuthFirebaseUIModule.forRoot(environment.firebaseui),
    MatGridListModule,
    MatRadioModule,
    GalleryModule,
    MatProgressBarModule,
    AngularFireStorageModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
