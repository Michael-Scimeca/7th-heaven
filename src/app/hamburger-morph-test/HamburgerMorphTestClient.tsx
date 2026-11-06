"use client";

import { ReactNode, useEffect, useState } from "react";
import HamburgerMorph from "@/components/HamburgerMorph/HamburgerMorph";
import SvgHamburger from "@/components/HamburgerMorph/SvgHamburger";
import CanvasHamburger from "@/components/HamburgerMorph/CanvasHamburger";
import LottieHamburger from "@/components/HamburgerMorph/LottieHamburger";
import styles from "./HamburgerMorphTest.module.css";

type Build = {
  id: string;
  name: string;
  how: string;
  pros: string;
  cons: string;
  render: (open: boolean, toggle: () => void) => ReactNode;
};

const BUILDS: Build[] = [
  {
    id: "gsap",
    name: "1 · GSAP + HTML bars",
    how: "Three <span> bars tweened by a GSAP timeline (width, rotation, position).",
    pros: "Interruptible mid-animation, real elastic easing, easiest to tweak timing.",
    cons: "Needs GSAP loaded; animates layout-ish props (width).",
    render: (o, t) => <HamburgerMorph open={o} onToggle={t} size={96} />,
  },
  {
    id: "svg",
    name: "2 · SVG + CSS keyframes",
    how: "Three round-capped <line>s; pure CSS @keyframes on transform and stroke-width.",
    pros: "Zero JS animation cost, crisp at any size, tiny.",
    cons: "Restarts from the beginning if toggled mid-way; elastic is faked with an overshoot key.",
    render: (o, t) => <SvgHamburger open={o} onToggle={t} size={96} />,
  },
  {
    id: "canvas",
    name: "3 · Canvas",
    how: "A small tween loop eases through the keyframes and redraws rounded rects every frame.",
    pros: "Full pixel control — easy to add trails, glow or particles later.",
    cons: "Most code to maintain; needs manual DPR handling; not stylable with CSS.",
    render: (o, t) => <CanvasHamburger open={o} onToggle={t} size={96} />,
  },
  {
    id: "lottie",
    name: "4 · Lottie",
    how: "lottie-web plays one animation file; open and close are two segments of it.",
    pros: "Designers can hand you an After Effects export and it plays exactly as designed.",
    cons: "Heaviest (lottie-web ~250KB); changes need a re-export. JSON is generated here from the same keys.",
    render: (o, t) => <LottieHamburger open={o} onToggle={t} size={96} />,
  },
];

export default function HamburgerMorphTestClient() {
  const [state, setState] = useState<Record<string, boolean>>({});
  const allOpen = BUILDS.every((b) => state[b.id]);

  // Hide the site-wide background while this page is open.
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `#site-global-background-layer,#global-ambient-gradient,#bg-views-switcher-dock{display:none!important}`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const toggle = (id: string) => setState((s) => ({ ...s, [id]: !s[id] }));
  const toggleAll = () => setState(Object.fromEntries(BUILDS.map((b) => [b.id, !allOpen])));

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hamburger morph · 4 builds</h1>
        <p className={styles.lead}>Same motion: hamburger → chevron → X with a dot peeling off, then a springy return. Click any icon, or toggle all to compare in sync.</p>
        <button type="button" className={styles.all} onClick={toggleAll}>
          {allOpen ? "Close all" : "Open all"}
        </button>
      </header>

      <div className={styles.grid}>
        {BUILDS.map((b) => (
          <section key={b.id} className={styles.card}>
            <div className={styles.stage}>{b.render(!!state[b.id], () => toggle(b.id))}</div>
            <h2 className={styles.name}>{b.name}</h2>
            <p className={styles.how}>{b.how}</p>
            <p className={styles.pro}>+ {b.pros}</p>
            <p className={styles.con}>− {b.cons}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
