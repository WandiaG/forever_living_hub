import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../interfaces/interfaces';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class AdminProducts implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);

  private url = "http://localhost:3000/api/products";

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  
  ngOnInit(): void {
    this.getAllProducts();
  }

  getAllProducts() {
    this.isLoading = true;
    this.http.get<Product[]>(this.url).subscribe({
      next: (res) => {
        // Correctly convert price to a number upon receiving data
        this.allProducts = res.map(product => ({
          ...product,
          price: parseFloat(product.price as any) // Use parseFloat for robust conversion
        }));
        this.filteredProducts = this.allProducts;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error getting the products:', error);
        this.isLoading = false;
      }
    });
  }

  // Your existing methods are fine, but the formatPrice method can be simplified
  // since the price is now guaranteed to be a number.

  onEdit(id: number) {
    this.router.navigate(['/admins/createproduct'], { 
      queryParams: { id: id, mode: 'edit' } 
    });
  }

  onCreateNew() {
    this.router.navigate(['/admins/createproduct']);
  }

  onViewDetails(id: number) {
  this.router.navigate(['/productdetails'], {
    queryParams: { productId: id }
  });
}

  onDelete(id: number, productName: string) {
    const confirmed = confirm(`Are you sure you want to delete "${productName}"?`);
    if (confirmed) {
      this.http.delete(`${this.url}/${id}`).subscribe({
        next: () => {
          console.log('Product deleted successfully');
          this.getAllProducts();
        },
        error: (error: any) => {
          console.error('Error deleting product:', error);
          alert('Error deleting product. Please try again.');
        }
      });
    }
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = this.allProducts;
    } else {
      this.filteredProducts = this.allProducts.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredProducts = this.allProducts;
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/200x128/f2f4f0/758961?text=No+Image';
  }
  
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}