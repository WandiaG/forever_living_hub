import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, OnDestroy, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, of } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

// Product interface - make sure this matches your backend response
interface Product {
  id: number;
  name: string;
  description: string;
  benefit: string;
  price: number;
  imageUrl: string;
  created_at?: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
})
export class ProductDetail implements OnInit, OnDestroy {
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  private url = 'http://localhost:3000/api/products';
  private subscriptions = new Subscription();

  // 🔄 Updated to use Signals for state management
  viewProduct: WritableSignal<Product | null> = signal(null);
  isLoading: WritableSignal<boolean> = signal(true);
  error: WritableSignal<string | null> = signal(null);
  
  viewProductId: number | null = null;
  debugInfo: string = ''; // Keeping for debugging, though less needed with Signals

  ngOnInit(): void {
    console.log('🚀 ProductDetail component initialized');
    
    // Subscribe to route parameters
    const paramsSubscription = this.route.params.subscribe((params) => {
      console.log('📍 Route params received:', params);
      
      // Reset state when new ID is detected
      this.viewProduct.set(null);
      this.error.set(null);
      
      const productIdString = params['id'];
      console.log('🔢 Product ID from params:', productIdString);
      
      if (productIdString) {
        const productId = parseInt(productIdString, 10);
        
        if (isNaN(productId) || productId <= 0) {
          console.error('❌ Invalid product ID:', productIdString);
          this.isLoading.set(false);
          this.error.set('Invalid product ID provided.');
          return;
        }

        this.viewProductId = productId;
        console.log('✅ Valid product ID parsed:', this.viewProductId);
        this.loadProductToView(this.viewProductId);
      } else {
        console.error('❌ No product ID found in route params');
        this.isLoading.set(false);
        this.error.set('No product ID provided in the URL.');
      }
    });

    this.subscriptions.add(paramsSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    console.log('🧹 ProductDetail component destroyed');
  }

  loadProductToView(id: number): void {
    console.log(`🔄 Loading product with ID: ${id}`);
    console.log(`🌐 API URL: ${this.url}/${id}`);
    
    // ⚙️ Set loading state using signals
    this.isLoading.set(true);
    this.error.set(null);
    this.debugInfo = `Loading product ${id}...`;

    const httpSubscription = this.http.get<Product>(`${this.url}/${id}`).pipe(
      tap(product => {
        console.log('✅ Product loaded successfully:', product);
        
        if (!product || typeof product !== 'object') {
          console.error('❌ Invalid product data received:', product);
          this.error.set('Invalid product data received from server.'); // ⚙️ Signal update
          throw new Error('Invalid product data');
        }

        // ⚙️ Use .set() to update the Signal value
        this.viewProduct.set({
          id: product.id,
          name: product.name || 'Unknown Product',
          description: product.description || 'No description available.',
          benefit: product.benefit || 'No benefits listed.',
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          imageUrl: product.imageUrl || 'assets/images/default-product.png',
          created_at: product.created_at
        });
        
        console.log('📦 Product assigned to viewProduct:', this.viewProduct());
        this.debugInfo = `Product loaded successfully: ${this.viewProduct()?.name}`;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error loading product:', error);
        
        let errorMessage: string;
        if (error.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check if the server is running on http://localhost:3000';
        } else if (error.status === 404) {
          errorMessage = `Product with ID ${id} was not found.`;
        } else if (error.status === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else {
          errorMessage = `Failed to load product details. Error: ${error.status} - ${error.statusText}`;
        }
        
        this.error.set(errorMessage); // ⚙️ Signal update
        this.debugInfo = `Error: ${this.error()}`;
        this.viewProduct.set(null); // Clear product data on error
        
        return of(null);
      }),
      finalize(() => {
        this.isLoading.set(false); // ⚙️ Signal update
      })
    ).subscribe();
    this.subscriptions.add(httpSubscription);
  }

  // 🔄 Updated retryLoading to use signals
  retryLoading(): void {
    if (this.viewProductId) {
      console.log('🔄 Retrying to load product...');
      this.loadProductToView(this.viewProductId);
    }
  }

  // Other methods remain the same...
  onImageError(event: any): void {
    console.warn('⚠️ Image failed to load:', event.target?.style?.backgroundImage);
    event.target.style.backgroundImage = 'url("https://via.placeholder.com/480x320/fafcf8/141b0e?text=Image+Not+Found")';
  }

  goToCart(): void {
    console.log('🛒 Navigating to cart');
    this.router.navigate(['/cart']);
  }

  goToHome(): void {
    console.log('🏠 Navigating to home');
    this.router.navigate(['/landing_page']);
  }

  goBack(): void {
    console.log('⬅️ Going back to products');
    this.router.navigate(['/products']);
  }

  formatPrice(price: number): string {
    return `Ksh ${price.toFixed(2)}`;
  }
}