import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateOrderRequest, Cart, CustomerInfo, ApiResponse, CreateOrderResponse } from '../../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { catchError, first, tap } from 'rxjs/operators';
import { of } from 'rxjs';

// Define the signal types to include the fields used in the component
interface CartSignal extends Omit<Cart, 'subtotal' | 'total_price'> {
  // Omit computed properties from the raw signal to avoid circular dependency
  items: Cart['items'];
  shipping_cost: Cart['shipping_cost'];
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss'
})
export class CheckoutPage implements OnInit {
  private url = "http://localhost:3000/api/orders";

  private http = inject(HttpClient);
  private router = inject(Router);

  // 1. Core State Signals
  // The cart state is an object, but we manage its structure reactively
  cartSignal = signal<CartSignal>({
    items: [],
    shipping_cost: 5.00, // Default shipping cost
  });

  customerInfo = signal<CustomerInfo>({
    customer_name: '',
    phone_number: '',
    county: '',
    location: ''
  });

  isSubmitting = signal(false);

  // 2. Computed Signals for Totals
  subtotal = computed(() => {
    return this.cartSignal().items.reduce((total, item) => {
      // Ensure price and quantity are numbers before calculation
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  });

  totalPrice = computed(() => {
    // subtotal() automatically tracks the subtotal signal
    return this.subtotal() + this.cartSignal().shipping_cost;
  });

  // 3. Computed Signal for Validation
  isFormValid = computed(() => {
    const info = this.customerInfo();
    return !!(
      info.customer_name.trim() &&
      info.phone_number.trim() &&
      info.county.trim() &&
      info.location.trim() &&
      this.cartSignal().items.length > 0
    );
  });

  // 4. Input Change Handler (Replaces NgModel on Input for Signals)
  updateCustomerInfo(field: keyof CustomerInfo, value: string) {
    this.customerInfo.update(info => ({
      ...info,
      [field]: value
    }));
  }

  ngOnInit() {
    this.loadCartFromStorage();
  }

  loadCartFromStorage() {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const parsedCart: Cart = JSON.parse(cartData);
        // Set the base signal with the loaded data
        this.cartSignal.set({
          items: parsedCart.items || [],
          shipping_cost: parsedCart.shipping_cost || 5.00,
        });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.cartSignal.set({ items: [], shipping_cost: 5.00 });
    }
  }

  placeOrder() {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields and ensure the cart is not empty.');
      return;
    }

    this.isSubmitting.set(true);
    const info = this.customerInfo();
    const cartData = this.cartSignal();
    const currentSubtotal = this.subtotal();
    const currentTotal = this.totalPrice();

    // 1. Convert cart items to order items
    const orderItems = cartData.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      product_id: item.product_id,
      imageUrl: (item as any).imageUrl || '' // Ensure imageUrl is included
    }));

    // 2. Create order request
    const orderRequest: CreateOrderRequest = {
      customer_name: info.customer_name,
      phone_number: info.phone_number,
      county: info.county,
      location: info.location,
      subtotal: currentSubtotal,
      shipping_cost: cartData.shipping_cost,
      total_price: currentTotal,
      items: orderItems
    };

    // 3. Make HTTP request
    this.http.post<ApiResponse<CreateOrderResponse>>(this.url, orderRequest)
      .pipe(
        first(), // Ensure the request completes
        tap(response => {
          console.log('Order placed successfully:', response);

          // 4. Post-success cleanup and navigation
          localStorage.removeItem('cart');

          // ⭐ THE FIX IS HERE
          if (response.data) {
            const orderConfirmationData = {
              // Use the server's ID and order_number
              order_id: response.data.id,
              order_number: response.data.order_number,
              // Merge in the rest of the customer info and calculated totals
              ...orderRequest,
              status: 'Processing', // Set a default status
              created_at: new Date().toISOString() // Add a timestamp for the confirmation page
            };
            localStorage.setItem('lastOrder', JSON.stringify(orderConfirmationData));
          }
          // ⭐ END OF FIX

          this.router.navigate(['/orderconfirmation']);
        }),
        catchError(error => {
          console.error('Error placing order:', error);
          const errorMessage = error.error?.message || 'Failed to place order. Please check your details and try again.';
          alert(errorMessage);
          return of(null); // Return an observable to keep the stream alive
        })
      )
      .subscribe({
        complete: () => {
          // Set submitting to false only after the subscription has fully completed
          this.isSubmitting.set(false);
        }
      });
  }

  goBack() {
    this.router.navigate(['/cart']);
  }
}