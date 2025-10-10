import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { LayoutHomeService } from './layout-home.service';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly service = inject(LayoutHomeService);
  private readonly datePipe = inject(DatePipe);

  printAndMarkKot(data: any, deviceName?: string): Observable<{ success: boolean; error?: string }> {
    if (!window.electronAPI || typeof window.electronAPI.getPrinters !== 'function' || typeof window.electronAPI.print !== 'function') {
      const errorMsg = 'Electron API not available, please ensure the app is running in Electron';
      this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
      return of({ success: false, error: errorMsg });
    }

    const htmlContent = this.generateKotHtml(data);

    let defaultObservable: Observable<string | null>;
    if (deviceName) {
      defaultObservable = of(deviceName);
    } else {
      defaultObservable = from(window.electronAPI.getDefaultPrinter());
    }

    return defaultObservable.pipe(
      switchMap(defaultDeviceName => {
        if (!defaultDeviceName) {
          return of({ success: false, error: 'No default printer found' });
        }

        return from(window.electronAPI.print(htmlContent, defaultDeviceName)).pipe(
          map(printResult => {
            if (!printResult.success) {
              throw new Error('Print failed: ' + (printResult.error || 'Unknown error'));
            }
            return printResult;
          }),
          switchMap(() => {
            if (data.orderType !== 'dine-in' || !data.orderId) {
              return of({ success: true });
            }
            return this.service.markItemsSentToKot(data.orderId).pipe(
              map(kotApiResult => {
                if (!kotApiResult.success) {
                  throw new Error('Failed to mark items as sent to KOT');
                }
                return { success: true };
              })
            );
          })
        );
      }),
      tap(result => {
        if (result.success) {
          this.snackBar.open('Print successful', 'Close', { duration: 3000 });
        }
      }),
      catchError(error => {
        const errorMessage = error.message || 'Error during printing';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        return of({ success: false, error: errorMessage });
      })
    );
  }

  private getStatusLabel(status: string | null | undefined): string {
    return status === 'RUNNING' ? 'RUNNING' : 'New Order';
  }

  private generateKotHtml(data: any): string {
    const currentDateTime = this.datePipe.transform(new Date(), 'MMM d, h:mm:ss a') || '';
    const items = data.recentlyUpdatedItems || []; // Fixed from pendingItems for consistency
    if (items.length === 0) {
      return '';
    }

    let itemsHtml = '';
    items.forEach((item: any, i: number) => {
      itemsHtml += `
        <tr>
          <td class="sno-col">${i + 1}</td>
          <td class="item-col">${item.productName}</td>
          <td class="qty-col">${item.quantity}</td>
          <td class="desc-col">${item.description || ''}</td>
        </tr>
      `;
    });

    let headerHtml = '';
    if (data.orderType === 'dine-in') {
      headerHtml = `
        <div class="kot-header">
          <h2>KOT</h2>
          <p>${currentDateTime}</p>
          <p>Table ${data.tableId}</p>
          <p>Current KOT NO: ${data.currentKotNumber}</p>
          <p>Recent KOT NO: ${data.kotHistoryNumbers.length > 0 ? data.kotHistoryNumbers[0] : 'None'}</p>
          <p>Status: ${this.getStatusLabel(data.status)}</p>
        </div>
      `;
    } else {
      headerHtml = `
        <div class="bill-header" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h3>${data.restaurantName}</h3>
          <p>Online</p>
          <p>${currentDateTime}</p>
          <p>Order No: ${data.orderNumber}</p>
        </div>
      `;
    }

    return `
      <style>
        .kot-container {
          width: 80mm;
          font-family: monospace;
          font-size: 10px;
        }
        .kot-header {
          text-align: center;
        }
        .kot-header h2 {
          font-size: 14px;
          margin: 0;
        }
        .kot-header p {
          margin: 2px 0;
        }
        .kot-divider {
          text-align: center;
          margin: 5px 0;
        }
        .kot-table {
          width: 100%;
          border-collapse: collapse;
        }
        .kot-table th, .kot-table td {
          text-align: left;
          padding: 2px;
        }
        .sno-col { width: 10%; }
        .item-col { width: 50%; }
        .qty-col { width: 15%; }
        .desc-col { width: 25%; }
      </style>
      <div class="kot-container">
        ${headerHtml}
        <div class="kot-divider">--------------------------------</div>
        <div class="kot-items">
          <table class="kot-table">
            <thead>
              <tr>
                <th class="sno-col">S.No</th>
                <th class="item-col">Item Name</th>
                <th class="qty-col">Qty</th>
                <th class="desc-col">Description</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
        <div class="kot-divider">--------------------------------</div>
      </div>
    `;
  }
}
