export interface OtpRequestPayload {
  otpType:string,
  primaryContact: string
}

export interface ValidateOtpPayload {
  primaryContact: string;
  otp: string;
  fullName?: string;
}

export interface RestaurentRegister {
   businessName: string;
  categoryId: number;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  // businessLatitude: string;
  // businessLongitude: string;
  latitude: string;
  longitude: string;
  contactNumber: string;
  attributes: Attribute[];
}

export interface Attribute {
  attributeName: string;
  attributeValue: string;
}


export interface CurrentUser {
  id: number;
  phoneNumber: string;
  name: string;
  gstinCode: string;
  fssaiCode: string;
  address: string;
  isApproved: boolean;
  role: string;
}

export interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface NominatimSearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// restaurant register component interface
export interface LocationData {
  display_name: string;
  address: {
    road: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  lat: number;
  lon: number;
  _fullGoogleResult: google.maps.GeocoderResult;
}