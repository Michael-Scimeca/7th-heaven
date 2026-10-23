import { PEOPLE, Intro, Photo, ContactLinks, Kicker } from "./shared";

/** Band lineup: all five portraits stand side by side, details underneath. */
export default function V08() {
  return (
    <>
      <Intro title="The crew behind the band" sub="Everyone you might need, standing in one row." />
      <div>
        <div className="hidden items-end lg:flex" aria-hidden="true">
          {PEOPLE.map((p, i) => (
            <Photo key={p.id} p={p} eager className={`h-auto min-w-0 flex-1 object-contain object-bottom ${i ? "-ml-10" : ""}`} />
          ))}
        </div>
        <div className="grid gap-16 sm:grid-cols-2 lg:mt-8 lg:grid-cols-5 lg:gap-8">
          {PEOPLE.map((p) => (
            <div key={p.id} className="flex flex-col gap-2">
              <Photo p={p} mobile className="h-auto w-full object-contain lg:hidden" />
              <Kicker className="!text-action">{p.need}</Kicker>
              <h2 className="text-white">{p.name}</h2>
              <ContactLinks p={p} className="mt-1 text-base" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
