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

@Injectable({
  providedIn: 'root'
})
export class AdminService {

 http = inject(HttpClient);
 apiConfig = inject(ApiConfigService)
 

  getUnapprovedBusinesses(page: number, size: number): Observable<PaginatedResponse<Business>> {
     const getUnapprovedBusinessesUrl = this.apiConfig.getEndpoint('getUnapprovedBusinesses');
    return this.http.get<PaginatedResponse<Business>>(getUnapprovedBusinessesUrl);
  }

   getapprovedBusinesses(page: number, size: number): Observable<PaginatedResponse<Business>> {
     const getapprovedBusinessesUrl = this.apiConfig.getEndpoint('getapprovedBusinesses');
    return this.http.get<PaginatedResponse<Business>>(getapprovedBusinessesUrl);
  }

   approveBusiness(businessId: number): Observable<any> {
     const approveBusinessUrl = this.apiConfig.getEndpoint('approveBusiness');
    return this.http.put(`${approveBusinessUrl}${businessId}`, {});
  }

   updateBusinessStatus(businessId: number, enabled: boolean): Observable<any> {
     const updateBusinessStatusUrl = this.apiConfig.getEndpoint('updateBusinessStatus');
    return this.http.put(`${updateBusinessStatusUrl}${businessId}/status?enabled=${enabled}`, {}, { responseType: 'text' });
  }

   getCategories(): Observable<Category[]> {
    const getCategoriesUrl = this.apiConfig.getEndpoint('getCategorys');
    return this.http.get<Category[]>(getCategoriesUrl);
  }

   createCategory(formData: FormData): Observable<any> {
    const createCategoryUrl = this.apiConfig.getEndpoint('createCategory');
    return this.http.post(createCategoryUrl, formData);
  }

  deleteCategory(id: number): Observable<any> {
    const deleteCategoryUrl = this.apiConfig.getEndpoint('deleteItem');
    return this.http.delete(`${deleteCategoryUrl}${id}`);
  }
}
