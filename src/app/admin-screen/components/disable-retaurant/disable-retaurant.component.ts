import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../service/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenService } from '../../../core/service/token.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

interface TableBusiness {
  id: number;
  name: string;
  fssaiNumber: string;
  gstNumber: string;
  enabled: boolean;
}

@Component({
  selector: 'app-disable-retaurant',
  standalone: false,
  templateUrl: './disable-retaurant.component.html',
  styleUrl: './disable-retaurant.component.scss'
})
export class DisableRetaurantComponent implements OnInit{
  tableData: TableBusiness[] = [];
  totalItems = 0;
  currentPageIndex = 0;
  restaurantId : number | string = '';

  tableHeading = [
    { data: 'id', heading: 'Business ID' },
    { data: 'name', heading: 'Business Name' },
    { data: 'fssaiNumber', heading: 'FSSAI Number' },
    { data: 'gstNumber', heading: 'GST Number' },
    {data: 'primaryContact' , heading: 'Mobile Number'},
    { data: 'actions', heading: 'Disable' }
  ];
  tokenService = inject(TokenService)

  constructor(
    private service: AdminService,
    private snackBar: MatSnackBar,
    private readonly route : Router
  ) {}

  ngOnInit() {
    this.loadBusinesses();
  }

  loadBusinesses() {
    this.tokenService.show();
    this.service.getapprovedBusinesses(this.currentPageIndex, 10).pipe(
       finalize(() => {
        this.tokenService.hide();
       })
    ).subscribe({
      next: (response) => {
        this.tableData = response.status.content.map(business => ({
          id: business.id,
          name: business.businessName,
          fssaiNumber: business.attributes.find(attr => attr.attributeName === 'FSSAINumber')?.attributeValue || '--',
          gstNumber: business.attributes.find(attr => attr.attributeName === 'GSTNumber')?.attributeValue || '--',
          primaryContact: business.userDTO.primaryContact || '--',
          enabled: business.enabled
        }));
        this.totalItems = response.status.totalElements;
      },
      error: () => {
        this.tokenService.hide();
        this.snackBar.open('Error loading businesses', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(pageIndex: number) {
    this.currentPageIndex = pageIndex;
    this.loadBusinesses();
  }

  onSearch(query: string) {
    this.snackBar.open(`Search query not implemented: ${query}`, 'Close', { duration: 3000 });
  }

  onToggleEnable(business: TableBusiness, event: Event) {
    const enabled = (event.target as HTMLInputElement).checked;
    const previousState = business.enabled; 
    business.enabled = enabled; 
    this.tokenService.show();
    this.service.updateBusinessStatus(business.id, enabled).pipe(
      finalize(() => {
        this.tokenService.hide();
      })
    ).subscribe({
      next: (response) => {
        console.log('Response from updateBusinessStatus:', response);
        this.snackBar.open(`${enabled ? 'Enabled' : 'Disabled'} business ${business.name}`, 'Close', { duration: 3000 });
        this.loadBusinesses(); 
      },
      error: (error) => {
        this.tokenService.hide();
        console.error('Error updating business status:', error); 
        this.snackBar.open(`Failed to ${enabled ? 'enable' : 'disable'} business ${business.name}`, 'Close', { duration: 3000 });
        business.enabled = previousState;
      }
    });
  }

  navigateToReports(id: number | string) {
    this.route.navigate(['/adminScreen/adminLayout/reports', id])
  }

  navigateToComplaints(id: number | string) {
    this.route.navigate(['/adminScreen/adminLayout/complaints', id])
  }
  
}
