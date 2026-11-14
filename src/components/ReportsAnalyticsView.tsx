import { useMemo, useState } from 'react';
import { ChartConfiguration } from 'chart.js/auto';
import { Download } from 'lucide-react';
import { BugReport, TestCase } from '../types/testing';
import { downloadCsvFile } from '../utils/storage';
import { ChartCanvas } from './ChartCanvas';
import {
  BugPriorityText,
  BugSeverityDisplay,
  BugStatusDisplay,
  TestStatusDisplay,
} from './StatusIndicators';

interface ReportsAnalyticsViewProps {
  testCases: TestCase[];
  bugs: BugReport[];
}

export function ReportsAnalyticsView({
  testCases,
  bugs,
}: ReportsAnalyticsViewProps) {
  const [activeReportTab, setActiveReportTab] = useState<'tests' | 'bugs'>('tests');

  const metrics = useMemo(() => {
    const totalTests = testCases.length;
    const passed = testCases.filter((t) => t.status === 'Pass').length;
    const failed = testCases.filter((t) => t.status === 'Fail').length;
    const pending = testCases.filter((t) => t.status === 'Pending').length;
    const executed = passed + failed;

    const passPercentage =
      totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : '0.0';
    const failPercentage =
      totalTests > 0 ? ((failed / totalTests) * 100).toFixed(1) : '0.0';
    const executedPassPercentage =
      executed > 0 ? ((passed / executed) * 100).toFixed(1) : '0.0';

    const openBugs = bugs.filter((b) => b.status === 'Open').length;
    const inProgressBugs = bugs.filter((b) => b.status === 'In Progress').length;
    const resolvedBugs = bugs.filter((b) => b.status === 'Resolved').length;
    const closedBugs = bugs.filter((b) => b.status === 'Closed').length;
    const resolutionRate =
      bugs.length > 0
        ? (((resolvedBugs + closedBugs) / bugs.length) * 100).toFixed(1)
        : '0.0';

    return {
      totalTests,
      passed,
      failed,
      pending,
      executed,
      passPercentage,
      failPercentage,
      executedPassPercentage,
      openBugs,
      inProgressBugs,
      resolvedBugs,
      closedBugs,
      resolutionRate,
    };
  }, [testCases, bugs]);

  const pieChartConfig = useMemo<ChartConfiguration<'pie'>>(
    () => ({
      type: 'pie',
      data: {
        labels: ['Passed', 'Failed', 'Pending'],
        datasets: [
          {
            data: [metrics.passed, metrics.failed, metrics.pending],
            backgroundColor: ['#10B981', '#F43F5E', '#F59E0B'],
            borderColor: '#0F172A',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#CBD5E1',
              padding: 18,
              usePointStyle: true,
              font: { family: 'DM Sans, sans-serif', size: 12 },
            },
          },
          tooltip: {
            backgroundColor: '#0B1120',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
          },
        },
      },
    }),
    [metrics.passed, metrics.failed, metrics.pending]
  );

  const barChartConfig = useMemo<ChartConfiguration<'bar'>>(() => {
    const severities = ['Critical', 'High', 'Medium', 'Low'] as const;
    const openBySev = severities.map(
      (s) =>
        bugs.filter(
          (b) => b.severity === s && (b.status === 'Open' || b.status === 'In Progress')
        ).length
    );
    const resolvedBySev = severities.map(
      (s) =>
        bugs.filter(
          (b) => b.severity === s && (b.status === 'Resolved' || b.status === 'Closed')
        ).length
    );

    return {
      type: 'bar',
      data: {
        labels: [...severities],
        datasets: [
          {
            label: 'Active (Open / In Progress)',
            data: openBySev,
            backgroundColor: '#F43F5E',
            borderRadius: 5,
          },
          {
            label: 'Resolved / Closed',
            data: resolvedBySev,
            backgroundColor: '#6366F1',
            borderRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#CBD5E1',
              padding: 16,
              usePointStyle: true,
              font: { family: 'DM Sans, sans-serif', size: 12 },
            },
          },
          tooltip: {
            backgroundColor: '#0B1120',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94A3B8', font: { family: 'DM Sans, sans-serif', size: 12 } },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#94A3B8',
              font: { family: 'JetBrains Mono, monospace', size: 11 },
            },
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
          },
        },
      },
    };
  }, [bugs]);

  const handleExportTestCsv = () => {
    const headers = [
      'Test Case ID',
      'Test Case Name',
      'Module',
      'Description',
      'Expected Result',
      'Actual Result',
      'Status',
      'Duration (ms)',
      'Last Executed At',
    ];
    const rows = testCases.map((tc) => [
      tc.id,
      tc.name,
      tc.module,
      tc.description,
      tc.expectedResult,
      tc.actualResult,
      tc.status,
      tc.executionDurationMs ?? 'N/A',
      tc.lastExecutedAt ?? 'Not Executed',
    ]);
    downloadCsvFile('test-execution-report.csv', headers, rows);
  };

  const handleExportBugCsv = () => {
    const headers = [
      'Bug ID',
      'Title',
      'Description',
      'Severity',
      'Priority',
      'Assigned Developer',
      'Status',
      'Linked Test Case',
      'Created At',
      'Updated At',
    ];
    const rows = bugs.map((b) => [
      b.id,
      b.title,
      b.description,
      b.severity,
      b.priority,
      b.assignedDeveloper,
      b.status,
      b.linkedTestCaseId ?? 'None',
      b.createdAt,
      b.updatedAt,
    ]);
    downloadCsvFile('bug-status-report.csv', headers, rows);
  };

  const handleExportCombinedCsv = () => {
    const headers = ['Category', 'ID', 'Title / Name', 'Severity / Module', 'Status', 'Details'];
    const rows = [
      ['Summary', 'PASS_RATE', 'Overall Test Pass Percentage', 'Test Suite', `${metrics.passPercentage}%`, `${metrics.passed}/${metrics.totalTests} passed`],
      ['Summary', 'FAIL_RATE', 'Overall Test Fail Percentage', 'Test Suite', `${metrics.failPercentage}%`, `${metrics.failed}/${metrics.totalTests} failed`],
      ['Summary', 'BUG_RESOLUTION', 'Bug Resolution Rate', 'Bug Tracker', `${metrics.resolutionRate}%`, `${metrics.resolvedBugs + metrics.closedBugs}/${bugs.length} resolved or closed`],
      ...testCases.map((tc) => ['Test Case', tc.id, tc.name, tc.module, tc.status, tc.actualResult]),
      ...bugs.map((b) => ['Bug Report', b.id, b.title, b.severity, b.status, `Assigned: ${b.assignedDeveloper} | ${b.priority}`]),
    ];
    downloadCsvFile('qa-complete-report.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Reports &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Test execution percentages, defect status distribution, and downloadable CSV exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportTestCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
            <span>Test Report CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportBugCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
            <span>Bug Report CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportCombinedCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download Full Report CSV</span>
          </button>
        </div>
      </div>

      {/* Percentage Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800/90">
          <p className="text-xs font-medium text-slate-400">Pass Percentage</p>
          <p className="mt-2 font-mono tabular-nums text-3xl font-semibold text-emerald-400">
            {metrics.passPercentage}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {metrics.passed} of {metrics.totalTests} total test cases
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800/90">
          <p className="text-xs font-medium text-slate-400">Fail Percentage</p>
          <p className="mt-2 font-mono tabular-nums text-3xl font-semibold text-rose-400">
            {metrics.failPercentage}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {metrics.failed} failed · {metrics.pending} pending
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800/90">
          <p className="text-xs font-medium text-slate-400">Executed Pass Rate</p>
          <p className="mt-2 font-mono tabular-nums text-3xl font-semibold text-indigo-300">
            {metrics.executedPassPercentage}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Across {metrics.executed} completed assertions
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800/90">
          <p className="text-xs font-medium text-slate-400">Bug Resolution Rate</p>
          <p className="mt-2 font-mono tabular-nums text-3xl font-semibold text-sky-400">
            {metrics.resolutionRate}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {metrics.resolvedBugs + metrics.closedBugs} resolved or closed of {bugs.length}
          </p>
        </div>
      </div>

      {/* Interactive Pie Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="p-6 rounded-xl bg-[#0F172A] border border-slate-800/90">
          <h2 className="font-display text-base font-semibold text-white">
            Test Execution Pie Chart
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Proportional view of Pass, Fail, and Pending test cases
          </p>
          <div className="h-72 w-full">
            <ChartCanvas config={pieChartConfig} ariaLabel="Test Execution Pie Chart" />
          </div>
        </section>

        <section className="p-6 rounded-xl bg-[#0F172A] border border-slate-800/90">
          <h2 className="font-display text-base font-semibold text-white">
            Bug Status &amp; Severity Bar Chart
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Active vs. Resolved defects grouped by severity tier
          </p>
          <div className="h-72 w-full">
            <ChartCanvas config={barChartConfig} ariaLabel="Bug Status Bar Chart" />
          </div>
        </section>
      </div>

      {/* Detailed Tabbed Report Tables */}
      <section className="rounded-xl bg-[#0F172A] border border-slate-800/90 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080D1A] border border-slate-800 w-fit">
            <button
              type="button"
              onClick={() => setActiveReportTab('tests')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeReportTab === 'tests'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Test Execution Report ({testCases.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveReportTab('bugs')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeReportTab === 'bugs'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bug Status Report ({bugs.length})
            </button>
          </div>

          <button
            type="button"
            onClick={activeReportTab === 'tests' ? handleExportTestCsv : handleExportBugCsv}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              Export {activeReportTab === 'tests' ? 'Test Execution' : 'Bug Status'} CSV
            </span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {activeReportTab === 'tests' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-medium text-slate-400 bg-[#0B1120]/60">
                  <th className="py-3.5 px-5">Test ID</th>
                  <th className="py-3.5 px-4">Test Case Name</th>
                  <th className="py-3.5 px-4">Module</th>
                  <th className="py-3.5 px-4">Actual Result</th>
                  <th className="py-3.5 px-4 text-right">Duration</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {testCases.map((tc) => (
                  <tr key={tc.id} className="hover:bg-slate-800/25 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs text-indigo-300 whitespace-nowrap">
                      {tc.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{tc.name}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {tc.module}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 max-w-sm truncate">
                      {tc.actualResult}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs text-slate-400 whitespace-nowrap">
                      {tc.executionDurationMs ? `${tc.executionDurationMs} ms` : '—'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <TestStatusDisplay status={tc.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-medium text-slate-400 bg-[#0B1120]/60">
                  <th className="py-3.5 px-5">Bug ID</th>
                  <th className="py-3.5 px-4">Bug Title</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Assigned Developer</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {bugs.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/25 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs text-violet-300 whitespace-nowrap">
                      {b.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{b.title}</td>
                    <td className="py-3.5 px-4">
                      <BugSeverityDisplay severity={b.severity} />
                    </td>
                    <td className="py-3.5 px-4">
                      <BugPriorityText priority={b.priority} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                      {b.assignedDeveloper}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <BugStatusDisplay status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
