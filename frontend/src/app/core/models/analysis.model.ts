export interface ImprovementsBreakdown {
  featureImprovements: string[];
  technologyImprovements: string[];
  userExperienceImprovements: string[];
  scalabilityImprovements: string[];
  differentiationOpportunities: string[];
}

export interface Analysis {
  _id?: string;
  projectId: string;
  versionNumber: number;
  projectSummary: string;
  problemAnalysis: string;
  targetUsersAnalysis: string;
  solutionAnalysis: string;
  technologiesAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  potentialChallenges: string[];
  innovationOpportunities: string[];
  possibleImprovements: ImprovementsBreakdown;
  suggestedAdditionalFeatures: string[];
  potentialRealWorldApplications: string[];
  potentialLimitations: string[];
  overallScore: number;
  aiModelUsed: string;
  isFallback?: boolean;
  createdAt?: string;
}

export interface AnalysisResponse {
  success: boolean;
  message?: string;
  data: Analysis;
}
