"use client";

import React, { useState } from "react";

const INPUT = "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors";
const COLORS = ["#851DEF", "#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"];

type Guest = { name: string; email: string; phone: string };
const emptyGuest = (): Guest => ({ name: "", email: "", phone: "" });

/* ═══════════ VERSION A — Tab Accordion ═══════════ */
function VersionA() {
  const [guests, setGuests] = useState<Guest[]>([emptyGuest(), emptyGuest(), emptyGuest()]);
  const [activeTab, setActiveTab] = useState(0);
  const g = guests[activeTab];
  const update = (f: string, v: string) => setGuests(prev => prev.map((gg, i) => i === activeTab ? { ...gg, [f]: v } : gg));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {guests.map((guest, i) => (
          <button key={i} type="button" onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === i
                ? "bg-[var(--color-accent)] text-white shadow-[0_0_20px_rgba(133,29,239,0.4)]"
                : "bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/60"
            }`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-bold" style={{ backgroundColor: COLORS[i] + "40", color: COLORS[i] }}>
              {i === 0 ? "Y" : guest.name ? guest.name[0].toUpperCase() : (i + 1)}
            </span>
            {i === 0 ? "You" : guest.name || `Guest ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 animate-[fade-in_0.2s_ease]">
        <input type="text" placeholder={activeTab === 0 ? "Your Name" : `Guest ${activeTab + 1} Name`} value={g.name} onChange={e => update("name", e.target.value)} className={INPUT} />
        <input type="email" placeholder="Email" value={g.email} onChange={e => update("email", e.target.value)} className={INPUT} />
        <input type="tel" placeholder="Phone" value={g.phone} onChange={e => update("phone", e.target.value)} className={INPUT} />
      </div>
    </div>
  );
}

/* ═══════════ VERSION B — Step Wizard ═══════════ */
function VersionB() {
  const [step, setStep] = useState(0);
  const [guests, setGuests] = useState<Guest[]>([emptyGuest(), emptyGuest(), emptyGuest()]);
  const labels = ["Your Info", "Guest 2", "Guest 3"];
  const g = guests[step];
  const update = (f: string, v: string) => setGuests(prev => prev.map((gg, i) => i === step ? { ...gg, [f]: v } : gg));

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {labels.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setStep(i)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.6rem] font-bold transition-all ${
                step === i ? "bg-[var(--color-accent)] text-white shadow-[0_0_15px_rgba(133,29,239,0.4)]" 
                : step > i ? "bg-[var(--color-accent)]/30 text-white" 
                : "bg-white/5 border border-white/10 text-white/30"
              }`}>{step > i ? "✓" : i + 1}</div>
              <span className={`text-[0.5rem] uppercase tracking-widest font-bold ${step === i ? "text-white" : "text-white/20"}`}>{label}</span>
            </div>
            {i < labels.length - 1 && <div className={`flex-1 h-px mx-2 ${step > i ? "bg-[var(--color-accent)]/50" : "bg-white/10"}`} />}
          </React.Fragment>
        ))}
      </div>
      {/* Fields */}
      <div className="space-y-3">
        <input type="text" placeholder="Full Name" value={g.name} onChange={e => update("name", e.target.value)} className={INPUT} />
        <input type="email" placeholder="Email" value={g.email} onChange={e => update("email", e.target.value)} className={INPUT} />
        <input type="tel" placeholder="Phone" value={g.phone} onChange={e => update("phone", e.target.value)} className={INPUT} />
      </div>
      <div className="flex gap-3">
        {step > 0 && <button type="button" onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white/50 cursor-pointer hover:text-white/70 transition-colors">← Back</button>}
        <button type="button" onClick={() => setStep(s => Math.min(s + 1, 2))}
          className="flex-1 py-2.5 bg-[var(--color-accent)] rounded-lg text-xs font-bold text-white cursor-pointer hover:bg-[var(--color-accent)]/80 transition-colors">
          {step === 2 ? "Submit" : "Next →"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════ VERSION C — Card Grid ═══════════ */
function VersionC() {
  const [guests, setGuests] = useState<Guest[]>([emptyGuest(), emptyGuest(), emptyGuest()]);
  const update = (idx: number, f: string, v: string) => setGuests(prev => prev.map((g, i) => i === idx ? { ...g, [f]: v } : g));

  return (
    <div className="grid grid-cols-2 gap-3">
      {guests.map((g, i) => (
        <div key={i} className={`p-4 rounded-xl border space-y-2.5 ${i === 0 ? "bg-[var(--color-accent)]/5 border-[var(--color-accent)]/30" : "bg-white/[0.02] border-white/5"}`} style={{ borderLeft: `3px solid ${COLORS[i]}` }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[0.5rem] font-bold text-white" style={{ backgroundColor: COLORS[i] }}>{i + 1}</span>
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">{i === 0 ? "You" : `Guest ${i + 1}`}</span>
          </div>
          <input type="text" placeholder="Name" value={g.name} onChange={e => update(i, "name", e.target.value)} className={INPUT} />
          <input type="email" placeholder="Email" value={g.email} onChange={e => update(i, "email", e.target.value)} className={INPUT} />
          <input type="tel" placeholder="Phone" value={g.phone} onChange={e => update(i, "phone", e.target.value)} className={INPUT} />
        </div>
      ))}
      <button type="button" className="p-4 rounded-xl border border-dashed border-white/10 flex items-center justify-center gap-2 text-white/20 hover:text-white/40 hover:border-white/20 transition-colors cursor-pointer">
        <span className="text-xl">+</span>
        <span className="text-[0.65rem] font-bold uppercase tracking-widest">Add Guest</span>
      </button>
    </div>
  );
}

/* ═══════════ VERSION D — Inline Table ═══════════ */
function VersionD() {
  const [guests, setGuests] = useState<Guest[]>([emptyGuest(), emptyGuest(), emptyGuest()]);
  const update = (idx: number, f: string, v: string) => setGuests(prev => prev.map((g, i) => i === idx ? { ...g, [f]: v } : g));
  const SMALL = "bg-transparent border-0 border-b border-white/10 rounded-none px-2 py-2 text-[0.75rem] text-white placeholder:text-white/15 focus:border-[var(--color-accent)] focus:outline-none transition-colors w-full";

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[40px_1fr_1fr_1fr] bg-white/[0.03] px-3 py-2">
        <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/20">#</span>
        <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/20">Name</span>
        <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/20">Email</span>
        <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/20">Phone</span>
      </div>
      {guests.map((g, i) => (
        <div key={i} className={`grid grid-cols-[40px_1fr_1fr_1fr] items-center px-3 py-1 ${i === 0 ? "bg-[var(--color-accent)]/10" : i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-white" style={{ backgroundColor: COLORS[i] }}>{i + 1}</span>
          <input type="text" placeholder={i === 0 ? "Your name" : "Guest name"} value={g.name} onChange={e => update(i, "name", e.target.value)} className={SMALL} />
          <input type="email" placeholder="email@example.com" value={g.email} onChange={e => update(i, "email", e.target.value)} className={SMALL} />
          <input type="tel" placeholder="(555) 123-4567" value={g.phone} onChange={e => update(i, "phone", e.target.value)} className={SMALL} />
        </div>
      ))}
      <button type="button" className="w-full py-2.5 text-[0.6rem] font-bold uppercase tracking-widest text-[var(--color-accent)]/60 hover:text-[var(--color-accent)] hover:bg-white/[0.02] transition-colors cursor-pointer">+ Add Guest</button>
    </div>
  );
}

/* ═══════════ VERSION E — Collapsible List ═══════════ */
function VersionE() {
  const [guests, setGuests] = useState<Guest[]>([emptyGuest(), emptyGuest(), emptyGuest()]);
  const [open, setOpen] = useState(0);
  const update = (idx: number, f: string, v: string) => setGuests(prev => prev.map((g, i) => i === idx ? { ...g, [f]: v } : g));
  const labels = ["Primary Booker", "Guest 2", "Guest 3"];

  return (
    <div className="space-y-2">
      {guests.map((g, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-white/5">
          <button type="button" onClick={() => setOpen(open === i ? -1 : i)}
            className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
              i === 0 ? "bg-[var(--color-accent)]/20" : "bg-white/[0.03] hover:bg-white/[0.05]"
            }`}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white shrink-0" style={{ backgroundColor: COLORS[i] }}>
              {g.name ? g.name[0].toUpperCase() : (i + 1)}
            </span>
            <div className="flex-1 text-left">
              <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30">{labels[i]}</p>
              <p className="text-sm font-bold text-white">{g.name || "—"}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-white/30 transition-transform ${open === i ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {open === i && (
            <div className="px-4 pb-4 pt-2 space-y-2.5 bg-white/[0.01]">
              <input type="text" placeholder="Full Name" value={g.name} onChange={e => update(i, "name", e.target.value)} className={INPUT} />
              <input type="email" placeholder="Email" value={g.email} onChange={e => update(i, "email", e.target.value)} className={INPUT} />
              <input type="tel" placeholder="Phone" value={g.phone} onChange={e => update(i, "phone", e.target.value)} className={INPUT} />
            </div>
          )}
        </div>
      ))}
      <button type="button" className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest text-white/20 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-colors cursor-pointer">+ Add a Guest</button>
    </div>
  );
}

/* ═══════════ VERSION F — Compact Rows ═══════════ */
function VersionF() {
  const [guests, setGuests] = useState<Guest[]>([emptyGuest(), emptyGuest(), emptyGuest()]);
  const update = (idx: number, f: string, v: string) => setGuests(prev => prev.map((g, i) => i === idx ? { ...g, [f]: v } : g));
  const remove = (idx: number) => setGuests(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {guests.map((g, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-md flex items-center justify-center text-[0.5rem] font-bold text-white shrink-0 mt-2" style={{ backgroundColor: COLORS[i] }}>{i + 1}</span>
          <div className="flex-1 grid grid-cols-3 gap-2">
            <input type="text" placeholder={i === 0 ? "Your Name" : "Guest Name"} value={g.name} onChange={e => update(i, "name", e.target.value)} className={INPUT} />
            <input type="email" placeholder="Email" value={g.email} onChange={e => update(i, "email", e.target.value)} className={INPUT} />
            <input type="tel" placeholder="Phone" value={g.phone} onChange={e => update(i, "phone", e.target.value)} className={INPUT} />
          </div>
          {i > 0 && (
            <button type="button" onClick={() => remove(i)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors cursor-pointer mt-2 shrink-0">✕</button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => setGuests(g => [...g, emptyGuest()])}
        className="text-[0.7rem] font-bold text-[var(--color-accent)]/60 hover:text-[var(--color-accent)] transition-colors cursor-pointer">+ Add another guest</button>
    </div>
  );
}

/* ═══════════ PREVIEW PAGE ═══════════ */
export default function CruisePreviewPage() {
  const versions = [
    { label: "A", title: "Tab Accordion", desc: "Click guest tabs to switch between forms", Component: VersionA },
    { label: "B", title: "Step Wizard", desc: "Guided progress, one person at a time", Component: VersionB },
    { label: "C", title: "Card Grid", desc: "Each person gets their own card", Component: VersionC },
    { label: "D", title: "Inline Table", desc: "Spreadsheet-style, data-dense", Component: VersionD },
    { label: "E", title: "Collapsible List", desc: "Expand/collapse like a contact list", Component: VersionE },
    { label: "F", title: "Compact Rows", desc: "All fields inline per row", Component: VersionF },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-28 pb-20">
      <div className="site-container">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tight text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Guest Form <span className="accent-gradient-text">Variants</span>
          </h1>
          <p className="text-white/30 text-sm mt-2">6 different UI approaches — pick your favorite</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {versions.map(({ label, title, desc, Component }) => (
            <div key={label} className="bg-[#0d0d14]/80 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-sm font-black text-white">{label}</span>
                <div>
                  <h2 className="text-sm font-bold text-white">{title}</h2>
                  <p className="text-[0.6rem] text-white/30">{desc}</p>
                </div>
              </div>
              <div className="p-6">
                <Component />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
