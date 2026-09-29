import { Project } from './project.model';
import { Review } from './review.model';

export interface PlatformStats {
  users: {
    total: number;
    students: number;
    faculty: number;
  };
  projects: {
    total: number;
    draft: number;
    submitted: number;
    underReview: number;
    approved: number;
    revisionRequested: number;
    totalAnalyzed: number;
  };
  domainBreakdown: {
    domain: string;
    count: number;
  }[];
  recentActivity: {
    projects: Project[];
    reviews: Review[];
  };
}

export interface StatsResponse {
  success: boolean;
  data: PlatformStats;
}
