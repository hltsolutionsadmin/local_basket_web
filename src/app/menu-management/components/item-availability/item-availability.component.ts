import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Items, MenuItemsResponse } from '../../models/interface.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, debounceTime, distinctUntilChanged, finalize, map, Observable, Subscription } from 'rxjs';
import { MenuManagementService } from '../../menuManagementService/menu-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenService } from '../../../core/service/token.service';
import { TimeToggleComponent } from '../popupScreens/time-toggle/time-toggle.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-item-availability',
  standalone: false,
  templateUrl: './item-availability.component.html',
  styleUrl: './item-availability.component.scss'
})
export class ItemAvailabilityComponent {
  private readonly tokenService = inject(TokenService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(MenuManagementService);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);
  private readonly itemsSubject = new BehaviorSubject<Items[]>([]);
  private readonly totalElementsSubject = new BehaviorSubject<number>(0);
  private readonly searchSubject = new BehaviorSubject<string>('');

  allItems$: Observable<Items[]> = this.itemsSubject.asObservable();
  totalElements$: Observable<number> = this.totalElementsSubject.asObservable();

  tableHeading = [
    { heading: 'Item Name', data: 'itemName' },
    { heading: 'Item Code', data: 'itemCode' },
    { heading: 'order Type', data: 'orderType' },
    { heading: 'Item Category', data: 'category' },
    { heading: 'Actions', data: 'actions' }
  ];

  pageIndex = 0;
  pageSize = 10;
  searchQuery = '';

  ngOnInit(): void {
    this.subscribeToSearch();
    this.loadMenuItems();
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    this.resetSearch();
  }

  private searchSubscription = new Subscription();

  onSearch(query: string): void {
    debugger
     this.searchSubject.next(query);
  }

  onPageChange(pageIndex: number): void {
    if (this.pageIndex !== pageIndex) {
      this.pageIndex = pageIndex;
      this.loadMenuItems();
    }
  }

  toggleAvailability(item: Items, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (!checked && item.available) { // Only show popup when unchecking
      this.showAvailabilityPopup(item);
    } else if (checked && !item.available) {
      this.updateAvailability(item, checked);
    }
  }

  private showAvailabilityPopup(item: Items): void {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(' ', ''); // 14:22
    const dialogRef = this.dialog.open(TimeToggleComponent, {
      width: '400px',
      data: { currentTime }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'off') {
        this.updateAvailability(item, false);
      } else if (result) {
        this.updateTimedAvailability(item, currentTime, result);
      } else {
        // User cancelled, revert checkbox
        const items = this.itemsSubject.getValue();
        const updatedItems = items.map(i => i.id === item.id ? { ...i, available: true } : i);
        this.itemsSubject.next(updatedItems);
      }
    });
  }

  private updateAvailability(item: Items, available: boolean): void {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      this.snackBar.open('Restaurant ID not found.', 'Close', { duration: 3000 });
      return;
    }

    this.tokenService.show();
    this.isLoadingSubject.next(true);
    this.cdr.detectChanges();

    this.service.toggleMenuItemAvailability(restaurantId, item.id).pipe(
      finalize(() => {
        this.tokenService.hide();
        this.isLoadingSubject.next(false);
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        const items = this.itemsSubject.getValue();
        const updatedItems = items.map(i => {
          if (i.id === item.id) {
            return { ...i, available, actions: i.actions, enabledTime: available ? new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(' ', '') : undefined, scheduledEndTime: undefined };
          }
          return i;
        });
        this.itemsSubject.next(updatedItems);
        this.snackBar.open('Item availability updated.', 'Close', { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        const message = error.status === 400 ? 'Invalid request to update availability.' : 'Failed to update availability.';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        const items = this.itemsSubject.getValue();
        const updatedItems = items.map(i => i.id === item.id ? { ...i, available: !available, actions: i.actions } : i);
        this.itemsSubject.next(updatedItems);
        this.cdr.detectChanges();
      }
    });
  }

  private updateTimedAvailability(item: Items, startTime: string, endTime: string): void {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      this.snackBar.open('Restaurant ID not found.', 'Close', { duration: 3000 });
      return;
    }

    this.tokenService.show();
    this.isLoadingSubject.next(true);
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('attributes[0].attributeName', 'startTime');
    formData.append('attributes[0].attributeValue', startTime);
    formData.append('attributes[1].attributeName', 'endTime');
    formData.append('attributes[1].attributeValue', endTime);

    this.http.post(`https://kovela.app/product/api/products/${item.id}/timings`, formData).pipe(
      finalize(() => {
        this.tokenService.hide();
        this.isLoadingSubject.next(false);
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        const items = this.itemsSubject.getValue();
        const updatedItems = items.map(i => i.id === item.id ? { ...i, available: false, actions: i.actions, scheduledEndTime: endTime } : i);
        this.itemsSubject.next(updatedItems);
        this.snackBar.open('Item availability scheduled.', 'Close', { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        const message = error.status === 400 ? 'Invalid request to schedule availability.' : 'Failed to schedule availability.';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        const items = this.itemsSubject.getValue();
        const updatedItems = items.map(i => i.id === item.id ? { ...i, available: true, actions: i.actions } : i);
        this.itemsSubject.next(updatedItems);
        this.cdr.detectChanges();
      }
    });
  }

  private subscribeToSearch(): void {
    this.searchSubscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(query => {
        this.searchQuery = query.trim();
        this.pageIndex = 0;
        this.loadMenuItems();
      })
    );
  }

  private resetSearch(): void {
    this.searchQuery = '';
    this.pageIndex = 0;
    this.searchSubject.next('');
  }

  private loadMenuItems(): void {
    if (this.isLoadingSubject.value) return;

    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      this.snackBar.open('Restaurant ID not found.', 'Close', { duration: 3000 });
      return;
    }

    this.tokenService.show();
    this.isLoadingSubject.next(true);
    this.cdr.detectChanges();

    const request$ = this.searchQuery
      ? this.service.searchMenuItems(restaurantId, this.pageIndex, this.pageSize, this.searchQuery)
      : this.service.getMenuItems(restaurantId, this.pageIndex, this.pageSize);

    request$.pipe(
      map((response: MenuItemsResponse) => {
        if (response.success && response.data?.content) {
          return {
            items: this.mapToItems(response.data.content),
            total: response.data.totalElements
          };
        }
        throw new Error('Invalid API response.');
      }),
      finalize(() => {
        this.tokenService.hide();
        this.isLoadingSubject.next(false);
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: ({ items, total }) => {
        this.itemsSubject.next(items);
        this.totalElementsSubject.next(total);
      },
      error: (error: HttpErrorResponse) => {
        const message = error.status === 400 ? 'No matching items found.' : 'Failed to load items.';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.itemsSubject.next([]);
        this.totalElementsSubject.next(0);
      }
    });
  }

  private mapToItems(data: any[]): Items[] {
    return data.map(item => {
      const typeAttr = item.attributes.find((a: any) => a.attributeName === 'type');
      const orderTypeAttr = item.attributes.find((a: any) => a.attributeName === 'orderType');
      const endTimeAttr = item.attributes.find((a: any) => a.attributeName === 'endTime');

      // Parse endTime and compare with current time
      let scheduledEndTime: string | undefined = undefined;
      let available = item.available !== undefined ? item.available : true;

      if (endTimeAttr?.attributeValue) {
        const endTime = endTimeAttr.attributeValue; // e.g., "16:55"
        const [hours, minutes] = endTime.split(':').map(Number);
        const now = new Date(); // Current date and time (e.g., 2025-06-20 17:11 IST)
        const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // Only set scheduledEndTime if available is false and endTime is in the future
        if (!available && endDateTime > now) {
          scheduledEndTime = endTime;
        } else if (endDateTime <= now && !available) {
          // If endTime has passed and available is false, set available to true
          available = true;
          this.syncBackendAvailability(item.id); // Optional: Sync backend
        }
      }

      return {
        id: item.id,
        itemName: item.name,
        itemCode: item.shortCode,
        type: typeAttr?.attributeValue || 'N/A',
        orderType: orderTypeAttr?.attributeValue || 'N/A',
        category: item.categoryName,
        categoryId: item.categoryId,
        itemPrice: item.price,
        onlinePrice: item.onlinePrice || undefined,
        imgUrl: item.media?.[0]?.url || 'assets/images/noImage.webp',
        description: item.description ?? '',
        ignoreTax: item.ignoreTax ?? false,
        discount: item.discount ?? false,
        available,
        actions: '',
        scheduledEndTime // Only set if available is false and endTime is in the future
      };
    });
  }

  // Optional: Method to sync backend when endTime has passed but available is false
  private syncBackendAvailability(itemId: number): void {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      console.warn('Restaurant ID not found for backend sync.');
      return;
    }

    // Update availability to true
    this.service.toggleMenuItemAvailability(restaurantId, itemId).subscribe({
      next: () => {
        console.log(`Item ${itemId} availability updated to true in backend.`);
      },
      error: (error: HttpErrorResponse) => {
        console.error(`Failed to update availability for item ${itemId}:`, error);
      }
    });

    // Clear endTime in backend (assuming an endpoint exists; adjust URL/method as needed)
    const formData = new FormData();
    formData.append('attributes[0].attributeName', 'endTime');
    formData.append('attributes[0].attributeValue', '');
    this.http.post(`https://skillrat.com/product/api/products/${itemId}/timings`, formData).subscribe({
      next: () => {
        console.log(`Item ${itemId} endTime cleared in backend.`);
      },
      error: (error: HttpErrorResponse) => {
        console.error(`Failed to clear endTime for item ${itemId}:`, error);
      }
    });
  }
}
