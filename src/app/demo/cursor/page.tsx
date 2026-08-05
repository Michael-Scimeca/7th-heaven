"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

type CursorPreset = "pick" | "neon" | "particles";

export default function CursorTestingPage() {
  const [preset, setPreset] = useState<CursorPreset>("pick");

  // The leading sharp dot + 4 lagging pick blobs
  const dotRef = useRef<HTMLDivElement>(null);
  const picksRef = useRef<(SVGSVGElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const posXRef = useRef<HTMLSpanElement>(null);
  const posYRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);

  const pos = useRef({
    mx: -200, my: -200,
    lastX: 0, lastY: 0,
  });

  // Each of the 5 nodes has its own lerped position
  const nodes = useRef(
    Array.from({ length: 5 }, () => ({ x: -200, y: -200 }))
  );

  const particlesRef = useRef<
    { x: number; y: number; vx: number; vy: number; r: number; a: number }[]
  >([]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current.mx = e.clientX;
      pos.current.my = e.clientY;
      if (posXRef.current) posXRef.current.textContent = `${e.clientX}`;
      if (posYRef.current) posYRef.current.textContent = `${e.clientY}`;

      if (preset === "particles") {
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push({
            x: e.clientX, y: e.clientY,
            vx: (Math.random() - 0.5) * 3.5,
            vy: (Math.random() - 0.5) * 3.5,
            r: Math.random() * 5 + 2,
            a: 1,
          });
        }
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    // Cascade lerp: smooth stretch without bounce snap-back
    const speeds = [0.85, 0.48, 0.28, 0.16, 0.09];

    let raf: number;
    const loop = () => {
      const { mx, my, lastX, lastY } = pos.current;
      const vel = Math.round(Math.sqrt((mx - lastX) ** 2 + (my - lastY) ** 2));
      if (velRef.current) velRef.current.textContent = `${vel}`;
      pos.current.lastX = mx;
      pos.current.lastY = my;

      for (let i = 0; i < 5; i++) {
        const tx = i === 0 ? mx : nodes.current[i - 1].x;
        const ty = i === 0 ? my : nodes.current[i - 1].y;
        nodes.current[i].x += (tx - nodes.current[i].x) * speeds[i];
        nodes.current[i].y += (ty - nodes.current[i].y) * speeds[i];
      }

      // Move leading sharp dot (snaps to mouse instantly)
      if (dotRef.current) {
        dotRef.current.style.left = `${mx}px`;
        dotRef.current.style.top = `${my}px`;
      }

      // Move the pick SVG elements (they have the gooey treatment)
      picksRef.current.forEach((pick, i) => {
        if (pick) {
          pick.style.left = `${nodes.current[i].x}px`;
          pick.style.top = `${nodes.current[i].y}px`;
        }
      });

      // Particle canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx && preset === "particles") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particlesRef.current.forEach((p, idx) => {
            p.x += p.vx; p.y += p.vy;
            p.a -= 0.022; p.r *= 0.97;
            if (p.a <= 0 || p.r < 0.2) { particlesRef.current.splice(idx, 1); return; }
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.a);
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
            grad.addColorStop(0, "#C245AA");
            grad.addColorStop(1, "#9C27B000");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        } else if (ctx && preset !== "particles") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [preset]);

  // Canvas size
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Bigger sizes = gooey blob is thick and rubbery; tail fades
  const pickSizes  = [23, 19, 15, 11, 7];
  const pickColors = ["#9C27B0", "#A92EAD", "#B83AAA", "#C845A8", "#D852A4"];
  const pickOpacity = [1, 0.95, 0.88, 0.78, 0.6];

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-white relative overflow-hidden font-sans pt-24 pb-20">

      {/* Force cursor:none everywhere — overrides pointer/default on links/buttons */}
      <style>{`*, *:hover, *:active, *:focus { cursor: none !important; }`}</style>

      {/* ── SVG Gooey Filter ── */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* ── Particle Canvas ── */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 2147483646 }} />

      {/* ── Gooey Guitar Pick Cursor Container ──
           filter:url(#gooey) applied here so all picks merge into one liquid blob  */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 2147483647,
          filter: preset !== "particles" ? "url(#gooey)" : "none",
        }}
      >
        {pickSizes.map((size, i) => (
          <svg
            key={i}
            ref={(el) => { picksRef.current[i] = el; }}
            viewBox="0 0 100 120"
            className="absolute will-change-[left,top]"
            style={{
              width: size,
              height: size,
              marginLeft: -(size / 2),
              marginTop: -(size / 2),
              opacity: preset === "particles" ? 0 : pickOpacity[i],
              filter: preset === "neon"
                ? `drop-shadow(0 0 ${8 + i * 4}px ${pickColors[i]}cc)`
                : "none",
            }}
          >
            {/*
              Guitar pick (Dunlop standard) traced path:
              - Wide domed top arc (nearly full width)
              - Left/right sides curve gently inward
              - Comes to a sharp rounded tip at bottom
            */}
            <path
              d="M 50,4 C 22,4 4,20 4,42 C 4,68 26,92 50,116 C 74,92 96,68 96,42 C 96,20 78,4 50,4 Z"
              fill={preset === "particles" ? "transparent" : pickColors[i]}
            />
          </svg>
        ))}
      </div>


      {/* ═══ PAGE CONTENT ═══ */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-white/10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-[var(--font-size-3xs)] font-black uppercase tracking-widest bg-[#9C27B0]/20 border border-[#9C27B0]/40 text-[#C245AA]">
                🎸 Guitar Pick Gooey Cursor · SVG Blob Filter
              </span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-black uppercase italic tracking-tight"
              style={{ fontFamily: "var(--font-heading, sans-serif)" }}
            >
              Custom Cursor Lab
            </h1>
            <p className="text-white/50 text-sm max-w-xl mt-2">
              5-node cascade with <code className="text-[#C245AA] bg-black/40 px-1.5 py-0.5 rounded">feGaussianBlur</code> + <code className="text-white/60">feColorMatrix</code> — the pick shape is always on, not hover-triggered.
            </p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all">
            ← Back
          </Link>
        </div>

        {/* Telemetry */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-[#0b0b14] border border-white/10 p-5">
            <p className="text-[var(--font-size-3xs)] font-black uppercase tracking-widest text-white/40 mb-1">X</p>
            <p className="text-2xl font-black text-[#C245AA]"><span ref={posXRef}>0</span><span className="text-xs text-white/30 ml-1">px</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 p-5">
            <p className="text-[var(--font-size-3xs)] font-black uppercase tracking-widest text-white/40 mb-1">Y</p>
            <p className="text-2xl font-black text-[#C245AA]"><span ref={posYRef}>0</span><span className="text-xs text-white/30 ml-1">px</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 p-5">
            <p className="text-[var(--font-size-3xs)] font-black uppercase tracking-widest text-white/40 mb-1">Velocity</p>
            <p className="text-2xl font-black text-[#9C27B0]"><span ref={velRef}>0</span><span className="text-xs text-white/30 ml-1">px/f</span></p>
          </div>
        </div>

        {/* Preset Switcher */}
        <div className="bg-[#0d0d18] border border-white/10 p-2 flex flex-wrap gap-2 mb-12">
          {([
            ["pick",      "🎸 Guitar Pick Gooey"],
            ["neon",      "✨ Neon Glow"],
            ["particles", "🎨 Particle Trail"],
          ] as [CursorPreset, string][]).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`flex-1 min-w-[140px] py-3 px-4  text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                preset === p
                  ? "bg-[#9C27B0] text-white shadow-[0_0_20px_#9C27B080]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Test Zones — just filler content to move over */}
        <h2 className="text-2xl font-black uppercase italic text-white mb-6" style={{ fontFamily: "var(--font-heading, sans-serif)" }}>
          Move Around — Feel the Gooey Pick
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { title: "Slow & Slow",   desc: "Move slowly — the cascade collapses into one fat pick blob.", color: "hover:border-[#9C27B0]/60", badge: "text-[#9C27B0]" },
            { title: "Fast Whip",     desc: "Whip fast — the pick nodes stretch into a long gooey liquid tail.", color: "hover:border-[#C245AA]/60", badge: "text-[#C245AA]" },
            { title: "Tight Circles", desc: "Draw tight circles — watch the pick blob swirl and merge.", color: "hover:border-[#E35FA4]/60", badge: "text-[#E35FA4]" },
          ].map((t, i) => (
            <div
              key={i}
              className={`bg-[var(--color-bg-surface)] border border-white/10 ${t.color} rounded-3xl p-8 transition-colors group flex flex-col justify-between min-h-[220px]`}
            >
              <div>
                <span className={`text-xs font-black uppercase tracking-wider ${t.badge}`}>Zone {i + 1}</span>
                <h3 className="text-xl font-black uppercase italic text-white mt-1 transition-colors" style={{ fontFamily: "var(--font-heading, sans-serif)" }}>
                  {t.title}
                </h3>
                <p className="text-xs text-white/50 mt-2">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Code Card */}
        <div className="bg-[#0b0b14] border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black uppercase italic text-white" style={{ fontFamily: "var(--font-heading, sans-serif)" }}>
              Technique Breakdown
            </h3>
            <span className="text-xs text-emerald-400 font-bold">✓ Always-on pick shape</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-black/60 p-4 border border-white/10">
              <p className="text-[#9C27B0] font-bold mb-2">// SVG Guitar Pick Path</p>
              <pre className="text-white/60 whitespace-pre-wrap leading-relaxed">{`<path d="
  M 50,6
  C 82,6 96,26 91,54
  C 82,82 50,110 50,110
  C 50,110 18,82 9,54
  C 4,26 18,6 50,6 Z
" fill="#9C27B0" />`}</pre>
            </div>
            <div className="bg-black/60 p-4 border border-white/10">
              <p className="text-[#C245AA] font-bold mb-2">// Cascade Lerp (5 nodes)</p>
              <pre className="text-white/60 whitespace-pre-wrap leading-relaxed">{`const speeds = [0.95,0.55,0.38,0.26,0.17];
for (let i = 0; i < 5; i++) {
  const t = i === 0 ? mouse : nodes[i-1];
  nodes[i].x += (t.x - nodes[i].x) * speeds[i];
  nodes[i].y += (t.y - nodes[i].y) * speeds[i];
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
