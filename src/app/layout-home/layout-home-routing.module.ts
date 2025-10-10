import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../core/components/layout/layout.component';
import { DeliveryComponent } from './components/delivery/delivery.component';
import { ProfileComponent } from '../core/components/profile/profile.component';

const routes: Routes = [
  {
    path: 'layout',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'delivery',
        pathMatch: 'full',
      },
      
          {
            path: 'delivery',
            component: DeliveryComponent,
          },
          { path: 'delivery/:orderId', component: DeliveryComponent },
      {
        path: 'profile',
        component: ProfileComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutHomeRoutingModule {}
