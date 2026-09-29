import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SimilarityResponse, SimilarityResult } from '../models/similarity.model';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class SimilarityService {
  private projectApiUrl = 'http://localhost:5001/api/projects';
  private similarityApiUrl = 'http://localhost:5001/api/similarity';

  constructor(private http: HttpClient) {}

  getSimilarForProject(projectId: string, versionNumber?: number): Observable<SimilarityResponse> {
    const url = versionNumber
      ? `${this.projectApiUrl}/${projectId}/similar?version=${versionNumber}`
      : `${this.projectApiUrl}/${projectId}/similar`;
    return this.http.get<SimilarityResponse>(url);
  }

  exploreSimilar(filters: { query?: string; domain?: string; technology?: string }): Observable<{ success: boolean; count: number; data: Project[] }> {
    let params = new HttpParams();
    if (filters.query) params = params.set('query', filters.query);
    if (filters.domain) params = params.set('domain', filters.domain);
    if (filters.technology) params = params.set('technology', filters.technology);

    return this.http.get<{ success: boolean; count: number; data: Project[] }>(`${this.similarityApiUrl}/explore`, { params });
  }
}
