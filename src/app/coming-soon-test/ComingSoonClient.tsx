"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ComingSoon.module.css";

const SLIDES = [
  { title: ["Almost", "Showtime"], copy: "Tuning up, testing mics, cueing the lights." },
  { title: ["The Next", "Set Drops"], copy: "Fresh dates and a new setlist are on the way." },
  { title: ["Save Your", "Dance Shoes"], copy: "Something loud is landing on this page soon." },
];

const SIZE = 380; // logical px for the dial canvas
const SPIN_MS = 5000; // one full turn of the swirl

type Show = { date: string; venue?: string; city?: string; isPrivate?: boolean };

function useNextShow() {
  const [show, setShow] = useState<Show | null>(null);
  useEffect(() => {
    fetch("/api/tour")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list: Show[] = Array.isArray(d) ? d : d?.shows ?? d?.data ?? [];
        const now = Date.now();
        const next = list
          .filter((s) => s.date && !s.isPrivate && new Date(s.date).getTime() > now)
          .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];
        if (next) setShow(next);
      })
      .catch(() => {});
  }, []);
  return show;
}

// Countdown only needs a once-a-second tick; the animation lives on the canvas.
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Stopwatch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const c = SIZE / 2;
    const R = SIZE * 0.38;
    const k = R / 130; // the drawing numbers were tuned at R = 130

    // Swirl layer: blobs and centre hole drawn and blurred once, then rotated each frame.
    const swirl = document.createElement("canvas");
    swirl.width = SIZE * dpr;
    swirl.height = SIZE * dpr;
    const s = swirl.getContext("2d");
    if (s) {
      s.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.translate(c, c);
      s.filter = `blur(${10 * k}px)`;
      s.fillStyle = "#f97a2a";
      for (const [x, y, r] of [
        [-62, 40, 62],
        [-20, 78, 50],
        [-98, -2, 26],
      ]) {
        s.beginPath();
        s.arc(x * k, y * k, r * k, 0, Math.PI * 2);
        s.fill();
      }
      s.filter = `blur(${6 * k}px)`;
      s.fillStyle = "#efd3ae";
      s.beginPath();
      s.arc(6 * k, -6 * k, 34 * k, 0, Math.PI * 2);
      s.fill();
      s.filter = "none";
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const period = reduce ? SPIN_MS * 12 : SPIN_MS;
    const start = performance.now();
    let raf = 0;

    const base = () => {
      const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      g.addColorStop(0, "#f2a98a");
      g.addColorStop(0.35, "#f2604a");
      g.addColorStop(0.7, "#f6772e");
      g.addColorStop(1, "#f9913a");
      return g;
    };

    const frame = (now: number) => {
      const angle = ((now - start) / period) * Math.PI * 2;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // the whole dial turns around its centre
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(angle);
      ctx.translate(-c, -c);

      // dial body with red glow
      ctx.save();
      ctx.shadowColor = "rgba(240, 60, 40, 0.6)";
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.fillStyle = base();
      ctx.fill();
      ctx.restore();

      // swirl, clipped to the dial
      ctx.save();
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = base();
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(swirl, 0, 0, SIZE, SIZE);
      ctx.restore();

      ctx.restore();
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={styles.watch}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
    </div>
  );
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

// The site paints its own global background (WebGL layer, purple ambient gradient,
// shader) behind every page. Hide those only while this test page is mounted.
function useHideSiteBackground() {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "coming-soon-hide-site-bg";
    style.textContent = `
      #site-global-background-layer,
      #global-ambient-gradient,
      #bg-views-switcher-dock { display: none !important; }
      body, html { background: transparent !important; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
}

export default function ComingSoonClient() {
  useHideSiteBackground();
  const now = useNow();
  const show = useNextShow();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  const target = show ? new Date(show.date).getTime() : 0;
  const diff = target ? Math.max(0, target - now) : 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;

  return (
    <main className={styles.page}>
      <div className={styles.topLine} />
      <div className={styles.floor} aria-hidden>
        <div className={styles.grid} />
      </div>

      <div className={styles.layout}>
        <section className={styles.copy}>
          <p className={styles.kicker}>7th Heaven · Coming Soon</p>
          <div className={styles.slides}>
            {SLIDES.map((sl, i) => (
              <div key={sl.copy} className={`${styles.slide} ${i === slide ? styles.active : ""}`} aria-hidden={i !== slide}>
                <h1 className={styles.title}>
                  {sl.title.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h1>
                <p className={styles.body}>{sl.copy}</p>
              </div>
            ))}
          </div>
          <div className={styles.dots}>
            {SLIDES.map((sl, i) => (
              <button
                key={sl.copy}
                aria-label={`Slide ${i + 1}`}
                className={i === slide ? styles.dotOn : styles.dot}
                onClick={() => setSlide(i)}
              />
            ))}
            <span className={styles.counter}>0{slide + 1}</span>
          </div>
        </section>

        <Stopwatch />

        <section className={styles.countdown}>
          {show ? (
            <>
              <p className={styles.kicker}>
                Next show · {show.venue}
                {show.city ? `, ${show.city}` : ""}
              </p>
              <div className={styles.units}>
                {[
                  [d, "Days"],
                  [h, "Hrs"],
                  [m, "Min"],
                  [s, "Sec"],
                ].map(([v, l]) => (
                  <div key={l as string} className={styles.unit}>
                    <span className={styles.num}>{pad(v as number)}</span>
                    <span className={styles.label}>{l}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.kicker}>New dates landing soon</p>
          )}
        </section>
      </div>
    </main>
  );
}
