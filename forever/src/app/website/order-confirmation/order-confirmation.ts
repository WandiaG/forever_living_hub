import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// --- INTERFACES ---

interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string; 
}

interface CustomerInfo {
    customer_name: string;
    phone_number: string;
    county: string;
    location: string;
}

interface OrderConfirmationData extends CustomerInfo {
    order_id: number; // Used as the order number
    status: 'Processing' | 'Shipped' | 'Delivered';
    items: OrderItem[]; 
    subtotal: number;
    shipping_cost: number;
    total_price: number;
    created_at?: string;
}

// --- COMPONENT ---

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss'
})
export class OrderConfirmation implements OnInit {
    
    // Signal to hold the order data loaded from localStorage
    orderData = signal<OrderConfirmationData | null>(null);
    
    constructor(private router: Router) {}

    ngOnInit(): void {
        this.loadOrderConfirmationData();
    }

    /**
     * Loads the last placed order details from localStorage.
     * CRITICAL: Converts string values from localStorage (like prices and quantities) back to numbers.
     */
    loadOrderConfirmationData(): void {
        const data = localStorage.getItem('lastOrder');
        if (data) {
            try {
                const parsedData: any = JSON.parse(data); // Use 'any' temporarily for parsing flexibility

                // ⭐ FIX: Convert top-level numeric fields to Number
                parsedData.subtotal = Number(parsedData.subtotal);
                parsedData.shipping_cost = Number(parsedData.shipping_cost);
                parsedData.total_price = Number(parsedData.total_price);

                // ⭐ FIX: Convert item-level numeric fields (price and quantity) to Number
                parsedData.items = parsedData.items.map((item: any) => ({
                    ...item,
                    price: Number(item.price), 
                    quantity: Number(item.quantity)
                })) as OrderItem[]; // Cast back to the correct array type

                this.orderData.set(parsedData as OrderConfirmationData); // Set the signal with corrected data

            } catch (error) {
                console.error('Error parsing order confirmation data:', error);
                localStorage.removeItem('lastOrder');
                this.orderData.set(null);
            }
        }
        
        // Redirect if no valid order data is found
        if (!this.orderData()) {
            console.warn('No recent order found, redirecting to products.');
            // Note: Use a timeout to ensure navigation occurs after the current Angular change detection cycle finishes
            setTimeout(() => {
                this.router.navigate(['/products']);
            }, 0);
        }
    }

    /**
     * Generates a plausible estimated delivery date (e.g., 3 days from the order date).
     */
    getEstimatedDelivery(): string {
        const data = this.orderData();
        if (!data) return 'N/A';
        
        // Use created_at if available, otherwise use the current date as a fallback
        const dateString = data.created_at || new Date().toISOString();
        const orderDate = new Date(dateString);
        orderDate.setDate(orderDate.getDate() + 3); // Add 3 days for estimated delivery
        
        return orderDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
    }

    goToTrackOrder(): void {
        alert('Tracking functionality not yet implemented!');
    }

    goToContinueShopping(): void {
        this.router.navigate(['/products']);
    }

    goBack(): void {
        this.router.navigate(['/landing_page']); 
    }
}