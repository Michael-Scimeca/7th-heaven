import { PEOPLE, Intro, Photo, ContactLinks, Meta, MUTED } from "./shared";

/** Accordion by need: only the answer you open is shown. */
export default function V15() {
  return (
    <>
      <Intro title="How can we help?" sub="Open the topic you need." />
      <div className="flex max-w-5xl flex-col gap-10">
        {PEOPLE.map((p, i) => (
          <details key={p.id} open={i === 0} className="group">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 [&::-webkit-details-marker]:hidden">
              <h2 className="text-white transition-colors group-hover:text-action">{p.need}</h2>
              <span aria-hidden="true" className="text-3xl text-white/50 transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="grid items-end gap-8 pt-8 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <p className={MUTED}>{p.blurb}</p>
                <h3 className="mt-4 text-white">{p.name}</h3>
                <Meta p={p} />
                <ContactLinks p={p} className="mt-2" linkClassName="text-xl" />
              </div>
              <Photo p={p} className="h-auto max-h-80 w-full object-contain object-bottom" />
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
