"use client";
import { useAlertForm, ALL_TYPES, RADIUS, Chip, Terms, SaveButton, INPUT } from "./shared";

/** Compact filter bar: everything on two lines, built for the footer. */
export default function A04() {
  const f = useAlertForm();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-white">Show alerts</h2>
        <p className="text-sm text-white/55">Pick a radius, pick your kind of shows, done.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input aria-label="ZIP or city" value={f.zip} onChange={(e) => f.setZip(e.target.value)} placeholder="ZIP or city" className={`${INPUT} w-40`} />
        <select aria-label="Travel radius" value={f.radius} onChange={(e) => f.setRadius(e.target.value)} className={`${INPUT} w-40`}>
          {RADIUS.map((r) => <option key={r.value} value={r.value} className="bg-[#1a0b24]">{r.label}</option>)}
        </select>
        <input aria-label="Email" type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} placeholder="you@email.com" className={`${INPUT} min-w-56 flex-1`} />
        <SaveButton f={f} label="Alert me" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip on={f.allOn} onClick={() => f.setAll(!f.allOn)}>All shows</Chip>
        {ALL_TYPES.map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}
      </div>
      <Terms f={f} />
    </div>
  );
}
