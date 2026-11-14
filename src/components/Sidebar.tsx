import { useState } from 'react';
import {
  BarChart3,
  Bug,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ActiveTab, UserAccount } from '../types/testing';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  user: UserAccount;
  onLogout: () => void;
  onResetDemoData: () => void;
  counts: {
    testCases: number;
    openBugs: number;
  };
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  user,
  onLogout,
  onResetDemoData,
  counts,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [avatarError, setAvatarError] = useState(false);

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'test-cases', label: 'Test Cases', icon: ClipboardCheck, badge: counts.testCases },
    { id: 'automation', label: 'Test Execution', icon: PlayCircle },
    { id: 'bugs', label: 'Bug Tracker', icon: Bug, badge: counts.openBugs },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const handleNavClick = (id: ActiveTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 bg-[#0B1120] border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="font-display font-bold text-sm text-white truncate">
            TestTrack QA
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Primary Sidebar Navigation" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/35'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </span>
              {typeof item.badge === 'number' && (
                <span
                  className={`text-xs font-mono tabular-nums ${
                    isActive ? 'text-indigo-300' : 'text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls & User Profile */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 shrink-0">
        <button
          type="button"
          onClick={onResetDemoData}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-[#0F172A] hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span>Reset Demo Data</span>
        </button>

        <div className="flex items-center justify-between gap-2.5 pt-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {!avatarError ? (
              <img
                src="/src/assets/images/qa_engineer_avatar_1794632102807.jpg"
                alt={user.fullName}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-indigo-600/25 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-200 shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
