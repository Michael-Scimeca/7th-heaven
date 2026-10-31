"use client";

import { useState } from "react";
import Link from "next/link";
import { Music, Play, Pause, Sparkles, ArrowRight } from "lucide-react";

const MEDLEY_SONGS = [
  { title: "Livin' on a Prayer", artist: "Bon Jovi", year: "1986", bpm: 123 },
  { title: "Don't Stop Believin'", artist: "Journey", year: "1981", bpm: 119 },
  { title: "Pour Some Sugar On Me", artist: "Def Leppard", year: "1987", bpm: 85 },
  { title: "Bohemian Rhapsody", artist: "Queen", year: "1975", bpm: 144 },
  { title: "Jump", artist: "Van Halen", year: "1984", bpm: 130 },
  { title: "Renegade", artist: "Styx", year: "1978", bpm: 132 },
  { title: "Here I Go Again", artist: "Whitesnake", year: "1987", bpm: 91 },
  { title: "Keep On Loving You", artist: "REO Speedwagon", year: "1980", bpm: 138 },
  { title: "You Give Love a Bad Name", artist: "Bon Jovi", year: "1986", bpm: 123 },
  { title: "Any Way You Want It", artist: "Journey", year: "1980", bpm: 138 },
  { title: "Separate Ways", artist: "Journey", year: "1983", bpm: 131 },
  { title: "Sweet Child O' Mine", artist: "Guns N' Roses", year: "1987", bpm: 125 },
];

interface VretailMedleySectionProps {
  theme?: "lilac" | "indigo";
}

export default function VretailMedleySection({ theme = "lilac" }: VretailMedleySectionProps) {
  const [activeSongIndex, setActiveSongIndex] = useState(0);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const activeSong = MEDLEY_SONGS[activeSongIndex] || MEDLEY_SONGS[0];
  const isLilac = theme === "lilac";

  return (
    <section
      id="medley"
      aria-labelledby="vretail-medley-heading"
      className="relative z-10 w-full py-16 lg:py-24 overflow-hidden"
    >
      <div className="site-container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Showcase Container */}
        <div
          className={`relative rounded-3xl p-8 lg:p-12 transition-all ${
            isLilac
              ? "bg-white/55 border border-white/60 shadow-[0_20px_60px_rgba(100,50,180,0.08)] backdrop-blur-xl"
              : "bg-gradient-to-br from-[#1b1244] via-[#120b2e] to-[#0a061e] border border-purple-500/30 shadow-[0_0_80px_rgba(147,51,234,0.18)]"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: The 30 in 30 Legend */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <h2
                id="vretail-medley-heading"
                className={`font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight mb-4 ${
                  isLilac ? "text-black" : "text-white"
                }`}
              >
                30 SONGS IN 30 MINUTES
              </h2>

              <p className={`text-base sm:text-lg leading-relaxed mb-6 ${isLilac ? "text-[#2b2456]" : "text-indigo-200/80"}`}>
                The world-famous signature medley that revolutionized Midwest festival rock. 
                30 timeless arena anthems chained into a single, breathless 30-minute thrill ride — 
                no stops, no pauses, 100% live musicianship.
              </p>

              <div className="space-y-3 mb-8 w-full">
                <div className={`flex items-center gap-3 text-sm font-medium ${isLilac ? "text-[#3b3260]" : "text-purple-200/90"}`}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isLilac ? "bg-[#5500ff]/15 text-[#5500ff]" : "bg-purple-500/20 text-purple-300 border border-purple-400/40"
                    }`}
                  >
                    1
                  </div>
                  Seamless key and tempo modulations performed live on guitars and synthesizers
                </div>
                <div className={`flex items-center gap-3 text-sm font-medium ${isLilac ? "text-[#3b3260]" : "text-purple-200/90"}`}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isLilac ? "bg-[#5500ff]/15 text-[#5500ff]" : "bg-purple-500/20 text-purple-300 border border-purple-400/40"
                    }`}
                  >
                    2
                  </div>
                  Certified crowd favorite across 100+ festivals each summer season
                </div>
                <div className={`flex items-center gap-3 text-sm font-medium ${isLilac ? "text-[#3b3260]" : "text-purple-200/90"}`}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isLilac ? "bg-[#5500ff]/15 text-[#5500ff]" : "bg-purple-500/20 text-purple-300 border border-purple-400/40"
                    }`}
                  >
                    3
                  </div>
                  Features the absolute pinnacle hits of the 70s, 80s, and 90s
                </div>
              </div>

              <Link
                href="/video"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${
                  isLilac ? "bg-[#5500ff] hover:bg-[#4800e0] shadow-[#5500ff]/30" : "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30"
                }`}
              >
                WATCH FULL MEDLEY VIDEO
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right Column: Interactive Medley Track Explorer */}
            <div className="lg:col-span-6">
              <div
                className={`rounded-2xl p-6 sm:p-8 backdrop-blur-xl ${
                  isLilac
                    ? "bg-white/90 border border-[#4a2e8c]/15 shadow-md"
                    : "bg-[#0e0824]/90 border border-purple-500/30"
                }`}
              >
                {/* Active Highlight Card */}
                <div
                  className={`p-5 rounded-xl mb-6 flex items-center justify-between border ${
                    isLilac
                      ? "bg-[#5500ff]/10 border-[#5500ff]/25"
                      : "bg-gradient-to-r from-purple-900/50 to-indigo-900/40 border-purple-400/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer ${
                        isLilac ? "bg-black text-white hover:bg-neutral-800" : "bg-white text-neutral-950"
                      }`}
                      aria-label={isPlayingDemo ? "Pause demo" : "Play demo"}
                    >
                      {isPlayingDemo ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div>
                      <div className={`text-xs uppercase tracking-wider font-extrabold ${isLilac ? "text-[#5500ff]" : "text-purple-300/80"}`}>
                        Now Exploring
                      </div>
                      <div className={`font-black text-lg sm:text-xl tracking-tight ${isLilac ? "text-black" : "text-white"}`}>
                        {activeSong.title}
                      </div>
                      <div className={`text-xs font-medium ${isLilac ? "text-[#5e5388]" : "text-indigo-200/70"}`}>
                        {activeSong.artist} • {activeSong.year} • {activeSong.bpm} BPM
                      </div>
                    </div>
                  </div>

                  <div
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                      isLilac
                        ? "bg-white/70 backdrop-blur-sm text-[#5500ff] border border-[#5500ff]/20 shadow-sm"
                        : "bg-black/40 border border-white/10 text-purple-300"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Track #{activeSongIndex + 1} of 30
                  </div>
                </div>

                {/* Tracklist Pills */}
                <div className={`text-xs uppercase font-extrabold tracking-wider mb-3 ${isLilac ? "text-[#4a2e8c]" : "text-purple-300/70"}`}>
                  Click a track to inspect medley transition:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {MEDLEY_SONGS.map((song, idx) => {
                    const isSelected = idx === activeSongIndex;
                    return (
                      <button
                        key={song.title}
                        type="button"
                        onClick={() => setActiveSongIndex(idx)}
                        className={`text-left p-2.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? isLilac
                              ? "bg-[#5500ff] text-white border-[#5500ff] shadow-md"
                              : "bg-purple-600/40 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            : isLilac
                            ? "bg-white/50 backdrop-blur-sm border-white/60 text-[#2b2456] hover:border-[#5500ff]/50 hover:bg-white/80"
                            : "bg-[#18113c]/60 border-purple-500/20 text-indigo-200/70 hover:border-purple-400/40 hover:text-white"
                        }`}
                      >
                        <div className="line-clamp-1 font-black">{song.title}</div>
                        <div className="text-[10px] opacity-75 font-normal">{song.artist}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Simulated Audio Waveform Bar */}
                <div
                  className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold ${
                    isLilac ? "border-purple-200/60 text-[#5e5388]" : "border-purple-500/15 text-indigo-200/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Music className={`w-4 h-4 ${isLilac ? "text-[#5500ff]" : "text-purple-400"}`} />
                    30 Minutes • 0 Sec Pause
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLilac ? "bg-[#5500ff]" : "bg-purple-400"}`} />
                    <p className={isLilac ? "text-[#5500ff]" : "text-purple-300"}>Live Arena Audio Ready</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
