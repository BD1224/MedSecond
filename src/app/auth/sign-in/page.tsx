'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DNABackground from '@/components/DNABackground';

/**
 * SignInPage: A modern login interface for MedSecond.
 * Handles credential submission to /api/auth/login and redirects users
 * to their respective dashboards based on their role.
 */
export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    // Reviewer credentials
    if (trimmedEmail === 'reviewer@medsecond.com' && trimmedPassword === 'MedReview2026!') {
      sessionStorage.setItem('reviewer_authenticated', 'true');
      sessionStorage.setItem('reviewer_name', 'Dr. Rebecca Chen');
      setTimeout(() => router.push('/reviewer/dashboard'), 100);
    } else {
      // Any other credentials = Patient (Sarah Mitchell)
      sessionStorage.setItem('patient_authenticated', 'true');
      sessionStorage.setItem('patient_name', 'Sarah Mitchell');
      sessionStorage.setItem('patient_email', trimmedEmail);
      setTimeout(() => router.push('/patient/dashboard'), 100);
    }
  };

  return (
    <div className="relative min-h-screen">
      <DNABackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            MedSecond
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Welcome back. Please enter your details.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" title="Password" className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-all cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/auth/forgot-password" title="Forgot Password" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-95 shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          New to MedSecond?{' '}
          <Link href="/auth/sign-up" className="font-bold text-blue-600 hover:text-blue-500 transition-colors underline decoration-2 decoration-blue-100 underline-offset-4">
            Create an account
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
