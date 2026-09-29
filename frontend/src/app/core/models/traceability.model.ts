export interface Requirement {
  _id: string;
  projectId: string;
  reqCode: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'completed';
  createdAt?: string;
}

export interface Feature {
  _id: string;
  projectId: string;
  requirementId: Requirement | string;
  code: string;
  title: string;
  description?: string;
  complexity: 'easy' | 'medium' | 'complex';
  status: 'planned' | 'in_development' | 'implemented' | 'blocked';
  createdAt?: string;
}

export interface TestCase {
  _id: string;
  projectId: string;
  featureId: Feature | string;
  requirementId?: Requirement | string;
  code: string;
  title: string;
  description?: string;
  expectedResult: string;
  status: 'pending' | 'passed' | 'failed' | 'blocked';
  createdAt?: string;
}

export interface Issue {
  _id: string;
  projectId: string;
  requirementId?: Requirement | string;
  featureId?: Feature | string;
  testCaseId?: TestCase | string;
  code: string;
  title: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt?: string;
}

export interface TraceabilityFeatureNode extends Feature {
  testCases: TestCase[];
  issues: Issue[];
}

export interface TraceabilityRequirementNode extends Requirement {
  features: TraceabilityFeatureNode[];
  orphanIssues?: Issue[];
}

export interface TraceabilityMatrixResponse {
  success: boolean;
  data: {
    summary: {
      requirementsCount: number;
      featuresCount: number;
      testCasesCount: number;
      issuesCount: number;
    };
    matrix: TraceabilityRequirementNode[];
  };
}
