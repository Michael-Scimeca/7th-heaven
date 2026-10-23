import { PEOPLE, Intro, Photo, ContactLinks, Kicker } from "./shared";

/** Mosaic: asymmetric photo grid — booking big, everyone else around it. */
export default function V19() {
  return (
    <>
      <Intro title="Contact" sub="Booking first. Everyone else is one glance away." />
      <div className="grid gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-4">
        {PEOPLE.map((p, i) => (
          <div key={p.id} className={`flex flex-col gap-2 ${i === 0 ? "md:col-span-2 lg:row-span-2" : ""}`}>
            <Photo p={p} eager={i < 3} className={`h-auto w-full object-contain object-bottom ${i === 0 ? "" : "max-h-56"}`} />
            <Kicker className="!text-action">{p.need}</Kicker>
            {i === 0 ? <h2 className="text-white">{p.name}</h2> : <h3 className="text-white">{p.name}</h3>}
            <ContactLinks p={p} className="mt-1" linkClassName={i === 0 ? "text-2xl font-semibold" : ""} />
          </div>
        ))}
      </div>
    </>
  );
}
