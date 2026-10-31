"use client";

/**
 * Rock 'n' Roll Kids — federicopian.com/projects layout.
 *
 * Two columns of circle pairs (picture + glass label) move in opposite directions
 * with page scroll and loop endlessly. Title + count (left, doubles as the collection
 * switcher), range (right), a round step dial (bottom-left) and a caption that shows the
 * hovered item (bottom-right) stay fixed. Hovering an item recolors the noise background.
 *
 * The previous layout is still available at ?layout=classic (RockNRollKidsClient).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ABOUT_DATA,
  getCharactersList,
  getFoundersList,
  getMusicSinglesList,
  getProductsList,
} from "./RockNRollKidsClient";
import { FED_PALETTE_EVENT } from "@/lib/motionMode";
import "./rnr-projects.css";

type Item = {
  key: string;
  img: string;
  title: [string, string];
  kicker: string; // top of the label: "N. 01"
  foot: string; // bottom of the label
  caption: string; // bottom-right text on hover
  href?: string;
  palette: [string, string, string];
  contain?: boolean; // show the whole image (character art, covers)
};

type Collection = {
  id: string;
  label: [string, string]; // title, italic second line
  range: [string, string];
  note: string;
  items: Item[];
};

// hover palettes, built from the site's own hues
const PALS: [string, string, string][] = [
  ["#08040c", "#d4581e", "#8a16b5"],
  ["#05040e", "#2a2399", "#a51ee3"],
  ["#07030c", "#a51ee3", "#d4581e"],
  ["#04040f", "#2a2399", "#7b3cf0"],
  ["#08040b", "#d4581e", "#7b3cf0"],
  ["#06030c", "#8a16b5", "#2a2399"],
  ["#07040d", "#7b3cf0", "#d4581e"],
  ["#05030a", "#6a2a9e", "#a51ee3"],
];

const two = (n: number) => String(n).padStart(2, "0");

/** Split a title over two lines at the word boundary nearest the middle. */
function twoLines(t: string): [string, string] {
  const words = t.replace(/\s+/g, " ").trim().split(" ");
  if (words.length < 2) return [t, ""];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCollections(sanityContent: any): Collection[] {
  const products = getProductsList(sanityContent);
  const characters = getCharactersList(sanityContent);
  const singles = getMusicSinglesList(sanityContent);
  const founders = getFoundersList(sanityContent);

  return [
    {
      id: "comics",
      label: ["Comic", "books"],
      range: ["Ep. 01", "Vol. 01"],
      note: "Printed comics & e-books. Tap a cover to buy it on Amazon.",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: products.map((p: any, i: number) => ({
        key: `c-${p.id ?? i}`,
        img: p.coverImg,
        title: twoLines(String(p.title).replace(/^Comic Book - /, "Comic Book ")),
        kicker: `N. ${two(i + 1)}`,
        foot: p.badge || p.ep || "Comic",
        caption: p.desc,
        href: p.amazonUrl,
        palette: PALS[i % PALS.length],
      })),
    },
    {
      id: "cast",
      label: ["The", "cast"],
      range: ["Kids", "& crew"],
      note: "The band as kids, plus the crew and the villain.",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: characters.map((c: any, i: number) => ({
        key: `k-${i}`,
        img: c.image,
        title: twoLines(c.name),
        kicker: `N. ${two(i + 1)}`,
        foot: c.role,
        caption: c.desc,
        palette: PALS[(i + 3) % PALS.length],
        contain: true,
      })),
    },
    {
      id: "singles",
      label: ["Animated", "singles"],
      range: ["Season", "One"],
      note: "Animated music videos. Tap one to watch it on YouTube.",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: singles.map((s: any, i: number) => ({
        key: `s-${s.id}`,
        img: `https://img.youtube.com/vi/${s.id}/hqdefault.jpg`,
        title: twoLines(s.title),
        kicker: `N. ${two(i + 1)}`,
        foot: s.tag || "Single",
        caption: s.desc,
        href: s.youtubeUrl,
        palette: PALS[(i + 5) % PALS.length],
      })),
    },
    {
      id: "founders",
      label: ["Series", "founders"],
      range: ["RNR", "Studios"],
      note: ABOUT_DATA.paragraph1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: founders.map((f: any, i: number) => ({
        key: `f-${i}`,
        img: f.desktopImg || f.mobileImg,
        title: twoLines(f.name),
        kicker: `N. ${two(i + 1)}`,
        foot: f.role,
        caption: [f.desc, f.email, f.phone].filter(Boolean).join(" · "),
        href: f.email ? `mailto:${f.email}` : undefined,
        palette: PALS[(i + 1) % PALS.length],
        contain: true,
      })),
    },
  ];
}

const SPEED = 0.55; // column travel per px of scroll
const SCREENS = 8; // scroll length of the section, in viewports

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RnrProjectsClient({ sanityContent }: { sanityContent: any }) {
  const collections = useMemo(() => buildCollections(sanityContent), [sanityContent]);
  const [cIndex, setCIndex] = useState(0);
  const col = collections[cIndex];
  const [hover, setHover] = useState<Item | null>(null);
  const [counter, setCounter] = useState<[number, number]>([1, 2]);

  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef(0); // height of one item pair
  const offRef = useRef(0);

  // alternate items between the columns, like N.01 left / N.02 right
  const [left, right] = useMemo(() => {
    const l: Item[] = [];
    const r: Item[] = [];
    col.items.forEach((it, i) => (i % 2 ? r : l).push(it));
    if (!r.length) r.push(...l); // single-item safety
    return [l, r];
  }, [col]);

  // scroll-driven, opposite-direction, looping columns
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const sec = sectionRef.current;
      const L = leftRef.current;
      const R = rightRef.current;
      if (!sec || !L || !R) return;
      const first = L.querySelector<HTMLElement>(".rnrp-item");
      if (!first) return;
      const unit = first.offsetHeight + parseFloat(getComputedStyle(L).rowGap || "0");
      unitRef.current = unit;
      const y = Math.max(0, window.scrollY - sec.offsetTop);
      const off = y * SPEED;
      offRef.current = off;
      const loopL = unit * left.length;
      const loopR = unit * right.length;
      const l = ((off % loopL) + loopL) % loopL;
      const r = ((off % loopR) + loopR) % loopR;
      L.style.transform = `translate3d(0, ${-l}px, 0)`;
      R.style.transform = `translate3d(0, ${r - loopR}px, 0)`;
      // which pair sits at the vertical center
      const centre = window.innerHeight / 2;
      const li = Math.floor((l + centre) / unit) % left.length;
      const ri = (((Math.floor((loopR - r + centre) / unit)) % right.length) + right.length) % right.length;
      const a = li * 2 + 1;
      const b = Math.min(col.items.length, ri * 2 + 2);
      setCounter((prev) => (prev[0] === a && prev[1] === b ? prev : [a, b]));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [left.length, right.length, col.items.length]);

  const step = useCallback((dir: 1 | -1) => {
    const unit = unitRef.current || 300;
    const delta = (unit / SPEED) * dir;
    const lenis = (window as unknown as { __lenis?: { scrollTo: (v: number, o?: object) => void } }).__lenis;
    const target = window.scrollY + delta;
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  const switchTo = useCallback(
    (i: number) => {
      if (i === cIndex) return;
      setCIndex(i);
      setHover(null);
      window.dispatchEvent(new CustomEvent(FED_PALETTE_EVENT, { detail: { palette: null } }));
      const sec = sectionRef.current;
      if (sec && window.scrollY > sec.offsetTop) {
        const lenis = (window as unknown as { __lenis?: { scrollTo: (v: number, o?: object) => void } }).__lenis;
        if (lenis) lenis.scrollTo(sec.offsetTop, { immediate: true, force: true });
        else window.scrollTo(0, sec.offsetTop);
      }
    },
    [cIndex],
  );

  const enter = (it: Item) => {
    setHover(it);
    window.dispatchEvent(new CustomEvent(FED_PALETTE_EVENT, { detail: { palette: it.palette } }));
  };
  const leave = () => {
    setHover(null);
    window.dispatchEvent(new CustomEvent(FED_PALETTE_EVENT, { detail: { palette: null } }));
  };
  useEffect(
    () => () => {
      window.dispatchEvent(new CustomEvent(FED_PALETTE_EVENT, { detail: { palette: null } }));
    },
    [],
  );

  const renderItem = (it: Item, copy: number) => {
    const body = (
      <>
        <span className={`rnrp-pic${it.contain ? " rnrp-pic--art" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.img} alt="" loading={copy === 0 ? "eager" : "lazy"} draggable={false} />
        </span>
        <span className="rnrp-label">
          <span className="rnrp-ring" aria-hidden="true">
            <span className="rnrp-dot rnrp-dot--a" />
            <span className="rnrp-dot rnrp-dot--b" />
          </span>
          <span className="rnrp-micro">{it.kicker}</span>
          <span className="rnrp-name">
            {it.title[0]}
            {it.title[1] && (
              <>
                <br />
                {it.title[1]}
              </>
            )}
          </span>
          <span className="rnrp-micro rnrp-foot">{it.foot}</span>
        </span>
      </>
    );
    const common = {
      className: "rnrp-item",
      onMouseEnter: () => enter(it),
      onMouseLeave: leave,
      onFocus: () => enter(it),
      onBlur: leave,
      "aria-hidden": copy > 0 ? true : undefined,
      tabIndex: copy > 0 ? -1 : undefined,
    };
    return it.href ? (
      <a key={`${it.key}-${copy}`} href={it.href} target={it.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" aria-label={`${it.title.join(" ")} — ${it.foot}`} {...common}>
        {body}
      </a>
    ) : (
      <div key={`${it.key}-${copy}`} role="group" aria-label={`${it.title.join(" ")} — ${it.foot}`} {...common} tabIndex={copy > 0 ? -1 : 0}>
        {body}
      </div>
    );
  };

  const [a, b] = counter;

  return (
    <section ref={sectionRef} className="rnrp" style={{ height: `${SCREENS * 100}vh` }} aria-label="Rock 'n' Roll Kids">
      <div className="rnrp-stage">
        {/* columns */}
        <div className="rnrp-cols" data-no-text-anim>
          <div className="rnrp-col">
            <div ref={leftRef} className="rnrp-track" key={`l-${col.id}`}>
              {[0, 1, 2].map((copy) => left.map((it) => renderItem(it, copy)))}
            </div>
          </div>
          <div className="rnrp-col">
            <div ref={rightRef} className="rnrp-track" key={`r-${col.id}`}>
              {[0, 1, 2].map((copy) => right.map((it) => renderItem(it, copy)))}
            </div>
          </div>
        </div>

        {/* title + collection switcher */}
        <div className="rnrp-title">
          <h1 key={col.id} className="rnrp-h1">
            {col.label[0]}
            <sup>({two(col.items.length)})</sup>
            <br />
            <i>{col.label[1]}</i>
          </h1>
          <p className="rnrp-micro rnrp-kicker">7th Heaven &amp; the Rock &apos;n&apos; Roll Kids</p>
          <div className="rnrp-switch" role="tablist" aria-label="Collections" data-no-text-anim>
            {collections.map((c, i) => (
              <button key={c.id} type="button" role="tab" aria-selected={i === cIndex} onClick={() => switchTo(i)}>
                {c.label[0]} {c.label[1]} <span>({two(c.items.length)})</span>
              </button>
            ))}
          </div>
        </div>

        {/* range */}
        <div className="rnrp-range" aria-hidden="true">
          <span>{col.range[0]}</span>
          <i className="rnrp-slash" />
          <span>{col.range[1]}</span>
        </div>

        {/* step dial */}
        <div className="rnrp-dial" data-no-text-anim>
          <span className="rnrp-micro">{col.label[0]}</span>
          <button type="button" className="rnrp-arrow rnrp-arrow--l" onClick={() => step(-1)} aria-label="Previous">
            ←
          </button>
          <span className="rnrp-num rnrp-num--a" aria-live="polite">
            <span key={a}>{a}</span>
          </span>
          <i className="rnrp-dial-slash" />
          <span className="rnrp-num rnrp-num--b">
            <span key={b}>{b}</span>
          </span>
          <button type="button" className="rnrp-arrow rnrp-arrow--r" onClick={() => step(1)} aria-label="Next">
            →
          </button>
          <span className="rnrp-micro">Navigation</span>
        </div>

        {/* caption */}
        <p className="rnrp-caption rnrp-micro" aria-live="polite" data-no-text-anim>
          {hover ? hover.caption : col.note}
        </p>
      </div>
    </section>
  );
}
