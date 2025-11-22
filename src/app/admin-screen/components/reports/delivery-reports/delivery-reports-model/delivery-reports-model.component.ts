import { Component, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { format } from 'date-fns';
import { AdminService } from '../../../../service/admin.service';

interface ReportData {
  periodLabel: string;
  assignedCount: number;
  deliveredCount: number;
  pendingCount: number;
  totalAmount: number;
  averageAmountPerDeliveredRide: number;
}

@Component({
  selector: 'app-delivery-reports-model',
  standalone: false,
  templateUrl: './delivery-reports-model.component.html',
  styleUrls: ['./delivery-reports-model.component.scss']
})
export class DeliveryReportsModelComponent {
  @Input() partnerUserId!: number;

  reportData: ReportData[] = [];

  filterForm = new FormGroup({
    frequency: new FormControl<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('daily'),
    from: new FormControl(''),
    to: new FormControl('')
  });

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadReport(); // Load immediately with today + daily
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['partnerUserId'] && !changes['partnerUserId'].firstChange) {
      this.setDefaultDates();
      this.loadReport();
    }
  }

  private setDefaultDates(): void {
    const today = format(new Date(), 'yyyy-MM-dd');
    this.filterForm.patchValue({
      frequency: 'daily',
      from: today,
      to: today
    });
  }

  onSearch(): void {
    this.loadReport();
  }

  loadReport(): void {
    const { frequency, from, to } = this.filterForm.value;

    this.adminService.getReport({
      partnerUserId: this.partnerUserId,
      frequency: frequency!,
      from: from!,
      to: to!
    }).subscribe({
      next: (res) => this.reportData = res.data || [],
      error: () => this.reportData = []
    });
  }

  downloadExcel(): void {
    const { frequency, from, to } = this.filterForm.value;

    this.adminService.downloadExcelProper({
      partnerUserId: this.partnerUserId,
      frequency: frequency!,
      from: from!,
      to: to!
    });
  }
}
