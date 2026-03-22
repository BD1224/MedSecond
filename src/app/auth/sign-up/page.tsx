'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DNABackground from '@/components/DNABackground';
import { handleSignUp } from '@/app/auth/actions';

type AccountType = 'patient' | 'assessor' | null;

export default function SignUpPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [step, setStep] = useState<'select' | 'form'>('select');
  
  // Common fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reviewer-specific fields
  const [role, setRole] = useState('');
  const [institution, setInstitution] = useState('');
  const [credentials, setCredentials] = useState('');

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setStep('form');
    setError('');
  };

  const handleBackToSelection = () => {
    setStep('select');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (accountType === 'assessor' && (!role || !credentials)) {
      setError('Please provide your role and credentials');
      setLoading(false);
      return;
    }

    // Call server action to sign up with Supabase
    const result = await handleSignUp(
      email,
      password,
      fullName,
      accountType!,
      accountType === 'assessor'
        ? { role, institution, credentials }
        : undefined
    );

    console.log('Signup response:', result);

    if (!result.success) {
      console.error('Signup failed:', result.error);
      setError(result.error || 'Signup failed');
      setLoading(false);
      return;
    }

    console.log('Signup successful, redirecting to dashboard');
    // Redirect to appropriate dashboard on success
    const redirectPath = accountType === 'assessor' ? '/reviewer/dashboard' : '/patient/dashboard';
    router.push(redirectPath);
  };

  const Icon = {
    user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    stethoscope: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2M5 12v6m7-6v6m5-9a4.5 4.5 0 0 0-9 0M9 13h6M6 16a2 2 0 0 0-2 2v2m12-2v2a2 2 0 0 1-2 2"/></svg>,
    check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
    shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    lock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  };

  return (
    <div className="relative min-h-screen bg-transparent">
      <DNABackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        
        {/* ACCOUNT TYPE SELECTION STEP */}
        {step === 'select' && (
          <div className="w-full max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
                Join MedSecond
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                Choose how you'd like to participate. Whether seeking trusted second opinions or contributing your medical expertise, we're here to bridge the gap between affordable access and professional insight.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* PATIENT CARD */}
              <button
                onClick={() => handleAccountTypeSelect('patient')}
                className="group relative bg-white/90 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-[#0A81FF]/40 transition-all duration-300 text-left overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50 group-hover:to-transparent transition-all duration-300" />
                
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A81FF] to-[#3A9BFF] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4">
                    {Icon.user}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">I'm a Patient</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Upload your medical concerns, manage multiple cases, store records securely, and receive trusted second opinions from verified medical professionals.
                  </p>
                  
                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <span className="text-[#0A81FF]">{Icon.check}</span>
                      <span>Easy case uploads & management</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <span className="text-[#0A81FF]">{Icon.check}</span>
                      <span>Secure medical record storage</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <span className="text-[#0A81FF]">{Icon.check}</span>
                      <span>Multiple professional perspectives</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 text-[#0A81FF] text-sm font-semibold group-hover:bg-blue-100 transition-colors">
                    Get Started {Icon.arrow}
                  </div>
                </div>
              </button>

              {/* REVIEWER CARD */}
              <button
                onClick={() => handleAccountTypeSelect('assessor')}
                className="group relative bg-white/90 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-400/40 transition-all duration-300 text-left overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50 group-hover:to-transparent transition-all duration-300" />
                
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-4">
                    {Icon.stethoscope}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">I'm a Medical Reviewer</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Apply with your credentials or education status, review cases, build professional reputation, and contribute verified expertise to our community.
                  </p>
                  
                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <span className="text-emerald-600">{Icon.check}</span>
                      <span>Verified credential verification</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <span className="text-emerald-600">{Icon.check}</span>
                      <span>Build trust and reputation</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <span className="text-emerald-600">{Icon.check}</span>
                      <span>Structured case review workflow</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-semibold group-hover:bg-emerald-100 transition-colors">
                    Apply Now {Icon.arrow}
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/auth/sign-in" className="font-bold text-[#0A81FF] hover:text-blue-700 transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* FORM STEP */}
        {step === 'form' && (
          <div className="w-full max-w-md">
            <button
              onClick={handleBackToSelection}
              className="mb-6 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              ← Back to account type
            </button>

            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/70 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg ${
                  accountType === 'assessor'
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/20'
                    : 'bg-gradient-to-br from-[#0A81FF] to-[#3A9BFF] shadow-blue-500/20'
                } text-white`}>
                  {accountType === 'assessor' ? Icon.stethoscope : Icon.user}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {accountType === 'assessor' ? 'Apply as Medical Reviewer' : 'Create Patient Account'}
                </h2>
                <p className="text-sm text-slate-500">
                  {accountType === 'assessor' 
                    ? 'Join our verified reviewer network' 
                    : 'Get started with your second opinion journey'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Sarah Johnson"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm outline-none focus:border-[#0A81FF] focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm outline-none focus:border-[#0A81FF] focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>

                {/* Reviewer-specific fields */}
                {accountType === 'assessor' && (
                  <>
                    {/* Role */}
                    <div>
                      <label htmlFor="role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        Professional Role
                      </label>
                      <select
                        id="role"
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm outline-none focus:border-[#0A81FF] focus:ring-2 focus:ring-blue-500/10 transition-all"
                      >
                        <option value="">Select your role...</option>
                        <option value="md">Medical Doctor (MD)</option>
                        <option value="do">Doctor of Osteopathic Medicine (DO)</option>
                        <option value="specialist">Medical Specialist</option>
                        <option value="student">Medical Student</option>
                        <option value="resident">Resident Physician</option>
                        <option value="other">Other Healthcare Professional</option>
                      </select>
                    </div>

                    {/* Institution */}
                    <div>
                      <label htmlFor="institution" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        Institution / Practice
                      </label>
                      <input
                        id="institution"
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Medical Center or University"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm outline-none focus:border-[#0A81FF] focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Credentials */}
                    <div>
                      <label htmlFor="credentials" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        License / Credentials <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="credentials"
                        required
                        value={credentials}
                        onChange={(e) => setCredentials(e.target.value)}
                        placeholder="e.g., MD License #12345, Board Cert. Cardiology"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm outline-none focus:border-[#0A81FF] focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 resize-none"
                      />
                      <p className="text-xs text-slate-400 mt-1">Your credentials will be securely verified before account activation</p>
                    </div>
                  </>
                )}

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm outline-none focus:border-[#0A81FF] focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  />
                  <p className="text-xs text-slate-400 mt-1">At least 8 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm outline-none focus:border-[#0A81FF] focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>

                {/* Trust message */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-2.5 text-xs text-slate-700">
                  <span className="text-lg">🔒</span>
                  <span>Your data is encrypted and secure. {accountType === 'assessor' && 'Credentials are verified before activation.'}</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    accountType === 'assessor'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-[#0A81FF] to-[#3A9BFF] hover:shadow-blue-500/30'
                  }`}
                >
                  {loading 
                    ? 'Creating Account...' 
                    : accountType === 'assessor'
                    ? 'Apply as Medical Reviewer'
                    : 'Create Patient Account'}
                </button>
              </form>

              {/* Sign in link */}
              <p className="mt-6 text-center text-xs text-slate-600">
                Already have an account?{' '}
                <Link href="/auth/sign-in" className="font-bold text-[#0A81FF] hover:text-blue-700 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
