"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./FrostyVideo.module.css";

const VIDEOS = [
  { label: "Festival", src: "/movie/fest1-clip.mp4" },
  { label: "Luminous", src: "/movie/luminous-clip.mp4" },
  { label: "Color in motion", src: "/movie/color-in-motion-clip.mp4" },
  { label: "Spectrum", src: "/movie/spectrum.mp4" },
];

type Settings = {
  blur: number; // px of plain blur on the video
  frost: number; // displacement strength of the frosted-glass scatter
  frostSize: number; // noise frequency of the frost (higher = finer crystals)
  brightness: number;
  saturation: number;
  tint: number; // opacity of the cool white wash
  vignette: number; // bright frosty edges
  grain: number; // grain opacity
  grainSize: number; // grain tile scale (1 = finest)
};

const PRESETS: Record<string, Settings> = {
  "Light frost": { blur: 10, frost: 18, frostSize: 0.9, brightness: 1.08, saturation: 0.85, tint: 0.18, vignette: 0.35, grain: 0.18, grainSize: 1 },
  "Frosted glass": { blur: 14, frost: 34, frostSize: 0.7, brightness: 1.15, saturation: 0.7, tint: 0.28, vignette: 0.5, grain: 0.22, grainSize: 1 },
  "Ice storm": { blur: 22, frost: 60, frostSize: 0.5, brightness: 1.25, saturation: 0.45, tint: 0.4, vignette: 0.7, grain: 0.3, grainSize: 2 },
  "Night frost": { blur: 16, frost: 30, frostSize: 0.8, brightness: 0.8, saturation: 0.6, tint: 0.12, vignette: 0.3, grain: 0.28, grainSize: 1 },
};

const SLIDERS: { key: keyof Settings; label: string; min: number; max: number; step: number }[] = [
  { key: "blur", label: "Blur", min: 0, max: 40, step: 1 },
  { key: "frost", label: "Frost scatter", min: 0, max: 100, step: 1 },
  { key: "frostSize", label: "Crystal fineness", min: 0.1, max: 2, step: 0.05 },
  { key: "brightness", label: "Brightness", min: 0.5, max: 1.6, step: 0.01 },
  { key: "saturation", label: "Saturation", min: 0, max: 1.5, step: 0.01 },
  { key: "tint", label: "Ice tint", min: 0, max: 0.8, step: 0.01 },
  { key: "vignette", label: "Frosty edges", min: 0, max: 1, step: 0.01 },
  { key: "grain", label: "Grain", min: 0, max: 0.6, step: 0.01 },
  { key: "grainSize", label: "Grain size", min: 1, max: 4, step: 1 },
];

/** Pre-renders a handful of noise tiles once, then flips between them for moving film grain. */
function useGrainFrames(count = 6, size = 180) {
  return useMemo(() => {
    if (typeof document === "undefined") return [] as string[];
    const frames: string[] = [];
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) return frames;
    for (let f = 0; f < count; f++) {
      const img = ctx.createImageData(size, size);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      frames.push(c.toDataURL("image/png"));
    }
    return frames;
  }, [count, size]);
}

export default function FrostyVideoClient() {
  const [video, setVideo] = useState(VIDEOS[0].src);
  const [s, setS] = useState<Settings>(PRESETS["Frosted glass"]);
  const [showTuner, setShowTuner] = useState(true);
  const mounted = true;
  const grainRef = useRef<HTMLDivElement>(null);
  const frames = useGrainFrames();

  // Hide the site-wide background while this page is open.
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `#site-global-background-layer,#global-ambient-gradient,#bg-views-switcher-dock{display:none!important}`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Step through grain frames at ~24fps (film rate) with a random offset each time.
  useEffect(() => {
    const el = grainRef.current;
    if (!el || !frames.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.backgroundImage = `url(${frames[0]})`;
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % frames.length;
      el.style.backgroundImage = `url(${frames[i]})`;
      el.style.backgroundPosition = `${Math.floor(Math.random() * 180)}px ${Math.floor(Math.random() * 180)}px`;
    }, 1000 / 24);
    return () => clearInterval(id);
  }, [frames]);

  const set = (k: keyof Settings, v: number) => setS((p) => ({ ...p, [k]: v }));
  const baseFreq = (0.02 * s.frostSize).toFixed(4);

  return (
    <main className={styles.page}>
      {/* frosted-glass filter: fine turbulence displaces the video so light scatters like etched glass */}
      <svg width="0" height="0" className={styles.defs} aria-hidden>
        <filter id="frost-glass" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={baseFreq} numOctaves="3" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={s.frost} xChannelSelector="R" yChannelSelector="G" result="frosted" />
          <feGaussianBlur in="frosted" stdDeviation={s.blur / 2} />
        </filter>
      </svg>

      <div className={styles.stage}>
        {mounted && (
          <video
            key={video}
            className={styles.video}
            src={video}
            autoPlay
            muted
            loop
            playsInline
            style={{
              filter: `url(#frost-glass) brightness(${s.brightness}) saturate(${s.saturation})`,
            }}
          />
        )}
        <div className={styles.tint} style={{ opacity: s.tint }} />
        <div className={styles.vignette} style={{ opacity: s.vignette }} />
        <div
          ref={grainRef}
          className={styles.grain}
          style={{ opacity: s.grain, backgroundSize: `${180 * s.grainSize}px ${180 * s.grainSize}px` }}
        />
      </div>

      <section className={styles.content}>
        <p className={styles.kicker}>7th Heaven · Live</p>
        <h1 className={styles.title}>Frosted Video Background</h1>
        <p className={styles.sub}>Blur, frost scatter, ice tint and moving film grain over a live clip.</p>
      </section>

      <button type="button" className={styles.toggle} onClick={() => setShowTuner((v) => !v)}>
        {showTuner ? "Hide tuner" : "Show tuner"}
      </button>

      {showTuner && (
        <aside className={styles.tuner}>
          <label className={styles.row}>
            <span>Video</span>
            <select value={video} onChange={(e) => setVideo(e.target.value)} className={styles.select}>
              {VIDEOS.map((v) => (
                <option key={v.src} value={v.src}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.presets}>
            {Object.keys(PRESETS).map((name) => (
              <button key={name} type="button" className={styles.preset} onClick={() => setS(PRESETS[name])}>
                {name}
              </button>
            ))}
          </div>

          {SLIDERS.map(({ key, label, min, max, step }) => (
            <label key={key} className={styles.slider}>
              <span>{label}</span>
              <span className={styles.val}>{s[key]}</span>
              <input type="range" min={min} max={max} step={step} value={s[key]} onChange={(e) => set(key, Number(e.target.value))} />
            </label>
          ))}

          <button
            type="button"
            className={styles.copy}
            onClick={() => navigator.clipboard?.writeText(JSON.stringify(s, null, 2))}
          >
            Copy settings
          </button>
        </aside>
      )}
    </main>
  );
}
