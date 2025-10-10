import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderItem } from '../models/interface.model';

@Injectable({
  providedIn: 'root'
})
export class PrintBillService {

  private readonly snackBar = inject(MatSnackBar);

  printBill(data: { orderedItems: OrderItem[]; businessDetails: any; kotSubTotal: number; kotTaxAmount: number; kotTotalWithTax: number }): void {
    const { orderedItems, businessDetails, kotSubTotal, kotTaxAmount, kotTotalWithTax } = data;

    // Extract business details
    const businessName = businessDetails.businessName || 'Unknown Business';
    const fssaiNumber = businessDetails.attributes?.find((attr: any) => attr.attributeName === 'FSSAI Number')?.attributeValue || 'N/A';
    const gstNumber = businessDetails.attributes?.find((attr: any) => attr.attributeName === 'GST Number')?.attributeValue || 'N/A';

    // Current date and time (12:00 AM IST, August 16, 2025)
    const now = new Date();
    const dateTime = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: true, year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Generate HTML for the bill
    const billHtml = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 10px; }
          .details { text-align: center; margin-bottom: 10px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          .table th, .table td { border: 1px solid #000; padding: 5px; text-align: left; }
          .table th { background-color: #f2f2f2; }
          .totals { margin-bottom: 10px; }
          .totals div { display: flex; justify-content: space-between; margin: 2px 0; }
          .footer { text-align: center; margin-top: 20px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${businessName}</h2>
        </div>
        <div class="details">
          <p>Date: ${dateTime}</p>
          <p>FSSAI Number: ${fssaiNumber}</p>
          <p>GST Number: ${gstNumber}</p>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>QTY / Item Name</th>
              <th>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${orderedItems.map(item => `
              <tr>
                <td>${item.quantity} ${item.productName}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <div><span>Sub Total</span><span>₹${kotSubTotal.toFixed(2)}</span></div>
          <div><span>CGST: 2.5%</span><span>₹${(kotTaxAmount / 2).toFixed(2)}</span></div>
          <div><span>SGST: 2.5%</span><span>₹${(kotTaxAmount / 2).toFixed(2)}</span></div>
          <div><span>Total</span><span>₹${this.roundOff(kotTotalWithTax).toFixed(2)}</span></div>
        </div>
        <div class="footer">
          <p>Thanks for visiting visit again</p>
        </div>
        <script>
          window.onload = function() {
            window.print(); // Silent print
            window.onafterprint = function() {
              window.close(); // Close the window after printing
            };
          };
        </script>
      </body>
      </html>
    `;

    // Create a hidden window and print
    const printWindow = window.open('', '', 'width=300,height=400');
    if (printWindow) {
      printWindow.document.write(billHtml);
      printWindow.document.close();
    } else {
      this.snackBar.open('Failed to open print window. Please ensure popup blockers are disabled.', 'Close', { duration: 3000 });
    }
  }

  private roundOff(value: number): number {
    const decimal = value % 1;
    return decimal >= 0.5 ? Math.ceil(value) : Math.floor(value);
  }
}
