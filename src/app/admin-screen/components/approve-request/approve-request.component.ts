import { Component, inject } from '@angular/core';
import { AdminService } from '../../service/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { TokenService } from '../../../core/service/token.service';

interface TableBusiness {
  id: number;
  name: string;
  contact: string;
  address: string;
}

@Component({
  selector: 'app-approve-request',
  standalone: false,
  templateUrl: './approve-request.component.html',
  styleUrl: './approve-request.component.scss'
})
export class ApproveRequestComponent {
  tableData: any[] = [];
  totalItems = 0;
  currentPageIndex = 0;
  tokenService = inject(TokenService)

  tableHeading = [
    { data: 'id', heading: 'Business ID' },
    { data: 'name', heading: 'Business Name' },
    { data: 'fssaiNumber', heading: 'FSSAI Number' },
    { data: 'gstNumber', heading: 'GST Number' },
    { data: 'actions', heading: 'Actions' }
  ];

  constructor(
    private service: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadBusinesses();
  }

  loadBusinesses() {
    this.tokenService.show();
    this.service.getUnapprovedBusinesses(this.currentPageIndex, 10).pipe(
      finalize(() => {
        this.tokenService.hide();
      })
    ).subscribe({
      next: (response) => {
        this.tableData = response.status.content.map(business => ({
          id: business.id,
          name: business.businessName,
          fssaiNumber: business.attributes.find(attr => attr.attributeName === 'FSSAINumber')?.attributeValue || '--',
          gstNumber: business.attributes.find(attr => attr.attributeName === 'GSTNumber')?.attributeValue || '--'
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

  onApprove(business: TableBusiness) {
    this.tokenService.show();
    this.service.approveBusiness(business.id).pipe(
      finalize(() => {
        this.tokenService.hide();
      })
    ).subscribe({
      next: () => {
        this.snackBar.open(`Approved business ${business.name}`, 'Close', { duration: 3000 });
        this.loadBusinesses();
      },
      error: () => {
        this.tokenService.hide();
        this.snackBar.open(`Failed to approve business ${business.name}`, 'Close', { duration: 3000 });
      }
    });
  }
}
