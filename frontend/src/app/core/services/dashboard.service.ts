import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentDashboardStats {
  totalProjects: number;
  draftProjects?: number;
  draft?: number;
  submittedProjects?: number;
  submitted?: number;
  underReview?: number;
  revisionRequested?: number;
  revisionProjects?: number;
  approvedProjects?: number;
  approved?: number;
  rejected?: number;
}

export interface FacultyDashboardStats {
  totalSubmissions: number;
  pendingReview: number;
  approvedProjects?: number;
  approved?: number;
  revisionProjects?: number;
  revisionRequested?: number;
  rejected?: number;
  myReviewsCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:5001/api/dashboard';

  constructor(private http: HttpClient) {}

  getStats<T = any>(): Observable<{ success: boolean; data: T }> {
    return this.http.get<{ success: boolean; data: T }>(`${this.apiUrl}/stats`);
  }

  getStudentStats(): Observable<{ success: boolean; data: StudentDashboardStats }> {
    return this.http.get<{ success: boolean; data: StudentDashboardStats }>(`${this.apiUrl}/stats`);
  }

  getFacultyStats(): Observable<{ success: boolean; data: FacultyDashboardStats }> {
    return this.http.get<{ success: boolean; data: FacultyDashboardStats }>(`${this.apiUrl}/stats`);
  }
}

