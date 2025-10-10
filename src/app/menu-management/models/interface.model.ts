export interface Items {
  id?: number;
  itemName?: string;
  itemCode?: string;
  itemPrice?: number;
  onlinePrice?: number;
  takeAwayPrice?: number;
  orderType?: string;
  type?: string;
  categoryId?: number;
  category?: string;
  description?: string;
  ignoreTax?: boolean;
  discount?: boolean;
  available?: boolean;
  imgUrl?: string;
  attributes?: ItemAttribute[];
  actions?:any;
}

export interface ItemAttribute {
  id?: number;
  attributeName: string;
  attributeValue: string;
}

export interface ItemMedia {
  mediaType: string;
  url: string;
}

export interface ProductPayload {
  id?: number;
  name: string;
  shortCode: string;
  ignoreTax: boolean;
  discount: boolean;
  description: string;
  price: number;
  available: boolean;
  businessId: number;
  categoryId: number;
  attributes?: { attributeName: string; attributeValue: string }[];
  mediaFiles?: File[];
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    shortCode: string;
    ignoreTax: boolean;
    discount: boolean;
    description: string;
    price: number;
    available: boolean;
    businessId: number;
    categoryId: number;
    categoryName: string;
    media: { mediaType: string; url: string }[];
    attributes: { id: number; attributeName: string; attributeValue: string }[];
  };
}

export interface MenuItemsResponse {
  success: boolean;
  message: string;
  data: {
    content: ProductResponse['data'][];
    pageable: {
      sort: any[];
      pageNumber: number;
      pageSize: number;
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: any[];
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
}

export interface Category {
  id: number;
  name: string;
}