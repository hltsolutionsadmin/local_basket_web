import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminScreenRoutingModule } from './admin-screen-routing.module';
import { ApproveRequestComponent } from './components/approve-request/approve-request.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { HLTReusableLibModule } from 'hlt-reusable-lib';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DisableRetaurantComponent } from './components/disable-retaurant/disable-retaurant.component';
import { CategorysComponent } from './components/categorys/categorys.component';
import { AddCategoryComponent } from './components/categorys/add-category/add-category.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReportsComponent } from './components/reports/reports.component';
import { RouterModule } from '@angular/router';
import { DeliveryReportsComponent } from './components/reports/delivery-reports/delivery-reports.component';
import { ComplaintsComponent } from './components/complaints/complaints.component';
import { DeliveryReportsModelComponent } from './components/reports/delivery-reports/delivery-reports-model/delivery-reports-model.component';
import { MatNativeDateModule } from '@angular/material/core';


@NgModule({
  declarations: [
    ApproveRequestComponent,
    AdminLayoutComponent,
    DisableRetaurantComponent,
    CategorysComponent,
    AddCategoryComponent,
    ReportsComponent,
    ComplaintsComponent,
    DeliveryReportsComponent,
    DeliveryReportsModelComponent
  ],
  imports: [
    CommonModule,
    AdminScreenRoutingModule,
    HLTReusableLibModule,
    MatTooltipModule,
    MatDialogModule,
    RouterModule,
    MatNativeDateModule
  ]
})
export class AdminScreenModule { }
