import { PEOPLE, Photo, Kicker, MUTED, SECONDARY } from "./shared";

/** Phone-first: one narrow column, big tap targets that say what they do. */
export default function V13() {
  const action = "flex min-h-12 items-center text-xl font-semibold text-action transition-colors hover:text-action-hover";
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-24">
      <header className="flex flex-col gap-4">
        <h1 className="text-white">Contact</h1>
        <p className={SECONDARY}>Tap to email or call — no forms.</p>
      </header>
      {PEOPLE.map((p, i) => (
        <section key={p.id} className="flex flex-col gap-3">
          <Photo p={p} mobile eager={i === 0} className="h-auto w-full object-contain" />
          <Kicker className="!text-action">{p.need}</Kicker>
          <h2 className="text-white">{p.name}</h2>
          <p className={MUTED}>{p.blurb}</p>
          <address className="mt-2 flex flex-col not-italic">
            <a href={`mailto:${p.email}`} className={action}>Email {p.first} →</a>
            <a href={`tel:${p.tel}`} className={action}>Call {p.phone}</a>
          </address>
        </section>
      ))}
    </div>
  );
}
