"use client";
import { useState } from "react";
import { PEOPLE, Intro, Photo, ContactLinks, Meta, MUTED } from "./shared";

/** Department tabs: text-only tabs, one person at a time. */
export default function V09() {
  const [active, setActive] = useState(0);
  const p = PEOPLE[active];
  return (
    <>
      <Intro title="Contact" sub="Choose a department." />
      <div className="flex flex-col gap-16">
        <div role="tablist" aria-label="Departments" className="flex flex-wrap gap-x-10 gap-y-4">
          {PEOPLE.map((x, i) => (
            <button
              key={x.id}
              role="tab"
              type="button"
              id={`tab-${x.id}`}
              aria-selected={i === active}
              aria-controls="dept-panel"
              onClick={() => setActive(i)}
              className={`min-h-11 text-lg font-semibold underline-offset-[10px] transition-colors hover:text-white ${i === active ? "text-white underline decoration-action decoration-2" : "text-white/50"}`}
            >
              {x.need}
            </button>
          ))}
        </div>
        <section id="dept-panel" role="tabpanel" aria-labelledby={`tab-${p.id}`} className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="text-white">{p.name}</h2>
            <Meta p={p} />
            <p className={`max-w-[45ch] ${MUTED}`}>{p.blurb}</p>
            <ContactLinks p={p} className="mt-4" linkClassName="text-2xl font-semibold" />
          </div>
          <Photo key={p.id} p={p} eager className="h-auto w-full object-contain object-bottom" />
        </section>
      </div>
    </>
  );
}
