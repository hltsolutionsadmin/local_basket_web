import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuManagementService } from '../../../menuManagementService/menu-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenService } from '../../../../core/service/token.service';
import { Category, Items } from '../../../models/interface.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-add-edit-menu',
  standalone: false,
  templateUrl: './add-edit-menu.component.html',
  styleUrl: './add-edit-menu.component.scss'
})
export class AddEditMenuComponent implements OnInit , OnChanges {
  @Input() data: Items | null = null;
  @Output() formSubmitted = new EventEmitter<boolean>();
  @Output() formCancelled = new EventEmitter<void>();

  menuForm!: FormGroup;
  selectedFiles: File[] = [];
  existingImageUrl: string | null = null;
  categories: Category[] = [];
  types = ['Veg', 'NonVeg', 'Eggs', 'Others'];
  isEditMode = false;
  isCategoriesLoading = false;

  private readonly service = inject(MenuManagementService);
  private readonly tokenService = inject(TokenService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.isEditMode = !!this.data;
      this.initForm();
      this.loadCategories();
      if (this.data) {
        this.populateForm(this.data);
      }
    }
  }

  private initForm(): void {
    this.menuForm = this.fb.group({
      id: [null],
      ItemName: ['', Validators.required],
      ItemCode: ['', Validators.required],
      OnlinePrice: [null, [Validators.required, Validators.min(0)]],
      Type: [''],
      Category: ['', Validators.required],
      Description: [''],
      IgnoreTax: [false],
      IgnoreDiscount: [false],
      ItemStatusActive: [true],
      existingImage: [null]
    });
    this.existingImageUrl = null;
  }

  private loadCategories(): void {
    this.isCategoriesLoading = true;
    this.service.categoryMenu().subscribe({
      next: (res: Category[]) => {
        this.categories = res;
        this.isCategoriesLoading = false;
        if (this.isEditMode && this.data) {
          this.populateForm(this.data);
        }
      },
      error: () => {
        this.categories = [{ id: 0, name: 'Add New Category' }];
        this.isCategoriesLoading = false;
        if (this.isEditMode && this.data) {
          this.populateForm(this.data);
        }
      }
    });
  }

  private populateForm(item: Items): void {
    const attributes = item.attributes || [];
    const onlinePriceAttr = attributes.find(a => a.attributeName === 'onlinePrice' || a.attributeName === 'OnlinePrice');
    const typeAttr = attributes.find(a => a.attributeName === 'type');

    this.menuForm.patchValue({
      id: item.id,
      ItemName: item.itemName ?? '',
      ItemCode: item.itemCode ?? '',
      OnlinePrice: onlinePriceAttr
        ? Number(onlinePriceAttr.attributeValue)
        : (item.onlinePrice != null ? Number(item.onlinePrice) : null),
      Type: typeAttr ? typeAttr.attributeValue : (item.type && item.type !== 'N/A' ? item.type : ''),
      Category: this.categories.find(cat => cat.id === item.categoryId)?.name || item.category || '',
      Description: item.description ?? '',
      IgnoreTax: item.ignoreTax ?? false,
      IgnoreDiscount: item.discount ?? false,
      ItemStatusActive: item.available !== undefined ? item.available : true
    });

    this.existingImageUrl = item.imgUrl || null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = input.files ? Array.from(input.files) : [];
    this.existingImageUrl = this.selectedFiles[0]
      ? URL.createObjectURL(this.selectedFiles[0])
      : this.data?.imgUrl || null;
  }

  onSubmit(): void {
    this.tokenService.show();

    if (this.menuForm.invalid) {
      this.tokenService.hide();
      this.showSnackBar('Please fill in all required fields.');
      this.menuForm.markAllAsTouched();
      return;
    }

    const formValue = this.menuForm.getRawValue();
    const formData = new FormData();
    const restaurantId = localStorage.getItem('restaurantId');

    formData.append('name', formValue.ItemName);
    formData.append('shortCode', formValue.ItemCode);
    formData.append('ignoreTax', formValue.IgnoreTax ? 'true' : 'false');
    formData.append('discount', formValue.IgnoreDiscount ? 'true' : 'false');
    formData.append('description', formValue.Description || '');
    formData.append('available', formValue.ItemStatusActive ? 'true' : 'false');
    formData.append('productType', 'FOOD');
    formData.append('businessId', restaurantId || '');

    const selectedCategory = this.categories.find(cat => cat.name === formValue.Category);
    if (!selectedCategory) {
      this.tokenService.hide();
      this.showSnackBar('Selected category not found.');
      return;
    }
    formData.append('categoryId', selectedCategory.id.toString());

    if (formValue.id) formData.append('id', formValue.id);

    if (formValue.Type)
      formData.append(`attributes[0].attributeName`, 'type'),
        formData.append(`attributes[0].attributeValue`, formValue.Type);

    if (formValue.OnlinePrice != null)
      formData.append(`attributes[1].attributeName`, 'onlinePrice'),
        formData.append(`attributes[1].attributeValue`, formValue.OnlinePrice.toString());

    if (this.selectedFiles.length > 0)
      this.selectedFiles.forEach(file => formData.append('mediaFiles', file));

    this.service.createOrUpdateProduct(formData)
      .pipe(finalize(() => this.tokenService.hide()))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.showSnackBar('Item saved successfully!');
            this.formSubmitted.emit(true);
          } else {
            this.showSnackBar(res.message || 'Failed to save item.');
            this.formSubmitted.emit(false);
          }
        },
        error: (err) => {
          const msg = err.status === 400 ? 'Product code already exists.' : 'Error saving item.';
          this.showSnackBar(msg);
          console.error('Save error:', err);
          this.formSubmitted.emit(false);
        }
      });
  }

  onCancel(): void {
    this.tokenService.hide();
    this.formCancelled.emit();
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

   onEnterKey(event: Event, nextElement: any): void {
    if (nextElement?.focus) {
      event.preventDefault();
      nextElement.focus();
    }
  }

  suppressEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  onWheel(event: WheelEvent) {
    (event.target as HTMLInputElement).blur();
  }

  triggerFileInput(): void {
    const input = document.getElementById('formFileMultiple') as HTMLInputElement;
    input?.click();
  }
}