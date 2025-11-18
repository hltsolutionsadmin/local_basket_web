import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/service/api-config.service';

interface Address {
  id: number;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  postalCode: string;
  userId: number;
}

interface UserDTO {
  id: number;
  fullName: string;
  primaryContact: string;
  recentActivityDate: string;
  addresses: Address[];
  roles: string[];
}

interface Attribute {
  id: number;
  attributeName: string;
  attributeValue: string;
}

interface Business {
  id: number;
  businessName: string;
  approved: boolean;
  enabled: boolean;
  businessLatitude: number;
  businessLongitude: number;
  categoryName: string;
  creationDate: string;
  userDTO: UserDTO;
  attributes: Attribute[];
}

interface PaginatedResponse<T> {
  message: string;
  status: {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
  count: number;
}

interface Media {
  mediaType: string;
  url: string;
}

interface Category {
  id: number;
  name: string;
  media: Media[];
}


export interface DeliveryReportResponse {
  message: string;
  status: string;
  data: {
    periodLabel: string;
    assignedCount: number;
    deliveredCount: number;
    pendingCount: number;
    totalAmount: number;
    averageAmountPerDeliveredRide: number;
  }[];
}

export interface getDeliveryPartnersResponse {
  id: number
  fullName: string
  username: string
  email: string
  roles: Role[]
  primaryContact: string
  version: number
  skillrat: boolean
  yardly: boolean
  eato: boolean
  sancharalakshmi: boolean
  deliveryPartner: boolean
  b2bUnit: B2bUnit
  password: string
  permission: any[]
  registered: boolean
}

export interface Role {
  name: string
  id: number
}

export interface B2bUnit {
  id: number
  businessName: string
  approved: boolean
  enabled: boolean
}


@Injectable({
  providedIn: 'root'
})
export class AdminService {

 http = inject(HttpClient);
 apiConfig = inject(ApiConfigService)
 

  getUnapprovedBusinesses(page: number, size: number): Observable<PaginatedResponse<Business>> {
     const getUnapprovedBusinessesUrl = this.apiConfig.getEndpoint('BusinessEndpoint');
    return this.http.get<PaginatedResponse<Business>>(`${getUnapprovedBusinessesUrl}/byCategory?categoryName=Restaurant&approved=false&page=${page}&size=${size}`);
  }

   getapprovedBusinesses(page: number, size: number): Observable<PaginatedResponse<Business>> {
     const getapprovedBusinessesUrl = this.apiConfig.getEndpoint('BusinessEndpoint');
    return this.http.get<PaginatedResponse<Business>>(`${getapprovedBusinessesUrl}/byCategory?categoryName=Restaurant&approved=true&page=${page}&size=${size}`);
  }

   approveBusiness(businessId: number): Observable<any> {
     const approveBusinessUrl = this.apiConfig.getEndpoint('BusinessEndpoint');
    return this.http.put(`${approveBusinessUrl}/approve/${businessId}`, {});
  }

   updateBusinessStatus(businessId: number, enabled: boolean): Observable<any> {
     const updateBusinessStatusUrl = this.apiConfig.getEndpoint('BusinessEndpoint');
    return this.http.put(`${updateBusinessStatusUrl}/${businessId}/status?enabled=${enabled}`, {}, { responseType: 'text' });
  }

   getCategories(): Observable<Category[]> {
    const getCategoriesUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    return this.http.get<Category[]>(`${getCategoriesUrl}/categories`);
  }

   createCategory(formData: FormData): Observable<any> {
    const createCategoryUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    return this.http.post(`${createCategoryUrl}/api/products/create`, formData);
  }

  deleteCategory(id: number): Observable<any> {
    const deleteCategoryUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    return this.http.delete(`${deleteCategoryUrl}/categories/${id}`);
  }

  getDeliveryPartners(): Observable<getDeliveryPartnersResponse[]> {
    const baseUrl = this.apiConfig.getEndpoint('UserEndpoint') || '';
    return this.http.get<getDeliveryPartnersResponse[]>(`${baseUrl}/byRole?roleName=ROLE_DELIVERY_PARTNER`);
  }

  getDeliveryReports(params: {
    frequency: string;
    from: string;
    to: string;
    format: 'json' | 'excel';
    partnerUserId: number;
  }): Observable<DeliveryReportResponse> {
    const baseUrl = this.apiConfig.getEndpoint('deliveryReportsEndPoint') || '';
    const queryParams = new URLSearchParams({
      frequency: params.frequency.toLowerCase(),
      from: params.from,
      to: params.to,
      format: params.format,
      partnerUserId: params.partnerUserId.toString()
    }).toString();

    return this.http.get<DeliveryReportResponse>(
      `${baseUrl}/reports?${queryParams}`
    );
  }
}
