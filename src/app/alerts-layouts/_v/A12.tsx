"use client";
import { useAlertForm, BAND, VENUE, Chip, RadiusPills, ContactFields, Terms, SaveButton, Heading, LABEL } from "./shared";

/** Phone + form, cleaned: the current idea with lighter controls. */
export default function A12() {
  const f = useAlertForm();
  return (
    <div className="flex max-w-6xl flex-col items-start gap-14 md:flex-row">
      <div className="hidden aspect-[9/19.5] w-[220px] shrink-0 overflow-hidden rounded-[40px] bg-black p-2 shadow-[0_30px_80px_rgba(83,17,97,0.6)] md:block">
        <video src="/movie/notefication.mp4" autoPlay loop muted playsInline className="h-full w-full rounded-[32px] object-cover" aria-label="Example show alert on a phone" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <Heading />
        <ContactFields f={f} />
        <section className="flex flex-col gap-3"><span className={LABEL}>Distance</span><RadiusPills f={f} /></section>
        <section className="flex flex-col gap-3"><span className={LABEL}>Shows</span>
          <div className="flex flex-wrap gap-2">{[...BAND, ...VENUE].map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)}>{t.label}</Chip>)}</div>
        </section>
        <div className="flex flex-wrap items-center gap-6"><SaveButton f={f} /><Terms f={f} /></div>
      </div>
    </div>
  );
}
