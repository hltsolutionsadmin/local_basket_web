import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string, navigateTo?: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

   onYesClick(): void {
    this.dialogRef.close(true);
    if (this.data.navigateTo) {
      this.router.navigate([this.data.navigateTo]);
    }
  }
}
