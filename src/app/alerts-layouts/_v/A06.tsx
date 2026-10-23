"use client";
import { useAlertForm, BAND, VENUE, RADIUS, Chip, ContactFields, Terms, SaveButton, Heading, LABEL } from "./shared";

/** Radar: concentric rings show your travel radius visually. */
export default function A06() {
  const f = useAlertForm();
  const rings = RADIUS.slice(0, 4);
  const idx = RADIUS.findIndex((r) => r.value === f.radius);
  return (
    <div className="grid max-w-6xl items-center gap-14 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative aspect-square w-full max-w-[420px]">
          {rings.map((r, i) => {
            const size = 30 + i * 23;
            const lit = f.radius === "all" || i <= idx;
            return (
              <button
                key={r.value}
                type="button"
                aria-label={`Within ${r.label}`}
                aria-pressed={f.radius === r.value}
                onClick={() => f.setRadius(r.value)}
                style={{ width: `${size}%`, height: `${size}%`, zIndex: 10 - i }}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors ${lit ? "bg-purple-500/20 ring-1 ring-purple-300/60" : "bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.07]"}`}
              >
                <span className="absolute left-1/2 top-2 -translate-x-1/2 text-xs font-semibold text-white/70">{r.label}</span>
              </button>
            );
          })}
          <span className="absolute left-1/2 top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1a0b24]">You</span>
        </div>
        <button type="button" onClick={() => f.setRadius("all")} className={`text-sm font-semibold transition-colors ${f.radius === "all" ? "text-white" : "text-purple-300 hover:text-white"}`}>
          {f.radius === "all" ? "✓ Anywhere" : "Or: anywhere"}
        </button>
      </div>
      <div className="flex flex-col gap-8">
        <Heading title="How far will you go?" sub="Tap a ring to set your radius." />
        <section className="flex flex-col gap-3"><span className={LABEL}>Shows</span>
          <div className="flex flex-wrap gap-2">{[...BAND, ...VENUE].map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div>
        </section>
        <ContactFields f={f} />
        <Terms f={f} />
        <SaveButton f={f} className="self-start" />
      </div>
    </div>
  );
}
