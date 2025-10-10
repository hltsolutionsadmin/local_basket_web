import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-description',
  standalone: false,
  templateUrl: './add-description.component.html',
  styleUrl: './add-description.component.scss'
})
export class AddDescriptionComponent {
 newDescription: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddDescriptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { description: string, isPassword?: boolean, action?: string }
  ) {
    this.newDescription = this.data.isPassword ? '' : (this.data.description || '');
  }

  onDescriptionChange(value: string): void {
    this.newDescription = value;
  }

  onOkay(): void {
    const trimmedDescription = this.newDescription.trim();
    this.dialogRef.close(trimmedDescription || undefined);
    this.newDescription = ''; // Clear the field after submission
  }

  onCancel(): void {
    this.dialogRef.close();
    this.newDescription = ''; // Clear the field on cancel
  }
}
