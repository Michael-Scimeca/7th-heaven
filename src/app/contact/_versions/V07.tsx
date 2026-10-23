"use client";
import { useState } from "react";
import { PEOPLE, Photo, ContactLinks, Kicker, Meta, MUTED, DISPLAY } from "./shared";

/** Giant name index: huge names are the menu; the chosen one opens beside. */
export default function V07() {
  const [active, setActive] = useState(0);
  const p = PEOPLE[active];
  return (
    <div className="grid gap-16 lg:grid-cols-12">
      <div className="flex flex-col gap-6 lg:col-span-7">
        <Kicker>Contact — pick a name</Kicker>
        <h1 className="sr-only">Contact</h1>
        <ul className="flex flex-col">
          {PEOPLE.map((x, i) => (
            <li key={x.id}>
              <button
                type="button"
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={`${DISPLAY} text-left leading-[0.95] transition-colors hover:text-white ${i === active ? "!text-white" : "!text-white/25"}`}
                style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}
              >
                {x.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <aside aria-live="polite" className="flex flex-col gap-4 lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
        <Photo key={p.id} p={p} eager className="h-auto w-full object-contain object-bottom" />
        <Kicker className="!text-action">{p.need}</Kicker>
        <Meta p={p} />
        <p className={MUTED}>{p.blurb}</p>
        <ContactLinks p={p} linkClassName="text-xl" />
      </aside>
    </div>
  );
}
