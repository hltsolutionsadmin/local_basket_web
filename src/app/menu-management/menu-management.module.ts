import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuManagementRoutingModule } from './menu-management-routing.module';
import { MenuManagementComponent } from './components/menu-management/menu-management.component';
import { AddEditMenuComponent } from './components/menu-management/add-edit-menu/add-edit-menu.component';
import {  MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HLTReusableLibModule } from 'hlt-reusable-lib';
import { ItemAvailabilityComponent } from './components/item-availability/item-availability.component'
import { TimeToggleComponent } from './components/item-availability/time-toggle/time-toggle.component';
import { ReportsComponent } from './components/Reports/order-reports/reports.component';
import { HltTableComponent } from '../layout-home/components/hlt-table/hlt-table.component';
import { ProductReportsComponent } from './components/Reports/product-reports/product-reports.component';

@NgModule({
  declarations: [
    MenuManagementComponent,
    AddEditMenuComponent,
    ItemAvailabilityComponent,
    TimeToggleComponent,
    ReportsComponent,
    ProductReportsComponent,
    HltTableComponent,
  ],
  imports: [
    CommonModule,
    MenuManagementRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HLTReusableLibModule,
    MatFormFieldModule
  ]
})
export class MenuManagementModule { }
