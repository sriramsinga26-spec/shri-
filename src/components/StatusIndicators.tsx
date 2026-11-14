import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { BugPriority, BugSeverity, BugStatus, TestCaseStatus } from '../types/testing';

export function TestStatusDisplay({ status }: { status: TestCaseStatus }) {
  if (status === 'Pass') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
        <span>Pass</span>
      </span>
    );
  }
  if (status === 'Fail') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 whitespace-nowrap">
        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
        <span>Fail</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
      <span>Pending</span>
    </span>
  );
}

export function BugSeverityDisplay({ severity }: { severity: BugSeverity }) {
  switch (severity) {
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 whitespace-nowrap">
          <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Critical</span>
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>High</span>
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Medium</span>
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300 whitespace-nowrap">
          <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Low</span>
        </span>
      );
  }
}

export function BugStatusDisplay({ status }: { status: BugStatus }) {
  switch (status) {
    case 'Open':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
          <span>Open</span>
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
          <span>In Progress</span>
        </span>
      );
    case 'Resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>Resolved</span>
        </span>
      );
    case 'Closed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/40 text-slate-300 border border-slate-600/40 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span>Closed</span>
        </span>
      );
  }
}

export function BugPriorityText({ priority }: { priority: BugPriority }) {
  const colorMap: Record<BugPriority, string> = {
    'P1 - Urgent': 'text-rose-300',
    'P2 - High': 'text-orange-300',
    'P3 - Medium': 'text-slate-200',
    'P4 - Low': 'text-slate-400',
  };
  return (
    <span className={`text-xs font-mono tabular-nums font-medium whitespace-nowrap ${colorMap[priority]}`}>
      {priority}
    </span>
  );
}
