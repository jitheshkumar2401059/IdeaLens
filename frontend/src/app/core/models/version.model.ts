import { User } from './user.model';
import { Analysis } from './analysis.model';
import { SimilarityResult } from './similarity.model';

export interface ProjectVersion {
  _id: string;
  projectId: string;
  versionNumber: number;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  targetUsers: string;
  domain: string;
  technologies: string[];
  keyFeatures: string[];
  expectedOutcome: string;
  references?: string[];
  changeSummary: string;
  createdBy: User | string;
  analysisSnapshot?: Analysis;
  similaritySnapshot?: SimilarityResult;
  createdAt: string;
}

export interface VersionDiff {
  addedTechnologies: string[];
  removedTechnologies: string[];
  addedFeatures: string[];
  removedFeatures: string[];
  fieldChanges: {
    field: string;
    before: string;
    after: string;
  }[];
}

export interface VersionCompareResponse {
  success: boolean;
  data: {
    v1: {
      versionNumber: number;
      createdAt: string;
      changeSummary: string;
      data: ProjectVersion;
    };
    v2: {
      versionNumber: number;
      createdAt: string;
      changeSummary: string;
      data: ProjectVersion;
    };
    diff: VersionDiff;
  };
}
