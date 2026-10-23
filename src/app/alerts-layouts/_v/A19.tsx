"use client";
import { useAlertForm, BAND, VENUE, RadiusPills, ContactFields, Terms, SaveButton, Heading } from "./shared";

/** Matrix: band formats × venues in one compact grid with All toggles. */
export default function A19() {
  const f = useAlertForm();
  const Group = ({ title, list }: { title: string; list: typeof BAND }) => {
    const all = list.every((t) => f.types.includes(t.id));
    return (
      <fieldset className="flex flex-col gap-1">
        <div className="mb-2 flex items-center justify-between"><legend className="font-bold text-white">{title}</legend>
          <button type="button" onClick={() => list.forEach((t) => (all ? f.types.includes(t.id) : !f.types.includes(t.id)) && f.toggle(t.id))} className="text-sm font-semibold text-purple-300 transition-colors hover:text-white">{all ? "Clear" : "Select all"}</button>
        </div>
        {list.map((t) => (
          <label key={t.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 transition-colors hover:bg-white/[0.05]">
            <input type="checkbox" checked={f.types.includes(t.id)} onChange={() => f.toggle(t.id)} className="h-5 w-5 accent-purple-500" />
            <span className={`h-2.5 w-2.5 rounded-full ${t.dot}`} aria-hidden="true" />
            <span className="flex-1 font-semibold text-white">{t.label}</span>
            <span className="hidden text-sm text-white/45 sm:inline">{t.desc}</span>
          </label>
        ))}
      </fieldset>
    );
  };
  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <Heading />
      <RadiusPills f={f} />
      <div className="grid gap-10 md:grid-cols-2"><Group title="Band format" list={BAND} /><Group title="Venue" list={VENUE} /></div>
      <ContactFields f={f} />
      <div className="flex flex-col gap-5"><Terms f={f} /><SaveButton f={f} className="self-start" /></div>
    </div>
  );
}
