import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  topNavItems: any[] = [
    { label: 'Admin', icon: 'person', exact: false}
  ]
    navItems: any[] = [
  { label: 'Approval Requests', icon: 'home', routerLink: '/adminScreen/adminLayout/aproveRequests', exact: false },
  { label: 'Disable Restaurant', icon: 'home', routerLink: '/adminScreen/adminLayout/disableRestaurant', exact: false },
   { label: 'Categories', icon: 'home', routerLink: '/adminScreen/adminLayout/category', exact: false },
];
}
