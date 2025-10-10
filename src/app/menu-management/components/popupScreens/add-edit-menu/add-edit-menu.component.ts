import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuManagementService } from '../../../menuManagementService/menu-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenService } from '../../../../core/service/token.service';
import { Category, Items } from '../../../models/interface.model';
import { finalize, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-add-edit-menu',
  standalone: false,
  templateUrl: './add-edit-menu.component.html',
  styleUrl: './add-edit-menu.component.scss'
})
export class AddEditMenuComponent implements OnInit , OnDestroy{
  selectedFiles: File[] = [];
  categories: Category[] = [];
  types = ['Veg', 'NonVeg', 'Eggs', 'Others'];
  orderTypes = [
    { value: 'DineIN', display: 'DineIN' },
    { value: 'Online', display: 'Online' },
    { value: 'TakeAway', display: 'TakeAway' },
    { value: 'DineIN&Online&TakeAway', display: 'DineIN,Online,TakeAway' }
  ];
  menuForm!: FormGroup;
  existingImageUrl: string | null = null;
  isCategoriesLoading: boolean = false;
  isEditMode: boolean = false;
  isTakeAwayPriceManuallyEdited: boolean = false;

  private orderTypeSubscription!: Subscription;
  private onlinePriceSubscription!: Subscription;

  @Input() data: Items | null = null;
  @Output() formSubmitted = new EventEmitter<boolean>();
  @Output() formCancelled = new EventEmitter<void>();

  service = inject(MenuManagementService);
  tokenService = inject(TokenService);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.initForm();

    if (this.data) {
      this.isEditMode = true;
    }

    this.loadCategories();

    this.orderTypeSubscription = this.menuForm.get('OrderType')?.valueChanges.subscribe(value => {
      this._applyPriceFieldLogic(value);
      // Reset manual edit flag when OrderType changes
      this.isTakeAwayPriceManuallyEdited = false;
    }) as Subscription;

    this.onlinePriceSubscription = this.menuForm.get('OnlinePrice')?.valueChanges.subscribe(value => {
      this._updateTakeAwayPrice(value);
    }) as Subscription;
  }

  ngOnDestroy(): void {
    if (this.orderTypeSubscription) {
      this.orderTypeSubscription.unsubscribe();
    }
    if (this.onlinePriceSubscription) {
      this.onlinePriceSubscription.unsubscribe();
    }
  }

  initForm() {
    this.menuForm = this.fb.group({
      id: [null],
      ItemName: ['', Validators.required],
      ItemCode: ['', Validators.required],
      ItemPrice: [null, [Validators.min(0)]],
      OnlinePrice: [null, [Validators.min(0)]],
      TakeAwayPrice: [null, [Validators.min(0)]],
      OrderType: ['', Validators.required],
      Type: [''],
      Category: ['', Validators.required],
      Description: [''],
      IgnoreTax: [false],
      IgnoreDiscount: [false],
      Available: [true],
      ItemStatusActive: [true],
      existingImage: [null],
    });

    if (!this.data) {
      this.menuForm.patchValue({
        Available: true,
        ItemStatusActive: true
      }, { emitEvent: false });

      this._applyPriceFieldLogic(this.menuForm.get('OrderType')?.value);
    }
  }

  loadCategories() {
    this.isCategoriesLoading = true;
    this.service.categoryMenu().subscribe({
      next: (res: Category[]) => {
        this.categories = res;
        this.isCategoriesLoading = false;
        if (this.isEditMode && this.data) {
          this.populateForm(this.data);
        }
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.categories = [{ id: 0, name: 'Add New Category' }];
        this.isCategoriesLoading = false;
        if (this.isEditMode && this.data) {
          this.populateForm(this.data);
        }
      }
    });
  }

  populateForm(item: Items) {
    const attributes = item.attributes || [];
    const onlinePriceAttr = attributes.find(attr => attr.attributeName === 'onlinePrice');
    const takeAwayPriceAttr = attributes.find(attr => attr.attributeName === 'takeAway');
    const orderTypeAttr = attributes.find(attr => attr.attributeName === 'orderType');
    const typeAttr = attributes.find(attr => attr.attributeName === 'type');

    const formValues = {
      id: item.id,
      ItemName: item.itemName ?? '',
      ItemCode: item.itemCode ?? '',
      ItemPrice: item.itemPrice != null ? Number(item.itemPrice) : null,
      OnlinePrice: onlinePriceAttr ? Number(onlinePriceAttr.attributeValue) : (item.onlinePrice != null ? Number(item.onlinePrice) : null),
      TakeAwayPrice: takeAwayPriceAttr ? Number(takeAwayPriceAttr.attributeValue) : (item.takeAwayPrice != null ? Number(item.takeAwayPrice) : null),
      OrderType: orderTypeAttr ? orderTypeAttr.attributeValue : (item.orderType && item.orderType !== 'N/A' ? item.orderType : ''),
      Type: typeAttr ? typeAttr.attributeValue : (item.type && item.type !== 'N/A' ? item.type : ''),
      Category: this.categories.find(cat => cat.id === item.categoryId)?.name || item.category || '',
      Description: item.description ?? '',
      IgnoreTax: item.ignoreTax ?? false,
      IgnoreDiscount: item.discount ?? false,
      Available: item.available !== undefined ? item.available : true,
      ItemStatusActive: item.available !== undefined ? item.available : true,
    };

    this.menuForm.patchValue(formValues, { emitEvent: false });

    // Set manual edit flag if TakeAwayPrice differs from OnlinePrice
    if (formValues.TakeAwayPrice != null && formValues.OnlinePrice != null && formValues.TakeAwayPrice !== formValues.OnlinePrice) {
      this.isTakeAwayPriceManuallyEdited = true;
    }

    this.existingImageUrl = item.imgUrl || null;

    this._applyPriceFieldLogic(formValues.OrderType);
    this.menuForm.updateValueAndValidity();
  }

  private _applyPriceFieldLogic(orderType: string): void {
    const itemPriceControl = this.menuForm.get('ItemPrice') as AbstractControl;
    const onlinePriceControl = this.menuForm.get('OnlinePrice') as AbstractControl;
    const takeAwayPriceControl = this.menuForm.get('TakeAwayPrice') as AbstractControl;

    const currentItemPriceValue = itemPriceControl.value;
    const currentOnlinePriceValue = onlinePriceControl.value;
    const currentTakeAwayPriceValue = takeAwayPriceControl.value;

    itemPriceControl.clearValidators();
    onlinePriceControl.clearValidators();
    takeAwayPriceControl.clearValidators();

    itemPriceControl.disable();
    onlinePriceControl.disable();
    takeAwayPriceControl.disable();

    if (orderType !== 'DineIN' && orderType !== 'DineIN&Online&TakeAway') {
      itemPriceControl.setValue(null, { emitEvent: false });
    }
    if (orderType !== 'Online' && orderType !== 'DineIN&Online&TakeAway') {
      onlinePriceControl.setValue(null, { emitEvent: false });
    }
    if (orderType !== 'TakeAway' && orderType !== 'DineIN&Online&TakeAway') {
      takeAwayPriceControl.setValue(null, { emitEvent: false });
    }

    switch (orderType) {
      case 'DineIN':
        itemPriceControl.setValidators([Validators.required, Validators.min(0)]);
        itemPriceControl.enable();
        break;
      case 'Online':
        onlinePriceControl.setValidators([Validators.required, Validators.min(0)]);
        onlinePriceControl.enable();
        break;
      case 'TakeAway':
        takeAwayPriceControl.setValidators([Validators.required, Validators.min(0)]);
        takeAwayPriceControl.enable();
        break;
      case 'DineIN&Online&TakeAway':
        itemPriceControl.setValidators([Validators.required, Validators.min(0)]);
        onlinePriceControl.setValidators([Validators.required, Validators.min(0)]);
        takeAwayPriceControl.setValidators([Validators.required, Validators.min(0)]);
        itemPriceControl.enable();
        onlinePriceControl.enable();
        takeAwayPriceControl.enable();
        break;
      case '':
      default:
        break;
    }

    if (itemPriceControl.enabled && currentItemPriceValue != null) {
      itemPriceControl.setValue(currentItemPriceValue, { emitEvent: false });
    }
    if (onlinePriceControl.enabled && currentOnlinePriceValue != null) {
      onlinePriceControl.setValue(currentOnlinePriceValue, { emitEvent: false });
    }
    if (takeAwayPriceControl.enabled && currentTakeAwayPriceValue != null) {
      takeAwayPriceControl.setValue(currentTakeAwayPriceValue, { emitEvent: false });
    }

    itemPriceControl.updateValueAndValidity();
    onlinePriceControl.updateValueAndValidity();
    takeAwayPriceControl.updateValueAndValidity();
  }

  private _updateTakeAwayPrice(onlinePrice: number | null): void {
    if (this.menuForm.get('OrderType')?.value === 'DineIN&Online&TakeAway' && onlinePrice != null && !this.isTakeAwayPriceManuallyEdited) {
      const takeAwayPriceControl = this.menuForm.get('TakeAwayPrice');
      takeAwayPriceControl?.setValue(Number(onlinePrice), { emitEvent: false });
    }
  }

  onTakeAwayPriceInput(): void {
    this.isTakeAwayPriceManuallyEdited = true;
  }

  onWheel(event: WheelEvent) {
    (event.target as HTMLInputElement).blur();
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;
    this.selectedFiles = Array.from(files);
    if (this.selectedFiles.length > 0) {
      this.existingImageUrl = URL.createObjectURL(this.selectedFiles[0]);
    } else if (!this.data) {
      this.existingImageUrl = '';
    } else if (this.isEditMode && this.data.imgUrl) {
      this.existingImageUrl = this.data.imgUrl;
    }
  }

  onSubmit() {
    this.tokenService.show();
    if (this.menuForm.valid) {
      const orderType = this.menuForm.get('OrderType')?.value;
      const formData = new FormData();
      const formValue = this.menuForm.getRawValue();

      const restaurantId = localStorage.getItem('restaurantId');

      formData.append('name', formValue.ItemName);
      formData.append('shortCode', formValue.ItemCode);
      formData.append('ignoreTax', formValue.IgnoreTax ? 'true' : 'false');
      formData.append('discount', formValue.IgnoreDiscount ? 'true' : 'false');
      formData.append('description', formValue.Description || '');
      formData.append('price', formValue.ItemPrice != null ? formValue.ItemPrice.toString() : '0');
      formData.append('available', formValue.ItemStatusActive ? 'true' : 'false');
      formData.append('productType', 'FOOD');
      formData.append('businessId', restaurantId || '');

      const selectedCategory = this.categories.find(cat => cat.name === formValue.Category);
      if (selectedCategory) {
        formData.append('categoryId', selectedCategory.id.toString());
      } else {
        this.tokenService.hide();
        this.showSnackBar('Selected category not found.');
        return;
      }

      if (formValue.id) {
        formData.append('id', formValue.id);
      }

      let attributeIndex = 0;
      if (formValue.OrderType) {
        formData.append(`attributes[${attributeIndex}].attributeName`, 'orderType');
        formData.append(`attributes[${attributeIndex}].attributeValue`, formValue.OrderType);
        attributeIndex++;
      }

      if (formValue.Type) {
        formData.append(`attributes[${attributeIndex}].attributeName`, 'type');
        formData.append(`attributes[${attributeIndex}].attributeValue`, formValue.Type);
        attributeIndex++;
      }

      if (this.menuForm.get('OnlinePrice')?.enabled && formValue.OnlinePrice != null) {
        formData.append(`attributes[${attributeIndex}].attributeName`, 'onlinePrice');
        formData.append(`attributes[${attributeIndex}].attributeValue`, formValue.OnlinePrice.toString());
        attributeIndex++;
      }

      if (this.menuForm.get('TakeAwayPrice')?.enabled && formValue.TakeAwayPrice != null) {
        formData.append(`attributes[${attributeIndex}].attributeName`, 'takeAway');
        formData.append(`attributes[${attributeIndex}].attributeValue`, formValue.TakeAwayPrice.toString());
      }

      if (this.selectedFiles.length > 0) {
        this.selectedFiles.forEach(file => {
          formData.append('mediaFiles', file);
        });
      }

      this.service.createOrUpdateProduct(formData).pipe(
        finalize(() => {
          this.tokenService.hide();
        })
      ).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showSnackBar('Item saved successfully!');
            this.formSubmitted.emit(true);
          } else {
            this.showSnackBar(response.message || 'Failed to save item.');
            console.error('Save item failed:', response);
            this.formSubmitted.emit(false);
          }
        },
        error: (error) => {
          if (error.status === 400) {
            this.showSnackBar('Product code already exists.');
          } else {
            this.showSnackBar('Error saving item.');
            console.error('Error saving item:', error);
          }
          this.formSubmitted.emit(false);
        }
      });
    } else {
      this.tokenService.hide();
      this.showSnackBar('Please fill in all required fields and correct errors.');
      this.menuForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.tokenService.hide();
    this.formCancelled.emit();
  }

  showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  onEnterKey(event: Event, nextElement: any) {
    if (nextElement?.focus) {
      event.preventDefault();
      nextElement.focus();
    }
  }

  suppressEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault();
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('formFileMultiple') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
  
}