import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService, Category, Product } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  productId: number = 0;
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  userRole: string = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: ['', Validators.required],
      images: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.loadCategories();
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct();
  }

  checkUserRole(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.userRole = profile.role;
        if (this.userRole !== 'admin') {
          this.router.navigate(['/products']);
        }
      },
      error: (error) => {
        this.router.navigate(['/login']);
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories.';
      }
    });
  }

  loadProduct(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue({
          title: product.title,
          price: product.price,
          description: product.description,
          categoryId: product.category.id,
          images: product.images[0] || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load product.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.productForm.value;
      const productData = {
        title: formValue.title,
        price: Number(formValue.price),
        description: formValue.description,
        categoryId: Number(formValue.categoryId),
        images: [formValue.images]
      };

      this.productService.updateProduct(this.productId, productData).subscribe({
        next: (response) => {
          this.successMessage = 'Product updated successfully! Redirecting...';
          this.isSubmitting = false;
          
          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Failed to update product. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.productForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}


