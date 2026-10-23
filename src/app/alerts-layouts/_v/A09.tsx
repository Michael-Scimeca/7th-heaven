"use client";
import { useState } from "react";
import { useAlertForm, ALL_TYPES, BAND, VENUE, Chip, RadiusPills, ContactFields, Terms, SaveButton, Heading } from "./shared";

const PRESETS = [
  { id: "all", title: "Everything nearby", desc: "Every show within 50 miles", types: ALL_TYPES.map((t) => t.id), radius: "50" },
  { id: "acoustic", title: "Unplugged nights", desc: "Acoustic & intimate sets", types: ["unplugged"], radius: "100" },
  { id: "outdoor", title: "Big summer shows", desc: "Festivals & full band", types: ["full", "outdoor"], radius: "100" },
  { id: "custom", title: "Let me choose", desc: "Pick formats & venues", types: [] as string[], radius: "50" },
];

/** Presets first: most fans pick one tap; power users customise. */
export default function A09() {
  const f = useAlertForm();
  const [preset, setPreset] = useState("all");
  const pick = (p: (typeof PRESETS)[number]) => {
    setPreset(p.id);
    if (p.id !== "custom") {
      f.setAll(false);
      p.types.forEach((id) => f.toggle(id));
      f.setRadius(p.radius);
    }
  };
  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <Heading title="What should we tell you about?" sub="Pick one — you can fine-tune later." />
      <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={preset === p.id} onClick={() => pick(p)}
            className={`flex flex-col gap-1 rounded-2xl px-5 py-4 text-left transition-colors ${preset === p.id ? "bg-purple-500 text-white" : "bg-white/[0.05] text-white hover:bg-white/[0.1]"}`}>
            <span className="text-lg font-bold">{p.title}</span><span className={preset === p.id ? "text-white/85" : "text-white/55"}>{p.desc}</span>
          </button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="flex flex-col gap-4">
          <RadiusPills f={f} />
          <div className="flex flex-wrap gap-2">{[...BAND, ...VENUE].map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div>
        </div>
      )}
      <ContactFields f={f} />
      <div className="flex flex-col gap-5"><Terms f={f} /><SaveButton f={f} className="self-start" /></div>
    </div>
  );
}
