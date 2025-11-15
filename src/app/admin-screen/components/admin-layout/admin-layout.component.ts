import { Component, inject } from '@angular/core';
import { BusinessUser } from '../../../core/interface/eatoInterface';
import { TokenService } from '../../../core/service/token.service';
import { Router } from '@angular/router';

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
  { label: 'All Restaurant', icon: 'home', routerLink: '/adminScreen/adminLayout/disableRestaurant', exact: false },
   { label: 'Categories', icon: 'home', routerLink: '/adminScreen/adminLayout/category', exact: false },
];

restaurantName: string | null = null;
  isPanelOpen = false;
  isReportsSubMenuOpen = false;
  totalElements = 0;
  isDropdownOpen = false;
  isOnline = false;
  sellsCakes = false;
  specialOrders = false;
  currentUser: BusinessUser | null = null;
  loading = false;


  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  // private readonly dialog = inject(MatDialog); 


  ngOnInit() {
    const currentUser = this.tokenService.getCurrentUserValue();
    this.restaurantName =
      currentUser?.businessName ||
      localStorage.getItem('restaurantName') ||
      'restaurantName';
    this.tokenService.user$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.restaurantName = user.businessName;
        this.isOnline = user.enabled; // Sync initial status from API
      }
    });
  }




  logOut() {
    localStorage.clear();
    this.router.navigate(['/auth']);
  }

}
