import { Component, inject, OnInit } from '@angular/core';
import { AdminService, getDeliveryPartnersResponse } from '../../../service/admin.service';

@Component({
  selector: 'app-delivery-reports',
  standalone: false,
  templateUrl: './delivery-reports.component.html',
  styleUrl: './delivery-reports.component.scss'
})
export class DeliveryReportsComponent implements OnInit{
private readonly adminService = inject(AdminService);

  deliveryPartners: getDeliveryPartnersResponse[] = [];
  filteredPartners: getDeliveryPartnersResponse[] = [];

  selectedPartnerId: number | null = null;

  // Filter values
  period: string = 'DAILY';
  startDate: string = '';
  endDate: string = '';
  orderStatus: string = '';

  loading = false;

  ngOnInit(): void {
    this.getDeliveryPartners();
    this.setDefaultDateRange();
  }

  getDeliveryPartners() {
    this.adminService.getDeliveryPartners().subscribe((response) => {
      if (response) {
        this.deliveryPartners = response;
        this.filteredPartners = [...this.deliveryPartners];
      }
    });
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredPartners = this.deliveryPartners.filter(p =>
      p.fullName.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.primaryContact.includes(query)
    );
  }

  toggleReports(partnerId: number) {
    if (this.selectedPartnerId === partnerId) {
      this.selectedPartnerId = null;
    } else {
      this.selectedPartnerId = partnerId;
      this.resetFilters();
    }
  }

  setDefaultDateRange() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    this.endDate = `${yyyy}-${mm}-${dd}`;
    this.startDate = this.endDate; // default today for DAILY
  }

  resetFilters() {
    this.period = 'DAILY';
    this.orderStatus = '';
    this.setDefaultDateRange();
  }


  getStatusColor(status: string): string {
    const map: any = {
      'DELIVERED': '#28a745',
      'CANCELLED': '#dc3545',
      'PENDING': '#ffc107',
      'OUT_FOR_DELIVERY': '#fd7e14'
    };
    return map[status] || '#6c757d';
  }
}
