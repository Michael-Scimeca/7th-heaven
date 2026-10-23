"use client";

/**
 * /guidelines-layouts — 10 layout options for the contact page's
 * "Booking & Department Guidelines" section (ContactClient.tsx #contact-guide).
 * Same copy, icons and colour tokens as the live section; pick one and it
 * gets swapped into ContactClient.tsx.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Calendar, Radio, Sliders, Compass, ArrowUpRight, ArrowRight, Plus, Search, Check, ChevronLeft, type LucideIcon } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

type Guide = {
  icon: LucideIcon;
  title: string;
  short: string;
  body: string;
  dept: string;
  audience: string; // who this is for (self-identification label)
  question: string; // the question this department answers, in the visitor's words
  tags: string[]; // scannable keywords pulled from the copy
  cta: string; // action label
};

const GUIDES: Guide[] = [
  {
    icon: Calendar,
    title: "Concert & Event Booking",
    short: "Festivals, fairs, casinos, galas & private parties",
    body: "Looking to bring 7th Heaven to your summer festival, county fair, casino ballroom, corporate gala, or private party? With over 100 high-energy concerts annually, our management team provides full tour riders, staging specs, and marketing collateral.",
    dept: "NTD Management",
    audience: "Festival & event buyers",
    question: "How do I book 7th Heaven for my event?",
    tags: ["Festivals & fairs", "Casino ballrooms", "Corporate galas", "Private parties", "Tour riders", "Marketing collateral"],
    cta: "Start a booking inquiry",
  },
  {
    icon: Radio,
    title: "Press & Media Relations",
    short: "Radio, TV, podcasts, press photos & features",
    body: "For radio and television appearances, podcast interviews, press credentials, high-resolution band photos, and feature stories, reach out directly to our public relations and record label team at NTD Records.",
    dept: "NTD Records",
    audience: "Media & press",
    question: "How do I set up an interview or get press photos?",
    tags: ["Radio & TV", "Podcasts", "Press credentials", "Hi-res photos", "Feature stories"],
    cta: "Contact the press team",
  },
  {
    icon: Sliders,
    title: "Technical Advance & Production",
    short: "Riders, stage plots, patch lists, lighting & power",
    body: "Venue production managers, audio engineers, and stage leads can coordinate technical riders, stage plots, patch lists, lighting requirements, and power specifications directly with our touring production crew.",
    dept: "Tour Technical Advance",
    audience: "Venue production crews",
    question: "How do I advance the technical side of a show?",
    tags: ["Technical riders", "Stage plots", "Patch lists", "Lighting", "Power specs"],
    cta: "Send a technical advance",
  },
  {
    icon: Compass,
    title: "Annual Music Cruise Inquiries",
    short: "Cabins, VIP passes, group rates & travel",
    body: "Planning to sail with 7th Heaven on our annual Caribbean or European music voyage? Mary Grivas at NTD Vacations assists with cabin selection, VIP concert passes, group rates, airfare, hotel packages, and travel insurance.",
    dept: "NTD Vacations",
    audience: "Fans & travelers",
    question: "How do I join the annual music cruise?",
    tags: ["Cabin selection", "VIP concert passes", "Group rates", "Airfare & hotels", "Travel insurance"],
    cta: "Ask about the cruise",
  },
];

const card = "rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] transition-colors hover:border-purple-500/40";
const iconBox = "flex shrink-0 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400";
const deptText = "text-xs text-white/50";
const bodyText = "text-sm leading-relaxed text-white/70";
const CONTACT_HREF = "/contact#contact-team";
const ctaBtn = "inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-500";
const ghostBtn = "inline-flex items-center gap-1.5 text-sm font-semibold text-purple-300 transition-colors hover:text-white";
const tagPill = "rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70";

function Header() {
  return (
    <SectionHeader
      as="h3"
      title="Booking & Department Guidelines"
      subtitle="Direct information for festival committees, corporate event buyers, media, and travelers."
    />
  );
}

/* 1 — Editorial numbered rows */
function Option1() {
  return (
    <div>
      <Header />
      <ol className="border-t border-white/10">
        {GUIDES.map((g, i) => (
          <li key={g.title} className="group grid gap-3 border-b border-white/10 py-6 md:grid-cols-[5rem_1fr_1.4fr_auto] md:items-baseline md:gap-8">
            <span className="font-mono text-sm text-purple-400">{String(i + 1).padStart(2, "0")}</span>
            <h5 className="font-bold text-white transition-colors group-hover:text-purple-300">{g.title}</h5>
            <p className={bodyText}>{g.body}</p>
            <span className={`${deptText} md:text-right`}>{g.dept}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* 2 — Bento: booking as the hero tile */
function Option2() {
  const [hero, ...rest] = GUIDES;
  const HeroIcon = hero.icon;
  return (
    <div>
      <Header />
      <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-3">
        <article className={`${card} flex flex-col justify-between p-8 lg:col-span-2 lg:row-span-3 bg-gradient-to-br from-purple-600/20 to-transparent`}>
          <div className={`${iconBox} h-16 w-16`}>
            <HeroIcon className="h-8 w-8" />
          </div>
          <div className="mt-16">
            <span className={`${deptText} uppercase tracking-widest`}>{hero.dept}</span>
            <h4 className="mt-2 mb-3 font-bold text-white">{hero.title}</h4>
            <p className="max-w-xl text-base leading-relaxed text-white/75">{hero.body}</p>
          </div>
        </article>
        {rest.map((g) => (
          <article key={g.title} className={`${card} flex gap-4 p-5`}>
            <div className={`${iconBox} h-10 w-10`}>
              <g.icon className="h-5 w-5" />
            </div>
            <div>
              <h5 className="mb-1 font-bold text-white">{g.title}</h5>
              <p className="text-sm text-white/60">{g.short}</p>
              <p className={`${deptText} mt-2`}>{g.dept}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 3 — Sticky header left, stacked cards right */
function Option3() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <Header />
      </div>
      <div className="flex flex-col gap-4">
        {GUIDES.map((g) => (
          <article key={g.title} className={`${card} flex gap-5 p-6`}>
            <div className={`${iconBox} h-12 w-12`}>
              <g.icon className="h-6 w-6" />
            </div>
            <div>
              <h5 className="mb-2 font-bold text-white">{g.title}</h5>
              <p className={bodyText}>{g.body}</p>
              <p className={`${deptText} mt-3`}>Department: {g.dept}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 4 — Tabs */
function Option4() {
  const [active, setActive] = useState(0);
  const g = GUIDES[active];
  return (
    <div>
      <Header />
      <div role="tablist" aria-label="Departments" className="mb-6 flex flex-wrap gap-2">
        {GUIDES.map((t, i) => (
          <button
            key={t.title}
            role="tab"
            type="button"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              i === active ? "border-purple-400 bg-purple-600/30 text-white" : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.title}
          </button>
        ))}
      </div>
      <article role="tabpanel" className={`${card} grid gap-8 p-8 md:grid-cols-[auto_1fr]`}>
        <div className={`${iconBox} h-20 w-20`}>
          <g.icon className="h-10 w-10" />
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">{g.title}</h4>
          <p className="max-w-3xl text-base leading-relaxed text-white/75">{g.body}</p>
          <p className={`${deptText} mt-6 border-t border-white/10 pt-3`}>Department: {g.dept}</p>
        </div>
      </article>
    </div>
  );
}

/* 5 — Accordion */
function Option5() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      <Header />
      <div className="flex flex-col gap-3">
        {GUIDES.map((g, i) => {
          const isOpen = open === i;
          return (
            <article key={g.title} className={`${card} ${isOpen ? "border-purple-500/40" : ""}`}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <div className={`${iconBox} h-10 w-10`}>
                  <g.icon className="h-5 w-5" />
                </div>
                <span className="flex-1">
                  <h5 className="font-bold text-white">{g.title}</h5>
                  <span className="text-sm text-white/50">{g.short}</span>
                </span>
                <Plus className={`h-5 w-5 text-purple-300 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pl-[4.75rem]">
                    <p className={bodyText}>{g.body}</p>
                    <p className={`${deptText} mt-3`}>Department: {g.dept}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* 6 — Horizontal snap carousel of tall cards */
function Option6() {
  return (
    <div>
      <Header />
      <div data-lenis-prevent className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
        {GUIDES.map((g, i) => (
          <article key={g.title} className={`${card} flex min-h-[26rem] w-[85%] shrink-0 snap-start flex-col justify-between p-7 sm:w-[22rem]`}>
            <div className="flex items-start justify-between">
              <div className={`${iconBox} h-12 w-12`}>
                <g.icon className="h-6 w-6" />
              </div>
              <span className="font-mono text-5xl font-bold text-white/10">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div>
              <h4 className="mb-3 font-bold text-white">{g.title}</h4>
              <p className={bodyText}>{g.body}</p>
              <p className={`${deptText} mt-5 border-t border-white/10 pt-3`}>Department: {g.dept}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 7 — 2×2 with accent bar and watermark icon */
function Option7() {
  return (
    <div>
      <Header />
      <div className="grid gap-5 md:grid-cols-2">
        {GUIDES.map((g) => (
          <article key={g.title} className={`${card} relative overflow-hidden border-l-4 border-l-purple-500 p-7`}>
            <g.icon aria-hidden="true" className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 text-purple-500/10" />
            <span className="mb-3 inline-block rounded-full bg-purple-600/20 px-3 py-1 text-xs font-semibold text-purple-300">{g.dept}</span>
            <h4 className="mb-3 font-bold text-white">{g.title}</h4>
            <p className={`${bodyText} relative max-w-lg`}>{g.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 8 — Vertical timeline rail */
function Option8() {
  return (
    <div>
      <Header />
      <ol className="relative ml-6 border-l border-purple-500/30">
        {GUIDES.map((g) => (
          <li key={g.title} className="relative pb-10 pl-10 last:pb-0">
            <div className={`${iconBox} absolute -left-6 top-0 h-12 w-12 bg-[#2a0f3d] ring-4 ring-[#1a0826]`}>
              <g.icon className="h-6 w-6" />
            </div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h5 className="font-bold text-white">{g.title}</h5>
              <span className={deptText}>{g.dept}</span>
            </div>
            <p className={`${bodyText} mt-2 max-w-3xl`}>{g.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* 9 — Compact directory with "contact" affordance */
function Option9() {
  return (
    <div>
      <Header />
      <div className="grid overflow-hidden rounded-[var(--radius-box)] border border-white/10 md:grid-cols-2">
        {GUIDES.map((g) => (
          <a
            key={g.title}
            href="#contact-form"
            className="group flex gap-4 border-b border-white/10 p-6 transition-colors hover:bg-purple-600/10 md:odd:border-r md:[&:nth-last-child(-n+2)]:border-b-0"
          >
            <div className={`${iconBox} h-11 w-11`}>
              <g.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <h5 className="font-bold text-white">{g.title}</h5>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-white/30 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-300" />
              </div>
              <p className="mt-1 text-sm text-white/60">{g.short}</p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-purple-300/70">{g.dept}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* 10 — Expanding columns (hover / tap to widen) */
function Option10() {
  const [active, setActive] = useState(0);
  return (
    <div>
      <Header />
      <div className="flex flex-col gap-3 lg:h-[26rem] lg:flex-row">
        {GUIDES.map((g, i) => {
          const isActive = i === active;
          return (
            <article
              key={g.title}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`${card} relative flex cursor-pointer flex-col overflow-hidden p-6 transition-[flex-grow,background-color] duration-500 ${
                isActive ? "bg-purple-600/15 lg:flex-[3]" : "lg:flex-1"
              }`}
            >
              <div className={`${iconBox} h-12 w-12`}>
                <g.icon className="h-6 w-6" />
              </div>
              <h5 className="mt-auto pt-6 font-bold text-white">{g.title}</h5>
              <div className={`grid transition-[grid-template-rows,opacity] duration-500 ${isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className={`${bodyText} mt-2 lg:min-w-[22rem]`}>{g.body}</p>
                  <p className={`${deptText} mt-3`}>Department: {g.dept}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────── UX-driven options (11–30) ───────────── */

/* 11 — "Who are you?" self-selection */
function Option11() {
  const [i, setI] = useState<number | null>(null);
  const g = i === null ? null : GUIDES[i];
  return (
    <div>
      <Header />
      <p className="mb-3 text-sm font-semibold text-white/80">I am a…</p>
      <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {GUIDES.map((x, k) => (
          <button
            key={x.audience}
            type="button"
            aria-pressed={i === k}
            onClick={() => setI(k)}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
              i === k ? "border-purple-400 bg-purple-600/25" : "border-white/10 bg-white/[0.03] hover:border-white/30"
            }`}
          >
            <x.icon className="h-5 w-5 text-purple-300" />
            <span className="font-semibold text-white">{x.audience}</span>
          </button>
        ))}
      </div>
      <div className={`${card} min-h-[9rem] p-6`} aria-live="polite">
        {g ? (
          <>
            <h5 className="mb-2 font-bold text-white">{g.title}</h5>
            <p className={bodyText}>{g.body}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className={deptText}>Department: {g.dept}</span>
              <a href={CONTACT_HREF} className={ctaBtn}>{g.cta} <ArrowRight className="h-4 w-4" /></a>
            </div>
          </>
        ) : (
          <p className="text-sm text-white/40">Pick the option that describes you and we&apos;ll show you exactly who to contact.</p>
        )}
      </div>
    </div>
  );
}

/* 12 — Guided question flow */
function Option12() {
  const [step, setStep] = useState<"q" | number>("q");
  return (
    <div>
      <Header />
      <div className={`${card} mx-auto max-w-2xl p-8`}>
        {step === "q" ? (
          <>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-300">Step 1 of 2</p>
            <h4 className="mb-6 font-bold text-white">What can we help you with?</h4>
            <div className="flex flex-col gap-2">
              {GUIDES.map((g, k) => (
                <button key={g.title} type="button" onClick={() => setStep(k)} className="group flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-left text-white/80 transition-colors hover:border-purple-400 hover:text-white">
                  {g.question}
                  <ArrowRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-purple-300" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setStep("q")} className={`${ghostBtn} mb-4`}><ChevronLeft className="h-4 w-4" /> Back</button>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-300">Step 2 of 2 · {GUIDES[step].dept}</p>
            <h4 className="mb-3 font-bold text-white">{GUIDES[step].title}</h4>
            <p className={bodyText}>{GUIDES[step].body}</p>
            <a href={CONTACT_HREF} className={`${ctaBtn} mt-6`}>{GUIDES[step].cta} <ArrowRight className="h-4 w-4" /></a>
          </>
        )}
      </div>
    </div>
  );
}

/* 13 — Comparison table */
function Option13() {
  return (
    <div>
      <Header />
      <div data-lenis-prevent className="overflow-x-auto rounded-[var(--radius-box)] border border-white/10">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th scope="col" className="p-4 font-semibold">Need</th>
              <th scope="col" className="p-4 font-semibold">Best for</th>
              <th scope="col" className="p-4 font-semibold">Handles</th>
              <th scope="col" className="p-4 font-semibold">Department</th>
            </tr>
          </thead>
          <tbody>
            {GUIDES.map((g) => (
              <tr key={g.title} className="border-t border-white/10 transition-colors hover:bg-purple-600/10">
                <th scope="row" className="p-4 font-bold text-white"><span className="flex items-center gap-2"><g.icon className="h-4 w-4 text-purple-300" />{g.title}</span></th>
                <td className="p-4 text-white/70">{g.audience}</td>
                <td className="p-4 text-white/70">{g.tags.slice(0, 4).join(" · ")}</td>
                <td className="p-4 text-white/50">{g.dept}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 14 — Action-first cards (clear CTA per card) */
function Option14() {
  return (
    <div>
      <Header />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {GUIDES.map((g) => (
          <article key={g.title} className={`${card} flex flex-col p-6`}>
            <div className={`${iconBox} mb-4 h-12 w-12`}><g.icon className="h-6 w-6" /></div>
            <h5 className="mb-2 font-bold text-white">{g.title}</h5>
            <p className="mb-6 text-sm text-white/60">{g.short}</p>
            <a href={CONTACT_HREF} className={`${ctaBtn} mt-auto justify-center`}>{g.cta}</a>
            <p className={`${deptText} mt-3 text-center`}>{g.dept}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 15 — Zig-zag rows */
function Option15() {
  return (
    <div>
      <Header />
      <div className="flex flex-col gap-6">
        {GUIDES.map((g, k) => (
          <article key={g.title} className={`flex flex-col items-center gap-6 md:flex-row ${k % 2 ? "md:flex-row-reverse md:text-right" : ""}`}>
            <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center rounded-[var(--radius-box)] bg-gradient-to-br from-purple-600/30 to-purple-900/10 md:w-72">
              <g.icon className="h-16 w-16 text-purple-300" />
            </div>
            <div className="max-w-2xl">
              <span className={`${deptText} uppercase tracking-widest`}>{g.dept}</span>
              <h4 className="mt-1 mb-3 font-bold text-white">{g.title}</h4>
              <p className={bodyText}>{g.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 16 — Priority: primary banner + secondary row */
function Option16() {
  const [primary, ...rest] = GUIDES;
  return (
    <div>
      <Header />
      <article className="mb-5 flex flex-col gap-6 rounded-[var(--radius-box)] border border-purple-500/40 bg-gradient-to-r from-purple-600/30 via-purple-600/10 to-transparent p-8 md:flex-row md:items-center">
        <div className={`${iconBox} h-16 w-16`}><primary.icon className="h-8 w-8" /></div>
        <div className="flex-1">
          <h4 className="mb-2 font-bold text-white">{primary.title}</h4>
          <p className={`${bodyText} max-w-3xl`}>{primary.body}</p>
        </div>
        <a href={CONTACT_HREF} className={`${ctaBtn} shrink-0`}>{primary.cta} <ArrowRight className="h-4 w-4" /></a>
      </article>
      <div className="grid gap-4 md:grid-cols-3">
        {rest.map((g) => (
          <article key={g.title} className={`${card} p-5`}>
            <div className="mb-2 flex items-center gap-2"><g.icon className="h-4 w-4 text-purple-300" /><h6 className="font-bold text-white">{g.title}</h6></div>
            <p className="text-sm text-white/60">{g.short}</p>
            <a href={CONTACT_HREF} className={`${ghostBtn} mt-3`}>{g.cta} <ArrowRight className="h-3.5 w-3.5" /></a>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 17 — Search / filter */
function Option17() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const hits = GUIDES.filter((g) => !term || [g.title, g.body, g.dept, ...g.tags].join(" ").toLowerCase().includes(term));
  return (
    <div>
      <Header />
      <label className="mb-2 flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 focus-within:border-purple-400">
        <Search className="h-4 w-4 text-white/40" />
        <span className="sr-only">Search departments</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “stage plot”, “photos”, “cabin”…" className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none" />
      </label>
      <div className="mb-5 flex flex-wrap gap-2">
        {["riders", "photos", "cabin", "festival", "lighting"].map((t) => (
          <button key={t} type="button" onClick={() => setQ(t)} className={`${tagPill} hover:border-purple-400`}>{t}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2" aria-live="polite">
        {hits.map((g) => (
          <article key={g.title} className={`${card} flex gap-4 p-5`}>
            <div className={`${iconBox} h-10 w-10`}><g.icon className="h-5 w-5" /></div>
            <div><h5 className="mb-1 font-bold text-white">{g.title}</h5><p className={bodyText}>{g.body}</p><p className={`${deptText} mt-2`}>{g.dept}</p></div>
          </article>
        ))}
        {!hits.length && <p className="text-sm text-white/50">No match. Try a different word, or <a href={CONTACT_HREF} className="text-purple-300 underline">see the full directory</a>.</p>}
      </div>
    </div>
  );
}

/* 18 — Scannable tag cards (no paragraphs) */
function Option18() {
  return (
    <div>
      <Header />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {GUIDES.map((g) => (
          <article key={g.title} className={`${card} flex flex-col p-6`}>
            <div className={`${iconBox} mb-4 h-11 w-11`}><g.icon className="h-5 w-5" /></div>
            <h5 className="mb-4 font-bold text-white">{g.title}</h5>
            <div className="flex flex-wrap gap-1.5">{g.tags.map((t) => <span key={t} className={tagPill}>{t}</span>)}</div>
            <p className={`${deptText} mt-auto pt-5`}>{g.dept}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 19 — Truncated with "Read more" */
function Option19() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div>
      <Header />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {GUIDES.map((g, k) => (
          <article key={g.title} className={`${card} flex flex-col p-6`}>
            <div className={`${iconBox} mb-4 h-11 w-11`}><g.icon className="h-5 w-5" /></div>
            <h5 className="mb-2 font-bold text-white">{g.title}</h5>
            <p className={`${bodyText} ${open[k] ? "" : "line-clamp-2"}`}>{g.body}</p>
            <button type="button" aria-expanded={!!open[k]} onClick={() => setOpen((o) => ({ ...o, [k]: !o[k] }))} className={`${ghostBtn} mt-2 self-start`}>
              {open[k] ? "Show less" : "Read more"}
            </button>
            <p className={`${deptText} mt-auto border-t border-white/10 pt-3`}>{g.dept}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 20 — Master / detail (vertical tabs) */
function Option20() {
  const [a, setA] = useState(0);
  const g = GUIDES[a];
  return (
    <div>
      <Header />
      <div className="grid overflow-hidden rounded-[var(--radius-box)] border border-white/10 md:grid-cols-[18rem_1fr]">
        <div role="tablist" aria-orientation="vertical" className="flex flex-col border-b border-white/10 md:border-r md:border-b-0">
          {GUIDES.map((x, k) => (
            <button key={x.title} role="tab" type="button" aria-selected={a === k} onClick={() => setA(k)}
              className={`flex items-center gap-3 border-l-2 px-5 py-4 text-left text-sm font-semibold transition-colors ${a === k ? "border-purple-400 bg-purple-600/15 text-white" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"}`}>
              <x.icon className="h-4 w-4" />{x.title}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="p-8">
          <h4 className="mb-3 font-bold text-white">{g.title}</h4>
          <p className={`${bodyText} max-w-2xl`}>{g.body}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">{g.tags.map((t) => <span key={t} className={tagPill}>{t}</span>)}</div>
          <div className="mt-6 flex flex-wrap items-center gap-4"><a href={CONTACT_HREF} className={ctaBtn}>{g.cta}</a><span className={deptText}>{g.dept}</span></div>
        </div>
      </div>
    </div>
  );
}

/* 21 — Overview quick-links, then details */
function Option21() {
  return (
    <div>
      <Header />
      <nav aria-label="Departments" className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {GUIDES.map((g, k) => (
          <a key={g.title} href={`#o21-${k}`} className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center text-sm font-semibold text-white/80 transition-colors hover:border-purple-400 hover:text-white">
            <g.icon className="h-6 w-6 text-purple-300" />{g.title}
          </a>
        ))}
      </nav>
      <div className="flex flex-col divide-y divide-white/10">
        {GUIDES.map((g, k) => (
          <article key={g.title} id={`o21-${k}`} className="scroll-mt-40 py-6">
            <h5 className="mb-2 font-bold text-white">{g.title}</h5>
            <p className={`${bodyText} max-w-3xl`}>{g.body}</p>
            <p className={`${deptText} mt-2`}>{g.dept}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 22 — "What to have ready" checklists */
function Option22() {
  return (
    <div>
      <Header />
      <div className="grid gap-5 md:grid-cols-2">
        {GUIDES.map((g) => (
          <article key={g.title} className={`${card} p-6`}>
            <div className="mb-4 flex items-center gap-3"><div className={`${iconBox} h-10 w-10`}><g.icon className="h-5 w-5" /></div><h5 className="font-bold text-white">{g.title}</h5></div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Ask about</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {g.tags.map((t) => <li key={t} className="flex items-center gap-2 text-sm text-white/75"><Check className="h-4 w-4 shrink-0 text-purple-300" />{t}</li>)}
            </ul>
            <p className={`${deptText} mt-5 border-t border-white/10 pt-3`}>Department: {g.dept}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 23 — Type-only minimal */
function Option23() {
  return (
    <div>
      <Header />
      <div className="grid gap-x-16 gap-y-12 md:grid-cols-2">
        {GUIDES.map((g) => (
          <article key={g.title}>
            <h3 className="mb-4 font-bold text-white">{g.title}</h3>
            <p className="text-base leading-relaxed text-white/65">{g.body}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-purple-300/70">{g.dept}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 24 — Grouped by intent */
function Option24() {
  const groups = [
    { label: "Book & produce a show", items: [GUIDES[0], GUIDES[2]] },
    { label: "Media & travel", items: [GUIDES[1], GUIDES[3]] },
  ];
  return (
    <div>
      <Header />
      <div className="grid gap-8 lg:grid-cols-2">
        {groups.map((grp) => (
          <div key={grp.label} className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-300">{grp.label}</p>
            <div className="flex flex-col gap-3">
              {grp.items.map((g) => (
                <article key={g.title} className={`${card} flex gap-4 p-5`}>
                  <div className={`${iconBox} h-10 w-10`}><g.icon className="h-5 w-5" /></div>
                  <div><h5 className="mb-1 font-bold text-white">{g.title}</h5><p className={bodyText}>{g.body}</p><p className={`${deptText} mt-2`}>{g.dept}</p></div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 25 — Selectable cards → one clear next step */
function Option25() {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div>
      <Header />
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-white/80">Choose a department</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((g, k) => (
            <label key={g.title} className={`relative flex cursor-pointer flex-col rounded-[var(--radius-box)] border p-5 transition-colors ${sel === k ? "border-purple-400 bg-purple-600/20" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}>
              <input type="radio" name="o25" className="sr-only" checked={sel === k} onChange={() => setSel(k)} />
              <span className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${sel === k ? "border-purple-400 bg-purple-500" : "border-white/30"}`}>{sel === k && <Check className="h-3 w-3 text-white" />}</span>
              <g.icon className="mb-3 h-6 w-6 text-purple-300" />
              <span className="mb-1 font-bold text-white">{g.title}</span>
              <span className="text-sm text-white/60">{g.short}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <span className="text-sm text-white/60">{sel === null ? "Select a department to continue" : <>Contacting <strong className="text-white">{GUIDES[sel].dept}</strong></>}</span>
        <a href={CONTACT_HREF} aria-disabled={sel === null} className={`${ctaBtn} ${sel === null ? "pointer-events-none opacity-40" : ""}`}>Continue <ArrowRight className="h-4 w-4" /></a>
      </div>
    </div>
  );
}

/* 26 — Proof stat + list */
function Option26() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <Header />
        <div className="rounded-[var(--radius-box)] border border-purple-500/30 bg-purple-600/10 p-8">
          <p className="text-6xl font-bold text-white">100+</p>
          <p className="mt-2 text-white/70">high-energy concerts every year, backed by a full management, label, production and travel team.</p>
        </div>
      </div>
      <ul className="flex flex-col divide-y divide-white/10 self-center">
        {GUIDES.map((g) => (
          <li key={g.title} className="flex gap-4 py-5">
            <g.icon className="mt-1 h-5 w-5 shrink-0 text-purple-300" />
            <div><h5 className="font-bold text-white">{g.title}</h5><p className="mt-1 text-sm text-white/60">{g.short}</p><p className={`${deptText} mt-1`}>{g.dept}</p></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 27 — Mega-footer columns */
function Option27() {
  return (
    <div>
      <Header />
      <div className="grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {GUIDES.map((g) => (
          <div key={g.title}>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-300"><g.icon className="h-4 w-4" />{g.dept}</p>
            <h6 className="mb-3 font-bold text-white">{g.title}</h6>
            <ul className="flex flex-col gap-1.5">
              {g.tags.map((t) => <li key={t}><a href={CONTACT_HREF} className="text-sm text-white/60 transition-colors hover:text-white">{t}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 28 — Elevated cards (depth = affordance) */
function Option28() {
  return (
    <div>
      <Header />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {GUIDES.map((g) => (
          <a key={g.title} href={CONTACT_HREF} className="group flex flex-col rounded-[var(--radius-box)] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-400/50 hover:shadow-[0_24px_50px_-16px_rgba(147,51,234,0.45)]">
            <div className={`${iconBox} mb-5 h-14 w-14 transition-transform duration-300 group-hover:scale-110`}><g.icon className="h-7 w-7" /></div>
            <h5 className="mb-2 font-bold text-white">{g.title}</h5>
            <p className="text-sm text-white/60">{g.short}</p>
            <span className={`${ghostBtn} mt-auto pt-6`}>{g.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* 29 — FAQ phrasing (visitor's own questions) */
function Option29() {
  return (
    <div>
      <Header />
      <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
        {GUIDES.map((g) => (
          <article key={g.title} className="border-l-2 border-purple-500/50 pl-5">
            <h5 className="mb-2 font-bold text-white">{g.question}</h5>
            <p className={bodyText}>{g.body}</p>
            <p className={`${deptText} mt-2`}>Handled by {g.dept}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* 30 — Sticky index with scroll-spy */
function Option30() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.idx))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div>
      <Header />
      <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Departments" className="hidden lg:sticky lg:top-40 lg:block lg:self-start">
          <ol className="flex flex-col gap-1 border-l border-white/10">
            {GUIDES.map((g, k) => (
              <li key={g.title}>
                <a href={`#o30-${k}`} className={`-ml-px block border-l-2 py-2 pl-4 text-sm transition-colors ${active === k ? "border-purple-400 font-semibold text-white" : "border-transparent text-white/50 hover:text-white"}`}>{g.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col gap-16">
          {GUIDES.map((g, k) => (
            <article key={g.title} id={`o30-${k}`} data-idx={k} ref={(el) => { refs.current[k] = el; }} className="scroll-mt-40">
              <div className={`${iconBox} mb-4 h-12 w-12`}><g.icon className="h-6 w-6" /></div>
              <h4 className="mb-3 font-bold text-white">{g.title}</h4>
              <p className="max-w-2xl text-base leading-relaxed text-white/70">{g.body}</p>
              <p className={`${deptText} mt-3`}>Department: {g.dept}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

const OPTIONS: { name: string; note: string; el: ReactNode }[] = [
  { name: "Editorial numbered rows", note: "Magazine-style list, hairline dividers, scans fast.", el: <Option1 /> },
  { name: "Bento — booking as hero", note: "Puts the money inquiry (booking) front and centre.", el: <Option2 /> },
  { name: "Sticky header split", note: "Heading stays put while the cards scroll past.", el: <Option3 /> },
  { name: "Department tabs", note: "One department at a time, big and readable.", el: <Option4 /> },
  { name: "Accordion", note: "Shortest on the page; full copy on demand.", el: <Option5 /> },
  { name: "Snap carousel", note: "Swipeable tall cards, great on phones.", el: <Option6 /> },
  { name: "2×2 accent cards", note: "Roomier than 4-up; watermark icons add depth.", el: <Option7 /> },
  { name: "Timeline rail", note: "Icons on a vertical line, reads top to bottom.", el: <Option8 /> },
  { name: "Compact directory", note: "Short summaries, whole tile is a link to the form.", el: <Option9 /> },
  { name: "Expanding columns", note: "Hover or tap a column to open it.", el: <Option10 /> },
  { name: "“Who are you?” selector", note: "UX: self-identification. Visitors know their role, not your department names — let them pick a role and show only the answer they need.", el: <Option11 /> },
  { name: "Guided question flow", note: "UX: recognition over recall. Questions phrased in the visitor's words, one decision per step, ending in a single action.", el: <Option12 /> },
  { name: "Comparison table", note: "UX: side-by-side comparison. Best when visitors aren't sure which department fits — scan one column to decide.", el: <Option13 /> },
  { name: "Action-first cards", note: "UX: every card ends in one obvious next step (CTA), so the section converts instead of just informing.", el: <Option14 /> },
  { name: "Zig-zag rows", note: "UI: alternating rhythm keeps long reading from feeling repetitive; large visual anchors aid recall.", el: <Option15 /> },
  { name: "Priority hierarchy", note: "UX: booking is the business goal, so it gets the primary banner; the rest are visibly secondary.", el: <Option16 /> },
  { name: "Search & filter", note: "UX: lets task-driven visitors type what they want (“stage plot”) instead of reading everything.", el: <Option17 /> },
  { name: "Scannable tag cards", note: "UX: people scan, they don't read. Keyword chips replace paragraphs for 2-second comprehension.", el: <Option18 /> },
  { name: "Read-more truncation", note: "UX: progressive disclosure. Equal-height cards; detail only for those who want it.", el: <Option19 /> },
  { name: "Master / detail", note: "UI: vertical tabs keep all options visible while one detail pane stays stable — no layout jump.", el: <Option20 /> },
  { name: "Overview → details", note: "UX: a table of contents first (orientation), then anchored detail sections below.", el: <Option21 /> },
  { name: "“Ask about” checklists", note: "UX: task framing. Checkmarks tell visitors exactly what each team can help with.", el: <Option22 /> },
  { name: "Type-only minimal", note: "UI: remove boxes and icons; hierarchy comes purely from type size and whitespace.", el: <Option23 /> },
  { name: "Grouped by intent", note: "UX: Gestalt grouping. Two clusters (shows vs. media/travel) cut 4 choices down to 2 first decisions.", el: <Option24 /> },
  { name: "Selectable cards", note: "UX: explicit selection state plus one Continue button — clear system status and a single path forward.", el: <Option25 /> },
  { name: "Proof stat + list", note: "UX: social proof (100+ shows/yr) builds trust before asking buyers to reach out.", el: <Option26 /> },
  { name: "Mega-footer columns", note: "UI: dense link columns for return visitors who know what they want; lightest visual weight.", el: <Option27 /> },
  { name: "Elevated cards", note: "UI: depth + lift on hover signals the whole card is clickable (affordance).", el: <Option28 /> },
  { name: "FAQ phrasing", note: "UX: match the user's mental model by titling each block with their question. Also good for SEO.", el: <Option29 /> },
  { name: "Sticky index + scroll-spy", note: "UX: persistent wayfinding — you always see where you are and what's left.", el: <Option30 /> },
];

export default function GuidelinesLayouts() {
  return (
    <main className="site-container page-container page-stack-sm relative min-h-screen pt-32">
      <nav aria-label="Jump to option" className="sticky top-20 z-20 mb-4 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur">
        {OPTIONS.map((o, i) => (
          <a key={o.name} href={`#option-${i + 1}`} className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 hover:bg-purple-600/30 hover:text-white">
            {i + 1}. {o.name}
          </a>
        ))}
      </nav>
      {OPTIONS.map((o, i) => (
        <section key={o.name} id={`option-${i + 1}`} className="section scroll-mt-40">
          <div className="mb-8 flex flex-wrap items-baseline gap-3 rounded-xl border border-dashed border-amber-400/40 bg-amber-400/5 px-4 py-2">
            <span className="font-mono text-sm font-bold text-amber-300">OPTION {i + 1}</span>
            {i >= 10 && <span className="rounded bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">UX</span>}
            <span className="text-sm font-semibold text-white">{o.name}</span>
            <span className="text-xs text-white/50">— {o.note}</span>
          </div>
          {o.el}
        </section>
      ))}
    </main>
  );
}
