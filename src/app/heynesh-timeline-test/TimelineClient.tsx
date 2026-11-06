/* eslint-disable react-doctor/prefer-html-dialog */
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Timeline.module.css";

gsap.registerPlugin(ScrollTrigger);

type Entry = {
  year: string;
  title: string;
  summary: string;
  full: string;
  handle: string;
  ago: string;
  photos: string[];
  /** main photo for this point in the timeline (placeholder 7th Heaven shots for now) */
  image: string;
  /** desktop placement, measured from heynesh.com: left as % of the board, top in board-width units */
  left: number;
  top: number;
};

const P = "/images/members/";

// Placeholder copy from heynesh.com's journey section, so the layout reads like the original.
const ENTRIES: Entry[] = [
  { year: "'19", title: "Starting out with my brother", summary: "My brother Stefan showed me Webflow. I bothered him with questions for three months straight.", full: "My brother Stefan, a UX designer, opened Webflow and created something right in front of me. I had no idea what I was doing but I couldn't close the laptop. No master plan, no career goal. Three months of late nights and annoying questions later, I knew this was it.", handle: "@stefan", ago: "7 years ago", photos: ["adam.webp", "mark.webp"], image: "/images/hero/band-performance.webp", left: 69.9, top: 0 },
  { year: "'20", title: "First freelance steps", summary: "First real client. First real panic. Working for yourself and for someone else are completely different.", full: "Practicing on my own was comfortable. Then someone trusted me with their project and suddenly every pixel mattered in a way it didn't before. That first year of client work taught me more than six months of practice ever did.", handle: "@webflow", ago: "6 years ago", photos: ["frankie.webp", "dicky.webp"], image: "/images/media/video-frames/t_4p4Fdb9yY.jpg", left: 16.6, top: 32.4 },
  { year: "'21", title: "Beyond what I knew", summary: "A biotech project that made me think this isn't possible in Webflow. Turns out it was.", full: "When the brief for a biotech site landed, my first thought was that it couldn't be done in Webflow. The design demanded pixel-perfect execution and I had to teach myself JavaScript mid-project. Scariest project I ever took on, and the one that changed how I approach everything after it.", handle: "@fiftyseven", ago: "5 years ago", photos: ["mark.webp"], image: "/images/media/video-frames/udUpEgchlck.jpg", left: 9.4, top: 69.9 },
  { year: "'22", title: "Leveling up", summary: "The year animations and CMS stopped being extras and started shaping how every project feels.", full: "GSAP went from something I used occasionally to something that shaped every project. Animations weren't decoration anymore, they were part of how a site communicates. Everything I worked on this year started feeling more intentional.", handle: "@gsap", ago: "4 years ago", photos: ["adam.webp", "frankie.webp"], image: "/images/fans/fan-photo-featured.jpg", left: 59.2, top: 99.6 },
  { year: "'23", title: "From trust to referrals", summary: "No pitch. No portfolio review. Just clients telling people 'work with him.' That hit different.", full: "Clients came back with new projects. Some recommended me to people I'd never met. No interview, no portfolio walkthrough. That kind of trust isn't something you can put in a case study, but it's the thing I'm most proud of.", handle: "@clients", ago: "3 years ago", photos: ["dicky.webp", "mark.webp"], image: "/images/media/video-frames/C0PQYmyaTFk.jpg", left: 52.0, top: 136.3 },
  { year: "'24", title: "A life-changing year", summary: "Got married. My daughter was born. Suddenly everything I do has a deeper reason behind it.", full: "Before this year I thought I understood what motivation meant. I had no idea. Nothing makes you sharper at work than knowing exactly who you're coming home to.", handle: "@family", ago: "2 years ago", photos: ["frankie.webp", "adam.webp"], image: "/images/cruise/hero-video-poster.jpg", left: 5.3, top: 159.9 },
  { year: "'26", title: "The journey continues", summary: "Seven years in. Still obsessed. Now figuring out how AI fits into what I do.", full: "The industry doesn't stand still and neither do I. After seven years of working, learning, and evolving, AI has opened up a whole new layer of what's possible. Same obsession, new tools. The best work is still ahead.", handle: "@nenad", ago: "2 hours ago", photos: ["mark.webp"], image: "/images/album/be-here.png", left: 41.0, top: 194.2 },
];

// Card is 30.1% of the board wide; its centre is used as the line's anchor point.
const CARD_W = 30.1;
const CARD_H = 35; // board-width units, card height including its photo
const BOARD_H = 240; // board height in board-width units

// A loose, hand-drawn-feeling curve through every card centre (viewBox 1000 wide).
function buildPath() {
  const pts = ENTRIES.map((e) => [(e.left + CARD_W / 2) * 10, (e.top + CARD_H / 2) * 10]);
  let d = `M ${pts[0][0]} ${pts[0][1] - 180}`;
  d += ` C ${pts[0][0] + 40} ${pts[0][1] - 90}, ${pts[0][0] - 30} ${pts[0][1] - 40}, ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const dy = y1 - y0;
    // swing out past the cards before curving in, like the original's loose loops
    const swing = (i % 2 ? -1 : 1) * 120;
    d += ` C ${x0 + swing} ${y0 + dy * 0.45}, ${x1 - swing} ${y1 - dy * 0.55}, ${x1} ${y1}`;
  }
  const last = pts[pts.length - 1];
  d += ` C ${last[0] + 60} ${last[1] + 80}, ${last[0] + 10} ${last[1] + 160}, ${last[0] + 40} ${last[1] + 220}`;
  return d;
}

const PATH = buildPath();

function Card({ e, onOpen }: { e: Entry; onOpen: () => void }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardImage}>
        <img src={e.image} alt={`7th Heaven, ${e.year}`} loading="lazy" />
      </div>
      <p className={styles.year}>{e.year}</p>
      <h3 className={styles.cardHeading}>{e.title}</h3>
      <p className={styles.summary}>{e.summary}</p>
      <div className={styles.bottom}>
        <div className={styles.bottomLeft}>
          <div className={styles.photos}>
            {e.photos.map((src, i) => (
              <img key={src} src={P + src} alt="" className={styles.photo} style={{ zIndex: e.photos.length - i }} />
            ))}
          </div>
          <p className={styles.handle}>
            {e.handle}
            <br />
            {e.ago}
          </p>
        </div>
        <button type="button" className={styles.readMore} onClick={onOpen}>
          Read more
        </button>
      </div>
    </article>
  );
}

export default function TimelineClient() {
  const boardRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Entry | null>(null);

  useEffect(() => {
    const board = boardRef.current;
    const reveal = revealRef.current;
    if (!board || !reveal) return;

    const ctx = gsap.context(() => {
      // the solid line is uncovered by growing its clip height as you scroll the board
      gsap.fromTo(
        reveal,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: { trigger: board, start: "top 70%", end: "bottom 60%", scrub: true },
        },
      );

      // heading lines rise out of their masks, like the original's line-mask reveal
      const lines = headRef.current?.querySelectorAll("[data-line]");
      if (lines?.length) {
        gsap.from(lines, {
          yPercent: 110,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: headRef.current, start: "top 80%" },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden />

      <section className={styles.section}>
        <div ref={headRef} className={styles.head}>
          <span className={styles.label}>Start small grow big</span>
          <h2 className={styles.h2}>
            <span className={styles.mask}>
              <span data-line>About Me (&amp;)</span>
            </span>
            <span className={styles.mask}>
              <span data-line>My Journey</span>
            </span>
          </h2>
          <p className={styles.intro}>
            Seven years ago I opened Webflow for the first time. What happened after that is easier to show than explain.
          </p>
        </div>

        <div ref={boardRef} className={styles.board} style={{ ["--board-h" as string]: BOARD_H }}>
          <svg className={styles.lineBase} viewBox={`0 0 1000 ${BOARD_H * 10}`} preserveAspectRatio="none" aria-hidden>
            <path d={PATH} />
          </svg>
          <div ref={revealRef} className={styles.lineReveal} aria-hidden>
            <svg className={styles.lineSolid} viewBox={`0 0 1000 ${BOARD_H * 10}`} preserveAspectRatio="none">
              <path d={PATH} />
            </svg>
          </div>

          {ENTRIES.map((e) => (
            <div
              key={e.year}
              className={styles.slot}
              style={{ ["--left" as string]: e.left, ["--top" as string]: e.top }}
            >
              <Card e={e} onOpen={() => setOpen(e)} />
            </div>
          ))}
        </div>
      </section>

      {open && (
        <div className={styles.popupBackdrop} onClick={() => setOpen(null)} role="presentation">
          <div className={styles.popup} role="dialog" aria-modal="true" aria-label={open.title} onClick={(ev) => ev.stopPropagation()}>
            <button type="button" className={styles.close} onClick={() => setOpen(null)} aria-label="Close">
              ×
            </button>
            <p className={styles.popupYear}>{open.year}</p>
            <div className={styles.popupImage}>
              <img src={open.image} alt={`7th Heaven, ${open.year}`} />
            </div>
            <h3 className={styles.cardHeading}>{open.title}</h3>
            <p className={styles.popupText}>{open.full}</p>
          </div>
        </div>
      )}
    </main>
  );
}
