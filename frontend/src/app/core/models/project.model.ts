import { User } from './user.model';

export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'resubmitted'
  | 'approved'
  | 'rejected';

export interface Project {
  _id: string;
  id?: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  targetUsers: string;
  domain: string;
  technologies: string[];
  keyFeatures: string[];
  expectedOutcome: string;
  references?: string[];
  status: ProjectStatus;
  studentId: User | string;
  currentVersion: number;
  lastAnalyzedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListResponse {
  success: boolean;
  count: number;
  data: Project[];
}

export interface SingleProjectResponse {
  success: boolean;
  message?: string;
  data: Project;
}
