import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuManagementComponent } from './components/menu-management/menu-management.component';
import { LayoutComponent } from '../core/components/layout/layout.component';
import { ItemAvailabilityComponent } from './components/item-availability/item-availability.component';
import { ReportsComponent } from './components/Reports/order-reports/reports.component';
import { ProductReportsComponent } from './components/Reports/product-reports/product-reports.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'menuManagement',
        component: MenuManagementComponent,
      },
      {
        path: 'itemAvailability',
        component: ItemAvailabilityComponent,
      },
      {
        path: 'reports',
        component: ReportsComponent,
      },
      {
        path: 'product-reports',
        component: ProductReportsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuManagementRoutingModule {}
