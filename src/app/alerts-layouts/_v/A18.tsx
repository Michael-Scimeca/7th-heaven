"use client";
import { useAlertForm, ALL_TYPES, RADIUS, Terms, SaveButton, INPUT } from "./shared";

/** Ticket stub: the form is styled like a concert ticket. */
export default function A18() {
  const f = useAlertForm();
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="grid overflow-hidden rounded-3xl bg-gradient-to-br from-[#3a1450] to-[#1c0a28] md:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-6 p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-purple-200/70">Admit one · Show alerts</p>
          <h2 className="text-white">Your all-access alert pass</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input aria-label="Name" value={f.name} onChange={(e) => f.setName(e.target.value)} placeholder="Name on pass" className={INPUT} />
            <input aria-label="Email" type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} placeholder="you@email.com" className={INPUT} />
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_TYPES.map((t) => (
              <button key={t.id} type="button" role="checkbox" aria-checked={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}
                className={`min-h-10 rounded-md px-3 text-xs font-bold uppercase tracking-wider transition-colors ${f.types.includes(t.id) ? "bg-white text-[#2a0f3a]" : "bg-white/10 text-white/50 hover:text-white"}`}>{t.label}</button>
            ))}
          </div>
          <Terms f={f} />
        </div>
        <div className="relative flex flex-col justify-between gap-6 border-t-2 border-dashed border-white/20 p-8 md:border-l-2 md:border-t-0">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-purple-200/70">Zone</p>
            <input aria-label="ZIP or city" value={f.zip} onChange={(e) => f.setZip(e.target.value)} placeholder="ZIP" className={INPUT} />
            <select aria-label="Travel radius" value={f.radius} onChange={(e) => f.setRadius(e.target.value)} className={INPUT}>
              {RADIUS.map((r) => <option key={r.value} value={r.value} className="bg-[#1a0b24]">{r.label}</option>)}
            </select>
          </div>
          <SaveButton f={f} label="Activate pass" className="w-full" />
        </div>
      </div>
    </div>
  );
}
