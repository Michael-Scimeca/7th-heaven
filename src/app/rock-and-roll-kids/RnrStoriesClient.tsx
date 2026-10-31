"use client";

/**
 * Rock 'n' Roll Kids — glowingcheetah.com layout.
 *
 * Transparent page (the site noise background shows through) with torn zigzag edges: a hero with the cast art and a giant
 * pale-yellow word, a gold-highlight statement, a two-column comic grid, a full-bleed
 * single player band, the "Beginnings." story, cast + founders cards, a photo
 * strip, the contact block and a giant wordmark.
 *
 * Other layouts: ?layout=circles (RnrProjectsClient), ?layout=classic (RockNRollKidsClient).
 */

import { useMemo, useState, type ReactNode } from "react";
import {
  ABOUT_DATA,
  getCharactersList,
  getFoundersList,
  getProductsList,
} from "./RockNRollKidsClient";
import "./rnr-stories.css";

/* ── comic edges ────────────────────────────────────────────────────────────
   Irregular burst-cut teeth. The same points drive the clip-path and an SVG
   ink line (black, plus a misregistered yellow print line) traced along the cut. */
type Pt = [number, number]; // [x %, depth px]

function edgePoints(amp: number, seed: number): Pt[] {
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const pts: Pt[] = [];
  let x = 0;
  let up = true;
  while (x < 100) {
    // uneven teeth: mostly small, now and then a big spike like a burst panel
    const big = rnd() > 0.82;
    const depth = up ? amp * (big ? 0.95 + rnd() * 0.05 : 0.38 + rnd() * 0.42) : amp * rnd() * 0.12;
    pts.push([Number(x.toFixed(2)), Number(depth.toFixed(1))]);
    x += 1.4 + rnd() * (big ? 1.2 : 2.6);
    up = !up;
  }
  pts.push([100, Number((amp * rnd() * 0.12).toFixed(1))]);
  return pts;
}

/** clip-path polygon for a comic cut on the top and/or bottom edge */
function comicClip(edge: "top" | "bottom" | "both", amp = 34, seed = 1): string {
  const pts = edgePoints(amp, seed);
  const ptsB = edgePoints(amp, seed + 17);
  const top = edge === "bottom" ? ["0% 0px", "100% 0px"] : pts.map(([x, y]) => `${x}% ${y}px`);
  const bottom =
    edge === "top"
      ? ["100% 100%", "0% 100%"]
      : [...ptsB].reverse().map(([x, y]) => `${x}% calc(100% - ${y}px)`);
  return `polygon(${[...top, ...bottom].join(", ")})`;
}

/** Ink line drawn along a comic cut (place inside the clipped element). */
function ComicInk({ edge, amp = 34, seed = 1 }: { edge: "top" | "bottom"; amp?: number; seed?: number }) {
  const pts = edge === "top" ? edgePoints(amp, seed) : edgePoints(amp, seed + 17);
  const line = pts.map(([x, y]) => `${x},${edge === "top" ? y : amp + 4 - y}`).join(" ");
  return (
    <svg
      className={`rnrs-ink rnrs-ink--${edge}`}
      viewBox={`0 0 100 ${amp + 4}`}
      preserveAspectRatio="none"
      style={{ height: amp + 4 }}
      aria-hidden="true"
    >
      <polyline className="rnrs-ink-print" points={line} vectorEffect="non-scaling-stroke" />
      <polyline className="rnrs-ink-line" points={line} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const Claws = ({ className = "" }: { className?: string }) => (
  <svg className={`rnrs-claws ${className}`} viewBox="0 0 400 520" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M${60 + i * 95} 10 C ${90 + i * 95} 120, ${70 + i * 95} 200, ${130 + i * 95} 300 S ${150 + i * 95} 440, ${215 + i * 95} 510 L ${200 + i * 95} 512 C ${135 + i * 95} 440, ${115 + i * 95} 330, ${95 + i * 95} 290 S ${55 + i * 95} 150, ${48 + i * 95} 14 Z`}
      />
    ))}
  </svg>
);

const Tag = ({ children }: { children: ReactNode }) => <span className="rnrs-tag">{children}</span>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RnrStoriesClient({ sanityContent }: { sanityContent: any }) {
  const comics = useMemo(() => getProductsList(sanityContent), [sanityContent]);
  const cast = useMemo(() => getCharactersList(sanityContent), [sanityContent]);
  const founders = useMemo(() => getFoundersList(sanityContent), [sanityContent]);
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="rnrs">
      {/* ── hero ─────────────────────────────────────────── */}
      <section className="rnrs-hero" style={{ clipPath: comicClip("bottom", 40, 3) }}>
        <div className="rnrs-hero-art" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/7hrrk/c-all.png" alt="" />
        </div>
        <span className="rnrs-halftone rnrs-halftone--bottom" aria-hidden="true" />
        <ComicInk edge="bottom" amp={40} seed={3} />
        <div className="rnrs-hero-type">
          <p className="rnrs-hero-kicker">The Rock &apos;n&apos; Roll</p>
          <h1 className="rnrs-hero-giant" aria-label="7th Heaven & the Rock 'n' Roll Kids">
            Kids
          </h1>
        </div>
      </section>

      <div className="rnrs-paper">
        <Claws className="rnrs-claws--intro" />

        {/* ── intro ──────────────────────────────────────── */}
        <section className="rnrs-wrap rnrs-intro">
          <h2 className="rnrs-heading">An animated series</h2>
          <p className="rnrs-statement">
            7th Heaven as kids, bringing fun, positivity and social consciousness to life through{" "}
            <b>comics</b>, <b>music</b> &amp; <b>animation</b>.
          </p>
        </section>

        {/* ── comics ─────────────────────────────────────── */}
        <section className="rnrs-wrap" aria-labelledby="rnrs-comics">
          <p className="rnrs-label" id="rnrs-comics">
            Our comic books <span>({String(comics.length).padStart(2, "0")})</span>
          </p>
          <div className="rnrs-grid">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(showAll ? comics : comics.slice(0, 6)).map((c: any, i: number) => (
              <article key={c.id ?? i} className="rnrs-card">
                <a className="rnrs-card-img" href={c.amazonUrl} target="_blank" rel="noopener noreferrer" aria-label={`${c.title} on Amazon`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="rnrs-card-cover" src={c.coverImg} alt={`${c.title} cover`} loading="lazy" />
                </a>
                <h3 className="rnrs-card-title">{c.title}</h3>
                <Tag>{c.badge}</Tag>
                <p className="rnrs-card-desc">{c.desc}</p>
                <a className="rnrs-link" href={c.amazonUrl} target="_blank" rel="noopener noreferrer">
                  Buy on Amazon <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
          {comics.length > 6 && (
            <button type="button" className="rnrs-more" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
              {showAll ? "Show fewer" : `Show all ${comics.length} books`}
            </button>
          )}
        </section>

        {/* ── beginnings ─────────────────────────────────── */}
        <section className="rnrs-wrap rnrs-story">
          <Claws className="rnrs-claws--story" />
          <h2 className="rnrs-heading">Beginnings.</h2>
          <p className="rnrs-statement">
            7th Heaven &amp; the Rock &apos;n&apos; Roll Kids is based on the band, as young kids who bring{" "}
            <b>positivity to other kids</b>.
          </p>
          <p className="rnrs-statement">
            Each episode is <strong>a problem, an adventure and a resolution</strong>, told through music and
            imagination.
          </p>
          <p className="rnrs-statement">
            In a world filled with so much negativity, we want to bring <b>a breath of fresh air</b> and help
            influence kids in a positive light through rock and roll.
          </p>
          <p className="rnrs-statement">
            It&apos;s growing into an animated TV series, comic books, games, apps, videos and{" "}
            <strong>original music</strong>, built with{" "}
            {ABOUT_DATA.studios.map((st, i) => (
              <span key={st.name}>
                <a href={st.url} target="_blank" rel="noopener noreferrer">
                  {st.name}
                </a>
                {i < ABOUT_DATA.studios.length - 2 ? ", " : i === ABOUT_DATA.studios.length - 2 ? " and " : "."}
              </span>
            ))}
          </p>
        </section>

        {/* ── cast ───────────────────────────────────────── */}
        <section className="rnrs-wrap" aria-labelledby="rnrs-cast">
          <p className="rnrs-label" id="rnrs-cast">
            The cast <span>({String(cast.length).padStart(2, "0")})</span>
          </p>
          <div className="rnrs-grid rnrs-grid--4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {cast.map((c: any, i: number) => (
              <article key={`${c.name}-${i}`} className="rnrs-card rnrs-card--person">
                <div className="rnrs-portrait">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.name} loading="lazy" />
                </div>
                <h3 className="rnrs-card-title">{c.name}</h3>
                <Tag>{c.role}</Tag>
                <p className="rnrs-card-desc">{c.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── team ───────────────────────────────────────── */}
        <section className="rnrs-wrap" aria-labelledby="rnrs-team">
          <p className="rnrs-label" id="rnrs-team">
            The team
          </p>
          <div className="rnrs-grid">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {founders.map((f: any, i: number) => (
              <article key={`${f.name}-${i}`} className="rnrs-card rnrs-card--person">
                <div className="rnrs-portrait rnrs-portrait--wide">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.desktopImg || f.mobileImg} alt={f.name} loading="lazy" />
                </div>
                <h3 className="rnrs-card-title">{f.name}</h3>
                <Tag>{f.role}</Tag>
                <p className="rnrs-card-desc">{f.desc}</p>
                {(f.email || f.phone) && (
                  <div className="rnrs-person-contact">
                    {f.email && (
                      <div>
                        <p className="rnrs-person-contact-label">Email</p>
                        <a className="rnrs-person-contact-link" href={`mailto:${f.email}`}>
                          {f.email}
                        </a>
                      </div>
                    )}
                    {f.phone && (
                      <div>
                        <p className="rnrs-person-contact-label">Call {f.name ? f.name.split(" ")[0] : ""}</p>
                        <a className="rnrs-person-contact-link" href={`tel:${f.phone.replace(/[^\d+]/g, "")}`}>
                          {f.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* ── photo strip ──────────────────────────────────── */}
      <div className="rnrs-strip" style={{ clipPath: comicClip("both", 30, 11) }} aria-hidden="true">
        <ComicInk edge="top" amp={30} seed={11} />
        <ComicInk edge="bottom" amp={30} seed={11} />
        <span className="rnrs-halftone rnrs-halftone--both" />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {comics.slice(0, 3).map((c: any, i: number) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={c.coverImg} alt="" loading="lazy" />
        ))}
      </div>

    </div>
  );
}
