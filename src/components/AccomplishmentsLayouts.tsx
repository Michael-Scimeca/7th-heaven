/* eslint-disable react-doctor/no-giant-component */
"use client";

import { useState } from "react";

interface AccomplishmentsLayoutsProps {
  accomplishments: string[];
}

const LAYOUTS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `${i + 1}`,
}));

export default function AccomplishmentsLayouts({ accomplishments }: AccomplishmentsLayoutsProps) {
  const [activeLayout, setActiveLayout] = useState<number>(1);

  const stats = [
    { number: "3", label: "Billboard #1 Hits", text: accomplishments[0] || "Three #1 Hit Songs on Billboard", badge: "CHART TOPPER" },
    { number: "7", label: "Major Radio Hits", text: accomplishments[1] || "Seven Major Radio Hit Songs", badge: "AIRPLAY" },
    { number: "5", label: "#1 Billboard CDs", text: accomplishments[2] || "Five CDs reached #1 on Billboard", badge: "ALBUMS" },
    { number: "80K", label: "Soldier Field Crowd", text: accomplishments[3] || "Opened for Bon Jovi & Kid Rock at Soldier Field", badge: "STADIUM SHOW" },
    { number: "80K", label: "Arena Crowd", text: accomplishments[4] || "Opened for Styx to 80,000 people", badge: "LIVE ARENA" },
    { number: "5,000+", label: "Songs Recorded", text: accomplishments[5] || "Written/Recorded over 5,000 songs to date", badge: "DISCOGRAPHY" },
  ];

  return (
    <div className="w-full">
      {/* ── 20-LAYOUT SELECTOR PILLS ── */}
      <div className="flex flex-col items-center mb-12">
        <span className="text-[var(--font-size-2xs)] font-extrabold uppercase tracking-widest  text-[var(--color-accent)] mb-3 block">
          Select Layout Style (1–20)
        </span>
        <div className="flex flex-wrap justify-center gap-1.5 max-w-5xl p-2.5 bg-white/5 border border-white/10 backdrop-blur-xl">
          {LAYOUTS.map((l) => (
            <button aria-label="Action button"
              key={l.id}
              onClick={() => setActiveLayout(l.id)}
              className={`w-9 h-9  text-xs font-black transition-colors cursor-pointer flex items-center justify-center ${activeLayout === l.id
                ? "bg-[var(--color-accent)] text-white shadow-md border border-[var(--color-accent)]/50 scale-110"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/15 border border-transparent"
                }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── LAYOUT 1: HERO FEATURED BENTO ── */}
      {activeLayout === 1 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-8 md:p-10 rounded-3xl bg-[var(--color-surface-raised)] border border-[var(--color-accent)]/30 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col justify-between group hover:border-[var(--color-accent)] transition-colors">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 rounded-full text-[var(--font-size-2xs)] font-black uppercase tracking-widest bg-[var(--color-accent)]/20  text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                {stats[0].badge}
              </span>
              <span className=" text-[var(--color-accent)] text-xl animate-pulse">✦</span>
            </div>
            <div>
              <div className="text-6xl md:text-7xl font-black text-white mb-2">
                {stats[0].number}
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2 uppercase tracking-wide">{stats[0].label}</h3>
              <p className="text-sm  text-[var(--color-accent)]/80 leading-relaxed">{stats[0].text}</p>
            </div>
          </div>

          {Array.from(stats.slice(1), (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl flex flex-col justify-between hover:border-[var(--color-accent)]/20 hover:bg-white/10 transition-colors group"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-3xl font-black  text-[var(--color-accent)] group-hover:scale-110 transition-transform">{s.number}</span>
                <span className="text-[var(--font-size-2xs)] font-mono font-bold text-white/40">0{i + 2}</span>
              </div>
              <div>
                <h4 className="text-[var(--font-size-2xs)] font-bold uppercase tracking-wider  text-[var(--color-accent)] mb-1">{s.label}</h4>
                <p className="text-xs text-white/70 leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 2: CYBER NEON BORDERS ── */}
      {activeLayout === 2 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`relative p-7 rounded-3xl   border border-cyan-500/30 backdrop-blur-xl hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-colors group overflow-hidden ${i === 0 || i === 3 ? "md:col-span-2" : ""
                }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors" />
              <div className="flex justify-between items-center mb-4">
                <span className="text-4xl font-black text-cyan-400">
                  {s.number}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[var(--font-size-4xs)] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {s.badge}
                </span>
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-white mb-2">{s.label}</h4>
              <p className="text-xs text-white/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 3: GOLD VELVET LUXURY ── */}
      {activeLayout === 3 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`p-7 rounded-3xl bg-gradient-to-b from-amber-950/30 via-black to-amber-950/10 border border-purple-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:border-purple-400 hover:shadow-[0_20px_45px_rgba(147, 51, 234,0.25)] transition-colors group ${i === 2 || i === 5 ? "md:col-span-2" : ""
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-5xl font-black text-purple-200">
                  {s.number}
                </span>
                <span className="text-purple-300 text-lg">👑</span>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-purple-100 mb-2">{s.label}</h4>
              <p className="text-xs text-amber-100/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 4: 3D HOLOGRAPHIC ── */}
      {activeLayout === 4 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-7 rounded-3xl bg-[var(--color-surface-raised)] border border-[var(--color-accent)]/20 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:border-[var(--color-accent)]/50 hover:-translate-y-1.5 transition-colors group"
            >
              <div className="w-12 h-12 bg-[var(--color-accent)] p-0.5 mb-6 group-hover:rotate-6 transition-transform">
                <div className="w-full h-full   rounded-[14px] flex items-center justify-center font-black text-white text-lg">
                  {s.number.charAt(0)}
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-2">{s.number}</div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide  text-[var(--color-accent)] mb-2">{s.label}</h4>
              <p className="text-xs text-white/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 5: BALANCED 2x3 GRID ── */}
      {activeLayout === 5 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl hover:border-[var(--color-accent)] hover:bg-white/10 transition-colors group flex flex-col justify-between h-56"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[var(--font-size-2xs)] font-mono font-bold  text-[var(--color-accent)] uppercase tracking-wider">{s.badge}</span>
                  <span className="text-[var(--font-size-2xs)] font-mono text-white/30">0{i + 1}</span>
                </div>
                <div className="text-4xl font-black text-white mb-2 group-hover:scale-105 transition-transform">{s.number}</div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase  text-[var(--color-accent)] mb-1">{s.label}</h4>
                <p className="text-xs text-white/70 line-clamp-2">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 6: APPLE FROSTED MINIMAL ── */}
      {activeLayout === 6 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className={`p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-3xl hover:bg-white/[0.08] transition-colors group ${i === 0 ? "md:col-span-2" : ""
                }`}
            >
              <span className="text-[var(--font-size-2xs)] font-semibold uppercase tracking-widest text-white/40 block mb-4">Achievement 0{i + 1}</span>
              <div className="text-5xl font-black text-white tracking-tight mb-3">{s.number}</div>
              <h4 className="text-sm font-bold text-white mb-2">{s.label}</h4>
              <p className="text-xs text-white/60 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 7: SPOTLIGHT AURA ── */}
      {activeLayout === 7 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative p-8 rounded-3xl   border border-[var(--color-accent)]/20 backdrop-blur-xl hover:border-[var(--color-accent)] shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand)] transition-colors group overflow-hidden"
            >
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-[var(--color-accent)]/15 rounded-full blur-3xl group-hover:bg-[var(--color-accent)]/15 transition-colors" />
              <div className="text-5xl font-black  text-[var(--color-accent)] mb-3">
                {s.number}
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-2">{s.label}</h4>
              <p className="text-xs text-white/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 8: STAT PILLARS ── */}
      {activeLayout === 8 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-6 rounded-3xl bg-gradient-to-b from-white/10 via-white/5 to-transparent border border-white/10 backdrop-blur-xl flex items-center gap-5 hover:border-[var(--color-accent)]/20 transition-colors group"
            >
              <div className="w-16 h-16 shrink-0 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 flex items-center justify-center font-black text-2xl  text-[var(--color-accent)] group-hover:scale-110 transition-transform">
                {s.number}
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-white mb-1">{s.label}</h4>
                <p className="text-xs text-white/70 leading-normal">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 9: SPLIT MOSAIC ── */}
      {activeLayout === 9 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className={`p-7 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl hover:border-[var(--color-accent)]/20 transition-colors group ${i === 0 ? "md:col-span-2 md:row-span-2 justify-between flex flex-col" : i === 3 ? "md:col-span-2" : ""
                }`}
            >
              <div className="text-4xl md:text-5xl font-black  text-[var(--color-accent)] mb-3 group-hover:scale-105 transition-transform">{s.number}</div>
              <div>
                <h4 className="text-xs font-bold uppercase text-white mb-1">{s.label}</h4>
                <p className="text-xs text-white/70 leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 10: STAGE LIGHTING ── */}
      {activeLayout === 10 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative p-8 rounded-3xl   border border-white/10 backdrop-blur-2xl transition-colors group overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-[var(--color-accent)]/40 group-hover:w-full transition-colors duration-500" />
              <div className="text-5xl font-black text-white tracking-tight mb-3 group-hover:scale-110 transition-transform origin-left">
                {s.number}
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest  text-[var(--color-accent)] mb-2">{s.label}</h4>
              <p className="text-xs text-white/80 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 11: HORIZONTAL CAROUSEL PILL ── */}
      {activeLayout === 11 && (
        <div className="max-w-5xl mx-auto overflow-x-auto pb-6 pt-2 flex gap-4 scrollbar-thin scrollbar-thumb-purple-600 select-none">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div key={s.label} className="shrink-0 w-[280px] md:w-[320px] p-7 rounded-3xl bg-[var(--color-surface-raised)] border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-[var(--color-accent)]/50 transition-colors">
              <div>
                <span className="text-[var(--font-size-2xs)] font-mono font-bold uppercase  text-[var(--color-accent)] block mb-3">0{i + 1} / 06</span>
                <div className="text-5xl font-black text-white mb-2">{s.number}</div>
                <h4 className="text-xs font-bold uppercase tracking-wider  text-[var(--color-accent)] mb-4">{s.label}</h4>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 12: NEON WIREFRAME OUTLINE ── */}
      {activeLayout === 12 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="relative p-7   border-2 border-cyan-400/40 hover:border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-colors group">
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-cyan-400 border border-black" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-cyan-400 border border-black" />
              <div className="text-4xl font-mono font-black text-cyan-300 mb-2">{s.number}</div>
              <h4 className="text-xs font-mono font-bold uppercase text-white mb-2">{s.label}</h4>
              <p className="text-xs font-mono text-cyan-100/70">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 13: VERTICAL STACKED BILLBOARD ── */}
      {activeLayout === 13 && (
        <div className="max-w-4xl mx-auto space-y-4">
          {stats.map((s) => (
            <div key={s.label} className="p-6 md:p-8 rounded-3xl bg-[var(--color-surface-raised)] border border-white/8 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[var(--color-accent)]/40 transition-colors group">
              <div className="flex items-center gap-6">
                <span className="text-4xl md:text-5xl font-black  text-[var(--color-accent)] group-hover:scale-110 transition-transform">{s.number}</span>
                <div>
                  <h4 className="text-sm font-extrabold uppercase text-white tracking-wide">{s.label}</h4>
                  <p className="text-xs text-white/70 mt-1">{s.text}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[var(--font-size-2xs)] font-mono font-bold bg-white/5 border border-white/10  text-[var(--color-accent)] uppercase">
                {s.badge}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 14: HEXAGONAL TECH GRID ── */}
      {activeLayout === 14 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div key={s.label} className="p-8 rounded-3xl bg-[var(--color-surface-raised)] border border-white/8 backdrop-blur-2xl hover:border-[var(--color-accent)]/40 transition-colors relative group">
              <span className="text-[var(--font-size-2xs)] font-mono font-bold text-sky-400 block mb-3">[ STAT_0{i + 1} ]</span>
              <div className="text-5xl font-black text-sky-300 mb-2">{s.number}</div>
              <h4 className="text-xs font-bold uppercase text-white mb-2">{s.label}</h4>
              <p className="text-xs  text-[var(--color-accent)]/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 15: DIAMOND CUT GLASS ── */}
      {activeLayout === 15 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((s) => (
            <div key={s.label} className="p-7 rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg   border border-white/10 backdrop-blur-xl transition-colors group">
              <div className="text-4xl font-black  text-[var(--color-accent)] mb-2 group-hover:scale-105 transition-transform">{s.number}</div>
              <h4 className="text-xs font-extrabold uppercase text-white mb-2 tracking-wider">{s.label}</h4>
              <p className="text-xs text-white/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 16: RETRO SYNTHWAVE SUNSET ── */}
      {activeLayout === 16 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((s) => (
            <div key={s.label} className="p-7 rounded-3xl bg-[var(--color-surface-raised)] border border-white/8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-2xl hover:border-[var(--color-accent)]/40 transition-colors group">
              <div className="text-5xl font-black text-pink-400 mb-3">{s.number}</div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-pink-300 mb-2">{s.label}</h4>
              <p className="text-xs text-pink-100/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 17: GLASS ACCORDION STACK ── */}
      {activeLayout === 17 && (
        <div className="max-w-4xl mx-auto space-y-3">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div key={s.label} className="p-6 bg-white/5 border border-white/10 hover:border-[var(--color-accent)]/20 hover:bg-white/10 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <span className="text-3xl font-black  text-[var(--color-accent)] group-hover:scale-110 transition-transform">{s.number}</span>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-white">{s.label}</h4>
                  <p className="text-xs text-white/70 mt-0.5">{s.text}</p>
                </div>
              </div>
              <span className="text-[var(--font-size-2xs)] font-mono font-bold text-white/40 group-hover: text-[var(--color-accent)] transition-colors">✦ 0{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 18: ULTRA-COMPACT BADGE TILES ── */}
      {activeLayout === 18 && (
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="p-6   border border-white/10 hover:border-[var(--color-accent)] backdrop-blur-xl text-center group transition-colors">
              <div className="text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{s.number}</div>
              <h4 className="text-[var(--font-size-2xs)] font-extrabold uppercase  text-[var(--color-accent)] tracking-wider mb-2">{s.label}</h4>
              <p className="text-[var(--font-size-2xs)] text-white/60 leading-snug line-clamp-2">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 19: FLOATING ORBITAL CARDS ── */}
      {activeLayout === 19 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="relative p-8 rounded-3xl bg-[var(--color-surface-raised)] border border-white/8 shadow-[0_20px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl hover:-translate-y-2 hover:border-[var(--color-accent)]/40 transition-colors group">
              <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] mb-6 shadow-[var(--shadow-brand)]" />
              <div className="text-5xl font-black text-white mb-2">{s.number}</div>
              <h4 className="text-xs font-bold uppercase tracking-widest  text-[var(--color-accent)] mb-2">{s.label}</h4>
              <p className="text-xs text-white/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 20: FULL-WIDTH MAGAZINE EDITORIAL ── */}
      {activeLayout === 20 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-3xl hover:border-[var(--color-accent)]/20 hover:bg-white/[0.07] transition-colors group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-6xl font-black tracking-tighter text-white">
                  {s.number}
                </span>
                <span className="text-[var(--font-size-2xs)] font-mono font-bold uppercase tracking-widest text-white/40">[ {s.badge} ]</span>
              </div>
              <h3 className="text-base font-extrabold uppercase text-white mb-2 tracking-wide">{s.label}</h3>
              <p className="text-xs text-white/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
