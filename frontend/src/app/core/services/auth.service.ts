import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse, UserRole } from '../models/user.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5001/api/auth';
  private tokenKey = 'idealens_token';
  private userKey = 'idealens_user';

  currentUser = signal<User | null>(this.loadUserFromStorage());
  token = signal<string | null>(this.getStoredToken());

  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role || null);
  isStudent = computed(() => this.currentUser()?.role === 'student');
  isFaculty = computed(() => this.currentUser()?.role === 'faculty');
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {}

  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage !== null;
  }

  private getStoredToken(): string | null {
    if (!this.hasStorage()) return null;
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  private loadUserFromStorage(): User | null {
    if (!this.hasStorage()) return null;
    try {
      const data = localStorage.getItem(this.userKey);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  register(userData: { name: string; email: string; password: string; role?: string; department?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.setSession(res.token, res.user);
          this.toast.success('Registration successful! Welcome to IdeaLens.');
        }
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.setSession(res.token, res.user);
          this.toast.success(`Welcome back, ${res.user.name}!`);
        }
      })
    );
  }

  logout() {
    if (this.hasStorage()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.token.set(null);
    this.currentUser.set(null);
    this.toast.info('You have logged out.');
    this.router.navigate(['/login']);
  }

  private setSession(token: string, user: User) {
    if (this.hasStorage()) {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    this.token.set(token);
    this.currentUser.set(user);
  }

  getToken(): string | null {
    return this.token();
  }
}
