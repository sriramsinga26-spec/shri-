import React, { useState } from 'react';
import {
  ArrowRight,
  Bug,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  Lock,
  Play,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { UserAccount } from '../types/testing';

interface LoginViewProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterUser: (newUser: UserAccount) => void;
}

export function LoginView({ users, onLoginSuccess, onRegisterUser }: LoginViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('QA Engineer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleModeSwitch = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError(null);
    setSuccessMsg(null);
  };

  const handleFillDemo = () => {
    setMode('login');
    setUsername('admin');
    setPassword('password123');
    setError(null);
    setSuccessMsg('Demo QA Lead credentials populated. Click Login to continue.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter both username and password.');
      return;
    }

    if (mode === 'login') {
      const matched = users.find(
        (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase() && u.password === trimmedPassword
      );
      if (!matched) {
        setError('Invalid username or password. Try "admin" / "password123" or register a new account.');
        return;
      }
      onLoginSuccess(matched);
      return;
    }

    // Registration flow
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    const exists = users.some(
      (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
    );
    if (exists) {
      setError('That username is already registered. Please choose another or log in.');
      return;
    }

    const created: UserAccount = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      username: trimmedUsername,
      password: trimmedPassword,
      fullName: fullName.trim() || trimmedUsername,
      role: role.trim() || 'QA Engineer',
      createdAt: new Date().toISOString(),
    };

    onRegisterUser(created);
    onLoginSuccess(created);
  };

  return (
    <div className="min-h-screen w-full bg-[#080D1A] text-slate-100 grid lg:grid-cols-12 items-stretch">
      {/* Left Architectural Showcase Column */}
      <div className="relative lg:col-span-7 flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-[#0B1224]">
        {/* Generated Architectural Background */}
        {!imgError ? (
          <img
            src="/src/assets/images/login_testing_backdrop_1794632101629.jpg"
            alt="Software testing geometric architecture mesh"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#131C3A] to-[#1E1B4B] opacity-90 pointer-events-none"
            aria-hidden="true"
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-[#080D1A]/75 to-[#080D1A]/40 pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Brand Identity */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Automated Test &amp; Defect Suite
          </span>
        </div>

        {/* Center Hero Headline & Capabilities */}
        <div className="relative z-10 my-12 max-w-2xl">
          <p className="text-sm font-medium text-indigo-300 mb-3 tracking-wide">
            Quality Assurance Management Platform
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.15] text-balance">
            Automated Test Case Management and Bug Tracking System
          </h1>
          <p className="mt-5 text-base text-slate-300 leading-relaxed max-w-xl">
            Manage test suites, execute automated validation runs in real time, track defects across severity tiers, and export audit-ready CSV reports from one unified workspace.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-5 pt-8 border-t border-slate-700/50">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-1.5">
                <FileCheck2 className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
                <span>Test Case CRUD</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Author, edit, filter, and organize expected vs. actual results.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-1.5">
                <Play className="w-4 h-4 text-violet-400 shrink-0" aria-hidden="true" />
                <span>Automated Runner</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulate instant test execution runs and surface failures immediately.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-1.5">
                <Bug className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
                <span>Defect Lifecycle</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assign developers, prioritize severity, and export Chart.js analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Quiet Attribution */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span>LocalStorage Prototype Persistence</span>
          <span aria-hidden="true">·</span>
          <span>Chart.js Interactive Analytics</span>
          <span aria-hidden="true">·</span>
          <span>RFC-4180 CSV Export</span>
        </div>
      </div>

      {/* Right Authentication Form Column */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#080D1A]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Sign in to workspace' : 'Register QA account'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {mode === 'login'
                ? 'Enter your credentials to access the testing dashboard.'
                : 'Create a local engineer account saved in browser storage.'}
            </p>
          </div>

          {/* Mode Segmented Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#0F172A] border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`py-2 px-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('register')}
              className={`py-2 px-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm"
            >
              {error}
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reg-fullname"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-role"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Role
                  </label>
                  <select
                    id="reg-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="Automation Engineer">Automation Engineer</option>
                    <option value="Test Lead">Test Lead</option>
                    <option value="Software Developer">Software Developer</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-username"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <User
                  className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="auth-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. admin)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0F172A] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? 'Enter password' : 'Minimum 6 characters'}
                  className="w-full pl-10 pr-11 py-2.5 rounded-lg bg-[#0F172A] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 whitespace-nowrap cursor-pointer"
              >
                {mode === 'login' ? (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                    <span>Register</span>
                  </>
                )}
              </button>

              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  <span>Register</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
                >
                  Back to Login
                </button>
              )}
            </div>
          </form>

          {/* Quick Evaluator Credential Helper */}
          <div className="mt-8 pt-6 border-t border-slate-800/90">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400 space-y-1">
                <p className="font-medium text-slate-300">Prototype Demo Account</p>
                <p className="font-mono text-slate-400">
                  admin / password123
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3.5 py-2 rounded-lg bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-violet-300 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Use Demo Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
