import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { ApproveRequestComponent } from './components/approve-request/approve-request.component';
import { DisableRetaurantComponent } from './components/disable-retaurant/disable-retaurant.component';
import { CategorysComponent } from './components/categorys/categorys.component';
import { ReportsComponent } from './components/reports/reports.component';
import { DeliveryReportsComponent } from './components/reports/delivery-reports/delivery-reports.component';
import { ComplaintsComponent } from './components/complaints/complaints.component';

const routes: Routes = [
  {
    path: '',
    redirectTo:'adminLayout',
    pathMatch: 'full'
  },
  {
    path: 'adminLayout',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'aproveRequests',
        pathMatch: 'full'
      },
      {
        path: 'aproveRequests',
        component: ApproveRequestComponent
      },
       {
        path: 'disableRestaurant',
        component: DisableRetaurantComponent
      },
       {
        path: 'category',
        component: CategorysComponent
      },
       {
        path: 'category',
        component: CategorysComponent
      },
       {
        path: 'deliveryPartners',
        component: DeliveryReportsComponent
      },
       {
        path: 'reports/:id',
        component: ReportsComponent
      },
       {
        path: 'complaints/:id',
        component: ComplaintsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminScreenRoutingModule { }
