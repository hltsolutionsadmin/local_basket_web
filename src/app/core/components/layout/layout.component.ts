  import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { catchError, delay, filter, finalize, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationsComponent } from '../notifications/notifications.component';
import { ApiConfigService } from '../../service/api-config.service';
import { BusinessUser, Order } from '../../interface/eatoInterface';
import { TokenService } from '../../service/token.service';
import { PoolingService } from '../../service/pooling.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/service/auth.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
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


  private readonly newOrdersBuffer = new Subject<Order>();
  private readonly subscriptions = new Subscription();

  private readonly apiConfig = inject(PoolingService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);

  @ViewChild('notificationPanel') notificationPanel!: NotificationsComponent;

  ngOnInit() {
    const currentUser = this.tokenService.getCurrentUserValue();
    this.restaurantName = currentUser?.businessName || localStorage.getItem('restaurantName') || 'restaurantName';
     this.tokenService.user$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.restaurantName = user.businessName;
        this.isOnline = user.enabled; // Sync initial status from API
      }
    });

    this.subscriptions.add(
      this.apiConfig.newOrder$.subscribe({
        next: (order: Order) => this.newOrdersBuffer.next(order),
        error: (error) => console.error('Error from ApiConfigService newOrder$:', error)
      })
    );

    this.subscriptions.add(
      this.apiConfig.totalElements$.subscribe({
        next: (total) => (this.totalElements = total),
        error: (error) => {
          console.error('Error fetching totalElements:', error);
          this.totalElements = 0;
        }
      })
    );
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.newOrdersBuffer.pipe(filter(() => !!this.notificationPanel)).subscribe({
        next: (order: any) => {
          this.notificationPanel.addOrder(order);
            this.isPanelOpen = true;
        },
        error: (error) => console.error('Error processing buffered new orders:', error)
      })
    );
  }


  toggleReportsSubMenu() {
    this.isReportsSubMenuOpen = !this.isReportsSubMenuOpen;
  }

toggleOnline(enabled: boolean) {
    if (!this.currentUser) return;

    const restaurantId = this.currentUser.id;
    this.loading = true;

    this.isOnline = enabled;

    this.tokenService
      .updateOnlineStatus(restaurantId, enabled)
      .pipe(
        delay(600),
        switchMap(() => this.authService.getCurrentUser()),
        tap((response: BusinessUser[]) => {
          const user = response[0];
          this.currentUser = user;
          if (user) {
            this.tokenService.setUser(user);  
            this.isOnline = user.enabled;
           this.isDropdownOpen = false;
          }
        }),
        finalize(() => (this.loading = false)),
        catchError((err) => {
          console.error('Failed to update user:', err);
          // Rollback UI state if API fails
          this.isOnline = !enabled;
          this.snackBar.open('Failed to update status', 'Close', {
            duration: 2000,
            panelClass: ['snack-error'],
          });
          return of(null);
        })
      )
      .subscribe(() => {
        this.snackBar.open(
          `Status updated: ${enabled ? 'Online' : 'Offline'}`,
          'Close',
          { duration: 2000 }
        );
      });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('Dropdown open:', this.isDropdownOpen);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (this.isDropdownOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/auth']);
    this.apiConfig.stopPolling();
  }

  openNotifications() {
    this.isPanelOpen = true;
  }

  closePanel() {
    this.isPanelOpen = false;
  }

  onPanelToggled(isOpen: boolean) {
    this.isPanelOpen = isOpen;
  }
}
