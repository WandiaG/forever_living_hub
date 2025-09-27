import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateProductRequest, Product } from '../../interfaces/interfaces';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-product.html',
  styleUrl: './create-product.scss'
})
export class CreateProduct implements OnInit {
  private url = "http://localhost:3000/api/products";
  
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  newProduct: CreateProductRequest = {
    name: "",
    description: "",
    benefit: "",
    price: 0,
    imageUrl: ""
  };
  
  isLoading = false;
  isEditMode = false;
  currentProductId: number | null = null;
  pageTitle = "Add New Product";
  buttonText = "Save Product";
  uploadedFile: File | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id'] && params['mode'] === 'edit') {
        this.isEditMode = true;
        this.currentProductId = +params['id'];
        this.pageTitle = "Edit Product";
        this.buttonText = "Update Product";
        this.loadProductForEditing(this.currentProductId);
      }
    });
  }

  loadProductForEditing(id: number) {
    this.isLoading = true;
    this.http.get<Product>(`${this.url}/${id}`).subscribe({
      next: (product: Product) => {
        this.newProduct = {
          name: product.name,
          description: product.description || "",
          benefit: product.benefit || "",
          price: product.price,
          imageUrl: product.imageUrl
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product for editing:', error);
        this.isLoading = false;
        alert('Error loading product data');
        this.navigateToProducts();
      }
    });
  }

  onSave() {
    // The HTML button's `[disabled]` attribute handles the validation check
    // before this method is even called.
    this.isLoading = true;
    
    if (this.isEditMode && this.currentProductId) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  private createProduct() {
    this.http.post<Product>(this.url, this.newProduct).subscribe({
      next: (res: Product) => {
        console.log('Product created successfully:', res);
        this.isLoading = false;
        this.navigateToProducts();
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.isLoading = false;
        alert('Error creating product. Please try again.');
      }
    });
  }

  private updateProduct() {
    this.http.put<Product>(`${this.url}/${this.currentProductId}`, this.newProduct).subscribe({
      next: (res: Product) => {
        console.log('Product updated successfully:', res);
        this.isLoading = false;
        this.navigateToProducts();
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.isLoading = false;
        alert('Error updating product. Please try again.');
      }
    });
  }
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newProduct.imageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/128x128/f2f4f0/758961?text=No+Image';
  }

  onBackClick() {
    this.navigateToProducts();
  }

  private navigateToProducts() {
    this.router.navigate(['/admins/products']);
  }

  getCurrentButtonText(): string {
    if (this.isLoading) {
      return this.isEditMode ? 'Updating...' : 'Saving...';
    }
    return this.buttonText;
  }
}