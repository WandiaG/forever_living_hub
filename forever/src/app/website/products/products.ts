import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, signal, WritableSignal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CartService } from '../../cart/cart';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit, OnDestroy {
  private url = 'http://localhost:3000/api/products';

  // 🔄 State Signals
  itemsList: WritableSignal<Product[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(true);
  error: WritableSignal<string | null> = signal(null);

  // ⚙️ Filter and sort properties (use for two-way binding)
  selectedPriceRange = '';
  selectedSort = '';

  // 💡 Computed Signal for filtered products
  filteredItems = computed(() => {
    let filtered = [...this.itemsList()];

    // 1. Apply price filter
    if (this.selectedPriceRange) {
      filtered = this.applyPriceFilter(filtered, this.selectedPriceRange);
    }

    // 2. Apply sorting
    if (this.selectedSort) {
      filtered = this.applySorting(filtered, this.selectedSort);
    }

    return filtered;
  });

  // Cart item count signal
  private cartSubscription: Subscription = new Subscription();
  cartItemCount: WritableSignal<number> = signal(0);

  // ✅ CORRECTED: Traditional constructor injection to resolve the runtime error
  constructor(private http: HttpClient, private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.getProducts();
    this.subscribeToCart();
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
  }

  /**
   * Subscribe to cart changes to update item count
   */
  private subscribeToCart(): void {
    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.cartItemCount.set(this.cartService.getItemCount());
    });
  }

  /**
   * Fetch products from API and update signals
   */
  getProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.http
      .get<Product[]>(this.url)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching products:', error);
          this.error.set('Failed to load products. Please try again later.');
          return of([]); // Return empty array to allow the stream to complete successfully
        }),
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (res: Product[]) => {
          this.itemsList.set(res); // 🎯 Update the main product signal
        },
        error: (err) => {
          // This catch is mostly for safety, as catchError should handle the state
          console.error('Subscription error:', err);
        },
      });
  }

  // --- Filtering and Sorting Logic ---

  filterByPrice(priceRange: string): void {
    this.selectedPriceRange = priceRange;
    // The computed signal `filteredItems` handles the rest automatically
  }

  sortProducts(sortOption: string): void {
    this.selectedSort = sortOption;
    // The computed signal `filteredItems` handles the rest automatically
  }

  private applyPriceFilter(products: Product[], priceRange: string): Product[] {
    switch (priceRange) {
      case 'under-25':
        return products.filter((p) => p.price < 25);
      case '25-50':
        return products.filter((p) => p.price >= 25 && p.price <= 50);
      case '50-100':
        return products.filter((p) => p.price >= 50 && p.price <= 100);
      case 'over-100':
        return products.filter((p) => p.price > 100);
      default:
        return products;
    }
  }

  private applySorting(products: Product[], sortOption: string): Product[] {
    // Return a sorted copy of the products array
    return [...products].sort((a, b) => {
      switch (sortOption) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'name-a-z':
          return a.name.localeCompare(b.name);
        case 'name-z-a':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  clearFilters(): void {
    this.selectedPriceRange = '';
    this.selectedSort = '';
    // The computed signal `filteredItems` automatically updates
  }

  // --- Other Methods ---

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || 'assets/images/default-product.png',
    };
    this.cartService.addToCart(cartProduct, 1);
    this.showAddToCartFeedback();
  }

  private showAddToCartFeedback(): void {
    console.log('Product added to cart successfully!');
  }

  viewProductDetails(product: Product): void {
    this.router.navigate(['/productdetails', product.id]).catch((error) => {
      console.error('Navigation error:', error);
    });
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToHome(): void {
    this.router.navigate(['/landing_page']);
  }

  goToAdmin(): void {
    this.router.navigate(['/login']);
  }

  formatPrice(price: number | string): string {
    const numericPrice = parseFloat(price as string);
    if (isNaN(numericPrice)) {
      console.warn('Invalid price received:', price);
      return 'Ksh 0.00'; // Return a default value for safety
    }
    return `Ksh ${numericPrice.toFixed(2)}`;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/default-product.png'; // Changed to src for <img>, if you use background-image in HTML, the original code was fine.
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}
