import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, firstValueFrom, interval, map, Observable, of, Subject, Subscription } from 'rxjs';
import { Order, UserRequest,BusinessResponse, BusinessRequest } from '../interface/eatoInterface';

export interface ApiConfig {
  baseUrl: string;
  endpoints: { [key: string]: string };
}

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private config: ApiConfig | null = null;

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    try {
      const config = await firstValueFrom(this.http.get<ApiConfig>('assets/api-config.json'));
      this.config = config;
    } catch (error) {
      throw new Error('Failed to load API configuration. Please check assets/api-config.json');
    }
  }

  getEndpoint(key: string): string {
    if (!this.config) {
      throw new Error('API config not loaded. Call loadConfig() first.');
    }
    const relativePath = this.config.endpoints[key];
    if (!relativePath) {
      throw new Error(`Endpoint '${key}' not found in API configuration.`);
    }
    return `${this.config.baseUrl}${relativePath}`;
  }

  // pooling logic starts

  

  getRestaurantProfile(businessId: string): Observable<BusinessResponse> {
    const getProfileUrl = 'https://kovela.app/usermgmt/business/';
    // const getProfileUrl = this.getEndpoint('getRestaurantProfile');
    return this.http.get<BusinessResponse>(`${getProfileUrl}${businessId}`);
  }

  updateRestaurantProfile(businessId: string, data: BusinessRequest): Observable<any> {
    const updateProfileUrl = this.getEndpoint('restaurentRegister');
    return this.http.post(updateProfileUrl, data);
  }

  updateUserDetails(data: UserRequest): Observable<any> {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    if (data.email) {
      formData.append('email', data.email);
    }
    if (data.password) {
      formData.append('password', data.password);
    }
    const updateUserDetailsUrl = this.getEndpoint('updateUserDetails');
    return this.http.put(updateUserDetailsUrl, formData);
  }
}