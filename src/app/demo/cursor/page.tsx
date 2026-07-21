"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

type CursorPreset = "tobias" | "magnetic" | "neon" | "particles" | "spotlight";

export default function CursorTestingPage() {
  const [preset, setPreset] = useState<CursorPreset>("tobias");
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);
  const [isClicked, setIsClicked] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number; color: string }>>([]);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    // Quick setters using GSAP quickTo for 120fps motion
    const xDotTo = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const yDotTo = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const xRingTo = gsap.quickTo(ring, "x", { duration: 0.28, ease: "power2.out" });
    const yRingTo = gsap.quickTo(ring, "y", { duration: 0.28, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      mouseRef.current.x = x;
      mouseRef.current.y = y;

      setCoords({ x, y });

      xDotTo(x);
      yDotTo(y);
      xRingTo(x);
      yRingTo(y);

      // Particle generator for particles mode
      if (preset === "particles") {
        const colors = ["#851DEF", "#ec4899", "#3b82f6", "#06b6d4", "#f59e0b"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2.5,
            vy: (Math.random() - 0.5) * 2.5,
            radius: Math.random() * 4 + 2,
            alpha: 1,
            color,
          });
        }
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Physics loop for velocity and particle rendering
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

    gsap.to(el, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    });
    setIsHovered(false);
    setHoverText(null);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-[var(--color-accent)] selection:text-white relative overflow-hidden font-sans pt-24 pb-20 cursor-none">
      {/* Particle Canvas Layer */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30" />

      {/* ─── TOBIAS BOGLIOLO CODEPEN (pLzwzE) MATCHED CURSOR ELEMENTS ─── */}
      {/* Primary Dot (.cursor) */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 rounded-full transition-all duration-200 ${
          preset === "tobias"
            ? isHovered
              ? "w-4 h-4 bg-[var(--color-accent)] shadow-[0_0_15px_rgba(133,29,239,0.8)]"
              : isClicked
              ? "w-2 h-2 bg-white scale-75"
              : "w-2.5 h-2.5 bg-white"
            : preset === "neon"
            ? "w-4 h-4 bg-cyan-400 shadow-[0_0_20px_#06b6d4,0_0_40px_#851DEF]"
            : "w-3 h-3 bg-[var(--color-accent)]"
        }`}
      />

      {/* Secondary Lagging Outer Ring (.cursor2) - Morphs to Guitar Pick when gooey/hovered */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 transition-all duration-300 flex items-center justify-center ${
          isHovered
            ? "w-20 h-24 scale-110 drop-shadow-[0_0_25px_rgba(133,29,239,0.8)]"
            : preset === "spotlight"
            ? "w-44 h-44 rounded-full border-white/30 bg-white/5 backdrop-invert backdrop-blur-[2px]"
            : preset === "neon"
            ? "w-20 h-20 rounded-full border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.4)]"
            : isClicked
            ? "w-8 h-8 rounded-full border-white/60 bg-white/10"
            : "w-10 h-10 rounded-full border-2 border-white/40 bg-transparent"
        }`}
      >
        {isHovered ? (
          <div className="relative w-full h-full flex items-center justify-center animate-bounce duration-1000">
            <svg
              viewBox="0 0 100 115"
              className="absolute inset-0 w-full h-full fill-[var(--color-accent)]/25 stroke-[var(--color-accent)] stroke-[3] filter drop-shadow-[0_0_12px_rgba(133,29,239,0.9)]"
            >
              <path d="M 50,8 C 78,8 95,25 90,52 C 80,80 50,108 50,108 C 50,108 20,80 10,52 C 5,25 22,8 50,8 Z" />
            </svg>
            <span className="relative z-10 text-[9px] font-black uppercase tracking-widest text-purple-200 select-none pb-2 text-center leading-tight">
              {hoverText || "7H PICK"}
            </span>
          </div>
        ) : (
          hoverText && (
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 animate-pulse select-none">
              {hoverText}
            </span>
          )
        )}
      </div>

      <div className="site-container relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-2xs font-black uppercase tracking-widest bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)]">
                ⚡ CodePen Matched (pLzwzE)
              </span>
              <span className="text-xs text-white/40">Tobias Bogliolo Concept</span>
            </div>
            <h1 className="font-[var(--font-heading)] text-4xl md:text-6xl font-black uppercase italic tracking-tight text-white">
              Custom Cursor Lab
            </h1>
            <p className="text-white/60 text-sm max-w-xl mt-1">
              Recreated matching Tobias Bogliolo&apos;s pen <code className="text-purple-400 bg-black/40 px-1.5 py-0.5 rounded">pLzwzE</code> with zero-lag GSAP physics and click-through safety.
            </p>
          </div>

          <Link
            href="/"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Live Telemetry Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">X Coordinate</p>
            <p className="text-2xl font-black text-cyan-400">{coords.x}<span className="text-xs text-white/30 ml-1">px</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Y Coordinate</p>
            <p className="text-2xl font-black text-cyan-400">{coords.y}<span className="text-xs text-white/30 ml-1">px</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Velocity</p>
            <p className="text-2xl font-black text-purple-400">{velocity}<span className="text-xs text-white/30 ml-1">px/f</span></p>
          </div>
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Hover State</p>
            <p className={`text-2xl font-black ${isHovered ? "text-emerald-400" : "text-white/40"}`}>
              {isHovered ? "HOVERING" : "IDLE"}
            </p>
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
              {p === "tobias" && "🎯 Tobias (pLzwzE)"}
              {p === "magnetic" && "🧲 Magnetic Snap"}
              {p === "neon" && "✨ Neon Aura"}
              {p === "particles" && "🎨 Particle Trail"}
              {p === "spotlight" && "🔍 Spotlight Lens"}
            </button>
          ))}
        </div>

        {/* CodePen pLzwzE Test Targets */}
        <div className="space-y-6 my-10">
          <h2 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white">
            Hover & Interactivity Test Targets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target 1: CodePen Style Link */}
            <div
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              onMouseEnter={() => { setIsHovered(true); setHoverText("EXPLORE"); }}
              className="bg-[#0c0c16] border border-white/10 hover:border-[var(--color-accent)]/50 rounded-3xl p-8 transition-all cursor-pointer group flex flex-col justify-between min-h-[240px]"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-400">Target #1</span>
                <h3 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white mt-1 group-hover:text-[var(--color-accent)] transition-colors">
                  Interactive Link Target
                </h3>
                <p className="text-xs text-white/50 mt-2">
                  Hover over this card to trigger the CodePen <code className="text-purple-300">.cursor.hover</code> scale and border expansion.
                </p>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-300">
                <span>Hover to Expand</span>
                <span>→</span>
              </div>
            </div>

            {/* Target 2: Button Target */}
            <div
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              onMouseEnter={() => { setIsHovered(true); setHoverText("CLICK"); }}
              className="bg-[#0c0c16] border border-white/10 hover:border-cyan-500/50 rounded-3xl p-8 transition-all cursor-pointer group flex flex-col justify-between min-h-[240px]"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Target #2</span>
                <h3 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white mt-1 group-hover:text-cyan-400 transition-colors">
                  Button Click State
                </h3>
                <p className="text-xs text-white/50 mt-2">
                  Click down anywhere to test the inner dot click flash animation.
                </p>
              </div>

              <button className="mt-6 w-full py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                Test Click Down
              </button>
            </div>

            {/* Target 3: Text Selection Target */}
            <div
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              onMouseEnter={() => { setIsHovered(true); setHoverText("SELECT"); }}
              className="bg-[#0c0c16] border border-white/10 hover:border-amber-500/50 rounded-3xl p-8 transition-all cursor-pointer group flex flex-col justify-between min-h-[240px]"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Target #3</span>
                <h3 className="font-[var(--font-heading)] text-2xl font-black uppercase italic text-white mt-1 group-hover:text-amber-400 transition-colors">
                  Text Lens Target
                </h3>
                <p className="text-xs text-white/50 mt-2">
                  Test magnetic centering and custom text badge inside the outer ring.
                </p>
              </div>

              <div className="mt-6 px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-mono text-white/60">
                pointer-events: none;
              </div>
            </div>
          </div>
        </div>

        {/* Code Comparison Card */}
        <div className="bg-[#0b0b14] border border-white/10 rounded-3xl p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-[var(--font-heading)] text-xl font-black uppercase italic text-white">
              Code Structure Comparison
            </h3>
            <span className="text-xs text-emerald-400 font-bold">✓ Modernized for Next.js</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-black/60 p-4 rounded-xl border border-white/10">
              <p className="text-purple-400 font-bold mb-2">// Original CodePen CSS (pLzwzE)</p>
              <pre className="text-white/60 whitespace-pre-wrap">{`.cursor {
  position: fixed; width: 8px; height: 8px;
  background: #fff; border-radius: 50%;
  transform: translate(-50%, -50%);
}
.cursor2 {
  position: fixed; width: 40px; height: 40px;
  border: 2px solid rgba(255,255,255,0.4);
}`}</pre>
            </div>

            <div className="bg-black/60 p-4 rounded-xl border border-white/10">
              <p className="text-cyan-400 font-bold mb-2">// Optimized GSAP Implementation</p>
              <pre className="text-white/60 whitespace-pre-wrap">{`const xDotTo = gsap.quickTo(dot, "x", { duration: 0.08 });
const yDotTo = gsap.quickTo(dot, "y", { duration: 0.08 });
const xRingTo = gsap.quickTo(ring, "x", { duration: 0.28 });
const yRingTo = gsap.quickTo(ring, "y", { duration: 0.28 });`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
