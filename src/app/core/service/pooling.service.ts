import { inject, Injectable } from '@angular/core';
import { Subscription, Subject, BehaviorSubject, interval, catchError, of } from 'rxjs';
import { Order } from '../interface/eatoInterface';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class PoolingService {

  constructor(private http: HttpClient) {}
  apiConfig = inject(ApiConfigService)

  private pollingSub: Subscription | null = null;
  private pollingActive = false;
  private newOrderSubject = new Subject<Order>();
  newOrder$ = this.newOrderSubject.asObservable();
  private totalElementsSubject = new BehaviorSubject<number>(0);
  totalElements$ = this.totalElementsSubject.asObservable();

  private placedOrdersSubject = new BehaviorSubject<Order[]>([]);
  placedOrders$ = this.placedOrdersSubject.asObservable();

  private orderStatusUpdatedSubject = new Subject<{ orderNumber: string; status: string }>();
  orderStatusUpdated$ = this.orderStatusUpdatedSubject.asObservable();

  // Buzzer audio references to allow immediate stop
  private buzzers: HTMLAudioElement[] = [];

  startPolling(): void {
    if (this.pollingActive) return; // prevent duplicate polling
    this.pollingActive = true;

    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      console.warn('restaurantId not found in localStorage');
      this.pollingActive = false;
      return;
    }

    const pollingInterval = 4000; // 4 seconds

    this.pollingSub = interval(pollingInterval).subscribe(() => {
      // 🔹 Fetch PLACED orders
     
      const OrderEndpoint = this.apiConfig.getEndpoint('OrderEndpoint');
       const placedOrdersApiUrl = `${OrderEndpoint}/api/orders/status?status=PLACED&page=0&size=10&businessId=${restaurantId}`;
      this.http
        .get<{ data: { content: Order[] } }>(placedOrdersApiUrl)
        .pipe(catchError((err) => {
          console.error('Error fetching placed orders:', err);
          return of({ data: { content: [] } });
        }))
        .subscribe((response) => {
          const placedOrders = response?.data?.content || [];
          if (placedOrders.length > 0) {
            placedOrders.forEach((order) => this.notifyNewOrder(order));
          }
        });

      // 🔹 Fetch PREPARING → COMPLETED orders
      const preparingOrdersEndpoint = this.apiConfig.getEndpoint('OrderEndpoint');
      const preparingOrdersApiUrl = `${preparingOrdersEndpoint}/api/orders/user/filter?businessId=${restaurantId}&page=0&size=10&orderStatus=PREPARING`;
      this.http
        .get<{ data: { content: Order[] } }>(preparingOrdersApiUrl)
        .pipe(catchError((err) => {
          console.error('Error fetching completed preparing orders:', err);
          return of({ data: { content: [] } });
        }))
        .subscribe((response) => {
          const completedPreparingOrders =
            response?.data?.content?.filter((order) => order.timmimgs === 'COMPLETED') || [];
          if (completedPreparingOrders.length > 0) {
            completedPreparingOrders.forEach((order) => this.notifyNewOrder(order));
          }
        });
    });
  }

  // 🔊 When a new order arrives
  private notifyNewOrder(order: Order): void {
    this.newOrderSubject.next(order);
    // 🔔 Play buzzer sound and keep references for immediate stop
    this.playBuzzer();
  }

  notifyOrderStatusUpdated(update: { orderNumber: string; status: string }): void {
    this.orderStatusUpdatedSubject.next(update);
  }

  private playBuzzer(): void {
    try {
      // Ensure any existing buzzers are stopped before starting new ones
      this.stopBuzzer();

      const audio = new Audio('assets/audio/henSounds.mp3');
      audio.volume = 0.6;
      audio.play().catch((err) => {
        console.warn('Audio playback blocked or unavailable:', err);
      });
      this.buzzers.push(audio);
    } catch (error) {
      console.error('Error playing buzzer sound:', error);
    }
  }

  // Call to immediately stop any buzzer sound
  stopBuzzer(): void {
    try {
      this.buzzers.forEach(a => {
        try {
          a.pause();
          a.currentTime = 0;
        } catch {}
      });
    } finally {
      this.buzzers = [];
    }
  }

  stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
    this.pollingActive = false;
    // Ensure buzzer is stopped when polling stops
    this.stopBuzzer();
  }
  // polling logic end
}
