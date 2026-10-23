import { PEOPLE, Intro, Photo, ContactLinks, Kicker, MUTED } from "./shared";

/** Horizontal rail: swipe or scroll sideways through the team. */
export default function V14() {
  return (
    <>
      <Intro title="Who to call" sub="Scroll sideways through the team →" />
      <ul className="-mx-[var(--site-gutter,1.5rem)] flex snap-x snap-mandatory gap-12 overflow-x-auto px-[var(--site-gutter,1.5rem)] pb-8 [scrollbar-width:thin]">
        {PEOPLE.map((p, i) => (
          <li key={p.id} className="flex w-[80vw] shrink-0 snap-start flex-col gap-3 sm:w-[420px]">
            <Photo p={p} eager={i < 3} className="h-auto w-full object-contain object-bottom" />
            <Kicker className="!text-action">{p.need}</Kicker>
            <h2 className="text-white">{p.name}</h2>
            <p className={MUTED}>{p.blurb}</p>
            <ContactLinks p={p} className="mt-2" />
          </li>
        ))}
      </ul>
    </>
  );
}
