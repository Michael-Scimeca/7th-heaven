import { PEOPLE, Intro, Photo, ContactLinks, Kicker, MUTED } from "./shared";

/** Zigzag: full-width rows, portrait alternates sides. */
export default function V06() {
  return (
    <>
      <Intro title="Meet the team" sub="Five people keep 7th Heaven on the road. Here's who does what." />
      <div className="flex flex-col gap-28">
        {PEOPLE.map((p, i) => (
          <section key={p.id} className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
            <Photo p={p} eager={i === 0} className={`h-auto w-full object-contain object-bottom ${i % 2 ? "md:order-2" : ""}`} />
            <div className="flex flex-col gap-4">
              <Kicker className="!text-action">{p.need}</Kicker>
              <h2 className="text-white">{p.name}</h2>
              <p className={`max-w-[45ch] ${MUTED}`}>{p.blurb}</p>
              <ContactLinks p={p} className="mt-2" linkClassName="text-xl" />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
