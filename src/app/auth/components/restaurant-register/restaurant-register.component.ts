import { AfterViewInit, Component, inject, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { LocationData } from '../../model/interface.auth';
import { finalize, lastValueFrom } from 'rxjs';
import { TokenService } from '../../../core/service/token.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LocationDialogComponent } from '../location-dialog/location-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiConfigService } from '../../../core/service/api-config.service';
import { take } from 'rxjs/operators';
declare const google: any;

@Component({
  selector: 'app-restaurant-register',
  standalone: false,
  templateUrl: './restaurant-register.component.html',
  styleUrl: './restaurant-register.component.scss'
})

export class RestaurantRegisterComponent implements OnInit, AfterViewInit {
  private readonly DEFAULT_COORDINATES: google.maps.LatLngLiteral = { lat: 20.5937, lng: 78.9629 };
  private readonly ERROR_MESSAGES = {
    INVALID_FORM: 'Please fill all fields including location.',
    LOCATION_NOT_FOUND: 'Location not found.',
    MAP_NOT_READY: 'Map service not ready. Please try again.',
    REGISTRATION_FAILED: 'Something went wrong. Please try again.',
    RESTAURANT_EXISTS: 'Restaurant already onboarded.',
  };
  private readonly GOOGLE_MAPS_RETRY_INTERVAL = 1000;
  private readonly MAX_POSTAL_CODE_LENGTH = 6;
  private readonly PHONE_NUMBER_LENGTH = 10;

  // Form and state
  form: FormGroup;
  isSubmitting = false;
  isLoadingLocation = false;
  searchQuery = '';
  mapCenter: google.maps.LatLngLiteral = this.DEFAULT_COORDINATES;
  markerPosition: google.maps.LatLngLiteral = this.DEFAULT_COORDINATES;
  mapOptions: google.maps.MapOptions = {
    zoom: 5,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
  };
  markerOptions: google.maps.MarkerOptions = {
    draggable: true,
    animation: google.maps.Animation.DROP,
  };

  // Static data
  private readonly states = [{ name: 'Karnataka' }, { name: 'Andhra Pradesh' }, { name: 'Delhi' }];
  private readonly countries = [{ name: 'India' }];

  // Services
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  private readonly ngZone = inject(NgZone);
  private readonly dialog = inject(MatDialog);
  private readonly apiConfig = inject(ApiConfigService);

  private map: google.maps.Map | undefined;
  private geocoder: google.maps.Geocoder | undefined;

  constructor() {
    this.form = this.fb.group({
      businessName: ['', Validators.required],
      gstNumber: [''],
      fssaiNumber: [''],
      addressLine1: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.maxLength(this.MAX_POSTAL_CODE_LENGTH)]],
      contactNumber: ['', [Validators.required, Validators.minLength(this.PHONE_NUMBER_LENGTH), Validators.maxLength(this.PHONE_NUMBER_LENGTH)]],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.initializeFormWithDefaults();
  }

  ngAfterViewInit(): void {
    this.checkGoogleMaps();
  }

  private initializeFormWithDefaults(): void {
    const lat = parseFloat(this.form.get('latitude')?.value);
    const lng = parseFloat(this.form.get('longitude')?.value);
    if (!isNaN(lat) && !isNaN(lng)) {
      this.markerPosition = { lat, lng };
      this.mapCenter = this.markerPosition;
      this.reverseGeocode(this.markerPosition);
    }
  }

  private checkGoogleMaps(): void {
    if (typeof google === 'undefined' || !google.maps) {
      setTimeout(() => this.checkGoogleMaps(), this.GOOGLE_MAPS_RETRY_INTERVAL);
      return;
    }
    this.initMapService();
  }

  private initMapService(): void {
    this.geocoder ??= new google.maps.Geocoder();
  }

  onMapInitialized(nativeMap: google.maps.Map | undefined): void {
    this.map = nativeMap;
  }

  async onMapClick(event: google.maps.MapMouseEvent): Promise<void> {
    if (!event.latLng) return;
    const latLng: google.maps.LatLngLiteral = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    this.markerPosition = latLng;
    this.mapCenter = latLng;
    await this.reverseGeocode(latLng);
  }

  async onMarkerDragEnd(event: google.maps.MapMouseEvent): Promise<void> {
    if (!event.latLng) return;
    const latLng: google.maps.LatLngLiteral = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    this.markerPosition = latLng;
    await this.reverseGeocode(latLng);
  }

  async onSearchLocation(): Promise<void> {
    if (!this.searchQuery.trim()) {
      this.handleError(this.ERROR_MESSAGES.INVALID_FORM);
      return;
    }
    if (!this.geocoder) {
      this.handleError(this.ERROR_MESSAGES.MAP_NOT_READY);
      return;
    }

    this.isLoadingLocation = true;

    try {
      const results = await this.geocode({ address: this.searchQuery });
      if (results.length > 0) {
        const firstResult = results[0];
        const latLng: google.maps.LatLngLiteral = {
          lat: firstResult.geometry.location.lat(),
          lng: firstResult.geometry.location.lng(),
        };
        this.mapCenter = latLng;
        this.markerPosition = latLng;
        this.openLocationConfirmationDialog(firstResult);
      } else {
        this.handleError(this.ERROR_MESSAGES.LOCATION_NOT_FOUND);
      }
    } catch (error) {
      this.handleError(this.ERROR_MESSAGES.LOCATION_NOT_FOUND);
    } finally {
      this.isLoadingLocation = false;
    }
  }

  private async reverseGeocode(latLng: google.maps.LatLngLiteral): Promise<void> {
    if (!this.geocoder) {
      this.handleError(this.ERROR_MESSAGES.MAP_NOT_READY);
      return;
    }

    this.isLoadingLocation = true;

    try {
      const results = await this.geocode({ location: latLng });
      if (results.length > 0) {
        this.openLocationConfirmationDialog(results[0]);
      } else {
        this.handleError(this.ERROR_MESSAGES.LOCATION_NOT_FOUND);
      }
    } catch (error) {
      this.handleError(this.ERROR_MESSAGES.LOCATION_NOT_FOUND);
    } finally {
      this.isLoadingLocation = false;
    }
  }

  private geocode(request: google.maps.GeocoderRequest): Promise<google.maps.GeocoderResult[]> {
    return new Promise((resolve, reject) => {
      this.geocoder!.geocode(request, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        this.ngZone.run(() => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results);
          } else {
            reject(status);
          }
        });
      });
    });
  }

  private openLocationConfirmationDialog(result: google.maps.GeocoderResult): void {
    const addressComponents = result.address_components;

    const getAddressComponent = (type: string, long = true): string => {
      const component = addressComponents.find((comp) => comp.types.includes(type));
      return component ? (long ? component.long_name : component.short_name) : 'N/A';
    };

    const dialogData: LocationData = {
      display_name: result.formatted_address,
      address: {
        road: getAddressComponent('route'),
        city:
          getAddressComponent('locality') ||
          getAddressComponent('administrative_area_level_2') ||
          getAddressComponent('political_sublocality') ||
          'N/A',
        state: getAddressComponent('administrative_area_level_1'),
        country: getAddressComponent('country'),
        postcode: getAddressComponent('postal_code'),
      },
      lat: result.geometry.location.lat(),
      lon: result.geometry.location.lng(),
      _fullGoogleResult: result,
    };

    this.dialog
      .open(LocationDialogComponent, { width: '400px', data: dialogData })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.populateFormFields(dialogData);
        }
      });
  }

  private populateFormFields(locationData: LocationData): void {
    const { display_name, address, lat, lon } = locationData;
    const updates = {
      addressLine1: display_name,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postcode,
      latitude: lat.toString(),
      longitude: lon.toString(),
    };

    this.form.patchValue(updates);
    Object.keys(updates).forEach((key) => {
      const control = this.form.get(key);
      control?.markAsDirty();
      control?.markAsTouched();
    });
    this.form.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.handleError(this.ERROR_MESSAGES.INVALID_FORM);
      return;
    }

    this.isSubmitting = true;
    this.tokenService.show();

    const fv = this.form.value;
    const formData = new FormData();
    formData.append('businessName', fv.businessName);
    formData.append('categoryId', String(1));
    formData.append('addressLine1', fv.addressLine1);
    formData.append('city', fv.city);
    formData.append('state', typeof fv.state === 'object' ? fv.state.name : fv.state);
    formData.append('country', typeof fv.country === 'object' ? fv.country.name : fv.country);
    formData.append('postalCode', fv.postalCode);
    formData.append('latitude', String(fv.latitude));
    formData.append('longitude', String(fv.longitude));
    formData.append('contactNumber', fv.contactNumber);

    let attrIndex = 0;
    if (fv.gstNumber) {
      formData.append(`attributes[${attrIndex}].attributeName`, 'GSTNumber');
      formData.append(`attributes[${attrIndex}].attributeValue`, fv.gstNumber);
      attrIndex++;
    }
    if (fv.fssaiNumber) {
      formData.append(`attributes[${attrIndex}].attributeName`, 'FSSAINumber');
      formData.append(`attributes[${attrIndex}].attributeValue`, fv.fssaiNumber);
      attrIndex++;
    }
    formData.append(`attributes[${attrIndex}].attributeName`, 'onlineAvailablility');
    formData.append(`attributes[${attrIndex}].attributeValue`, 'false');

    try {
      await lastValueFrom(
        this.authService.restaurentRegistration(formData).pipe(take(1), finalize(() => this.tokenService.hide()))
      );
      await lastValueFrom(this.authService.assignRole().pipe(take(1)));
      alert('Restaurant onboarded successfully');
      await this.router.navigate(['/auth/approvalPending']);
    } catch (err: any) {
      this.handleError(err.status === 400 ? this.ERROR_MESSAGES.RESTAURANT_EXISTS : this.ERROR_MESSAGES.REGISTRATION_FAILED);
    } finally {
      this.isSubmitting = false;
    }
  }

  private handleError(message: string): void {
    this.tokenService.hide();
    alert(message);
    console.error(message);
  }
}