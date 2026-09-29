import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { StatsResponse } from '../models/stats.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5001/api/admin';

  constructor(private http: HttpClient) {}

  getPlatformStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.apiUrl}/stats`);
  }

  getUsers(filters?: { role?: string; search?: string; status?: string }): Observable<{ success: boolean; count: number; data: User[] }> {
    let params = new HttpParams();
    if (filters) {
      if (filters.role) params = params.set('role', filters.role);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status) params = params.set('status', filters.status);
    }
    return this.http.get<{ success: boolean; count: number; data: User[] }>(`${this.apiUrl}/users`, { params });
  }

  toggleUserStatus(userId: string): Observable<{ success: boolean; message: string; data: Partial<User> }> {
    return this.http.patch<{ success: boolean; message: string; data: Partial<User> }>(`${this.apiUrl}/users/${userId}/toggle-status`, {});
  }
}
