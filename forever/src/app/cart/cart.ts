import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Cart } from '../interfaces/interfaces'; // Adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({
    items: [],
    subtotal: 0,
    shipping_cost: 5,
    total_price: 0
  });

  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage() {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        this.cartSubject.next(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }

  private saveCartToStorage(cart: Cart) {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private calculateTotals(cart: Cart) {
    cart.subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    cart.total_price = cart.subtotal + cart.shipping_cost;
  }

  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  addToCart(product: { id: number; name: string; price: number; imageUrl: string }, quantity: number = 1) {
    const currentCart = this.getCurrentCart();
    const existingItemIndex = currentCart.items.findIndex(item => item.product_id === product.id);

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      const newCartItem: CartItem = {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imageUrl
      };
      currentCart.items.push(newCartItem);
    }

    this.calculateTotals(currentCart);
    this.saveCartToStorage(currentCart);
    this.cartSubject.next(currentCart);
  }

  updateQuantity(productId: number, quantity: number) {
    const currentCart = this.getCurrentCart();
    const itemIndex = currentCart.items.findIndex(item => item.product_id === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        currentCart.items.splice(itemIndex, 1);
      } else {
        currentCart.items[itemIndex].quantity = quantity;
      }

      this.calculateTotals(currentCart);
      this.saveCartToStorage(currentCart);
      this.cartSubject.next(currentCart);
    }
  }

  removeFromCart(productId: number) {
    const currentCart = this.getCurrentCart();
    currentCart.items = currentCart.items.filter(item => item.product_id !== productId);
    
    this.calculateTotals(currentCart);
    this.saveCartToStorage(currentCart);
    this.cartSubject.next(currentCart);
  }

  clearCart() {
    const emptyCart: Cart = {
      items: [],
      subtotal: 0,
      shipping_cost: 5,
      total_price: 0
    };
    
    localStorage.removeItem('cart');
    this.cartSubject.next(emptyCart);
  }

  getItemCount(): number {
    return this.getCurrentCart().items.reduce((total, item) => total + item.quantity, 0);
  }
}