import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-order-action',
  standalone: false,
  templateUrl: './order-action.component.html',
  styleUrl: './order-action.component.scss'
})
export class OrderActionComponent {
  actionForm: FormGroup;
  
  constructor(
    public dialogRef: MatDialogRef<OrderActionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: any, action: 'approve' | 'reject' }
  ) {
    this.actionForm = new FormGroup({
      // Use form controls directly to handle value changes
      notes: new FormControl('', Validators.required),
      updatedBy: new FormControl('')
    });
  }

  // The updateNotes method is now only for the custom 'lib-hlt-text-area' component
  // It updates the form control's value without triggering another event
  updateNotes(value: string) {
    this.actionForm.get('notes')?.setValue(value.trim());
  }

  // Same as updateNotes, this method updates the form control value
  updateUpdatedBy(value: string) {
    this.actionForm.get('updatedBy')?.setValue(value.trim());
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.actionForm.valid) {
      // Pass the entire form value object back to the parent component
      this.dialogRef.close(this.actionForm.value);
    }
  }
}
