import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-category',
  standalone: false,
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.scss'
})
export class AddCategoryComponent {
 addCategoryForm: FormGroup;
  mediaFiles: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<AddCategoryComponent>,
    private fb: FormBuilder
  ) {
    this.addCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.mediaFiles = input.files[0];
    }
  }

  onSave(): void {
    if (this.addCategoryForm.valid) {
      const name = this.addCategoryForm.get('name')?.value.trim();
      this.dialogRef.close({ name, mediaFiles: this.mediaFiles });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
