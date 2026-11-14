import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { TestCase, TestCaseStatus } from '../types/testing';
import { TestStatusDisplay } from './StatusIndicators';

interface TestCasesViewProps {
  testCases: TestCase[];
  onAddTestCase: (tc: TestCase) => void;
  onUpdateTestCase: (previousId: string, tc: TestCase) => void;
  onDeleteTestCase: (id: string) => void;
}

interface FormState {
  id: string;
  name: string;
  module: string;
  description: string;
  expectedResult: string;
  actualResult: string;
  status: TestCaseStatus;
}

export function TestCasesView({
  testCases,
  onAddTestCase,
  onUpdateTestCase,
  onDeleteTestCase,
}: TestCasesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TestCaseStatus>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestCase | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const suggestNextId = () => {
    const nums = testCases
      .map((t) => parseInt(t.id.replace(/\D/g, ''), 10))
      .filter((n) => !Number.isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 100;
    return `TC-${max + 1}`;
  };

  const [form, setForm] = useState<FormState>({
    id: '',
    name: '',
    module: 'Authentication',
    description: '',
    expectedResult: '',
    actualResult: '',
    status: 'Pending',
  });

  const filteredTestCases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return testCases.filter((tc) => {
      const matchesStatus = statusFilter === 'All' || tc.status === statusFilter;
      const matchesQuery =
        !q ||
        tc.id.toLowerCase().includes(q) ||
        tc.name.toLowerCase().includes(q) ||
        tc.module.toLowerCase().includes(q) ||
        tc.description.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [testCases, searchQuery, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setFormError(null);
    setForm({
      id: suggestNextId(),
      name: '',
      module: 'Authentication',
      description: '',
      expectedResult: '',
      actualResult: '',
      status: 'Pending',
    });
    setModalOpen(true);
  };

  const openEditModal = (tc: TestCase) => {
    setEditingId(tc.id);
    setFormError(null);
    setForm({
      id: tc.id,
      name: tc.name,
      module: tc.module,
      description: tc.description,
      expectedResult: tc.expectedResult,
      actualResult: tc.actualResult,
      status: tc.status,
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanId = form.id.trim();
    const cleanName = form.name.trim();
    const cleanDesc = form.description.trim();
    const cleanExpected = form.expectedResult.trim();
    const cleanActual = form.actualResult.trim();

    if (!cleanId || !cleanName || !cleanDesc || !cleanExpected) {
      setFormError('Test Case ID, Name, Description, and Expected Result are required.');
      return;
    }

    const duplicate = testCases.some(
      (t) => t.id.toLowerCase() === cleanId.toLowerCase() && t.id !== editingId
    );
    if (duplicate) {
      setFormError(`Test Case ID "${cleanId}" already exists.`);
      return;
    }

    if (editingId) {
      const existing = testCases.find((t) => t.id === editingId);
      onUpdateTestCase(editingId, {
        id: cleanId,
        name: cleanName,
        module: form.module.trim() || 'General',
        description: cleanDesc,
        expectedResult: cleanExpected,
        actualResult: cleanActual || 'Pending execution.',
        status: form.status,
        lastExecutedAt:
          form.status !== 'Pending'
            ? existing?.lastExecutedAt || new Date().toISOString()
            : null,
        executionDurationMs: existing?.executionDurationMs ?? null,
        createdAt: existing?.createdAt || new Date().toISOString(),
      });
    } else {
      onAddTestCase({
        id: cleanId,
        name: cleanName,
        module: form.module.trim() || 'General',
        description: cleanDesc,
        expectedResult: cleanExpected,
        actualResult: cleanActual || 'Awaiting automated execution.',
        status: form.status,
        lastExecutedAt: form.status !== 'Pending' ? new Date().toISOString() : null,
        executionDurationMs: null,
        createdAt: new Date().toISOString(),
      });
    }

    setModalOpen(false);
  };

  const counts = useMemo(() => {
    return {
      All: testCases.length,
      Pass: testCases.filter((t) => t.status === 'Pass').length,
      Fail: testCases.filter((t) => t.status === 'Fail').length,
      Pending: testCases.filter((t) => t.status === 'Pending').length,
    };
  }, [testCases]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Test Case Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create, edit, and maintain test specifications with expected and actual outcomes.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Test Case</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#0F172A] border border-slate-800/90">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, module, or description..."
            aria-label="Search test cases"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#080D1A] border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080D1A] border border-slate-800 overflow-x-auto">
          {(['All', 'Pass', 'Fail', 'Pending'] as const).map((status) => (
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
              {status} <span className="font-mono tabular-nums opacity-80">({counts[status]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Test Cases Data Table */}
      <div className="rounded-xl bg-[#0F172A] border border-slate-800/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/90 text-xs font-medium text-slate-400 bg-[#0B1120]/60">
                <th className="py-3.5 px-5 whitespace-nowrap">Test Case ID</th>
                <th className="py-3.5 px-4">Test Case &amp; Description</th>
                <th className="py-3.5 px-4">Expected Result</th>
                <th className="py-3.5 px-4">Actual Result</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {filteredTestCases.map((tc) => (
                <tr key={tc.id} className="hover:bg-slate-800/30 transition-colors align-top">
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-indigo-300">
                      {tc.id}
                    </span>
                    <div className="text-xs text-slate-500 mt-1">{tc.module}</div>
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <div className="font-medium text-white">{tc.name}</div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tc.description}
                    </p>
                  </td>
                  <td className="py-4 px-4 max-w-xs text-xs text-slate-300 leading-relaxed">
                    {tc.expectedResult}
                  </td>
                  <td className="py-4 px-4 max-w-xs text-xs text-slate-300 leading-relaxed">
                    {tc.actualResult}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <TestStatusDisplay status={tc.status} />
                  </td>
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(tc)}
                        aria-label={`Edit ${tc.id}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(tc)}
                        aria-label={`Delete ${tc.id}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTestCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <p className="text-sm font-medium text-slate-300">
                      No matching test cases found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Adjust your search query or add a new test case to begin.
                    </p>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Add Test Case</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tc-modal-title"
        >
          <div className="w-full max-w-2xl rounded-xl bg-[#0F172A] border border-slate-700/80 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 id="tc-modal-title" className="font-display text-lg font-bold text-white">
                {editingId ? `Edit Test Case (${editingId})` : 'Add New Test Case'}
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
                  <label htmlFor="tc-id" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Test Case ID
                  </label>
                  <input
                    id="tc-id"
                    type="text"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder="TC-111"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="tc-module" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Module
                  </label>
                  <input
                    id="tc-module"
                    type="text"
                    value={form.module}
                    onChange={(e) => setForm({ ...form, module: e.target.value })}
                    placeholder="Authentication"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="tc-status" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    id="tc-status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as TestCaseStatus })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="tc-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Test Case Name
                </label>
                <input
                  id="tc-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Verify session timeout redirect after 30 minutes"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="tc-desc" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Test Description
                </label>
                <textarea
                  id="tc-desc"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe preconditions and test steps..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tc-expected" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Expected Result
                  </label>
                  <textarea
                    id="tc-expected"
                    rows={3}
                    value={form.expectedResult}
                    onChange={(e) => setForm({ ...form, expectedResult: e.target.value })}
                    placeholder="What should happen when test passes..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="tc-actual" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Actual Result
                  </label>
                  <textarea
                    id="tc-actual"
                    rows={3}
                    value={form.actualResult}
                    onChange={(e) => setForm({ ...form, actualResult: e.target.value })}
                    placeholder="Observed system output (optional if Pending)..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080D1A] border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
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
                  {editingId ? 'Save Changes' : 'Create Test Case'}
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
            <h2 className="font-display text-lg font-bold text-white">Delete Test Case?</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to remove{' '}
              <span className="font-mono text-indigo-300">{deleteTarget.id}</span> ({deleteTarget.name})?
              This updates dashboard metrics immediately.
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
                  onDeleteTestCase(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold cursor-pointer"
              >
                Delete Test Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
