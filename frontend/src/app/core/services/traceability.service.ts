import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Requirement,
  Feature,
  TestCase,
  Issue,
  TraceabilityMatrixResponse
} from '../models/traceability.model';

@Injectable({
  providedIn: 'root'
})
export class TraceabilityService {
  private apiUrl = 'http://localhost:5001/api/projects';

  constructor(private http: HttpClient) {}

  getTraceabilityMatrix(projectId: string): Observable<TraceabilityMatrixResponse> {
    return this.http.get<TraceabilityMatrixResponse>(`${this.apiUrl}/${projectId}/traceability-matrix`);
  }

  // Requirements
  getRequirements(projectId: string): Observable<{ success: boolean; data: Requirement[] }> {
    return this.http.get<{ success: boolean; data: Requirement[] }>(`${this.apiUrl}/${projectId}/requirements`);
  }

  createRequirement(projectId: string, data: Partial<Requirement>): Observable<{ success: boolean; data: Requirement }> {
    return this.http.post<{ success: boolean; data: Requirement }>(`${this.apiUrl}/${projectId}/requirements`, data);
  }

  deleteRequirement(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/requirements/${id}`);
  }

  // Features
  getFeatures(projectId: string): Observable<{ success: boolean; data: Feature[] }> {
    return this.http.get<{ success: boolean; data: Feature[] }>(`${this.apiUrl}/${projectId}/features`);
  }

  createFeature(projectId: string, data: Partial<Feature>): Observable<{ success: boolean; data: Feature }> {
    return this.http.post<{ success: boolean; data: Feature }>(`${this.apiUrl}/${projectId}/features`, data);
  }

  deleteFeature(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/features/${id}`);
  }

  // Test Cases
  getTestCases(projectId: string): Observable<{ success: boolean; data: TestCase[] }> {
    return this.http.get<{ success: boolean; data: TestCase[] }>(`${this.apiUrl}/${projectId}/testcases`);
  }

  createTestCase(projectId: string, data: Partial<TestCase>): Observable<{ success: boolean; data: TestCase }> {
    return this.http.post<{ success: boolean; data: TestCase }>(`${this.apiUrl}/${projectId}/testcases`, data);
  }

  deleteTestCase(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/testcases/${id}`);
  }

  // Issues
  getIssues(projectId: string): Observable<{ success: boolean; data: Issue[] }> {
    return this.http.get<{ success: boolean; data: Issue[] }>(`${this.apiUrl}/${projectId}/issues`);
  }

  createIssue(projectId: string, data: Partial<Issue>): Observable<{ success: boolean; data: Issue }> {
    return this.http.post<{ success: boolean; data: Issue }>(`${this.apiUrl}/${projectId}/issues`, data);
  }

  deleteIssue(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/issues/${id}`);
  }
}
