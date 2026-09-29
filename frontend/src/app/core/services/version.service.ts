import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectVersion, VersionCompareResponse } from '../models/version.model';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private apiUrl = 'http://localhost:5001/api/projects';

  constructor(private http: HttpClient) {}

  getVersions(projectId: string): Observable<{ success: boolean; count: number; data: ProjectVersion[] }> {
    return this.http.get<{ success: boolean; count: number; data: ProjectVersion[] }>(`${this.apiUrl}/${projectId}/versions`);
  }

  createVersion(projectId: string, versionData: Partial<ProjectVersion>): Observable<{ success: boolean; message: string; data: ProjectVersion }> {
    return this.http.post<{ success: boolean; message: string; data: ProjectVersion }>(`${this.apiUrl}/${projectId}/versions`, versionData);
  }

  compareVersions(projectId: string, v1: number, v2: number): Observable<VersionCompareResponse> {
    return this.http.get<VersionCompareResponse>(`${this.apiUrl}/${projectId}/versions/compare?v1=${v1}&v2=${v2}`);
  }
}
