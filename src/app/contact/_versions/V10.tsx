import { PEOPLE, Intro, Photo, ContactLinks, Meta, Kicker, MUTED } from "./shared";

/** Sticky reason menu: jump links on the left, sections scroll on the right. */
export default function V10() {
  return (
    <>
      <Intro title="Contact" sub="Jump to what you need." />
      <div className="grid gap-16 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Contact sections" className="lg:sticky lg:top-32 lg:self-start">
          <Kicker className="mb-4">I need</Kicker>
          <ul className="flex flex-wrap gap-x-6 gap-y-3 lg:flex-col">
            {PEOPLE.map((p) => (
              <li key={p.id}>
                <a href={`#c-${p.id}`} className="text-lg text-white/70 transition-colors hover:text-action">
                  {p.need}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-28">
          {PEOPLE.map((p, i) => (
            <section key={p.id} id={`c-${p.id}`} className="grid scroll-mt-32 items-end gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h2 className="text-white">{p.need}</h2>
                <p className={MUTED}>{p.blurb}</p>
                <h3 className="mt-6 text-white">{p.name}</h3>
                <Meta p={p} />
                <ContactLinks p={p} className="mt-2" />
              </div>
              <Photo p={p} eager={i === 0} className="h-auto w-full object-contain object-bottom" />
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
