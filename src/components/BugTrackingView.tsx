import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import {
  BugPriority,
  BugReport,
  BugSeverity,
  BugStatus,
  TestCase,
} from '../types/testing';
import {
  BugPriorityText,
  BugSeverityDisplay,
  BugStatusDisplay,
} from './StatusIndicators';

interface BugTrackingViewProps {
  bugs: BugReport[];
  testCases: TestCase[];
  prefilledTestCase: TestCase | null;
  onClearPrefill: () => void;
  onAddBug: (bug: BugReport) => void;
  onUpdateBug: (previousId: string, bug: BugReport) => void;
  onDeleteBug: (id: string) => void;
}

interface BugFormState {
  id: string;
  title: string;
  description: string;
  severity: BugSeverity;
  priority: BugPriority;
  assignedDeveloper: string;
  status: BugStatus;
  linkedTestCaseId: string;
}

const DEVELOPERS = [
  'Vikram Patel',
  'Meera Nair',
  'Siddharth Rao',
  'Priya Menon',
  'Arjun Deshmukh',
];

export function BugTrackingView({
  bugs,
  testCases,
  prefilledTestCase,
  onClearPrefill,
  onAddBug,
  onUpdateBug,
  onDeleteBug,
}: BugTrackingViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BugStatus>('All');
  const [severityFilter, setSeverityFilter] = useState<'All' | BugSeverity>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BugReport | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const suggestNextBugId = () => {
    const nums = bugs
      .map((b) => parseInt(b.id.replace(/\D/g, ''), 10))
      .filter((n) => !Number.isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 200;
    return `BUG-${max + 1}`;
  };

  const [form, setForm] = useState<BugFormState>({
    id: '',
    title: '',
    description: '',
    severity: 'High',
    priority: 'P2 - High',
    assignedDeveloper: DEVELOPERS[0],
    status: 'Open',
    linkedTestCaseId: '',
  });

  useEffect(() => {
    if (prefilledTestCase) {
      setEditingId(null);
      setFormError(null);
      setForm({
        id: suggestNextBugId(),
        title: `Failure in ${prefilledTestCase.id}: ${prefilledTestCase.name}`,
        description: `Automated test failed during execution.\nExpected: ${prefilledTestCase.expectedResult}\nActual: ${prefilledTestCase.actualResult}`,
        severity: 'High',
        priority: 'P2 - High',
        assignedDeveloper: DEVELOPERS[0],
        status: 'Open',
        linkedTestCaseId: prefilledTestCase.id,
      });
      setModalOpen(true);
      onClearPrefill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledTestCase]);

  const filteredBugs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bugs.filter((bug) => {
      const matchesStatus = statusFilter === 'All' || bug.status === statusFilter;
      const matchesSeverity =
        severityFilter === 'All' || bug.severity === severityFilter;
      const matchesQuery =
        !q ||
        bug.id.toLowerCase().includes(q) ||
        bug.title.toLowerCase().includes(q) ||
        bug.description.toLowerCase().includes(q) ||
        bug.assignedDeveloper.toLowerCase().includes(q);
      return matchesStatus && matchesSeverity && matchesQuery;
    });
  }, [bugs, searchQuery, statusFilter, severityFilter]);

  const statusCounts = useMemo(
    () => ({
      All: bugs.length,
      Open: bugs.filter((b) => b.status === 'Open').length,
      'In Progress': bugs.filter((b) => b.status === 'In Progress').length,
      Resolved: bugs.filter((b) => b.status === 'Resolved').length,
      Closed: bugs.filter((b) => b.status === 'Closed').length,
    }),
    [bugs]
  );

  const openReportModal = () => {
    setEditingId(null);
    setFormError(null);
    setForm({
      id: suggestNextBugId(),
      title: '',
      description: '',
      severity: 'Medium',
      priority: 'P3 - Medium',
      assignedDeveloper: DEVELOPERS[0],
      status: 'Open',
      linkedTestCaseId: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (bug: BugReport) => {
    setEditingId(bug.id);
    setFormError(null);
    setForm({
      id: bug.id,
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      priority: bug.priority,
      assignedDeveloper: bug.assignedDeveloper,
      status: bug.status,
      linkedTestCaseId: bug.linkedTestCaseId || '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanId = form.id.trim();
    const cleanTitle = form.title.trim();
    const cleanDesc = form.description.trim();
    const cleanDev = form.assignedDeveloper.trim();

    if (!cleanId || !cleanTitle || !cleanDesc || !cleanDev) {
      setFormError('Bug ID, Title, Description, and Assigned Developer are required.');
      return;
    }

    const duplicate = bugs.some(
      (b) => b.id.toLowerCase() === cleanId.toLowerCase() && b.id !== editingId
    );
    if (duplicate) {
      setFormError(`Bug ID "${cleanId}" already exists.`);
      return;
    }

    const nowIso = new Date().toISOString();

    if (editingId) {
      const existing = bugs.find((b) => b.id === editingId);
      onUpdateBug(editingId, {
        id: cleanId,
        title: cleanTitle,
        description: cleanDesc,
        severity: form.severity,
        priority: form.priority,
        assignedDeveloper: cleanDev,
        status: form.status,
        linkedTestCaseId: form.linkedTestCaseId || undefined,
        createdAt: existing?.createdAt || nowIso,
        updatedAt: nowIso,
      });
    } else {
      onAddBug({
        id: cleanId,
        title: cleanTitle,
        description: cleanDesc,
        severity: form.severity,
        priority: form.priority,
        assignedDeveloper: cleanDev,
        status: form.status,
        linkedTestCaseId: form.linkedTestCaseId || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    setModalOpen(false);
  };

  const handleInlineStatusChange = (bug: BugReport, nextStatus: BugStatus) => {
    onUpdateBug(bug.id, {
      ...bug,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Bug Tracking System
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Report defects, assign developers, triage severity, and track resolution progress.
          </p>
        </div>
        <button
          type="button"
          onClick={openReportModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Report New Bug</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 rounded-xl bg-[#0F172A] border border-slate-800/90">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Bug ID, title, or developer..."
              aria-label="Search bugs"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#080D1A] border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as 'All' | BugSeverity)}
            aria-label="Filter by severity"
            className="px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080D1A] border border-slate-800 overflow-x-auto">
          {(['All', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}{' '}
              <span className="font-mono tabular-nums opacity-80">
                ({statusCounts[status]})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bug Table */}
      <div className="rounded-xl bg-[#0F172A] border border-slate-800/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/90 text-xs font-medium text-slate-400 bg-[#0B1120]/60">
                <th className="py-3.5 px-5 whitespace-nowrap">Bug ID</th>
                <th className="py-3.5 px-4">Title &amp; Description</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Severity</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Priority</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Developer</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {filteredBugs.map((bug) => (
                <tr key={bug.id} className="hover:bg-slate-800/30 transition-colors align-top">
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-violet-300">
                      {bug.id}
                    </span>
                    {bug.linkedTestCaseId && (
                      <div className="text-xs font-mono text-slate-500 mt-1">
                        {bug.linkedTestCaseId}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 max-w-sm">
                    <div className="font-medium text-white">{bug.title}</div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {bug.description}
                    </p>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <BugSeverityDisplay severity={bug.severity} />
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <BugPriorityText priority={bug.priority} />
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-200 whitespace-nowrap">
                    {bug.assignedDeveloper}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5 items-start">
                      <BugStatusDisplay status={bug.status} />
                      <select
                        aria-label={`Change status for ${bug.id}`}
                        value={bug.status}
                        onChange={(e) =>
                          handleInlineStatusChange(bug, e.target.value as BugStatus)
                        }
                        className="text-[11px] bg-[#080D1A] border border-slate-700/80 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Open">Set Open</option>
                        <option value="In Progress">Set In Progress</option>
                        <option value="Resolved">Set Resolved</option>
                        <option value="Closed">Set Closed</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(bug)}
                        aria-label={`Edit ${bug.id}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(bug)}
                        aria-label={`Delete ${bug.id}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBugs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center">
                    <p className="text-sm font-medium text-slate-300">
                      No matching bug reports found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Adjust your filters or report a new defect.
                    </p>
                    <button
                      type="button"
                      onClick={openReportModal}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Report New Bug</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report / Edit Bug Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bug-modal-title"
        >
          <div className="w-full max-w-2xl rounded-xl bg-[#0F172A] border border-slate-700/80 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 id="bug-modal-title" className="font-display text-lg font-bold text-white">
                {editingId ? `Update Bug (${editingId})` : 'Report New Bug'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="bug-id" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Bug ID
                  </label>
                  <input
                    id="bug-id"
                    type="text"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder="BUG-208"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="bug-severity" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Bug Severity
                  </label>
                  <select
                    id="bug-severity"
                    value={form.severity}
                    onChange={(e) =>
                      setForm({ ...form, severity: e.target.value as BugSeverity })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bug-priority" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Bug Priority
                  </label>
                  <select
                    id="bug-priority"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value as BugPriority })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="P1 - Urgent">P1 - Urgent</option>
                    <option value="P2 - High">P2 - High</option>
                    <option value="P3 - Medium">P3 - Medium</option>
                    <option value="P4 - Low">P4 - Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="bug-title" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Bug Title
                </label>
                <input
                  id="bug-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Concise summary of the defect..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="bug-desc" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Bug Description
                </label>
                <textarea
                  id="bug-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Steps to reproduce, environment, and observed behavior..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="bug-dev" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Assign Developer
                  </label>
                  <input
                    id="bug-dev"
                    list="developer-suggestions"
                    type="text"
                    value={form.assignedDeveloper}
                    onChange={(e) =>
                      setForm({ ...form, assignedDeveloper: e.target.value })
                    }
                    placeholder="Developer name"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <datalist id="developer-suggestions">
                    {DEVELOPERS.map((dev) => (
                      <option key={dev} value={dev} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="bug-status" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Bug Status
                  </label>
                  <select
                    id="bug-status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as BugStatus })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bug-tc" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Linked Test Case
                  </label>
                  <select
                    id="bug-tc"
                    value={form.linkedTestCaseId}
                    onChange={(e) =>
                      setForm({ ...form, linkedTestCaseId: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None</option>
                    {testCases.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.id} · {tc.name.slice(0, 28)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#080D1A] hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {editingId ? 'Update Bug' : 'Submit Bug Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-[#0F172A] border border-slate-700/80 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-white">Delete Bug Report?</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <span className="font-mono text-violet-300">{deleteTarget.id}</span> ({deleteTarget.title})?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-[#080D1A] hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBug(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold cursor-pointer"
              >
                Delete Bug
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
