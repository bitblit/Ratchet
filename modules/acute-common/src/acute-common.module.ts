import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule, NgIf } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import {AlertComponent} from './components/dialogs/alert/alert.component';
import {BlockUiComponent} from './components/dialogs/block-ui/block-ui.component';

import {CapitalizePipe}  from './pipes/capitalize.pipe';
import {DollarFormattedPipe}  from './pipes/dollar-formatted.pipe';
import {MapValuesPipe}  from './pipes/map-values.pipe';
import {NumberWithCommasPipe}  from './pipes/number-with-commas.pipe';
import {OrderByPipe}  from './pipes/order-by.pipe';
import {PercentFormattedPipe}  from './pipes/percent-formatted.pipe';
import {PluralPipe}  from './pipes/plural.pipe';
import {RoundPipe}  from './pipes/round.pipe';
import {TimeAgoFormattedPipe}  from './pipes/time-ago-formatted.pipe';
import {TimingPipe}  from './pipes/timing.pipe';

import {GoogleAnalyticsService}  from './services/google-analytics.service';
import {GraphqlQueryService}  from './services/graphql-query.service';
import {LocalStorageService}  from './services/local-storage.service';
import {WindowRefService}  from './services/window-ref.service';
import { ProgressSpinnerModule } from "primeng/progressspinner";

const components = [
  AlertComponent,
  BlockUiComponent,
  CapitalizePipe,
  DollarFormattedPipe,
  MapValuesPipe,
  NumberWithCommasPipe,
  OrderByPipe,
  PercentFormattedPipe,
  PluralPipe,
  RoundPipe,
  TimeAgoFormattedPipe,
  TimingPipe
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
   NgIf, AsyncPipe, ProgressSpinnerModule

],
  declarations: [...components],
  exports: [...components],
  providers: [GoogleAnalyticsService,
    GraphqlQueryService,
    LocalStorageService,
    WindowRefService]
})
export class AcuteCommonModule { }
