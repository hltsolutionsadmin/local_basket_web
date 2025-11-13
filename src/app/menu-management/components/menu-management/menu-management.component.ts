import { ChangeDetectorRef,Component,inject,OnDestroy,OnInit } from '@angular/core';
import { MenuManagementService } from '../../menuManagementService/menu-management.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, takeUntil } from 'rxjs/operators';
import { Items, MenuItemsResponse } from '../../models/interface.model';
import { TokenService } from '../../../core/service/token.service';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-menu-management',
  standalone: false,
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.scss']
})
export class MenuManagementComponent implements OnInit , OnDestroy {
  private readonly service = inject(MenuManagementService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly tokenService = inject(TokenService);

  private readonly itemsSubject = new BehaviorSubject<Items[]>([]);
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);
  private readonly totalElementsSubject = new BehaviorSubject<number>(0);
  private readonly searchSubject = new BehaviorSubject<string>('');
  private readonly destroy$ = new Subject<void>();

  isAddEditPanelOpen = false;
  selectedItemForPanel: Items | null = null;

  allItems$: Observable<Items[]> = this.itemsSubject.asObservable();
  totalElements$: Observable<number> = this.totalElementsSubject.asObservable();
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  tableHeading: Array<{ heading: string; data: string }> = [
    { heading: 'Item Code', data: 'itemCode' },
    { heading: 'Name', data: 'itemName' },
    { heading: 'Category', data: 'category' },
    { heading: 'Status', data: 'status' },
    { heading: 'Actions', data: 'actions' }
  ];

  pageIndex = 0;
  pageSize = 10;
  searchQuery = '';

  private searchSubscription = new Subscription();

  ngOnInit(): void {
    this.subscribeToSearch();
    this.loadMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubscription.unsubscribe();
  }

  private closePanel(): void {
    this.isAddEditPanelOpen = false;
    this.selectedItemForPanel = null;
    this.cdr.detectChanges();
  }

  onEdit(item: Items): void {
  this.isAddEditPanelOpen = true;
  this.selectedItemForPanel = null;
  this.cdr.detectChanges();

  // Delay assigning data until after the panel is rendered
  setTimeout(() => {
    this.selectedItemForPanel = { ...item };
    this.cdr.detectChanges();
  }, 0);
}

  openAddPanel(): void {
    this.selectedItemForPanel = null;
    this.cdr.detectChanges(); // force reset form
    this.isAddEditPanelOpen = true;
  }

  onAddEditFormSubmitted(success: boolean): void {
    this.closePanel();
    if (success) {
      this.snackBar.open('Item saved successfully!', 'Close', { duration: 3000 });
      this.resetSearch();
      this.loadMenuItems(true); // force refresh
    } else {
      this.snackBar.open('Failed to save item. Please try again.', 'Close', { duration: 3000 });
    }
  }

  onAddEditFormCancelled(): void {
    this.closePanel();
  }

  onSearch(query: any): void {
    this.searchSubject.next(query.target.value);
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

  onPageChange(pageIndex: number): void {
    if (this.pageIndex !== pageIndex) {
      this.pageIndex = pageIndex;
      this.loadMenuItems();
    }
  }

  onDelete(item: Items): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      disableClose: true,
      data: {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this item?'
      },
      panelClass: 'confirm-dialog-container'
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.deleteMenuItem(item.id);
      }
    });
  }

  private resetSearch(): void {
    this.searchQuery = '';
    this.pageIndex = 0;
    this.searchSubject.next('');
  }

  private loadMenuItems(forceRefresh = false): void {
    if (this.isLoadingSubject.value && !forceRefresh) return;

    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      this.snackBar.open('Restaurant ID not found.', 'Close', { duration: 3000 });
      return;
    }

    this.isLoadingSubject.next(true);
    this.tokenService.show();

    const request$ = this.searchQuery
      ? this.service.searchMenuItems(restaurantId, this.pageIndex, this.pageSize, this.searchQuery)
      : this.service.getMenuItems(restaurantId, this.pageIndex, this.pageSize);

    request$
      .pipe(
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
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ items, total }) => {
          this.itemsSubject.next([...items]); // new reference always
          this.totalElementsSubject.next(total);
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.tokenService.hide();
          const message = error.status === 400
            ? 'No matching items found.'
            : 'Failed to load items.';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.itemsSubject.next([]);
          this.totalElementsSubject.next(0);
          this.cdr.detectChanges();
        }
      });
  }

  private deleteMenuItem(id: any): void {
    this.isLoadingSubject.next(true);
    this.tokenService.show();

    this.service.deleteMenuItem(id)
      .pipe(
        finalize(() => {
          this.tokenService.hide();
          this.isLoadingSubject.next(false);
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully.', 'Close', { duration: 3000 });
          this.loadMenuItems(true);
        },
        error: (error: HttpErrorResponse) => {
          const message = error.status === 404
            ? 'Product not found.'
            : 'Failed to delete product.';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      });
  }

  private mapToItems(data: any[]): Items[] {
    return data.map(item => {
      const typeAttr = item.attributes?.find((a: any) => a.attributeName === 'type');
      const onlinePriceAttr = item.attributes?.find((a: any) => a.attributeName === 'onlinePrice');

      return {
        id: item.id,
        itemName: item.name ?? '',
        itemCode: item.shortCode ?? '',
        type: typeAttr?.attributeValue || 'N/A',
        category: item.categoryName ?? '',
        categoryId: item.categoryId,
        onlinePrice: onlinePriceAttr ? Number(onlinePriceAttr.attributeValue) : undefined,
        imgUrl: item.media?.[0]?.url,
        description: item.description ?? '',
        ignoreTax: item.ignoreTax ?? false,
        discount: item.discount ?? false,
        available: item.available !== undefined ? item.available : true,
        status: item.available ? 'Active' : 'Out of Stock',
        attributes: item.attributes ? [...item.attributes] : [],
        actions: ''
      } as Items;
    });
  }
}

