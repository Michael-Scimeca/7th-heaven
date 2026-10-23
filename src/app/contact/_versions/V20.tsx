import { PEOPLE, Photo, EmailLink, PhoneLink, KICKER, SECONDARY } from "./shared";

/** Contact sheet: a row of faces, then everything on one compact sheet. */
export default function V20() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16">
      <header className="flex flex-col gap-4">
        <h1 className="text-white">Contact</h1>
        <p className={SECONDARY}>Everything on one sheet.</p>
      </header>
      <div className="grid grid-cols-5 gap-2" aria-hidden="true">
        {PEOPLE.map((p) => (
          <Photo key={p.id} p={p} eager fade={false} className="aspect-square h-auto w-full object-cover object-top" />
        ))}
      </div>
      <dl className="flex flex-col gap-10">
        {PEOPLE.map((p) => (
          <div key={p.id} className="grid gap-2 md:grid-cols-[220px_1fr] md:gap-10">
            <dt className={`${KICKER} md:pt-1`}>{p.need}</dt>
            <dd className="flex flex-col gap-1">
              <span className="text-xl font-semibold text-white">
                {p.name}
                <span className="text-base font-normal text-white/55"> — {p.company ?? p.role}</span>
              </span>
              <span className="flex flex-wrap gap-x-6">
                <EmailLink p={p} />
                <PhoneLink p={p} />
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
