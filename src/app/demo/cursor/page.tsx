"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

type CursorMode = "magnetic" | "neon" | "particles" | "spotlight" | "dust";

export default function CursorTestingPage() {
  const [mode, setMode] = useState<CursorMode>("magnetic");
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState(0);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number; color: string }>>([]);

  useEffect(() => {
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;

    // Quick setters using GSAP quickTo for silky smooth 120fps motion
    const xDotTo = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" });
    const yDotTo = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" });
    const xRingTo = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power2.out" });
    const yRingTo = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      mouseRef.current.x = x;
      mouseRef.current.y = y;

      setCoords({ x, y });

      xDotTo(x);
      yDotTo(y);
      xRingTo(x);
      yRingTo(y);

      // Add particle on movement for particle mode
      if (mode === "particles" || mode === "dust") {
        const colors = ["#851DEF", "#ec4899", "#3b82f6", "#06b6d4", "#f59e0b"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: Math.random() * 4 + 2,
            alpha: 1,
            color,
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Calculate mouse velocity & animate particles
    let animId: number;
    const updatePhysics = () => {
      const dx = mouseRef.current.x - mouseRef.current.lastX;
      const dy = mouseRef.current.y - mouseRef.current.lastY;
      const vel = Math.sqrt(dx * dx + dy * dy);
      setVelocity(Math.round(vel));
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;

      // Particle Canvas Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particlesRef.current.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.025;
            p.radius *= 0.96;

            if (p.alpha <= 0 || p.radius <= 0.2) {
              particlesRef.current.splice(idx, 1);
              return;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        }
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [mode]);

  // Resize particle canvas
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

  // Magnetic button hover logic
  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    gsap.to(el, {
      x: x * 0.35,
      y: y * 0.35,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.3)",
    });
    setHoverLabel(null);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-purple-500 selection:text-white relative overflow-hidden font-sans pt-24 pb-16 cursor-none">
      {/* Particle Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30"
      />

      {/* Custom GSAP Smooth Pointer Dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 rounded-full transition-colors duration-200 ${
          mode === "neon"
            ? "w-4 h-4 bg-cyan-400 shadow-[0_0_20px_#06b6d4,0_0_40px_#851DEF]"
            : mode === "dust"
            ? "w-3 h-3 bg-amber-400 shadow-[0_0_15px_#f59e0b]"
            : "w-3 h-3 bg-[var(--color-accent)]"
        } ${hoverLabel ? "scale-150" : "scale-100"}`}
      />

      {/* Custom GSAP Lagging Pointer Ring */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 rounded-full border transition-all duration-300 flex items-center justify-center ${
          mode === "spotlight"
            ? "w-40 h-40 border-white/40 bg-white/5 backdrop-invert backdrop-blur-[2px]"
            : mode === "neon"
            ? "w-16 h-16 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            : mode === "dust"
            ? "w-14 h-14 border-amber-500/40 bg-amber-500/5"
            : "w-12 h-12 border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10"
        } ${hoverLabel ? "scale-150 border-purple-400 bg-purple-500/20" : "scale-100"}`}
      >
        {hoverLabel && (
          <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 animate-pulse">
            {hoverLabel}
          </span>
        )}
      </div>

      <div className="site-container relative z-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-2xs font-black uppercase tracking-widest bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)]">
                ⚡ GSAP Physics Playground
              </span>
              <span className="text-xs text-white/40">120 FPS Motion Engine</span>
            </div>
            <h1 className="font-[var(--font-heading)] text-4xl md:text-6xl font-black uppercase italic tracking-tight text-white">
              Smooth Cursor Lab
            </h1>
            <p className="text-white/60 text-sm max-w-xl mt-1">
              Test fluid cursor physics, magnetic snapping, particle trails, and reactive hover states built with GSAP quickTo.
            </p>
          </div>

          <Link
            href="/"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Live Metrics Telemetry Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">X Position</p>
            <p className="text-2xl font-black text-cyan-400">{coords.x}<span className="text-xs text-white/30 ml-1">px</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Y Position</p>
            <p className="text-2xl font-black text-cyan-400">{coords.y}<span className="text-xs text-white/30 ml-1">px</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Cursor Velocity</p>
            <p className="text-2xl font-black text-purple-400">{velocity}<span className="text-xs text-white/30 ml-1">px/f</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Active Particles</p>
            <p className="text-2xl font-black text-amber-400">{particlesRef.current.length}</p>
          </div>
        </div>

        {/* Cursor Mode Selector Tabs */}
        <div className="my-10 bg-[#0d0d18] border border-white/10 rounded-2xl p-2 flex flex-wrap gap-2">
          {(["magnetic", "neon", "particles", "spotlight", "dust"] as CursorMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                mode === m
                  ? "bg-[var(--color-accent)] text-white shadow-[0_0_20px_rgba(133,29,239,0.4)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {m === "magnetic" && "🧲 Magnetic Ring"}
              {m === "neon" && "✨ Neon Aura"}
              {m === "particles" && "🎨 Particle Stream"}
              {m === "spotlight" && "🔍 Spotlight Lens"}
              {m === "dust" && "✨ Dust Overlay"}
            </button>
          ))}
        </div>

        {/* Interactive Testing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          {/* Card 1: Magnetic Target */}
          <div className="bg-[#0c0c16] border border-white/10 rounded-3xl p-8 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/25 transition-all" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-purple-400">Physics Module</span>
              <h3 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white mt-1">
                Magnetic Attraction
              </h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                Move your cursor near the button below to feel the magnetic pull effect.
              </p>
            </div>

            <button
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              onMouseEnter={() => setHoverLabel("PULL")}
              className="mt-6 w-full py-4 bg-[var(--color-accent)] hover:bg-[#9d3cff] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(133,29,239,0.3)] transition-colors cursor-pointer"
            >
              Hover Magnetic Button
            </button>
          </div>

          {/* Card 2: Interactive State Trigger */}
          <div className="bg-[#0c0c16] border border-white/10 rounded-3xl p-8 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl group-hover:bg-cyan-600/25 transition-all" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Custom Labels</span>
              <h3 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white mt-1">
                Hover Label Trigger
              </h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                Hovering over interactive elements updates the cursor label dynamically.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                onMouseEnter={() => setHoverLabel("PLAY")}
                className="py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                ▶ PLAY
              </button>
              <button
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                onMouseEnter={() => setHoverLabel("VIEW")}
                className="py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                👁 VIEW
              </button>
            </div>
          </div>

          {/* Card 3: Drag & Drop Physics Card */}
          <div
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            onMouseEnter={() => setHoverLabel("DRAG")}
            className="bg-[#0c0c16] border border-white/10 rounded-3xl p-8 flex flex-col justify-between min-h-[260px] relative overflow-hidden cursor-pointer group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl group-hover:bg-amber-600/25 transition-all" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">Card Inertia</span>
              <h3 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white mt-1">
                Magnetic Card Tilt
              </h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                This entire card features 3D magnetic spring damping when you hover over it.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl">
              <span className="text-xs font-bold text-amber-400">Status: Active</span>
              <span className="text-xs text-white/40">Hover Me</span>
            </div>
          </div>
        </div>

        {/* Feature Explainer Banner */}
        <div className="bg-gradient-to-r from-purple-950/40 via-[#0d0d18] to-cyan-950/40 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white">
              Silky Smooth Performance Tech
            </h3>
            <p className="text-xs text-white/50 max-w-xl">
              Uses GSAP <code className="text-purple-400 bg-black/40 px-1.5 py-0.5 rounded">quickTo</code> transform setters instead of React state re-renders for 0ms input lag and smooth high-refresh-rate display response.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMode(mode === "neon" ? "magnetic" : "neon")}
              className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[#9d3cff] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] cursor-pointer"
            >
              Toggle Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
