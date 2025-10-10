// ../../interface/eatoInterface.ts
export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  username: string; // Add this line
  mobileNumber: string;
  userAddress: {
    id: number;
    addressLine1: string;
    addressLine2: string;
    street: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
    postalCode: string;
    userId: number;
    isDefault: boolean;
  };
  businessId: number;
  businessName: string;
  shippingAddressId: number;
  notes: string;
  businessAddress: {
    id: number;
    addressLine1: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
    postalCode: string;
  };
  totalAmount: number;
  // totalTaxAmount: number;
  // taxInclusive: boolean;
  paymentStatus: string;
  paymentTransactionId: string;
  orderStatus: string;
  createdDate: string;
  updatedDate: string;
  deliveryPartnerId: string;
  orderItems: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    entryNumber: number;
    productName: string;
    media: { mediaType: string; url: string }[];
    taxAmount?: number;
    taxPercentage?: number;
    totalAmount?: number;
    taxIgnored: boolean;
  }[];
}
// profile screen

export interface Profile {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  cuisine: string;
  startTime: string;
  endTime: string;
  gstNumber: string;
  fssaiNumber: string;
  kotPassword: string;
  deliveryEnabled: boolean;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface UserRequest {
  fullName: string;
  email?: string;
  password?: string;
  skillrat: string;
}

export interface BusinessRequest {
  id: number;
  businessName: string;
  categoryId: number;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
  contactNumber: string;
  attributes: { attributeName: string; attributeValue: string }[];
}

// api config service interface

export interface OrderItem {
  productId: number;
  quantity: number;
  productName: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  businessId: number;
  businessName: string;
  shippingAddressId: number;
  totalAmount: number;
  totalTaxAmount?: number;
  taxInclusive?: boolean;
  paymentStatus: string;
  timmimgs?: string; 
  paymentTransactionId: string;
  orderStatus: string;
  createdDate: string;
  updatedDate: string;
  orderItems: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    entryNumber: number;
    productName: string;
    media: { mediaType: string; url: string }[];
    taxAmount?: number;
    taxPercentage?: number;
    totalAmount?: number;
    taxIgnored: boolean;
  }[];
}

interface Attribute {
  id?: number;
  attributeName: string;
  attributeValue: string ;
}

interface AddressDTO {
  id: number;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  postalCode: string;
}

interface UserDTO {
  email: string;
  id: number;
  fullName: string;
  primaryContact: string;
  lastLogOutDate: string;
  recentActivityDate: string;
  skillrat: boolean;
  yardly: boolean;
  eato: boolean;
  sancharalakshmi: boolean;
  roles: string[];
}


export interface BusinessResponse {
  id: number;
  businessName: string;
  approved: boolean;
  enabled: boolean;
  businessLatitude: number;
  businessLongitude: number;
  categoryName: string;
  creationDate: string;
  userDTO: UserDTO;
  addressDTO: AddressDTO;
  attributes: Attribute[];
  status: string;
}
