"use client";
import { useAlertForm, BAND, VENUE, Chip, RadiusPills, Terms, SaveButton, Field } from "./shared";

/** Three columns: Where · What · Who — side by side, read left to right. */
export default function A15() {
  const f = useAlertForm();
  const col = "flex flex-col gap-5";
  const n = "font-[family-name:var(--font-display)] text-5xl leading-none text-white/15";
  return (
    <div className="flex flex-col gap-12">
      <div><h2 className="text-white">Show alerts</h2><p className="text-white/55">Three quick choices.</p></div>
      <div className="grid gap-12 lg:grid-cols-3">
        <section className={col}><span className={n}>01</span><h3 className="text-white">Where</h3>
          <Field label="ZIP or city" value={f.zip} onChange={f.setZip} placeholder="60056" /><RadiusPills f={f} /></section>
        <section className={col}><span className={n}>02</span><h3 className="text-white">What</h3>
          <div className="flex flex-wrap gap-2">{[...BAND, ...VENUE].map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div></section>
        <section className={col}><span className={n}>03</span><h3 className="text-white">Who</h3>
          <Field label="Name" value={f.name} onChange={f.setName} placeholder="John Doe" />
          <Field label="Email" type="email" value={f.email} onChange={f.setEmail} placeholder="you@email.com" />
          <Terms f={f} /><SaveButton f={f} className="self-start" /></section>
      </div>
    </div>
  );
}
