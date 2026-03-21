'use client';

import DNABackground from '@/components/DNABackground';
import { useState } from 'react';

/* ── MOCK DATA ── */
const USER = { name: 'Sarah Mitchell', initials: 'SM', email: 'sarah.mitchell@email.com', age: 34, activeCases: 2, completedCases: 5, savedRecords: 12 };

const CASES = [
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

/* ── ICONS ── */
const Icon = {
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  bell: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>,
  settings: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  dna: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6M9 22c1.798-1.998 2.573-3.995 2.572-5.993M15 2c-1.798 1.998-2.573 3.995-2.572 5.993M2 9c6.667 6 13.333 0 20 6" /></svg>,
  check: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>,
  clock: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>,
  user: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  star: <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
};

export default function HomePage() {
  const [caseTab, setCaseTab] = useState<'active' | 'completed'>('active');
  const filteredCases = CASES.filter(c => c.status === caseTab);

  return (
    <div className="relative min-h-screen bg-transparent">
      <DNABackground />
      {/* ── HEADER ── */}
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
            <button className="relative w-9 h-9 rounded-[10px] flex items-center justify-center text-slate-400 hover:text-[#0A81FF] hover:bg-blue-50/60 transition-all">
              {Icon.bell}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#0A81FF] rounded-full ring-2 ring-white" />
            </button>
            <button className="w-9 h-9 rounded-[10px] flex items-center justify-center text-slate-400 hover:text-[#0A81FF] hover:bg-blue-50/60 transition-all">
              {Icon.settings}
            </button>
            <div className="ml-1.5 w-8 h-8 rounded-full bg-gradient-to-br from-[#0A81FF] to-[#8DE0F6] flex items-center justify-center text-white text-[0.65rem] font-extrabold shadow-md shadow-blue-500/15 cursor-pointer">
              {USER.initials}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-[2] max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* ── GREETING (CENTERED) ── */}
        <section className="flex flex-col items-center text-center gap-3 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.05s_both]">
          <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[#0A81FF] to-[#8DE0F6] flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-blue-500/20 border-[3px] border-white">
            {USER.initials}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#0A81FF] mb-0.5">Welcome back</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{USER.name}</h1>
            <p className="text-xs text-slate-400 mt-1">{USER.activeCases} active cases · {USER.savedRecords} saved records</p>
          </div>
          <div className="flex gap-2.5 flex-wrap justify-center mt-1">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0A81FF] to-[#3A9BFF] text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              {Icon.plus} Open New Case
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 backdrop-blur border border-slate-200/80 text-slate-700 text-sm font-semibold shadow-sm hover:bg-white hover:-translate-y-0.5 transition-all">
              {Icon.upload} Upload Records
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 backdrop-blur border border-slate-200/80 text-slate-700 text-sm font-semibold shadow-sm hover:bg-white hover:-translate-y-0.5 transition-all">
              {Icon.shield} Digital Twin
            </button>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.12s_both]">
          <div className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5">
              <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-[#0A81FF] to-[#8DE0F6] flex items-center justify-center text-white text-lg font-extrabold shadow-lg shadow-blue-500/20">
                {USER.initials}
              </div>
              <div>
                <div className="text-[0.95rem] font-bold text-slate-900">{USER.name}</div>
                <div className="text-xs text-slate-400">Age {USER.age} · Patient</div>
                <div className="text-[0.68rem] text-slate-300 mt-0.5">{USER.email}</div>
              </div>
            </div>
          </div>
          {[
            { label: 'Active Cases', value: USER.activeCases, sub: 'Awaiting opinions', color: 'text-[#0A81FF] bg-blue-50/80' },
            { label: 'Completed', value: USER.completedCases, sub: 'All resolved', color: 'text-emerald-600 bg-emerald-50/80' },
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

        {/* ── CASES ── */}
        <section className="animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
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
            {filteredCases.length === 0 && (
              <div className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-8 text-center text-sm text-slate-400">No {caseTab} cases</div>
            )}
            {filteredCases.map(c => (
              <div key={c.id} className="group bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-[#0A81FF]/20 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900 truncate">{c.title}</span>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${c.status === 'active' ? 'bg-blue-50 text-[#0A81FF]' : 'bg-emerald-50 text-emerald-600'}`}>
                        {c.status === 'active' ? Icon.clock : Icon.check} {c.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[0.7rem] text-slate-400">
                      <span>Opened {c.date}</span>
                      <span className="flex items-center gap-1">{Icon.user} {c.opinions} opinion{c.opinions !== 1 && 's'}</span>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-[#0A81FF] transition-colors ml-3">{Icon.chevron}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SAVED PROFESSIONALS ── */}
        <section className="animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.28s_both]">
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

        {/* ── MEDICAL RECORDS ── */}
        <section className="animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.36s_both]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Medical Records</h2>
              <p className="text-[0.7rem] text-slate-400 mt-0.5">Your Digital Health Twin — all records in one place</p>
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

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
