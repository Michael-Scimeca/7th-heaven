"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

type CursorPreset = "tobias" | "magnetic" | "neon" | "particles" | "spotlight";

export default function CursorTestingPage() {
  const [preset, setPreset] = useState<CursorPreset>("tobias");
  const [hoverText, setHoverText] = useState<string | null>(null);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // DOM refs for zero-lag 120fps telemetry (NO React re-renders on mousemove!)
  const posXRef = useRef<HTMLSpanElement>(null);
  const posYRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const hoverStateRef = useRef<HTMLParagraphElement>(null);

  const posRef = useRef({
    targetX: -100,
    targetY: -100,
    dotX: -100,
    dotY: -100,
    ringX: -100,
    ringY: -100,
    lastX: 0,
    lastY: 0,
    isHovered: false,
    isClicked: false,
  });

  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number; color: string }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;

      if (posXRef.current) posXRef.current.textContent = `${e.clientX}`;
      if (posYRef.current) posYRef.current.textContent = `${e.clientY}`;

      if (preset === "particles") {
        const colors = ["#851DEF", "#ec4899", "#3b82f6", "#06b6d4", "#f59e0b"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: Math.random() * 4 + 2,
            alpha: 1,
            color,
          });
        }
      }
    };

    const handleMouseDown = () => {
      posRef.current.isClicked = true;
      if (dotRef.current) dotRef.current.classList.add("scale-75");
    };

    const handleMouseUp = () => {
      posRef.current.isClicked = false;
      if (dotRef.current) dotRef.current.classList.remove("scale-75");
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // 120 FPS RAF loop using direct DOM transform3d updates
    let animId: number;
    const renderLoop = () => {
      const p = posRef.current;

      // Calculate velocity
      const dx = p.targetX - p.lastX;
      const dy = p.targetY - p.lastY;
      const vel = Math.round(Math.sqrt(dx * dx + dy * dy));
      if (velRef.current) velRef.current.textContent = `${vel}`;
      p.lastX = p.targetX;
      p.lastY = p.targetY;

      // High-performance lerp math for smooth motion
      p.dotX += (p.targetX - p.dotX) * 0.45;
      p.dotY += (p.targetY - p.dotY) * 0.45;
      p.ringX += (p.targetX - p.ringX) * 0.18;
      p.ringY += (p.targetY - p.ringY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${p.dotX}px, ${p.dotY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${p.ringX}px, ${p.ringY}px, 0) translate(-50%, -50%)`;
      }

      // Render Canvas Particles
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particlesRef.current.forEach((pt, idx) => {
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha -= 0.025;
            pt.radius *= 0.96;

            if (pt.alpha <= 0 || pt.radius <= 0.2) {
              particlesRef.current.splice(idx, 1);
              return;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, pt.alpha);
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(animId);
    };
  }, [preset]);

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Magnetic hover handler
  const handleMagneticMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    el.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "translate3d(0, 0, 0)";
    posRef.current.isHovered = false;
    setHoverText(null);
    if (hoverStateRef.current) {
      hoverStateRef.current.textContent = "IDLE";
      hoverStateRef.current.className = "text-2xl font-black text-white/40";
    }
  };

  const handleHoverEnter = (text: string) => {
    posRef.current.isHovered = true;
    setHoverText(text);
    if (hoverStateRef.current) {
      hoverStateRef.current.textContent = "HOVERING";
      hoverStateRef.current.className = "text-2xl font-black text-emerald-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-[var(--color-accent)] selection:text-white relative overflow-hidden font-sans pt-24 pb-20 cursor-none">
      {/* Particle Canvas Layer */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30" />

      {/* Primary Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none z-50 rounded-full will-change-transform ${
          hoverText
            ? "w-4 h-4 bg-[var(--color-accent)] shadow-[0_0_15px_rgba(133,29,239,0.8)]"
            : preset === "neon"
            ? "w-4 h-4 bg-cyan-400 shadow-[0_0_20px_#06b6d4,0_0_40px_#851DEF]"
            : "w-2.5 h-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        }`}
      />

      {/* Lagging Outer Ring / Guitar Pick */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-40 will-change-transform flex items-center justify-center transition-all duration-200 ease-out ${
          hoverText
            ? "w-20 h-24"
            : preset === "spotlight"
            ? "w-44 h-44 rounded-full border-2 border-white/30 bg-white/5 backdrop-invert"
            : preset === "neon"
            ? "w-20 h-20 rounded-full border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.4)]"
            : "w-10 h-10 rounded-full border-2 border-white/40 bg-transparent"
        }`}
      >
        {hoverText ? (
          /* Guitar Pick Shape when gooey / hovered */
          <div className="relative w-full h-full flex items-center justify-center">
            <svg
              viewBox="0 0 100 115"
              className="absolute inset-0 w-full h-full fill-[var(--color-accent)]/30 stroke-[var(--color-accent)] stroke-[3] filter drop-shadow-[0_0_12px_rgba(133,29,239,0.8)]"
            >
              <path d="M 50,8 C 78,8 95,25 90,52 C 80,80 50,108 50,108 C 50,108 20,80 10,52 C 5,25 22,8 50,8 Z" />
            </svg>
            <span className="relative z-10 text-[9px] font-black uppercase tracking-widest text-purple-200 select-none pb-2 text-center leading-tight">
              {hoverText}
            </span>
          </div>
        ) : null}
      </div>

      <div className="site-container relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-2xs font-black uppercase tracking-widest bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)]">
                ⚡ 120 FPS High-Performance Engine
              </span>
              <span className="text-xs text-white/40">Zero React State Lag</span>
            </div>
            <h1 className="font-[var(--font-heading)] text-4xl md:text-6xl font-black uppercase italic tracking-tight text-white">
              Custom Cursor Lab
            </h1>
            <p className="text-white/60 text-sm max-w-xl mt-1">
              Ultra-smooth lerp physics with direct DOM transforms and 3D Guitar Pick morphing hover state.
            </p>
          </div>

          <Link
            href="/"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Live Telemetry Panel (DOM Direct - Zero Lag!) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">X Coordinate</p>
            <p className="text-2xl font-black text-cyan-400"><span ref={posXRef}>0</span><span className="text-xs text-white/30 ml-1">px</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Y Coordinate</p>
            <p className="text-2xl font-black text-cyan-400"><span ref={posYRef}>0</span><span className="text-xs text-white/30 ml-1">px</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Velocity</p>
            <p className="text-2xl font-black text-purple-400"><span ref={velRef}>0</span><span className="text-xs text-white/30 ml-1">px/f</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Hover State</p>
            <p ref={hoverStateRef} className="text-2xl font-black text-white/40">IDLE</p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="my-8 bg-[#0d0d18] border border-white/10 rounded-2xl p-2 flex flex-wrap gap-2">
          {(["tobias", "magnetic", "neon", "particles", "spotlight"] as CursorPreset[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                preset === p
                  ? "bg-[var(--color-accent)] text-white shadow-[0_0_20px_rgba(133,29,239,0.4)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {p === "tobias" && "🎯 Classic Ring"}
              {p === "magnetic" && "🧲 Magnetic Snap"}
              {p === "neon" && "✨ Neon Aura"}
              {p === "particles" && "🎨 Particle Trail"}
              {p === "spotlight" && "🔍 Spotlight Lens"}
            </button>
          ))}
        </div>

        {/* Test Targets */}
        <div className="space-y-6 my-10">
          <h2 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white">
            Hover & Interactivity Test Targets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target 1 */}
            <div
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              onMouseEnter={() => handleHoverEnter("EXPLORE")}
              className="bg-[#0c0c16] border border-white/10 hover:border-[var(--color-accent)]/50 rounded-3xl p-8 transition-colors cursor-pointer group flex flex-col justify-between min-h-[240px]"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-400">Target #1</span>
                <h3 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white mt-1 group-hover:text-[var(--color-accent)] transition-colors">
                  Guitar Pick Gooey Morph
                </h3>
                <p className="text-xs text-white/50 mt-2">
                  Hover over this card to watch the ring morph smoothly into a glowing 3D Guitar Pick shape.
                </p>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-300">
                <span>Hover for Guitar Pick</span>
                <span>→</span>
              </div>
            </div>

            {/* Target 2 */}
            <div
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              onMouseEnter={() => handleHoverEnter("CLICK")}
              className="bg-[#0c0c16] border border-white/10 hover:border-cyan-500/50 rounded-3xl p-8 transition-colors cursor-pointer group flex flex-col justify-between min-h-[240px]"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Target #2</span>
                <h3 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white mt-1 group-hover:text-cyan-400 transition-colors">
                  Button Click State
                </h3>
                <p className="text-xs text-white/50 mt-2">
                  Click anywhere to test the inner dot click flash response.
                </p>
              </div>

              <button className="mt-6 w-full py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black text-xs uppercase tracking-widest rounded-xl transition-colors">
                Test Click Down
              </button>
            </div>

            {/* Target 3 */}
            <div
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              onMouseEnter={() => handleHoverEnter("SELECT")}
              className="bg-[#0c0c16] border border-white/10 hover:border-amber-500/50 rounded-3xl p-8 transition-colors cursor-pointer group flex flex-col justify-between min-h-[240px]"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Target #3</span>
                <h3 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white mt-1 group-hover:text-amber-400 transition-colors">
                  Guitar Pick Badge
                </h3>
                <p className="text-xs text-white/50 mt-2">
                  Test custom pick label text inside the guitar pick shape.
                </p>
              </div>

              <div className="mt-6 px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-mono text-white/60">
                will-change: transform;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
