import { Component } from '@angular/core';
import { MenuManagementService } from '../../../menuManagementService/menu-management.service';

@Component({
  selector: 'app-product-reports',
  standalone: false,
  templateUrl: './product-reports.component.html',
  styleUrl: './product-reports.component.scss'
})
export class ProductReportsComponent {
  periodType: string = 'DAILY';
  fromDate: string = '';
  toDate: string = '';
  orderType: string = 'DELIVERY';
  products: any[] = [];
  totalItems: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  isDownloading: boolean = false;
  loading: boolean = false;

  constructor(private productService: MenuManagementService) { }

  ngOnInit() {
    this.updateDateRange();
    this.fetchProducts();
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

  // Delivery-only: no order type switching

  canSearch(): boolean {
    return !!this.fromDate && !!this.toDate;
  }

  onSearch(): void {
    if (this.canSearch()) {
      this.currentPage = 0;
      this.fetchProducts();
    } else {
      console.warn('Please select valid filters (From Date, To Date).');
    }
  }

  onPageChange(page: number): void {
    if (this.canSearch() && page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchProducts();
    }
  }

  fetchProducts(): void {
    this.loading = true;
    const params: any = {
      startDate: this.fromDate,
      endDate: this.toDate,
      businessId: localStorage.getItem('restaurantId') || 'defaultBusinessId',
      type:  'online', // Always include type parameter
      page: this.currentPage,
      size: this.pageSize
    };

    if (this.periodType !== 'NONE') {
      params.frequency = this.periodType;
    }

    console.log('Fetching product reports with params:', params);

    this.productService.getProductReports(params).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response?.data?.content && Array.isArray(response.data.content)) {
          this.products = response.data.content.map((product: any) => ({
            productName: product.productName || 'N/A',
            quantity: product.quantity || 'N/A',
            categoryName: product.categoryName || 'N/A',
            grossSales: product.grossSales != null ? product.grossSales : 'N/A',
            total: product.total != null ? product.total : 'N/A',
            avg: product.avg != null ? product.avg.toFixed(2) : 'N/A'
          }));
          this.totalItems = response.data.totalElements || 0;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        } else {
          console.warn('No valid content in API response:', response);
          this.products = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('API Error:', error);
        this.products = [];
        this.totalItems = 0;
        this.totalPages = 0;
        console.error('Failed to fetch product reports. Please try again.');
        this.loading = false;
      }
    });
  }

  downloadExcel(): void {
    if (this.fromDate && this.toDate) {
      this.isDownloading = true;
      const params: any = {
        businessId: localStorage.getItem('restaurantId') || 'defaultBusinessId',
        startDate: this.fromDate,
        endDate: this.toDate,
        type: 'online'
      };

      if (this.periodType !== 'NONE') {
        params.frequency = this.periodType;
      }

      console.log('Downloading excel with params:', params);

      this.productService.downloadProductReportsExcel(params).subscribe({
        next: (response: Blob) => {
          const url = window.URL.createObjectURL(response);
          const link = document.createElement('a');
          link.href = url;
          link.download = `product_report_${this.fromDate}_${this.toDate}.xlsx`;
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
