"use client";

import React, { useState } from "react";

const INPUT =
  "w-full bg-white/[0.03] border  border-white/10  rounded-lg px-3 py-2.5     placeholder: text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors";
const COLORS = [
  "#851DEF",
  "#3b82f6",
  "#06b6d4",
  "#9333ea",
  "#10b981",
  "#ec4899",
];

type Guest = { name: string; email: string; phone: string };
const emptyGuest = (): Guest => ({ name: "", email: "", phone: "" });

/* ═══════════ VERSION A — Tab Accordion ═══════════ */
function VersionA() {
  const [guests, setGuests] = useState<Guest[]>([
    emptyGuest(),
    emptyGuest(),
    emptyGuest(),
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const g = guests[activeTab];
  const update = (f: string, v: string) =>
    setGuests((prev) =>
      prev.map((gg, i) => (i === activeTab ? { ...gg, [f]: v } : gg)),
    );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from(guests, (guest, i) => ({ guest, i })).map(
          ({ guest, i }) => (
            <button
              key={`guest-tab-${i}-${guest.name}`}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 ${activeTab === i ? "bg-[var(--color-accent)] shadow-[0_0_20px_rgba(255,10,61,0.4)]" : "border border-white/10 bg-white/[0.04] text-white/40"}`}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-lg text-[var(--font-size-2xs)]"
                style={{ backgroundColor: COLORS[i] + "40", color: COLORS[i] }}
              >
                {i === 0
                  ? "Y"
                  : guest.name
                    ? guest.name[0].toUpperCase()
                    : i + 1}
              </span>
              {i === 0 ? "You" : guest.name || `Guest ${i + 1}`}
            </button>
          ),
        )}
      </div>
      <div className="animate-[fade-in_0.2s_ease] space-y-3 border border-white/10 bg-white/[0.02] p-4">
        <input
          type="text"
          placeholder={
            activeTab === 0 ? "Your Name" : `Guest ${activeTab + 1} Name`
          }
          value={g.name}
          onChange={(e) => update("name", e.target.value)}
          className={INPUT}
        />
        <input
          type="email"
          placeholder="Email"
          value={g.email}
          onChange={(e) => update("email", e.target.value)}
          className={INPUT}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={g.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={INPUT}
        />
      </div>
    </div>
  );
}

/* ═══════════ VERSION B — Step Wizard ═══════════ */
function VersionB() {
  const [step, setStep] = useState(0);
  const [guests, setGuests] = useState<Guest[]>([
    emptyGuest(),
    emptyGuest(),
    emptyGuest(),
  ]);
  const g = guests[step];
  const update = (f: string, v: string) =>
    setGuests((prev) =>
      prev.map((gg, i) => (i === step ? { ...gg, [f]: v } : gg)),
    );

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {Array.from(STEP_LABELS, (label, i) => ({ label, i })).map(
          ({ label, i }) => (
            <React.Fragment key={`step-frag-${i}-${label}`}>
              <button
                type="button"
                className="flex cursor-pointer flex-col items-center gap-1 border-0 p-0 text-left"
                onClick={() => setStep(i)}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${step === i ? "bg-[var(--color-accent)] shadow-[0_0_15px_rgba(255,10,61,0.4)]" : step > i ? "bg-[var(--color-accent)]/30" : "border border-white/10 bg-[#00000029] text-white/30"}`}
                >
                  {step > i ? "✓" : i + 1}
                </div>
                <span
                  className={`text-[var(--font-size-2xs)] ${step === i ? " " : "text-white/20"}`}
                >
                  {label}
                </span>
              </button>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`mx-2 h-px flex-1 ${step > i ? "bg-[var(--color-accent)]/50" : "bg-white/10"}`}
                />
              )}
            </React.Fragment>
          ),
        )}
      </div>
      {/* Fields */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Full Name"
          value={g.name}
          onChange={(e) => update("name", e.target.value)}
          className={INPUT}
        />
        <input
          type="email"
          placeholder="Email"
          value={g.email}
          onChange={(e) => update("email", e.target.value)}
          className={INPUT}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={g.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={INPUT}
        />
      </div>
      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 cursor-pointer rounded-lg border border-white/10 bg-[#00000029] py-2.5 text-white/50"
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(s + 1, 2))}
          className="flex-1 cursor-pointer rounded-lg bg-[var(--color-accent)] py-2.5 hover:bg-[var(--color-accent)]/80"
        >
          {step === 2 ? "Submit" : "Next →"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════ VERSION C — Card Grid ═══════════ */
function VersionC() {
  const [guests, setGuests] = useState<Guest[]>([
    emptyGuest(),
    emptyGuest(),
    emptyGuest(),
  ]);
  const update = (idx: number, f: string, v: string) =>
    setGuests((prev) => prev.map((g, i) => (i === idx ? { ...g, [f]: v } : g)));

  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from(guests, (g, i) => ({ g, i })).map(({ g, i }) => (
        <div
          key={i}
          className="space-y-2.5 border p-4 border-white/5 bg-white/[0.02] first:border-[var(--color-accent)]/30 first:bg-[var(--color-accent)]/5"
        >
          <div className="mb-1 flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-lg text-[var(--font-size-2xs)]"
              style={{ backgroundColor: COLORS[i] }}
            >
              {i + 1}
            </span>
            <span className="text-white/50">
              <span>{COLLAPSIBLE_LABELS[i] || `Guest ${i + 1}`}</span>
            </span>
          </div>
          <input
            type="text"
            placeholder="Name"
            value={g.name}
            onChange={(e) => update(i, "name", e.target.value)}
            className={INPUT}
          />
          <input
            type="email"
            placeholder="Email"
            value={g.email}
            onChange={(e) => update(i, "email", e.target.value)}
            className={INPUT}
          />
          <input
            type="tel"
            placeholder="Phone"
            value={g.phone}
            onChange={(e) => update(i, "phone", e.target.value)}
            className={INPUT}
          />
        </div>
      ))}
      <button
        type="button"
        className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-white/10 p-4 text-white/20 text-white/40 hover:text-white"
      >
        <span className="text-xl">+</span>
        <span>Add Guest</span>
      </button>
    </div>
  );
}

/* ═══════════ VERSION D — Inline Table ═══════════ */
function VersionD() {
  const [guests, setGuests] = useState<Guest[]>([
    emptyGuest(),
    emptyGuest(),
    emptyGuest(),
  ]);
  const update = (idx: number, f: string, v: string) =>
    setGuests((prev) => prev.map((g, i) => (i === idx ? { ...g, [f]: v } : g)));
  const SMALL =
    "   border-0 border-b  border-white/10  rounded-none px-2 py-2     placeholder: /15 focus:border-[var(--color-accent)] focus:outline-none  w-full";

  return (
    <div className="overflow-hidden border border-white/10">
      <div className="grid grid-cols-[40px_1fr_1fr_1fr] bg-white/[0.03] px-3 py-2">
        <span className="text-[var(--font-size-2xs)] text-white/20">#</span>
        <span className="text-[var(--font-size-2xs)] text-white/20">Name</span>
        <span className="text-[var(--font-size-2xs)] text-white/20">Email</span>
        <span className="text-[var(--font-size-2xs)] text-white/20">Phone</span>
      </div>
      {Array.from(guests, (g, i) => ({ g, i })).map(({ g, i }) => (
        <div
          key={i}
          className="grid grid-cols-[40px_1fr_1fr_1fr] items-center px-3 py-1 first:bg-[var(--color-accent)]/10 even:bg-white/[0.01]"
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-lg text-[var(--font-size-2xs)]"
            style={{ backgroundColor: COLORS[i] }}
          >
            {i + 1}
          </span>
          <input
            type="text"
            placeholder={i === 0 ? "Your name" : "Guest name"}
            value={g.name}
            onChange={(e) => update(i, "name", e.target.value)}
            className={SMALL}
          />
          <input
            type="email"
            placeholder="email@example.com"
            value={g.email}
            onChange={(e) => update(i, "email", e.target.value)}
            className={SMALL}
          />
          <input
            type="tel"
            placeholder="(555) 123-4567"
            value={g.phone}
            onChange={(e) => update(i, "phone", e.target.value)}
            className={SMALL}
          />
        </div>
      ))}
      <button
        type="button"
        className="w-full cursor-pointer py-2.5 text-[var(--color-accent)]/60 hover:bg-white/[0.02]"
      >
        + Add Guest
      </button>
    </div>
  );
}

/* ═══════════ VERSION E — Collapsible List ═══════════ */
function VersionE() {
  const [guests, setGuests] = useState<Guest[]>([
    emptyGuest(),
    emptyGuest(),
    emptyGuest(),
  ]);
  const [open, setOpen] = useState(0);
  const update = (idx: number, f: string, v: string) =>
    setGuests((prev) => prev.map((g, i) => (i === idx ? { ...g, [f]: v } : g)));

  return (
    <div className="space-y-2">
      {Array.from(guests, (g, i) => ({ g, i })).map(({ g, i }) => (
        <div key={i} className="overflow-hidden border border-white/5">
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 ${i === 0 ? "bg-[var(--color-accent)]/20" : "bg-white/[0.03] hover:bg-white/[0.05]"}`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS[i] }}
            >
              {g.name ? g.name[0].toUpperCase() : i + 1}
            </span>
            <div className="flex-1 text-left">
              <p>{COLLAPSIBLE_LABELS[i]}</p>
              <p>{g.name || "—"}</p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-white/30 ${open === i ? "rotate-90 text-purple-400" : ""}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {open === i && (
            <div className="space-y-2.5 bg-white/[0.01] px-4 pt-2 pb-4">
              <input
                type="text"
                placeholder="Full Name"
                value={g.name}
                onChange={(e) => update(i, "name", e.target.value)}
                className={INPUT}
              />
              <input
                type="email"
                placeholder="Email"
                value={g.email}
                onChange={(e) => update(i, "email", e.target.value)}
                className={INPUT}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={g.phone}
                onChange={(e) => update(i, "phone", e.target.value)}
                className={INPUT}
              />
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        className="w-full cursor-pointer border border-dashed border-white/10 py-3 text-white/20"
      >
        + Add a Guest
      </button>
    </div>
  );
}

/* ═══════════ VERSION F — Compact Rows ═══════════ */
function VersionF() {
  const [guests, setGuests] = useState<Guest[]>([
    emptyGuest(),
    emptyGuest(),
    emptyGuest(),
  ]);
  const update = (idx: number, f: string, v: string) =>
    setGuests((prev) => prev.map((g, i) => (i === idx ? { ...g, [f]: v } : g)));
  const remove = (idx: number) =>
    setGuests((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {Array.from(guests, (g, i) => ({ g, i })).map(({ g, i }) => (
        <div key={i} className="flex items-start gap-2">
          <span
            className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--font-size-2xs)]"
            style={{ backgroundColor: COLORS[i] }}
          >
            {i + 1}
          </span>
          <div className="grid flex-1 grid-cols-3 gap-2">
            <input
              type="text"
              placeholder={i === 0 ? "Your Name" : "Guest Name"}
              value={g.name}
              onChange={(e) => update(i, "name", e.target.value)}
              className={INPUT}
            />
            <input
              type="email"
              placeholder="Email"
              value={g.email}
              onChange={(e) => update(i, "email", e.target.value)}
              className={INPUT}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={g.phone}
              onChange={(e) => update(i, "phone", e.target.value)}
              className={INPUT}
            />
          </div>
          {i > 0 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="mt-2 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#00000029] text-white/20 hover:bg-red-500/20 hover:text-red-400"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setGuests((g) => [...g, emptyGuest()])}
        className="cursor-pointer text-[var(--color-accent)]/60"
      >
        + Add another guest
      </button>
    </div>
  );
}

/* ═══════════ PREVIEW PAGE ═══════════ */
const STEP_LABELS = ["Your Info", "Guest 2", "Guest 3"];
const COLLAPSIBLE_LABELS = ["Primary Booker", "Guest 2", "Guest 3"];

const VERSIONS = [
  {
    label: "A",
    title: "Tab Accordion",
    desc: "Click guest tabs to switch between forms",
    Component: VersionA,
  },
  {
    label: "B",
    title: "Step Wizard",
    desc: "Guided progress, one person at a time",
    Component: VersionB,
  },
  {
    label: "C",
    title: "Card Grid",
    desc: "Each person gets their own card",
    Component: VersionC,
  },
  {
    label: "D",
    title: "Inline Table",
    desc: "Spreadsheet-style, data-dense",
    Component: VersionD,
  },
  {
    label: "E",
    title: "Collapsible List",
    desc: "Expand/collapse like a contact list",
    Component: VersionE,
  },
  {
    label: "F",
    title: "Compact Rows",
    desc: "All fields inline per row",
    Component: VersionF,
  },
];

export default function CruisePreviewPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="site-container">
        <div className="mb-12 text-center">
          <h1 className="text-4xl">
            Guest Form <span className="accent-gradient-text">Variants</span>
          </h1>
          <p className="mt-2">6 different UI approaches — pick your favorite</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {VERSIONS.map(({ label, title, desc, Component }) => (
            <div
              key={label}
              className="overflow-hidden border border-white/10 bg-[var(--color-bg-surface)]/80"
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]">
                  {label}
                </span>
                <div>
                  <h2>{title}</h2>
                  <p>{desc}</p>
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
