import { PEOPLE, Intro, Photo, EmailLink, PhoneLink, KICKER, MUTED, DISPLAY } from "./shared";

/** Aligned directory: one row per person, columns line up for scanning. */
export default function V03() {
  const cols = "md:grid-cols-[140px_1fr_1.2fr_1.4fr_1fr]";
  return (
    <>
      <Intro title="Directory" sub="Scan the first column for your reason, then read across." />
      <div className="flex flex-col">
        <div className={`hidden gap-x-8 pb-6 md:grid ${cols} ${KICKER}`}>
          <span aria-hidden="true" />
          <span>For</span>
          <span>Contact</span>
          <span>Email</span>
          <span>Phone</span>
        </div>
        <div className="flex flex-col gap-12 md:gap-6">
          {PEOPLE.map((p) => (
            <div key={p.id} className={`grid items-center gap-x-8 gap-y-2 md:grid ${cols}`}>
              <Photo p={p} fade={false} className="h-24 w-36 object-cover object-top" />
              <p className={`${DISPLAY} text-2xl lg:text-3xl`}>{p.need}</p>
              <div>
                <p className="font-semibold text-white">{p.name}</p>
                <p className={`text-sm ${MUTED}`}>{p.company ?? p.role}</p>
              </div>
              <EmailLink p={p} />
              <PhoneLink p={p} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
