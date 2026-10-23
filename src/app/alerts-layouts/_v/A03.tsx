"use client";
import { useState } from "react";
import { useAlertForm, BAND, VENUE, Chip, RadiusPills, ContactFields, Terms, SaveButton, Summary, LABEL } from "./shared";

/** Three-step wizard: Where → What → You. One decision per screen. */
export default function A03() {
  const f = useAlertForm();
  const [step, setStep] = useState(0);
  const steps = ["Where", "What", "You"];
  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <ol className="flex gap-6 text-sm">
        {steps.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => setStep(i)} className={`flex items-center gap-2 font-semibold transition-colors ${i === step ? "text-white" : i < step ? "text-purple-300" : "text-white/40"}`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${i <= step ? "bg-purple-500 text-white" : "bg-white/10"}`}>{i + 1}</span>{s}
            </button>
          </li>
        ))}
      </ol>
      {step === 0 && (<section className="flex flex-col gap-4"><h2 className="text-white">How far will you go for a show?</h2><RadiusPills f={f} /></section>)}
      {step === 1 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-white">What kind of shows?</h2>
          <span className={LABEL}>Band</span>
          <div className="flex flex-wrap gap-2">{BAND.map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div>
          <span className={LABEL}>Venue</span>
          <div className="flex flex-wrap gap-2">{VENUE.map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div>
        </section>
      )}
      {step === 2 && (<section className="flex flex-col gap-6"><h2 className="text-white">Where should we send them?</h2><ContactFields f={f} cols={1} /><Summary f={f} /><Terms f={f} /></section>)}
      <div className="flex items-center gap-4">
        {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="min-h-12 px-4 font-semibold text-white/70 transition-colors hover:text-white">Back</button>}
        {step < 2 ? (
          <button type="button" onClick={() => setStep(step + 1)} className="min-h-12 rounded-full bg-white px-8 font-bold text-[#1a0b24] transition-colors hover:bg-white/90">Next</button>
        ) : (<SaveButton f={f} />)}
      </div>
    </div>
  );
}
