"use client";
import { useState } from "react";
import { PEOPLE, Intro, Photo, ContactLinks, Meta } from "./shared";

/** Hover stage, refined: list left, the active person's portrait right. */
export default function V05() {
  const [active, setActive] = useState(PEOPLE[0].id);
  return (
    <>
      <Intro title="Contact" sub="Hover or tab through the team — their portrait follows." />
      <div className="grid gap-16 lg:grid-cols-12">
        <ul className="flex flex-col gap-14 lg:col-span-5">
          {PEOPLE.map((p) => {
            const on = active === p.id;
            return (
              <li
                key={p.id}
                onMouseEnter={() => setActive(p.id)}
                onFocus={() => setActive(p.id)}
                className={`flex flex-col gap-2 transition-opacity duration-300 ${on ? "opacity-100" : "lg:opacity-50"}`}
              >
                <h2 className="text-white">{p.name}</h2>
                <Meta p={p} />
                <ContactLinks p={p} className="mt-2" />
                <Photo p={p} mobile className="mt-4 h-auto w-full object-contain lg:hidden" />
              </li>
            );
          })}
        </ul>
        <div className="relative hidden lg:col-span-7 lg:block">
          <div className="sticky top-[calc(var(--header-height,80px)+2rem)] aspect-[1074/768] w-full">
            {PEOPLE.map((p, i) => (
              <Photo
                key={p.id}
                p={p}
                eager={i === 0}
                className={`absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-500 ${active === p.id ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
