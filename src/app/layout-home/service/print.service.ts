import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { LayoutHomeService } from './layout-home.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

interface PrintData {
  orderType: 'delivery' | 'dine-in';
  recentlyUpdatedItems: Array<{
    productName: string;
    quantity: number;
    description?: string;
  }>;
  restaurantName: string;
  orderNumber: string;
  orderId: number;
  status: string;
  tableId?: string;
  currentKotNumber?: string;
  kotHistoryNumbers?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PrintService {
 private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly orderService = inject(LayoutHomeService);
  private readonly datePipe = inject(DatePipe);

  /**
   * Prints a test message to verify printer functionality.
   * @param printerName The name of the printer to use, or null to use default printer.
   * @returns Observable with success status and optional error message.
   */
  testPrint(printerName: string | null): Observable<{ success: boolean; error?: string }> {
    if (!window.electronAPI || !window.electronAPI.getPrinters || !window.electronAPI.print) {
      const errorMsg = 'Electron API not available, please ensure the app is running in Electron';
      this.showError(errorMsg);
      return of({ success: false, error: errorMsg });
    }

    const htmlContent = this.generateTestPrintHtml();
    let printerObservable: Observable<string | null>;

    if (printerName) {
      printerObservable = of(printerName);
    } else {
      printerObservable = from(window.electronAPI.getDefaultPrinter());
    }

    return printerObservable.pipe(
      switchMap((deviceName) => {
        if (!deviceName) {
          const errorMsg = 'No printer selected or default printer found';
          this.showError(errorMsg);
          return of({ success: false, error: errorMsg });
        }

        return from(window.electronAPI.print(htmlContent, deviceName)).pipe(
          map((printResult) => {
            if (!printResult.success) {
              throw new Error(printResult.error || 'Unknown print error');
            }
            return { success: true };
          })
        );
      }),
      tap((result) => {
        if (result.success) {
          this.snackBar.open('Test print successful', 'Close', { duration: 3000 });
        }
      }),
      catchError((error) => {
        const errorMessage = error.message || 'Error during test print';
        this.showError(errorMessage);
        return of({ success: false, error: errorMessage });
      })
    );
  }

  /**
   * Prints a KOT with optional printer selection.
   * @param data Print data containing order details.
   * @param requirePrinterSelection Whether to prompt for printer selection.
   * @returns Observable with success status and optional error message.
   */
  // printKot(data: PrintData, requirePrinterSelection: boolean): Observable<{ success: boolean; error?: string }> {
  //   if (!window.electronAPI || !window.electronAPI.getPrinters || !window.electronAPI.print) {
  //     const errorMsg = 'Electron API not available, please ensure the app is running in Electron';
  //     this.showError(errorMsg);
  //     return of({ success: false, error: errorMsg });
  //   }

  //   const htmlContent = this.generateKotHtml(data);
  //   if (!htmlContent) {
  //     const errorMsg = 'No items to print';
  //     this.showError(errorMsg);
  //     return of({ success: false, error: errorMsg });
  //   }

  //   let printerObservable: Observable<string | null>;
  //   if (requirePrinterSelection) {
  //     printerObservable = this.selectPrinter();
  //   } else {
  //     printerObservable = from(window.electronAPI.getDefaultPrinter());
  //   }

  //   return printerObservable.pipe(
  //     switchMap((deviceName) => {
  //       if (!deviceName) {
  //         const errorMsg = requirePrinterSelection ? 'Printer selection cancelled' : 'No default printer found';
  //         this.showError(errorMsg);
  //         return of({ success: false, error: errorMsg });
  //       }

  //       return from(window.electronAPI.print(htmlContent, deviceName)).pipe(
  //         switchMap((printResult) => {
  //           if (!printResult.success) {
  //             throw new Error(printResult.error || 'Unknown print error');
  //           }
  //           if (data.orderType === 'dine-in' && data.orderId) {
  //             return this.orderService.markItemsSentToKot(data.orderId).pipe(
  //               map((kotResult) => {
  //                 if (!kotResult.success) {
  //                   throw new Error('Failed to mark items as sent to KOT');
  //                 }
  //                 return { success: true };
  //               })
  //             );
  //           }
  //           return of({ success: true });
  //         })
  //       );
  //     }),
  //     tap((result) => {
  //       if (result.success) {
  //         this.snackBar.open('Print successful', 'Close', { duration: 3000 });
  //       }
  //     }),
  //     catchError((error) => {
  //       const errorMessage = error.message || 'Error during printing';
  //       this.showError(errorMessage);
  //       return of({ success: false, error: errorMessage });
  //     })
  //   );
  // }

  /**
   * Opens a dialog to select a printer.
   * @returns Observable with the selected printer name or null if cancelled.
   */
  // private selectPrinter(): Observable<string | null> {
  //   return from(window.electronAPI.getPrinters()).pipe(
  //     switchMap((printers) => {
  //       if (!printers) {
  //         this.showError('No printers available');
  //         return of(null);
  //       }
  //       return this.dialog
  //         .open(PrinterSelectionComponent, {
  //           width: '400px',
  //           data: { printers },
  //         })
  //         .afterClosed();
  //     })
  //   );
  // }

  /**
   * Generates HTML for test print.
   * @returns Formatted HTML string for test print.
   */
  private generateTestPrintHtml(): string {
    const currentDateTime = this.datePipe.transform(new Date(), 'MMM d, h:mm:ss a') || '';
    return `
      <style>
        .test-print-container {
          width: 80mm;
          font-family: monospace;
          font-size: 12px;
          text-align: center;
        }
        .test-print-container h3 {
          margin: 10px 0;
        }
        .test-print-container p {
          margin: 5px 0;
        }
      </style>
      <div class="test-print-container">
        <h3>Test Print</h3>
        <p>Hello, your print logic is working now!</p>
        <p>${currentDateTime}</p>
      </div>
    `;
  }

  /**
   * Generates HTML for KOT printing.
   * @param data Print data containing order details.
   * @returns Formatted HTML string or empty string if no items.
   */
  private generateKotHtml(data: PrintData): string {
    const items = data.recentlyUpdatedItems || [];
    if (items.length === 0) {
      return '';
    }

    const currentDateTime = this.datePipe.transform(new Date(), 'MMM d, h:mm:ss a') || '';
    const statusLabel = data.status === 'RUNNING' ? 'RUNNING' : 'New Order';

    const itemsHtml = items
      .map(
        (item, index) => `
      <tr>
        <td class="sno-col">${index + 1}</td>
        <td class="item-col">${item.productName}</td>
        <td class="qty-col">${item.quantity}</td>
        <td class="desc-col">${item.description || ''}</td>
      </tr>
    `
      )
      .join('');

    const headerHtml =
      data.orderType === 'dine-in'
        ? `
      <div class="kot-header">
        <h2>KOT</h2>
        <p>${currentDateTime}</p>
        <p>Table ${data.tableId || 'N/A'}</p>
        <p>Current KOT NO: ${data.currentKotNumber || 'N/A'}</p>
        <p>Recent KOT NO: ${data.kotHistoryNumbers?.[0] || 'None'}</p>
        <p>Status: ${statusLabel}</p>
      </div>
    `
        : `
      <div class="bill-header" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h3>${data.restaurantName}</h3>
        <p>Online</p>
        <p>${currentDateTime}</p>
        <p>Order No: ${data.orderNumber}</p>
      </div>
    `;

    return `
      <style>
        .kot-container {
          width: 80mm;
          font-family: monospace;
          font-size: 10px;
        }
        .kot-header, .bill-header {
          text-align: center;
        }
        .kot-header h2 {
          font-size: 14px;
          margin: 0;
        }
        .kot-header p, .bill-header p {
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

  /**
   * Displays an error message via snackbar.
   * @param message Error message to display.
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
