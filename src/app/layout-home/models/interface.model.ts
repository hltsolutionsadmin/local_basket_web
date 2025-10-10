export interface LoginUser {
    userName: string;
    password: string;
}
 //dining component
  export interface TableNumber {
    id: number;
    tableNumber: number;
  }

  export interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  location: string;
  status: string;
  orderId?: number;
  businessId: number;
  isAvailable: boolean;
  createdTime: string;
  updatedTime: string;
}

//dining component

export interface Item {
    id: string;
    name: string;
    quantity?: number;
    price: number;
    type: 'Veg' | 'Non-Veg' | 'Bevarage';
    categories : 'Starter'| 'Main Course' | 'Dessert' | 'Beverage' ;
  }

  //table menu component
 export interface Category {
  id: number;
  name: string;
}

 export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  unitPrice?: any;
  description?: string;
  sentToKot?: boolean;
  index?: number;
  // ignoreTax: boolean;
  ignoreTax: any;
  // originalQuantity: number;
  isModified?: boolean;
  tempQuantity?: number;
}

export interface TableMenuItem {
  isOrdered?: any;
  id: number;
  name: string;
  shortCode: string;
  price: number;
  categoryId: number;
  description: string;
  ignoreTax: boolean;
  media: { mediaType: string; url: string }[];
  attributes: { attributeName: string | null; attributeValue: string | null }[];
  quantity: number;
}

export interface OrderDetails {
  orderId: number;
  tableId: number;
  orderNumber: string;
  currentKotNumber: number;
  orderItems: OrderItem[];
  recentlyUpdatedItems: OrderItem[];
  serverName: string;
  restaurantName: string;
  status: string;
  kotHistoryNumbers: number[];
  totalAmount: number;
  businessDetails: { [key: string]: any };
}
//table menu component

//regenarate kot component
export interface KotSnapshot {
  id: number;
  kotNumber: number;
  productId: number;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  description: string;
  taxable: boolean;
  sentToKot: boolean;
  currentIndex?:any;
}

 export interface KotSlip {
  kotNumber: number;
  items: KotSnapshot[];
}
//regenarate kot component
  
//online order component

export interface Order {
  orderNumber: string;
  id: number;
  username: string;
  mobileNumber: string;
  orderStatus: string;
  notes: string | null;
  timmimgs: string | null;
  totalAmount: number;
  updatedDate: string;
  orderItems: OrderItem[];
  itemsArray: OrderItem[];
  address: string;
  restaurantName: string;
  deliveryPartnerId: string,
  deliveryPartnerName: string,
  deliveryPartnerMobileNumber: string,
  remainingPreparationTime: string;
  startTime: number | null;
}
//online order component


export interface OrderItemOnline {
  productName: string;
  quantity: number;
  price: number;
  unitPrice: number
}

export interface OrderOnline {
  id: number;
  orderNumber: string;
  username: string;
  orderStatus: string;
  orderItems: OrderItem[];
  timmimgs?: string;
  totalAmount: number;
  updatedDate: string;
  businessName: string;
}