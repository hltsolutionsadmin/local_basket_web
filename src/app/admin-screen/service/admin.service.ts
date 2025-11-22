import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../core/service/api-config.service';
import { format } from 'date-fns';

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

export interface ComplaintItem {
  id: number;
  title: string;
  description: string;
  createdDt: string;
  createdBy: number;
  status: string;
  complaintType: string;
  assignedTo: number | null;
  assignedOn: string | null;
  orderId: string | null;
  businessId: number;
  orderdetails: any;
  createdByName: string;
  createdByMobile: string;
  deliveryPartnerName: string;
  deliveryPartnerMobileNumber: string;
}

export interface ComplaintsResponse {
  message: string;
  status: string;
  data: {
    content: ComplaintItem[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface ComplaintItem {
  id: number;
  title: string;
  description: string;
  createdDt: string;
  createdBy: number;
  status: string;
  complaintType: string;
  orderId: string | null;
  businessId: number;
  createdByName: string;
  createdByMobile: string;
  deliveryPartnerName: string;
  deliveryPartnerMobileNumber: string;
}

export interface ComplaintsResponse {
  message: string;
  status: string;
  data: {
    content: ComplaintItem[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  http = inject(HttpClient);
  apiConfig = inject(ApiConfigService)
  private readonly baseUrl = 'https://kovela.app/delivery/api/partners/reports';
  private readonly complaintsUrl = 'https://kovela.app/order/api/orders/complaints/filter';
  //private readonly complaintsUrl = 'https://kovela.app/order/api/orders/complaints/filter';

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

  getReport(params: {
    partnerUserId: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
  }): Observable<DeliveryReportResponse> {

    let httpParams = new HttpParams()
      .set('partnerUserId', params.partnerUserId.toString())
      .set('frequency', params.frequency)
      .set('from', params.from)
      .set('to', params.to)
      .set('format', 'json');

    return this.http.get<DeliveryReportResponse>(this.baseUrl, { params: httpParams });
  }

  /**
   * Trigger Excel download (opens in new tab → auto download)
   */
 downloadExcelProper(params: {
  partnerUserId: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  from: string;
  to: string;
}): void {
  let httpParams = new HttpParams()
    .set('partnerUserId', params.partnerUserId.toString())
    .set('frequency', params.frequency)
    .set('from', params.from)
    .set('to', params.to)
    .set('format', 'excel');

  this.http.get(`${this.baseUrl}`, {
    params: httpParams,
    responseType: 'blob'  // Important!
  }).subscribe(blob => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const filename = `Delivery_Report_${params.frequency}_${params.from}_to_${params.to}.xlsx`;

    // Create a download link and click it
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  });
}

  getComplaints(params: { businessId: number | string; page: number; size: number }): Observable<ComplaintsResponse> {
    const httpParams = new HttpParams()
      .set('businessId', params.businessId.toString())
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    return this.http.get<ComplaintsResponse>(this.complaintsUrl, { params: httpParams });
  }
}
