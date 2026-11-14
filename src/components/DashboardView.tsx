import { useMemo, useState } from 'react';
import { ChartConfiguration } from 'chart.js/auto';
import {
  ArrowRight,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  PlayCircle,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { ActiveTab, BugReport, TestCase } from '../types/testing';
import { ChartCanvas } from './ChartCanvas';
import { BugSeverityDisplay, BugStatusDisplay, TestStatusDisplay } from './StatusIndicators';

interface DashboardViewProps {
  testCases: TestCase[];
  bugs: BugReport[];
  onNavigate: (tab: ActiveTab) => void;
}

export function DashboardView({ testCases, bugs, onNavigate }: DashboardViewProps) {
  const [bugChartMode, setBugChartMode] = useState<'status' | 'severity'>('status');

  const stats = useMemo(() => {
    const totalTests = testCases.length;
    const passedTests = testCases.filter((t) => t.status === 'Pass').length;
    const failedTests = testCases.filter((t) => t.status === 'Fail').length;
    const pendingTests = testCases.filter((t) => t.status === 'Pending').length;
    const totalBugs = bugs.length;
    const resolvedBugs = bugs.filter(
      (b) => b.status === 'Resolved' || b.status === 'Closed'
    ).length;

    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const resolutionRate = totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      pendingTests,
      totalBugs,
      resolvedBugs,
      passRate,
      resolutionRate,
    };
  }, [testCases, bugs]);

  const testExecutionChartConfig = useMemo<ChartConfiguration<'doughnut'>>(
    () => ({
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed', 'Pending'],
        datasets: [
          {
            data: [stats.passedTests, stats.failedTests, stats.pendingTests],
            backgroundColor: ['#10B981', '#F43F5E', '#F59E0B'],
            borderColor: '#0F172A',
            borderWidth: 3,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#CBD5E1',
              padding: 18,
              usePointStyle: true,
              pointStyle: 'rectRounded',
              font: { family: 'DM Sans, sans-serif', size: 12 },
            },
          },
          tooltip: {
            backgroundColor: '#0B1120',
            borderColor: '#334155',
            borderWidth: 1,
            titleColor: '#F8FAFC',
            bodyColor: '#CBD5E1',
            padding: 10,
          },
        },
      },
    }),
    [stats.passedTests, stats.failedTests, stats.pendingTests]
  );

  const bugStatsChartConfig = useMemo<ChartConfiguration<'bar'>>(() => {
    if (bugChartMode === 'status') {
      const openCount = bugs.filter((b) => b.status === 'Open').length;
      const inProgressCount = bugs.filter((b) => b.status === 'In Progress').length;
      const resolvedCount = bugs.filter((b) => b.status === 'Resolved').length;
      const closedCount = bugs.filter((b) => b.status === 'Closed').length;

      return {
        type: 'bar',
        data: {
          labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
          datasets: [
            {
              label: 'Bugs',
              data: [openCount, inProgressCount, resolvedCount, closedCount],
              backgroundColor: ['#F43F5E', '#6366F1', '#10B981', '#64748B'],
              borderRadius: 6,
              maxBarThickness: 46,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0B1120',
              borderColor: '#334155',
              borderWidth: 1,
              titleColor: '#F8FAFC',
              bodyColor: '#CBD5E1',
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
    }

    const criticalCount = bugs.filter((b) => b.severity === 'Critical').length;
    const highCount = bugs.filter((b) => b.severity === 'High').length;
    const mediumCount = bugs.filter((b) => b.severity === 'Medium').length;
    const lowCount = bugs.filter((b) => b.severity === 'Low').length;

    return {
      type: 'bar',
      data: {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [
          {
            label: 'Defects by Severity',
            data: [criticalCount, highCount, mediumCount, lowCount],
            backgroundColor: ['#F43F5E', '#FB923C', '#F59E0B', '#38BDF8'],
            borderRadius: 6,
            maxBarThickness: 46,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0B1120',
            borderColor: '#334155',
            borderWidth: 1,
            titleColor: '#F8FAFC',
            bodyColor: '#CBD5E1',
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
  }, [bugs, bugChartMode]);

  const summaryCards = [
    {
      label: 'Total Test Cases',
      value: stats.totalTests,
      subtext: 'Registered in suite',
      icon: ClipboardCheck,
      iconClass: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Passed Test Cases',
      value: stats.passedTests,
      subtext: `${stats.passRate}% pass rate`,
      icon: CheckCircle2,
      iconClass: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Failed Test Cases',
      value: stats.failedTests,
      subtext: 'Requires defect review',
      icon: XCircle,
      iconClass: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      label: 'Pending Test Cases',
      value: stats.pendingTests,
      subtext: 'Queued for execution',
      icon: Clock,
      iconClass: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Total Bugs',
      value: stats.totalBugs,
      subtext: `${bugs.filter((b) => b.status === 'Open').length} currently open`,
      icon: Bug,
      iconClass: 'text-violet-400',
      iconBg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      label: 'Resolved Bugs',
      value: stats.resolvedBugs,
      subtext: `${stats.resolutionRate}% resolution rate`,
      icon: ShieldCheck,
      iconClass: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Quality Overview
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time metrics across automated test suites and tracked software defects.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('automation')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" aria-hidden="true" />
            <span>Run Automated Tests</span>
          </button>
        </div>
      </div>

      {/* 6 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="p-5 rounded-xl bg-[#0F172A] border border-slate-800/90 flex flex-col justify-between gap-4 transition-colors hover:border-slate-700"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${card.iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${card.iconClass}`} aria-hidden="true" />
                </div>
              </div>
              <div>
                <p className="font-mono tabular-nums text-3xl font-semibold text-white tracking-tight">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Chart.js Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Test Execution Results */}
        <section className="p-6 rounded-xl bg-[#0F172A] border border-slate-800/90 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Test Execution Results
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Distribution of Pass, Fail, and Pending assertions
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 whitespace-nowrap cursor-pointer"
            >
              <span>Full Report</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ChartCanvas
              config={testExecutionChartConfig}
              ariaLabel="Test Execution Results Doughnut Chart"
            />
          </div>
        </section>

        {/* Chart 2: Bug Statistics */}
        <section className="p-6 rounded-xl bg-[#0F172A] border border-slate-800/90 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Bug Statistics
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Defect breakdown by {bugChartMode === 'status' ? 'workflow status' : 'severity level'}
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080D1A] border border-slate-800">
              <button
                type="button"
                onClick={() => setBugChartMode('status')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  bugChartMode === 'status'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                By Status
              </button>
              <button
                type="button"
                onClick={() => setBugChartMode('severity')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  bugChartMode === 'severity'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                By Severity
              </button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ChartCanvas
              config={bugStatsChartConfig}
              ariaLabel="Bug Statistics Bar Chart"
            />
          </div>
        </section>
      </div>

      {/* Recent Test Cases & Active Bugs Preview Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Test Cases */}
        <section className="rounded-xl bg-[#0F172A] border border-slate-800/90 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-semibold text-white">
              Recent Test Cases
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('test-cases')}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 whitespace-nowrap cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-medium text-slate-400">
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-4">Test Case</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {testCases.slice(0, 5).map((tc) => (
                  <tr key={tc.id} className="hover:bg-slate-800/35 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs text-indigo-300 whitespace-nowrap">
                      {tc.id}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium max-w-[240px] truncate">
                      {tc.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {tc.module}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <TestStatusDisplay status={tc.status} />
                    </td>
                  </tr>
                ))}
                {testCases.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-slate-400">
                      No test cases added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Active Bug Reports */}
        <section className="rounded-xl bg-[#0F172A] border border-slate-800/90 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-semibold text-white">
              Tracked Bug Reports
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('bugs')}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 whitespace-nowrap cursor-pointer"
            >
              <span>Open Bug Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-medium text-slate-400">
                  <th className="py-3 px-5">Bug ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {bugs.slice(0, 5).map((bug) => (
                  <tr key={bug.id} className="hover:bg-slate-800/35 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs text-violet-300 whitespace-nowrap">
                      {bug.id}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium max-w-[240px] truncate">
                      {bug.title}
                    </td>
                    <td className="py-3 px-4">
                      <BugSeverityDisplay severity={bug.severity} />
                    </td>
                    <td className="py-3 px-5 text-right">
                      <BugStatusDisplay status={bug.status} />
                    </td>
                  </tr>
                ))}
                {bugs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-slate-400">
                      No defects logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
