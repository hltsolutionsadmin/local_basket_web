import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginRegistrationComponent } from './components/login-registration/login-registration.component';
import { RestaurantRegisterComponent } from './components/restaurant-register/restaurant-register.component';
import { ApprovalPendingComponent } from './components/approval-pending/approval-pending.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'loginRegistration',
    pathMatch: 'full',
  },
  {
    path: 'loginRegistration',
    component: LoginRegistrationComponent,
  },
  {
    path: 'restaurantRegister',
    component: RestaurantRegisterComponent,
  },
  {
    path: 'approvalPending',
    component: ApprovalPendingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
