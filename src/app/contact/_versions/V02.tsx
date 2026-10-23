import { PEOPLE, MOMENTS, Intro, Photo, ContactLinks, Kicker, MUTED } from "./shared";

/** Grouped by moment: before the show, show day, on the road. */
export default function V02() {
  return (
    <>
      <Intro title="Talk to the team" sub="Before the show, on show day, or on the road — each stage has its own people." />
      <div className="grid gap-24 lg:grid-cols-3 lg:gap-16">
        {MOMENTS.map((m) => (
          <section key={m.id} className="flex flex-col gap-12">
            <div className="flex flex-col gap-2">
              <Kicker className="!text-action">{m.step}</Kicker>
              <h2 className="text-white">{m.title}</h2>
            </div>
            {PEOPLE.filter((p) => p.moment === m.id).map((p) => (
              <div key={p.id} className="flex flex-col gap-2">
                <Photo p={p} className="h-auto max-h-56 w-full object-contain object-left-bottom" />
                <p className={`text-sm ${MUTED}`}>{p.role}</p>
                <h3 className="text-white">{p.name}</h3>
                <ContactLinks p={p} className="mt-2" />
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
