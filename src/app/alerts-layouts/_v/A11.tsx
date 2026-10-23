"use client";
import { useAlertForm, BAND, VENUE, ALL_TYPES, Chip, RadiusPills, ContactFields, Terms, SaveButton, Heading, LABEL } from "./shared";

/** Live preview: a sample push notification updates as you choose. */
export default function A11() {
  const f = useAlertForm();
  const first = ALL_TYPES.find((t) => f.types.includes(t.id));
  const miles = f.radius === "all" ? "near you" : `${Math.max(5, Math.round(Number(f.radius) * 0.6))} mi away`;
  return (
    <div className="grid max-w-6xl gap-14 lg:grid-cols-[1fr_minmax(0,380px)]">
      <div className="flex flex-col gap-8">
        <Heading />
        <section className="flex flex-col gap-3"><span className={LABEL}>Distance</span><RadiusPills f={f} /></section>
        <section className="flex flex-col gap-3"><span className={LABEL}>Shows</span>
          <div className="flex flex-wrap gap-2">{[...BAND, ...VENUE].map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div>
        </section>
        <ContactFields f={f} />
        <Terms f={f} />
        <SaveButton f={f} className="self-start" />
      </div>
      <aside className="flex flex-col gap-3 lg:sticky lg:top-32 lg:self-start" aria-live="polite">
        <p className="text-xs uppercase tracking-[0.14em] text-white/45">Preview of an alert</p>
        <div className="rounded-3xl bg-white/90 p-4 text-[#1a0b24] shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-black/55"><span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2a0f3a] text-[9px] font-bold text-white">7H</span>7TH HEAVEN · now</div>
          <p className="mt-2 font-bold">{first ? `${first.label} show ${miles}` : "Pick at least one show type"}</p>
          <p className="text-sm text-black/70">{first ? `${f.name ? `${f.name.split(" ")[0]}, t` : "T"}ickets just went live — tap for details.` : "We'll only send what you choose."}</p>
        </div>
        <p className="text-sm text-white/50">We send at most a couple of alerts a month.</p>
      </aside>
    </div>
  );
}
