import { Component, inject } from '@angular/core';
import { ApiConfigService } from '../../service/api-config.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private apiConfig = inject(ApiConfigService);
  private businessId: string | null = localStorage.getItem('restaurantId');
  private originalProfile: { email: string; kotPassword: string; gstNumber: string; fssaiNumber: string; startTime: string; endTime: string; deliveryEnabled: boolean } = {
    email: '',
    kotPassword: '',
    gstNumber: '',
    fssaiNumber: '',
    startTime: '',
    endTime: '',
    deliveryEnabled: false
  };

  profile = {
    id: 0,
    name: '',
    phone: '',
    address: '',
    email: '',
    cuisine: '',
    startTime: '',
    endTime: '',
    gstNumber: '',
    fssaiNumber: '',
    kotPassword: '',
    deliveryEnabled: false,
    addressLine1: '',
    city: '',
    state: '',
    country: '',
    latitude: 0,
    longitude: 0
  };

  cuisines = ['Italian', 'Chinese', 'Indian', 'Mexican'];

  ngOnInit() {
    this.fetchProfileData();
  }

  fetchProfileData() {
    if (!this.businessId) {
      console.error('Business ID not found in localStorage');
      return;
    }
    this.apiConfig.getRestaurantProfile(this.businessId).subscribe({
      next: (response) => {
        this.profile.id = response.id;
        this.profile.name = response.businessName;
        this.profile.phone = response.userDTO.primaryContact;
        this.profile.email = response.userDTO.email;
        this.profile.address = `${response.addressDTO.addressLine1}, ${response.addressDTO.city}, ${response.addressDTO.postalCode}`;
        this.profile.addressLine1 = response.addressDTO.addressLine1;
        this.profile.city = response.addressDTO.city;
        this.profile.state = response.addressDTO.state;
        this.profile.country = response.addressDTO.country;
        this.profile.latitude = response.businessLatitude;
        this.profile.longitude = response.businessLongitude;

        response.attributes.forEach(attr => {
          if (attr.attributeName === 'GSTNumber') {
            this.profile.gstNumber = attr.attributeValue;
            this.originalProfile.gstNumber = attr.attributeValue;
          }
          if (attr.attributeName === 'FSSAINumber') {
            this.profile.fssaiNumber = attr.attributeValue;
            this.originalProfile.fssaiNumber = attr.attributeValue;
          }
          if (attr.attributeName === 'loginTime') {
            this.profile.startTime = attr.attributeValue;
            this.originalProfile.startTime = attr.attributeValue;
          }
          if (attr.attributeName === 'logoutTime') {
            this.profile.endTime = attr.attributeValue;
            this.originalProfile.endTime = attr.attributeValue;
          }
          if (attr.attributeName === 'onlineAvailablility') {
            this.profile.deliveryEnabled = attr.attributeValue === 'true';
            this.originalProfile.deliveryEnabled = attr.attributeValue === 'true';
          }
        });
      },
      error: (err) => {
        console.error('Error fetching profile data:', err);
      }
    });
  }

  saveChanges() {
    if (!this.businessId) {
      console.error('Business ID not found in localStorage');
      return;
    }

    // Check if user-related fields (email, kotPassword) have changed
    const userChanges = this.profile.email !== this.originalProfile.email || this.profile.kotPassword !== this.originalProfile.kotPassword;

    // Check if business-related fields have changed
    const businessChanges =
      this.profile.gstNumber !== this.originalProfile.gstNumber ||
      this.profile.fssaiNumber !== this.originalProfile.fssaiNumber ||
      this.profile.startTime !== this.originalProfile.startTime ||
      this.profile.endTime !== this.originalProfile.endTime ||
      this.profile.deliveryEnabled !== this.originalProfile.deliveryEnabled;

    // Call PUT API for user details if email or kotPassword changed
    if (userChanges) {
      const userRequest: { fullName: string; email?: string; password?: string; skillrat: string } = {
        fullName: this.profile.name,
        skillrat: 'true'
      };
      if (this.profile.email) {
        userRequest.email = this.profile.email;
      }
      if (this.profile.kotPassword) {
        userRequest.password = this.profile.kotPassword;
      }
      this.apiConfig.updateUserDetails(userRequest).subscribe({
        next: (response) => {
          console.log('User details updated successfully:', response);
          // Update original values after successful save
          this.originalProfile.email = this.profile.email;
          this.originalProfile.kotPassword = this.profile.kotPassword;
        },
        error: (err) => {
          console.error('Error updating user details:', err);
        }
      });
    }

    // Call POST API for business details if relevant fields changed
    if (businessChanges) {
      const businessRequest = {
        id: this.profile.id,
        businessName: this.profile.name,
        categoryId: 1,
        addressLine1: this.profile.addressLine1,
        city: this.profile.city,
        state: this.profile.state,
        country: this.profile.country,
        latitude: this.profile.latitude.toString(),
        longitude: this.profile.longitude.toString(),
        contactNumber: this.profile.phone,
        attributes: [
          {
            attributeName: 'GST Number',
            attributeValue: this.profile.gstNumber || ''
          },
          {
            attributeName: 'FSSAI Number',
            attributeValue: this.profile.fssaiNumber || ''
          },
          {
            attributeName: 'loginTime',
            attributeValue: this.profile.startTime
          },
          {
            attributeName: 'logoutTime',
            attributeValue: this.profile.endTime
          },
          {
            attributeName: 'onlineAvailablility',
            attributeValue: this.profile.deliveryEnabled ? 'true' : 'false'
          }
        ]
      };

      this.apiConfig.updateRestaurantProfile(this.businessId, businessRequest).subscribe({
        next: (response) => {
          console.log('Business profile updated successfully:', response);
          // Update original values after successful save
          this.originalProfile.gstNumber = this.profile.gstNumber;
          this.originalProfile.fssaiNumber = this.profile.fssaiNumber;
          this.originalProfile.startTime = this.profile.startTime;
          this.originalProfile.endTime = this.profile.endTime;
          this.originalProfile.deliveryEnabled = this.profile.deliveryEnabled;
          this.fetchProfileData();
        },
        error: (err) => {
          console.error('Error updating business profile:', err);
        }
      });
    }
  }
}
