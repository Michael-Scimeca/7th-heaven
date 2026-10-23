"use client";
import { useAlertForm, ALL_TYPES, RADIUS } from "./shared";
import { Terms, SaveButton, INPUT } from "./shared";

/** Sentence builder: the form reads as one sentence. */
export default function A02() {
  const f = useAlertForm();
  const sel = "mx-1 inline-block rounded-lg bg-purple-500/25 px-2 py-0.5 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-purple-400";
  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <p className="font-[family-name:var(--font-display)] text-3xl uppercase leading-[1.35] text-white md:text-5xl md:leading-[1.3]">
        Tell me about shows
        <select aria-label="Travel radius" value={f.radius} onChange={(e) => f.setRadius(e.target.value)} className={sel}>
          {RADIUS.map((r) => <option key={r.value} value={r.value} className="bg-[#1a0b24]">{r.value === "all" ? "anywhere" : `within ${r.label}`}</option>)}
        </select>
        of
        <input aria-label="ZIP or city" value={f.zip} onChange={(e) => f.setZip(e.target.value)} placeholder="your ZIP" className={`${sel} w-40 placeholder:text-white/40`} />
        — send them to
        <input aria-label="Email" type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} placeholder="your email" className={`${sel} w-72 max-w-full placeholder:text-white/40`} />
      </p>
      <div className="flex flex-col gap-3">
        <span className="text-sm text-white/60">Only these kinds (tap to switch off):</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-lg">
          {ALL_TYPES.map((t) => (
            <button key={t.id} type="button" role="checkbox" aria-checked={f.types.includes(t.id)} onClick={() => f.toggle(t.id)} className={`transition-colors ${f.types.includes(t.id) ? "text-white underline decoration-purple-400 decoration-2 underline-offset-4" : "text-white/35 line-through hover:text-white/60"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <input aria-label="Name (optional)" value={f.name} onChange={(e) => f.setName(e.target.value)} placeholder="Your name (optional)" className={`${INPUT} max-w-sm`} />
      <div className="flex flex-col gap-5"><Terms f={f} /><SaveButton f={f} className="self-start" /></div>
    </div>
  );
}
