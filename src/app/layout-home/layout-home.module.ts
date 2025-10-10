import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutHomeRoutingModule } from './layout-home-routing.module';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { LayoutHomeService } from './service/layout-home.service';
import { DeliveryComponent } from './components/delivery/delivery.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HLTReusableLibModule } from 'hlt-reusable-lib';
import { HltRestaurantComponent } from './components/hlt-restaurant/hlt-restaurant.component';
import { AlertBoxComponent } from './components/popupScreens/alert-box/alert-box.component';
import { AddDescriptionComponent } from './components/popupScreens/add-description/add-description.component';
import { MatCardModule } from '@angular/material/card';
import { OrderActionComponent } from './components/popupScreens/order-action/order-action.component';
import { HlttableReusableComponent } from '../core/components/hlttable-reusable/hlttable-reusable.component';
import { RegenarateKotComponent } from './components/popupScreens/regenarate-kot/regenarate-kot.component';
import { DatePipe } from '@angular/common';
import { KotPreviewComponent } from './components/popupScreens/kot-preview/kot-preview.component';
import { PrinterSelectionComponent } from './components/popupScreens/printer-selection/printer-selection.component';

@NgModule({
  declarations: [
    DeliveryComponent,
    HltRestaurantComponent,
    AlertBoxComponent,
    AddDescriptionComponent,
    OrderActionComponent,
    HlttableReusableComponent,
    RegenarateKotComponent,
    KotPreviewComponent,
    PrinterSelectionComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutHomeRoutingModule,
    MatDialogModule,
    RouterModule,
    HLTReusableLibModule,
    MatCardModule,
    
  ],
   providers: [
      LayoutHomeService,
      DatePipe
    ],
})
export class LayoutHomeModule { }
