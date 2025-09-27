import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

// Define the Order interface for type safety
interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  total_price: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders implements OnInit {
  private url = "http://localhost:3000/api/orders"; // URL to fetch orders from
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals for state management
  private allOrders = signal<Order[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  selectedStatus = signal<'All' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>('All');
  selectedDateRange = signal<'all' | 'today' | 'last7' | 'last30'>('all');

  // Computed signal to filter orders based on search, status, and date
  filteredOrders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const dateRange = this.selectedDateRange();
    let orders = this.allOrders();
    const now = new Date();

    // 1. Filter by Status
    if (status !== 'All') {
      orders = orders.filter(order => order.status === status);
    }

    // 2. Filter by Date Range
    if (dateRange !== 'all') {
      // NOTE: This comparison relies on the 'created_at' date string being parsable by Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      const createdAt = (dateString: string) => new Date(dateString).getTime();

      switch (dateRange) {
        case 'today':
          orders = orders.filter(order => createdAt(order.created_at) >= today);
          break;
        case 'last7':
          const sevenDaysAgo = today - (7 * oneDay);
          orders = orders.filter(order => createdAt(order.created_at) >= sevenDaysAgo);
          break;
        case 'last30':
          const thirtyDaysAgo = today - (30 * oneDay);
          orders = orders.filter(order => createdAt(order.created_at) >= thirtyDaysAgo);
          break;
      }
    }

    // 3. Filter by Search Query
    if (query) {
      orders = orders.filter(order =>
        // Safely access properties, defaulting to an empty string if undefined/null
        (order.order_number ?? '').toLowerCase().includes(query) ||
        (order.customer_name ?? '').toLowerCase().includes(query) 
        
      );
    }

    return orders;
  });

  ngOnInit() {
    this.fetchOrders();
  }

  /**
   * Fetches the list of orders from the backend API.
   */
  fetchOrders() {
    this.isLoading.set(true);
    this.http.get<Order[]>(this.url)
      .pipe(
        catchError(error => {
          console.error('Error fetching orders:', error);
          return of([]);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe(orders => {
        // Correct the data type for total_price before setting the signal
        const correctedOrders = orders.map(order => ({
          ...order,
          // Ensure total_price is a number, using 0 as a fallback
          total_price: parseFloat((order as any).total_price) || 0,
          // Ensure status and names are strings (though the null coalescing in computed handles the safety)
          status: (order.status ?? 'Processing') as any, 
          order_number: order.order_number ?? 'N/A',
          customer_name: order.customer_name ?? 'Anonymous'
        }));
        this.allOrders.set(correctedOrders);
        console.log('Fetched orders:', correctedOrders);
      });
  }

  /**
   * Updates the status filter.
   * @param status The status to filter by.
   */
  setStatusFilter(status: 'All' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') {
    this.selectedStatus.set(status);
  }

  /**
   * Updates the date range filter.
   * @param range The date range to filter by.
   */
  setDateFilter(range: 'all' | 'today' | 'last7' | 'last30') {
    this.selectedDateRange.set(range);
  }

  /**
   * Navigates to the order details page for a specific order.
   * @param orderId The ID of the order to view.
   */
  goToOrderDetails(orderId: number) {
    this.router.navigate(['/admins/orderdetails', orderId]);
  }
}
