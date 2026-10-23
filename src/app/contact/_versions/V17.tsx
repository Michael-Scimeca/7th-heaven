import { PEOPLE, Photo, EmailLink, PhoneLink, Kicker, SECONDARY, MUTED } from "./shared";

/** Editorial: magazine headline, a portrait strip, then two-column entries. */
export default function V17() {
  return (
    <>
      <header className="grid gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <Kicker>Contact · Issue no. 7</Kicker>
          <h1 className="text-white">The people behind the show</h1>
        </div>
        <p className={`self-end lg:col-span-5 ${SECONDARY}`}>
          For over 100 concerts a year, these five keep the dates booked, the press informed, the stage wired and the fans travelling.
        </p>
      </header>
      <div className="grid grid-cols-5 items-end gap-2" aria-hidden="true">
        {PEOPLE.map((p) => (
          <Photo key={p.id} p={p} eager className="h-auto w-full object-contain object-bottom" />
        ))}
      </div>
      <div className="gap-16 md:columns-2">
        {PEOPLE.map((p) => (
          <article key={p.id} className="mb-14 flex break-inside-avoid flex-col gap-2">
            <Kicker className="!text-action">{p.need}</Kicker>
            <h2 className="text-white">{p.name}</h2>
            <p className={MUTED}>
              {p.blurb} <span className="text-white/70">{p.company ?? p.role}.</span>
            </p>
            <p className="flex flex-wrap gap-x-6">
              <EmailLink p={p} />
              <PhoneLink p={p} />
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
