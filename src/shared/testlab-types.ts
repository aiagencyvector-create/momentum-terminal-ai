export type PackageScript = {
  name: string;
  command: string;
  isTest: boolean;
};

export type TestStatus = 'pass' | 'fail' | 'skip' | 'running';

export type TestResult = {
  name: string;
  file?: string;
  status: TestStatus;
  duration?: number;
  message?: string;
};

export type TestRunUpdate =
  | { runId: string; type: 'data'; chunk: string }
  | { runId: string; type: 'result'; result: TestResult }
  | { runId: string; type: 'summary'; pass: number; fail: number; skip: number }
  | { runId: string; type: 'exit'; exitCode: number };
