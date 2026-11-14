import { useMemo, useState } from 'react';
import {
  Bug,
  CheckCircle2,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
  XCircle,
} from 'lucide-react';
import {
  BugReport,
  ExecutionRun,
  ExecutionStepResult,
  TestCase,
} from '../types/testing';
import { TestStatusDisplay } from './StatusIndicators';

interface TestExecutionViewProps {
  testCases: TestCase[];
  bugs: BugReport[];
  executionRuns: ExecutionRun[];
  currentUserName: string;
  onApplyExecutionResults: (
    updatedCases: TestCase[],
    newRun: ExecutionRun
  ) => void;
  onQuickReportBugFromFailure: (tc: TestCase) => void;
}

type SimulationProfile = 'realistic' | 'all-pass' | 'stress-test';

export function TestExecutionView({
  testCases,
  bugs,
  executionRuns,
  currentUserName,
  onApplyExecutionResults,
  onQuickReportBugFromFailure,
}: TestExecutionViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    testCases.map((tc) => tc.id)
  );
  const [profile, setProfile] = useState<SimulationProfile>('realistic');
  const [isRunning, setIsRunning] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [liveResults, setLiveResults] = useState<ExecutionStepResult[]>([]);
  const [activeRunSummary, setActiveRunSummary] = useState<ExecutionRun | null>(
    executionRuns[0] ?? null
  );

  // Keep selection valid if testCases change
  const validSelectedIds = useMemo(() => {
    const existingSet = new Set(testCases.map((t) => t.id));
    return selectedIds.filter((id) => existingSet.has(id));
  }, [selectedIds, testCases]);

  const toggleSelectAll = () => {
    if (validSelectedIds.length === testCases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(testCases.map((t) => t.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectPendingAndFailed = () => {
    setSelectedIds(
      testCases
        .filter((t) => t.status === 'Pending' || t.status === 'Fail')
        .map((t) => t.id)
    );
  };

  const evaluateSingleTestCase = (tc: TestCase): { passed: boolean; durationMs: number; message: string } => {
    const durationMs = Math.floor(85 + Math.random() * 290);

    if (profile === 'all-pass') {
      return {
        passed: true,
        durationMs,
        message: `Assertion passed: ${tc.expectedResult}`,
      };
    }

    if (profile === 'stress-test') {
      const passed = Math.random() > 0.4;
      return {
        passed,
        durationMs: durationMs + 60,
        message: passed
          ? `Stress assertion passed under concurrent load (${durationMs + 60}ms).`
          : `Assertion failed: Latency or boundary constraint violated during stress run.`,
      };
    }

    // Realistic simulation: checks whether there is an unresolved bug linked to this test case
    const linkedOpenBug = bugs.find(
      (b) =>
        b.linkedTestCaseId === tc.id &&
        (b.status === 'Open' || b.status === 'In Progress')
    );

    if (linkedOpenBug) {
      return {
        passed: false,
        durationMs,
        message: `Assertion failed due to active defect ${linkedOpenBug.id}: ${linkedOpenBug.title}`,
      };
    }

    // If no active open bug, 85% chance of passing (simulating healthy regression)
    const passed = Math.random() > 0.15;
    return {
      passed,
      durationMs,
      message: passed
        ? `Assertion passed: ${tc.expectedResult}`
        : `Assertion failed: Output diverged from expected result during automated verification.`,
    };
  };

  const handleRunTests = async () => {
    if (isRunning || validSelectedIds.length === 0) return;

    const queue = testCases.filter((tc) => validSelectedIds.includes(tc.id));
    setIsRunning(true);
    setProgressIndex(0);
    setLiveResults([]);

    const stepResults: ExecutionStepResult[] = [];
    const updatedMap = new Map<string, TestCase>();
    testCases.forEach((tc) => updatedMap.set(tc.id, tc));

    for (let i = 0; i < queue.length; i++) {
      const tc = queue[i];
      // Simulate real async JS test execution delay
      await new Promise((resolve) => setTimeout(resolve, 240));

      const outcome = evaluateSingleTestCase(tc);
      const newStatus: 'Pass' | 'Fail' = outcome.passed ? 'Pass' : 'Fail';
      const nowIso = new Date().toISOString();

      const step: ExecutionStepResult = {
        testCaseId: tc.id,
        testCaseName: tc.name,
        module: tc.module,
        previousStatus: tc.status,
        newStatus,
        durationMs: outcome.durationMs,
        message: outcome.message,
      };

      stepResults.push(step);
      setLiveResults([...stepResults]);
      setProgressIndex(i + 1);

      updatedMap.set(tc.id, {
        ...tc,
        status: newStatus,
        actualResult: outcome.message,
        lastExecutedAt: nowIso,
        executionDurationMs: outcome.durationMs,
      });
    }

    const passedCount = stepResults.filter((r) => r.newStatus === 'Pass').length;
    const failedCount = stepResults.length - passedCount;
    const totalDurationMs = stepResults.reduce((acc, r) => acc + r.durationMs, 0);

    const newRun: ExecutionRun = {
      id: `RUN-${String(executionRuns.length + 95).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      executedBy: currentUserName,
      totalRun: stepResults.length,
      passed: passedCount,
      failed: failedCount,
      totalDurationMs,
      results: stepResults,
    };

    onApplyExecutionResults(Array.from(updatedMap.values()), newRun);
    setActiveRunSummary(newRun);
    setIsRunning(false);
  };

  const displayResults = isRunning
    ? liveResults
    : activeRunSummary?.results ?? [];

  const totalQueueCount = validSelectedIds.length;
  const progressPercent =
    isRunning && totalQueueCount > 0
      ? Math.round((progressIndex / totalQueueCount) * 100)
      : activeRunSummary
        ? 100
        : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Automated Test Execution
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Execute automated JavaScript assertion suites and update test results instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as SimulationProfile)}
            disabled={isRunning}
            aria-label="Execution simulation profile"
            className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="realistic">Realistic Mode (Checks Open Bugs)</option>
            <option value="all-pass">Verification Mode (All Pass)</option>
            <option value="stress-test">Stress Mode (Higher Failure Rate)</option>
          </select>

          <button
            type="button"
            onClick={handleRunTests}
            disabled={isRunning || validSelectedIds.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>
                  Running ({progressIndex}/{totalQueueCount})...
                </span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>Run Test ({validSelectedIds.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Execution Summary Strip */}
      {activeRunSummary && !isRunning && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800/90">
            <p className="text-xs text-slate-400">Last Run ID</p>
            <p className="mt-1 font-mono text-lg font-semibold text-indigo-300 tabular-nums">
              {activeRunSummary.id}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800/90">
            <p className="text-xs text-slate-400">Executed Cases</p>
            <p className="mt-1 font-mono text-lg font-semibold text-white tabular-nums">
              {activeRunSummary.totalRun}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800/90">
            <p className="text-xs text-slate-400">Passed</p>
            <p className="mt-1 font-mono text-lg font-semibold text-emerald-400 tabular-nums">
              {activeRunSummary.passed}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800/90">
            <p className="text-xs text-slate-400">Failed</p>
            <p className="mt-1 font-mono text-lg font-semibold text-rose-400 tabular-nums">
              {activeRunSummary.failed}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800/90 col-span-2 lg:col-span-1">
            <p className="text-xs text-slate-400">Total Duration</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-200 tabular-nums">
              {activeRunSummary.totalDurationMs} ms
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar (visible when running or after a run) */}
      {(isRunning || activeRunSummary) && (
        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800/90">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-slate-300 flex items-center gap-2">
              {isRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
                  <span>Executing test assertions...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>
                    Execution complete ·{' '}
                    {activeRunSummary
                      ? `${Math.round((activeRunSummary.passed / Math.max(activeRunSummary.totalRun, 1)) * 100)}% pass rate`
                      : ''}
                  </span>
                </>
              )}
            </span>
            <span className="font-mono tabular-nums text-slate-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#080D1A] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Test Suite Selection Queue */}
        <section className="xl:col-span-5 rounded-xl bg-[#0F172A] border border-slate-800/90 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Test Suite Queue
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select test cases to include in the automated run
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectPendingAndFailed}
                disabled={isRunning}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#080D1A] hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                Pending &amp; Failed
              </button>
              <button
                type="button"
                onClick={toggleSelectAll}
                disabled={isRunning}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#080D1A] hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                {validSelectedIds.length === testCases.length ? 'Clear' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[460px] overflow-y-auto">
            {testCases.map((tc) => {
              const checked = validSelectedIds.includes(tc.id);
              return (
                <label
                  key={tc.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isRunning}
                      onChange={() => toggleOne(tc.id)}
                      className="w-4 h-4 rounded border-slate-600 bg-[#080D1A] text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-indigo-300 shrink-0">
                          {tc.id}
                        </span>
                        <span className="text-sm font-medium text-slate-200 truncate">
                          {tc.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{tc.module}</span>
                    </div>
                  </div>
                  <TestStatusDisplay status={tc.status} />
                </label>
              );
            })}
            {testCases.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No test cases available. Add test cases first.
              </div>
            )}
          </div>
        </section>

        {/* Right: Instant Execution Results & Console Log */}
        <section className="xl:col-span-7 rounded-xl bg-[#0F172A] border border-slate-800/90 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              <h2 className="font-display text-base font-semibold text-white">
                Execution Results
              </h2>
            </div>
            {executionRuns.length > 0 && (
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                {executionRuns.length} run{executionRuns.length === 1 ? '' : 's'} recorded
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[460px] overflow-y-auto">
            {displayResults.map((res) => {
              const linkedTc = testCases.find((t) => t.id === res.testCaseId);
              return (
                <div
                  key={res.testCaseId}
                  className="px-5 py-4 hover:bg-slate-800/25 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {res.newStatus === 'Pass' ? (
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-400 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <XCircle
                          className="w-4 h-4 text-rose-400 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="font-mono text-xs font-semibold text-indigo-300">
                        {res.testCaseId}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {res.testCaseName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 pl-6.5 leading-relaxed">
                      {res.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pl-6.5 sm:pl-0 shrink-0">
                    <span className="font-mono tabular-nums text-xs text-slate-400">
                      {res.durationMs} ms
                    </span>
                    <TestStatusDisplay status={res.newStatus} />
                    {res.newStatus === 'Fail' && linkedTc && !isRunning && (
                      <button
                        type="button"
                        onClick={() => onQuickReportBugFromFailure(linkedTc)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Bug className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Log Bug</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {displayResults.length === 0 && (
              <div className="p-12 text-center">
                <RotateCcw className="w-8 h-8 text-slate-600 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-300">
                  Ready to run automated tests
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Select test cases on the left and click &ldquo;Run Test&rdquo; to begin.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
