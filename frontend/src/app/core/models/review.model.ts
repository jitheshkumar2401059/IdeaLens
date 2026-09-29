import { User } from './user.model';

export type ReviewDecision = 'approved' | 'revision_requested' | 'rejected' | 'under_review';

export interface CriteriaRatings {
  problemClarity: number;
  innovationNovelty: number;
  technicalFeasibility: number;
  societalImpact: number;
}

export interface Review {
  _id: string;
  projectId: any;
  facultyId: User;
  versionNumber: number;
  statusDecision: ReviewDecision;
  comments: string;
  criteriaRatings: CriteriaRatings;
  createdAt: string;
}

export interface Comment {
  _id: string;
  projectId: string;
  authorId: User;
  authorRole: 'student' | 'faculty' | 'admin';
  content: string;
  createdAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    comments: Comment[];
  };
}
