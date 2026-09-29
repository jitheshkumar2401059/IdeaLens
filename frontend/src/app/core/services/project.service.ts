import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectListResponse, SingleProjectResponse } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:5001/api/projects';

  constructor(private http: HttpClient) {}

  getProjects(filters?: { domain?: string; status?: string; search?: string; mine?: boolean; sort?: string }): Observable<ProjectListResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.domain) params = params.set('domain', filters.domain);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.mine) params = params.set('mine', 'true');
      if (filters.sort) params = params.set('sort', filters.sort);
    }
    return this.http.get<ProjectListResponse>(this.apiUrl, { params });
  }

  getProjectById(id: string): Observable<SingleProjectResponse> {
    return this.http.get<SingleProjectResponse>(`${this.apiUrl}/${id}`);
  }

  createProject(projectData: Partial<Project>): Observable<SingleProjectResponse> {
    return this.http.post<SingleProjectResponse>(this.apiUrl, projectData);
  }

  updateProject(id: string, projectData: Partial<Project>): Observable<SingleProjectResponse> {
    return this.http.put<SingleProjectResponse>(`${this.apiUrl}/${id}`, projectData);
  }

  deleteProject(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  submitProject(id: string): Observable<SingleProjectResponse> {
    return this.http.post<SingleProjectResponse>(`${this.apiUrl}/${id}/submit`, {});
  }
}
