import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-kot-preview',
  standalone: false,
  templateUrl: './kot-preview.component.html',
  styleUrl: './kot-preview.component.scss'
})
export class KotPreviewComponent {
constructor(
    public dialogRef: MatDialogRef<KotPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onPrint(): void {
    window.print();
    this.dialogRef.close();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
