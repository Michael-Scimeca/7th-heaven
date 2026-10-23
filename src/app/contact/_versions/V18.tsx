"use client";
import { useState } from "react";
import { PEOPLE, Photo, ContactLinks, Meta, Kicker, MUTED } from "./shared";

/** Chooser: "I am a…" — the visitor picks who they are, we show their person. */
export default function V18() {
  const [active, setActive] = useState<number | null>(null);
  const p = active === null ? null : PEOPLE[active];
  return (
    <div className="grid gap-16 lg:grid-cols-2">
      <div className="flex flex-col gap-8">
        <h1 className="text-white">I am a…</h1>
        <ul className="flex flex-col gap-2">
          {PEOPLE.map((x, i) => (
            <li key={x.id}>
              <button
                type="button"
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                className={`min-h-12 text-left text-2xl font-semibold transition-colors hover:text-white md:text-3xl ${i === active ? "text-white" : "text-white/45"}`}
              >
                {x.audience}
                {i === active && <span className="text-action"> →</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div aria-live="polite" className="flex flex-col gap-3">
        {p ? (
          <>
            <Photo key={p.id} p={p} eager className="h-auto w-full object-contain object-bottom" />
            <Kicker className="!text-action">Your contact</Kicker>
            <h2 className="text-white">{p.name}</h2>
            <Meta p={p} />
            <p className={MUTED}>{p.blurb}</p>
            <ContactLinks p={p} className="mt-2" linkClassName="text-2xl font-semibold" />
          </>
        ) : (
          <p className={`text-xl ${MUTED} lg:pt-28`}>Pick one and we&apos;ll show you exactly who to reach.</p>
        )}
      </div>
    </div>
  );
}
