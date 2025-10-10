import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NominatimResponse } from '../../model/interface.auth';

@Component({
  selector: 'app-location-dialog',
  standalone: false,
  templateUrl: './location-dialog.component.html',
  styleUrl: './location-dialog.component.scss'
})
export class LocationDialogComponent {
constructor(
    public dialogRef: MatDialogRef<LocationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NominatimResponse
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
