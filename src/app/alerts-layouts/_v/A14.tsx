"use client";
import { useState } from "react";
import { useAlertForm, BAND, VENUE, Chip, RadiusPills, Terms, SaveButton, INPUT, Field } from "./shared";

/** Email first: one field + button. Filters hide behind "Customize". */
export default function A14() {
  const f = useAlertForm();
  const [more, setMore] = useState(false);
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h2 className="text-white">Never miss a show near you</h2>
      <p className="text-white/60">Drop your email — we&apos;ll only ping you about shows within 50 miles.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input aria-label="Email" type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} placeholder="you@email.com" className={`${INPUT} flex-1`} />
        <SaveButton f={f} label="Notify me" />
      </div>
      <Terms f={f} />
      <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className="self-start text-sm font-semibold text-purple-300 underline-offset-4 transition-colors hover:text-white hover:underline">
        {more ? "Hide options" : "Customize distance & show types"}
      </button>
      {more && (
        <div className="flex flex-col gap-6">
          <Field label="ZIP or city" value={f.zip} onChange={f.setZip} placeholder="60056" className="max-w-xs" />
          <RadiusPills f={f} />
          <div className="flex flex-wrap gap-2">{[...BAND, ...VENUE].map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div>
        </div>
      )}
    </div>
  );
}
