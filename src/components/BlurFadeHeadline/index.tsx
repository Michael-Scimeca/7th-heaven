"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./BlurFadeHeadline.module.css";

// Staggered blur fade-in headline with images that pop into the gaps between
// words (pattern taken from mobbin.com's hero). Used by the preloader and by
// /blur-fade-test.
//
// Sequence: each line rises out of a blur -> the gap between its words opens
// -> an image pops into the gap, blurred and shrunk to sharp. When
// `interactive`, images then keep cycling on a timer or on click.

// Images for each gap; the first of each set is the one shown on load.
const SLOT_IMAGES = [
  ["/images/album/be-here.png", "/images/album/luminous.png", "/images/album/colot-in-motion.png"],
  ["/images/members/nick.webp", "/images/members/mark.webp", "/images/members/adam.webp"],
  ["/images/members/frankie.webp", "/images/members/dicky.webp", "/images/members/tony-mobile.webp"],
];

// [word before the gap, word after the gap]
const LINES: [string, string][] = [
  ["Forty", "years"],
  ["of", "Chicago"],
  ["rock", "& roll"],
];

// Base timings (ms) at timeScale 1.
const LINE_DURATION = 900;
const LINE_STAGGER = 120;
const SLOT_OPEN_AT = 1100;
const SLOT_STAGGER = 140;
const SLOT_DURATION = 700;
const ICON_OFFSET = 90;
const ICON_DURATION = 650;
const CYCLE_MS = 2600;

/** Time (ms) until the last image has fully settled, at the given scale. */
export function blurFadeHeadlineDuration(timeScale = 1) {
  const lastSlot = SLOT_OPEN_AT + (LINES.length - 1) * SLOT_STAGGER;
  return Math.round((lastSlot + ICON_OFFSET + ICON_DURATION) * timeScale);
}

function IconSlot({
  images,
  index,
  timeScale,
  interactive,
}: {
  images: string[];
  index: number;
  timeScale: number;
  interactive: boolean;
}) {
  const [active, setActive] = useState(0);

  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    if (!interactive) return () => {};
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
    // Offset each slot so the three images never swap on the same beat.
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      timer = setInterval(() => setActive((a) => (a + 1) % images.length), CYCLE_MS);
    }, SLOT_OPEN_AT + index * 700);
    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [images.length, index, interactive]);

  const openDelay = (SLOT_OPEN_AT + index * SLOT_STAGGER) * timeScale;
  // Only the first image is needed when nothing cycles.
  const shown = interactive ? images : images.slice(0, 1);

  const layers = shown.map((src, i) => (
    <span key={src} className={`${styles.layer} ${i === active ? styles.layerActive : ""}`}>
      {/* Preloaded when shown in the preloader, so photos are there before their tile pops in */}
      <Image
        src={src}
        alt="7th Heaven"
        title="7th Heaven"
        width={96}
        height={96}
        preload={!interactive && i === 0}
        loading="eager"
        className={styles.icon}
        draggable={false}
      />
    </span>
  ));

  return (
    <span className={styles.slot} style={{ animationDelay: `${openDelay}ms` }}>
      <span
        className={styles.slotInner}
        style={{ animationDelay: `${openDelay + ICON_OFFSET * timeScale}ms` }}
      >
        {interactive ? (
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Show next image"
            onClick={() => setActive((a) => (a + 1) % images.length)}
          >
            {layers}
          </button>
        ) : (
          <span className={styles.iconButton}>{layers}</span>
        )}
      </span>
    </span>
  );
}

export default function BlurFadeHeadline({
  as: Tag = "div",
  timeScale = 1,
  interactive = false,
  className = "",
}: {
  /** Use "h1" only where this is the page's real heading. */
  as?: "h1" | "div";
  /** Multiplies every delay and duration; below 1 plays faster. */
  timeScale?: number;
  /** Click-to-cycle buttons and auto-cycling images. */
  interactive?: boolean;
  className?: string;
}) {
  return (
    <Tag
      className={`${styles.title} ${className}`}
      style={
        {
          "--bf-line-dur": `${LINE_DURATION * timeScale}ms`,
          "--bf-slot-dur": `${SLOT_DURATION * timeScale}ms`,
          "--bf-icon-dur": `${ICON_DURATION * timeScale}ms`,
        } as React.CSSProperties
      }
    >
      {LINES.map(([before, after], i) => (
        <span
          key={before}
          className={styles.line}
          style={{ animationDelay: `${i * LINE_STAGGER * timeScale}ms` }}
        >
          {before}
          <IconSlot
            images={SLOT_IMAGES[i]}
            index={i}
            timeScale={timeScale}
            interactive={interactive}
          />
          {after}
        </span>
      ))}
    </Tag>
  );
}
