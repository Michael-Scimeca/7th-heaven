import { PEOPLE, Photo, ContactLinks, Kicker, SECONDARY } from "./shared";

/** Credits roll: centred like film credits, role above name. */
export default function V16() {
  return (
    <div className="flex flex-col items-center gap-24 text-center">
      <header className="flex flex-col items-center gap-4">
        <Kicker>7th Heaven presents</Kicker>
        <h1 className="text-white">The team</h1>
        <p className={`max-w-[45ch] ${SECONDARY}`}>Everyone who makes the show happen — and how to reach them.</p>
      </header>
      <div className="flex w-full max-w-5xl items-end justify-center" aria-hidden="true">
        {PEOPLE.map((p, i) => (
          <Photo key={p.id} p={p} eager className={`h-auto min-w-0 flex-1 object-contain ${i ? "-ml-8" : ""}`} />
        ))}
      </div>
      <div className="flex flex-col gap-20">
        {PEOPLE.map((p) => (
          <section key={p.id} className="flex flex-col items-center gap-2">
            <Kicker>{p.role}</Kicker>
            <h2 className="text-white">{p.name}</h2>
            <ContactLinks p={p} inline className="mt-3 justify-center" />
          </section>
        ))}
      </div>
    </div>
  );
}
