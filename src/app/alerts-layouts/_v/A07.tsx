"use client";
import { useAlertForm, BAND, VENUE, RADIUS, Terms, SaveButton, Switch, Field } from "./shared";

/** Settings list: iOS-style grouped rows. Familiar, fast to scan. */
export default function A07() {
  const f = useAlertForm();
  const row = "flex min-h-14 items-center justify-between gap-4 px-5";
  const group = "flex flex-col divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.05]";
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <div><h2 className="text-white">Show alerts</h2><p className="text-sm text-white/55">Choose what lands on your phone.</p></div>
      <div className="flex flex-col gap-2"><p className="px-5 text-xs uppercase tracking-[0.14em] text-white/45">Distance</p>
        <div className={group}>
          {RADIUS.map((r) => (
            <button key={r.value} type="button" role="radio" aria-checked={f.radius === r.value} onClick={() => f.setRadius(r.value)} className={`${row} text-left transition-colors hover:bg-white/[0.04]`}>
              <span className="text-white">{r.value === "all" ? "Anywhere" : `Within ${r.label}`}</span>
              {f.radius === r.value && <span className="font-bold text-purple-300">✓</span>}
            </button>
          ))}
        </div>
      </div>
      {[{ t: "Band format", l: BAND }, { t: "Venue", l: VENUE }].map((g) => (
        <div key={g.t} className="flex flex-col gap-2"><p className="px-5 text-xs uppercase tracking-[0.14em] text-white/45">{g.t}</p>
          <div className={group}>{g.l.map((t) => (<div key={t.id} className={row}><span className="text-white">{t.label}</span><Switch label={t.label} on={f.types.includes(t.id)} onChange={() => f.toggle(t.id)} /></div>))}</div>
        </div>
      ))}
      <div className="flex flex-col gap-4">
        <Field label="Email" type="email" value={f.email} onChange={f.setEmail} placeholder="you@email.com" />
        <Field label="ZIP or city" value={f.zip} onChange={f.setZip} placeholder="60056" />
      </div>
      <Terms f={f} />
      <SaveButton f={f} className="w-full" />
    </div>
  );
}
