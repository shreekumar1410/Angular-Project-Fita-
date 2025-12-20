import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Category } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;
  userRole: string = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: ['', Validators.required],
      images: ['https://picsum.photos/640/640?random', Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.loadCategories();
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

      this.productService.createProduct(productData).subscribe({
        next: (response) => {
          this.successMessage = 'Product added successfully! Redirecting...';
          this.isSubmitting = false;
          
          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Failed to add product. Please try again.';
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


