import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { LayoutHomeService } from '../../service/layout-home.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { OrderActionComponent } from '../popupScreens/order-action/order-action.component';
import { from, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
// import { KotPrintComponent } from '../popupScreens/kot-print/kot-print.component';
import { ActivatedRoute } from '@angular/router';
import { AddDescriptionComponent } from '../popupScreens/add-description/add-description.component';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { enIN } from 'date-fns/locale'; 
import { Order } from '../../models/interface.model';
import { PrintService } from '../../service/print.service';
import { PrinterSelectionComponent } from '../popupScreens/printer-selection/printer-selection.component';

@Component({
  selector: 'app-delivery',
  standalone: false,
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.scss',
})
export class DeliveryComponent implements OnDestroy {
  tableData: Order[] = [];
  totalItems = 0;
  currentPageIndex = 0;
  pageSize = 10;
  loading = false;
  searchTerm = '';
  isOrderDetailsPanelOpen = false;
  selectedOrder: Order | null = null;
  expandedOrderId: number | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private orderService: LayoutHomeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private kotPrintService: PrintService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const orderId = params.get('orderId') ? parseInt(params.get('orderId')!, 10) : undefined;
        return this.orderService.getPlacedOrders(this.currentPageIndex, this.pageSize).pipe(
          takeUntil(this.destroy$)
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => this.handleFetchOrdersSuccess(response, this.route.snapshot.paramMap.get('orderId')),
      error: () => this.handleFetchOrdersError(),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleFetchOrdersSuccess(response: any, orderIdParam?: string | null): void {
    if (response.status === 'success' && response.data?.content) {
      this.tableData = response.data.content.map((order: any) => ({
        orderNumber: order.orderNumber,
        id: order.id,
        username: order.username,
        mobileNumber: order.mobileNumber,
        orderStatus: order.orderStatus,
        notes: order.notes,
        timmimgs: order.timmimgs,
        totalAmount: order.totalAmount,
        updatedDate: order.updatedDate || new Date().toISOString(),
        orderItems: order.orderItems?.map((item: any) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          description: item.description,
        })) || [],
        itemsArray: order.orderItems?.map((item: any, index: number) => ({
          productName: item.productName,
          quantity: item.quantity,
          index: index + 1,
          productId: item.productId,
          price: item.price || 0,
          description: item.description,
        })) || [],
        address: `${order.userAddress.addressLine1}, ${order.userAddress.city} ${order.userAddress.postalCode}`,
        restaurantName: order.businessName || 'Your Restaurant Name',
        deliveryPartnerName: order.deliveryPartnerName || 'delivery Boy name',
        deliveryPartnerMobileNumber : order.deliveryPartnerMobileNumber || 'delivery Boy number',
      }));

      this.totalItems = response.data.totalElements || 0;
      this.currentPageIndex = response.data.number || 0;

      const orderId = orderIdParam ? parseInt(orderIdParam, 10) : undefined;
      if (orderId) {
        const order = this.tableData.find(o => o.id === orderId);
        if (order) {
          this.openOrderDetails(order);
        } else {
          this.snackBar.open('Order not found', 'Close', { duration: 3000 });
          this.closeOrderDetailsPanel();
        }
      } else if (this.selectedOrder && !this.tableData.some(order => order.id === this.selectedOrder?.id)) {
        this.closeOrderDetailsPanel();
      }
    } else {
      this.snackBar.open('Failed to fetch orders: Invalid response', 'Close', { duration: 3000 });
    }
    this.loading = false;
    this.cdr.markForCheck();
  }

  private handleFetchOrdersError(): void {
    this.snackBar.open('Failed to fetch orders', 'Close', { duration: 3000 });
    this.loading = false;
    this.cdr.markForCheck();
  }

  fetchOrders(page: number = 0, orderId?: number): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.orderService.getPlacedOrders(page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.handleFetchOrdersSuccess(response, orderId?.toString()),
        error: () => this.handleFetchOrdersError(),
      });
  }

  onPageChange(page: number): void {
    this.currentPageIndex = page;
    this.expandedOrderId = null;
    this.closeOrderDetailsPanel();
    this.fetchOrders(page);
  }

  applyFilter(): void { }

  toggleFilter(): void { }

  get pendingOrdersCount(): number {
    return this.tableData.filter(order => ['PLACED', 'CONFIRMED'].includes(order.orderStatus)).length;
  }

  formatOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      PLACED: 'New',
      CONFIRMED: 'Confirmed',
      PREPARING: 'Preparing',
    };
    return statusMap[status] || status.replace(/_/g, ' ');
  }

  getOrderStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatUpdatedDate(dateString: string): string {
    if (!dateString) return 'Unknown time';
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return 'Invalid time';
      return formatDistanceToNow(new Date(date.getTime() + (5.5 * 60 * 60 * 1000)), {
        addSuffix: true,
        includeSeconds: true,
        locale: enIN,
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Error in time';
    }
  }

  handleAcceptClick(order: any): void {
    const actionDialogRef = this.dialog.open(OrderActionComponent, {
      width: '400px',
      data: { order, action: 'approve' },
    });

    actionDialogRef.afterClosed().pipe(
      switchMap(actionResult => {
        if (!actionResult) return from([]);

        const preparationTime = actionResult.notes;
        const minutes = preparationTime.split(':')[1];
        const formattedPreparationTime = minutes.padStart(2, '0');

        return this.orderService.updateOrderStatus(order.orderNumber, 'PREPARING', formattedPreparationTime, '').pipe(
          switchMap(approveResult => {
            if (!approveResult) {
              this.snackBar.open('Failed to approve order', 'Close', { duration: 3000 });
              return from([]);
            }
            return this.handlePrintAndMarkKot({
              orderType: 'delivery',
              recentlyUpdatedItems: order.orderItems, 
              restaurantName: order.restaurantName,
              orderNumber: order.orderNumber,
              orderId: order.id,
              status: 'New Order',
            }, order.id);
          }),
          takeUntil(this.destroy$)
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (printResult) => {
        if (printResult?.success) {
          this.snackBar.open('Order accepted successfully and print sent to kitchen', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(`Print failed: ${printResult?.error || 'Unknown error'}`, 'Close', { duration: 3000 });
        }
        this.fetchOrders(this.currentPageIndex, this.selectedOrder?.id);
      },
      error: (error: any) => {
        this.snackBar.open(`Error: ${error.message || 'An error occurred'}`, 'Close', { duration: 3000 });
        this.fetchOrders(this.currentPageIndex, this.selectedOrder?.id);
      }
    });
  }

  openOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.isOrderDetailsPanelOpen = true;
    this.expandedOrderId = order.id;
    this.cdr.markForCheck();
  }

  closeOrderDetailsPanel(): void {
    this.isOrderDetailsPanelOpen = false;
    this.selectedOrder = null;
    this.expandedOrderId = null;
    this.cdr.markForCheck();
  }

  rejectOrder(order: Order, notes: string, updatedBy: string): void {
    this.dialog.open(OrderActionComponent, {
      width: '400px',
      data: { order, action: 'reject' },
    })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.orderService.updateOrderStatus(order.orderNumber, 'REJECTED', result.notes, result.updatedBy)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Order rejected successfully', 'Close', { duration: 3000 });
                this.fetchOrders(this.currentPageIndex);
                if (this.selectedOrder?.id === order.id) this.closeOrderDetailsPanel();
              },
              error: () => this.snackBar.open('Failed to reject order', 'Close', { duration: 3000 }),
            });
        }
      });
  }

  performKotAction(order: any): void {
    this.handlePrintAndMarkKot({
      orderType: 'delivery',
      recentlyUpdatedItems: order.itemsArray,
      restaurantName: order.restaurantName,
      orderNumber: order.orderNumber,
      orderId: order.id,
      status: 'New Order',
    }, order.id).subscribe(printResult => {
      if (printResult.success) {
        this.snackBar.open(`KOT printed for order ${order.orderNumber}`, 'Close', { duration: 3000 });
        this.orderService.updateOrderStatus(order.orderNumber, 'PREPARING', '', '')
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.status === 'success') {
                this.snackBar.open('Order status updated to PREPARING', 'Close', { duration: 3000 });
                this.fetchOrders(this.currentPageIndex, this.selectedOrder?.id);
              } else {
                this.snackBar.open('Failed to update order status after KOT', 'Close', { duration: 3000 });
              }
            },
            error: () => this.snackBar.open('Error updating order status after KOT', 'Close', { duration: 3000 }),
          });
      } else {
        this.snackBar.open(printResult.error || 'Print failed', 'Close', { duration: 3000 });
      }
    });
  }

  regenerateKot(order: any): void {
    this.dialog.open(AddDescriptionComponent, {
      width: '400px',
      data: { isPassword: true, action: 'regenerateKot' },
    })
      .afterClosed()
      .pipe(
        switchMap(password => {
          if (!password) return from([]);
          return this.orderService.regenerateKotOnline(order.orderNumber, password).pipe(
            switchMap(response => {
              if (response.status !== 'success') {
                this.snackBar.open('Invalid password or failed to regenerate KOT', 'Close', { duration: 3000 });
                return from([]);
              }
              return this.handlePrintAndMarkKot({
                orderType: 'delivery',
                recentlyUpdatedItems: order.itemsArray,
                restaurantName: order.restaurantName,
                orderNumber: order.orderNumber,
                orderId: order.id,
                status: 'New Order',
              }, order.id);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(printResult => {
        if (printResult?.success) {
          this.snackBar.open(`KOT regenerated and printed for order ${order.orderNumber}`, 'Close', { duration: 3000 });
        } else if (printResult?.error) {
          this.snackBar.open(printResult.error, 'Close', { duration: 3000 });
        }
      });
  }

  markOutForDelivery(order: any): void {
    this.orderService.updateOrderStatus(order.orderNumber, 'OUT_FOR_DELIVERY', '', '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.snackBar.open('Order marked as Out for Delivery', 'Close', { duration: 3000 });
            this.fetchOrders(this.currentPageIndex, this.selectedOrder?.id);
          } else {
            this.snackBar.open('Failed to update order status', 'Close', { duration: 3000 });
          }
        },
        error: () => this.snackBar.open('Failed to mark order as Out for Delivery', 'Close', { duration: 3000 }),
      });
  }

  markReadyForPickup(order: any): void {
    this.orderService.updateOrderStatus(order.orderNumber, 'READY_FOR_PICKUP', '0', '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.snackBar.open('Order marked as Ready for Pickup', 'Close', { duration: 3000 });
            this.fetchOrders(this.currentPageIndex, this.selectedOrder?.id);
          } else {
            this.snackBar.open('Failed to update order status', 'Close', { duration: 3000 });
          }
        },
        error: () => this.snackBar.open('Failed to mark order as Ready for Pickup', 'Close', { duration: 3000 }),
      });
  }

  private handlePrintAndMarkKot(data: any, orderId: number): Observable<{ success: boolean; error?: string }> {
    return this.kotPrintService.printAndMarkKot(data).pipe(
      switchMap(result => {
        if (result.success) {
          return of(result);
        }
        if (result.error === 'No default printer found') {
          return from(window.electronAPI.getPrinters()).pipe(
            switchMap(printers => {
              if (!printers) {
                this.snackBar.open('No printers available', 'Close', { duration: 3000 });
                return of({ success: false, error: 'No printers available' });
              }
              const dialogRef = this.dialog.open(PrinterSelectionComponent, {
                width: '400px',
                data: { printers }
              });
              return dialogRef.afterClosed().pipe(
                switchMap(selectedDeviceName => {
                  if (!selectedDeviceName) {
                    return of({ success: false, error: 'Printer selection cancelled' });
                  }
                  return this.kotPrintService.printAndMarkKot(data, selectedDeviceName);
                })
              );
            })
          );
        }
        return of(result);
      })
    );
  }
}
