"use client";
import { Guitar, Mic, Star, Trees, Dice5, Tv, HeartHandshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAlertForm, ALL_TYPES, RadiusPills, ContactFields, Terms, SaveButton, Heading, LABEL } from "./shared";

const ICONS: Record<string, LucideIcon> = { full: Guitar, unplugged: Mic, special: Star, outdoor: Trees, casino: Dice5, tv: Tv, fundraiser: HeartHandshake };

/** Icon tiles: big, tappable icons — recognisable at a glance. */
export default function A13() {
  const f = useAlertForm();
  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <Heading />
      <section className="flex flex-col gap-3">
        <span className={LABEL}>Tap the shows you want</span>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7">
          {ALL_TYPES.map((t) => {
            const Icon = ICONS[t.id];
            const on = f.types.includes(t.id);
            return (
              <button key={t.id} type="button" role="checkbox" aria-checked={on} onClick={() => f.toggle(t.id)}
                className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl text-center text-xs font-semibold transition-colors ${on ? "bg-purple-500 text-white" : "bg-white/[0.05] text-white/55 hover:bg-white/[0.1] hover:text-white"}`}>
                <Icon className="h-7 w-7" aria-hidden="true" />{t.label}
              </button>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3"><span className={LABEL}>Distance</span><RadiusPills f={f} /></section>
      <ContactFields f={f} />
      <div className="flex flex-col gap-5"><Terms f={f} /><SaveButton f={f} className="self-start" /></div>
    </div>
  );
}
