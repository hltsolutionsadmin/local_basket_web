import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminScreenRoutingModule } from './admin-screen-routing.module';
import { ApproveRequestComponent } from './components/approve-request/approve-request.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { HLTReusableLibModule } from 'hlt-reusable-lib';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DisableRetaurantComponent } from './components/disable-retaurant/disable-retaurant.component';
import { CategorysComponent } from './components/categorys/categorys.component';
import { AddCategoryComponent } from './components/popupScreens/add-category/add-category.component';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [
    ApproveRequestComponent,
    AdminLayoutComponent,
    DisableRetaurantComponent,
    CategorysComponent,
    AddCategoryComponent
  ],
  imports: [
    CommonModule,
    AdminScreenRoutingModule,
    HLTReusableLibModule,
    MatTooltipModule,
    MatDialogModule,
  ]
})
export class AdminScreenModule { }
