/* eslint-disable react-doctor/no-giant-component, react-doctor/no-high-complexity-react-function */
"use client";

import { useState } from "react";

interface AccomplishmentsLayoutsProps {
  accomplishments: string[];
}

const LAYOUTS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `${i + 1}`,
}));

export default function AccomplishmentsLayouts({
  accomplishments,
}: AccomplishmentsLayoutsProps) {
  const [activeLayout, setActiveLayout] = useState<number>(1);

  const stats = [
    {
      number: "3",
      label: "Billboard #1 Hits",
      text: accomplishments[0] || "Three #1 Hit Songs on Billboard",
      badge: "CHART TOPPER",
    },
    {
      number: "7",
      label: "Major Radio Hits",
      text: accomplishments[1] || "Seven Major Radio Hit Songs",
      badge: "AIRPLAY",
    },
    {
      number: "5",
      label: "#1 Billboard CDs",
      text: accomplishments[2] || "Five CDs reached #1 on Billboard",
      badge: "ALBUMS",
    },
    {
      number: "80K",
      label: "Soldier Field Crowd",
      text:
        accomplishments[3] || "Opened for Bon Jovi & Kid Rock at Soldier Field",
      badge: "STADIUM SHOW",
    },
    {
      number: "80K",
      label: "Arena Crowd",
      text: accomplishments[4] || "Opened for Styx to 80,000 people",
      badge: "LIVE ARENA",
    },
    {
      number: "5,000+",
      label: "Songs Recorded",
      text: accomplishments[5] || "Written/Recorded over 5,000 songs to date",
      badge: "DISCOGRAPHY",
    },
  ];

  return (
    <div className="w-full">
      {/* ── 20-LAYOUT SELECTOR PILLS ── */}
      <div className="mb-12 flex flex-col items-center">
        <span className="mb-3 block text-[var(--font-size-2xs)]">
          Select Layout Style (1–20)
        </span>
        <div className="flex max-w-5xl flex-wrap justify-center gap-1.5 border border-white/10 bg-[#00000029] p-2.5 backdrop-blur-xl">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLayout(l.id)}
              className={`flex h-11 w-11 cursor-pointer items-center justify-center ${activeLayout === l.id ? "scale-110 border border-[var(--color-accent)]/50 bg-[var(--color-accent)]" : "border border-transparent bg-[#00000029] hover:bg-white/15 hover:text-white"}`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── LAYOUT 1: HERO FEATURED BENTO ── */}
      {activeLayout === 1 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          <div className="shadow-[0_20px_50px_rgba(0,0,0,0.4)]backdrop-blur-xl group flex flex-col justify-between rounded-lg border border-white/10 bg-[var(--color-surface-raised)] p-8 hover:border-[var(--color-accent)] md:col-span-2 md:p-10">
            <div className="mb-6 flex items-start justify-between">
              <span className="rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/20 px-3 py-1 text-[var(--font-size-2xs)]">
                {stats[0].badge}
              </span>
              <span className="animate-pulse text-xl text-[var(--color-accent)]">
                ✦
              </span>
            </div>
            <div>
              <div className="mb-2 text-6xl md:text-7xl">{stats[0].number}</div>
              <h3 className="mb-2">{stats[0].label}</h3>
              <p className="text-[var(--color-accent)]/80">{stats[0].text}</p>
            </div>
          </div>

          {Array.from(stats.slice(1), (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className="border-white/10backdrop-blur-xl group flex flex-col justify-between rounded-lg border bg-[#00000029] p-6 hover:border-[var(--color-accent)]/20 hover:bg-white/10"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-3xl text-[var(--color-accent)]">
                  {s.number}
                </span>
                <span className="text-[var(--font-size-2xs)] text-white/40">
                  0{i + 2}
                </span>
              </div>
              <div>
                <h4 className="mb-1">{s.label}</h4>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 2: CYBER NEON BORDERS ── */}
      {activeLayout === 2 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`group relative overflow-hidden rounded-lg border border-purple-500/30 p-7 backdrop-blur-xl hover:border-purple-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] ${i === 0 || i === 3 ? "md:col-span-2" : ""}`}
            >
              <div className="absolute top-0 right-0 h-24 w-24 rounded-lg blur-2xl group-hover:bg-cyan-500/20" />
              <div className="mb-6 flex items-center justify-between">
                <span className="text-4xl">{s.number}</span>
                <span className="text-purple-400border rounded border-purple-500/30 px-2.5 py-0.5">
                  {s.badge}
                </span>
              </div>
              <h4 className="mb-2">{s.label}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 3: GOLD VELVET LUXURY ── */}
      {activeLayout === 3 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`hover:shadow-[0_20px_45px_rgba(147, 51, 234,0.25)] group rounded-lg border border-purple-500/30 bg-gradient-to-b from-amber-950/30 via-black to-amber-950/10 p-7 shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:border-purple-400 ${i === 2 || i === 5 ? "md:col-span-2" : ""}`}
            >
              <div className="mb-6 flex items-start justify-between">
                <span className="text-5xl text-purple-200">{s.number}</span>
                <span>👑</span>
              </div>
              <h4 className="mb-2 text-purple-100">{s.label}</h4>
              <p className="text-amber-100/70">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 4: 3D HOLOGRAPHIC ── */}
      {activeLayout === 4 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="border-[var(--color-accent)]/20backdrop-blur-xl group rounded-lg border bg-[var(--color-surface-raised)] p-7 shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 hover:border-[var(--color-accent)]/50"
            >
              <div className="mb-6 h-12 w-12 bg-[var(--color-accent)] p-0.5 group-hover:rotate-6">
                <div className="flex h-full w-full items-center justify-center rounded-[14px]">
                  {s.number.charAt(0)}
                </div>
              </div>
              <div className="mb-2 text-3xl">{s.number}</div>
              <h4 className="mb-2">{s.label}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 5: BALANCED 2x3 GRID ── */}
      {activeLayout === 5 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className="border-white/10backdrop-blur-xl group flex h-56 flex-col justify-between rounded-lg border bg-[#00000029] p-8 hover:border-[var(--color-accent)] hover:bg-white/10"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="r text-[var(--font-size-2xs)]">
                    {s.badge}
                  </span>
                  <span className="text-[var(--font-size-2xs)] text-white/30">
                    0{i + 1}
                  </span>
                </div>
                <div className="mb-2 text-4xl">{s.number}</div>
              </div>
              <div>
                <h4 className="mb-1">{s.label}</h4>
                <p className="line-clamp-2">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 6: APPLE FROSTED MINIMAL ── */}
      {activeLayout === 6 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className="group rounded-lg border border-white/10 bg-white/[0.04] p-8 backdrop-blur-3xl hover:bg-white/[0.08] first:md:col-span-2"
            >
              <span className="mb-6 block text-[var(--font-size-2xs)] text-white/40">
                Achievement 0{i + 1}
              </span>
              <div className="mb-3 text-5xl">{s.number}</div>
              <h4 className="mb-2">{s.label}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 7: SPOTLIGHT AURA ── */}
      {activeLayout === 7 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-lg border border-[var(--color-accent)]/20 p-8 shadow-[var(--shadow-brand)] backdrop-blur-xl hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-brand)]"
            >
              <div className="absolute -top-12 -left-12 h-32 w-32 rounded-lg bg-[var(--color-accent)]/15 blur-3xl group-hover:bg-[var(--color-accent)]/15" />
              <div className="mb-3 text-5xl">{s.number}</div>
              <h4 className="mb-2">{s.label}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 8: STAT PILLARS ── */}
      {activeLayout === 8 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group flex items-center gap-5 rounded-lg border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent p-6 backdrop-blur-xl hover:border-[var(--color-accent)]/20"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/20 text-2xl text-[var(--color-accent)]">
                {s.number}
              </div>
              <div>
                <h4 className="mb-1">{s.label}</h4>
                <p className="leading-normal">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 9: SPLIT MOSAIC ── */}
      {activeLayout === 9 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className="border-white/10 backdrop-blur-xl group rounded-lg border bg-[#00000029] p-7 hover:border-[var(--color-accent)]/20 first:flex first:flex-col first:justify-between first:md:col-span-2 first:md:row-span-2 nth-[4]:md:col-span-2"
            >
              <div className="mb-3 text-4xl md:text-5xl">{s.number}</div>
              <div>
                <h4 className="mb-1">{s.label}</h4>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 10: STAGE LIGHTING ── */}
      {activeLayout === 10 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="border-white/10backdrop-blur-xl group relative overflow-hidden rounded-lg border p-8"
            >
              <div className="absolute top-0 left-1/2 h-px w-40 -translate-x-1/2 bg-[var(--color-accent)]/40 group-hover:w-full" />
              <div className="mb-3 origin-left text-5xl">{s.number}</div>
              <h4 className="mb-2">{s.label}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 11: HORIZONTAL CAROUSEL PILL ── */}
      {activeLayout === 11 && (
        <div className="mx-auto flex max-w-5xl scrollbar-thin scrollbar-thumb-purple-600 gap-4 overflow-x-auto pt-2 pb-6 select-none">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className="flex w-[280px] shrink-0 flex-col justify-between rounded-lg border border-white/10 bg-[var(--color-surface-raised)] p-7 backdrop-blur-xl hover:border-[var(--color-accent)]/50 md:w-[320px]"
            >
              <div>
                <span className="mb-3 block text-[var(--font-size-2xs)]">
                  0{i + 1} / 06
                </span>
                <div className="mb-2 text-5xl">{s.number}</div>
                <h4 className="mb-6">{s.label}</h4>
              </div>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 12: NEON WIREFRAME OUTLINE ── */}
      {activeLayout === 12 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group relative border-2 border-purple-400/40 p-7 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:border-purple-300"
            >
              <div className="absolute -top-1.5 -left-1.5 h-3 w-3 border border-black bg-cyan-400" />
              <div className="absolute -right-1.5 -bottom-1.5 h-3 w-3 border border-black bg-cyan-400" />
              <div className="mb-2 text-4xl">{s.number}</div>
              <h4 className="mb-2">{s.label}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 13: VERTICAL STACKED BILLBOARD ── */}
      {activeLayout === 13 && (
        <div className="mx-auto max-w-4xl space-y-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group flex flex-col items-start justify-between gap-4 rounded-lg border border-white/8 bg-[var(--color-surface-raised)] p-6 backdrop-blur-xl hover:border-[var(--color-accent)]/40 md:flex-row md:items-center md:p-8"
            >
              <div className="flex items-center gap-6">
                <span className="text-4xl md:text-5xl">{s.number}</span>
                <div>
                  <h4>{s.label}</h4>
                  <p>{s.text}</p>
                </div>
              </div>
              <span className="rounded-lg border border-white/10 bg-[#00000029] px-3 py-1 text-[var(--font-size-2xs)]">
                {s.badge}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 14: HEXAGONAL TECH GRID ── */}
      {activeLayout === 14 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className="border-white/8backdrop-blur-xl group relative rounded-lg border bg-[var(--color-surface-raised)] p-8 hover:border-[var(--color-accent)]/40"
            >
              <span className="mb-3 block text-[var(--font-size-2xs)] text-sky-400">
                [ STAT_0{i + 1} ]
              </span>
              <div className="mb-2 text-5xl text-sky-300">{s.number}</div>
              <h4 className="mb-2">{s.label}</h4>
              <p className="text-[var(--color-accent)]/70">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 15: DIAMOND CUT GLASS ── */}
      {activeLayout === 15 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group rounded-tl-3xl rounded-tr-lg rounded-br-3xl rounded-bl-lg border border-white/10 p-7 backdrop-blur-xl"
            >
              <div className="mb-2 text-4xl">{s.number}</div>
              <h4 className="r mb-2">{s.label}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 16: RETRO SYNTHWAVE SUNSET ── */}
      {activeLayout === 16 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="shadow-[0_10px_30px_rgba(0,0,0,0.3)]backdrop-blur-xl group rounded-lg border border-white/8 bg-[var(--color-surface-raised)] p-7 hover:border-[var(--color-accent)]/40"
            >
              <div className="mb-3 text-5xl text-pink-400">{s.number}</div>
              <h4 className="mb-2 text-pink-300">{s.label}</h4>
              <p className="text-pink-100/70">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 17: GLASS ACCORDION STACK ── */}
      {activeLayout === 17 && (
        <div className="mx-auto max-w-4xl space-y-3">
          {Array.from(stats, (s, i) => ({ s, i })).map(({ s, i }) => (
            <div
              key={s.label}
              className="group flex items-center justify-between border border-white/10 bg-[#00000029] p-6 hover:border-[var(--color-accent)]/20 hover:bg-white/10"
            >
              <div className="flex items-center gap-6">
                <span className="text-3xl text-[var(--color-accent)]">
                  {s.number}
                </span>
                <div>
                  <h4>{s.label}</h4>
                  <p className="mt-0.5">{s.text}</p>
                </div>
              </div>
              <span className="group- text-[var(--font-size-2xs)] text-white/40">
                ✦ 0{i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 18: ULTRA-COMPACT BADGE TILES ── */}
      {activeLayout === 18 && (
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group border border-white/10 p-6 text-center backdrop-blur-xl hover:border-[var(--color-accent)]"
            >
              <div className="mb-1 text-4xl">{s.number}</div>
              <h4 className="mb-2">{s.label}</h4>
              <p className="line-clamp-2">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 19: FLOATING ORBITAL CARDS ── */}
      {activeLayout === 19 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="shadow-[0_20px_40px_rgba(0,0,0,0.9)]backdrop-blur-xl group relative rounded-lg border border-white/8 bg-[var(--color-surface-raised)] p-8 hover:-translate-y-2 hover:border-[var(--color-accent)]/40"
            >
              <div className="mb-6 h-3 w-3 rounded-lg bg-[var(--color-accent)] shadow-[var(--shadow-brand)]" />
              <div className="mb-2 text-5xl">{s.number}</div>
              <h4 className="mb-2">{s.label}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 20: FULL-WIDTH MAGAZINE EDITORIAL ── */}
      {activeLayout === 20 && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group rounded-lg border border-white/10 bg-white/[0.03] p-8 backdrop-blur-3xl hover:border-[var(--color-accent)]/20 hover:bg-white/[0.07]"
            >
              <div className="mb-6 flex items-start justify-between">
                <span className="er text-6xl">{s.number}</span>
                <span className="text-[var(--font-size-2xs)] text-white/40">
                  [ {s.badge} ]
                </span>
              </div>
              <h3 className="mb-2">{s.label}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
