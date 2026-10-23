"use client";
import { useAlertForm, BAND, VENUE, RadiusPills, Terms, SaveButton, Heading } from "./shared";

/** Underline fields + checklist: no boxes at all, pure type and spacing. */
export default function A08() {
  const f = useAlertForm();
  const line = "h-12 w-full border-0 border-b border-white/20 bg-transparent text-lg text-white placeholder:text-white/30 outline-none transition-colors focus:border-purple-400";
  return (
    <div className="flex max-w-4xl flex-col gap-12">
      <Heading />
      <div className="grid gap-8 sm:grid-cols-3">
        {[["Name", f.name, f.setName, "John Doe", "text"], ["ZIP or city", f.zip, f.setZip, "60056", "text"], ["Email", f.email, f.setEmail, "you@email.com", "email"]].map(([l, v, s, p, t]) => (
          <label key={l as string} className="flex flex-col gap-1"><span className="text-xs uppercase tracking-[0.14em] text-white/50">{l as string}</span>
            <input type={t as string} value={v as string} onChange={(e) => (s as (x: string) => void)(e.target.value)} placeholder={p as string} className={line} />
          </label>
        ))}
      </div>
      <section className="flex flex-col gap-3"><span className="text-xs uppercase tracking-[0.14em] text-white/50">Radius</span><RadiusPills f={f} /></section>
      <div className="grid gap-10 sm:grid-cols-2">
        {[{ t: "Band format", l: BAND }, { t: "Venue", l: VENUE }].map((g) => (
          <fieldset key={g.t} className="flex flex-col gap-4"><legend className="mb-3 text-xs uppercase tracking-[0.14em] text-white/50">{g.t}</legend>
            {g.l.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={f.types.includes(t.id)} onChange={() => f.toggle(t.id)} className="mt-1 h-5 w-5 accent-purple-500" />
                <span><span className="block font-semibold text-white">{t.label}</span><span className="text-sm text-white/50">{t.desc}</span></span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <div className="flex flex-col gap-5"><Terms f={f} /><SaveButton f={f} className="self-start" /></div>
    </div>
  );
}
