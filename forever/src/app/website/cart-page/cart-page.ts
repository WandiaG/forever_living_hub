import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../cart/cart';
import { CartItem, Cart } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart-page.html',
  styleUrls: ['./cart-page.scss']
})
export class CartPage implements OnInit, OnDestroy {
  cart: Cart = {
    items: [],
    subtotal: 0,
    shipping_cost: 5,
    total_price: 0
  };

  private cartSubscription: Subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cart$.subscribe(
      (cart: Cart) => {
        this.cart = cart;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  /**
   * Decrease item quantity by 1
   * @param item - The cart item to decrease
   */
  decreaseQuantity(item: CartItem): void {
    const newQuantity = item.quantity - 1;
    if (newQuantity <= 0) {
      this.removeItem(item);
    } else {
      this.cartService.updateQuantity(item.product_id, newQuantity);
    }
  }

  /**
   * Increase item quantity by 1
   * @param item - The cart item to increase
   */
  increaseQuantity(item: CartItem): void {
    const newQuantity = item.quantity + 1;
    this.cartService.updateQuantity(item.product_id, newQuantity);
  }

  /**
   * Update quantity directly from input
   * @param item - The cart item to update
   * @param event - The input event
   */
  onQuantityChange(item: CartItem, event: any): void {
    const newQuantity = parseInt(event.target.value, 10);
    
    // Validate input
    if (isNaN(newQuantity) || newQuantity < 0) {
      // Reset to current quantity if invalid input
      event.target.value = item.quantity.toString();
      return;
    }

    if (newQuantity === 0) {
      this.removeItem(item);
    } else {
      this.cartService.updateQuantity(item.product_id, newQuantity);
    }
  }

  /**
   * Remove item completely from cart
   * @param item - The cart item to remove
   */
  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.product_id);
  }

  /**
   * Navigate back to products page
   */
  goBackToProducts(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Navigate to home page
   */
  goToHome(): void {
    this.router.navigate(['/landing_page']);
  }

  /**
   * Navigate to shop page
   */
  goToShop(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Navigate to cart page (current page - for consistency)
   */
  goToCart(): void {
    // Already on cart page, but method exists for template consistency
  }

  /**
   * Navigate to profile page
   */
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  /**
   * Proceed to checkout
   */
  proceedToCheckout(): void {
    if (this.cart.items.length === 0) {
      alert('Your cart is empty. Please add some items before checkout.');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  /**
   * Check if cart is empty
   */
  get isCartEmpty(): boolean {
    return this.cart.items.length === 0;
  }

  /**
   * Get total item count in cart
   */
  get totalItemCount(): number {
    return this.cartService.getItemCount();
  }

  /**
   * Format price for display
   * @param price - The price to format
   */
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  /**
   * Handle image load errors
   * @param event - The error event
   */
  onImageError(event: any): void {
    // Set a default image if the original fails to load
    event.target.src = 'assets/images/default-product.png';
  }

  /**
   * Track function for ngFor to optimize rendering
   * @param index - The index of the item
   * @param item - The cart item
   */
  trackByProductId(index: number, item: CartItem): number {
    return item.product_id;
  }
}
