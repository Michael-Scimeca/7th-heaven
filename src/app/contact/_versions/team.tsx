"use client";
/* eslint-disable react-doctor/nextjs-no-img-element */
import { useState } from "react";
import type { CSSProperties } from "react";
import { PEOPLE, ContactLinks, EmailLink, PhoneLink, Kicker, Meta, MUTED, SECONDARY, KICKER, DISPLAY } from "./shared";
import type { Person } from "./shared";

export type GroupStyle = "fan" | "row" | "vee" | "twoRow" | "closeup" | "stairs" | "arc";
export type Placement = "left" | "right" | "top" | "bottom";
export type ListStyle = "numbered" | "need" | "giant" | "grid2" | "compact" | "blurb" | "columns";

export interface TeamCfg {
  title: string;
  idea: string;
  heading: string;
  sub: string;
  group: GroupStyle;
  placement: Placement;
  list: ListStyle;
  spotlight?: boolean;
  gray?: boolean;
  captions?: boolean;
  order?: string[];
}

/* Each cutout's head sits at ~49% of the image width, so people are placed
   by the x-position of their head (c), their height (h) and lift (b). */
interface Pos { c: number; h: number; b: number; z: number }
const C5 = [10, 30, 50, 70, 90];
const LAYOUTS: Record<GroupStyle, (i: number) => Pos> = {
  fan: (i) => ({ c: [16, 33, 50, 67, 84][i], h: [76, 80, 84, 80, 76][i], b: 0, z: 5 - Math.abs(2 - i) }),
  row: (i) => ({ c: C5[i], h: 64, b: 0, z: i }),
  vee: (i) => ({ c: [16, 33, 50, 67, 84][i], h: [62, 74, 88, 74, 62][i], b: 0, z: 5 - Math.abs(2 - i) }),
  twoRow: (i) =>
    i === 0 || i === 4
      ? { c: i === 0 ? 26 : 74, h: 68, b: 0, z: 6 }
      : { c: [0, 28, 50, 72][i], h: 58, b: 32, z: 2 },
  closeup: (i) => ({ c: [12, 31, 50, 69, 88][i], h: 118, b: -36, z: 5 - Math.abs(2 - i) }),
  stairs: (i) => ({ c: [14, 32, 50, 68, 86][i], h: [58, 66, 74, 82, 90][i], b: 0, z: i }),
  arc: (i) => ({ c: C5[i], h: 70, b: [0, 8, 12, 8, 0][i], z: [5, 4, 3, 4, 5][i] }),
};

function GroupShot({
  people,
  style,
  wide,
  active,
  gray,
  captions,
}: {
  people: Person[];
  style: GroupStyle;
  wide: boolean;
  active: string | null;
  gray?: boolean;
  captions?: boolean;
}) {
  if (style === "closeup") {
    // Close-up: one evenly spaced head-and-shoulders slot per person — no overlap.
    return (
      <figure className="grid w-full grid-cols-5 items-end gap-3 md:gap-4">
        {people.map((p) => {
          const dim = active !== null && active !== p.id;
          const on = active === p.id;
          return (
            <div key={p.id} className="flex flex-col items-center gap-3">
              <img
                src={p.photo}
                alt={`${p.name}, ${p.role}`}
                width={p.w}
                height={p.h}
                loading="eager"
                decoding="async"
                style={{ objectPosition: "49% 6%" }}
                className={`contact-rep-stage-mask w-full object-cover transition-[opacity,filter,transform] duration-500 ${wide ? "aspect-[4/5]" : "aspect-[3/5]"} ${on ? "-translate-y-2" : ""} ${dim ? `opacity-35 ${gray ? "grayscale" : ""}` : "opacity-100"}`}
              />
              {captions && (
                <span aria-hidden="true" className={`hidden text-center text-sm transition-colors md:block ${on ? "text-white" : MUTED}`}>
                  {p.name}
                </span>
              )}
            </div>
          );
        })}
      </figure>
    );
  }

  return (
    <figure className="w-full">
      <div
        className={`relative w-full overflow-hidden ${wide ? "aspect-[12/5]" : "aspect-[4/3]"}`}
        style={{
          maskImage: "linear-gradient(to bottom, #000 0%, #000 72%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 72%, transparent 100%)",
        }}
      >
        {people.map((p, i) => {
          const pos = LAYOUTS[style](i);
          const dim = active !== null && active !== p.id;
          const on = active === p.id;
          const s: CSSProperties = {
            left: `${pos.c}%`,
            bottom: `${pos.b}%`,
            height: `${pos.h}%`,
            zIndex: on ? 20 : pos.z,
            transform: `translateX(-49%) scale(${on ? 1.04 : 1})`,
            transformOrigin: "bottom center",
          };
          return (
            <img
              key={p.id}
              src={p.photo}
              alt={`${p.name}, ${p.role}`}
              width={p.w}
              height={p.h}
              loading="eager"
              decoding="async"
              style={s}
              className={`contact-rep-stage-mask absolute w-auto max-w-none object-contain transition-[opacity,filter,transform] duration-500 ${dim ? `opacity-35 ${gray ? "grayscale" : ""}` : "opacity-100"}`}
            />
          );
        })}
      </div>
      {captions && (
        <figcaption className="relative mt-3 hidden h-6 md:block" aria-hidden="true">
          {people.map((p, i) => (
            <span
              key={p.id}
              className={`absolute -translate-x-1/2 whitespace-nowrap text-sm transition-colors ${active === p.id ? "text-white" : MUTED}`}
              style={{ left: `${LAYOUTS[style](i).c}%` }}
            >
              {p.name}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}

function Item({
  p,
  active,
  onActive,
  className = "",
  children,
}: {
  p: Person;
  active: string | null;
  onActive?: (id: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const dim = active !== null && active !== p.id;
  return (
    <li
      onMouseEnter={onActive ? () => onActive(p.id) : undefined}
      onFocus={onActive ? () => onActive(p.id) : undefined}
      className={`transition-opacity duration-300 ${dim ? "opacity-40" : "opacity-100"} ${className}`}
    >
      {children}
    </li>
  );
}

function TeamList({
  people,
  style,
  active,
  onActive,
  onLeave,
}: {
  people: Person[];
  style: ListStyle;
  active: string | null;
  onActive?: (id: string) => void;
  onLeave?: () => void;
}) {
  const common = { active, onActive };
  switch (style) {
    case "numbered":
      return (
        <ol onMouseLeave={onLeave} className="flex flex-col gap-16">
          {people.map((p, i) => (
            <Item key={p.id} p={p} {...common} className="grid grid-cols-[3rem_1fr] gap-4">
              <span className={`pt-2 text-sm tabular-nums ${MUTED}`}>0{i + 1}</span>
              <div className="flex flex-col gap-2">
                <h2 className="text-white">{p.name}</h2>
                <Meta p={p} />
                <p className={MUTED}>{p.blurb}</p>
                <ContactLinks p={p} inline className="mt-2" />
              </div>
            </Item>
          ))}
        </ol>
      );
    case "need":
      return (
        <ul onMouseLeave={onLeave} className="flex flex-col gap-14">
          {people.map((p) => (
            <Item key={p.id} p={p} {...common} className="flex flex-col gap-2">
              <Kicker className="!text-action">{p.need}</Kicker>
              <h2 className="text-white">{p.name}</h2>
              <ContactLinks p={p} inline className="mt-1" />
            </Item>
          ))}
        </ul>
      );
    case "giant":
      return (
        <ul onMouseLeave={onLeave} className="flex flex-col gap-10">
          {people.map((p) => (
            <Item key={p.id} p={p} {...common} className="flex flex-col gap-2">
              <h2 className="text-white">
                <span className={`${DISPLAY} block leading-[0.95]`} style={{ fontSize: "clamp(2.75rem, 6vw, 6rem)" }}>
                  {p.name}
                </span>
              </h2>
              <p className={KICKER}>{p.need}</p>
              <ContactLinks p={p} inline className="mt-1" />
            </Item>
          ))}
        </ul>
      );
    case "grid2":
      return (
        <ul onMouseLeave={onLeave} className="grid gap-x-16 gap-y-14 md:grid-cols-2">
          {people.map((p) => (
            <Item key={p.id} p={p} {...common} className="flex flex-col gap-2">
              <Kicker className="!text-action">{p.need}</Kicker>
              <h2 className="text-white">{p.name}</h2>
              <Meta p={p} />
              <ContactLinks p={p} className="mt-2" />
            </Item>
          ))}
        </ul>
      );
    case "compact":
      return (
        <ul onMouseLeave={onLeave} className="flex flex-col gap-8">
          {people.map((p) => (
            <Item key={p.id} p={p} {...common} className="grid items-baseline gap-x-8 gap-y-1 md:grid-cols-[minmax(0,200px)_1fr_auto_auto]">
              <span className={KICKER}>{p.need}</span>
              <span className="text-xl font-semibold text-white">{p.name}</span>
              <EmailLink p={p} />
              <PhoneLink p={p} />
            </Item>
          ))}
        </ul>
      );
    case "blurb":
      return (
        <ul onMouseLeave={onLeave} className="flex flex-col gap-16">
          {people.map((p) => (
            <Item key={p.id} p={p} {...common} className="flex flex-col gap-3">
              <p className={`max-w-[48ch] text-xl text-white/85`}>{p.blurb}</p>
              <h2 className="text-white">{p.name}</h2>
              <Meta p={p} />
              <ContactLinks p={p} inline className="mt-1" />
            </Item>
          ))}
        </ul>
      );
    case "columns":
      return (
        <ul onMouseLeave={onLeave} className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {people.map((p) => (
            <Item key={p.id} p={p} {...common} className="flex flex-col gap-2">
              <Kicker className="!text-action">{p.need}</Kicker>
              <h2 className="text-white">{p.name}</h2>
              <ContactLinks p={p} className="mt-1 text-base" />
            </Item>
          ))}
        </ul>
      );
  }
}

export function TeamLayout({ cfg, people: peopleProp }: { cfg: TeamCfg; people?: Person[] }) {
  const base = peopleProp ?? PEOPLE;
  const people = cfg.order
    ? cfg.order.map((id) => base.find((p) => p.id === id)).filter((p): p is Person => Boolean(p))
    : base;
  // The first person (booking) starts in the spotlight; the last one hovered stays lit.
  const [hover, setHover] = useState<string | null>(people[0]?.id ?? null);
  const active = cfg.spotlight ? hover : null;
  const onActive = cfg.spotlight ? setHover : undefined;
  const onLeave = undefined;
  const wide = cfg.placement === "top" || cfg.placement === "bottom";

  const header = (
    <header className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-white">{cfg.heading}</h1>
      <p className={SECONDARY}>{cfg.sub}</p>
    </header>
  );
  const shot = (
    <GroupShot people={people} style={cfg.group} wide={wide} active={active} gray={cfg.gray} captions={cfg.captions} />
  );
  const list = <TeamList people={people} style={cfg.list} active={active} onActive={onActive} onLeave={onLeave} />;

  if (wide) {
    return (
      <div className="flex flex-col gap-16">
        {header}
        {cfg.placement === "top" ? (
          <>
            {shot}
            {list}
          </>
        ) : (
          <>
            {list}
            {shot}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-16 lg:grid-cols-2">
      <div className={`flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start ${cfg.placement === "right" ? "lg:order-2" : ""}`}>
        {header}
        {shot}
      </div>
      <div className="lg:pt-24">{list}</div>
    </div>
  );
}
