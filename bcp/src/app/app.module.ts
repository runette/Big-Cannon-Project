import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FlexLayoutModule} from "@angular/flex-layout";
import {GoogleMapsModule} from '@angular/google-maps';

import {MatToolbarModule} from '@angular/material/toolbar';
import {LayoutModule} from '@angular/cdk/layout';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import { BcpHomeComponent } from './bcp-home/bcp-home.component';
import { BcpDatabaseComponent } from './bcp-database/bcp-database.component';
import { BcpNewRecordComponent } from './bcp-new-record/bcp-new-record.component';
import { GooglemapLocateComponent } from './googlemap-locate/googlemap-locate.component';
import { BcpDataCardComponent } from './bcp-data-card/bcp-data-card.component';
import { BcpRecordDetailComponent } from './bcp-record-detail/bcp-record-detail.component';


@NgModule({
  declarations: [
    AppComponent,
    BcpHomeComponent,
    BcpDatabaseComponent,
    BcpNewRecordComponent,
    GooglemapLocateComponent,
    BcpDataCardComponent,
    BcpRecordDetailComponent
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
    MatSlideToggleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
