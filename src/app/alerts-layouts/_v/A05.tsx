"use client";
import { useAlertForm, BAND, VENUE, RadiusSlider, ContactFields, Terms, SaveButton, Heading, LABEL, Switch } from "./shared";

/** Slider + switch rows: radius on a slider, each show type a labelled switch. */
export default function A05() {
  const f = useAlertForm();
  return (
    <div className="grid max-w-5xl gap-14 lg:grid-cols-2">
      <div className="flex flex-col gap-10">
        <Heading />
        <section className="flex flex-col gap-4"><span className={LABEL}>Travel radius</span><RadiusSlider f={f} /></section>
        <ContactFields f={f} cols={1} />
      </div>
      <div className="flex flex-col gap-8">
        {[{ t: "Band format", list: BAND }, { t: "Venue", list: VENUE }].map((g) => (
          <section key={g.t} className="flex flex-col gap-1">
            <span className={`${LABEL} mb-2`}>{g.t}</span>
            {g.list.map((t) => (
              <div key={t.id} className="flex min-h-14 items-center justify-between gap-4">
                <div><p className="font-semibold text-white">{t.label}</p><p className="text-sm text-white/50">{t.desc}</p></div>
                <Switch label={t.label} on={f.types.includes(t.id)} onChange={() => f.toggle(t.id)} />
              </div>
            ))}
          </section>
        ))}
        <Terms f={f} />
        <SaveButton f={f} className="self-start" />
      </div>
    </div>
  );
}
