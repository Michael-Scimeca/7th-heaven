"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export const RADIUS = [
  { value: "15", label: "15 mi" },
  { value: "30", label: "30 mi" },
  { value: "50", label: "50 mi" },
  { value: "100", label: "100 mi" },
  { value: "all", label: "Anywhere" },
];

export const BAND = [
  { id: "full", label: "Full Band", desc: "Electric 5-piece rock sets", dot: "bg-purple-500" },
  { id: "unplugged", label: "Unplugged", desc: "Acoustic & vocal sets", dot: "bg-purple-300" },
  { id: "special", label: "Special Feature", desc: "Guest stars & anniversaries", dot: "bg-pink-400" },
];
export const VENUE = [
  { id: "outdoor", label: "Outdoor Fest", desc: "Festivals & parks", dot: "bg-emerald-400" },
  { id: "casino", label: "Casino & Resort", desc: "Lounges & showrooms", dot: "bg-amber-400" },
  { id: "tv", label: "TV Broadcast", desc: "Televised live sets", dot: "bg-blue-400" },
  { id: "fundraiser", label: "Fundraiser", desc: "Charity & benefits", dot: "bg-rose-500" },
];
export const ALL_TYPES = [...BAND, ...VENUE];

/** Shared form state for every prototype (save is simulated here). */
export function useAlertForm() {
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [radius, setRadius] = useState("50");
  const [types, setTypes] = useState<string[]>(ALL_TYPES.map((t) => t.id));
  const [agree, setAgree] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const toggle = (id: string) =>
    setTypes((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const setAll = (on: boolean) => setTypes(on ? ALL_TYPES.map((t) => t.id) : []);
  const save = () => {
    setStatus("saving");
    setTimeout(() => setStatus("saved"), 700);
    setTimeout(() => setStatus("idle"), 2600);
  };
  const radiusLabel = radius === "all" ? "anywhere" : `within ${radius} miles`;
  const allOn = types.length === ALL_TYPES.length;
  return { name, setName, zip, setZip, email, setEmail, radius, setRadius, types, toggle, setAll, allOn, agree, setAgree, status, save, radiusLabel };
}
export type AlertForm = ReturnType<typeof useAlertForm>;

export const LABEL = "text-sm font-semibold text-white";
export const HINT = "text-sm text-white/55";
export const INPUT =
  "h-12 w-full rounded-xl bg-white/[0.06] px-4 text-base text-white placeholder:text-white/35 outline-none transition-colors focus:bg-white/[0.1] focus-visible:ring-2 focus-visible:ring-purple-400";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  inputClassName = INPUT,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  inputClassName?: string;
  autoComplete?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className={LABEL}>{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
    </label>
  );
}

export function ContactFields({ f, cols = 3 }: { f: AlertForm; cols?: 1 | 2 | 3 }) {
  const grid = cols === 3 ? "sm:grid-cols-3" : cols === 2 ? "sm:grid-cols-2" : "";
  return (
    <div className={`grid gap-4 ${grid}`}>
      <Field label="Name" value={f.name} onChange={f.setName} placeholder="John Doe" autoComplete="name" />
      <Field label="ZIP or city" value={f.zip} onChange={f.setZip} placeholder="60056" autoComplete="postal-code" />
      <Field label="Email" type="email" value={f.email} onChange={f.setEmail} placeholder="you@email.com" autoComplete="email" />
    </div>
  );
}

export function Chip({
  on,
  onClick,
  children,
  dot,
  className = "",
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  dot?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
        on ? "bg-purple-500 text-white hover:bg-purple-400" : "bg-white/[0.06] text-white/65 hover:bg-white/[0.12] hover:text-white"
      } ${className}`}
    >
      {dot && <span className={`h-2 w-2 rounded-full ${on ? "bg-white" : dot}`} aria-hidden="true" />}
      {children}
      {on && <Check className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}

export function RadiusPills({ f, className = "" }: { f: AlertForm; className?: string }) {
  return (
    <div role="radiogroup" aria-label="Travel radius" className={`flex flex-wrap gap-2 ${className}`}>
      {RADIUS.map((r) => {
        const on = f.radius === r.value;
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => f.setRadius(r.value)}
            className={`min-h-11 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
              on ? "bg-white text-[#1a0b24]" : "bg-white/[0.06] text-white/65 hover:bg-white/[0.12] hover:text-white"
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

export function RadiusSlider({ f }: { f: AlertForm }) {
  const idx = RADIUS.findIndex((r) => r.value === f.radius);
  return (
    <div className="flex flex-col gap-3">
      <input
        type="range"
        min={0}
        max={RADIUS.length - 1}
        step={1}
        value={idx}
        aria-label="Travel radius"
        aria-valuetext={RADIUS[idx].label}
        onChange={(e) => f.setRadius(RADIUS[Number(e.target.value)].value)}
        className="w-full accent-purple-400"
      />
      <div className="flex justify-between text-xs text-white/55">
        {RADIUS.map((r) => (
          <span key={r.value} className={r.value === f.radius ? "font-semibold text-white" : ""}>
            {r.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${on ? "bg-purple-500" : "bg-white/15"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function Terms({ f }: { f: AlertForm }) {
  return (
    <label className="flex items-center gap-3 text-sm text-white/65">
      <input type="checkbox" checked={f.agree} onChange={(e) => f.setAgree(e.target.checked)} className="h-5 w-5 accent-purple-500" />
      <span>
        I agree to the{" "}
        <Link href="/terms" className="underline transition-colors hover:text-white">Terms</Link> and{" "}
        <Link href="/privacy" className="underline transition-colors hover:text-white">Privacy Policy</Link>.
      </span>
    </label>
  );
}

export function SaveButton({ f, label = "Turn on show alerts", className = "" }: { f: AlertForm; label?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={f.save}
      disabled={f.status === "saving" || !f.agree}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-7 text-base font-bold text-white shadow-[0_8px_30px_rgba(168,85,247,0.35)] transition-[filter,transform] hover:brightness-110 disabled:opacity-50 ${className}`}
    >
      {f.status === "saving" ? "Saving…" : f.status === "saved" ? (<><Check className="h-5 w-5" /> You're on the list</>) : label}
    </button>
  );
}

/** One-line plain-English summary of the current choices. */
export function Summary({ f, className = "" }: { f: AlertForm; className?: string }) {
  const picked = ALL_TYPES.filter((t) => f.types.includes(t.id)).map((t) => t.label);
  const what = f.allOn ? "every kind of show" : picked.length ? picked.join(", ") : "no show types yet";
  return (
    <p className={`text-sm text-white/70 ${className}`}>
      You&apos;ll hear about <span className="font-semibold text-white">{what}</span>{" "}
      <span className="font-semibold text-white">{f.radiusLabel}</span>
      {f.zip ? <> of <span className="font-semibold text-white">{f.zip}</span></> : null}.
    </p>
  );
}

export function Heading({ title = "Show alerts near you", sub = "Get a heads-up only for the shows you'd actually go to." }: { title?: string; sub?: string }) {
  return (
    <header className="flex flex-col gap-2">
      <h2 className="text-white">{title}</h2>
      <p className={HINT}>{sub}</p>
    </header>
  );
}
