import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, Category } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  
  // Filter properties
  searchTitle: string = '';
  selectedCategoryId: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  
  isLoading: boolean = true;
  errorMessage: string = '';
  userRole: string = '';

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadCategories();
    this.loadProducts();
  }

  loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.userRole = profile.role;
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Build filter parameters
    const params: any = {};
    
    if (this.searchTitle.trim()) {
      params.title = this.searchTitle.trim();
    }
    if (this.selectedCategoryId) {
      params.categoryId = Number(this.selectedCategoryId);
    }
    if (this.minPrice !== null && this.minPrice !== undefined) {
      params.price_min = this.minPrice;
    }
    if (this.maxPrice !== null && this.maxPrice !== undefined) {
      params.price_max = this.maxPrice;
    }

    this.productService.searchProducts(params).subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });
  }

  // Called when search input changes (automatic filtering)
  onSearchChange(): void {
    this.loadProducts();
  }

  // Called when category changes (automatic filtering)
  onCategoryChange(): void {
    this.loadProducts();
  }

  // Apply price filters (manual - requires button click)
  applyFilters(): void {
    this.loadProducts();
  }

  // Clear all filters
  clearFilters(): void {
    this.searchTitle = '';
    this.selectedCategoryId = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.loadProducts();
  }

  // View product detail
  viewProduct(productId: number): void {
    this.router.navigate(['/products/detail', productId]);
  }

  isAdminOrProvider(): boolean {
    return this.userRole === 'admin';
  }

  addProduct(): void {
    this.router.navigate(['/products/add']);
  }

  editProduct(productId: number): void {
    this.router.navigate(['/products/edit', productId]);
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          // Reload products after deletion
          this.loadProducts();
        },
        error: (error) => {
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}


