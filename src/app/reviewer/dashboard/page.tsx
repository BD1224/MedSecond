'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DNABackground from '@/components/DNABackground';

const USER = {
  name: 'Dr. Rebecca Chen', initials: 'RC', specialty: 'Internal Medicine',
  email: 'reviewer@medsecond.com', rating: 4.9, helpful: 98, totalReviews: 142,
  awaiting: 6, inProgress: 3,
};

const CASES = [
  { id:1, title:'Skin lesion evaluation — left forearm', date:'Mar 20, 2026', type:'Dermatology', urgency:'Normal' as const, status:'open' as const, patient:'S.M.', images:2 },
  { id:2, title:'Chest X-ray interpretation — persistent cough', date:'Mar 19, 2026', type:'Radiology', urgency:'Priority' as const, status:'open' as const, patient:'J.K.', images:3 },
  { id:3, title:'Blood panel — abnormal thyroid levels', date:'Mar 18, 2026', type:'Lab Results', urgency:'Normal' as const, status:'open' as const, patient:'A.R.', images:0 },
  { id:4, title:'MRI follow-up — lumbar disc herniation', date:'Mar 17, 2026', type:'Orthopedics', urgency:'Normal' as const, status:'open' as const, patient:'D.L.', images:4 },
  { id:5, title:'Pediatric rash — recurring on torso', date:'Mar 16, 2026', type:'Dermatology', urgency:'Normal' as const, status:'open' as const, patient:'M.W.', images:5 },
  { id:6, title:'ECG reading — irregular rhythm noted', date:'Mar 15, 2026', type:'Cardiology', urgency:'Urgent' as const, status:'open' as const, patient:'R.T.', images:1 },
  { id:7, title:'Post-op wound assessment — knee replacement', date:'Mar 14, 2026', type:'Orthopedics', urgency:'Normal' as const, status:'inprogress' as const, patient:'K.P.', images:3 },
  { id:8, title:'Abdominal ultrasound — gallbladder concern', date:'Mar 12, 2026', type:'Radiology', urgency:'Normal' as const, status:'inprogress' as const, patient:'L.G.', images:2 },
  { id:9, title:'Mole asymmetry check — upper back', date:'Mar 10, 2026', type:'Dermatology', urgency:'Normal' as const, status:'inprogress' as const, patient:'T.H.', images:4 },
  { id:10, title:'Lipid panel interpretation', date:'Mar 8, 2026', type:'Lab Results', urgency:'Normal' as const, status:'completed' as const, patient:'N.B.', images:0 },
  { id:11, title:'Ankle sprain — X-ray review', date:'Mar 5, 2026', type:'Orthopedics', urgency:'Normal' as const, status:'completed' as const, patient:'C.D.', images:2 },
  { id:12, title:'Chronic fatigue workup review', date:'Mar 2, 2026', type:'Internal Medicine', urgency:'Normal' as const, status:'completed' as const, patient:'E.F.', images:0 },
];

const ACTIVITY = [
  { text:'Submitted review for "Chest X-ray interpretation"', time:'2 hours ago', color:'#0A81FF' },
  { text:'Received helpful vote from patient S.M.', time:'5 hours ago', color:'#10B981' },
  { text:'New case matched: "ECG reading — irregular rhythm"', time:'8 hours ago', color:'#F59E0B' },
  { text:'Submitted review for "Blood panel — thyroid levels"', time:'1 day ago', color:'#0A81FF' },
  { text:'Rating updated to 4.9 stars', time:'1 day ago', color:'#10B981' },
  { text:'New case matched: "Pediatric rash — recurring"', time:'2 days ago', color:'#F59E0B' },
];

const Icon = {
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  folder: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  bell: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
  settings: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  dna: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6M9 22c1.798-1.998 2.573-3.995 2.572-5.993M15 2c-1.798 1.998-2.573 3.995-2.572 5.993M2 9c6.667 6 13.333 0 20 6"/></svg>,
  check: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  clock: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>,
  image: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
};

export default function ReviewerDashboard() {
  const router = useRouter();
  const [caseTab, setCaseTab] = useState<'open'|'inprogress'|'completed'>('open');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('reviewer_authenticated') !== 'true') {
      router.push('/auth/sign-in');
    } else {
      setAuthed(true);
    }
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem('reviewer_authenticated');
    sessionStorage.removeItem('reviewer_name');
    router.push('/auth/sign-in');
  }

  if (!authed) return null;

  const filteredCases = CASES.filter(c => c.status === caseTab);

  return (
    <div className="relative min-h-screen bg-transparent">
      <DNABackground />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/60">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#0A81FF] to-[#59BAEE] flex items-center justify-center shadow-md shadow-blue-500/20">{Icon.dna}</div>
            <span className="text-[1.05rem] font-extrabold tracking-tight text-slate-900">Med<span className="text-[#0A81FF]">Second</span></span>
            <span className="ml-1 text-[0.58rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">Reviewer</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="relative w-9 h-9 rounded-[10px] flex items-center justify-center text-slate-400 hover:text-[#0A81FF] hover:bg-blue-50/60 transition-all">{Icon.bell}<span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#0A81FF] rounded-full ring-2 ring-white"/></button>
            <button className="w-9 h-9 rounded-[10px] flex items-center justify-center text-slate-400 hover:text-[#0A81FF] hover:bg-blue-50/60 transition-all">{Icon.settings}</button>
            <button onClick={handleLogout} className="w-9 h-9 rounded-[10px] flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50/60 transition-all" title="Sign Out">{Icon.logout}</button>
            <div className="ml-1.5 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[0.65rem] font-extrabold shadow-md shadow-emerald-500/15">{USER.initials}</div>
          </div>
        </div>
      </header>

      <main className="relative z-[2] max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* GREETING */}
        <section className="flex flex-col items-center text-center gap-3">
          <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-emerald-500/20 border-[3px] border-white">{USER.initials}</div>
          <div>
            <p className="text-xs font-semibold text-emerald-600 mb-0.5">Welcome back, Doctor</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{USER.name}</h1>
            <p className="text-xs text-slate-400 mt-1">{USER.specialty} · Verified MD · {USER.awaiting} cases awaiting review</p>
          </div>
          <div className="flex gap-2.5 flex-wrap justify-center mt-1">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0A81FF] to-[#3A9BFF] text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">{Icon.eye} Browse Open Cases</button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 backdrop-blur border border-slate-200/80 text-slate-700 text-sm font-semibold shadow-sm hover:bg-white hover:-translate-y-0.5 transition-all">{Icon.folder} My Reviews</button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 backdrop-blur border border-slate-200/80 text-slate-700 text-sm font-semibold shadow-sm hover:bg-white hover:-translate-y-0.5 transition-all">{Icon.user} My Profile</button>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label:'Awaiting Review', value:USER.awaiting, sub:'New cases for you', color:'text-[#0A81FF] bg-blue-50/80' },
            { label:'In Progress', value:USER.inProgress, sub:'Drafts started', color:'text-amber-500 bg-amber-50/80' },
            { label:'Completed', value:USER.totalReviews, sub:'Total reviews', color:'text-emerald-600 bg-emerald-50/80' },
            { label:'Rating', value:USER.rating, sub:`${USER.helpful}% helpful`, color:'text-[#59BAEE] bg-sky-50/80' },
          ].map(s => (
            <div key={s.label} className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center text-xl font-extrabold`}>{s.value}</div>
              <div><div className="text-sm font-semibold text-slate-900">{s.label}</div><div className="text-[0.68rem] text-slate-400">{s.sub}</div></div>
            </div>
          ))}
        </section>

        {/* CASES */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Cases to Review</h2>
            <div className="flex bg-slate-100/80 rounded-xl p-1 gap-0.5">
              {(['open','inprogress','completed'] as const).map(tab => (
                <button key={tab} onClick={() => setCaseTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${caseTab===tab?'bg-white text-slate-900 shadow-sm':'text-slate-400 hover:text-slate-600'}`}>
                  {tab==='open'?'Open':tab==='inprogress'?'In Progress':'Completed'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            {filteredCases.length===0 && <div className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-8 text-center text-sm text-slate-400">No {caseTab==='inprogress'?'in progress':caseTab} cases</div>}
            {filteredCases.map(c => (
              <div key={c.id} className="group bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-[#0A81FF]/20 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 truncate">{c.title}</span>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${c.status==='open'?'bg-blue-50 text-[#0A81FF]':c.status==='inprogress'?'bg-amber-50 text-amber-500':'bg-emerald-50 text-emerald-600'}`}>
                        {c.status==='completed'?Icon.check:Icon.clock} {c.status==='open'?'Open':c.status==='inprogress'?'In Progress':'Reviewed'}
                      </span>
                      {c.urgency!=='Normal' && <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${c.urgency==='Urgent'?'bg-red-50 text-red-500':'bg-amber-50 text-amber-500'}`}>{c.urgency}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-[0.7rem] text-slate-400">
                      <span>Patient {c.patient}</span><span>{c.date}</span><span>{c.type}</span>
                      {c.images>0 && <span className="flex items-center gap-1">{Icon.image} {c.images} image{c.images!==1&&'s'}</span>}
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-[#0A81FF] transition-colors ml-3">{Icon.chevron}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SPECIALTIES */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div><h2 className="text-lg font-bold text-slate-900">Your Specialties</h2><p className="text-[0.7rem] text-slate-400 mt-0.5">Cases are matched to your expertise</p></div>
            <span className="text-xs font-semibold text-[#0A81FF] cursor-pointer hover:text-blue-700">Edit →</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['Internal Medicine','Cardiology','General Practice','Diagnostics','Lab Interpretation'].map(s => (
              <span key={s} className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50/80 text-[#0A81FF] border border-blue-100/60">{s}</span>
            ))}
          </div>
        </section>

        {/* ACTIVITY */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            <span className="text-xs font-semibold text-[#0A81FF] cursor-pointer hover:text-blue-700">View All →</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACTIVITY.map((a,i) => (
              <div key={i} className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{background:a.color}}/>
                  <div><p className="text-[0.78rem] text-slate-700">{a.text}</p><p className="text-[0.65rem] text-slate-300 mt-0.5">{a.time}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* REPUTATION */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Your Reputation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label:'Helpful Votes', value:'284', sub:'From 142 reviews', icon:'👍' },
              { label:'Response Time', value:'~4h', sub:'Average turnaround', icon:'⚡' },
              { label:'Repeat Requests', value:'18', sub:'Patients asked for you again', icon:'🔄' },
            ].map(r => (
              <div key={r.label} className="bg-white/80 backdrop-blur-lg border border-slate-200/70 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-xl">{r.icon}</div>
                <div><div className="text-lg font-bold text-slate-900">{r.value}</div><div className="text-xs text-slate-500">{r.label}</div><div className="text-[0.65rem] text-slate-300">{r.sub}</div></div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-12"/>
      </main>
    </div>
  );
}
