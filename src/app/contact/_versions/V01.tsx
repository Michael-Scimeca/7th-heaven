import { PEOPLE, Intro, Photo, ContactLinks, Meta, MUTED } from "./shared";

/** Need-first rows: reason → person → photo. */
export default function V01() {
  return (
    <>
      <Intro title="What do you need?" sub="Find your reason for reaching out and go straight to the right person." />
      <div className="flex flex-col gap-24">
        {PEOPLE.map((p, i) => (
          <section key={p.id} className="grid items-center gap-8 md:grid-cols-12">
            <div className="flex flex-col gap-2 md:col-span-4">
              <h2 className="text-white">{p.need}</h2>
              <p className={MUTED}>{p.blurb}</p>
            </div>
            <div className="flex flex-col gap-3 md:col-span-4">
              <h3 className="text-white">{p.name}</h3>
              <Meta p={p} />
              <ContactLinks p={p} />
            </div>
            <Photo p={p} eager={i === 0} className="h-auto max-h-[300px] w-full object-contain object-bottom md:col-span-4" />
          </section>
        ))}
      </div>
    </>
  );
}
