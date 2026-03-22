'use client';

import { useEffect, useRef } from 'react';

export default function DNABackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const C = canvasRef.current;
    if (!C) return;
    const ctx = C.getContext('2d');
    if (!ctx) return;

    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d');
    if (!bgCtx) return;

    // Theme-aware colors
    function getThemeColors() {
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDarkMode) {
        return {
          primary: '#00D9FF',      // Cyan
          secondary: '#0099CC',    // Dark cyan
          tertiary: '#00FFFF',     // Light cyan
          overlay: 'rgba(0,0,0,0.3)', // Dark overlay
          dust: '#4DB8FF'          // Light blue
        };
      } else {
        return {
          primary: '#0A81FF',      // Blue
          secondary: '#59BAEE',    // Light blue
          tertiary: '#8DE0F6',     // Sky blue
          overlay: 'rgba(255,255,255,0.5)', // Light overlay
          dust: '#0A81FF'          // Blue
        };
      }
    }

    let themeColors = getThemeColors();

    // Listen for theme changes
    const handleThemeChange = () => {
      themeColors = getThemeColors();
    };

    window.addEventListener('themeChange', handleThemeChange);

    let animId: number;
    let alive = true;
    let W = 0, H = 0, tick = 0;
    let mx = -9999, my = -9999;
    let scrollY = 0;
    const MR = 200, MP = 90;
    const TOTAL_PAGES = 5;

    function resize() {
      if (!C) return;
      W = C.width = Math.max(1, window.innerWidth);
      H = C.height = Math.max(1, window.innerHeight);
      bgCanvas.width = W;
      bgCanvas.height = H;
    }

    function rgba(hex: string, a: number) {
      return `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${Math.max(0, Math.min(1, a))})`;
    }

    const HELIX_R = 100;
    const COUNT = 600;
    const TWIST = 0.04;
    const ROT_SPEED = 0.008;

    function spine(t: number, time: number) {
      const totalHeight = H * TOTAL_PAGES;
      const w1 = Math.sin(t * Math.PI * 2.5 + time * 0.25) * 0.14;
      const w2 = Math.sin(t * Math.PI * 1.7 + time * 0.18 + 1.5) * 0.07;
      const w3 = Math.cos(t * Math.PI * 3.0 + time * 0.12) * 0.03;
      const sx = (0.5 + w1 + w2 + (t - 0.5) * 0.3) * W;
      const sy = t * totalHeight - scrollY + w3 * H * 0.3;
      const dt = 0.001, t2 = t + dt;
      const w1b = Math.sin(t2 * Math.PI * 2.5 + time * 0.25) * 0.14;
      const w2b = Math.sin(t2 * Math.PI * 1.7 + time * 0.18 + 1.5) * 0.07;
      const w3b = Math.cos(t2 * Math.PI * 3.0 + time * 0.12) * 0.03;
      const sx2 = (0.5 + w1b + w2b + (t2 - 0.5) * 0.3) * W;
      const sy2 = t2 * totalHeight - scrollY + w3b * H * 0.3;
      const dx = sx2 - sx, dy = sy2 - sy, len = Math.sqrt(dx * dx + dy * dy) || 1;
      return { x: sx, y: sy, nx: -dy / len, ny: dx / len };
    }

    const MAX_FLOW = 500;
    let flows: Array<{
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; life: number; ttl: number; col: string;
    }> = [];

    function spawnFlow(x: number, y: number, col: string) {
      if (flows.length >= MAX_FLOW) return;
      const a = Math.random() * Math.PI * 2, sp = 0.4 + Math.random() * 1.8;
      flows.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: 0.6 + Math.random() * 2.2, alpha: 0.5 + Math.random() * 0.5,
        life: 0, ttl: 40 + Math.random() * 100, col,
      });
    }

    const dust = Array.from({ length: 60 }, () => ({
      x: Math.random() * 3000, y: Math.random() * 2000,
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
      r: 0.3 + Math.random() * 0.7, a: 0.1 + Math.random() * 0.2,
      col: themeColors.primary,
    }));

    const bgLayers = [
      {
        // 75° diagonal
        radius: 60,
        pointsPerPx: 0.5,
        twist: 0.045,
        rotSpeed: 0.005,
        opacity: 0.4,
        strandWidth: 3.0,
        rungWidth: 1.0,
        blur: 6,
        cx: 0.5, cy: 0.5,
        oxA: 0.04, oyA: 0.04,
        oxF: 0.04, oyF: 0.03,
        oxP: 0.0, oyP: 1.0,
        baseAngle: (75 * Math.PI) / 180,
        angleAmp: 0.05,
        angleFreq: 0.02,
        anglePhase: 0.0,
        themeAware: true,
      },
      {
        // -45° opposite diagonal
        radius: 70,
        pointsPerPx: 0.45,
        twist: 0.038,
        rotSpeed: 0.006,
        opacity: 0.5,
        strandWidth: 3.5,
        rungWidth: 1.2,
        blur: 5,
        cx: 0.5, cy: 0.5,
        oxA: 0.04, oyA: 0.04,
        oxF: 0.03, oyF: 0.04,
        oxP: 2.5, oyP: 0.5,
        baseAngle: -Math.PI / 4,
        angleAmp: 0.05,
        angleFreq: 0.02,
        anglePhase: 2.0,
        themeAware: true,
      },
    ];

    function computeBgStrands(layer: typeof bgLayers[0], time: number) {
      const centerX = (layer.cx + Math.sin(time * layer.oxF + layer.oxP) * layer.oxA) * W;
      const centerY = (layer.cy + Math.sin(time * layer.oyF + layer.oyP) * layer.oyA) * H;

      const angle = layer.baseAngle + Math.sin(time * layer.angleFreq + layer.anglePhase) * layer.angleAmp;
      const dirX = Math.cos(angle), dirY = Math.sin(angle);
      const nrmX = -dirY, nrmY = dirX;

      const diag = Math.sqrt(W * W + H * H);
      const halfLen = diag * 0.8;
      const N = Math.max(200, Math.floor(halfLen * 2 * layer.pointsPerPx));

      const strand1: Array<{ x: number; y: number; d: number }> = [];
      const strand2: Array<{ x: number; y: number; d: number }> = [];

      for (let i = 0; i < N; i++) {
        const f = (i / (N - 1)) * 2 - 1;
        const spX = centerX + dirX * f * halfLen;
        const spY = centerY + dirY * f * halfLen;
        const wave = Math.sin(i * 0.03 + time * 0.1 + layer.oxP) * 14;
        const fSpX = spX + nrmX * wave;
        const fSpY = spY + nrmY * wave;
        const helixAngle = i * layer.twist + tick * layer.rotSpeed;
        const c1 = Math.cos(helixAngle), s1 = Math.sin(helixAngle);
        const c2 = Math.cos(helixAngle + Math.PI), s2 = Math.sin(helixAngle + Math.PI);
        strand1.push({ x: fSpX + nrmX * c1 * layer.radius, y: fSpY + nrmY * c1 * layer.radius, d: s1 });
        strand2.push({ x: fSpX + nrmX * c2 * layer.radius, y: fSpY + nrmY * c2 * layer.radius, d: s2 });
      }
      return { strand1, strand2 };
    }

    function renderBgHelix(target: CanvasRenderingContext2D, layer: typeof bgLayers[0], time: number) {
      const opc = layer.opacity;
      const col1 = themeColors.primary;
      const col2 = themeColors.secondary;
      const glow = themeColors.tertiary;
      const { strand1, strand2 } = computeBgStrands(layer, time);

      for (let i = 1; i < strand1.length; i++) {
        const p0 = strand1[i - 1], p1 = strand1[i];
        const avgD = (p0.d + p1.d) / 2;
        const dn = (avgD + 1) / 2;
        const segAlpha = (0.2 + 0.8 * dn) * opc;
        target.beginPath();
        target.moveTo(p0.x, p0.y);
        target.lineTo(p1.x, p1.y);
        target.strokeStyle = rgba(col1, segAlpha * 0.7);
        target.lineWidth = layer.strandWidth * (0.5 + 0.5 * dn);
        target.lineCap = 'round';
        target.stroke();
      }

      for (let i = 1; i < strand2.length; i++) {
        const p0 = strand2[i - 1], p1 = strand2[i];
        const avgD = (p0.d + p1.d) / 2;
        const dn = (avgD + 1) / 2;
        const segAlpha = (0.2 + 0.8 * dn) * opc;
        target.beginPath();
        target.moveTo(p0.x, p0.y);
        target.lineTo(p1.x, p1.y);
        target.strokeStyle = rgba(col2, segAlpha * 0.6);
        target.lineWidth = layer.strandWidth * (0.5 + 0.5 * dn);
        target.lineCap = 'round';
        target.stroke();
      }

      const rungStep = Math.max(1, Math.floor(strand1.length / 70));
      for (let i = 0; i < strand1.length; i += rungStep) {
        const p1 = strand1[i], p2 = strand2[i];
        const avgD = (p1.d + p2.d) / 2;
        const dn = (avgD + 1) / 2;
        const lineAlpha = (0.1 + 0.5 * dn) * opc;
        target.beginPath();
        target.moveTo(p1.x, p1.y);
        target.lineTo(p2.x, p2.y);
        target.strokeStyle = rgba(col1, lineAlpha);
        target.lineWidth = layer.rungWidth * (0.4 + 0.6 * dn);
        target.lineCap = 'round';
        target.stroke();
      }

      const dotStep = Math.max(1, Math.floor(strand1.length / 90));
      for (let i = 0; i < strand1.length; i += dotStep) {
        const pts = [
          { ...strand1[i], s: 1 },
          { ...strand2[i], s: 2 },
        ];
        for (const p of pts) {
          const dn = (p.d + 1) / 2;
          const r = (1.0 + 3.0 * dn) * (layer.radius / 65);
          const a = (0.2 + 0.8 * dn) * opc;
          const col = p.s === 1 ? col1 : col2;
          target.beginPath();
          target.arc(p.x, p.y, r * 2.2, 0, 6.28);
          target.fillStyle = rgba(col, a * 0.08);
          target.fill();
          target.beginPath();
          target.arc(p.x, p.y, r, 0, 6.28);
          target.fillStyle = rgba(col, a * 0.85);
          target.fill();
          target.beginPath();
          target.arc(p.x, p.y, r * 0.3, 0, 6.28);
          target.fillStyle = rgba(glow, a * 0.6);
          target.fill();
        }
      }
    }

    function frame() {
      if (W === 0 || H === 0) {
        if (alive) animId = requestAnimationFrame(frame);
        return;
      }

      tick++;
      const time = tick * 0.008;

      ctx!.fillStyle = themeColors.overlay;
      ctx!.fillRect(0, 0, W, H);

      for (const d of dust) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < -20) d.x = W + 20;
        if (d.x > W + 20) d.x = -20;
        if (d.y < -20) d.y = H + 20;
        if (d.y > H + 20) d.y = -20;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, 6.28);
        ctx!.fillStyle = rgba(themeColors.dust, d.a);
        ctx!.fill();
      }

      for (const layer of bgLayers) {
        bgCtx!.clearRect(0, 0, W, H);
        renderBgHelix(bgCtx!, layer, time);
        ctx!.save();
        ctx!.filter = `blur(${layer.blur}px)`;
        ctx!.globalAlpha = 0.8;
        ctx!.drawImage(bgCanvas, 0, 0);
        ctx!.restore();
      }

      const dots: Array<{ x: number; y: number; d: number; s: number; i: number }> = [];
      const totalH = H * TOTAL_PAGES;
      const vTop = scrollY - H * 0.3, vBot = scrollY + H * 1.3;

      for (let i = 0; i < COUNT; i++) {
        const t = -0.05 + (i / COUNT) * 1.1;
        const worldY = t * totalH;
        if (worldY < vTop || worldY > vBot) continue;

        const sp = spine(t, time);
        const angle = i * TWIST + tick * ROT_SPEED;
        const cos1 = Math.cos(angle), sin1 = Math.sin(angle);
        const cos2 = Math.cos(angle + Math.PI), sin2 = Math.sin(angle + Math.PI);

        let x1 = sp.x + sp.nx * cos1 * HELIX_R,
          y1 = sp.y + sp.ny * cos1 * HELIX_R,
          depth1 = sin1;
        let x2 = sp.x + sp.nx * cos2 * HELIX_R,
          y2 = sp.y + sp.ny * cos2 * HELIX_R,
          depth2 = sin2;

        const pts = [
          {
            get x() { return x1; }, get y() { return y1; },
            set(v: { x: number; y: number }) { x1 = v.x; y1 = v.y; },
          },
          {
            get x() { return x2; }, get y() { return y2; },
            set(v: { x: number; y: number }) { x2 = v.x; y2 = v.y; },
          },
        ];

        for (const pt of pts) {
          const dx = pt.x - mx, dy = pt.y - my, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MR && dist > 1) {
            const f = ((1 - dist / MR) * (1 - dist / MR) * MP);
            pt.set({ x: pt.x + (dx / dist) * f, y: pt.y + (dy / dist) * f });
          }
        }

        dots.push({ x: x1, y: y1, d: depth1, s: 1, i });
        dots.push({ x: x2, y: y2, d: depth2, s: 2, i });

        if (i % 5 === 0) {
          const avgD = (depth1 + depth2) / 2;
          const rAlpha = 0.08 + 0.45 * ((avgD + 1) / 2);
          for (let s = 0; s <= 12; s++) {
            const f = s / 12;
            const rx = x1 + (x2 - x1) * f, ry = y1 + (y2 - y1) * f;
            const rr = 0.8 + 2.2 * ((avgD + 1) / 2);
            const ra = rAlpha * (0.3 + 0.7 * Math.sin(f * Math.PI));
            ctx!.beginPath();
            ctx!.arc(rx, ry, rr, 0, 6.28);
            ctx!.fillStyle = rgba(themeColors.primary, ra * 0.7);
            ctx!.fill();
            ctx!.beginPath();
            ctx!.arc(rx, ry, rr * 0.6, 0, 6.28);
            ctx!.fillStyle = rgba(themeColors.secondary, ra * 0.9);
            ctx!.fill();
          }
        }

        if (Math.random() < 0.012) {
          const pick = Math.random() < 0.5;
          spawnFlow(
            pick ? x1 : x2, pick ? y1 : y2,
            [themeColors.primary, themeColors.secondary, themeColors.tertiary][Math.floor(Math.random() * 3)]
          );
        }
      }

      dots.sort((a, b) => a.d - b.d);

      for (const p of dots) {
        const dn = (p.d + 1) / 2;
        const r = 1.2 + 4.5 * dn;
        const a = 0.1 + 0.9 * dn;
        const col = p.s === 1 ? themeColors.primary : themeColors.secondary;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r * 3.5, 0, 6.28);
        ctx!.fillStyle = rgba(col, a * 0.04);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r * 1.8, 0, 6.28);
        ctx!.fillStyle = rgba(col, a * 0.12);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r, 0, 6.28);
        ctx!.fillStyle = rgba(col, a * 0.95);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r * 0.28, 0, 6.28);
        ctx!.fillStyle = rgba(themeColors.tertiary, a * 0.8);
        ctx!.fill();
      }

      flows = flows.filter((f) => {
        f.life++;
        f.x += f.vx; f.y += f.vy;
        f.vy += 0.003;
        f.vx *= 0.997; f.vy *= 0.997;
        const dx = f.x - mx, dy = f.y - my, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MR * 0.6 && dist > 1) {
          const force = (1 - dist / (MR * 0.6)) * 2.5;
          f.vx += (dx / dist) * force;
          f.vy += (dy / dist) * force;
        }
        const fade = 1 - f.life / f.ttl;
        if (fade <= 0) return false;
        const a = f.alpha * fade * fade;
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.r * 2 * fade, 0, 6.28);
        ctx!.fillStyle = rgba(f.col, a * 0.12);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.r * fade, 0, 6.28);
        ctx!.fillStyle = rgba(f.col, a);
        ctx!.fill();
        return true;
      });

      if (W > 0 && H > 0 && C) {
        ctx!.save();
        ctx!.filter = 'blur(18px)';
        ctx!.globalCompositeOperation = 'multiply';
        ctx!.globalAlpha = 0.03;
        ctx!.drawImage(C, 0, 0);
        ctx!.restore();
      }

      if (alive) animId = requestAnimationFrame(frame);
    }

    const handleResize = () => resize();
    const handleScroll = () => { scrollY = window.scrollY; };
    const handleMouseMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const handleMouseLeave = () => { mx = my = -9999; };
    const handleTouchMove = (e: TouchEvent) => { mx = e.touches[0].clientX; my = e.touches[0].clientY; };
    const handleTouchEnd = () => { mx = my = -9999; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('themeChange', handleThemeChange);

    resize();
    animId = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      />
      <div className="relative z-10 pointer-events-auto">
        {/* Content goes here */}
      </div>
    </>
  );
}
