import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Analysis, AnalysisResponse } from '../models/analysis.model';
import { SimilarityResult } from '../models/similarity.model';

export interface CombinedAnalyzeResponse {
  success: boolean;
  message: string;
  data: {
    analysis: Analysis;
    similarity: SimilarityResult;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private apiUrl = 'http://localhost:5001/api/projects';

  constructor(private http: HttpClient) {}

  analyzeProject(projectId: string): Observable<CombinedAnalyzeResponse> {
    return this.http.post<CombinedAnalyzeResponse>(`${this.apiUrl}/${projectId}/analyze`, {});
  }

  getAnalysis(projectId: string, versionNumber?: number): Observable<AnalysisResponse> {
    const url = versionNumber
      ? `${this.apiUrl}/${projectId}/analysis?version=${versionNumber}`
      : `${this.apiUrl}/${projectId}/analysis`;
    return this.http.get<AnalysisResponse>(url);
  }
}
