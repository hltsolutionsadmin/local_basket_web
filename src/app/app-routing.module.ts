import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
   {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing.module').then(m => m.AuthRoutingModule)
   },
   {
    path: 'layoutHome',
    loadChildren: () => import('./layout-home/layout-home-routing.module').then(m => m.LayoutHomeRoutingModule),
   },
   {
    path: 'menuManagement',
    loadChildren: () => import('./menu-management/menu-management-routing.module').then(m => m.MenuManagementRoutingModule)
   },
   {
    path: 'adminScreen',
    loadChildren: () => import('./admin-screen/admin-screen-routing.module').then(m => m.AdminScreenRoutingModule)
   },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
