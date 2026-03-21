'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function Dashboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [curTab, setCurTab] = useState<'active' | 'completed'>('active');

  const CASES = [
    { id: 1, title: 'Skin lesion on left forearm', date: 'Mar 14, 2026', opinions: 3, status: 'active', label: 'In Review' },
    { id: 2, title: 'Persistent lower back pain — MRI follow-up', date: 'Mar 8, 2026', opinions: 1, status: 'active', label: 'Awaiting Opinions' },
    { id: 3, title: 'Chest X-ray interpretation', date: 'Feb 22, 2026', opinions: 4, status: 'completed', label: 'Resolved' },
    { id: 4, title: 'Blood panel results — thyroid concern', date: 'Feb 10, 2026', opinions: 2, status: 'completed', label: 'Resolved' },
    { id: 5, title: 'Post-surgical wound check', date: 'Jan 28, 2026', opinions: 3, status: 'completed', label: 'Resolved' },
  ];

  const PROS = [
    { name: 'Dr. Rebecca Chen', spec: 'Internal Medicine', badge: 'Verified MD', bt: 'green', color: 'linear-gradient(135deg,#10B981,#34D399)', ini: 'RC', rev: 142, rat: 4.9 },
    { name: 'Dr. James Park', spec: 'Radiology', badge: 'Verified MD', bt: 'green', color: 'linear-gradient(135deg,#0A81FF,#59BAEE)', ini: 'JP', rev: 211, rat: 4.8 },
    { name: 'Aisha Williams', spec: 'Dermatology', badge: 'Med Student', bt: 'blue', color: 'linear-gradient(135deg,#8B5CF6,#A78BFA)', ini: 'AW', rev: 67, rat: 4.7 },
    { name: 'Dr. Michael Torres', spec: 'Orthopedics', badge: 'Verified MD', bt: 'green', color: 'linear-gradient(135deg,#F59E0B,#FBBF24)', ini: 'MT', rev: 98, rat: 4.9 },
  ];

  const RECS = [
    { name: 'Full Blood Panel', date: 'Mar 2, 2026', type: 'Lab Results', icon: '🧪' },
    { name: 'Chest X-Ray', date: 'Feb 20, 2026', type: 'Imaging', icon: '🫁' },
    { name: 'MRI — Lumbar Spine', date: 'Feb 5, 2026', type: 'Imaging', icon: '🦴' },
    { name: 'Dermatology Photos', date: 'Jan 18, 2026', type: 'Images', icon: '📸' },
    { name: 'Thyroid Panel', date: 'Jan 10, 2026', type: 'Lab Results', icon: '🧪' },
    { name: 'Annual Physical Summary', date: 'Dec 15, 2025', type: 'Report', icon: '📋' },
  ];

  const activeCases = CASES.filter(c => c.status === curTab);

  useEffect(() => {
    if (!canvasRef.current || !wrapRef.current) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, tick = 0;
    let mx = -9999, my = -9999;

    function resize() {
      W = wrap.clientWidth || window.innerWidth;
      H = wrap.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, W);
      canvas.height = Math.max(1, H);
    }

    function rgba(hex: string, a: number) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
    }

    const HR = 100, COUNT = 400, TWIST = 0.04, ROTSP = 0.008;
    const MR = 200, MP = 90;

    function spine(t: number, time: number) {
      const w1 = Math.sin(t * Math.PI * 2.5 + time * 0.25) * 0.14;
      const w2 = Math.sin(t * Math.PI * 1.7 + time * 0.18 + 1.5) * 0.07;
      const w3 = Math.cos(t * Math.PI * 3.0 + time * 0.12) * 0.03;
      const sx = (0.5 + w1 + w2 + (t - 0.5) * 0.25) * W;
      const sy = (-0.15 + t * 1.3) * H + w3 * H * 0.3;
      const dt = 0.001, t2 = t + dt;
      const sx2 = (0.5 + Math.sin(t2 * Math.PI * 2.5 + time * 0.25) * 0.14 + Math.sin(t2 * Math.PI * 1.7 + time * 0.18 + 1.5) * 0.07 + (t2 - 0.5) * 0.25) * W;
      const sy2 = (-0.15 + t2 * 1.3) * H + Math.cos(t2 * Math.PI * 3.0 + time * 0.12) * 0.03 * H * 0.3;
      const dx = sx2 - sx, dy = sy2 - sy, len = Math.sqrt(dx * dx + dy * dy) || 1;
      return { x: sx, y: sy, nx: -dy / len, ny: dx / len };
    }

    const MAX_FL = 300;
    let flows: any[] = [];

    function spawnFlow(x: number, y: number, col: string) {
      if (flows.length >= MAX_FL) return;
      const a = Math.random() * 6.28, sp = 0.4 + Math.random() * 1.5;
      flows.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 0.5 + Math.random() * 2, al: 0.5 + Math.random() * 0.5, life: 0, ttl: 40 + Math.random() * 80, col });
    }

    const dust = Array.from({ length: 40 }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      r: 0.3 + Math.random() * 0.6,
      a: 0.02 + Math.random() * 0.04,
      col: ['#0A81FF', '#59BAEE', '#8DE0F6'][Math.floor(Math.random() * 3)],
    }));

    let alive = true;
    let animId: number;

    function frame() {
      if (!alive) return;
      tick++;
      const time = tick * 0.008;
      ctx!.fillStyle = 'rgba(255,255,255,0.9)';
      ctx!.fillRect(0, 0, W, H);

      dust.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, 6.28);
        ctx!.fillStyle = rgba(p.col, p.a);
        ctx!.fill();
      });

      const dots: any[] = [];
      for (let i = 0; i < COUNT; i++) {
        const t = -0.15 + (i / COUNT) * 1.3;
        const sp = spine(t, time);
        const angle = i * TWIST + tick * ROTSP;
        const c1 = Math.cos(angle), s1 = Math.sin(angle);
        const c2 = Math.cos(angle + Math.PI), s2 = Math.sin(angle + Math.PI);
        let x1 = sp.x + sp.nx * c1 * HR, y1 = sp.y + sp.ny * c1 * HR;
        let x2 = sp.x + sp.nx * c2 * HR, y2 = sp.y + sp.ny * c2 * HR;

        const dx1 = x1 - mx, dy1 = y1 - my, dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        if (dist1 < MR && dist1 > 1) {
          const f1 = (1 - dist1 / MR) * (1 - dist1 / MR) * MP;
          x1 += (dx1 / dist1) * f1;
          y1 += (dy1 / dist1) * f1;
        }
        const dx2 = x2 - mx, dy2 = y2 - my, dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (dist2 < MR && dist2 > 1) {
          const f2 = (1 - dist2 / MR) * (1 - dist2 / MR) * MP;
          x2 += (dx2 / dist2) * f2;
          y2 += (dy2 / dist2) * f2;
        }

        dots.push({ x: x1, y: y1, d: s1, s: 1 });
        dots.push({ x: x2, y: y2, d: s2, s: 2 });

        if (i % 5 === 0) {
          const avgD = (s1 + s2) / 2;
          const rA = 0.08 + 0.45 * ((avgD + 1) / 2);
          for (let s = 0; s <= 10; s++) {
            const fr = s / 10;
            const rx = x1 + (x2 - x1) * fr, ry = y1 + (y2 - y1) * fr;
            const rr = 0.8 + 2 * ((avgD + 1) / 2);
            const ra = rA * (0.3 + 0.7 * Math.sin(fr * Math.PI));
            ctx!.beginPath();
            ctx!.arc(rx, ry, rr, 0, 6.28);
            ctx!.fillStyle = rgba('#0A81FF', ra * 0.7);
            ctx!.fill();
            ctx!.beginPath();
            ctx!.arc(rx, ry, rr * 0.6, 0, 6.28);
            ctx!.fillStyle = rgba('#59BAEE', ra * 0.9);
            ctx!.fill();
          }
        }

        if (Math.random() < 0.008) {
          const pk = Math.random() < 0.5;
          spawnFlow(pk ? x1 : x2, pk ? y1 : y2, ['#0A81FF', '#59BAEE', '#8DE0F6'][Math.floor(Math.random() * 3)]);
        }
      }

      dots.sort((a, b) => a.d - b.d);
      dots.forEach((p) => {
        const dn = (p.d + 1) / 2;
        const r = 1.2 + 4.5 * dn;
        const a = 0.1 + 0.9 * dn;
        const col = p.s === 1 ? '#0A81FF' : '#59BAEE';
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r * 3, 0, 6.28);
        ctx!.fillStyle = rgba(col, a * 0.04);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r * 1.6, 0, 6.28);
        ctx!.fillStyle = rgba(col, a * 0.12);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r, 0, 6.28);
        ctx!.fillStyle = rgba(col, a * 0.95);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r * 0.28, 0, 6.28);
        ctx!.fillStyle = rgba('#8DE0F6', a * 0.8);
        ctx!.fill();
      });

      const newFlows: any[] = [];
      flows.forEach((f) => {
        f.life++;
        f.x += f.vx;
        f.y += f.vy;
        f.vy += 0.003;
        f.vx *= 0.997;
        f.vy *= 0.997;
        const dx = f.x - mx, dy = f.y - my, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MR * 0.6 && dist > 1) {
          const force = (1 - dist / (MR * 0.6)) * 2;
          f.vx += (dx / dist) * force;
          f.vy += (dy / dist) * force;
        }
        const fade = 1 - f.life / f.ttl;
        if (fade <= 0) return;
        const a = f.al * fade * fade;
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.r * 2 * fade, 0, 6.28);
        ctx!.fillStyle = rgba(f.col, a * 0.12);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.r * fade, 0, 6.28);
        ctx!.fillStyle = rgba(f.col, a);
        ctx!.fill();
        newFlows.push(f);
      });
      flows = newFlows;

      animId = requestAnimationFrame(frame);
    }

    const handleResize = () => resize();
    const handleMouseMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const handleMouseLeave = () => { mx = my = -9999; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resize();
    frame();

    return () => {
      alive = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        :root {
          --azure: #0A81FF;
          --azure-light: #3A9BFF;
          --sky: #59BAEE;
          --frosted: #8DE0F6;
          --border: rgba(210,222,238,0.7);
          --border-light: rgba(220,230,242,0.5);
          --text-dark: #0A1628;
          --text-body: #3A4A5C;
          --text-muted: #7A8DA3;
          --text-light: #A0B1C5;
          --success: #10B981;
          --amber: #F59E0B;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: #fff; }
        body { font-family: 'Roboto', sans-serif; color: var(--text-body); line-height: 1.55; -webkit-font-smoothing: antialiased; }
        h1,h2,h3,h4,.section-title,.logo-text,.stat-label,.pro-name,.case-title,.record-name,.btn {
          font-family: 'Sora', sans-serif;
        }
        .page-wrap { position: relative; min-height: 100vh; overflow-x: hidden; }
        #dna-wrap { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        #dna { display: block; width: 100%; height: 100%; }
        .header { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(28px) saturate(1.4); -webkit-backdrop-filter: blur(28px) saturate(1.4); background: rgba(255,255,255,0.72); border-bottom: 1px solid var(--border-light); height: 60px; }
        .header-inner { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; height: 100%; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 0.55rem; }
        .logo-icon { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, var(--azure), var(--sky)); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(10,129,255,0.2); }
        .logo-icon svg { width: 16px; height: 16px; stroke: #fff; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .logo-text { font-size: 1.05rem; font-weight: 800; color: var(--text-dark); letter-spacing: -0.02em; }
        .logo-text span { color: var(--azure); }
        .header-right { display: flex; align-items: center; gap: 0.4rem; }
        .icon-btn { position: relative; width: 36px; height: 36px; border-radius: 10px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .icon-btn:hover { background: rgba(10,129,255,0.06); color: var(--azure); }
        .icon-btn svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
        .notif-dot { position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; background: var(--azure); border-radius: 50%; border: 1.5px solid white; }
        .avatar-sm { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--azure), var(--frosted)); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.7rem; font-weight: 800; margin-left: 0.35rem; cursor: pointer; box-shadow: 0 2px 8px rgba(10,129,255,0.15); transition: box-shadow 0.2s; }
        .content { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
        .greeting-row { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; margin-bottom: 2.2rem; }
        .greeting-avatar { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, var(--azure), var(--frosted)); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.6rem; font-weight: 800; box-shadow: 0 6px 28px rgba(10,129,255,0.22); border: 3px solid white; }
        .greeting-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center; }
        .section { margin-bottom: 2.2rem; }
        .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .section-title { font-size: 1.15rem; font-weight: 700; color: var(--text-dark); }
        .section-subtitle { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem; }
        .section-link { font-size: 0.75rem; font-weight: 600; color: var(--azure); text-decoration: none; cursor: pointer; }
        .card { background: rgba(255,255,255,0.82); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(10,22,40,0.04); transition: all 0.25s; }
        .card:hover { box-shadow: 0 4px 20px rgba(10,22,40,0.06); border-color: rgba(10,129,255,0.15); }
        .card-clickable { cursor: pointer; }
        .btn { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.55rem 1.15rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: 'Sora', sans-serif; }
        .btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .btn-primary { background: linear-gradient(135deg, var(--azure), var(--azure-light)); color: white; box-shadow: 0 2px 12px rgba(10,129,255,0.2); }
        .btn-primary:hover { box-shadow: 0 4px 20px rgba(10,129,255,0.3); transform: translateY(-1px); }
        .btn-secondary { background: rgba(255,255,255,0.85); color: var(--text-body); border: 1px solid var(--border); }
        .btn-secondary:hover { border-color: rgba(10,129,255,0.3); }
        .badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.15rem 0.45rem; border-radius: 6px; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        .badge svg { width: 10px; height: 10px; stroke: currentColor; fill: none; stroke-width: 2.5; stroke-linecap: round; }
        .badge-blue { background: rgba(10,129,255,0.08); color: var(--azure); }
        .badge-green { background: rgba(16,185,129,0.08); color: var(--success); }
        .tabs { display: flex; background: rgba(240,244,248,0.8); border-radius: 10px; padding: 3px; gap: 2px; }
        .tab { padding: 0.35rem 0.9rem; border-radius: 8px; font-size: 0.72rem; font-weight: 600; border: none; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s; font-family: 'Sora', sans-serif; }
        .tab.active { background: white; color: var(--text-dark); box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem; }
        .profile-card-inner { display: flex; align-items: center; gap: 1rem; }
        .avatar-lg { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, var(--azure), var(--frosted)); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.1rem; font-weight: 800; box-shadow: 0 4px 16px rgba(10,129,255,0.2); flex-shrink: 0; }
        .stat-card-inner { display: flex; align-items: center; gap: 0.8rem; }
        .stat-num-box { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800; flex-shrink: 0; }
        .stat-num-box.blue { background: rgba(10,129,255,0.06); color: var(--azure); }
        .stat-num-box.green { background: rgba(16,185,129,0.06); color: var(--success); }
        .stat-label { font-size: 0.82rem; font-weight: 600; color: var(--text-dark); }
        .stat-sub { font-size: 0.68rem; color: var(--text-muted); }
        .cases-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .case-row { display: flex; align-items: center; justify-content: space-between; }
        .case-title-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; flex-wrap: wrap; }
        .case-title { font-size: 0.82rem; font-weight: 600; color: var(--text-dark); }
        .case-meta { display: flex; align-items: center; gap: 0.8rem; font-size: 0.7rem; color: var(--text-muted); }
        .case-meta svg { width: 12px; height: 12px; stroke: currentColor; fill: none; stroke-width: 1.8; }
        .case-chevron { color: var(--text-light); transition: color 0.2s; flex-shrink: 0; margin-left: 0.8rem; }
        .card-clickable:hover .case-chevron { color: var(--azure); }
        .pros-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.8rem; }
        .pro-head { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.65rem; }
        .pro-avatar { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.68rem; font-weight: 800; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .pro-name { font-size: 0.8rem; font-weight: 600; color: var(--text-dark); }
        .pro-spec { font-size: 0.68rem; color: var(--text-muted); }
        .pro-badges { display: flex; gap: 0.3rem; margin-bottom: 0.65rem; }
        .pro-stats { display: flex; gap: 0.8rem; padding-top: 0.6rem; border-top: 1px solid var(--border-light); font-size: 0.68rem; color: var(--text-muted); }
        .pro-stats strong { color: var(--text-dark); font-weight: 600; }
        .star-icon { display: inline-flex; color: var(--amber); margin-right: 1px; }
        .star-icon svg { width: 10px; height: 10px; fill: currentColor; stroke: none; }
        .records-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; }
        .record-inner { display: flex; align-items: flex-start; gap: 0.7rem; }
        .record-icon { width: 38px; height: 38px; border-radius: 10px; background: rgba(240,244,248,0.8); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
        .record-name { font-size: 0.8rem; font-weight: 600; color: var(--text-dark); }
        .record-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.3rem; }
        .record-type { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); background: rgba(240,244,248,0.8); padding: 0.12rem 0.4rem; border-radius: 4px; }
        .record-date { font-size: 0.68rem; color: var(--text-muted); }
        .empty-state { text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.82rem; }
        .fade-up { opacity:0; transform:translateY(18px); animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
        .d1{animation-delay:0.05s} .d2{animation-delay:0.12s} .d3{animation-delay:0.2s} .d4{animation-delay:0.28s} .d5{animation-delay:0.36s}
        @media(max-width:900px){ .stats-grid{grid-template-columns:1fr} .pros-grid{grid-template-columns:repeat(2,1fr)} .records-grid{grid-template-columns:1fr} }
        @media(max-width:600px){ .pros-grid{grid-template-columns:1fr} .content{padding:1.2rem 1rem 3rem} .greeting-avatar{width:72px;height:72px;font-size:1.3rem} }
      `}</style>

      <div className="page-wrap">
        {/* DNA CANVAS */}
        <div ref={wrapRef} id="dna-wrap">
          <canvas ref={canvasRef} id="dna" />
        </div>

        {/* HEADER */}
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24"><path d="M2 15c6.667-6 13.333 0 20-6M9 22c1.798-1.998 2.573-3.995 2.572-5.993M15 2c-1.798 1.998-2.573 3.995-2.572 5.993M2 9c6.667 6 13.333 0 20 6"/></svg>
              </div>
              <div className="logo-text">Med<span>Second</span></div>
            </div>
            <div className="header-right">
              <button className="icon-btn">
                <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span className="notif-dot"></span>
              </button>
              <button className="icon-btn">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              </button>
              <div className="avatar-sm">SM</div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="content">
          {/* GREETING */}
          <div className="greeting-row fade-up d1">
            <div className="greeting-avatar">SM</div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--azure)', marginBottom: '0.15rem' }}>Welcome back</p>
              <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>Sarah Mitchell</h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>2 active cases · 12 saved records</p>
            </div>
            <div className="greeting-actions">
              <button className="btn btn-primary"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Open New Case</button>
              <button className="btn btn-secondary"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>Upload Records</button>
              <button className="btn btn-secondary"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Digital Twin</button>
            </div>
          </div>

          {/* STATS */}
          <div className="section fade-up d2">
            <div className="stats-grid">
              <div className="card">
                <div className="profile-card-inner">
                  <div className="avatar-lg">SM</div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dark)' }}>Sarah Mitchell</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age 34 · Patient</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>sarah.mitchell@email.com</div>
                  </div>
                </div>
              </div>
              <div className="card"><div className="stat-card-inner"><div className="stat-num-box blue">2</div><div><div className="stat-label">Active Cases</div><div className="stat-sub">Awaiting opinions</div></div></div></div>
              <div className="card"><div className="stat-card-inner"><div className="stat-num-box green">5</div><div><div className="stat-label">Completed</div><div className="stat-sub">All resolved</div></div></div></div>
            </div>
          </div>

          {/* CASES */}
          <div className="section fade-up d3">
            <div className="section-head">
              <div className="section-title">Your Cases</div>
              <div className="tabs">
                <button className={`tab ${curTab === 'active' ? 'active' : ''}`} onClick={() => setCurTab('active')}>Active</button>
                <button className={`tab ${curTab === 'completed' ? 'active' : ''}`} onClick={() => setCurTab('completed')}>Completed</button>
              </div>
            </div>
            <div className="cases-list">
              {activeCases.length ? activeCases.map(c => (
                <div key={c.id} className="card card-clickable">
                  <div className="case-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="case-title-row">
                        <div className="case-title">{c.title}</div>
                        <span className={`badge badge-${c.status === 'active' ? 'blue' : 'green'}`}>
                          <svg viewBox="0 0 24 24">{c.status === 'active' ? '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>' : '<path d="M20 6L9 17l-5-5"/>'}</svg>
                          {c.label}
                        </span>
                      </div>
                      <div className="case-meta">
                        <span>Opened {c.date}</span>
                        <span><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> {c.opinions} opinion{c.opinions !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="case-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg></div>
                  </div>
                </div>
              )) : <div className="card"><div className="empty-state">No {curTab} cases</div></div>}
            </div>
          </div>

          {/* PROFESSIONALS */}
          <div className="section fade-up d4">
            <div className="section-head">
              <div className="section-title">Saved Professionals</div>
              <a className="section-link">View All →</a>
            </div>
            <div className="pros-grid">
              {PROS.map((p, idx) => (
                <div key={idx} className="card card-clickable">
                  <div className="pro-head">
                    <div className="pro-avatar" style={{ background: p.color }}>{p.ini}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="pro-name">{p.name}</div>
                      <div className="pro-spec">{p.spec}</div>
                    </div>
                  </div>
                  <div className="pro-badges">
                    <span className={`badge badge-${p.bt}`}><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>{p.badge}</span>
                  </div>
                  <div className="pro-stats">
                    <span><strong>{p.rev}</strong> reviews</span>
                    <span><span className="star-icon"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span><strong>{p.rat}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECORDS */}
          <div className="section fade-up d5">
            <div className="section-head">
              <div><div className="section-title">Medical Records</div><div className="section-subtitle">Your Digital Health Twin — all records in one place</div></div>
              <button className="btn btn-secondary" style={{ fontSize: '0.72rem' }}><svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>Upload</button>
            </div>
            <div className="records-grid">
              {RECS.map((r, idx) => (
                <div key={idx} className="card card-clickable">
                  <div className="record-inner">
                    <div className="record-icon">{r.icon}</div>
                    <div className="record-info" style={{ flex: 1, minWidth: 0 }}>
                      <div className="record-name">{r.name}</div>
                      <div className="record-meta">
                        <span className="record-type">{r.type}</span>
                        <span className="record-date">{r.date}</span>
                      </div>
                    </div>
                    <div className="case-chevron"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
