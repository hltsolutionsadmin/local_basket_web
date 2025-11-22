import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminService, ComplaintItem } from '../../service/admin.service';

@Component({
  selector: 'app-complaints',
  standalone: false,
  templateUrl: './complaints.component.html',
  styleUrl: './complaints.component.scss'
})
export class ComplaintsComponent {
  complaints: ComplaintItem[] = [];
  businessId: number | string = '';
  loading = false;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  private paramRoute = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {
    this.paramRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.businessId = id;
        this.fetchComplaints();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchComplaints(): void {
    if (!this.businessId) {
      return;
    }
    this.loading = true;
    this.adminService.getComplaints({
      businessId: this.businessId,
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (res) => {
        this.complaints = res?.data?.content || [];
        this.totalElements = res?.data?.totalElements || 0;
        this.totalPages = res?.data?.totalPages || 0;
        this.loading = false;
      },
      error: () => {
        this.complaints = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.fetchComplaints();
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '-';
    const d = new Date(dateTime);
    if (isNaN(d.getTime())) return '-';
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date} • ${time}`;
  }
}
