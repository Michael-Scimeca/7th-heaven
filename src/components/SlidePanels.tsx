"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./SlidePanels.module.css";

export type SlidePanel = {
  eyebrow: string;
  title: string;
  tags: string[];
  copy: string;
  cta: string;
  href: string;
  bg: string;
  fg: string;
};

/* Timings and angles measured from 1minus1.com's services section. */
export default function SlidePanels({ panels }: { panels: SlidePanel[] }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia(root);

    const build = (angle: number, leftShift: number, rightShift: number) => {
      gsap.utils.toArray<HTMLElement>("[data-slot]").forEach((slot, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const card = slot.querySelector("[data-card]");
        const panel = slot.querySelector("[data-panel]");

        gsap.set(panel, { x: dir === 1 ? leftShift : rightShift });

        // Swings in from the side as it comes up the screen
        gsap.fromTo(
          card,
          { rotation: angle * dir, xPercent: -10 * dir },
          {
            rotation: 0,
            xPercent: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: slot, start: "top bottom", end: "top 20%", scrub: true },
          },
        );

        // Tilts away the other direction while the next panel covers it
        if (i < panels.length - 1) {
          gsap.fromTo(
            panel,
            { rotation: 0, xPercent: 0 },
            {
              rotation: -angle * dir,
              xPercent: -10 * dir,
              ease: "power1.inOut",
              scrollTrigger: { trigger: slot, start: "top 15%", end: "top -50%", scrub: true },
            },
          );
        }
      });
    };

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => build(8, -40, 80));
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => build(4, 0, 0));

    return () => mm.revert();
  }, [panels.length]);

  return (
    <section ref={root} className={styles.section}>
      {panels.map((p, i) => (
        <div
          key={p.title}
          data-slot
          className={`${styles.slot} ${i % 2 === 0 ? styles.even : styles.odd}`}
          style={{ zIndex: i + 1 }}
        >
          <div data-card className={styles.card}>
            <div
              data-panel
              className={styles.panel}
              style={{ "--panel-bg": p.bg, "--panel-fg": p.fg } as React.CSSProperties}
            >
              <div className={styles.inner}>
                <span aria-hidden="true" className={styles.number}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.head}>
                  <p className={styles.eyebrow}>{p.eyebrow}</p>
                  <h2 className={styles.title}>{p.title}</h2>
                </div>
                <div className={styles.body}>
                  <ul className={styles.tags}>
                    {p.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className={styles.copy}>{p.copy}</p>
                  <Link href={p.href} className={styles.link}>
                    {p.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
