import { inject, Injectable } from '@angular/core';
import { catchError, Observable, Subject, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiConfigService } from '../../core/service/api-config.service';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  description?: string;
  sentToKot?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutHomeService {
  
  private apiConfig = inject(ApiConfigService);
  private http = inject(HttpClient);
  private restaurantId = localStorage.getItem('restaurantId') || '';

  private selectedItemsSubject = new Subject<OrderItem[]>();
  selectedItems$ = this.selectedItemsSubject.asObservable();

  private kotTriggerSubject = new Subject<{ orderId: number; tableId: number; recentlyUpdatedItems: OrderItem[] }>();
  kotTrigger$ = this.kotTriggerSubject.asObservable();

  emitSelectedItems(items: OrderItem[]): void {
    this.selectedItemsSubject.next(items);
  }

  triggerKot(orderId: number, tableId: number, recentlyUpdatedItems: OrderItem[]): void {
    this.kotTriggerSubject.next({ orderId, tableId, recentlyUpdatedItems });
  }

 getPlacedOrders(page: number, size: number): Observable<any> {
    const businessId = localStorage.getItem('restaurantId'); 
    
    if (!businessId) {
      throw new Error('No restaurantId in localStorage!');
    }
      const getOnlineOrdersUrl = this.apiConfig.getEndpoint('OrderEndpoint');
    const url = `${getOnlineOrdersUrl}/api/orders/business/${businessId}?page=${page}&size=${size}`;
    return this.http.get(url);
  }

  updateOrderStatus(orderNumber: string, status: string, notes: any, updatedBy: string): Observable<any> {
    const updateOrderStatusUrl = this.apiConfig.getEndpoint('OrderEndpoint');
    const body = new HttpParams()
      .set('status', status)
      .set('notes', notes)
      .set('updatedBy', updatedBy);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post(`${updateOrderStatusUrl}/api/orders/status/${orderNumber}`, body.toString(), { headers }).pipe(
      catchError(error => {
        console.error(`Error updating order status to ${status}:`, error);
        return throwError(() => new Error(`Failed to update order status to ${status}`));
      })
    );
  }

  regenerateKotOnline(orderNumber: string, password: string): Observable<any> {
    const regenerateKotOnlineUrl = this.apiConfig.getEndpoint('OrderEndpoint');
    return this.http.get(`${regenerateKotOnlineUrl}/api/orders/orderNumber/${orderNumber}?password=${encodeURIComponent(password)}`).pipe(
      catchError(error => {
        console.error('Error regenerating KOT:', error);
        return throwError(() => new Error('Failed to regenerate KOT'));
      })
    );
  }

  // Unchanged methods (not used by Delivery or Notifications components)
  getAllTableNumbers(): Observable<any> {
    const getAllTablesUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    return this.http.get<any>(`${getAllTablesUrl}/api/tables/restaurant/${this.restaurantId}`);
  }

  deleteTable(tableId: number): Observable<any> {
    const getAllTablesUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    return this.http.delete(`${getAllTablesUrl}/api/tables/${tableId}`);
  }

  categoryMenu(): Observable<any[]> {
    const getCategorysUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    return this.http.get<any[]>(`${getCategorysUrl}/categories`);
  }

  getMenuItems(restaurantId: string, page: number, size: number): Observable<any> {
    const getMenuItemsUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    const url = `${getMenuItemsUrl}/api/products/restaurant/${restaurantId}?size=${size}&page=${page}`;
    return this.http.get<any>(url);
  }

  getItemsByCategory(categoryName: string, businessId: string, page: number, size: number): Observable<any> {
    const getItemsByCategoryUrl = this.apiConfig.getEndpoint('CategorysEndpoint');
    return this.http.get(`${getItemsByCategoryUrl}/api/products/byCategoryNameAndBusiness?categoryName=${categoryName}&businessId=${businessId}&page=${page}&size=${size}`);
  }

  createTable(tableData: { tableNumber: string; capacity: number; location: string }): Observable<any> {
    const createTableUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    const businessId = localStorage.getItem('restaurantId');
    const payload = {
      tableNumber: tableData.tableNumber,
      capacity: tableData.capacity,
      location: tableData.location,
      status: 'AVAILABLE',
      isAvailable: true,
      businessId: businessId ? parseInt(businessId, 10) : null,
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${createTableUrl}/api/tables/create`, payload, { headers });
  }

  addOrder(data: { tableId: number; productId: number[]; quantity: number[]; description: string[]; }): Observable<any> {
  const addOrderUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
  const body = {
    tableId: data.tableId,
    productId: data.productId,
    quantity: data.quantity,
    description: data.description
  };

  console.log('addOrder Request Body:', JSON.stringify(body, null, 2));
  return this.http.post(`${addOrderUrl}/api/order/add`, body);
}
  getOrderDetails(orderId: number): Observable<any> {
    const getAllTableOrdersUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    return this.http.get(`${getAllTableOrdersUrl}/api/order/${orderId}`);
  }


  updateOrder(payload: any) {
    const updateOrderUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    return this.http.put(`${updateOrderUrl}/api/order/update`, payload);
  }

  deleteOrderItem(tableId: number, productId: number): Observable<any> {
    const deleteOrderItemUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    return this.http.delete(`${deleteOrderItemUrl}/api/order/remove?tableId=${tableId}&productId=${productId}`);
  }

  cancelOrder(tableId: number): Observable<any> {
    const cancelOrderUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    return this.http.put(`${cancelOrderUrl}/api/order/${tableId}/cancel`, {});
  }

  markItemsSentToKot(orderId: number): Observable<any> {
    const markItemsSentToKotUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    return this.http.post(`${markItemsSentToKotUrl}/api/order/${orderId}/mark-items-sent-to-kot`, {});
  }

  regenerateKot(orderId: number, kotNumber: number, password: string): Observable<any> {
    const regenerateKotUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    return this.http.get(`${regenerateKotUrl}/api/kot/snapshots/by-kot/${kotNumber}?password=${encodeURIComponent(password)}`);
  }

  getKotSnapshots(orderId: number, password: string): Observable<any> {
    const getKotSnapshotsUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    return this.http.get(`${getKotSnapshotsUrl}/api/kot/snapshots/by-order/${orderId}?password=${password}`);
  }

  completeOrder(tableId: number, payload: any): Observable<any> {
    const completeOrderUrl = this.apiConfig.getEndpoint('RestaurantEndpoint');
    const params = new HttpParams().set('tableId', tableId.toString());
    return this.http.put(`${completeOrderUrl}/api/order/complete`, payload, { params });
  }
}
