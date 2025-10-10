import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { ApproveRequestComponent } from './components/approve-request/approve-request.component';
import { DisableRetaurantComponent } from './components/disable-retaurant/disable-retaurant.component';
import { CategorysComponent } from './components/categorys/categorys.component';

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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminScreenRoutingModule { }
