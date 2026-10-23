"use client";
import { useState } from "react";
import { useAlertForm, ALL_TYPES, RADIUS, Terms, SaveButton, INPUT } from "./shared";

/** Conversation: answer one friendly question at a time. */
export default function A17() {
  const f = useAlertForm();
  const [step, setStep] = useState(0);
  const bubble = "max-w-[80%] rounded-3xl rounded-bl-md bg-white/[0.08] px-5 py-3 text-white";
  const mine = "ml-auto max-w-[80%] rounded-3xl rounded-br-md bg-purple-500 px-5 py-3 font-semibold text-white";
  const opt = "min-h-11 rounded-full bg-white/[0.08] px-4 text-sm font-semibold text-white transition-colors hover:bg-purple-500";
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <p className={bubble}>Hey! Want a heads-up when 7th Heaven plays near you? 🎸</p>
      <p className={bubble}>How far would you drive for a show?</p>
      {step === 0 ? (
        <div className="flex flex-wrap justify-end gap-2">{RADIUS.map((r) => <button key={r.value} type="button" className={opt} onClick={() => { f.setRadius(r.value); setStep(1); }}>{r.value === "all" ? "Anywhere!" : r.label}</button>)}</div>
      ) : (<p className={mine}>{f.radius === "all" ? "Anywhere!" : `Up to ${f.radius} miles`}</p>)}
      {step >= 1 && <p className={bubble}>Any kind of show you&apos;d skip? Tap to turn off.</p>}
      {step === 1 && (
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-wrap justify-end gap-2">{ALL_TYPES.map((t) => <button key={t.id} type="button" aria-pressed={f.types.includes(t.id)} onClick={() => f.toggle(t.id)} className={`${opt} ${f.types.includes(t.id) ? "!bg-purple-500" : "line-through opacity-50"}`}>{t.label}</button>)}</div>
          <button type="button" onClick={() => setStep(2)} className="min-h-11 rounded-full bg-white px-5 font-bold text-[#1a0b24]">That&apos;s it →</button>
        </div>
      )}
      {step >= 2 && <p className={mine}>{f.allOn ? "I'm in for everything" : `${f.types.length} kinds of shows`}</p>}
      {step >= 2 && <p className={bubble}>Last thing — where should we send it?</p>}
      {step >= 2 && (
        <div className="flex flex-col gap-3">
          <input aria-label="Email" type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} placeholder="you@email.com" className={INPUT} />
          <input aria-label="ZIP or city" value={f.zip} onChange={(e) => f.setZip(e.target.value)} placeholder="ZIP or city" className={INPUT} />
          <Terms f={f} />
          <SaveButton f={f} className="self-end" />
        </div>
      )}
    </div>
  );
}
