"use client";
import { useAlertForm, BAND, VENUE, Chip, RadiusSlider, Terms, SaveButton, Field, Summary } from "./shared";

/** Mobile sheet: narrow centred column with a sticky save bar. */
export default function A16() {
  const f = useAlertForm();
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex flex-col gap-8 rounded-[32px] bg-[#1a0b24]/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/20" aria-hidden="true" />
        <div><h2 className="text-white">Show alerts</h2><p className="text-sm text-white/55">Takes 20 seconds.</p></div>
        <Field label="Email" type="email" value={f.email} onChange={f.setEmail} placeholder="you@email.com" />
        <Field label="ZIP or city" value={f.zip} onChange={f.setZip} placeholder="60056" />
        <div className="flex flex-col gap-3"><span className="text-sm font-semibold text-white">Distance</span><RadiusSlider f={f} /></div>
        <div className="flex flex-wrap gap-2">{[...BAND, ...VENUE].map((t) => <Chip key={t.id} dot={t.dot} on={f.types.includes(t.id)} onClick={() => f.toggle(t.id)} className="!min-h-10 !px-3 !text-xs">{t.label}</Chip>)}</div>
        <Terms f={f} />
        <div className="sticky bottom-20 flex flex-col gap-3 bg-[#1a0b24]/90 pt-2">
          <Summary f={f} />
          <SaveButton f={f} className="w-full" />
        </div>
      </div>
    </div>
  );
}
