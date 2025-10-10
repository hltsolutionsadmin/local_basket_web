  import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { filter, Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationsComponent } from '../notifications/notifications.component';
import { ApiConfigService } from '../../service/api-config.service';
import { Order } from '../../interface/eatoInterface';
import { TokenService } from '../../service/token.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit, OnDestroy {
  restaurantName: string | null = null;
  isPanelOpen = false;
  isReportsSubMenuOpen = false;
  totalElements = 0;
  isDropdownOpen = false;
  isOnline = false;
  sellsCakes = false;
  specialOrders = false;

  private readonly newOrdersBuffer = new Subject<Order>();
  private readonly subscriptions = new Subscription();

  private readonly apiConfig = inject(ApiConfigService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  @ViewChild('notificationPanel') notificationPanel!: NotificationsComponent;

  ngOnInit() {
    const currentUser = this.tokenService.getCurrentUserValue();
    this.restaurantName = currentUser?.businessName || localStorage.getItem('restaurantName') || 'restaurantName';

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
          if (this.router.url !== '/layoutHome/layout/delivery') {
            this.isPanelOpen = true;
          }
        },
        error: (error) => console.error('Error processing buffered new orders:', error)
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.newOrdersBuffer.complete();
    this.apiConfig.stopPolling();
  }

  toggleReportsSubMenu() {
    this.isReportsSubMenuOpen = !this.isReportsSubMenuOpen;
  }

  toggleOnline(checked: boolean) {
    this.isOnline = checked;
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
