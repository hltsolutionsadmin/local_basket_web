import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { LayoutHomeService } from '../../../layout-home/service/layout-home.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { from, Subject, switchMap, takeUntil } from 'rxjs';
import { OrderActionComponent } from '../../../layout-home/components/popupScreens/order-action/order-action.component';
import { MatDialog } from '@angular/material/dialog';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { enIN } from 'date-fns/locale'; 
import { PrintService } from '../../../layout-home/service/print.service';
import { OrderOnline } from '../../../layout-home/models/interface.model';
import { ApiConfigService } from '../../service/api-config.service';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
   animations: [
     trigger('panelState', [
      state('closed', style({ transform: 'translateX(100%)', width: '0', opacity: 0, pointerEvents: 'none' })), // Added width: 0, opacity: 0 and pointerEvents: none
      state('open', style({ transform: 'translateX(0)', width: '300px', opacity: 1, pointerEvents: 'auto' })), // Explicitly set width: 300px
      transition('closed => open', [
        style({ width: '300px', opacity: 0, transform: 'translateX(100%)', pointerEvents: 'auto' }), // Pre-animation state for 'open'
        animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition('open => closed', [
        animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ],
  providers: [DatePipe]
})
export class NotificationsComponent implements OnInit {
   orders: OrderOnline[] = [];
  isLoading = false;
  @Input() isOpen = false;
  businessId: any;
  @Output() panelToggled = new EventEmitter<boolean>();
  @Output() closePanel = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();
  private hasLoadedInitialOrders = false;

  constructor(
    private readonly router: Router,
    private readonly orderService: LayoutHomeService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef,
    private readonly printService: PrintService,
    private readonly pollingService: ApiConfigService // Inject PollingService
  ) {}

  ngOnInit(): void {
    this.businessId = localStorage.getItem('restaurantId');
    if (this.businessId) {
      this.loadInitialPlacedOrders();
      this.subscribeToNewOrders();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToNewOrders(): void {
    this.pollingService.newOrder$.pipe(takeUntil(this.destroy$)).subscribe((order) => {
      this.addOrder(order);
    });
  }

  private loadInitialPlacedOrders(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.orderService
      .getPlacedOrders(0, 10)
      .pipe(
        switchMap((response) => {
          if (response.status === 'success' && response.data?.content) {
            return [response.data.content.filter((order: any) => order.orderStatus === 'PLACED')];
          }
          throw new Error('Invalid response');
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (fetchedOrders: OrderOnline[]) => {
          this.orders = fetchedOrders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            username: order.username,
            orderStatus: order.orderStatus,
            orderItems: order.orderItems,
            totalAmount: order.totalAmount,
            updatedDate: order.updatedDate,
            businessName: order.businessName,
            timmimgs: order.timmimgs,
          }));
          this.hasLoadedInitialOrders = true;
          if (this.orders.length > 0) {
            this.panelToggled.emit(true);
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.snackBar.open('Failed to fetch initial orders', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  addOrder(order: any): void {
    const isNewPlacedOrder = order.orderStatus === 'PLACED';
    const isCompletedPreparingOrder = order.orderStatus === 'PREPARING' && order.timmimgs === 'COMPLETED';

    if ((isNewPlacedOrder || isCompletedPreparingOrder) && !this.orders.some((o) => o.id === order.id)) {
      this.orders = [order, ...this.orders];
      if (!this.isOpen) {
        this.panelToggled.emit(true);
      }
      this.cdr.markForCheck();
    }
  }

  handleAcceptClick(order: OrderOnline): void {
    const actionDialogRef = this.dialog.open(OrderActionComponent, {
      width: '400px',
      data: { order, action: 'approve' },
    });

    actionDialogRef
      .afterClosed()
      .pipe(
        switchMap((actionResult) => {
          if (!actionResult) return from([]);

          const preparationTime = actionResult.notes;
          const minutes = preparationTime.split(':')[1];
          const formattedPreparationTime = minutes.padStart(2, '0');

          return this.orderService.updateOrderStatus(order.orderNumber, 'PREPARING', formattedPreparationTime, '').pipe(
            switchMap((approveResult) => {
              if (!approveResult) {
                this.snackBar.open('Failed to approve order', 'Close', { duration: 3000 });
                return from([]);
              }
              return this.printService.printAndMarkKot({
                orderType: 'delivery',
                recentlyUpdatedItems: order.orderItems,
                restaurantName: order.businessName,
                orderNumber: order.orderNumber,
                orderId: order.id,
                status: 'New Order',
              });
            }),
            takeUntil(this.destroy$)
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (printResult) => {
          if (printResult?.success) {
            this.snackBar.open('Order accepted successfully and print sent to kitchen', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open(`Print failed: ${printResult?.error || 'Unknown error'}`, 'Close', { duration: 3000 });
          }
          this.removeOrderFromNotificationList(order.id);
        },
        error: (error: any) => {
          this.snackBar.open(`Error: ${error.message || 'An error occurred'}`, 'Close', { duration: 3000 });
          this.removeOrderFromNotificationList(order.id);
        },
      });
  }

  // New method to handle "Ready for Pickup" button click
  markAsReadyForPickup(order: OrderOnline): void {
    this.isLoading = true;
    this.orderService.updateOrderStatus(order.orderNumber, 'READY_FOR_PICKUP', '0', '').pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Order marked as ready for pickup', 'Close', { duration: 3000 });
          this.removeOrderFromNotificationList(order.id);
        },
        error: (error: any) => {
          this.snackBar.open('Failed to update order status', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  rejectOrder(order: OrderOnline, notes: string, updatedBy: string): void {
    this.dialog
      .open(OrderActionComponent, {
        width: '400px',
        data: { order, action: 'reject' },
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.orderService
            .updateOrderStatus(order.orderNumber, 'REJECTED', result.notes, result.updatedBy)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Order rejected successfully', 'Close', { duration: 3000 });
                this.removeOrderFromNotificationList(order.id);
              },
              error: () => this.snackBar.open('Failed to reject order', 'Close', { duration: 3000 }),
            });
        }
      });
  }

  removeOrderFromNotificationList(orderId: number): void {
    this.orders = this.orders.filter((o) => o.id !== orderId);
    if (!this.orders.length) {
      this.panelToggled.emit(false);
    }
    this.cdr.markForCheck();
  }

  viewDetails(orderId: number): void {
    this.orders = this.orders.filter((o) => o.id !== orderId);
    if (!this.orders.length) {
      this.panelToggled.emit(false);
    }
    this.router.navigate(['/layoutHome/layout/delivery', orderId]);
    this.closePanel.emit();
    this.cdr.markForCheck();
  }

  formatUpdatedDate(dateString: string): string {
    if (!dateString) return 'Unknown time';
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return 'Invalid time';
      return formatDistanceToNow(new Date(date.getTime() + 5.5 * 60 * 60 * 1000), {
        addSuffix: true,
        includeSeconds: true,
        locale: enIN,
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Error in time';
    }
  }

  getOrderItems(order: OrderOnline): string {
    return order.orderItems.map((item) => `${item.quantity}x ${item.productName}`).join(', ');
  }
}
