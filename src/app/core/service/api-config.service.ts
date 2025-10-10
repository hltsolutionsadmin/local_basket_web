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

  private pollingSub: Subscription | null = null;
  private newOrderSubject = new Subject<Order>();
  newOrder$ = this.newOrderSubject.asObservable();

  private placedOrdersSubject = new BehaviorSubject<Order[]>([]);
  placedOrders$ = this.placedOrdersSubject.asObservable();

  startPolling(): void {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      console.warn('restaurantId not found in localStorage');
      return;
    }

    const pollingInterval = 10000; // 10 sec

    this.pollingSub = interval(pollingInterval).subscribe(() => {
      // Polling for PLACED orders
      const placedOrdersApiUrl = `https://kovela.app/order/api/orders/status?status=PLACED&page=0&size=10&businessId=${restaurantId}`;
      this.http.get<{ data: { content: Order[] } }>(placedOrdersApiUrl).subscribe({
        next: (response) => {
          const placedOrders = response?.data?.content || [];
          if (placedOrders.length > 0) {
            placedOrders.forEach((order) => {
              this.notifyNewOrder(order);
            });
          }
        },
        error: (err) => {
          console.error('Error fetching placed orders:', err);
        },
      });

      // Polling for PREPARING orders that are now completed
      const preparingOrdersApiUrl = `https://kovela.app/order/api/orders/user/filter?businessId=${restaurantId}&page=0&size=10&orderStatus=PREPARING`;
      this.http.get<{ data: { content: Order[] } }>(preparingOrdersApiUrl).subscribe({
        next: (response) => {
          const completedPreparingOrders = response?.data?.content?.filter(
            (order) => order.timmimgs === 'COMPLETED'
          ) || [];
          if (completedPreparingOrders.length > 0) {
            completedPreparingOrders.forEach((order) => {
              this.notifyNewOrder(order);
            });
          }
        },
        error: (err) => {
          console.error('Error fetching completed preparing orders:', err);
        },
      });
    });
  }

  private totalElementsSubject = new BehaviorSubject<number>(0);
  totalElements$ = this.totalElementsSubject.asObservable();

  private notifyNewOrder(order: Order): void {
    this.newOrderSubject.next(order);
  }

  stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
  }

  // polling logic end

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