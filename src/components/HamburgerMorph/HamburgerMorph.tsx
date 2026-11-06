"use client";

/**
 * HamburgerMorph — three bars that morph hamburger → chevron → X (with a dot that peels off),
 * and spring back with staggered bar lengths on close. Recreated from a Dribbble shot.
 * Driven by GSAP timelines so it can be interrupted mid-animation in either direction.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./HamburgerMorph.module.css";

type Props = {
  open: boolean;
  onToggle: () => void;
  /** bar colour */
  color?: string;
  /** overall size in px (button is square) */
  size?: number;
  label?: string;
  controls?: string;
};

// Geometry in a 64px design box; scaled by `size`.
const BAR_W = 32;
const BAR_H = 6;
const GAP = 10;

export default function HamburgerMorph({ open, onToggle, color = "#fff", size = 64, label = "Menu", controls }: Props) {
  const topRef = useRef<HTMLSpanElement>(null);
  const midRef = useRef<HTMLSpanElement>(null);
  const botRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const first = useRef(true);

  // resting hamburger state
  useLayoutEffect(() => {
    gsap.set([topRef.current, midRef.current, botRef.current], {
      width: BAR_W,
      height: BAR_H,
      borderRadius: BAR_H / 2,
      xPercent: -50,
      yPercent: -50,
      x: 0,
      rotation: 0,
      opacity: 1,
      scale: 1,
    });
    gsap.set(topRef.current, { y: -GAP });
    gsap.set(botRef.current, { y: GAP });
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!open) return;
    }
    const top = topRef.current;
    const mid = midRef.current;
    const bot = botRef.current;
    if (!top || !mid || !bot) return;

    tlRef.current?.kill();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    tlRef.current = tl;

    if (reduce) {
      if (open) {
        tl.to(mid, { opacity: 0, duration: 0.15 })
          .to(top, { y: 0, x: 0, rotation: 45, width: 40, duration: 0.2 }, 0)
          .to(bot, { y: 0, x: 0, rotation: -45, width: 40, duration: 0.2 }, 0);
      } else {
        tl.to([top, mid, bot], { rotation: 0, x: 0, width: BAR_W, height: BAR_H, borderRadius: BAR_H / 2, opacity: 1, scale: 1, duration: 0.2 })
          .to(top, { y: -GAP, duration: 0.2 }, 0)
          .to(mid, { y: 0, duration: 0.2 }, 0)
          .to(bot, { y: GAP, duration: 0.2 }, 0);
      }
      return;
    }

    if (open) {
      tl
        // 1) chevron: outer bars stretch and tilt inward, middle shrinks to the left
        .to(top, { width: 40, x: 4, y: -7, rotation: 28, duration: 0.28 }, 0)
        .to(bot, { width: 40, x: 4, y: 7, rotation: -28, duration: 0.28 }, 0)
        .to(mid, { width: 14, x: -11, duration: 0.28 }, 0)
        // 2) bars cross into an off-centre X; the middle peels off as a dot
        .to(top, { y: 0, x: 6, rotation: 45, duration: 0.3 }, 0.28)
        .to(bot, { y: 0, x: 6, rotation: -45, duration: 0.3 }, 0.28)
        .to(mid, { width: 9, height: 9, borderRadius: 4.5, x: -17, opacity: 0.7, duration: 0.3 }, 0.28)
        // 3) dot fades away, X settles to centre
        .to(mid, { scale: 0, opacity: 0, duration: 0.22, ease: "power2.in" }, 0.58)
        .to([top, bot], { x: 0, duration: 0.3, ease: "back.out(2)" }, 0.6);
    } else {
      // middle comes back from nothing while the X uncrosses
      gsap.set(mid, { x: 0, y: 0, width: 4, height: BAR_H, borderRadius: BAR_H / 2, scale: 1, opacity: 1 });
      tl
        .to(top, { rotation: 0, x: 0, y: -GAP, width: 22, duration: 0.32 }, 0)
        .to(bot, { rotation: 0, x: 0, y: GAP, width: 28, duration: 0.32 }, 0)
        .to(mid, { width: 36, duration: 0.32 }, 0.04)
        // staggered lengths spring back to equal
        .to(top, { width: BAR_W, duration: 0.55, ease: "elastic.out(1, 0.5)" }, 0.32)
        .to(mid, { width: BAR_W, duration: 0.55, ease: "elastic.out(1, 0.5)" }, 0.36)
        .to(bot, { width: BAR_W, duration: 0.55, ease: "elastic.out(1, 0.5)" }, 0.4);
    }

    return () => {
      tl.kill();
    };
  }, [open]);

  return (
    <button
      type="button"
      className={styles.button}
      onClick={onToggle}
      aria-label={open ? `Close ${label.toLowerCase()}` : `Open ${label.toLowerCase()}`}
      aria-expanded={open}
      aria-controls={controls}
      style={{ width: size, height: size, ["--bar" as string]: color, ["--scale" as string]: size / 64 }}
    >
      <span className={styles.box}>
        <span ref={topRef} className={styles.bar} />
        <span ref={midRef} className={styles.bar} />
        <span ref={botRef} className={styles.bar} />
      </span>
    </button>
  );
}
