import {
  SEED_BUGS,
  SEED_EXECUTION_RUNS,
  SEED_TEST_CASES,
  SEED_USERS,
} from '../data/seedData';
import { BugReport, ExecutionRun, TestCase, UserAccount } from '../types/testing';

const KEYS = {
  USERS: 'atms_users_v1',
  SESSION: 'atms_session_v1',
  TEST_CASES: 'atms_test_cases_v1',
  BUGS: 'atms_bugs_v1',
  EXECUTION_RUNS: 'atms_execution_runs_v1',
} as const;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadUsers(): UserAccount[] {
  const existing = safeParse<UserAccount[] | null>(localStorage.getItem(KEYS.USERS), null);
  if (!existing || existing.length === 0) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  return existing;
}

export function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function loadSession(): UserAccount | null {
  return safeParse<UserAccount | null>(localStorage.getItem(KEYS.SESSION), null);
}

export function saveSession(user: UserAccount | null): void {
  if (user) {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.SESSION);
  }
}

export function loadTestCases(): TestCase[] {
  const existing = safeParse<TestCase[] | null>(localStorage.getItem(KEYS.TEST_CASES), null);
  if (!existing) {
    localStorage.setItem(KEYS.TEST_CASES, JSON.stringify(SEED_TEST_CASES));
    return SEED_TEST_CASES;
  }
  return existing;
}

export function saveTestCases(testCases: TestCase[]): void {
  localStorage.setItem(KEYS.TEST_CASES, JSON.stringify(testCases));
}

export function loadBugs(): BugReport[] {
  const existing = safeParse<BugReport[] | null>(localStorage.getItem(KEYS.BUGS), null);
  if (!existing) {
    localStorage.setItem(KEYS.BUGS, JSON.stringify(SEED_BUGS));
    return SEED_BUGS;
  }
  return existing;
}

export function saveBugs(bugs: BugReport[]): void {
  localStorage.setItem(KEYS.BUGS, JSON.stringify(bugs));
}

export function loadExecutionRuns(): ExecutionRun[] {
  const existing = safeParse<ExecutionRun[] | null>(
    localStorage.getItem(KEYS.EXECUTION_RUNS),
    null
  );
  if (!existing) {
    localStorage.setItem(KEYS.EXECUTION_RUNS, JSON.stringify(SEED_EXECUTION_RUNS));
    return SEED_EXECUTION_RUNS;
  }
  return existing;
}

export function saveExecutionRuns(runs: ExecutionRun[]): void {
  localStorage.setItem(KEYS.EXECUTION_RUNS, JSON.stringify(runs));
}

export function resetAllDemoData(): {
  testCases: TestCase[];
  bugs: BugReport[];
  executionRuns: ExecutionRun[];
} {
  localStorage.setItem(KEYS.TEST_CASES, JSON.stringify(SEED_TEST_CASES));
  localStorage.setItem(KEYS.BUGS, JSON.stringify(SEED_BUGS));
  localStorage.setItem(KEYS.EXECUTION_RUNS, JSON.stringify(SEED_EXECUTION_RUNS));
  return {
    testCases: SEED_TEST_CASES,
    bugs: SEED_BUGS,
    executionRuns: SEED_EXECUTION_RUNS,
  };
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCsvFile(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>): void {
  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  const csvContent = csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
