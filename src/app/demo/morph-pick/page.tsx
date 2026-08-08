"use client";

import Link from "next/link";
import { useState } from "react";

export default function MorphPickDemoPage() {
  const [songPlaying, setSongPlaying] = useState(false);

  const toggleSongPlaying = () => {
    const next = !songPlaying;
    setSongPlaying(next);
    window.dispatchEvent(new CustomEvent("cursor:song-playing", { detail: next }));
  };

  return (
    <div className="min-h-screen text-white relative font-sans pt-24 pb-20">
      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-white/10 mb-12">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#9333ea]/20 border border-[#9333ea]/40 text-[#c084fc] inline-block mb-2">
              morph-pick cursor
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight">
              Guitar Pick Cursor Test
            </h1>
            <p className="text-white/50 text-sm max-w-xl mt-2">
              This is the real global cursor from <code className="text-[#c084fc] bg-black/40 px-1.5 py-0.5 rounded">CursorFollower.tsx</code>.
              Hover any purple box below — the trailing dot cursor swaps for the spinning
              guitar-pick badge. Move off it and the dots come back.
            </p>
          </div>
          <Link href="/style-guide#chat" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap">
            ← Style Guide
          </Link>
        </div>

        {/* "Now playing" test — independent of hover, driven by a global window event */}
        <div className="bg-[#0b0b14] border border-[#9333ea]/30 rounded-3xl p-8 mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#9333ea]/20 border border-[#9333ea]/40 text-[#c084fc] inline-block mb-2">
              now playing state
            </span>
            <h3 className="text-xl font-black uppercase italic mt-1">Simulate a song playing</h3>
            <p className="text-xs text-white/50 mt-2 max-w-md">
              Toggle this to mimic a real audio player. While &quot;on&quot;, the cursor
              shrinks into a small spinning pick with a × on it — anywhere on the page,
              no hover required. Move your mouse around after clicking.
            </p>
          </div>
          <button
            onClick={toggleSongPlaying}
            className={`px-6 py-3 rounded-full font-black uppercase text-xs tracking-wider transition-colors whitespace-nowrap ${
              songPlaying
                ? "bg-[#9333ea] text-white hover:bg-[#7e22ce]"
                : "bg-white/5 text-white/70 border border-white/15 hover:bg-white/10"
            }`}
          >
            {songPlaying ? "⏸ Playing — click to stop" : "▶ Simulate play"}
          </button>
        </div>

        {/* Test zones — each opts into the effect via the morph-pick class */}
        <h2 className="text-2xl font-black uppercase italic mb-6">Hover these</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div
            className="morph-pick bg-[#0b0b14] border border-[#9333ea]/30 hover:border-[#9333ea]/70 rounded-3xl p-10 min-h-[180px] flex flex-col justify-center transition-colors"
            data-pick-label="Play Video"
          >
            <span className="text-xs font-black uppercase tracking-wider text-[#c084fc]">Default label</span>
            <h3 className="text-xl font-black uppercase italic mt-1">data-pick-label=&quot;Play Video&quot;</h3>
            <p className="text-xs text-white/50 mt-2">The badge&apos;s marquee text reads whatever you put in this attribute.</p>
          </div>

          <div
            className="morph-pick bg-[#0b0b14] border border-[#9333ea]/30 hover:border-[#9333ea]/70 rounded-3xl p-10 min-h-[180px] flex flex-col justify-center transition-colors"
            data-pick-label="Book Us"
          >
            <span className="text-xs font-black uppercase tracking-wider text-[#c084fc]">Custom label</span>
            <h3 className="text-xl font-black uppercase italic mt-1">data-pick-label=&quot;Book Us&quot;</h3>
            <p className="text-xs text-white/50 mt-2">Any text works — swap it per element to match context.</p>
          </div>

          <div className="morph-pick bg-[#0b0b14] border border-[#9333ea]/30 hover:border-[#9333ea]/70 rounded-3xl p-10 min-h-[180px] flex flex-col justify-center transition-colors">
            <span className="text-xs font-black uppercase tracking-wider text-[#c084fc]">No label attribute</span>
            <h3 className="text-xl font-black uppercase italic mt-1">Falls back to &quot;Play Video&quot;</h3>
            <p className="text-xs text-white/50 mt-2">Just add the class with nothing else — you still get the badge.</p>
          </div>

          <div className="bg-[#0b0b14] border border-white/10 rounded-3xl p-10 min-h-[180px] flex flex-col justify-center">
            <span className="text-xs font-black uppercase tracking-wider text-white/40">Control — no class</span>
            <h3 className="text-xl font-black uppercase italic mt-1 text-white/60">Regular trailing-dot cursor</h3>
            <p className="text-xs text-white/50 mt-2">No <code className="text-white/70">morph-pick</code> class here, so nothing changes on hover.</p>
          </div>
        </div>

        {/* How to use */}
        <div className="bg-[#0b0b14] border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-black uppercase italic mb-4">How to use it anywhere else</h3>
          <pre className="text-white/70 text-xs font-mono bg-black/60 p-4 border border-white/10 rounded-lg overflow-x-auto">{`<div className="morph-pick" data-pick-label="Your Text">
  ...anything...
</div>`}</pre>
          <p className="text-xs text-white/50 mt-4">
            That&apos;s it — no extra imports needed, <code className="text-white/70">CursorFollower</code> is already
            mounted globally in <code className="text-white/70">layout.tsx</code> and watches for the class on every page.
          </p>
        </div>
      </div>
    </div>
  );
}
