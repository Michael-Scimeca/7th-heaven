"use client";
import { useState } from "react";
import { useAlertForm, BAND, VENUE, ALL_TYPES, Chip, RadiusPills, ContactFields, Terms, SaveButton, Heading } from "./shared";

/** Accordion: each section collapses to a one-line summary. */
export default function A10() {
  const f = useAlertForm();
  const [open, setOpen] = useState<string>("radius");
  const picked = f.allOn ? "All shows" : `${f.types.length} of ${ALL_TYPES.length} types`;
  const sections = [
    { id: "radius", title: "Distance", summary: f.radius === "all" ? "Anywhere" : `Within ${f.radius} miles`, body: <RadiusPills f={f} /> },
    { id: "shows", title: "Show types", summary: picked, body: <div className="flex flex-wrap gap-2">{[...BAND, ...VENUE].map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div> },
    { id: "you", title: "Your details", summary: f.email || "Add your email", body: <ContactFields f={f} /> },
  ];
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <Heading />
      <div className="flex flex-col divide-y divide-white/10">
        {sections.map((s) => (
          <section key={s.id} className="py-5">
            <button type="button" aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? "" : s.id)} className="flex w-full items-center justify-between gap-4 text-left">
              <span className="text-lg font-bold text-white">{s.title}</span>
              <span className="flex items-center gap-3 text-sm text-white/60">{s.summary}<span aria-hidden="true" className={`text-xl transition-transform ${open === s.id ? "rotate-45" : ""}`}>+</span></span>
            </button>
            {open === s.id && <div className="pt-5">{s.body}</div>}
          </section>
        ))}
      </div>
      <div className="flex flex-col gap-5"><Terms f={f} /><SaveButton f={f} className="self-start" /></div>
    </div>
  );
}
