import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  productId: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';
  userRole: string = '';
  currentImageIndex: number = 0;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.route.params.subscribe(params => {
      this.productId = Number(params['id']);
      this.loadProduct();
      this.loadRelatedProducts();
    });
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

  loadProduct(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.product = product;
        this.currentImageIndex = 0;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load product details.';
        this.isLoading = false;
      }
    });
  }

  loadRelatedProducts(): void {
    this.productService.getRelatedProducts(this.productId).subscribe({
      next: (products) => {
        this.relatedProducts = products.slice(0, 4); // Show only 4 related products
      },
      error: (error) => {
        console.error('Failed to load related products:', error);
      }
    });
  }

  nextImage(): void {
    if (this.product && this.product.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
    }
  }

  previousImage(): void {
    if (this.product && this.product.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.product.images.length) % this.product.images.length;
    }
  }

  viewRelatedProduct(productId: number): void {
    this.router.navigate(['/products/detail', productId]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  isAdminOrProvider(): boolean {
    return this.userRole === 'admin';
  }

  editProduct(): void {
    this.router.navigate(['/products/edit', this.productId]);
  }

  deleteProduct(): void {
    if (this.product && confirm(`Are you sure you want to delete "${this.product.title}"?`)) {
      this.productService.deleteProduct(this.productId).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }

  backToList(): void {
    this.router.navigate(['/products']);
  }
}

