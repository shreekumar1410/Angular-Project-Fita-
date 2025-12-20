import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: Category;
}

export interface CreateProduct {
  title: string;
  price: number;
  description: string;
  categoryId: number;
  images: string[];
}

export interface UpdateProduct {
  title?: string;
  price?: number;
  description?: string;
  categoryId?: number;
  images?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://api.escuelajs.co/api/v1';

  constructor(private http: HttpClient) { }

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  // Search and filter products
  searchProducts(params: {
    title?: string;
    categoryId?: number;
    price_min?: number;
    price_max?: number;
  }): Observable<Product[]> {
    let queryParams = new URLSearchParams();
    
    if (params.title) {
      queryParams.append('title', params.title);
    }
    if (params.categoryId) {
      queryParams.append('categoryId', params.categoryId.toString());
    }
    if (params.price_min !== undefined && params.price_min !== null) {
      queryParams.append('price_min', params.price_min.toString());
    }
    if (params.price_max !== undefined && params.price_max !== null) {
      queryParams.append('price_max', params.price_max.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${this.apiUrl}/products?${queryString}` : `${this.apiUrl}/products`;
    
    return this.http.get<Product[]>(url);
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  // Get related products
  getRelatedProducts(id: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/${id}/related`);
  }

  // Get all categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  // Create new product
  createProduct(product: CreateProduct): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products/`, product);
  }

  // Update product
  updateProduct(id: number, product: UpdateProduct): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product);
  }

  // Delete product
  deleteProduct(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/products/${id}`);
  }
}


