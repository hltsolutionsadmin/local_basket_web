import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-box',
  standalone: false,
  templateUrl: './alert-box.component.html',
  styleUrl: './alert-box.component.scss'
})
export class AlertBoxComponent {
  constructor(
    public dialogRef: MatDialogRef<AlertBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
