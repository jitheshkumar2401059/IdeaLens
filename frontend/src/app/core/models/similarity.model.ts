export interface SimilarMatch {
  similarProjectId: string;
  title: string;
  domain: string;
  similarityPercentage: number;
  domainMatch: boolean;
  technologyMatchScore: number;
  textMatchScore: number;
  matchingTechnologies: string[];
  matchingProblemConcepts: string[];
  matchingSolutionConcepts: string[];
  differences: string[];
}

export interface SimilarityResult {
  _id?: string;
  projectId: string;
  versionNumber: number;
  topMatches: SimilarMatch[];
  totalProjectsCompared: number;
  highestSimilarityPercentage: number;
  averageSimilarityPercentage: number;
  disclaimer: string;
  createdAt?: string;
}

export interface SimilarityResponse {
  success: boolean;
  message?: string;
  data: SimilarityResult;
}
