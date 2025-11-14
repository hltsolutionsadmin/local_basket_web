import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Location } from '@angular/common';
import { TokenService } from '../../service/token.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BusinessDetails } from '../../interface/eatoInterface';
import { Attribute } from '../../../auth/model/interface.auth';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
   animations: [
      trigger('slideInOut', [
        transition(':enter', [
          style({ transform: 'translateY(100%)', opacity: 0 }),
          animate('400ms ease-out', style({ transform: 'translateY(-20px)', opacity: 1 }))
        ]),
        transition(':leave', [
          animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
        ])
      ])
    ]
})
export class ProfileComponent implements OnInit{
  form: FormGroup;
  saving = false;

  // Read-only flags for conditionally editable fields
  gstReadOnly = true;
  fssaiReadOnly = true;

  private readonly location = inject(Location);
  private readonly tokenService = inject(TokenService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  private restaurantId = localStorage.getItem('restaurantId') || '';

  constructor() {
    this.form = this.fb.group({
      restaurantName: [{ value: '', disabled: true }],
      contactNumber: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
      gstNumber: [''],
      fssaiNumber: [''],
      openingTime: [''],
      closingTime: ['']
    });
  }

  ngOnInit(): void {
    this.loadBusinessDetails();
  }

  private loadBusinessDetails(): void {
    this.tokenService.getBusinessDetails(this.restaurantId).subscribe({
      next: (data: BusinessDetails) => {
        const gstValue = this.getAttributeValue(data.attributes, 'GSTNumber');
        const fssaiValue = this.getAttributeValue(data.attributes, 'FSSAINumber');
        const openingTimeValue = this.getAttributeValue(data.attributes, 'loginTime') || data.openingTime || '';
        const closingTimeValue = this.getAttributeValue(data.attributes, 'logoutTime') || data.closingTime || '';

        const address = data.addressDTO
          ? `${data.addressDTO.addressLine1}, ${data.addressDTO.city}, ${data.addressDTO.state} - ${data.addressDTO.postalCode}`
          : '';

        this.form.patchValue({
          restaurantName: data.businessName,
          contactNumber: data.contactNumber,
          address,
          gstNumber: gstValue,
          fssaiNumber: fssaiValue,
          openingTime: openingTimeValue,
          closingTime: closingTimeValue
        });

        // Only make GST/FSSAI editable if they are missing or empty
        this.gstReadOnly = !!gstValue;
        this.fssaiReadOnly = !!fssaiValue;

        // Enable editable fields
        this.form.get('gstNumber')?.[this.gstReadOnly ? 'disable' : 'enable']();
        this.form.get('fssaiNumber')?.[this.fssaiReadOnly ? 'disable' : 'enable']();
        this.form.get('openingTime')?.enable();
        this.form.get('closingTime')?.enable();
      },
      error: (err) => {
        console.error('Failed to load business details:', err);
        this.snackBar.open('Failed to load settings', 'Close', {
          duration: 4000,
          panelClass: ['snack-error']
        });
      }
    });
  }

  private getAttributeValue(attributes: Attribute[] = [], name: string): string {
    const attr = attributes.find(a => a.attributeName === name);
    return attr?.attributeValue?.trim() || '';
  }

  onCancel(): void {
    this.location.back();
  }

  save(): void {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    const formValue = this.form.getRawValue();
    const fd = new FormData();
    fd.append('id', String(this.restaurantId));

    let idx = 0;
    const gstCtrl = this.form.get('gstNumber');
    if (!this.gstReadOnly && gstCtrl?.dirty) {
      const v = (formValue.gstNumber || '').toString().trim();
      if (v) {
        fd.append(`attributes[${idx}].attributeName`, 'GSTNumber');
        fd.append(`attributes[${idx}].attributeValue`, v);
        idx++;
      }
    }

    const fssaiCtrl = this.form.get('fssaiNumber');
    if (!this.fssaiReadOnly && fssaiCtrl?.dirty) {
      const v = (formValue.fssaiNumber || '').toString().trim();
      if (v) {
        fd.append(`attributes[${idx}].attributeName`, 'FSSAINumber');
        fd.append(`attributes[${idx}].attributeValue`, v);
        idx++;
      }
    }

    const openCtrl = this.form.get('openingTime');
    if (openCtrl?.dirty) {
      const v = (formValue.openingTime || '').toString().trim();
      if (v) {
        fd.append(`attributes[${idx}].attributeName`, 'loginTime');
        fd.append(`attributes[${idx}].attributeValue`, v);
        idx++;
      }
    }

    const closeCtrl = this.form.get('closingTime');
    if (closeCtrl?.dirty) {
      const v = (formValue.closingTime || '').toString().trim();
      if (v) {
        fd.append(`attributes[${idx}].attributeName`, 'logoutTime');
        fd.append(`attributes[${idx}].attributeValue`, v);
        idx++;
      }
    }

    if (idx === 0) {
      this.saving = false;
      this.snackBar.open('No changes to save', 'Close', { duration: 2500 });
      return;
    }

    this.tokenService.upsertBusiness(fd).subscribe({
      next: () => {
        this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
        this.loadBusinessDetails();
        this.saving = false;
      },
      error: (err) => {
        console.error('Failed to save settings', err);
        this.snackBar.open('Failed to save settings', 'Close', { duration: 4000, panelClass: ['snack-error'] });
        this.saving = false;
      }
    });
  }
}
