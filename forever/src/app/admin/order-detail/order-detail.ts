import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

// Define the Order Item interface (assuming structure based on previous data)
interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

// Define the Order interface based on the user's provided structure
interface Order {
  id: number;
  customer_name: string;
  phone_number: string; // Updated from customer_phone
  county: string;       // New address part
  location: string;     // New address part
  subtotal: number;
  shipping_cost: number; // Updated from shipping_fee
  total_price: number;
  // Kept 'Cancelled' for frontend action/display robustness
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'; 
  items: OrderItem[];
  created_at: string;
  updated_at: string; // New field
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss'
})
export class OrderDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private location = inject(Location);
  
  private apiUrl = "http://localhost:3000/api/orders";

  // Signals for state
  order = signal<Order | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  isUpdating = signal(false);

  ngOnInit() {
    // Subscribe to route parameter changes to fetch the order ID
    this.route.paramMap.pipe(
      tap(() => this.isLoading.set(true)),
      switchMap(params => {
        const idParam = params.get('orderId');
        const orderId = Number(idParam);

        if (idParam && !isNaN(orderId)) {
          this.error.set(null); // Clear previous errors if successful
          return this.fetchOrder(orderId);
        } else {
          // Handle case where orderId is missing or invalid in the URL
          const msg = `Order ID parameter ('orderId') was not found in the URL. Please ensure your route is configured correctly (e.g., path: 'orderdetails/:orderId') and you are navigating with a valid ID.`;
          this.error.set(msg);
          console.error(msg);
          return of(null);
        }
      })
    ).subscribe(orderData => {
      this.isLoading.set(false);
      if (orderData) {
        this.order.set(orderData);
        // Note: error is already cleared if successful, or set in the failure case above
      }
    });
  }

  /**
   * Fetches a single order's details by ID.
   * @param id The ID of the order.
   */
  fetchOrder(id: number) {
    // Replace with actual API call to ${this.apiUrl}/${id}
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error('Error fetching order:', err);
        this.error.set(`Failed to load order #${id}. The API endpoint might be down or returned an error.`);
        return of(null);
      }),
      // Client-side data correction/mocking for demonstration purposes
      tap((order: any) => {
        if (order) {
           // Ensure top-level financials are numbers
           order.total_price = parseFloat(order.total_price as any) || 0;
           order.subtotal = parseFloat(order.subtotal as any) || (order.total_price * 0.95);
           
           // Updated property name to shipping_cost and ensure it's a number
           order.shipping_cost = parseFloat(order.shipping_cost as any) || (order.total_price * 0.05); 
           
           // Ensure prices and quantities for items are numbers before use in template
           order.items = order.items && order.items.length > 0 ? order.items.map((item: any) => ({
             ...item,
             price: parseFloat(item.price as any) || 0, // Ensure price is a number
             quantity: parseInt(item.quantity as any) || 0 // Ensure quantity is an integer
           })) : this.createMockItems(order.id);
           
           // Ensure required customer fields exist and match new interface names
           order.phone_number = order.phone_number ?? '+1 (555) 555-0000'; // Updated property name
           order.county = order.county ?? 'Digital County';               // New address part
           order.location = order.location ?? '123 E-Commerce Lane';     // New address part
           
           order.status = (order.status ?? 'Processing') as Order['status'];
           order.updated_at = order.updated_at ?? order.created_at;
        }
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Updates the status of the current order.
   * @param newStatus The new status to set.
   */
  updateStatus(newStatus: 'Shipped' | 'Delivered' | 'Cancelled') {
    const currentOrder = this.order();
    if (!currentOrder || this.isUpdating()) {
      return;
    }

    this.isUpdating.set(true);
    
    // Optimistic UI update: update the signal immediately
    const previousStatus = currentOrder.status;
    this.order.update(order => order ? {...order, status: newStatus} : null);

    // Replace with actual API call to update status
    this.http.patch(`${this.apiUrl}/${currentOrder.id}`, { status: newStatus })
      .pipe(
        catchError(err => {
          console.error(`Failed to update status to ${newStatus}:`, err);
          this.error.set(`Failed to update status. Reverting change.`);
          // Revert UI update on failure
          this.order.update(order => order ? {...order, status: previousStatus} : null);
          return of(null);
        }),
        finalize(() => this.isUpdating.set(false))
      )
      .subscribe(response => {
        if (response) {
          console.log(`Order ${currentOrder.id} status updated to ${newStatus}.`);
        }
      });
  }

  /**
   * Calculates the percentage width for the status progress bar.
   */
  getStatusWidth(): string {
    const status = this.order()?.status;
    switch (status) {
      case 'Processing':
        return '33.33%';
      case 'Shipped':
        return '66.66%';
      case 'Delivered':
        return '100%';
      case 'Cancelled':
      default:
        return '0%';
    }
  }

  /**
   * Navigates back to the previous page (Order List).
   */
  goBack() {
    this.location.back();
  }

  /**
   * Mocks some product data since the structure of the fetched order isn't guaranteed.
   */
  private createMockItems(orderId: number): OrderItem[] {
    return [
      { product_id: 101, name: `Vitamin D Supplement`, quantity: 2, price: 15.00 },
      { product_id: 102, name: `Omega-3 Fish Oil`, quantity: 1, price: 25.00 },
      { product_id: 103, name: `Probiotic Capsules`, quantity: 1, price: 20.00 }
    ];
  }
}
