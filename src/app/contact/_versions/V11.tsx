import { PEOPLE, Photo, ContactLinks, Meta, Kicker, SECONDARY, DISPLAY } from "./shared";

/** Poster: a giant ghost word behind a calm two-column roster. */
export default function V11() {
  return (
    <div className="relative">
      <p aria-hidden="true" className={`${DISPLAY} pointer-events-none absolute -top-8 left-0 select-none leading-none !text-white/[0.04]`} style={{ fontSize: "clamp(6rem, 22vw, 22rem)" }}>
        Contact
      </p>
      <div className="relative flex flex-col gap-24">
        <header className="flex max-w-2xl flex-col gap-4 pt-16 md:pt-40">
          <h1 className="text-white">Get in touch</h1>
          <p className={SECONDARY}>Booking, press, production and travel — straight to the person who handles it.</p>
        </header>
        <div className="grid gap-x-20 gap-y-20 md:grid-cols-2">
          {PEOPLE.map((p, i) => (
            <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-end gap-6">
              <Photo p={p} eager={i < 2} className="h-auto w-full object-contain object-bottom" />
              <div className="flex flex-col gap-2">
                <Kicker className="!text-action">{p.need}</Kicker>
                <h2 className="text-white">{p.name}</h2>
                <Meta p={p} />
                <ContactLinks p={p} className="mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
