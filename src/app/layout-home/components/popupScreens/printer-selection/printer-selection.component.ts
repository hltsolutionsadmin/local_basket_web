import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-printer-selection',
  standalone: false,
  templateUrl: './printer-selection.component.html',
  styleUrl: './printer-selection.component.scss'
})
export class PrinterSelectionComponent {
selectedPrinter: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<PrinterSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { printers: any[] }
  ) {}

  onSelect(): void {
    this.dialogRef.close(this.selectedPrinter);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
