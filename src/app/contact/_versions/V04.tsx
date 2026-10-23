import { PEOPLE, Photo, ContactLinks, Kicker, MUTED, SECONDARY } from "./shared";

/** Booking spotlight: the #1 request gets the hero, everyone else below. */
export default function V04() {
  const [lead, ...rest] = PEOPLE;
  return (
    <>
      <section className="grid items-end gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <Kicker>Booking</Kicker>
            <h1 className="text-white">Bring 7th Heaven to your stage</h1>
            <p className={`max-w-[50ch] ${SECONDARY}`}>{lead.blurb} {lead.first} handles every booking.</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-white">
              {lead.name} <span className={`font-normal ${MUTED}`}>· {lead.company}</span>
            </p>
            <ContactLinks p={lead} linkClassName="text-2xl font-semibold md:text-3xl" />
          </div>
        </div>
        <Photo p={lead} eager className="h-auto w-full object-contain object-bottom" />
      </section>
      <section className="flex flex-col gap-12">
        <h2 className="text-white">Everyone else</h2>
        <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((p) => (
            <div key={p.id} className="flex flex-col gap-2">
              <Photo p={p} className="h-auto max-h-48 w-full object-contain object-left-bottom" />
              <Kicker className="!text-action">{p.need}</Kicker>
              <h3 className="text-white">{p.name}</h3>
              <ContactLinks p={p} className="mt-1" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
