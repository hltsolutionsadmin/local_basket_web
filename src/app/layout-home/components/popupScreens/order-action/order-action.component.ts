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
      // notes: new FormControl('', Validators.required),
      updatedBy: new FormControl('')
    });
  }

  updateNotes(value: string) {
    this.actionForm.get('notes')?.setValue(value.trim());
  }

 updateUpdatedBy(value: any) {
  const text = typeof value === 'string' ? value.trim() : '';
  this.actionForm.get('updatedBy')?.setValue(text);
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
