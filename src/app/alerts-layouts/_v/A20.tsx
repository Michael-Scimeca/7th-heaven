"use client";
import { useAlertForm, BAND, VENUE, Chip, RadiusPills, ContactFields, Terms, SaveButton, Summary, LABEL } from "./shared";

/** Split with sticky summary: choices left, a live recap + save on the right. */
export default function A20() {
  const f = useAlertForm();
  return (
    <div className="grid max-w-6xl gap-14 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-10">
        <div><h2 className="text-white">Build your show alerts</h2><p className="text-white/55">Changes show up in your summary instantly.</p></div>
        <section className="flex flex-col gap-3"><span className={LABEL}>Distance</span><RadiusPills f={f} /></section>
        <section className="flex flex-col gap-3"><span className={LABEL}>Band format</span><div className="flex flex-wrap gap-2">{BAND.map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div></section>
        <section className="flex flex-col gap-3"><span className={LABEL}>Venue</span><div className="flex flex-wrap gap-2">{VENUE.map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div></section>
        <ContactFields f={f} />
      </div>
      <aside className="flex flex-col gap-5 rounded-3xl bg-white/[0.05] p-6 lg:sticky lg:top-32 lg:self-start">
        <p className="text-xs uppercase tracking-[0.14em] text-white/45">Your alerts</p>
        <Summary f={f} className="text-base" />
        <p className="text-sm text-white/50">To: {f.email || "add your email"}</p>
        <Terms f={f} />
        <SaveButton f={f} className="w-full" />
      </aside>
    </div>
  );
}
