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
      const getOnlineOrdersUrl = this.apiConfig.getEndpoint('getOnlineOrders');
    const url = `${getOnlineOrdersUrl}${businessId}?page=${page}&size=${size}`;
    return this.http.get(url);
  }

  updateOrderStatus(orderNumber: string, status: string, notes: string, updatedBy: string): Observable<any> {
    const updateOrderStatusUrl = this.apiConfig.getEndpoint('approveOrder');
    const body = new HttpParams()
      .set('status', status)
      .set('notes', notes.trim() || '')
      .set('updatedBy', updatedBy.trim() || '');
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post(`${updateOrderStatusUrl}${orderNumber}`, body.toString(), { headers }).pipe(
      catchError(error => {
        console.error(`Error updating order status to ${status}:`, error);
        return throwError(() => new Error(`Failed to update order status to ${status}`));
      })
    );
  }

  regenerateKotOnline(orderNumber: string, password: string): Observable<any> {
    const regenerateKotOnlineUrl = this.apiConfig.getEndpoint('regenerateKotOnline');
    return this.http.get(`${regenerateKotOnlineUrl}${orderNumber}?password=${encodeURIComponent(password)}`).pipe(
      catchError(error => {
        console.error('Error regenerating KOT:', error);
        return throwError(() => new Error('Failed to regenerate KOT'));
      })
    );
  }

  // Unchanged methods (not used by Delivery or Notifications components)
  getAllTableNumbers(): Observable<any> {
    const getAllTablesUrl = this.apiConfig.getEndpoint('getAllTables');
    return this.http.get<any>(`${getAllTablesUrl}${this.restaurantId}`);
  }

  deleteTable(tableId: number): Observable<any> {
    const getAllTablesUrl = this.apiConfig.getEndpoint('deleteTable');
    return this.http.delete(`${getAllTablesUrl}${tableId}`);
  }

  categoryMenu(): Observable<any[]> {
    const getCategorysUrl = this.apiConfig.getEndpoint('getCategorys');
    return this.http.get<any[]>(`${getCategorysUrl}`);
  }

  getMenuItems(restaurantId: string, page: number, size: number): Observable<any> {
    const getMenuItemsUrl = this.apiConfig.getEndpoint('getMenuItems');
    const url = `${getMenuItemsUrl}${restaurantId}?size=${size}&page=${page}`;
    return this.http.get<any>(url);
  }

  getItemsByCategory(categoryName: string, businessId: string, page: number, size: number): Observable<any> {
    const getItemsByCategoryUrl = this.apiConfig.getEndpoint('getItemsByCategory');
    return this.http.get(`${getItemsByCategoryUrl}${categoryName}&businessId=${businessId}&page=${page}&size=${size}`);
  }

  createTable(tableData: { tableNumber: string; capacity: number; location: string }): Observable<any> {
    const createTableUrl = this.apiConfig.getEndpoint('createTable');
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
    return this.http.post(`${createTableUrl}`, payload, { headers });
  }

  addOrder(data: { tableId: number; productId: number[]; quantity: number[]; description: string[]; }): Observable<any> {
  const addOrderUrl = this.apiConfig.getEndpoint('addOrder');
  const body = {
    tableId: data.tableId,
    productId: data.productId,
    quantity: data.quantity,
    description: data.description
  };

  console.log('addOrder Request Body:', JSON.stringify(body, null, 2));
  return this.http.post(addOrderUrl, body);
}
  getOrderDetails(orderId: number): Observable<any> {
    const getAllTableOrdersUrl = this.apiConfig.getEndpoint('getOrderDetails');
    return this.http.get(`${getAllTableOrdersUrl}${orderId}`);
  }


  updateOrder(payload: any) {
    const updateOrderUrl = this.apiConfig.getEndpoint('updateOrder');
    return this.http.put(`${updateOrderUrl}`, payload);
  }

  deleteOrderItem(tableId: number, productId: number): Observable<any> {
    const deleteOrderItemUrl = this.apiConfig.getEndpoint('deleteOrderItem');
    return this.http.delete(`${deleteOrderItemUrl}${tableId}&productId=${productId}`);
  }

  cancelOrder(tableId: number): Observable<any> {
    const cancelOrderUrl = this.apiConfig.getEndpoint('cancelOrder');
    return this.http.put(`${cancelOrderUrl}${tableId}/cancel`, {});
  }

  markItemsSentToKot(orderId: number): Observable<any> {
    const markItemsSentToKotUrl = this.apiConfig.getEndpoint('markItemsSentToKot');
    return this.http.post(`${markItemsSentToKotUrl}${orderId}/mark-items-sent-to-kot`, {});
  }

  regenerateKot(orderId: number, kotNumber: number, password: string): Observable<any> {
    const regenerateKotUrl = this.apiConfig.getEndpoint('regenarateKotDinin');
    return this.http.get(`${regenerateKotUrl}${kotNumber}?password=${encodeURIComponent(password)}`);
  }

  getKotSnapshots(orderId: number, password: string): Observable<any> {
    const getKotSnapshotsUrl = this.apiConfig.getEndpoint('getKotSnapshots');
    return this.http.get(`${getKotSnapshotsUrl}${orderId}?password=${password}`);
  }

  completeOrder(tableId: number, payload: any): Observable<any> {
    const completeOrderUrl = this.apiConfig.getEndpoint('completeOrder');
    const params = new HttpParams().set('tableId', tableId.toString());
    return this.http.put(`${completeOrderUrl}`, payload, { params });
  }
}
