import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { KotSlip } from '../../../models/interface.model';

@Component({
  selector: 'app-regenarate-kot',
  standalone: false,
  templateUrl: './regenarate-kot.component.html',
  styleUrl: './regenarate-kot.component.scss'
})
export class RegenarateKotComponent {
todayDateTime = new Date();
  currentIndex: any;
  kotSlips: KotSlip[] = [];
  isSingleKot: boolean;

  constructor(
    public dialogRef: MatDialogRef<RegenarateKotComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      currentIndex: number; kotSlips?: KotSlip[], items?: any[], tableId: number, kotNumber?: number, kotHistoryNumbers: number[], status: string, orderId?: number 
},
    private dialog: MatDialog
  ) {
    // Check if data is for single KOT (Regenerate KOT) or multiple KOTs (All KOTs)
    if (data.kotSlips) {
      this.kotSlips = data.kotSlips;
      this.currentIndex = data.currentIndex || 0;
      this.isSingleKot = false;
    } else {
      // For single KOT (Regenerate KOT)
      this.kotSlips = [{ kotNumber: data.kotNumber!, items: data.items! }];
      this.currentIndex = 0;
      this.isSingleKot = true;
    }
  }

  navigate(direction: 'prev' | 'next'): void {
    if (direction === 'prev' && this.currentIndex > 0) {
      this.currentIndex--;
    } else if (direction === 'next' && this.currentIndex < this.kotSlips.length - 1) {
      this.currentIndex++;
    }
  }

  onPrintKot(): void {
    const currentSlip = this.kotSlips[this.currentIndex];
    this.dialog.open(RegenarateKotComponent, {
      width: '500px',
      panelClass: 'kot-print-dialog',
      data: {
        orderType: 'dine-in',
        recentlyUpdatedItems: currentSlip.items,
        tableId: this.data.tableId,
        orderId: this.data.orderId,
        currentKotNumber: currentSlip.kotNumber,
        serverName: '', // Adjust if serverName is available
        status: this.data.status,
        kotHistoryNumbers: this.data.kotHistoryNumbers
      }
    }).afterClosed().subscribe((result: any) => {
      if (result?.action === 'printed') {
        this.dialogRef.close({ action: 'printed' });
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  get canGoPrev(): boolean {
    return !this.isSingleKot && this.currentIndex > 0;
  }

  get canGoNext(): boolean {
    return !this.isSingleKot && this.currentIndex < this.kotSlips.length - 1;
  }
}
