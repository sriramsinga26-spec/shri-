export type TestCaseStatus = 'Pass' | 'Fail' | 'Pending';

export interface TestCase {
  id: string;
  name: string;
  module: string;
  description: string;
  expectedResult: string;
  actualResult: string;
  status: TestCaseStatus;
  lastExecutedAt: string | null;
  executionDurationMs: number | null;
  createdAt: string;
}

export type BugSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type BugPriority = 'P1 - Urgent' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
export type BugStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: BugSeverity;
  priority: BugPriority;
  assignedDeveloper: string;
  status: BugStatus;
  linkedTestCaseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionStepResult {
  testCaseId: string;
  testCaseName: string;
  module: string;
  previousStatus: TestCaseStatus;
  newStatus: 'Pass' | 'Fail';
  durationMs: number;
  message: string;
}

export interface ExecutionRun {
  id: string;
  timestamp: string;
  executedBy: string;
  totalRun: number;
  passed: number;
  failed: number;
  totalDurationMs: number;
  results: ExecutionStepResult[];
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'test-cases'
  | 'automation'
  | 'bugs'
  | 'reports';
