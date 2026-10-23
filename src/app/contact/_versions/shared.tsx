/* eslint-disable react-doctor/nextjs-no-img-element */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type Moment = "before" | "showday" | "road";

export interface Person {
  id: string;
  name: string;
  first: string;
  role: string;
  company: string | null;
  need: string;
  audience: string;
  blurb: string;
  moment: Moment;
  email: string;
  phone: string;
  tel: string;
  photo: string;
  photoMobile: string;
  w: number;
  h: number;
}

export const PEOPLE: Person[] = [
  {
    id: "dickie",
    name: "Rich Hofherr",
    first: "Rich",
    role: "Booking",
    company: "NTD Management",
    need: "Book a show",
    audience: "Promoter, buyer or venue",
    blurb: "Festivals, county fairs, casinos, corporate galas and private parties.",
    moment: "before",
    email: "info@NTDManagement.com",
    phone: "847-551-5363",
    tel: "+18475515363",
    photo: "/images/contact/dickie-contact.webp",
    photoMobile: "/images/contact/dickie-contact-mobile.webp",
    w: 1074,
    h: 768,
  },
  {
    id: "lenny",
    name: "Lenny Rago",
    first: "Lenny",
    role: "Press • Media",
    company: "NTD Records",
    need: "Press & media",
    audience: "Journalist, radio or TV",
    blurb: "Radio and TV appearances, podcasts, press credentials, photos and feature stories.",
    moment: "before",
    email: "LRago@NTDRecords.com",
    phone: "847-269-6200",
    tel: "+18472696200",
    photo: "/images/contact/lenny-contact.webp",
    photoMobile: "/images/contact/lenny-contact-mobile.webp",
    w: 1074,
    h: 768,
  },
  {
    id: "jeff",
    name: "Jeff Dobbs",
    first: "Jeff",
    role: "Technical • Production • Advance",
    company: null,
    need: "Production & tech",
    audience: "Production manager or engineer",
    blurb: "Technical riders, stage plots, patch lists, lighting and power specs.",
    moment: "showday",
    email: "jeffdobbs64@yahoo.com",
    phone: "847-772-5333",
    tel: "+18477725333",
    photo: "/images/contact/jeff-contact.webp",
    photoMobile: "/images/contact/jeff-contact-mobile.webp",
    w: 1074,
    h: 768,
  },
  {
    id: "alan",
    name: "Alan McRae",
    first: "Alan",
    role: "Advance • Non-technical",
    company: "NTD Management",
    need: "Show advance",
    audience: "Event or venue coordinator",
    blurb: "Non-technical show advance and day-of coordination.",
    moment: "showday",
    email: "Alan@NTDManagement.com",
    phone: "630-842-9129",
    tel: "+16308429129",
    photo: "/images/contact/alan-contact.webp",
    photoMobile: "/images/contact/alan-contact-mobile.webp",
    w: 1074,
    h: 688,
  },
  {
    id: "mary",
    name: "Mary Grivas",
    first: "Mary",
    role: "Cruise • Excursions • Hotels & Air",
    company: "NTD Vacations",
    need: "Cruise & travel",
    audience: "Fan planning a trip",
    blurb: "Cabins, VIP concert passes, group rates, airfare, hotels and travel insurance.",
    moment: "road",
    email: "Mary@NTDVacations.com",
    phone: "877-683-9753 Ext 5",
    tel: "+18776839753,5",
    photo: "/images/contact/mary-contact.webp",
    photoMobile: "/images/contact/mary-contact-mobile.webp",
    w: 1074,
    h: 768,
  },
];

export const MOMENTS: { id: Moment; step: string; title: string }[] = [
  { id: "before", step: "01 — Before the show", title: "Booking & press" },
  { id: "showday", step: "02 — Show day", title: "Production" },
  { id: "road", step: "03 — On the road", title: "Fan travel" },
];

/* ── Style tokens (no cards, borders or boxed padding) ── */
export const LINK =
  "text-action transition-colors hover:text-action-hover hover:underline underline-offset-4 decoration-action/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ring rounded-[var(--radius-xs)] w-fit";
export const MUTED = "text-[color:var(--color-text-muted)]";
export const SECONDARY = "text-[color:var(--color-text-secondary)]";
export const KICKER = "text-sm uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]";
export const DISPLAY = "font-[family-name:var(--font-display)] uppercase text-white";

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`${KICKER} ${className}`}>{children}</p>;
}

export function Meta({ p, className = "" }: { p: Person; className?: string }) {
  return (
    <p className={`${KICKER} ${className}`}>
      {p.role}
      {p.company ? ` • ${p.company}` : ""}
    </p>
  );
}

export function EmailLink({ p, className = "" }: { p: Person; className?: string }) {
  return (
    <a href={`mailto:${p.email}`} aria-label={`Email ${p.name}: ${p.email}`} className={`${LINK} break-all ${className}`}>
      {p.email}
    </a>
  );
}

export function PhoneLink({ p, className = "" }: { p: Person; className?: string }) {
  return (
    <a href={`tel:${p.tel}`} aria-label={`Call ${p.name}: ${p.phone}`} className={`${LINK} tabular-nums whitespace-nowrap ${className}`}>
      {p.phone}
    </a>
  );
}

export function ContactLinks({
  p,
  inline = false,
  className = "",
  linkClassName = "",
}: {
  p: Person;
  inline?: boolean;
  className?: string;
  linkClassName?: string;
}) {
  return (
    <address className={`not-italic flex ${inline ? "flex-row flex-wrap gap-x-8 gap-y-2" : "flex-col gap-1"} ${className}`}>
      <EmailLink p={p} className={linkClassName} />
      <PhoneLink p={p} className={linkClassName} />
    </address>
  );
}

export function Photo({
  p,
  className = "",
  eager = false,
  mobile = false,
  fade = true,
  style,
}: {
  p: Person;
  className?: string;
  eager?: boolean;
  mobile?: boolean;
  fade?: boolean;
  style?: CSSProperties;
}) {
  return (
    <img
      src={mobile ? p.photoMobile : p.photo}
      alt={`${p.name}, ${p.role}`}
      width={p.w}
      height={p.h}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={style}
      className={`${fade ? "contact-rep-stage-mask" : ""} ${className}`}
    />
  );
}

export function Intro({
  kicker = "Contact",
  title,
  sub,
  className = "",
}: {
  kicker?: string;
  title: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`flex max-w-3xl flex-col gap-4 ${className}`}>
      <Kicker>{kicker}</Kicker>
      <h1 className="text-white">{title}</h1>
      {sub && <p className={`max-w-[60ch] ${SECONDARY}`}>{sub}</p>}
    </header>
  );
}

export function VersionNav({ n, total, title }: { n: number; total: number; title: string }) {
  const prev = n > 1 ? n - 1 : total;
  const next = n < total ? n + 1 : 1;
  return (
    <nav
      aria-label="Layout versions"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-full bg-black/75 px-5 py-2 text-sm text-white backdrop-blur"
    >
      <Link href={`/contact/version-${prev}`} className="transition-colors hover:text-action">
        ← {prev}
      </Link>
      <Link href="/contact/versions" className="transition-colors hover:text-action">
        {n}/{total} · {title}
      </Link>
      <Link href={`/contact/version-${next}`} className="transition-colors hover:text-action">
        {next} →
      </Link>
    </nav>
  );
}
