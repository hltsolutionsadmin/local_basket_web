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
  deliveryPartners: getDeliveryPartnersResponse [] = [];
  selectedPartner: getDeliveryPartnersResponse | null = null;

  constructor(){}

  ngOnInit(): void {
    this.getDeliveryPartners();
  }

  getDeliveryPartners() {
    this.adminService.getDeliveryPartners().subscribe((response: getDeliveryPartnersResponse[]) => {
      if(response) {
          this.deliveryPartners = response;
      }
    })
  }

  openReport(partner: getDeliveryPartnersResponse): void {
    this.selectedPartner = partner;
  }
}
