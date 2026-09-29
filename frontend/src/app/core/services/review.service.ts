import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewsResponse, Review, Comment } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:5001/api';

  constructor(private http: HttpClient) {}

  getProjectReviews(projectId: string): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(`${this.apiUrl}/projects/${projectId}/reviews`);
  }

  submitReview(projectId: string, reviewData: { statusDecision: string; comments: string; criteriaRatings?: any }): Observable<{ success: boolean; message: string; data: Review }> {
    return this.http.post<{ success: boolean; message: string; data: Review }>(`${this.apiUrl}/projects/${projectId}/reviews`, reviewData);
  }

  addComment(projectId: string, content: string): Observable<{ success: boolean; message: string; data: Comment }> {
    return this.http.post<{ success: boolean; message: string; data: Comment }>(`${this.apiUrl}/projects/${projectId}/comments`, { content });
  }

  getAllReviews(): Observable<{ success: boolean; count: number; data: Review[] }> {
    return this.http.get<{ success: boolean; count: number; data: Review[] }>(`${this.apiUrl}/reviews`);
  }
}
