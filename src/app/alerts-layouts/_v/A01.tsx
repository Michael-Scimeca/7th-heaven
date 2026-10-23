"use client";
import { useAlertForm, BAND, VENUE, Chip, RadiusPills, ContactFields, Terms, SaveButton, Heading, LABEL, HINT } from "./shared";

/** Clean stack: three clear steps, chips instead of boxed cards. */
export default function A01() {
  const f = useAlertForm();
  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <Heading />
      <section className="flex flex-col gap-3">
        <span className={LABEL}>How far will you travel?</span>
        <RadiusPills f={f} />
      </section>
      <section className="flex flex-col gap-3">
        <span className={LABEL}>Which shows?</span>
        <p className={HINT}>Band format</p>
        <div className="flex flex-wrap gap-2">{BAND.map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div>
        <p className={`${HINT} mt-2`}>Venue</p>
        <div className="flex flex-wrap gap-2">{VENUE.map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div>
      </section>
      <ContactFields f={f} />
      <div className="flex flex-col gap-5"><Terms f={f} /><SaveButton f={f} className="self-start" /></div>
    </div>
  );
}
