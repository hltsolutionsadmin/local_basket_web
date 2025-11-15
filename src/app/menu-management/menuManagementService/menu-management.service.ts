import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Category } from '../models/interface.model';
import { ApiConfigService } from '../../core/service/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class MenuManagementService {

  http = inject(HttpClient)
  apiConfig = inject(ApiConfigService)
  constructor() { }

  jsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });


  categoryMenu(): Observable<Category[]> {
    const getCategorysUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    return this.http.get<Category[]>(`${getCategorysUrl}/categories`, { headers: this.jsonHeaders });
  }


  getMenuItems(restaurantId: string, page: number, size: number): Observable<any> {
    const getMenuItemsUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    const url = `${getMenuItemsUrl}/api/products/restaurant/${restaurantId}?size=${size}&page=${page}`;
    return this.http.get<any>(url);
  }

  searchMenuItems(restaurantId: string, page: number, size: number, keyword: string = ''): Observable<any> {
    const searchMenuItemsUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    const url = `${searchMenuItemsUrl}/api/products/restaurant/${restaurantId}?size=${size}&page=${page}&keyword=${encodeURIComponent(keyword)}`;
    return this.http.get<any>(url);
  }

  createOrUpdateProduct(formData: FormData): Observable<any> {
    const addUpdateItemUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    return this.http.post(`${addUpdateItemUrl}/api/products/create`, formData);
  }

 deleteMenuItem(productId: number): Observable<any> {
  const deleteItemUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    return this.http.delete(`${deleteItemUrl}/api/products/delete/${productId}`);
  }

   toggleMenuItemAvailability(restaurantId: string, productId: any): Observable<any> {
    const itemAvailabilityUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    const url = `${itemAvailabilityUrl}/api/products/${productId}/toggle-availability`;
    return this.http.patch(url, {}, {
      headers: new HttpHeaders({
        'Business-Id': restaurantId
      })
    });
  }

  getOrders(orderType: string, params: any): Observable<any> {
    let queryParams = new HttpParams();

    if (params.frequency && params.frequency !== 'NONE') {
      queryParams = queryParams.set('frequency', params.frequency);
    }
    if (params.status) {
      queryParams = queryParams.set('orderStatus', params.status); // Use 'status' for dine-in API
    }
    queryParams = queryParams.set('businessId', params.businessId);
    if (params.fromDate) {
      queryParams = queryParams.set('fromDate', params.fromDate);
    }
    if (params.toDate) {
      queryParams = queryParams.set('toDate', params.toDate);
    }
    queryParams = queryParams.set('page', params.page);
    queryParams = queryParams.set('size', params.size);
    // if (params.orderType) {
    //   queryParams = queryParams.set('orderType', params.orderType);
    // }

    const url = this.apiConfig.getEndpoint('reportDelivery');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.get<any>(url, { headers, params: queryParams });
  }

  downloadExcelReport(orderType: string, params: any): Observable<Blob> {
    let queryParams = new HttpParams();

    if (params.frequency && params.frequency !== 'NONE') {
      queryParams = queryParams.set('frequency', params.frequency);
    }
    if (params.status) {
      queryParams = queryParams.set('orderStatus', params.status); // Use 'status' for dine-in API
    }
    queryParams = queryParams.set('restaurantId', params.businessId);
    queryParams = queryParams.set('fromDate', params.fromDate);
    queryParams = queryParams.set('toDate', params.toDate);
    // if (params.orderType) {
    //   queryParams = queryParams.set('orderType', params.orderType);
    // }

    const url = this.apiConfig.getEndpoint('reportDeliveryExcel');
    return this.http.get(url, { responseType: 'blob', params: queryParams });
  }

  getProductReports(params: any): Observable<any> {
    const getProductReportsUrl = this.apiConfig.getEndpoint('OrderEndpoint');
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      // Include all parameters, even if empty
      httpParams = httpParams.set(key, params[key] != null ? params[key].toString() : '');
    });
    return this.http.get(`${ getProductReportsUrl }/report/outlet-itemwise/paged`, { params: httpParams });
  }

   downloadProductReportsExcel(params: any): Observable<Blob> {
    const downloadProductReportsExcelUrl = this.apiConfig.getEndpoint('OrderEndpoint');
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key] != null ? params[key].toString() : '');
    });
    return this.http.get(`${downloadProductReportsExcelUrl}/report/outlet-itemwise/excel`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
