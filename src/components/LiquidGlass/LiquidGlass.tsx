"use client";

/**
 * LiquidGlass — SVG displacement-map backdrop filter.
 * Recipe lifted from the Framer liquid-glass setup used on iertqa.com:
 *  - feImage loads a per-size displacement map (red = x gradient, blue = y gradient,
 *    grey blurred inner rect = flat centre), so only the edges refract.
 *  - R/G/B channels are displaced separately (optional chromatic split), screen-blended,
 *    then softened with a tiny gaussian blur.
 *  - A 1px gradient rim (mask-composite: exclude) sits on top.
 * Chromium only supports url() in backdrop-filter; other browsers get a plain blur fallback.
 */

import { CSSProperties, ReactNode, useEffect, useId, useRef, useState } from "react";

export type LiquidGlassSettings = {
  /** inner flat-area inset as a fraction of the short side (iertqa "border") */
  border: number;
  /** lightness (0-100) of the flat inner area */
  lightness: number;
  /** alpha (0-1) of the flat inner area */
  alpha: number;
  /** blur (px, map units) applied to the inner area — softens the edge falloff */
  mapBlur: number;
  /** displacement strength; negative bends the other way */
  scale: number;
  /** extra displacement per channel for chromatic aberration (0 = off, iertqa uses 0) */
  rOffset: number;
  gOffset: number;
  bOffset: number;
  /** final gaussian blur */
  output: number;
  /** tint background */
  tint: string;
  radius: number;
  rim: boolean;
};

export const LIQUID_GLASS_PRESETS: Record<"panel" | "tile" | "pill", LiquidGlassSettings> = {
  // 413x140 card, r24 — the one from the DevTools screenshot
  panel: { border: 0.5, lightness: 100, alpha: 0.29, mapBlur: 0, scale: -61, rOffset: 0, gOffset: 0, bOffset: 0, output: 2.3, tint: "hsl(0 0% 100% / 0.1)", radius: 24, rim: true },
  // small tall tile, r24
  tile: { border: 0.36, lightness: 63, alpha: 0.39, mapBlur: 21, scale: 219, rOffset: 0, gOffset: 0, bOffset: 0, output: 0.86, tint: "hsl(0 0% 100% / 0.06)", radius: 24, rim: true },
  // nav pill, r44
  pill: { border: 0.05, lightness: 53, alpha: 0.9, mapBlur: 5, scale: 210, rOffset: 0, gOffset: 0, bOffset: 0, output: 0.38, tint: "hsl(0 0% 100% / 0.1)", radius: 44, rim: true },
};

function buildMap(w: number, h: number, s: LiquidGlassSettings) {
  // Framer builds the map at half the element size; keep that so the px values match.
  const vw = Math.max(1, w / 2);
  const vh = Math.max(1, h / 2);
  const rx = Math.min(s.radius, vh);
  const inset = Math.min(vw, vh) * (s.border * 0.5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}">
<defs>
<linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient>
<linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient>
</defs>
<rect x="0" y="0" width="${vw}" height="${vh}" fill="black"/>
<rect x="0" y="0" width="${vw}" height="${vh}" rx="${rx}" fill="url(#red)"/>
<rect x="0" y="0" width="${vw}" height="${vh}" rx="${rx}" fill="url(#blue)" style="mix-blend-mode: difference"/>
<rect x="${inset}" y="${inset}" width="${vw - inset * 2}" height="${vh - inset * 2}" rx="${rx}" fill="hsl(0 0% ${s.lightness}% / ${s.alpha})" style="filter:blur(${s.mapBlur}px)"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function supportsSvgBackdrop() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // Chromium (Chrome, Edge, Arc, Brave, Opera); Safari/Firefox don't render url() backdrop filters.
  return /Chrome|Chromium|Edg\//.test(ua) && !/Firefox|FxiOS|CriOS/.test(ua);
}

type Props = {
  settings?: Partial<LiquidGlassSettings>;
  preset?: keyof typeof LIQUID_GLASS_PRESETS;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export default function LiquidGlass({ settings, preset = "panel", className, style, children }: Props) {
  const s: LiquidGlassSettings = { ...LIQUID_GLASS_PRESETS[preset], ...settings };
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [svgOk, setSvgOk] = useState(false);
  const filterId = `liquid-glass-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;

  useEffect(() => {
    setSvgOk(supportsSvgBackdrop());
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const map = size.w && size.h ? buildMap(size.w, size.h, s) : "";
  const backdrop = svgOk && map ? `url(#${filterId})` : "blur(14px) saturate(1.5)";

  return (
    <div ref={ref} className={className} style={{ position: "relative", borderRadius: s.radius, isolation: "isolate", ...style }}>
      {svgOk && map && (
        <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id={filterId} colorInterpolationFilters="sRGB">
              <feImage href={map} x="0" y="0" width="100%" height="100%" result="map" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={s.scale + s.rOffset} xChannelSelector="R" yChannelSelector="B" result="dispRed" />
              <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={s.scale + s.gOffset} xChannelSelector="R" yChannelSelector="B" result="dispGreen" />
              <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={s.scale + s.bOffset} xChannelSelector="R" yChannelSelector="B" result="dispBlue" />
              <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
              <feBlend in="red" in2="green" mode="screen" result="rg" />
              <feBlend in="rg" in2="blue" mode="screen" result="output" />
              <feGaussianBlur in="output" stdDeviation={s.output} />
            </filter>
          </defs>
        </svg>
      )}
      {/* the glass layer — matches the element.style from DevTools */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          borderRadius: s.radius,
          zIndex: 1,
          background: s.tint,
          backdropFilter: backdrop,
          WebkitBackdropFilter: backdrop,
        }}
      />
      {s.rim && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            borderRadius: s.radius,
            border: "1px solid transparent",
            background: "linear-gradient(315deg, #fff 0%, rgba(120,120,120,0) 30%, rgba(120,120,120,0) 70%, #fff 100%) border-box",
            WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#fff 0 0) padding-box exclude, linear-gradient(#fff 0 0)",
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}
