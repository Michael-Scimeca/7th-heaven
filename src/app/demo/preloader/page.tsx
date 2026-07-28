"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Preloader from "@/components/Preloader";

const getImageStyle = (idx: number) => {
  // Translate to compensate for off-center artwork in PNG files.
  // The scale(1.14) ensures we enlarge slightly to match the 180px container border.
  switch (idx) {
    case 1:
      return { transform: "translate(11.95px, -13.0px) scale(1.14)" };
    case 2:
      return { transform: "translate(11.3px, -12.9px) scale(1.14)" };
    case 3:
      return { transform: "translate(11.5px, -12.0px) scale(1.14)" };
    case 4:
      return { transform: "translate(11.5px, -12.0px) scale(1.14)" };
    case 5:
      return { transform: "translate(11.5px, -12.0px) scale(1.14)" };
    case 6:
      return { transform: "translate(11.5px, -13.8px) scale(1.14)" };
    default:
      return {};
  }
};

export default function PreloaderDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [manualPercent, setManualPercent] = useState(0);
  const [sessionCleared, setSessionCleared] = useState(false);

  // Shuffled selection representing distinct band imagery/members:
  // Selecting 5 frames out of 6 available, ensuring image 2 (lead singer) is always last
  const [selectedFrames, setSelectedFrames] = useState<number[]>(() => {
    const otherImages = [1, 3, 4, 5, 6];
    const shuffledOthers = [...otherImages].sort(() => Math.random() - 0.5).slice(0, 4);
    return [...shuffledOthers, 2];
  });

  const handleShuffleFrames = () => {
    const otherImages = [1, 3, 4, 5, 6];
    const shuffledOthers = [...otherImages].sort(() => Math.random() - 0.5).slice(0, 4);
    setSelectedFrames([...shuffledOthers, 2]);
  };

  // Clear session cleared toast after 3 seconds
  useEffect(() => {
    if (sessionCleared) {
      const t = setTimeout(() => setSessionCleared(false), 3000);
      return () => clearTimeout(t);
    }
  }, [sessionCleared]);

  const handleResetSession = () => {
    sessionStorage.removeItem("7h_preloader_played");
    setSessionCleared(true);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const getActiveFrame = (pct: number): number => {
    if (selectedFrames.length < 5) return 1;
    if (pct < 20) return selectedFrames[0];
    if (pct < 40) return selectedFrames[1];
    if (pct < 60) return selectedFrames[2];
    if (pct < 80) return selectedFrames[3];
    return selectedFrames[4];
  };

  // Determine current image frame based on manualPercent
  const manualFrameIndex = getActiveFrame(manualPercent);

  // Helper to dynamically calculate active range for each frame in sandbox explorer
  const getFrameRangeStr = (idx: number) => {
    const i = selectedFrames.indexOf(idx);
    if (i === -1) return "N/A (Seq)";
    const start = i * 20;
    const end = i === 4 ? 100 : (i + 1) * 20 - 1;
    return `${start}% – ${end}%`;
  };

  // Details for the 6 frames
  const frames = [
    { idx: 1, desc: "Guitarist 1 (Member A)" },
    { idx: 2, desc: "Singer 1 Alt (Member B)" },
    { idx: 3, desc: "Singer 1 Main (Member B)" },
    { idx: 4, desc: "Guitarist 2 Main (Member C)" },
    { idx: 5, desc: "Guitarist 2 Alt (Member C)" },
    { idx: 6, desc: "Singer 2 Main (Member D)" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-[72px] font-[family-name:var(--font-barlow)]">
      {/* Conditionally render the real full-screen preloader when playing */}
      {isPlaying && (
        <Preloader
          forceShow={true}
          onComplete={() => setIsPlaying(false)}
        />
      )}

      <div className="max-w-[1000px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-purple-400 border border-purple-500/30 px-4 py-1.5 mb-5 bg-purple-950/20">
            Design Sandbox
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 font-[family-name:var(--font-rockstar)] italic uppercase">
            Preloader Sandbox
          </h1>
          <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
            Verify animations, view artwork frames, mock state changes, and test session storage behaviors for the landing preloader.
          </p>
        </div>

        {/* Top Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Section: Live Operations */}
          <div className="p-8 bg-[var(--color-bg-surface)]/90 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Glowing effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-purple-300 mb-2">
                Live Simulator
              </h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Test the preloader overlay exactly as it appears during loading. You can trigger it instantly, or reset the cookie/session storage key to test how a returning visitor experiences layout loads.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black uppercase tracking-widest text-sm transition-all rounded-lg shadow-[0_0_30px_rgba(168,85,247,0.3)] active:scale-[0.99]"
              >
                ⚡ Trigger Preloader Live
              </button>

              <button
                onClick={handleShuffleFrames}
                className="w-full py-3 bg-purple-950/40 border border-purple-500/30 hover:border-purple-500/50 text-purple-200 font-bold uppercase tracking-wider text-xs transition-all rounded-lg active:scale-[0.99] flex items-center justify-center gap-2"
              >
                🔀 Reshuffle Frame Sequence (Current Order: {selectedFrames.join(" → ")})
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleResetSession}
                  className="py-3 border border-white/10 hover:border-white/20 hover:bg-white/[0.02] text-white/80 font-bold uppercase tracking-wider text-xs transition-all rounded-lg active:scale-[0.99]"
                >
                  🧹 Reset Session State
                </button>
                <button
                  onClick={handleReload}
                  className="py-3 border border-white/10 hover:border-white/20 hover:bg-white/[0.02] text-white/80 font-bold uppercase tracking-wider text-xs transition-all rounded-lg active:scale-[0.99]"
                >
                  🔄 Reload & Test Layout
                </button>
              </div>

              {/* Toast Feedback */}
              {sessionCleared && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg text-center animate-pulse">
                  ✓ Session key cleared! Next full page load will show the preloader naturally.
                </div>
              )}
            </div>
          </div>

          {/* Section: Manual Scrubbing / Slider */}
          <div className="p-8 bg-[var(--color-bg-surface)]/90 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-purple-300 mb-2">
                Manual Frame Scrubbing
              </h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Drag the progress slider to inspect the exact artwork rendering and layout calculations at any point from 0% to 100%.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              {/* Mini Preloader Mock */}
              <div
                className="relative w-[180px] h-[180px] rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              >
                <div className="absolute w-[220px] h-[220px] rounded-full bg-gradient-to-tr from-[#d946ef]/10 to-[#7c00ff]/10 blur-xl animate-pulse" />
                
                {/* Images Container */}
                {selectedFrames.map((idx) => (
                  <div
                    key={idx}
                    className="absolute inset-0 transition-opacity duration-200 ease-in-out"
                    style={{ opacity: manualFrameIndex === idx ? 1 : 0 }}
                  >
                    <Image
                      src={`/images/loading-images/${idx}.png`}
                      alt={`Frame ${idx}`}
                      fill
                      priority
                      sizes="180px"
                      className="object-contain"
                      style={getImageStyle(idx)}
                    />
                  </div>
                ))}
              </div>

              {/* Progress HUD */}
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs uppercase tracking-widest text-white/30 font-bold">Progress</span>
                  <span className="text-sm font-[family-name:var(--font-rockstar)] font-black text-purple-400 italic">
                    {manualPercent}% (Frame {manualFrameIndex}/6)
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={manualPercent}
                  onChange={(e) => setManualPercent(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />

                <div className="flex justify-between text-[var(--font-size-3xs)] text-white/20 font-mono">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Artwork Frames Explorer */}
        <div className="p-8 bg-[var(--color-bg-surface)] border border-white/5 rounded-2xl mb-12">
          <h2 className="text-xl font-black uppercase tracking-wider text-white mb-2">
            Artwork Frame Directory
          </h2>
          <p className="text-white/40 text-sm mb-8">
            The preloader selects 5 imagery frames from the directory and cycles through them sequentially across the progress percentage.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {frames.map((f) => {
              const isShuffled = selectedFrames.includes(f.idx);
              return (
                <div
                  key={f.idx}
                  className={`p-3 bg-white/[0.02] border transition-all rounded-lg flex flex-col items-center text-center ${
                    manualFrameIndex === f.idx
                      ? "border-purple-500/50 bg-purple-950/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                      : isShuffled
                      ? "border-purple-500/20 bg-purple-950/5"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="relative w-full aspect-square bg-black mb-3 border border-white/5">
                    <Image
                      src={`/images/loading-images/${f.idx}.png`}
                      alt={`Frame ${f.idx}`}
                      fill
                      sizes="120px"
                      className="object-contain"
                      style={getImageStyle(f.idx)}
                    />
                    {manualFrameIndex === f.idx && (
                      <div className="absolute top-1 right-1 bg-purple-500 text-[var(--font-size-4xs)] font-black uppercase px-1.5 py-0.5 rounded text-white tracking-widest">
                        Active
                      </div>
                    )}
                    {isShuffled && (
                      <div className="absolute top-1 left-1 bg-purple-500/20 border border-purple-500/30 text-[var(--font-size-5xs)] font-bold uppercase px-1 py-0.5 rounded text-purple-300 tracking-wider">
                        In Seq
                      </div>
                    )}
                  </div>
                <span className="text-xs font-bold text-white/90">Frame {f.idx}</span>
                <span className="text-[var(--font-size-3xs)] text-purple-400 font-bold mt-1 font-mono">{getFrameRangeStr(f.idx)}</span>
                <span className="text-[var(--font-size-4xs)] text-white/30 uppercase mt-0.5 tracking-wider">{f.desc}</span>
              </div>
            );
          })}
        </div>
        </div>

        {/* Technical Design Spec */}
        <div className="p-8 bg-[var(--color-bg-surface)] border border-white/5 rounded-2xl mb-12">
          <h2 className="text-xl font-black uppercase tracking-wider text-white mb-6">
            Loading Pipeline Architecture
          </h2>
          
          <div className="space-y-6">
            {[
              {
                phase: "Phase 1: Guaranteed Load (0% – 80%)",
                speed: "20ms step intervals (Minimum duration: 1.6 seconds)",
                desc: "Locks page scroll (`overflow: hidden`) and steps steadily to 80%. This guarantees at least 4 artwork frames render fully, even on instant connection speeds.",
              },
              {
                phase: "Phase 2: Connection Hold & Poll (80%)",
                speed: "Polls window load complete state every 100ms",
                desc: "Holds the loader at exactly 80% if assets are still loading. It polls for the window `load` event to finish before continuing.",
              },
              {
                phase: "Phase 3: Run-Out Sequence (80% – 100%)",
                speed: "20ms step intervals (Takes 400ms total)",
                desc: "Steps from 80% to 100% at the same deliberate premium pace to complete the full 2.0-second preloader experience.",
              },
              {
                phase: "Phase 4: Graceful Exit (100%+ & Fade)",
                speed: "300ms hold, 600ms opacity transition",
                desc: "A brief pause on 100% for readability, followed by a CSS opacity fade-out animation. Unlocks page scroll and unmounts from the DOM tree.",
              },
            ].map((p, idx) => (
              <div key={idx} className="flex gap-4 items-start pb-6 last:pb-0 border-b last:border-0 border-white/5">
                <div className="w-8 h-8 rounded-full bg-purple-950/50 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold font-mono text-sm">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">{p.phase}</h3>
                  <div className="text-[var(--font-size-3xs)] uppercase font-bold text-purple-400/80 tracking-wider mt-0.5">
                    Interval: {p.speed}
                  </div>
                  <p className="text-white/40 text-xs mt-2 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer & Demo Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-white/5">
          <Link
            href="/demo"
            className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors font-bold"
          >
            ← Back to Demos
          </Link>
          
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors font-bold"
          >
            Go to Landing Page →
          </Link>
        </div>
      </div>
    </div>
  );
}
