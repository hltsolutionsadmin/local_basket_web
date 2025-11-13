import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutHomeRoutingModule } from './layout-home-routing.module';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { LayoutHomeService } from './service/layout-home.service';
import { DeliveryComponent } from './components/delivery/delivery.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HLTReusableLibModule } from 'hlt-reusable-lib';
import { MatCardModule } from '@angular/material/card';
import { OrderActionComponent } from './components/popupScreens/order-action/order-action.component';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    DeliveryComponent,
    OrderActionComponent,
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
