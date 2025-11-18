import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MenuManagementService } from '../../../menu-management/menuManagementService/menu-management.service';

@Component({
  selector: 'app-complaints',
  standalone: false,
  templateUrl: './complaints.component.html',
  styleUrl: './complaints.component.scss'
})
export class ComplaintsComponent {
periodType: string = 'DAILY'; 
  fromDate: string = '';
  toDate: string = '';
  orderStatus: string = 'ALL_ORDERS';
  orderType: string = 'DELIVERY'; 
  orders: any[] = [];
  totalItems: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  isDownloading: boolean = false;
  loading: boolean = false;
  restaurantId: string | number = '';
  deliveryOrderStatuses = [
    { value: 'ALL_ORDERS', label: 'All Orders' },
    { value: 'PLACED', label: 'Placed' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PREPARING', label: 'Preparing' },
    { value: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  availableOrderStatuses: { value: string; label: string; }[] = this.deliveryOrderStatuses; 

  tableHeadings = [
    { heading: 'Order ID', data: 'orderNumber' },
    { heading: 'Date', data: 'createdDate' },
    { heading: 'Time', data: 'createdTime' },
    { heading: 'Order Type', data: 'orderType' },
    { heading: 'Total Amount', data: 'totalAmount' },
    { heading: 'Status', data: 'orderStatus' },
    { heading: 'Payment', data: 'paymentType' }
  ];

   private paramRoute = inject(ActivatedRoute);
   private destroy$ = new Subject<void>();

  constructor(private orderService: MenuManagementService) { 
     this.paramRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.restaurantId = id;
      }
    });
  }

  ngOnInit() {
    // Delivery-only: ensure statuses set correctly
    this.availableOrderStatuses = this.deliveryOrderStatuses;
    this.updateDateRange();
    this.fetchOrders();
  }

  updateDateRange(): void {
    if (this.periodType === 'NONE') {
      this.fromDate = '';
      this.toDate = '';
      return;
    }

    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (this.periodType) {
      case 'MONTHLY':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'ANNUALLY':
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date(today.getFullYear(), 11, 31);
        break;
      case 'DAILY':
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        to = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'QUARTERLY':
        from = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        to = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0);
        break;
    }

    this.fromDate = this.formatDate(from);
    this.toDate = this.formatDate(to);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Convert a UTC ISO date string to a Date object in IST (UTC+05:30)
  private toIST(dateString: string): Date | null {
    try {
      if (!dateString) return null;
      const utc = new Date(dateString);
      if (isNaN(utc.getTime())) return null;
      return new Date(utc.getTime() + 5.5 * 60 * 60 * 1000);
    } catch {
      return null;
    }
  }

  private formatISTDate(dateString: string): string {
    const ist = this.toIST(dateString);
    if (!ist) return 'N/A';
    return this.formatDate(ist);
  }

  private formatISTTime(dateString: string): string {
    const ist = this.toIST(dateString);
    if (!ist) return 'N/A';
    const hours = ist.getHours();
    const minutes = ist.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
  }

  // Delivery-only: no order type switching

  canSearch(): boolean {
    return !!this.fromDate && !!this.toDate && !!this.orderStatus;
  }

  onSearch(): void {
    if (this.canSearch()) {
      this.currentPage = 0;
      this.fetchOrders();
    } else {
      console.warn('Please select valid filters (From Date, To Date, Order Status).');
    }
  }

  onPageChange(page: number): void {
    if (this.canSearch() && page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchOrders();
    }
  }

  fetchOrders(): void {
    const params: any = {
      status: this.orderStatus === 'ALL_ORDERS' ? '' : this.orderStatus,
      orderType: 'DELIVERY',
      businessId: this.restaurantId,
      page: this.currentPage,
      size: this.pageSize,
    };

    if (this.periodType !== 'NONE') {
      params.frequency = this.periodType;
    }
    if (this.fromDate) {
      params.fromDate = this.fromDate;
    }
    if (this.toDate) {
      params.toDate = this.toDate;
    }

    console.log('Fetching orders with params:', params);

    this.orderService.getOrders('DELIVERY', params).subscribe({
      next: (response) => {
        if (response?.data?.content && Array.isArray(response.data.content)) {
          this.orders = response.data.content.map((order: any) => {
            const createdDate = this.formatISTDate(order.createdDate);
            const createdTime = this.formatISTTime(order.createdDate);
            let totalAmount = 'N/A';
            let orderStatus = 'N/A';
            let paymentType = 'N/A';

            // Delivery-only mapping
            totalAmount = order.totalAmount != null ? order.totalAmount : 'N/A';
            orderStatus = order.orderStatus || 'N/A';
            paymentType = 'Online';

            return {
              orderNumber: order.orderNumber || 'N/A',
              createdDate,
              createdTime,
              orderType: 'DELIVERY',
              totalAmount,
              orderStatus,
              paymentType
            };
          });
          this.totalItems = response.data.totalElements || 0;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        } else {
          console.warn('No valid content in API response:', response);
          this.orders = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('API Error:', error);
        this.orders = [];
        this.totalItems = 0;
        this.totalPages = 0;
        console.error('Failed to fetch orders. Please try again.');
        this.loading = false;
      }
    });
  }

  downloadExcel(): void {
    if (this.fromDate && this.toDate) {
      this.isDownloading = true;
      const params: any = {
        businessId: localStorage.getItem('restaurantId') || 'defaultBusinessId',
        fromDate: this.fromDate,
        toDate: this.toDate,
        orderType: this.orderType,
        status: this.orderStatus === 'ALL_ORDERS' ? '' : this.orderStatus,
      };

      if (this.periodType !== 'NONE') {
        params.frequency = this.periodType;
      }

      console.log('Downloading excel with params:', params);

      this.orderService.downloadExcelReport(this.orderType, params).subscribe({
        next: (response: Blob) => {
          const url = window.URL.createObjectURL(response);
          const link = document.createElement('a');
          link.href = url;
          link.download = `report_${this.fromDate}_${this.toDate}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.isDownloading = false;
        },
        error: (error) => {
          console.error('Excel Download Error:', error);
          console.error('Failed to download the Excel report.');
          this.isDownloading = false;
        }
      });
    } else {
      console.warn('Please select From Date and To Date to download the Excel report.');
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
