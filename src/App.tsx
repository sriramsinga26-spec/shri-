import { useEffect, useState } from 'react';
import { CheckCircle2, Menu } from 'lucide-react';
import { BugTrackingView } from './components/BugTrackingView';
import { DashboardView } from './components/DashboardView';
import { LoginView } from './components/LoginView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { Sidebar } from './components/Sidebar';
import { TestCasesView } from './components/TestCasesView';
import { TestExecutionView } from './components/TestExecutionView';
import {
  ActiveTab,
  BugReport,
  ExecutionRun,
  TestCase,
  UserAccount,
} from './types/testing';
import {
  loadBugs,
  loadExecutionRuns,
  loadSession,
  loadTestCases,
  loadUsers,
  resetAllDemoData,
  saveBugs,
  saveExecutionRuns,
  saveSession,
  saveTestCases,
  saveUsers,
} from './utils/storage';

const TAB_TITLES: Record<ActiveTab, string> = {
  dashboard: 'Dashboard',
  'test-cases': 'Test Cases',
  automation: 'Automated Execution',
  bugs: 'Bug Tracking',
  reports: 'Reports & Analytics',
};

export default function App() {
  const [users, setUsers] = useState<UserAccount[]>(() => loadUsers());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadSession());
  const [testCases, setTestCases] = useState<TestCase[]>(() => loadTestCases());
  const [bugs, setBugs] = useState<BugReport[]>(() => loadBugs());
  const [executionRuns, setExecutionRuns] = useState<ExecutionRun[]>(() =>
    loadExecutionRuns()
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefilledBugTestCase, setPrefilledBugTestCase] = useState<TestCase | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => setToastMessage(msg);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    saveSession(user);
    setActiveTab('dashboard');
    showToast(`Welcome back, ${user.fullName}`);
  };

  const handleRegisterUser = (newUser: UserAccount) => {
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    saveUsers(nextUsers);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveSession(null);
  };

  const handleResetDemoData = () => {
    const restored = resetAllDemoData();
    setTestCases(restored.testCases);
    setBugs(restored.bugs);
    setExecutionRuns(restored.executionRuns);
    showToast('Sample test cases and bug reports restored.');
  };

  // Test Case CRUD
  const handleAddTestCase = (tc: TestCase) => {
    const next = [tc, ...testCases];
    setTestCases(next);
    saveTestCases(next);
    showToast(`Added test case ${tc.id}`);
  };

  const handleUpdateTestCase = (previousId: string, updated: TestCase) => {
    const next = testCases.map((tc) => (tc.id === previousId ? updated : tc));
    setTestCases(next);
    saveTestCases(next);
    showToast(`Updated test case ${updated.id}`);
  };

  const handleDeleteTestCase = (id: string) => {
    const next = testCases.filter((tc) => tc.id !== id);
    setTestCases(next);
    saveTestCases(next);
    showToast(`Deleted test case ${id}`);
  };

  // Automated Execution
  const handleApplyExecutionResults = (
    updatedCases: TestCase[],
    newRun: ExecutionRun
  ) => {
    setTestCases(updatedCases);
    saveTestCases(updatedCases);

    const nextRuns = [newRun, ...executionRuns];
    setExecutionRuns(nextRuns);
    saveExecutionRuns(nextRuns);
    showToast(
      `Run ${newRun.id} complete: ${newRun.passed} passed, ${newRun.failed} failed.`
    );
  };

  const handleQuickReportBugFromFailure = (tc: TestCase) => {
    setPrefilledBugTestCase(tc);
    setActiveTab('bugs');
  };

  // Bug CRUD
  const handleAddBug = (bug: BugReport) => {
    const next = [bug, ...bugs];
    setBugs(next);
    saveBugs(next);
    showToast(`Reported ${bug.id}`);
  };

  const handleUpdateBug = (previousId: string, updated: BugReport) => {
    const next = bugs.map((b) => (b.id === previousId ? updated : b));
    setBugs(next);
    saveBugs(next);
    showToast(`Updated ${updated.id}`);
  };

  const handleDeleteBug = (id: string) => {
    const next = bugs.filter((b) => b.id !== id);
    setBugs(next);
    saveBugs(next);
    showToast(`Deleted ${id}`);
  };

  if (!currentUser) {
    return (
      <LoginView
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  const openBugsCount = bugs.filter(
    (b) => b.status === 'Open' || b.status === 'In Progress'
  ).length;

  return (
    <div className="min-h-screen w-full bg-[#080D1A] text-slate-100 flex">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={currentUser}
        onLogout={handleLogout}
        onResetDemoData={handleResetDemoData}
        counts={{
          testCases: testCases.length,
          openBugs: openBugsCount,
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Context Header Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-800/80 bg-[#080D1A]/95 backdrop-blur-xs sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 hidden sm:inline whitespace-nowrap">
                Automated Test &amp; Bug System
              </span>
              <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-white truncate">
                {TAB_TITLES[activeTab]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
            <span className="hidden md:inline font-mono tabular-nums">
              {testCases.length} Tests · {openBugsCount} Active Bugs
            </span>
          </div>
        </header>

        {/* Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1440px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              testCases={testCases}
              bugs={bugs}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'test-cases' && (
            <TestCasesView
              testCases={testCases}
              onAddTestCase={handleAddTestCase}
              onUpdateTestCase={handleUpdateTestCase}
              onDeleteTestCase={handleDeleteTestCase}
            />
          )}

          {activeTab === 'automation' && (
            <TestExecutionView
              testCases={testCases}
              bugs={bugs}
              executionRuns={executionRuns}
              currentUserName={currentUser.fullName}
              onApplyExecutionResults={handleApplyExecutionResults}
              onQuickReportBugFromFailure={handleQuickReportBugFromFailure}
            />
          )}

          {activeTab === 'bugs' && (
            <BugTrackingView
              bugs={bugs}
              testCases={testCases}
              prefilledTestCase={prefilledBugTestCase}
              onClearPrefill={() => setPrefilledBugTestCase(null)}
              onAddBug={handleAddBug}
              onUpdateBug={handleUpdateBug}
              onDeleteBug={handleDeleteBug}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAnalyticsView testCases={testCases} bugs={bugs} />
          )}
        </main>
      </div>

      {/* Non-blocking Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#0F172A] border border-indigo-500/40 text-sm text-white shadow-xl"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
