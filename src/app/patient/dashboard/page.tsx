'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import DNABackground from '@/components/DNABackground';
import { EditProfileModal } from '@/components/EditProfileModal';
import { getUserProfile, handleLogout } from '@/app/auth/actions';
import { getPatientCases, getCaseResponses, closeCase } from '@/app/patient/actions';
import { useTheme } from '@/lib/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

// Mock user data - will be replaced with Supabase data
const MOCK_USER = { name: 'Sarah Mitchell', initials: 'SM', email: 'sarah.mitchell@email.com', age: 34, activeCases: 2, completedCases: 5, savedRecords: 12, profilePictureUrl: '' };

const MOCK_CASES = [
  { id: 1, title: 'Skin lesion on left forearm', date: 'Mar 14, 2026', opinions: 3, status: 'active' as const, label: 'In Review' },
  { id: 2, title: 'Persistent lower back pain — MRI follow-up', date: 'Mar 8, 2026', opinions: 1, status: 'active' as const, label: 'Awaiting Opinions' },
  { id: 3, title: 'Chest X-ray interpretation', date: 'Feb 22, 2026', opinions: 4, status: 'completed' as const, label: 'Resolved' },
  { id: 4, title: 'Blood panel results — thyroid concern', date: 'Feb 10, 2026', opinions: 2, status: 'completed' as const, label: 'Resolved' },
  { id: 5, title: 'Post-surgical wound check', date: 'Jan 28, 2026', opinions: 3, status: 'completed' as const, label: 'Resolved' },
];

const PROS = [
  { name: 'Dr. Rebecca Chen', spec: 'Internal Medicine', badge: 'Verified MD', badgeColor: 'bg-emerald-50 text-emerald-600', color: 'from-emerald-400 to-teal-500', initials: 'RC', reviews: 142, rating: 4.9 },
  { name: 'Dr. James Park', spec: 'Radiology', badge: 'Verified MD', badgeColor: 'bg-emerald-50 text-emerald-600', color: 'from-blue-400 to-cyan-500', initials: 'JP', reviews: 211, rating: 4.8 },
  { name: 'Aisha Williams', spec: 'Dermatology', badge: 'Med Student', badgeColor: 'bg-blue-50 text-blue-600', color: 'from-violet-400 to-purple-500', initials: 'AW', reviews: 67, rating: 4.7 },
  { name: 'Dr. Michael Torres', spec: 'Orthopedics', badge: 'Verified MD', badgeColor: 'bg-emerald-50 text-emerald-600', color: 'from-amber-400 to-orange-500', initials: 'MT', reviews: 98, rating: 4.9 },
];

const RECORDS = [
  { name: 'Full Blood Panel', date: 'Mar 2, 2026', type: 'Lab Results', icon: '🧪' },
  { name: 'Chest X-Ray', date: 'Feb 20, 2026', type: 'Imaging', icon: '🫁' },
  { name: 'MRI — Lumbar Spine', date: 'Feb 5, 2026', type: 'Imaging', icon: '🦴' },
  { name: 'Dermatology Photos', date: 'Jan 18, 2026', type: 'Images', icon: '📸' },
  { name: 'Thyroid Panel', date: 'Jan 10, 2026', type: 'Lab Results', icon: '🧪' },
  { name: 'Annual Physical Summary', date: 'Dec 15, 2025', type: 'Report', icon: '📋' },
];

const Icon = {
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  bell: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>,
  settings: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  dna: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M2 12Q6 6 12 12T22 12" /><path d="M2 12Q6 18 12 12T22 12" /><line x1="4" y1="9" x2="4" y2="15" strokeWidth="0.8" /><line x1="8" y1="7" x2="8" y2="17" strokeWidth="0.8" /><line x1="12" y1="8" x2="12" y2="16" strokeWidth="0.8" /><line x1="16" y1="7" x2="16" y2="17" strokeWidth="0.8" /><line x1="20" y1="9" x2="20" y2="15" strokeWidth="0.8" /></svg>,
  check: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>,
  clock: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>,
  user: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  star: <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
};

export default function PatientDashboard() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const [caseTab, setCaseTab] = useState<'active' | 'completed'>('active');
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(MOCK_USER);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [responseLoading, setResponseLoading] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Call server action to get authenticated user profile
        const result = await getUserProfile();

        if (!result.success || !result.user) {
          // No authenticated user - redirect to sign-in
          router.push('/auth/sign-in');
          return;
        }

        // Set user data from server
        const userData = result.user;
        
        // Load profile data from localStorage scoped by user ID
        const userId = result.user?.id;
        const profileStorageKey = `userProfile_${userId}`;
        const savedProfile = localStorage.getItem(profileStorageKey);
        let profilePictureUrl = '';
        let profileName = userData.name;
        
        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            profilePictureUrl = parsed.profilePictureUrl || '';
            profileName = parsed.name || userData.name;
          } catch (e) {
            console.error('Error parsing saved profile:', e);
          }
        }
        
        setUser({
          name: profileName,
          initials: profileName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase(),
          email: userData.email,
          age: 34,
          activeCases: 2,
          completedCases: 5,
          savedRecords: 12,
          profilePictureUrl: profilePictureUrl,
        });

        setAuthed(true);
        
        // Fetch patient's cases after auth is confirmed
        if (result.user?.id) {
          setCasesLoading(true);
          try {
            const caseResult = await getPatientCases(result.user.id);
            if (caseResult.success) {
              // Map database cases to UI format
              const formattedCases = caseResult.cases.map((c: any) => ({
                id: c.id,
                title: c.title,
                date: new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                opinions: c.responseCount || 0,
                status: c.status === 'open' ? 'active' : 'completed',
                label: c.status === 'open' ? 'Awaiting Opinions' : 'Resolved',
                dbStatus: c.status,
                description: c.description,
                images: c.images || [],
              }));
              setCases(formattedCases);
              setCasesError(null);
              
              // Update user stats from actual cases
              setUser(prev => ({
                ...prev,
                activeCases: formattedCases.filter(c => c.status === 'active').length,
                completedCases: formattedCases.filter(c => c.status === 'completed' || c.status === 'closed').length,
              }));
            } else {
              setCasesError(caseResult.error || 'Could not load cases');
              setCases([]);
            }
          } catch (err) {
            console.error('Failed to fetch cases:', err);
            setCasesError('Could not load cases');
            setCases([]);
          } finally {
            setCasesLoading(false);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Listen for profile updates
    const handleProfileUpdate = (e: any) => {
      const updatedData = e.detail;
      setUser(prev => ({
        ...prev,
        name: updatedData.name || prev.name,
        initials: (updatedData.name || prev.name)
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase(),
        email: updatedData.email || prev.email,
        profilePictureUrl: updatedData.profilePictureUrl || prev.profilePictureUrl || '',
      }));
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [router]);

  async function handleLogoutClick() {
    try {
      // Call server action to sign out
      const result = await handleLogout();
      if (result.success) {
        // Clear any sessionStorage data
        sessionStorage.removeItem('patient_authenticated');
        sessionStorage.removeItem('patient_name');
        sessionStorage.removeItem('patient_email');
        router.push('/auth/sign-in');
      } else {
        console.error('Logout failed:', result.error);
        router.push('/auth/sign-in');
      }
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/auth/sign-in');
    }
  }

  async function handleCaseClick(caseRecord: any) {
    // Allow clicking any case to view details
    setSelectedCase(caseRecord);
    setResponseLoading(true);
    setResponseError(null);
    setResponses([]);
    
    try {
      const result = await getCaseResponses(caseRecord.id);
      if (result.success) {
        setResponses(result.responses);
      } else {
        setResponseError(result.error || 'Could not load responses');
        setResponses([]);
      }
    } catch (err) {
      console.error('Error fetching responses:', err);
      setResponseError('An error occurred while loading responses');
      setResponses([]);
    } finally {
      setResponseLoading(false);
    }
  }

  async function handleCloseCase(caseId: string) {
    setCloseLoading(true);
    setCloseError(null);
    try {
      const result = await closeCase(caseId);
      if (result.success) {
        // Update local state - remove from cases list and refresh
        setCases(cases.filter(c => c.id !== caseId));
        handleCloseResponseModal();
      } else {
        setCloseError(result.error || 'Failed to close case');
        setCloseLoading(false);
      }
    } catch (err) {
      console.error('Error closing case:', err);
      setCloseError('An error occurred while closing case');
      setCloseLoading(false);
    }
  }

  function handleCloseResponseModal() {
    // Clear all modal state when closing
    setSelectedCase(null);
    setResponses([]);
    setResponseLoading(false);
    setResponseError(null);
  }

  if (!authed || loading) return null;

  const filteredCases = cases.filter(c => c.status === caseTab);

  return (
    <div className="relative min-h-screen bg-transparent">
      <DNABackground />
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/60">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#0A81FF] to-[#59BAEE] flex items-center justify-center shadow-md shadow-blue-500/20">
              {Icon.dna}
            </div>
            <span className="text-[1.05rem] font-extrabold tracking-tight text-slate-900 font-[Sora]">
              Med<span className="text-[#0A81FF]">Second</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-[10px] flex items-center justify-center text-slate-400 hover:text-[#0A81FF] hover:bg-blue-50/60 dark:text-slate-500 dark:hover:text-[#00D9FF] dark:hover:bg-slate-800/60 transition-all" title="Settings">
                    {Icon.settings}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => setEditProfileOpen(true)}
                    className="cursor-pointer"
                  >
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={theme} onValueChange={(value) => toggleTheme(value as 'light' | 'dark')}>
                    <DropdownMenuRadioItem value="light" className="cursor-pointer flex items-center">
                      <Sun className="w-4 h-4 mr-2" />
                      Light Mode
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark" className="cursor-pointer flex items-center">
                      <Moon className="w-4 h-4 mr-2" />
                      Dark Mode
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer text-red-600">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!mounted && (
              <button className="w-9 h-9 rounded-[10px] flex items-center justify-center text-slate-400 hover:text-[#0A81FF] hover:bg-blue-50/60 transition-all">
                {Icon.settings}
              </button>
            )}
            <div className="ml-1.5 w-8 h-8 rounded-full bg-gradient-to-br from-[#0A81FF] to-[#8DE0F6] flex items-center justify-center text-white text-[0.65rem] font-extrabold shadow-md shadow-blue-500/15 cursor-pointer overflow-hidden">
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.initials
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-[2] max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-7">

        <section className="flex flex-col items-center text-center gap-3">
          <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[#0A81FF] to-[#8DE0F6] flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-blue-500/20 border-[3px] border-white overflow-hidden">
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.initials
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#0A81FF] mb-0.5">Welcome back</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-400 mt-1">{user.activeCases} active cases</p>
          </div>
          <div className="flex gap-2.5 flex-wrap justify-center mt-1">
            <button onClick={() => router.push('/patient/cases/new')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0A81FF] to-[#3A9BFF] text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              {Icon.plus} Open New Case
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 backdrop-blur border border-slate-200/80 text-slate-700 text-sm font-semibold shadow-sm hover:bg-white hover:-translate-y-0.5 transition-all">
              {Icon.upload} Upload Records
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5">
              <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-[#0A81FF] to-[#8DE0F6] flex items-center justify-center text-white text-lg font-extrabold shadow-lg shadow-blue-500/20 overflow-hidden">
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.initials
                )}
              </div>
              <div>
                <div className="text-[0.95rem] font-bold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-400"> Patient</div>
                <div className="text-[0.68rem] text-slate-300 mt-0.5">{user.email}</div>
              </div>
            </div>
          </div>
          {[
            { label: 'Active Cases', value: user.activeCases, sub: 'Awaiting opinions', color: 'text-[#0A81FF] bg-blue-50/80' },
            { label: 'Completed', value: user.completedCases, sub: 'All resolved', color: 'text-emerald-600 bg-emerald-50/80' },
          ].map(s => (
            <div key={s.label} className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center text-2xl font-extrabold`}>{s.value}</div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{s.label}</div>
                <div className="text-[0.68rem] text-slate-400">{s.sub}</div>
              </div>
            </div>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Your Cases</h2>
            <div className="flex bg-slate-100/80 rounded-xl p-1 gap-0.5">
              {(['active', 'completed'] as const).map(tab => (
                <button key={tab} onClick={() => setCaseTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${caseTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab === 'active' ? 'Active' : 'Completed'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            {casesLoading && (
              <div className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-8 text-center text-sm text-slate-400">Loading cases...</div>
            )}
            {casesError && (
              <div className="bg-white/80 backdrop-blur-lg border border-red-200/70 rounded-2xl p-8 text-center text-sm text-red-500">{casesError}</div>
            )}
            {!casesLoading && !casesError && filteredCases.length === 0 && (
              <div className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-8 text-center text-sm text-slate-400">No {caseTab} cases</div>
            )}
            {filteredCases.map(c => (
              <div key={c.id} onClick={() => handleCaseClick(c)} className={`group bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-[#0A81FF]/20 transition-all cursor-pointer`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900 truncate">{c.title}</span>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${c.status === 'active' ? 'bg-blue-50 text-[#0A81FF]' : (c.status === 'closed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600')}`}>
                        {c.status === 'active' ? Icon.clock : Icon.check} {c.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[0.7rem] text-slate-400">
                      <span>Opened {c.date}</span>
                      <span className="flex items-center gap-1">{Icon.user} {c.opinions} opinion{c.opinions !== 1 && 's'}</span>
                    </div>
                  </div>
                  <div className="transition-colors ml-3 text-slate-300 group-hover:text-[#0A81FF]">{Icon.chevron}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Saved Professionals</h2>
            <span className="text-xs font-semibold text-[#0A81FF] cursor-pointer hover:text-blue-700">View All →</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROS.map(p => (
              <div key={p.name} className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#0A81FF]/20 transition-all cursor-pointer">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-[0.65rem] font-bold shadow-md`}>{p.initials}</div>
                  <div className="min-w-0">
                    <div className="text-[0.8rem] font-semibold text-slate-900 truncate">{p.name}</div>
                    <div className="text-[0.68rem] text-slate-400">{p.spec}</div>
                  </div>
                </div>
                <div className="mb-2.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${p.badgeColor}`}>{Icon.check} {p.badge}</span>
                </div>
                <div className="flex gap-3 pt-2.5 border-t border-slate-100 text-[0.68rem] text-slate-400">
                  <span><strong className="text-slate-700 font-semibold">{p.reviews}</strong> reviews</span>
                  <span className="flex items-center gap-0.5"><span className="text-amber-400">{Icon.star}</span><strong className="text-slate-700 font-semibold">{p.rating}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Medical Records</h2>
              <p className="text-[0.7rem] text-slate-400 mt-0.5">Organize and manage all your health records</p>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-sm hover:bg-white transition-all">
              {Icon.upload} Upload
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RECORDS.map(r => (
              <div key={r.name} className="group bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#0A81FF]/20 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg shrink-0">{r.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.8rem] font-semibold text-slate-900 truncate">{r.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{r.type}</span>
                      <span className="text-[0.68rem] text-slate-400">{r.date}</span>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-[#0A81FF] transition-colors mt-1">{Icon.chevron}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-12" />
      </main>

      {/* RESPONSES MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200/70 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Medical Assessment</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCase.title}</p>
              </div>
              <button onClick={handleCloseResponseModal} className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close">✕</button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Case Details Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Date Submitted</p>
                  <p className="text-sm text-slate-700">{selectedCase.date}</p>
                </div>

                {selectedCase.description && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Case Description</p>
                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                      {selectedCase.description}
                    </div>
                  </div>
                )}

                {selectedCase.images && selectedCase.images.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Medical Images ({selectedCase.images.length})</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedCase.images.map((url: string, idx: number) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200/70">
                          <img src={url} alt={`Case image ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Responses Section */}
              <div className="border-t border-slate-200/70 pt-5">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Professional Assessments</h4>
                
                {responseLoading && (
                  <div className="text-center py-4 text-sm text-slate-400">Loading assessments...</div>
                )}

                {responseError && (
                  <div className="bg-red-50/80 border border-red-200/70 rounded-xl p-3 text-sm text-red-700">
                    {responseError}
                  </div>
                )}

                {!responseLoading && !responseError && responses.length === 0 && (
                  <div className="text-center py-4 text-sm text-slate-400">No assessments yet. Check back soon.</div>
                )}

                {responses.map((response, idx) => (
                  <div key={response.id} className="bg-gradient-to-r from-emerald-50/80 to-slate-50/80 border border-emerald-200/70 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Assessment #{idx + 1}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {response.created_at ? new Date(response.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600">
                        {Icon.check} Completed
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                      {response.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Close Error */}
              {closeError && (
                <div className="bg-red-50/80 border border-red-200/70 rounded-xl p-3 text-sm text-red-700">
                  {closeError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-200/70">
                <button
                  onClick={handleCloseResponseModal}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100/80 text-slate-700 font-medium text-sm hover:bg-slate-200/80 transition-all"
                >
                  Close
                </button>
                {selectedCase.status === 'active' && (
                  <button
                    onClick={() => handleCloseCase(selectedCase.id)}
                    disabled={closeLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {closeLoading ? 'Closing...' : 'Close Case'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        userRole="patient"
        userData={{
          name: user.name,
          email: user.email,
          age: user.age,
          gender: '',
          healthInfo: '',
        }}
      />
    </div>
  );
}
