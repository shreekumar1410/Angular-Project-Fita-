import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id?: number;
  name: string;
  role: string;
  email: string;
  password: string;
  avatar: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  id: number;
  name: string;
  role: string;
  email: string;
  avatar: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api.escuelajs.co/api/v1';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) { }

  // Register a new user
  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/`, user);
  }

  // Login and get JWT token
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.access_token);
        })
      );
  }

  // Get logged-in user profile
  getProfile(): Observable<UserProfile> {
    const token = this.getToken();
    return this.http.get<UserProfile>(`${this.apiUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Store token
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}


