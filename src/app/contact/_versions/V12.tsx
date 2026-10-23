import { PEOPLE, Photo, ContactLinks, Meta, SECONDARY, MUTED } from "./shared";

/** Group shot + list: overlapping cutouts form a team photo; text list scrolls beside it. */
export default function V12() {
  return (
    <div className="grid gap-16 lg:grid-cols-2">
      <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
        <header className="flex flex-col gap-4">
          <h1 className="text-white">Contact the team</h1>
          <p className={`max-w-[50ch] ${SECONDARY}`}>Five people, one crew. Find yours on the right.</p>
        </header>
        <div className="relative aspect-[4/3] w-full" aria-hidden="true">
          {PEOPLE.map((p, i) => (
            <Photo
              key={p.id}
              p={p}
              eager
              className="absolute bottom-0 h-[78%] w-auto object-contain"
              style={{ left: `${i * 16 - 8}%`, zIndex: 5 - Math.abs(2 - i) }}
            />
          ))}
        </div>
      </div>
      <ol className="flex flex-col gap-16 lg:pt-24">
        {PEOPLE.map((p, i) => (
          <li key={p.id} className="grid grid-cols-[3rem_1fr] gap-4">
            <span className={`pt-2 text-sm tabular-nums ${MUTED}`}>0{i + 1}</span>
            <div className="flex flex-col gap-2">
              <h2 className="text-white">{p.name}</h2>
              <Meta p={p} />
              <p className={MUTED}>{p.blurb}</p>
              <ContactLinks p={p} inline className="mt-2" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
