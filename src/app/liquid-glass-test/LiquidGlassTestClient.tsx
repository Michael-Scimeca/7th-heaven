"use client";

import { PointerEvent, useRef, useState } from "react";
import LiquidGlass, { LIQUID_GLASS_PRESETS, LiquidGlassSettings } from "@/components/LiquidGlass/LiquidGlass";

const heading = { fontFamily: "var(--font-heading)" } as const;
const body = { fontFamily: "var(--font-body)" } as const;

const SLIDERS: { key: keyof LiquidGlassSettings; label: string; min: number; max: number; step: number }[] = [
  { key: "scale", label: "Displacement", min: -300, max: 300, step: 1 },
  { key: "border", label: "Edge width", min: 0, max: 1, step: 0.01 },
  { key: "lightness", label: "Flat lightness", min: 0, max: 100, step: 1 },
  { key: "alpha", label: "Flat alpha", min: 0, max: 1, step: 0.01 },
  { key: "mapBlur", label: "Map blur", min: 0, max: 40, step: 0.5 },
  { key: "output", label: "Output blur", min: 0, max: 10, step: 0.05 },
  { key: "radius", label: "Radius", min: 0, max: 80, step: 1 },
  { key: "rOffset", label: "Chroma R", min: -60, max: 60, step: 1 },
  { key: "bOffset", label: "Chroma B", min: -60, max: 60, step: 1 },
];

function useDrag(initial: { x: number; y: number }) {
  const [pos, setPos] = useState(initial);
  const start = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  return {
    pos,
    handlers: {
      onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
      },
      onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
        if (!start.current) return;
        setPos({ x: start.current.x + e.clientX - start.current.px, y: start.current.y + e.clientY - start.current.py });
      },
      onPointerUp: () => (start.current = null),
    },
  };
}

export default function LiquidGlassTestClient() {
  const [panel, setPanel] = useState<LiquidGlassSettings>(LIQUID_GLASS_PRESETS.panel);
  const drag = useDrag({ x: 0, y: 0 });

  return (
    <main style={{ ...body, minHeight: "100vh", background: "#120914", color: "#fff", position: "relative" }}>
      {/* busy backdrop so the refraction is obvious */}
      <section style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
        <img src="/images/hero/band-performance.webp" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, rgba(255,251,181,.35) 0 2px, transparent 2px 60px)" }} />
        <h1 style={{ ...heading, position: "absolute", left: 24, bottom: 24, margin: 0, fontSize: "clamp(64px, 14vw, 220px)", lineHeight: 0.9, textTransform: "uppercase" }}>
          7th Heaven
        </h1>

        {/* nav pills */}
        <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
          {["Shows", "Media", "Book"].map((t) => (
            <LiquidGlass key={t} preset="pill" style={{ padding: "12px 22px" }}>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>{t}</span>
            </LiquidGlass>
          ))}
        </div>

        {/* draggable main panel — the iertqa 413x140 card */}
        <div
          {...drag.handlers}
          style={{ position: "absolute", top: "38%", left: "50%", transform: `translate(calc(-50% + ${drag.pos.x}px), ${drag.pos.y}px)`, cursor: "grab", touchAction: "none", zIndex: 10 }}
        >
          <LiquidGlass settings={panel} style={{ width: 413, maxWidth: "calc(100vw - 32px)", height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ ...heading, fontSize: 32, textTransform: "uppercase", pointerEvents: "none" }}>Drag me</span>
          </LiquidGlass>
        </div>

        {/* tile */}
        <LiquidGlass preset="tile" style={{ position: "absolute", right: 32, top: "30%", width: 54, height: 78, zIndex: 10 }} />
      </section>

      {/* scroll content so you can watch it refract while scrolling under the fixed tuner */}
      <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <p key={i} style={{ fontSize: 20, lineHeight: 1.6, opacity: 0.85 }}>
            Chicago&apos;s party band. Weddings, festivals, corporate nights and the Rock &apos;n&apos; Roll Kids — scroll this text under the
            glass panels to check the edge refraction and rim highlight.
          </p>
        ))}
      </section>

      {/* tuner */}
      <LiquidGlass preset="panel" style={{ position: "fixed", right: 16, bottom: 16, width: 280, zIndex: 50 }}>
        <div style={{ padding: 16, display: "grid", gap: 10, fontSize: 12 }}>
          <strong style={{ ...heading, fontSize: 18, textTransform: "uppercase" }}>Panel tuner</strong>
          {SLIDERS.map(({ key, label, min, max, step }) => (
            <label key={key} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 4 }}>
              <span>{label}</span>
              <span>{panel[key] as number}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={panel[key] as number}
                onChange={(e) => setPanel({ ...panel, [key]: Number(e.target.value) })}
                style={{ gridColumn: "1 / -1" }}
              />
            </label>
          ))}
          <button onClick={() => setPanel(LIQUID_GLASS_PRESETS.panel)} style={{ ...body, padding: 8, borderRadius: 8, border: 0, cursor: "pointer" }}>
            Reset to iertqa values
          </button>
        </div>
      </LiquidGlass>
    </main>
  );
}
