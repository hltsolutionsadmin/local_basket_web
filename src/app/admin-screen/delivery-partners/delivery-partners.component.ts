import { Component, inject } from '@angular/core';
import { AdminService, getDeliveryPartnersResponse } from '../service/admin.service';

@Component({
  selector: 'app-delivery-partners',
  standalone: false,
  templateUrl: './delivery-partners.component.html',
  styleUrl: './delivery-partners.component.scss'
})
export class DeliveryPartnersComponent {
 private readonly adminService = inject(AdminService);
  deliveryPartners: getDeliveryPartnersResponse [] = [];

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
}
