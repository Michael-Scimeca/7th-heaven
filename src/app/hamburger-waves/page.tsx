"use client";

// Test page for /hamburger-waves — 20 "three lines → sound wave" hamburger
// icon styles. Hover a tile to preview it; click a tile to apply it to the
// real header menu button (#mobile-menu-toggle) while this page is open.
// Nothing here changes Header.tsx — the header override is removed when you
// leave this page.

import { useEffect, useRef, useState } from "react";

type EqSpec = {
  n: number;
  h: (j: number, t: number, n: number, r: number) => number;
  mode?: "bottom" | "center" | "collapse";
  caps?: boolean;
  led?: boolean;
  reflect?: boolean;
  sw?: number;
};

type Pt = [number, number];
type Extra = {
  tag: string;
  init?: Record<string, string>;
  draw: (el: SVGElement, e: number, t: number, tau: number) => void;
};
type Morph = {
  // resting shape of each line; defaults to the standard three horizontal menu lines
  rest?: (i: number, u: number) => Pt;
  // where each of the three menu lines ends up at full hover (u runs 0 → 1 along the line)
  line: (i: number, u: number, t: number, tau: number) => Pt;
  extras?: Extra[];
  stagger?: boolean;
  lineOpacity?: (i: number, t: number) => number;
  lineStyle?: (el: SVGElement, i: number, e: number, t: number) => void;
};

type Variant = {
  n: string;
  // hover only starts the effect; the full version plays when the menu is opened (clicked)
  twoStage?: boolean;
  morph?: Morph;
  eq?: EqSpec;
  two?: boolean;
  gap?: number;
  fn?: (u: number, t: number, i: number, tau: number) => number;
  conv?: boolean;
  only?: number;
  noEnv?: boolean;
  stagger?: boolean;
  dots?: boolean;
  bars?: "c" | "b" | "r";
  k?: number;
};

const s = Math.sin;
const P = Math.PI;
const ab = Math.abs;
const fr = (x: number) => x - Math.floor(x);
const ga = (x: number) => Math.exp(-x * x);
const NS = "http://www.w3.org/2000/svg";
const X0 = 8;
const W = 32;
const YS = [14, 24, 34];
const N = 72;

const VARIANTS: Variant[] = [
  { n: "Rolling sine", fn: (u, t, i) => 5 * s(u * 4 * P - t * 6 + i * 1.2) },
  { n: "Middle wave", fn: (u, t, i) => (i === 1 ? 9 * s(u * 5 * P - t * 8) : 0) },
  { n: "Braid", conv: true, fn: (u, t, i) => 9 * s(u * 3 * P - t * 5 + i * 2.1) },
  { n: "Square wave", fn: (u, t, i) => 4.5 * Math.sign(s(u * 4 * P - t * 6 + i)) },
  { n: "Sawtooth", fn: (u, t, i) => 4.5 * (2 * fr(u * 3 - t * 1.2 + i * 0.33) - 1) },
  { n: "Triangle", fn: (u, t, i) => 4.5 * (2 * ab(2 * fr(u * 3 - t * 1.2 + i * 0.2) - 1) - 1) },
  {
    n: "Heartbeat",
    only: 1,
    fn: (u, t, i) => {
      if (i !== 1) return 0;
      const p = fr(u - t * 0.7);
      return -14 * ga((p - 0.5) / 0.025) + 7 * ga((p - 0.55) / 0.025) - 2.5 * ga((p - 0.3) / 0.06);
    },
  },
  { n: "Static", fn: (u, t, i) => 4 * s(u * 53 + t * 40 + i * 7) * s(u * 17 - t * 27 + i * 3) },
  { n: "Harmonics", noEnv: true, fn: (u, t, i) => 5 * s(u * (i + 1) * P) * s(t * 9 + i) },
  {
    n: "Pluck",
    noEnv: true,
    fn: (u, _t, i, tau) => {
      const q = fr((tau + i * 0.25) / 1.4) * 1.4;
      return 8 * s(u * P) * s(q * 38) * Math.exp(-q * 3);
    },
  },
  { n: "Center ripple", fn: (u, t, i) => 7 * ga((u - 0.5) / 0.2) * s(ab(u - 0.5) * 28 - t * 10 + i) },
  { n: "Cascade", stagger: true, fn: (u, t, i) => 5 * s(u * 4 * P - t * 7 + i * 1.5) },
  {
    n: "Mirror",
    conv: true,
    fn: (u, t, i) => {
      const a = 2 + 6 * ab(s(u * 9 + t * 3)) * ab(s(u * 4 - t * 2 + 1));
      return i === 0 ? -a : i === 2 ? a : 0;
    },
  },
  { n: "Frequency stack", fn: (u, t, i) => 4.5 * s(u * (2 + i * 3) * P - t * 7) },
  { n: "Dotted wave", dots: true, fn: (u, t, i) => 5 * s(u * 3 * P - t * 6 + i * 1.1) },
  { n: "Podcast bars", bars: "c", k: 3 },
  { n: "Spectrum EQ", bars: "b", k: 3 },
  { n: "Dash flip", bars: "r", k: 4 },
  { n: "AM signal", only: 1, fn: (u, t, i) => (i === 1 ? 8 * s(u * 16 * P - t * 14) * ab(s(u * P * 1.5 - t * 2)) : 0) },
  {
    n: "Voice memo",
    only: 1,
    fn: (u, t, i) => (i === 1 ? 10 * ab(s(u * 19 + t * 7)) * ab(s(u * 7 - t * 4)) * s(u * 44 * P) : 0),
  },
];

const clamp = (x: number) => Math.max(0, Math.min(1, x));

// Resting equalizer shape (matches the screenshot: tall, short, short, tall…)
const REST9 = [1, 0.3, 0.42, 0.88, 0.55, 0.95, 0.5, 0.32, 0.48];
const restAt = (j: number, n: number) => {
  const pos = n === 1 ? 0 : (j * 8) / (n - 1);
  const a = Math.floor(pos);
  const b = Math.min(8, a + 1);
  return REST9[a] + (REST9[b] - REST9[a]) * (pos - a);
};
const bounce = (j: number, t: number) =>
  0.15 + 0.85 * (0.5 + 0.5 * s(t * 7 + j * 1.3)) * (0.55 + 0.45 * s(t * 3.3 + j * 2.1));

const EQ_VARIANTS: Variant[] = [
  { n: "Live EQ", eq: { n: 9, h: (j, t) => bounce(j, t) } },
  { n: "EQ sweep", eq: { n: 9, h: (j, t) => 0.2 + 0.8 * (0.5 + 0.5 * s(j * 0.8 - t * 8)) } },
  { n: "Peak caps", eq: { n: 9, caps: true, h: (j, t) => bounce(j, t) } },
  { n: "Center split", eq: { n: 9, mode: "center", h: (j, t) => bounce(j, t) } },
  {
    n: "Bass kick",
    eq: {
      n: 9,
      h: (j, t, n) => 0.15 + 0.75 * Math.exp(-fr(t * 2) * 5) * (1 - (j / n) * 0.6) + 0.1 * s(t * 9 + j),
    },
  },
  { n: "Left ripple", eq: { n: 9, h: (j, t) => 0.15 + 0.85 * ab(s(t * 4 - j * 0.5)) } },
  { n: "EQ to menu", eq: { n: 9, mode: "collapse", h: (_j, _t, _n, r) => r } },
  { n: "LED meter", eq: { n: 9, led: true, sw: 3, h: (j, t) => bounce(j, t) } },
  {
    n: "Thin spectrum",
    eq: { n: 15, sw: 1.6, h: (j, t, n) => (1 - (j / n) * 0.5) * bounce(j * 0.7, t * 1.2) },
  },
  { n: "Chunky bars", eq: { n: 5, sw: 4.5, h: (j, t) => bounce(j * 1.7, t * 0.8) } },
  { n: "Reflection", eq: { n: 9, reflect: true, h: (j, t) => bounce(j, t) } },
  { n: "Breathing", eq: { n: 9, h: (_j, t, _n, r) => r * (0.55 + 0.45 * (0.5 + 0.5 * s(t * 3))) } },
];

// Two-line versions: no middle line; the top and bottom lines become the wave.
const ecg = (p: number) =>
  -14 * ga((p - 0.5) / 0.025) + 7 * ga((p - 0.55) / 0.025) - 2.5 * ga((p - 0.3) / 0.06);

const TWO_VARIANTS: Variant[] = [
  { n: "Heartbeat pair", two: true, fn: (u, t, i) => 0.6 * ecg(fr(u - t * 0.7 - i * 0.5)) },
  { n: "Mirror heartbeat", two: true, fn: (u, t, i) => (i === 0 ? 0.6 : -0.6) * ecg(fr(u - t * 0.7)) },
  { n: "Heartbeat merge", two: true, conv: true, only: 0, fn: (u, t, i) => (i === 0 ? ecg(fr(u - t * 0.7)) : 0) },
  { n: "Heartbeat sync", two: true, fn: (u, t) => 0.6 * ecg(fr(u - t * 0.7)) },
  { n: "Twin sine", two: true, fn: (u, t, i) => 5 * s(u * 4 * P - t * 6 + i * P) },
  { n: "Twin braid", two: true, conv: true, fn: (u, t, i) => 7 * s(u * 3 * P - t * 5 + i * P) },
  {
    n: "Audio file",
    two: true,
    conv: true,
    fn: (u, t, i) => {
      const a = 2 + 7 * ab(s(u * 9 + t * 3)) * ab(s(u * 4 - t * 2 + 1));
      return i === 0 ? -a : a;
    },
  },
  {
    n: "Pluck pair",
    two: true,
    noEnv: true,
    fn: (u, _t, i, tau) => {
      const q = fr((tau + i * 0.35) / 1.4) * 1.4;
      return 7 * s(u * P) * s(q * 38) * Math.exp(-q * 3);
    },
  },
  { n: "Static pair", two: true, fn: (u, t, i) => 4 * s(u * 53 + t * 40 + i * 7) * s(u * 17 - t * 27 + i * 3) },
  { n: "Chase", two: true, fn: (u, t, i) => 5 * s(u * (3 + i * 2) * P - t * (6 + i * 3)) },
];

// Two lines that cross over each other (built off "Twin sine").
const sg = (i: number) => (i === 0 ? 1 : -1);
const pluckAt = (tau: number) => {
  const q = fr(tau / 1.4) * 1.4;
  return s(q * 38) * Math.exp(-q * 3);
};

const CROSS_VARIANTS: Variant[] = [
  { n: "Twin sine", two: true, fn: (u, t, i) => 7 * sg(i) * s(u * 4 * P - t * 6) },
  { n: "Tight twist", two: true, conv: true, fn: (u, t, i) => 6 * sg(i) * s(u * 4 * P - t * 6) },
  { n: "Single twist", two: true, conv: true, fn: (u, t, i) => 9 * sg(i) * s(u * 2 * P - t * 4) },
  { n: "Triple twist", two: true, conv: true, fn: (u, t, i) => 5 * sg(i) * s(u * 6 * P - t * 8) },
  {
    n: "Wavy X",
    two: true,
    conv: true,
    noEnv: true,
    fn: (u, t, i) => sg(i) * (1 - 2 * u) * 9 + 2 * s(u * 8 * P - t * 10 + i * P),
  },
  { n: "Weave", two: true, conv: true, fn: (u, t, i) => 7 * s(u * (i === 0 ? 3 : 4) * P - t * 5) },
  { n: "Heartbeat cross", two: true, conv: true, gap: 3, fn: (u, t, i) => sg(i) * 0.75 * ecg(fr(u - t * 0.7)) },
  { n: "Square cross", two: true, conv: true, fn: (u, t, i) => 5 * sg(i) * Math.sign(s(u * 4 * P - t * 6)) },
  {
    n: "Diamond chain",
    two: true,
    conv: true,
    fn: (u, t, i) => 6 * sg(i) * (2 * ab(2 * fr(u * 3 - t * 1.2) - 1) - 1),
  },
  { n: "Sawtooth cross", two: true, conv: true, fn: (u, t, i) => 5 * sg(i) * (2 * fr(u * 3 - t * 1.2) - 1) },
  { n: "Breathing twist", two: true, conv: true, fn: (u, t, i) => 8 * sg(i) * s(u * 3 * P) * s(t * 4) },
  { n: "Jump rope", two: true, conv: true, noEnv: true, fn: (u, t, i) => 10 * sg(i) * s(u * P) * Math.cos(t * 5) },
  {
    n: "Ripple cross",
    two: true,
    conv: true,
    fn: (u, t, i) => 8 * sg(i) * ga((u - 0.5) / 0.22) * s(ab(u - 0.5) * 28 - t * 10),
  },
  {
    n: "Pluck cross",
    two: true,
    conv: true,
    noEnv: true,
    fn: (u, _t, i, tau) => 9 * sg(i) * s(u * P) * pluckAt(tau),
  },
  { n: "Drift", two: true, conv: true, fn: (u, t, i) => 6 * s(u * 4 * P - t * (i === 0 ? 6 : 9)) },
  { n: "Infinity", two: true, conv: true, noEnv: true, fn: (u, t, i) => 9 * sg(i) * s(u * 2 * P) * Math.cos(t * 3) },
  { n: "Cone", two: true, conv: true, noEnv: true, fn: (u, t, i) => 10 * u * sg(i) * s(u * 5 * P - t * 7) },
  {
    n: "Static cross",
    two: true,
    conv: true,
    fn: (u, t, i) => sg(i) * (5 * s(u * 4 * P - t * 6) + 2.5 * s(u * 53 + t * 40) * s(u * 17 - t * 27)),
  },
  {
    n: "Beat",
    two: true,
    conv: true,
    fn: (u, t, i) => 9 * sg(i) * s(u * 10 * P - t * 10) * ab(s(u * P * 1.5 - t * 2)),
  },
  { n: "Wide sine", two: true, fn: (u, t, i) => 9 * sg(i) * s(u * 2.5 * P - t * 4) },
];

// Variations on "Wide sine": two lines stay apart at rest, then cross in different ways.
const wide = (u: number, t: number, i: number, amp = 9, cyc = 2.5, spd = 4, ph = 0) =>
  amp * sg(i) * s(u * cyc * P - t * spd + ph);

const WIDE_VARIANTS: Variant[] = [
  {
    n: "Sliding cross",
    two: true,
    noEnv: true,
    fn: (u, t, i) => {
      const c = 0.5 + 0.32 * s(t * 2);
      return sg(i) * 12 * ease(clamp((u - c) / 0.35 + 0.5));
    },
  },
  { n: "Half cross", two: true, fn: (u, t, i) => wide(u, t, i, 10, 1.2, 3) },
  { n: "Double wide", two: true, fn: (u, t, i) => wide(u, t, i, 9, 4, 5) },
  { n: "Fast wide", two: true, fn: (u, t, i) => wide(u, t, i, 9, 2.5, 9) },
  { n: "Slow wide", two: true, fn: (u, t, i) => wide(u, t, i, 9, 2.5, 1.8) },
  { n: "Counter flow", two: true, fn: (u, t, i) => 9 * sg(i) * s(u * 2.5 * P - t * 4 * sg(i)) },
  { n: "Quarter offset", two: true, fn: (u, t, i) => 10 * s(u * 2.5 * P - t * 4 + i * (P / 2)) },
  { n: "Mixed rhythm", two: true, fn: (u, t, i) => 9 * s(u * (i === 0 ? 2 : 3) * P - t * 4) },
  { n: "Big loops", two: true, fn: (u, t, i) => wide(u, t, i, 12.5, 2, 3.5) },
  { n: "Light touch", two: true, fn: (u, t, i) => wide(u, t, i, 7, 2.5, 4) },
  { n: "Center cross", two: true, noEnv: true, fn: (u, t, i) => 12 * ga((u - 0.5) / 0.28) * sg(i) * s(u * 2.5 * P - t * 4) },
  { n: "Opening", two: true, noEnv: true, fn: (u, t, i) => 12 * u * sg(i) * s(u * 2.5 * P - t * 4) },
  { n: "Closing", two: true, noEnv: true, fn: (u, t, i) => 12 * (1 - u) * sg(i) * s(u * 2.5 * P - t * 4) },
  { n: "Breathing wide", two: true, fn: (u, t, i) => (0.55 + 0.45 * s(t * 3)) * wide(u, t, i, 11, 2.5, 3) },
  { n: "Echo", two: true, fn: (u, t, i) => wide(u, t - i * 0.35, 0, 9, 2.5, 4) * (i === 0 ? 1 : -0.9) },
  { n: "Pendulum", two: true, noEnv: true, fn: (u, t, i) => 11 * sg(i) * s(u * 1.25 * P + 0.4) * Math.cos(t * 3) },
  { n: "Free ends", two: true, noEnv: true, fn: (u, t, i) => wide(u, t, i, 8, 2.5, 4) },
  {
    n: "Zigzag wide",
    two: true,
    fn: (u, t, i) => 9 * sg(i) * (2 * ab(2 * fr(u * 1.25 - t * 0.6) - 1) - 1),
  },
  { n: "Shimmer", two: true, fn: (u, t, i) => wide(u, t, i) + 1.6 * s(u * 22 * P - t * 18 + i) },
  { n: "Lopsided", two: true, fn: (u, t, i) => wide(u, t, i, i === 0 ? 12 : 6, 2.5, 4) },
];

// Built off "Free ends", but each line bends its own way.
// fn returns the top line's offset for i === 0 and the bottom line's for i === 1
// (positive = downward), so the top line has to dip down / the bottom rise up to cross.
const pair =
  (top: (u: number, t: number, tau: number) => number, bot: (u: number, t: number, tau: number) => number) =>
  (u: number, t: number, i: number, tau: number) =>
    i === 0 ? top(u, t, tau) : bot(u, t, tau);
const tri = (x: number) => 2 * ab(2 * fr(x) - 1) - 1;
const sqr = (x: number) => Math.tanh(3 * x);

const BEND_VARIANTS: Variant[] = [
  { n: "Sine over zigzag", two: true, noEnv: true, fn: pair((u, t) => 9 * s(u * 2.5 * P - t * 4), (u, t) => -9 * tri(u * 1.25 - t * 0.6)) },
  { n: "Sine over blocks", two: true, noEnv: true, fn: pair((u, t) => 9 * s(u * 2.5 * P - t * 4), (u, t) => -8 * sqr(s(u * 2 * P - t * 3))) },
  { n: "One hump, many waves", two: true, noEnv: true, fn: pair((u, t) => 12 * s(u * P) * s(t * 3), (u, t) => -8 * s(u * 4 * P - t * 6)) },
  { n: "Big and small", two: true, noEnv: true, fn: pair((u, t) => 11 * s(u * 1.5 * P - t * 3), (u, t) => -6 * s(u * 3.5 * P - t * 6)) },
  { n: "Swinging bow", two: true, noEnv: true, fn: pair((u, t) => 12 * s(u * P) * Math.cos(t * 3), (u, t) => -9 * s(u * 2 * P - t * 4)) },
  { n: "Hanging rope", two: true, noEnv: true, fn: pair((u, t) => 13 * 4 * u * (1 - u) * (0.55 + 0.45 * s(t * 3)), (u, t) => -8 * s(u * 3 * P - t * 4)) },
  { n: "Knot", two: true, noEnv: true, fn: pair((u, t) => 10 * s(u * 2 * P - t * 3), (u, t) => -10 * s(u * 4 * P - t * 6)) },
  { n: "Bounce over wave", two: true, noEnv: true, fn: pair((u, t) => 12 * ab(s(u * 2 * P - t * 3)), (u, t) => -8 * s(u * 2.5 * P - t * 4)) },
  { n: "Pointy over round", two: true, noEnv: true, fn: pair((u, t) => 11 * s(u * 2.5 * P - t * 4) ** 3, (u, t) => -9 * s(u * 2 * P - t * 3 + 1)) },
  { n: "Opposite travel", two: true, noEnv: true, fn: pair((u, t) => 9 * s(u * 2 * P - t * 4), (u, t) => -9 * s(u * 3 * P + t * 5)) },
  { n: "Grow and shrink", two: true, noEnv: true, fn: pair((u, t) => 13 * u * s(u * 2.5 * P - t * 4), (u, t) => -13 * (1 - u) * s(u * 3 * P - t * 5)) },
  { n: "Shark fin", two: true, noEnv: true, fn: pair((u, t) => 9 * (2 * fr(u * 1.5 - t * 0.7) - 1), (u, t) => -9 * s(u * 2.5 * P - t * 4)) },
  { n: "Lazy and quick", two: true, noEnv: true, fn: pair((u, t) => 10 * s(u * 1.5 * P - t * 1.8), (u, t) => -7 * s(u * 4 * P - t * 9)) },
  { n: "Ripple through", two: true, noEnv: true, fn: pair((u, t) => 10 * s(u * 2 * P - t * 3), (u, t) => -11 * ga((u - 0.5) / 0.2) * s(ab(u - 0.5) * 26 - t * 10)) },
  {
    n: "Slide and wave",
    two: true,
    noEnv: true,
    fn: pair(
      (u, t) => 12 * ease(clamp((u - (0.5 + 0.3 * s(t * 2))) / 0.35 + 0.5)),
      (u, t) => -7 * s(u * 3 * P - t * 5),
    ),
  },
  { n: "Heartbeat over sine", two: true, noEnv: true, fn: pair((u, t) => -0.9 * ecg(fr(u - t * 0.6)), (u, t) => -8 * s(u * 2 * P - t * 3)) },
  { n: "Spring over sine", two: true, noEnv: true, fn: pair((u, t) => 9 * s(u * 2 * P - t * 3) + 2 * s(u * 18 * P - t * 16), (u, t) => -9 * s(u * 2 * P - t * 3 + 2)) },
  { n: "Wave over hump", two: true, noEnv: true, fn: pair((u, t) => 9 * s(u * 3 * P - t * 5), (u, t) => -12 * s(u * P) * (0.6 + 0.4 * s(t * 2.5))) },
  { n: "Pluck over sine", two: true, noEnv: true, fn: pair((u, _t, tau) => 13 * s(u * P) * pluckAt(tau), (u, t) => -8 * s(u * 2.5 * P - t * 4)) },
  { n: "Tangled", two: true, noEnv: true, fn: pair((u, t) => 8 * s(u * 2 * P - t * 3) + 4 * s(u * 5 * P + t * 4), (u, t) => -8 * s(u * 3 * P - t * 4 + 1) - 3 * s(u * 7 * P - t * 7)) },
];

// ── Instruments and gear: three menu lines that rebuild into a music object ──
const seg = (x1: number, y1: number, x2: number, y2: number, u: number): Pt => [x1 + (x2 - x1) * u, y1 + (y2 - y1) * u];
const arcPt = (cx: number, cy: number, r: number, a0: number, a1: number, u: number): Pt => {
  const a = a0 + (a1 - a0) * u;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const setA = (el: SVGElement, o: Record<string, number | string>) => {
  for (const k in o) {
    const v = o[k];
    el.setAttribute(k, typeof v === "number" ? v.toFixed(2) : v);
  }
};
const fade = (el: SVGElement, e: number) => {
  el.style.opacity = e.toFixed(3);
};
const FILLED = { fill: "currentColor", stroke: "none" };
const lineX = (el: SVGElement, e: number, x1: number, y1: number, x2: number, y2: number) => {
  setA(el, { x1, y1, x2, y2 });
  fade(el, e);
};
const noteHead = (cx: number, cy: number) => ({ cx, cy, rx: 4.2, ry: 3.1, transform: `rotate(-20 ${cx.toFixed(2)} ${cy.toFixed(2)})` });

const GEAR_VARIANTS: Variant[] = [
  {
    n: "Guitar pluck",
    morph: {
      line: (i, u, _t, tau) => [X0 + W * u, YS[i] + 5 * s(u * P) * pluckAt(tau + 1.4 - i * 0.18)],
      extras: [
        { tag: "line", draw: (el, e) => lineX(el, e, 5, 10, 5, 38) },
        { tag: "line", draw: (el, e) => lineX(el, e, 43, 10, 43, 38) },
      ],
    },
  },
  {
    n: "Mixer faders",
    morph: {
      line: (i, u) => [X0 + W * u, YS[i]],
      extras: [0, 1, 2].map((i) => ({
        tag: "rect",
        init: { ...FILLED, width: "6", height: "10", rx: "2" },
        draw: (el: SVGElement, e: number, t: number) => {
          const x = X0 + W * (0.5 + 0.38 * s(t * 2.2 + i * 2.1)) - 3;
          setA(el, { x, y: YS[i] - 5 });
          fade(el, e);
        },
      })),
    },
  },
  {
    n: "Note drop",
    morph: {
      line: (i, u) => [X0 + W * u, YS[i] + (i - 1) * 1.5],
      extras: [
        {
          tag: "ellipse",
          init: FILLED,
          draw: (el, e, t) => {
            const cy = 29 - (1 - e) * 26 - 1.5 * ab(s(t * 4));
            setA(el, noteHead(28, cy));
            fade(el, e);
          },
        },
        {
          tag: "line",
          draw: (el, e, t) => {
            const cy = 29 - (1 - e) * 26 - 1.5 * ab(s(t * 4));
            lineX(el, e, 31.8, cy - 1, 31.8, cy - 17);
          },
        },
      ],
    },
  },
  {
    n: "Keyboard",
    morph: {
      line: (i, u) => (i === 0 ? seg(8, 11, 40, 11, u) : i === 1 ? seg(8, 11, 8, 37, u) : seg(8, 37, 40, 37, u)),
      extras: [
        { tag: "line", draw: (el, e) => lineX(el, e, 40, 11, 40, 37) },
        ...[16, 24, 32].map((x) => ({ tag: "line", init: { "stroke-width": "2" }, draw: (el: SVGElement, e: number) => lineX(el, e, x, 27, x, 37) })),
        ...[16, 24, 32].map((x, k) => ({
          tag: "rect",
          init: { ...FILLED, width: "4.5", rx: "1" },
          draw: (el: SVGElement, e: number, t: number) => {
            const down = fr(t * 1.4) * 3 >= k && fr(t * 1.4) * 3 < k + 1;
            setA(el, { x: x - 2.25, y: 11, height: down ? 17 : 15 });
            el.style.opacity = (e * (down ? 0.55 : 1)).toFixed(3);
          },
        })),
      ],
    },
  },
  {
    n: "Cassette",
    morph: {
      line: (i, u) => (i === 0 ? seg(6, 12, 42, 12, u) : i === 1 ? seg(15, 29, 33, 29, u) : seg(6, 36, 42, 36, u)),
      extras: [
        { tag: "line", draw: (el, e) => lineX(el, e, 6, 12, 6, 36) },
        { tag: "line", draw: (el, e) => lineX(el, e, 42, 12, 42, 36) },
        ...[16, 32].flatMap((cx) => [
          { tag: "circle", init: { "stroke-width": "2.4" }, draw: (el: SVGElement, e: number) => { setA(el, { cx, cy: 22, r: 4.5 }); fade(el, e); } },
          {
            tag: "line",
            init: { "stroke-width": "2" },
            draw: (el: SVGElement, e: number, t: number) => {
              const a = t * 5;
              lineX(el, e, cx - 3 * Math.cos(a), 22 - 3 * Math.sin(a), cx + 3 * Math.cos(a), 22 + 3 * Math.sin(a));
            },
          },
        ]),
      ],
    },
  },
  {
    n: "Vinyl",
    morph: {
      line: (i, u, t) => arcPt(24, 24, [16, 11, 6][i], t * (3 - i * 0.6) + i, t * (3 - i * 0.6) + i + 2 * P - 1, u),
      extras: [{ tag: "circle", init: FILLED, draw: (el, e) => { setA(el, { cx: 24, cy: 24, r: 1.8 }); fade(el, e); } }],
    },
  },
  {
    n: "Speaker",
    morph: {
      line: (i, u, t) => arcPt(14, 24, 6 + 16 * fr(t * 0.7 + i / 3), -0.85, 0.85, u),
      lineOpacity: (i, t) => 1 - fr(t * 0.7 + i / 3) * 0.85,
      extras: [{ tag: "path", init: { ...FILLED, d: "M3 20h4l6-6v20l-6-6H3z" }, draw: (el, e) => fade(el, e) }],
    },
  },
  {
    n: "VU meter",
    morph: {
      line: (i, u, t) => {
        if (i === 0) return arcPt(24, 36, 21, P + 0.45, 2 * P - 0.45, u);
        if (i === 2) return seg(8, 36, 40, 36, u);
        const a = -P / 2 + 0.75 * s(t * 3) + 0.18 * s(t * 11);
        return seg(24, 36, 24 + 18 * Math.cos(a), 36 + 18 * Math.sin(a), u);
      },
      extras: [{ tag: "circle", init: FILLED, draw: (el, e) => { setA(el, { cx: 24, cy: 36, r: 2.6 }); fade(el, e); } }],
    },
  },
  {
    n: "Drumroll",
    morph: {
      line: (i, u, t) => {
        const liftL = 0.5 + 0.5 * s(t * 14);
        const liftR = 0.5 + 0.5 * s(t * 14 + P);
        if (i === 0) return seg(5, 8, 20, 24 - 8 * liftL, u);
        if (i === 2) return seg(43, 8, 28, 24 - 8 * liftR, u);
        return [X0 + W * u, 28 + 2.5 * s(u * P) * (1 - Math.min(liftL, liftR))];
      },
    },
  },
  {
    n: "Play button",
    morph: {
      line: (i, u, t) => {
        const k = 1 + 0.06 * s(t * 4);
        const [x, y] = i === 0 ? seg(17, 12, 37, 24, u) : i === 1 ? seg(17, 12, 17, 36, u) : seg(17, 36, 37, 24, u);
        return [25 + (x - 25) * k, 24 + (y - 24) * k];
      },
    },
  },
  {
    n: "Eighth notes",
    morph: {
      line: (i, u, t) => {
        const b = 1.5 * s(t * 4);
        const [x, y] = i === 0 ? seg(18, 11, 35, 7, u) : i === 1 ? seg(18, 11, 18, 31, u) : seg(35, 7, 35, 27, u);
        return [x, y + b];
      },
      extras: [
        [14.6, 31.5],
        [31.6, 27.5],
      ].map(([cx, cy]) => ({
        tag: "ellipse",
        init: FILLED,
        draw: (el: SVGElement, e: number, t: number) => {
          setA(el, noteHead(cx, cy + 1.5 * s(t * 4)));
          fade(el, e);
        },
      })),
    },
  },
  {
    n: "Headphones",
    morph: {
      line: (i, u, t) => {
        const b = 0.8 * s(t * 3);
        const [x, y] = i === 0 ? arcPt(24, 28, 14, P, 2 * P, u) : i === 1 ? seg(10, 28, 10, 36, u) : seg(38, 28, 38, 36, u);
        return [x, y + b];
      },
      extras: [7, 35].map((x) => ({
        tag: "rect",
        init: { ...FILLED, width: "6", height: "12", rx: "2.5" },
        draw: (el: SVGElement, e: number, t: number) => {
          setA(el, { x, y: 26 + 0.8 * s(t * 3) });
          fade(el, e);
        },
      })),
    },
  },
];

// ── 50 more music themes (same rule: three plain menu lines at rest) ──
const L4 = (a: number[], u: number) => seg(a[0], a[1], a[2], a[3], u);
const segs = (...a: number[][]) => (i: number, u: number): Pt => L4(a[i], u);
const showOnly = (...keep: number[]) => (i: number) => (keep.includes(i) ? 1 : 0);
const bez = (a: Pt, b: Pt, c: Pt, d: Pt, u: number): Pt => {
  const v = 1 - u;
  return [
    v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0],
    v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1],
  ];
};
const qbez = (a: Pt, c: Pt, b: Pt, u: number): Pt => {
  const v = 1 - u;
  return [v * v * a[0] + 2 * u * v * c[0] + u * u * b[0], v * v * a[1] + 2 * u * v * c[1] + u * u * b[1]];
};
const rotP = (p: Pt, cx: number, cy: number, a: number): Pt => {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  return [cx + (p[0] - cx) * c - (p[1] - cy) * sn, cy + (p[0] - cx) * sn + (p[1] - cy) * c];
};
const beat = (t: number, bpm = 2) => Math.exp(-fr(t * bpm) * 6);
const lvl = (t: number, k: number) => (0.5 + 0.5 * s(t * 6 + k * 1.3)) * (0.6 + 0.4 * s(t * 3.1 + k * 2.3));

const xL = (x1: number, y1: number, x2: number, y2: number, w = 2.6, o = 1): Extra => ({
  tag: "line",
  init: { "stroke-width": String(w) },
  draw: (el, e) => {
    setA(el, { x1, y1, x2, y2 });
    el.style.opacity = (e * o).toFixed(3);
  },
});
const xLd = (f: (t: number, tau: number) => number[], w = 2.6): Extra => ({
  tag: "line",
  init: { "stroke-width": String(w) },
  draw: (el, e, t, tau) => {
    const [x1, y1, x2, y2, o = 1] = f(t, tau);
    setA(el, { x1, y1, x2, y2 });
    el.style.opacity = (e * o).toFixed(3);
  },
});
const xC = (cx: number, cy: number, r: number, filled = false): Extra => ({
  tag: "circle",
  init: filled ? FILLED : { "stroke-width": "2.4" },
  draw: (el, e) => {
    setA(el, { cx, cy, r });
    fade(el, e);
  },
});
const xCd = (f: (t: number) => number[], filled = false): Extra => ({
  tag: "circle",
  init: filled ? FILLED : { "stroke-width": "2.4" },
  draw: (el, e, t) => {
    const [cx, cy, r, o = 1] = f(t);
    setA(el, { cx, cy, r: Math.max(0.1, r) });
    el.style.opacity = (e * o).toFixed(3);
  },
});
const xR = (x: number, y: number, w: number, h: number, rx = 1.5, filled = false): Extra => ({
  tag: "rect",
  init: filled ? FILLED : { "stroke-width": "2.4" },
  draw: (el, e) => {
    setA(el, { x, y, width: w, height: h, rx });
    fade(el, e);
  },
});
const xRd = (f: (t: number) => number[], filled = true): Extra => ({
  tag: "rect",
  init: filled ? FILLED : { "stroke-width": "2.4" },
  draw: (el, e, t) => {
    const [x, y, w, h, rx = 1, o = 1] = f(t);
    setA(el, { x, y, width: Math.max(0.1, w), height: Math.max(0.1, h), rx });
    el.style.opacity = (e * o).toFixed(3);
  },
});
const xP = (d: string, filled = false, w = 2.4): Extra => ({
  tag: "path",
  init: { ...(filled ? FILLED : { "stroke-width": String(w) }), d, "stroke-linejoin": "round" },
  draw: (el, e) => fade(el, e),
});
const xPd = (f: (t: number) => string, filled = false, w = 2.4): Extra => ({
  tag: "path",
  init: { ...(filled ? FILLED : { "stroke-width": String(w) }), "stroke-linejoin": "round" },
  draw: (el, e, t) => {
    el.setAttribute("d", f(t));
    fade(el, e);
  },
});
const xE = (f: (t: number) => number[]): Extra => ({
  tag: "ellipse",
  init: FILLED,
  draw: (el, e, t) => {
    const [cx, cy, rx, ry, deg = 0] = f(t);
    setA(el, { cx, cy, rx, ry, transform: `rotate(${deg.toFixed(1)} ${cx.toFixed(2)} ${cy.toFixed(2)})` });
    fade(el, e);
  },
});
const arrowAt = (cx: number, cy: number, r: number, a: number) => {
  const tip: Pt = [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const tx = -Math.sin(a);
  const ty = Math.cos(a);
  const nx = Math.cos(a);
  const ny = Math.sin(a);
  const b1: Pt = [tip[0] - 4.5 * tx + 3.5 * nx, tip[1] - 4.5 * ty + 3.5 * ny];
  const b2: Pt = [tip[0] - 4.5 * tx - 3.5 * nx, tip[1] - 4.5 * ty - 3.5 * ny];
  return `M${b1[0].toFixed(2)} ${b1[1].toFixed(2)}L${tip[0].toFixed(2)} ${tip[1].toFixed(2)}L${b2[0].toFixed(2)} ${b2[1].toFixed(2)}`;
};
const maraca = (side: number, t: number) => {
  const a = 0.3 * s(t * 10 + (side > 0 ? P : 0));
  const pivot: Pt = [24 + side * 9, 40];
  const tip = rotP([24 + side * 6, 26], pivot[0], pivot[1], a);
  const head = rotP([24 + side * 4.5, 19], pivot[0], pivot[1], a);
  const deg = (Math.atan2(head[1] - pivot[1], head[0] - pivot[0]) * 180) / P + 90;
  return { pivot, tip, head, deg };
};
const KB_LINES = segs([8, 11, 40, 11], [8, 11, 8, 37], [8, 37, 40, 37]);
const KB_EXTRAS: Extra[] = [
  xL(40, 11, 40, 37),
  ...[16, 24, 32].map((x) => xL(x, 27, x, 37, 2)),
  ...[16, 24, 32].map((x) => xR(x - 2.25, 11, 4.5, 15, 1, true)),
];
const pickV = (t: number, k: number): Pt => {
  const a = P / 2 + 0.35 * s(t * 3) + k * ((2 * P) / 3);
  return [24 + 14 * Math.cos(a), 23 + 14 * Math.sin(a)];
};

const MORE_VARIANTS: Variant[] = [
  // Strings and keys
  {
    n: "Bass strings",
    morph: {
      line: (i, u, _t, tau) => [X0 + W * u, YS[i] + 6 * s(u * P) * pluckAt(tau * 0.6 + 1.4 - i * 0.25)],
      extras: YS.map((y) => xC(5, y, 2, true)),
    },
  },
  {
    n: "Harp",
    morph: {
      line: (i, u, t) => {
        const x = [17, 24, 31][i];
        const top = [7.4, 6.3, 7.4][i];
        return [x + 1.2 * s(u * P) * s(t * 30 + i * 2), top + (38 - top) * u];
      },
      extras: [xP("M10 8 Q24 3 38 8 M10 8 V38 H38")],
    },
  },
  {
    n: "Violin bow",
    morph: {
      line: (i, u, t) => [10 + 28 * u, [16, 24, 32][i] + 0.9 * s(u * P) * s(t * 40 + i)],
      extras: [xLd((t) => [24 + 10 * s(t * 3) - 9, 42, 24 + 10 * s(t * 3) + 9, 6], 2)],
    },
  },
  {
    n: "Fretboard",
    morph: {
      line: (i, u) => [X0 + W * u, YS[i]],
      extras: [
        xL(16, 10, 16, 38, 2),
        xL(24, 10, 24, 38, 2),
        xL(32, 10, 32, 38, 2),
        xCd((t) => [20 + 8 * Math.floor(fr(t * 1.1) * 3), YS[Math.floor(fr(t * 0.8) * 3)], 3.2], true),
      ],
    },
  },
  {
    n: "Synth sweep",
    morph: {
      line: KB_LINES,
      extras: [...KB_EXTRAS, xRd((t) => [8 + 8 * Math.floor(fr(t * 1.2) * 4), 11, 8, 26, 0, 0.35])],
    },
  },
  {
    n: "Xylophone",
    morph: {
      line: (i, u, t) => {
        const k = Math.floor(fr(t * 1.5) * 3);
        const shake = k === i ? 1.2 * s(t * 40) * (1 - fr(t * 4.5)) : 0;
        return [10 + i * 3 + (28 - i * 6) * u, YS[i] + shake];
      },
      extras: [
        xLd((t) => {
          const k = Math.floor(fr(t * 1.5) * 3);
          const lift = 4 * s(fr(t * 4.5) * P);
          return [44, 4, 27, YS[k] - 6 - lift];
        }, 2),
        xCd((t) => {
          const k = Math.floor(fr(t * 1.5) * 3);
          const lift = 4 * s(fr(t * 4.5) * P);
          return [26, YS[k] - 4.5 - lift, 2.8];
        }, true),
      ],
    },
  },
  {
    n: "Accordion",
    morph: {
      line: (i, u, t) => {
        const w = 22 + 8 * s(t * 3);
        return [24 - w / 2 + w * u, YS[i] + 3 * tri(u * 4)];
      },
      extras: [
        xRd((t) => [24 - (22 + 8 * s(t * 3)) / 2 - 6, 9, 5, 30, 1.5]),
        xRd((t) => [24 + (22 + 8 * s(t * 3)) / 2 + 1, 9, 5, 30, 1.5]),
      ],
    },
  },
  // Drums and percussion
  {
    n: "Cymbal",
    morph: {
      line: (i, u, t) => {
        if (i === 0) {
          const a = 0.28 * s(t * 9);
          return seg(24 - 14 * Math.cos(a), 14 - 14 * Math.sin(a), 24 + 14 * Math.cos(a), 14 + 14 * Math.sin(a), u);
        }
        return i === 1 ? seg(24, 14, 24, 37, u) : seg(14, 38, 34, 38, u);
      },
      extras: [xL(24, 38, 17, 43, 2), xL(24, 38, 31, 43, 2)],
    },
  },
  {
    n: "Tambourine",
    morph: {
      line: (i, u, t) => {
        const j = 0.18 * s(t * 16);
        return arcPt(24, 24, 12, (i * 2 * P) / 3 + j + 0.25, ((i + 1) * 2 * P) / 3 + j - 0.25, u);
      },
      extras: [0, 1, 2].map((k) =>
        xCd((t) => {
          const a = (k * 2 * P) / 3 + 0.18 * s(t * 16);
          return [24 + 12 * Math.cos(a), 24 + 12 * Math.sin(a), 2.6];
        }, true),
      ),
    },
  },
  {
    n: "Maracas",
    morph: {
      line: (i, u, t) => {
        if (i === 1) return [24, 30];
        const m = maraca(i === 0 ? -1 : 1, t);
        return seg(m.pivot[0], m.pivot[1], m.tip[0], m.tip[1], u);
      },
      lineOpacity: showOnly(0, 2),
      extras: [-1, 1].map((side) =>
        xE((t) => {
          const m = maraca(side, t);
          return [m.head[0], m.head[1], 5, 6.8, m.deg];
        }),
      ),
    },
  },
  {
    n: "Triangle",
    morph: {
      line: (i, u, t) => {
        const a = 0.07 * s(t * 14);
        const p = i === 0 ? seg(24, 8, 11, 34, u) : i === 1 ? seg(11, 34, 37, 34, u) : seg(37, 34, 25.6, 11, u);
        return rotP(p, 24, 8, a);
      },
      extras: [xLd((t) => [42, 44, 30 + 3 * ab(s(t * 7)), 27, 1], 2)],
    },
  },
  {
    n: "Beat pads",
    morph: {
      line: segs([8, 8, 40, 8], [8, 8, 8, 40], [8, 40, 40, 40]),
      extras: [
        xL(40, 8, 40, 40),
        ...Array.from({ length: 9 }, (_, k) =>
          xRd((t) => [11 + (k % 3) * 9.5, 11 + Math.floor(k / 3) * 9.5, 7, 7, 1.5, s(t * 5 + k * 1.7) > 0.3 ? 1 : 0.3]),
        ),
      ],
    },
  },
  {
    n: "Kick drum",
    morph: {
      line: (i, u, t) => arcPt(24, 23, 13 * (1 + 0.1 * beat(t)), (i * 2 * P) / 3, ((i + 1) * 2 * P) / 3, u),
      extras: [xCd((t) => [24, 23, 4.5 * (1 + 0.15 * beat(t))]), xL(15, 34, 11, 42, 2), xL(33, 34, 37, 42, 2)],
    },
  },
  {
    n: "Bongos",
    morph: {
      line: (i, u, t) => {
        const bl = -2.5 * Math.max(0, s(t * 10));
        const br = -2.5 * Math.max(0, s(t * 10 + P));
        return i === 0 ? seg(6, 18 + bl, 21, 18 + bl, u) : i === 2 ? seg(27, 21 + br, 42, 21 + br, u) : seg(21, 27, 27, 27, u);
      },
      extras: [xP("M6 18 L9 38 H18 L21 18"), xP("M27 21 L30 38 H39 L42 21")],
    },
  },
  // Wind and brass
  {
    n: "Saxophone",
    morph: {
      line: (i, u) =>
        i === 0 ? bez([30, 8], [30, 46], [12, 46], [13, 26], u) : i === 1 ? seg(30, 8, 23, 5, u) : seg(13, 26, 8, 20, u),
      extras: [0, 1, 2].map((k) => xCd((t) => [30, 15 + k * 6, 1.8, s(t * 6 - k) > 0 ? 1 : 0.35], true)),
    },
  },
  {
    n: "Trumpet",
    morph: {
      line: (i, u) => (i === 0 ? seg(4, 22, 30, 22, u) : i === 1 ? seg(12, 30, 28, 30, u) : [20, 26]),
      lineOpacity: showOnly(0, 1),
      extras: [
        xL(12, 22, 12, 30, 2),
        xL(28, 22, 28, 30, 2),
        xP("M30 22 L43 14 V30 L30 22"),
        ...[15, 20, 25].map((x, k) => xLd((t) => [x, 14 + 2.5 * Math.max(0, s(t * 8 + k * 2)), x, 22], 2.2)),
      ],
    },
  },
  {
    n: "Flute",
    morph: {
      line: (i, u) => (i === 1 ? seg(5, 31, 43, 17, u) : [24, 24]),
      lineOpacity: showOnly(1),
      extras: [0.35, 0.47, 0.59, 0.71, 0.83].map((p, k) =>
        xCd((t) => [5 + 38 * p, 31 - 14 * p, 1.6, s(t * 5 - k * 0.9) > 0 ? 1 : 0.25], true),
      ),
    },
  },
  {
    n: "Harmonica",
    morph: {
      line: (i, u, t) => {
        const dx = 3 * s(t * 2.5);
        return i === 0 ? seg(7 + dx, 17, 41 + dx, 17, u) : i === 2 ? seg(7 + dx, 31, 41 + dx, 31, u) : seg(7 + dx, 17, 7 + dx, 31, u);
      },
      extras: [
        xLd((t) => [41 + 3 * s(t * 2.5), 17, 41 + 3 * s(t * 2.5), 31]),
        ...Array.from({ length: 6 }, (_, k) =>
          xRd((t) => {
            const dx = 3 * s(t * 2.5);
            const lit = Math.floor(fr(t * 0.7) * 6) === k;
            return [10.5 + k * 5 + dx, 21.5, 3, 5, 0.6, lit ? 1 : 0.4];
          }),
        ),
      ],
    },
  },
  // Studio gear
  {
    n: "Microphone",
    morph: {
      line: (i, u) => (i === 0 ? arcPt(24, 14, 7, 0, 2 * P, u) : i === 1 ? seg(24, 26, 24, 37, u) : seg(16, 39, 32, 39, u)),
      extras: [
        xP("M14 15 Q14 26 24 26 Q34 26 34 15"),
        xL(20, 12, 28, 12, 1.6),
        xL(19.5, 16, 28.5, 16, 1.6),
        xPd((t) => `M38 ${10 - 1.5 * s(t * 5)} q3 4 0 8`, false, 2),
      ],
    },
  },
  {
    n: "Retro mic",
    morph: {
      line: (i, u, t) => [19 + 10 * u, 12.5 + i * 4.5 + 0.5 * s(t * 20 + i * 2) * s(u * P)],
      extras: [xR(14.5, 7, 19, 20, 9.5), xL(24, 27, 24, 37), xL(16, 38.5, 32, 38.5)],
    },
  },
  {
    n: "Guitar amp",
    morph: {
      line: segs([7, 10, 41, 10], [7, 16, 41, 16], [7, 38, 41, 38]),
      extras: [
        xL(7, 10, 7, 38),
        xL(41, 10, 41, 38),
        ...[12, 17, 22].map((x) => xC(x, 13, 1.4, true)),
        xCd((t) => [17, 27, 5.5 * (1 + 0.12 * beat(t))]),
        xCd((t) => [31, 27, 5.5 * (1 + 0.12 * beat(t))]),
        xC(17, 27, 1.4, true),
        xC(31, 27, 1.4, true),
      ],
    },
  },
  {
    n: "Boombox",
    morph: {
      line: (i, u) => (i === 0 ? arcPt(24, 15, 10, P, 2 * P, u) : i === 1 ? seg(5, 16, 43, 16, u) : seg(5, 38, 43, 38, u)),
      extras: [
        xL(5, 16, 5, 38),
        xL(43, 16, 43, 38),
        xCd((t) => [14, 27, 6 * (1 + 0.12 * beat(t, 2))]),
        xCd((t) => [34, 27, 6 * (1 + 0.12 * beat(t + 0.25, 2))]),
        xR(21, 22, 6, 4, 1),
      ],
    },
  },
  {
    n: "Radio dial",
    morph: {
      line: segs([14, 16, 8, 4], [12, 22, 36, 22], [6, 38, 42, 38]),
      extras: [
        xP("M6 38 V16 H42 V38"),
        xLd((t) => [24 + 11 * s(t * 1.6), 19, 24 + 11 * s(t * 1.6), 25], 2),
        xL(10, 30, 26, 30, 1.6),
        xL(10, 34, 26, 34, 1.6),
        xC(34, 31, 3),
      ],
    },
  },
  {
    n: "Click wheel",
    morph: {
      line: (i, u) => (i === 0 ? seg(16, 8, 32, 8, u) : i === 1 ? seg(16, 18, 32, 18, u) : [24, 13]),
      lineOpacity: showOnly(0, 1),
      extras: [
        xR(12, 4, 24, 40, 4),
        xL(16, 8, 16, 18, 2),
        xL(32, 8, 32, 18, 2),
        xC(24, 31, 7),
        xC(24, 31, 2.2),
        xCd((t) => [24 + 4.6 * Math.cos(t * 3), 31 + 4.6 * Math.sin(t * 3), 1.5], true),
      ],
    },
  },
  {
    n: "Turntable",
    morph: {
      line: (i, u, t) => (i === 0 ? seg(38, 11, 30 + 0.6 * s(t * 2), 27, u) : [34, 19]),
      lineOpacity: showOnly(0),
      extras: [
        xR(5, 7, 38, 34, 3),
        xC(21, 24, 11),
        xC(21, 24, 2.6, true),
        xLd((t) => [21 + 4.5 * Math.cos(t * 4), 24 + 4.5 * Math.sin(t * 4), 21 + 8.5 * Math.cos(t * 4), 24 + 8.5 * Math.sin(t * 4)], 1.8),
        xC(38, 11, 2, true),
      ],
    },
  },
  {
    n: "Volume knob",
    morph: {
      line: (i, u) => {
        const a = P * 0.75 + i * P * 0.75;
        return seg(24 + 15 * Math.cos(a), 24 + 15 * Math.sin(a), 24 + 19 * Math.cos(a), 24 + 19 * Math.sin(a), u);
      },
      extras: [
        xC(24, 24, 11),
        xLd((t) => {
          const a = P * 0.75 + 1.5 * P * (0.5 + 0.5 * s(t * 1.5));
          return [24 + 3 * Math.cos(a), 24 + 3 * Math.sin(a), 24 + 9 * Math.cos(a), 24 + 9 * Math.sin(a)];
        }),
      ],
    },
  },
  {
    n: "Volume slider",
    morph: {
      line: (i, u) => (i === 1 ? seg(15, 24, 42, 24, u) : [24, 24]),
      lineOpacity: showOnly(1),
      extras: [
        xP("M3 21h3l4-4v14l-4-4H3z", true),
        xLd((t) => [15, 24, 15 + 27 * (0.5 + 0.45 * s(t * 1.6)), 24], 5),
        xCd((t) => [15 + 27 * (0.5 + 0.45 * s(t * 1.6)), 24, 3.8], true),
      ],
    },
  },
  {
    n: "Playhead",
    morph: {
      line: (i, u) =>
        i === 1 ? [6 + 36 * u, 24 + 8 * s(u * 7 * P) * ab(s(u * 3.1 + 1))] : i === 0 ? seg(6, 9, 42, 9, u) : seg(6, 39, 42, 39, u),
      extras: [
        xLd((t) => [6 + 36 * fr(t * 0.4), 7, 6 + 36 * fr(t * 0.4), 41], 2),
        xCd((t) => [6 + 36 * fr(t * 0.4), 7, 2.2], true),
      ],
    },
  },
  // Player controls
  {
    n: "Record",
    morph: {
      line: (i, u, t) => arcPt(24, 24, 13, (i * 2 * P) / 3 + t * 1.5 + 0.2, ((i + 1) * 2 * P) / 3 + t * 1.5 - 0.2, u),
      extras: [xCd((t) => [24, 24, 6 + 1.2 * s(t * 5)], true)],
    },
  },
  {
    n: "Pause",
    morph: {
      line: (i, u) => seg(i === 2 ? 30 : 18, 14, i === 2 ? 30 : 18, 34, u),
      lineOpacity: () => 0,
      extras: [xRd((t) => [14, 12 + 2 * s(t * 4), 8, 24 - 4 * s(t * 4), 2]), xRd((t) => [26, 12 - 2 * s(t * 4), 8, 24 + 4 * s(t * 4), 2])],
    },
  },
  {
    n: "Next track",
    morph: {
      line: (i, u, t) => {
        const dx = 2.5 * Math.max(0, s(t * 4));
        const p = L4([[13, 12, 30, 24], [13, 12, 13, 36], [13, 36, 30, 24]][i], u);
        return [p[0] + dx, p[1]];
      },
      extras: [xLd((t) => [34 + 2.5 * Math.max(0, s(t * 4)), 12, 34 + 2.5 * Math.max(0, s(t * 4)), 36])],
    },
  },
  {
    n: "Shuffle",
    morph: {
      line: (i, u) => (i === 0 ? bez([6, 34], [20, 34], [26, 14], [40, 14], u) : i === 2 ? bez([6, 14], [20, 14], [26, 34], [40, 34], u) : [24, 24]),
      lineOpacity: showOnly(0, 2),
      extras: [xPd((t) => `M${36 + 1.5 * s(t * 5)} 10l4 4-4 4`), xPd((t) => `M${36 + 1.5 * s(t * 5 + P)} 30l4 4-4 4`)],
    },
  },
  {
    n: "Repeat",
    morph: {
      line: (i, u, t) =>
        i === 0 ? arcPt(24, 24, 13, -P * 0.92 + t * 2, -0.35 + t * 2, u) : i === 2 ? arcPt(24, 24, 13, P * 0.08 + t * 2, P * 0.65 + t * 2, u) : [24, 24],
      lineOpacity: showOnly(0, 2),
      extras: [xPd((t) => arrowAt(24, 24, 13, -0.35 + t * 2)), xPd((t) => arrowAt(24, 24, 13, P * 0.65 + t * 2))],
    },
  },
  {
    n: "Playlist",
    morph: {
      line: (i, u) => seg(8, YS[i], i === 2 ? 24 : 34, YS[i], u),
      extras: [xE((t) => [33, 35 - 1.5 * ab(s(t * 4)), 4.2, 3.1, -20]), xLd((t) => [36.8, 34 - 1.5 * ab(s(t * 4)), 36.8, 20 - 1.5 * ab(s(t * 4))])],
    },
  },
  {
    n: "Now playing list",
    morph: {
      line: (i, u) => seg(18, YS[i], 40, YS[i], u),
      extras: [7, 10.5, 14].map((x, k) => xLd((t) => [x, 17, x, 17 - (2 + 6 * lvl(t, k))], 2.2)),
    },
  },
  {
    n: "Karaoke",
    morph: {
      line: (i, u) => [X0 + W * u, YS[i]],
      extras: [0, 1, 2].map((k) =>
        xLd((t) => {
          const p = clamp(fr(t * 0.35) * 3 - k);
          return [X0, YS[k], X0 + W * p, YS[k], p > 0 ? 0.4 : 0];
        }, 7),
      ),
    },
  },
  // Concert
  {
    n: "Concert ticket",
    morph: {
      line: segs([6, 14, 42, 14], [31, 16, 31, 32], [6, 34, 42, 34]),
      lineStyle: (el, i, e) => {
        el.style.strokeDasharray = i === 1 && e > 0.5 ? "2 2.6" : "";
      },
      extras: [xP("M6 14 V20 A4 4 0 0 1 6 28 V34"), xP("M42 14 V20 A4 4 0 0 0 42 28 V34"), xPd((t) => `M15 ${26 - ab(s(t * 4))} l3 -6 l3 6 l-6 -4 h6 z`, true, 1)],
    },
  },
  {
    n: "Guitar pick",
    morph: {
      line: (i, u, t) => {
        const a = pickV(t, i);
        const b = pickV(t, i + 1);
        const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const c: Pt = [24 + (mid[0] - 24) * 1.6, 23 + (mid[1] - 23) * 1.6];
        return qbez(a, c, b, u);
      },
    },
  },
  {
    n: "Tuning fork",
    morph: {
      line: (i, u, t) => {
        const v = 1.1 * s(t * 40) * (1 - u);
        return i === 0 ? [20 - v, 6 + 18 * u] : i === 2 ? [28 + v, 6 + 18 * u] : seg(24, 30, 24, 42, u);
      },
      extras: [xP("M20 24 Q20 30 24 30 Q28 30 28 24"), xPd((t) => `M33 ${9 + ab(s(t * 6))} q4 5 0 10`, false, 2), xPd((t) => `M15 ${9 + ab(s(t * 6))} q-4 5 0 10`, false, 2)],
    },
  },
  {
    n: "Metronome",
    morph: {
      line: (i, u, t) => {
        if (i === 0) return seg(12, 40, 20, 8, u);
        if (i === 2) return seg(36, 40, 28, 8, u);
        const a = 0.55 * s(t * 3.2);
        return rotP(seg(24, 36, 24, 12, u), 24, 36, a);
      },
      extras: [xL(10, 40, 38, 40), xL(20, 8, 28, 8), xCd((t) => {
        const p = rotP([24, 20], 24, 36, 0.55 * s(t * 3.2));
        return [p[0], p[1], 2.6];
      }, true)],
    },
  },
  {
    n: "Pulse rings",
    morph: {
      line: (i, u, t) => arcPt(24, 24, 3 + 19 * fr(t * 0.6 + i / 3), 0, 2 * P, u),
      lineOpacity: (i, t) => 1 - fr(t * 0.6 + i / 3),
      extras: [xC(24, 24, 2.4, true)],
    },
  },
  // Visualizers
  {
    n: "Graphic EQ",
    morph: {
      line: (i, u) => seg(14 + i * 10, 8, 14 + i * 10, 40, u),
      extras: [0, 1, 2].map((i) => xRd((t) => [9 + i * 10, 21 + 12 * s(t * 2 + i * 1.9), 10, 6, 2])),
    },
  },
  {
    n: "Radial spectrum",
    morph: {
      line: (i, u) => arcPt(24, 24, 7, (i * 2 * P) / 3, ((i + 1) * 2 * P) / 3, u),
      extras: Array.from({ length: 12 }, (_, k) =>
        xLd((t) => {
          const a = (k * 2 * P) / 12;
          const r2 = 11 + 8 * lvl(t, k);
          return [24 + 10.5 * Math.cos(a), 24 + 10.5 * Math.sin(a), 24 + r2 * Math.cos(a), 24 + r2 * Math.sin(a)];
        }, 2),
      ),
    },
  },
  {
    n: "Oscilloscope",
    morph: {
      line: (i, u, t) => (i === 1 ? [6 + 36 * u, 24 + 8 * s(u * 4 * P - t * 7) * ab(s(t * 1.3 + 0.6))] : i === 0 ? seg(6, 9, 42, 9, u) : seg(6, 39, 42, 39, u)),
      extras: [xL(6, 9, 6, 39), xL(42, 9, 42, 39), xL(24, 11, 24, 37, 1.2, 0.35), xL(8, 24, 40, 24, 1.2, 0.35)],
    },
  },
  {
    n: "Piano roll",
    morph: {
      line: (i, u, t) => {
        const left = 4 + 40 * fr(i * 0.37 - t * 0.3);
        const len = [14, 8, 11][i];
        return [Math.min(left + len * u, 44), YS[i]];
      },
      extras: [xL(24, 8, 24, 40, 1.4, 0.4)],
    },
  },
  {
    n: "Rhythm dashes",
    morph: {
      line: (i, u) => [X0 + W * u, YS[i]],
      lineStyle: (el, i, e, t) => {
        const pat = [[6, 4], [2, 3], [10, 3, 2, 3]][i];
        el.style.strokeDasharray = e > 0.02 ? pat.map((v, k) => (k % 2 ? v * e : v + (1 - e) * 20)).join(" ") : "";
        el.style.strokeDashoffset = (-t * 12 * (i + 1)).toFixed(2);
      },
    },
  },
  {
    n: "Treble clef",
    morph: {
      line: (i, u) => [X0 + W * u, YS[i]],
      extras: [
        {
          tag: "path",
          init: {
            d: "M24 5 C31 9 30 16 22 22 C14 28 18 36 25 35 C31 34 31 26 25 25 C20 24 19 30 23 31 M24 5 L26 40 C26 44 20 44 20 40",
            pathLength: "1",
            "stroke-dasharray": "1",
            "stroke-width": "2.4",
            "stroke-linejoin": "round",
          },
          draw: (el, e) => {
            el.style.strokeDashoffset = (1 - e).toFixed(3);
            el.style.opacity = e > 0.01 ? "1" : "0";
          },
        },
      ],
    },
  },
  {
    n: "Scrolling score",
    morph: {
      line: (i, u) => [X0 + W * u, YS[i]],
      extras: [0, 1, 2].flatMap((k) => {
        const pos = (t: number) => 44 - 40 * fr(t * 0.35 + k / 3);
        const y = [19, 29, 24][k];
        const o = (t: number) => s(P * fr(t * 0.35 + k / 3));
        return [xE((t) => [pos(t), y, 3.6, 2.7, -20]), xLd((t) => [pos(t) + 3.2, y - 1, pos(t) + 3.2, y - 13, o(t)], 2)];
      }),
    },
  },
  {
    n: "Stage lights",
    morph: {
      line: (i, u, t) => seg(12 + i * 12, 7, 12 + i * 12 + 10 * s(t * 1.5 + i * 1.3), 40, u),
      extras: [...[12, 24, 36].map((x) => xR(x - 3.5, 2, 7, 5, 1.5, true)), xL(5, 43, 43, 43, 2)],
    },
  },
  {
    n: "Stereo meter",
    morph: {
      line: (i, u, t) => [X0 + W * (0.25 + 0.75 * lvl(t, i)) * u, YS[i]],
    },
  },
];

// ── Vinyl versions: three lines curl into a record, each with its own hover motion ──
type VOpts = { cx?: number; cy?: number; sx?: number; sy?: number; rs?: number[]; gap?: number };
const vg = (i: number, u: number, rot: number, o: VOpts = {}): Pt => {
  const { cx = 24, cy = 24, sx = 1, sy = 1, rs = [16, 11, 6], gap = 1 } = o;
  const a = rot + i * 1.1 + (2 * P - gap) * u;
  return [cx + rs[i] * Math.cos(a) * sx, cy + rs[i] * Math.sin(a) * sy];
};
const bounceOut = (x: number) => {
  const n = 7.5625;
  const d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};
const LABEL = xC(24, 24, 1.8, true);
const wedge = (cx: number, cy: number, r: number, a: number, span = 1.1) =>
  `M${cx} ${cy}L${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}A${r} ${r} 0 0 1 ${(cx + r * Math.cos(a + span)).toFixed(2)} ${(cy + r * Math.sin(a + span)).toFixed(2)}Z`;
const spinUp = (tau: number) => (tau < 1 ? 4 * tau * tau : 4 + 8 * (tau - 1));

const VINYL_VARIANTS: Variant[] = [
  { n: "Classic spin", morph: { line: (i, u, t) => vg(i, u, t * 3), extras: [LABEL] } },
  {
    n: "Needle drop",
    morph: {
      line: (i, u, t) => vg(i, u, t * 3, { cx: 21, rs: [15, 10, 5] }),
      extras: [
        xC(41, 8, 2, true),
        xLd((_t, tau) => {
          const k = ease(clamp(tau * 1.4));
          return [41, 8, 43 - 11 * k, 24 - 3 * k];
        }, 2.2),
        xC(21, 24, 1.6, true),
      ],
    },
  },
  { n: "DJ scratch", morph: { line: (i, u, t) => vg(i, u, 1.2 * s(t * 6) + 0.6 * s(t * 13)), extras: [LABEL] } },
  {
    n: "Spin up",
    morph: {
      line: (i, u, _t, tau) => vg(i, u, spinUp(tau)),
      extras: [LABEL],
    },
  },
  {
    n: "Tilted deck",
    morph: {
      line: (i, u, t) => vg(i, u, t * 3, { cy: 26, sy: 0.5 + 0.08 * s(t * 4) }),
      extras: [xE(() => [24, 26, 2.4, 1.3])],
    },
  },
  { n: "Flip side", morph: { line: (i, u, t) => vg(i, u, t * 2, { sx: Math.cos(t * 3) }), extras: [xE((t) => [24, 24, 1.8 * ab(Math.cos(t * 3)) + 0.1, 1.8])] } },
  {
    n: "Drop and bounce",
    morph: {
      line: (i, u, t, tau) => vg(i, u, t * 3, { cy: 24 - 20 * (1 - bounceOut(clamp(tau * 1.5))) }),
      extras: [xCd((t) => [24, 24, 1.8])],
    },
  },
  {
    n: "Bass pulse",
    morph: {
      line: (i, u, t) => {
        const k = 1 + 0.14 * beat(t - i * 0.06, 2);
        return vg(i, u, t * 2, { rs: [16 * k, 11 * k, 6 * k] });
      },
      extras: [xCd((t) => [24, 24, 1.8 + 1.2 * beat(t, 2)], true)],
    },
  },
  {
    n: "Label spin",
    morph: {
      line: (i, u, t) => vg(i, u, t * 3, { rs: [18, 14, 10] }),
      extras: [xC(24, 24, 6), xPd((t) => wedge(24, 24, 6, t * 3), true)],
    },
  },
  {
    n: "Sleeve slide",
    morph: {
      line: (i, u, t, tau) => vg(i, u, t * 3, { cx: 18 + 13 * ease(clamp(tau * 1.2)), rs: [12, 8, 4] }),
      extras: [xR(4, 10, 26, 28, 2)],
    },
  },
  {
    n: "Spiral groove",
    morph: {
      line: (i, u, t) => {
        const k = i + u;
        const a = -t * 3 + k * 2 * P;
        const r = 17 - k * 4.2;
        return [24 + r * Math.cos(a), 24 + r * Math.sin(a)];
      },
      extras: [LABEL],
    },
  },
  {
    n: "Sound out",
    morph: {
      line: (i, u, t) => vg(i, u, t * 3, { cx: 21, rs: [14, 9.5, 5] }),
      extras: [
        xC(21, 24, 1.6, true),
        ...[0, 0.5].map((off) =>
          xPd((t) => {
            const r = 17 + 6 * fr(t * 1.4 + off);
            const a0 = -0.55;
            const a1 = 0.55;
            return `M${(21 + r * Math.cos(a0)).toFixed(2)} ${(24 + r * Math.sin(a0)).toFixed(2)}A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${(21 + r * Math.cos(a1)).toFixed(2)} ${(24 + r * Math.sin(a1)).toFixed(2)}`;
          }, false, 2),
        ),
      ],
    },
  },
  {
    n: "Dashed grooves",
    morph: {
      line: (i, u) => vg(i, u, 0, { gap: 0.001 }),
      lineStyle: (el, i, e, t) => {
        el.style.strokeDasharray = e > 0.03 ? `${(5 + (1 - e) * 40).toFixed(2)} ${(3 * e).toFixed(2)}` : "";
        el.style.strokeDashoffset = (-t * 18 * (1 - i * 0.25)).toFixed(2);
      },
      extras: [LABEL],
    },
  },
  {
    n: "Notes fly out",
    morph: {
      line: (i, u, t) => vg(i, u, t * 3, { cx: 20, cy: 27, rs: [14, 9.5, 5] }),
      extras: [
        xC(20, 27, 1.6, true),
        ...[0, 1].flatMap((k) => {
          const p = (t: number) => fr(t * 0.8 + k / 2);
          const x = (t: number) => 34 + k * 5 + 2 * s(t * 4 + k);
          const y = (t: number) => 22 - 16 * p(t);
          return [
            xE((t) => [x(t), y(t), 2.6, 2, -20]),
            xLd((t) => [x(t) + 2.2, y(t) - 0.5, x(t) + 2.2, y(t) - 8, s(P * p(t))], 1.8),
          ];
        }),
      ],
    },
  },
  {
    n: "CD shine",
    morph: {
      line: (i, u, t) => vg(i, u, t * 2, { rs: [16, 11, 4], gap: 0.25 }),
      extras: [0, P].map((off) =>
        xLd((t) => {
          const a = t * 2.5 + off - 0.6;
          return [24 + 6 * Math.cos(a), 24 + 6 * Math.sin(a), 24 + 14.5 * Math.cos(a), 24 + 14.5 * Math.sin(a), 0.6];
        }, 1.6),
      ),
    },
  },
  { n: "Rewind and play", morph: { line: (i, u, t) => vg(i, u, 3 * t - 6 * s(t * 2.2)), extras: [LABEL] } },
  {
    n: "Glow rings",
    morph: {
      line: (i, u, t) => vg(i, u, t * 2),
      lineOpacity: (i, t) => (Math.floor(fr(t * 1.2) * 3) === i ? 1 : 0.35),
      extras: [LABEL],
    },
  },
  {
    n: "Groove jitter",
    morph: {
      line: (i, u, t) => vg(i, u, t * 3, { rs: [14 + 3 * lvl(t, 0), 9.5 + 2.5 * lvl(t, 1), 5 + 1.5 * lvl(t, 2)] }),
      extras: [LABEL],
    },
  },
  {
    n: "Beat bounce",
    morph: {
      line: (i, u, t) => {
        const k = 1 + 0.1 * beat(t, 2);
        return vg(i, u, t * 3, { cy: 24 - 2.5 * beat(t, 2), rs: [16 * k, 11 * k, 6 * k] });
      },
      extras: [xCd((t) => [24, 24 - 2.5 * beat(t, 2), 1.8], true)],
    },
  },
  { n: "Tick tock", morph: { line: (i, u, t) => vg(i, u, (Math.floor(t * 3) + ease(fr(t * 3))) * 0.8), extras: [LABEL] } },
];

// ── Still reads as a menu: vinyl ideas that never hide the three lines ──
const spinArc = (cx: number, cy: number, r: number, a: number, span = 4.6) =>
  `M${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}A${r} ${r} 0 1 1 ${(cx + r * Math.cos(a + span)).toFixed(2)} ${(cy + r * Math.sin(a + span)).toFixed(2)}`;
const grooveLine = (i: number, u: number, ro: number): Pt => {
  const cy = 62;
  const r = cy - YS[i];
  const half = Math.asin(16 / r);
  const a = -P / 2 - half + 2 * half * u + ro;
  return [24 + r * Math.cos(a), cy + r * Math.sin(a)];
};
const miniRecord = (cx: number, cy: number, r: number): Extra[] => [
  xPd((t) => spinArc(cx, cy, r, t * 4), false, 2.4),
  xPd((t) => spinArc(cx, cy, r * 0.5, t * 4 + 2, 4), false, 1.8),
  xC(cx, cy, 1.3, true),
];

const MENU_IDEA_VARIANTS: Variant[] = [
  {
    n: "1 · Mini record",
    morph: { line: (i, u) => (i === 2 ? seg(8, 34, 27, 34, u) : [X0 + W * u, YS[i]]), extras: miniRecord(36, 34, 6) },
  },
  {
    n: "1 · Record + list",
    morph: { line: (i, u) => seg(20, YS[i], 40, YS[i], u), extras: miniRecord(10, 24, 7.5) },
  },
  {
    n: "1 · Record on top line",
    morph: { line: (i, u) => (i === 0 ? seg(8, 14, 27, 14, u) : [X0 + W * u, YS[i]]), extras: miniRecord(36, 14, 6) },
  },
  { n: "2 · Groove lines", morph: { line: (i, u, t) => grooveLine(i, u, 0.12 * s(t * 2.5)) } },
  {
    n: "2 · Groove drift",
    morph: {
      line: (i, u) => grooveLine(i, u, 0),
      lineStyle: (el, i, e, t) => {
        el.style.strokeDasharray = e > 0.03 ? `${(8 + (1 - e) * 40).toFixed(2)} ${(2.6 * e).toFixed(2)}` : "";
        el.style.strokeDashoffset = (-t * 14 * (1 + i * 0.3)).toFixed(2);
      },
    },
  },
  {
    n: "2 · Grooves + label",
    morph: {
      line: (i, u, t) => grooveLine(i, u, 0.1 * s(t * 2.5)),
      extras: [xCd((t) => [24 + 4 * s(t * 2.5), 44, 2.2], true)],
    },
  },
  { n: "3 · Curl on click", twoStage: true, morph: { line: (i, u, t) => vg(i, u, t * 3), extras: [LABEL] } },
  { n: "3 · Needle on click", twoStage: true, morph: VINYL_VARIANTS[1].morph },
  { n: "3 · Sleeve on click", twoStage: true, morph: VINYL_VARIANTS[9].morph },
];

// ── Menu-safe music ideas: the three lines always stay readable ──
const pickPath = (x: number, y: number) =>
  `M${(x - 3.6).toFixed(2)} ${(y - 3).toFixed(2)}Q${x.toFixed(2)} ${(y - 4.4).toFixed(2)} ${(x + 3.6).toFixed(2)} ${(y - 3).toFixed(2)}Q${(x + 3).toFixed(2)} ${(y + 1.5).toFixed(2)} ${x.toFixed(2)} ${(y + 4).toFixed(2)}Q${(x - 3).toFixed(2)} ${(y + 1.5).toFixed(2)} ${(x - 3.6).toFixed(2)} ${(y - 3).toFixed(2)}Z`;
const strumY = (t: number) => 5 + 38 * fr(t * 1.1);
const sinceStrum = (t: number, y: number) => {
  const py = strumY(t);
  return py >= y ? (py - y) / 38 / 1.1 : 9;
};
const reel = (cx: number, cy: number): Extra[] => [
  xC(cx, cy, 4.3),
  xLd((t) => [cx - 2.6 * Math.cos(t * 5), cy - 2.6 * Math.sin(t * 5), cx + 2.6 * Math.cos(t * 5), cy + 2.6 * Math.sin(t * 5)], 1.8),
];
const walkY = [24, 19, 14, 19, 24, 29, 34, 29];
const SEQ = [
  [1, 0, 0, 1, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
];
const step = (t: number) => Math.floor(fr(t * 1.2) * 8);
const stickLift = (t: number, ph: number) => 0.5 + 0.5 * s(t * 13 + ph);

const SAFE_VARIANTS: Variant[] = [
  {
    n: "String pluck",
    morph: {
      line: (i, u, _t, tau) => [X0 + W * u, YS[i] + 2.4 * s(u * P) * pluckAt(tau + 1.4 - i * 0.15)],
      extras: YS.map((y) => xC(4.5, y, 1.7, true)),
    },
  },
  {
    n: "Strum",
    morph: {
      line: (i, u, t) => [X0 + W * u, YS[i] + 1.8 * s(u * P) * s(t * 45) * Math.exp(-sinceStrum(t, YS[i]) * 5)],
      extras: [xPd((t) => pickPath(31, strumY(t)), true)],
    },
  },
  {
    n: "Headphones on",
    morph: {
      line: (i, u, t) => seg(15, 16 + i * 8 - 1.3 * beat(t, 2) * (i === 1 ? 1 : 0.5), 33, 16 + i * 8 - 1.3 * beat(t, 2) * (i === 1 ? 1 : 0.5), u),
      extras: [xP("M9 27 V22 A15 15 0 0 1 39 22 V27"), xR(5.5, 22, 6.5, 12, 2.6, true), xR(36, 22, 6.5, 12, 2.6, true)],
    },
  },
  {
    n: "Speaker",
    morph: {
      line: (i, u, t) => seg(21, YS[i], 40 + 1.5 * beat(t + i * 0.08, 2), YS[i], u),
      extras: [
        xP("M2 20h4l6-6v20l-6-6H2z", true),
        xPd((t) => {
          const r = 3 + 3 * fr(t * 2);
          return `M${14 + r * 0.5} ${24 - r}q${r * 0.7} ${r} 0 ${2 * r}`;
        }, false, 2),
      ],
    },
  },
  {
    n: "Singer",
    morph: {
      line: (i, u, t) => seg(20, YS[i], 26 + 14 * lvl(t, i), YS[i], u),
      extras: [xR(4.5, 8, 9, 15, 4.5), xL(6.5, 13, 11.5, 13, 1.4), xL(6.5, 17, 11.5, 17, 1.4), xL(9, 23, 9, 35, 2), xL(5, 37, 13, 37, 2)],
    },
  },
  {
    n: "Drumsticks",
    morph: {
      line: (i, u, t) => [X0 + W * u, YS[i] + (i === 0 ? 1.6 * s(u * P) * (1 - Math.min(stickLift(t, 0), stickLift(t, P))) : 0)],
      extras: [
        xLd((t) => [5, 2, 19, 12 - 6 * stickLift(t, 0)], 2.2),
        xLd((t) => [43, 2, 29, 12 - 6 * stickLift(t, P)], 2.2),
      ],
    },
  },
  {
    n: "Note walk",
    morph: {
      line: (i, u) => [X0 + W * u, YS[i]],
      extras: [
        xE((t) => [6 + 36 * fr(t * 0.5), walkY[Math.floor(fr(t * 0.5) * 8)], 3.6, 2.7, -20]),
        xLd((t) => {
          const x = 6 + 36 * fr(t * 0.5) + 3.2;
          const y = walkY[Math.floor(fr(t * 0.5) * 8)];
          return [x, y - 1, x, y - 12];
        }, 2),
      ],
    },
  },
  {
    n: "Step sequencer",
    morph: {
      line: (i, u) => [X0 + W * u, YS[i]],
      extras: [
        xLd((t) => [10 + step(t) * 4, 9, 10 + step(t) * 4, 39, 0.35], 1.4),
        ...[0, 1, 2].map((i) => xCd((t) => [10 + step(t) * 4, YS[i], 3, SEQ[i][step(t)] ? 1 : 0], true)),
      ],
    },
  },
  {
    n: "Cassette tape",
    morph: {
      line: (i, u) => (i === 1 ? seg(14, 24, 34, 24, u) : [X0 + W * u, YS[i]]),
      extras: [...reel(9, 24), ...reel(39, 24)],
    },
  },
  {
    n: "Keys underline",
    morph: {
      line: (i, u) => (i === 2 ? seg(8, 31, 40, 31, u) : [X0 + W * u, YS[i] - 2]),
      extras: [
        xL(8, 40, 40, 40, 2.2),
        xL(8, 31, 8, 40, 2.2),
        xL(40, 31, 40, 40, 2.2),
        ...[16, 24, 32].map((x) => xL(x, 36, x, 40, 1.6)),
        ...[16, 24, 32].map((x, k) =>
          xRd((t) => [x - 1.6, 31, 3.2, Math.floor(fr(t * 1.5) * 3) === k ? 6 : 5, 0.6, Math.floor(fr(t * 1.5) * 3) === k ? 0.55 : 1]),
        ),
      ],
    },
  },
  {
    n: "Xylophone bars",
    morph: {
      line: (i, u, t) => {
        const k = Math.floor(fr(t * 1.5) * 3);
        const shake = k === i ? 1.1 * s(t * 40) * (1 - fr(t * 4.5)) : 0;
        return seg(8 + i * 3, YS[i] + shake, 40 - i * 3, YS[i] + shake, u);
      },
      extras: [
        xLd((t) => {
          const k = Math.floor(fr(t * 1.5) * 3);
          return [45, 3, 31, YS[k] - 5 - 3.5 * s(fr(t * 4.5) * P)];
        }, 1.8),
        xCd((t) => {
          const k = Math.floor(fr(t * 1.5) * 3);
          return [30, YS[k] - 4 - 3.5 * s(fr(t * 4.5) * P), 2.6];
        }, true),
      ],
    },
  },
  {
    n: "Horn flare",
    morph: {
      line: (i, u, t) => [X0 + W * u, YS[i] + (i - 1) * 6.5 * u * u * u * (1 + 0.12 * s(t * 6))],
      extras: [0, 0.5].map((off) =>
        xPd((t) => {
          const p = fr(t * 1.6 + off);
          const x = 42 + 4 * p;
          return `M${x.toFixed(2)} ${(18 - 4 * p).toFixed(2)}q${(3 + 2 * p).toFixed(2)} ${(6 + 4 * p).toFixed(2)} 0 ${(12 + 8 * p).toFixed(2)}`;
        }, false, 2),
      ),
    },
  },
  {
    n: "Wave tails",
    morph: {
      line: (i, u, t) => {
        const k = clamp((u - 0.5) / 0.5);
        return [X0 + W * u, YS[i] + 3.2 * k * s(k * 9 - t * 10 + i * 1.3)];
      },
    },
  },
  {
    n: "Echo",
    morph: {
      line: (i, u) => [X0 + W * u, YS[i]],
      extras: [0, 1, 2].flatMap((i) =>
        [0, 0.5].map((g) =>
          xLd((t) => {
            const p = fr(t * 1.1 + g + i * 0.15);
            return [8 + 7 * p, YS[i], 40 + 7 * p, YS[i], 0.45 * (1 - p)];
          }, 3),
        ),
      ),
    },
  },
  {
    n: "Crossfader",
    morph: {
      line: (i, u, t) => {
        const f = s(t * 2);
        if (i === 0) return seg(8, 14, 8 + 32 * (0.55 - 0.45 * f), 14, u);
        if (i === 2) return seg(8, 34, 8 + 32 * (0.55 + 0.45 * f), 34, u);
        return [X0 + W * u, 24];
      },
      extras: [xRd((t) => [24 + 12 * s(t * 2) - 4, 20, 8, 8, 2])],
    },
  },
  {
    n: "Metronome",
    morph: {
      line: (i, u) => seg(6, YS[i], 27, YS[i], u),
      extras: [
        xP("M34 41 L37.5 8 H41.5 L45 41 Z", false, 2),
        xLd((t) => {
          const p = rotP([39.5, 14], 39.5, 37, 0.28 * s(t * 4));
          return [39.5, 37, p[0], p[1]];
        }, 1.8),
        xCd((t) => {
          const p = rotP([39.5, 21], 39.5, 37, 0.28 * s(t * 4));
          return [p[0], p[1], 2];
        }, true),
      ],
    },
  },
];

// ── Three vertical lines that move like sound ──
const VX = [14, 24, 34];
const restV = (i: number, u: number): Pt => [VX[i], 10 + 28 * u];
const vbar = (i: number, u: number, H: number, bottom = false): Pt =>
  bottom ? [VX[i], 38 - H + H * u] : [VX[i], 24 - H / 2 + H * u];

const VERT_VARIANTS: Variant[] = [
  { n: "Bouncing bars", morph: { rest: restV, line: (i, u, t) => vbar(i, u, 6 + 28 * lvl(t, i * 2)) } },
  {
    n: "Center peak pulse",
    morph: { rest: restV, line: (i, u, t) => vbar(i, u, [15, 30, 15][i] * (0.55 + 0.45 * beat(t - i * 0.05, 2))) },
  },
  { n: "Wavy strings", morph: { rest: restV, line: (i, u, t) => [VX[i] + 3 * s(u * 3 * P - t * 8 + i) * s(u * P), 10 + 28 * u] } },
  {
    n: "Pluck",
    morph: { rest: restV, line: (i, u, _t, tau) => [VX[i] + 4 * s(u * P) * pluckAt(tau + 1.4 - i * 0.2), 10 + 28 * u] },
  },
  { n: "Ripple sweep", morph: { rest: restV, line: (i, u, t) => vbar(i, u, 8 + 26 * (0.5 + 0.5 * s(t * 6 - i * 1.2))) } },
  { n: "EQ from floor", morph: { rest: restV, line: (i, u, t) => vbar(i, u, 6 + 28 * lvl(t, i * 3 + 1), true) } },
  { n: "Breathing", morph: { rest: restV, line: (i, u, t) => vbar(i, u, 28 * (0.72 + 0.28 * s(t * 3 - i * 0.4))) } },
  {
    n: "Wave and bounce",
    morph: {
      rest: restV,
      line: (i, u, t) => {
        const [x, y] = vbar(i, u, 10 + 24 * lvl(t, i * 2));
        return [x + 2.6 * s(u * 3 * P - t * 9 + i) * s(u * P), y];
      },
    },
  },
  {
    n: "Heartbeat",
    morph: {
      rest: restV,
      line: (i, u, t) => (i === 1 ? [24 + 0.38 * ecg(fr(u - t * 0.7)), 10 + 28 * u] : vbar(i, u, 28 * (0.7 + 0.3 * beat(t, 1.4)))),
    },
  },
  {
    n: "Dotted wave",
    morph: {
      rest: restV,
      line: (i, u, t) => [VX[i] + 2.4 * s(u * 3 * P - t * 6 + i) * s(u * P), 10 + 28 * u],
      lineStyle: (el, i, e, t) => {
        el.style.strokeDasharray = e > 0.03 ? `${(0.01 + (1 - e) * 30).toFixed(2)} ${(5 * e).toFixed(2)}` : "";
        el.style.strokeDashoffset = (-t * 16 - i * 2).toFixed(2);
      },
    },
  },
  { n: "Lean", morph: { rest: restV, line: (i, u, t) => rotP(restV(i, u), VX[i], 38, 0.3 * s(t * 4 + i * 1.3)) } },
  {
    n: "Crossing",
    morph: {
      rest: restV,
      line: (i, u, t) => [VX[i] + (i === 0 ? 1 : i === 2 ? -1 : 0) * 14 * s(u * P) * (0.5 + 0.5 * s(t * 3)), 10 + 28 * u],
    },
  },
  { n: "Braid", morph: { rest: restV, line: (i, u, t) => [24 + 9 * s(u * 2 * P - t * 4 + (i * 2 * P) / 3), 10 + 28 * u] } },
  {
    n: "Shockwave",
    morph: {
      rest: restV,
      line: (i, u, t) => {
        const p = fr(t * 1.2);
        const d = Math.abs(i - 1);
        return vbar(i, u, 10 + 24 * Math.exp(-Math.pow((p * 2.4 - d) / 0.45, 2)));
      },
    },
  },
  { n: "Digital steps", morph: { rest: restV, line: (i, u, t) => vbar(i, u, 8 + 26 * (Math.round(lvl(t, i * 2) * 4) / 4)) } },
  {
    n: "Speaker cone",
    morph: {
      rest: restV,
      line: (i, u, t) => {
        const k = 1 + 0.18 * beat(t, 2) * (i === 1 ? 1 : 0.6);
        return [VX[i] + (i - 1) * 2 * beat(t, 2), 24 + (10 + 28 * u - 24) * k * [0.7, 1, 0.7][i] / 0.85];
      },
    },
  },
];

const ALL_VARIANTS: Variant[] = [
  ...VARIANTS,
  ...EQ_VARIANTS,
  ...TWO_VARIANTS,
  ...CROSS_VARIANTS,
  ...WIDE_VARIANTS,
  ...BEND_VARIANTS,
  ...GEAR_VARIANTS,
  ...MORE_VARIANTS,
  ...VINYL_VARIANTS,
  ...MENU_IDEA_VARIANTS,
  ...SAFE_VARIANTS,
  ...VERT_VARIANTS,
];
const TWO_START = VARIANTS.length + EQ_VARIANTS.length;
const CROSS_START = TWO_START + TWO_VARIANTS.length;
const WIDE_START = CROSS_START + CROSS_VARIANTS.length;
const BEND_START = WIDE_START + WIDE_VARIANTS.length;
const GEAR_START = BEND_START + BEND_VARIANTS.length;
const MORE_START = GEAR_START + GEAR_VARIANTS.length;
const VINYL_START = MORE_START + MORE_VARIANTS.length;
const IDEA_START = VINYL_START + VINYL_VARIANTS.length;
const SAFE_START = IDEA_START + MENU_IDEA_VARIANTS.length;
const VERT_START = SAFE_START + SAFE_VARIANTS.length;
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const barLen = (j: number, t: number) => (0.5 + 0.5 * s(t * 7 + j * 1.3)) * (0.55 + 0.45 * s(t * 3.3 + j * 2.1));

class IconAnim {
  svg: SVGSVGElement;
  v: Variant;
  els: SVGElement[] = [];
  extras: SVGElement[] = [];
  caps: SVGElement[] = [];
  refl: SVGElement[] = [];
  peaks: number[] = [];
  lastT = 0;
  h = 0;
  target = 0;
  t0 = 0;
  dirty = true;

  constructor(svg: SVGSVGElement, v: Variant) {
    this.svg = svg;
    this.v = v;
    this.build();
  }

  setVariant(v: Variant) {
    this.v = v;
    this.build();
  }

  setTarget(on: boolean) {
    this.setLevel(on ? (this.v.twoStage ? 0.3 : 1) : 0);
  }

  setLevel(tg: number) {
    if (tg > 0 && this.target === 0 && this.h < 0.2) this.t0 = performance.now() / 1000;
    this.target = tg;
  }

  build() {
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
    this.els = [];
    this.extras = [];
    this.caps = [];
    this.refl = [];
    const mk = (tag: string) => {
      const el = document.createElementNS(NS, tag) as SVGElement;
      el.setAttribute("stroke", "currentColor");
      el.setAttribute("stroke-linecap", "round");
      el.setAttribute("fill", "none");
      this.svg.appendChild(el);
      return el;
    };
    if (this.v.morph) {
      for (let i = 0; i < 3; i++) {
        const el = mk("path");
        el.setAttribute("stroke-width", "3");
        el.setAttribute("stroke-linejoin", "round");
        this.els.push(el);
      }
      for (const ex of this.v.morph.extras ?? []) {
        const el = mk(ex.tag);
        el.setAttribute("stroke-width", "2.6");
        el.style.opacity = "0";
        for (const k in ex.init ?? {}) el.setAttribute(k, (ex.init as Record<string, string>)[k]);
        this.extras.push(el);
      }
      this.dirty = true;
      return;
    }
    if (this.v.eq) {
      const sp = this.v.eq;
      for (let j = 0; j < sp.n; j++) {
        const el = mk("line");
        el.setAttribute("stroke-width", String(sp.sw ?? 2.4));
        if (sp.led) {
          el.setAttribute("stroke-linecap", "butt");
          el.setAttribute("stroke-dasharray", "2.4 1.4");
        }
        this.els.push(el);
        if (sp.caps) {
          const c = mk("line");
          c.setAttribute("stroke-width", "1.8");
          this.caps.push(c);
        }
        if (sp.reflect) {
          const r = mk("line");
          r.setAttribute("stroke-width", String(sp.sw ?? 2.4));
          r.style.opacity = "0.25";
          this.refl.push(r);
        }
      }
      this.peaks = new Array(sp.n).fill(0);
      this.dirty = true;
      return;
    }
    const count = this.v.bars ? 3 * (this.v.k ?? 3) : this.v.two ? 2 : 3;
    for (let i = 0; i < count; i++) {
      const el = document.createElementNS(NS, this.v.bars ? "line" : "path") as SVGElement;
      el.setAttribute("stroke", "currentColor");
      el.setAttribute("stroke-width", "3");
      el.setAttribute("stroke-linecap", "round");
      el.setAttribute("stroke-linejoin", "round");
      el.setAttribute("fill", "none");
      this.svg.appendChild(el);
      this.els.push(el);
    }
    this.dirty = true;
  }

  tick(t: number) {
    this.h += (this.target - this.h) * 0.1;
    if (this.h < 0.0005 && this.target === 0) {
      this.h = 0;
      if (!this.dirty) return;
      this.dirty = false;
    } else {
      this.dirty = true;
    }
    this.draw(t);
  }

  draw(t: number) {
    const v = this.v;
    const e = ease(this.h);
    const tau = t - this.t0;
    const dt = Math.min(0.1, this.lastT ? t - this.lastT : 0);
    this.lastT = t;

    if (v.morph) {
      const m = v.morph;
      for (let i = 0; i < 3; i++) {
        const ei = m.stagger ? ease(clamp(this.h * 1.6 - i * 0.3)) : e;
        let d = "";
        const steps = 40;
        for (let q = 0; q <= steps; q++) {
          const u = q / steps;
          const [tx, ty] = m.line(i, u, t, tau);
          const [rx, ry] = m.rest ? m.rest(i, u) : [X0 + W * u, YS[i]];
          const x = lerp(rx, tx, ei);
          const y = lerp(ry, ty, ei);
          d += (q ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
        }
        const el = this.els[i];
        el.setAttribute("d", d);
        el.style.opacity = m.lineOpacity ? lerp(1, m.lineOpacity(i, t), ei).toFixed(3) : "1";
        m.lineStyle?.(el, i, ei, t);
      }
      (m.extras ?? []).forEach((ex, k) => ex.draw(this.extras[k], e, t, tau));
      return;
    }

    if (v.eq) {
      const sp = v.eq;
      const n = sp.n;
      const sw = sp.sw ?? 2.4;
      for (let j = 0; j < n; j++) {
        const x = X0 + ((j + 0.5) * W) / n;
        const r = restAt(j, n);
        const rH = 4 + 26 * r;
        const aH = 4 + 26 * clamp(sp.h(j, t, n, r));
        const H = lerp(rH, aH, e);
        let x1 = x, x2 = x, y1: number, y2: number;
        if (sp.mode === "collapse") {
          const row = j % 3;
          const seg = Math.floor(j / 3);
          const tx1 = X0 + (seg * W) / 3;
          x1 = lerp(x, tx1, e);
          x2 = lerp(x, tx1 + W / 3, e);
          y1 = lerp(38 - rH, YS[row], e);
          y2 = lerp(38, YS[row], e);
          this.els[j].setAttribute("stroke-width", lerp(sw, 3, e).toFixed(2));
        } else if (sp.mode === "center") {
          y1 = lerp(38 - rH, 23 - aH / 2, e);
          y2 = lerp(38, 23 + aH / 2, e);
        } else {
          // bottom-aligned; drawn bottom → top so LED dashes start at the base
          y1 = 38;
          y2 = 38 - H;
        }
        const el = this.els[j];
        el.setAttribute("x1", x1.toFixed(2));
        el.setAttribute("y1", y1.toFixed(2));
        el.setAttribute("x2", x2.toFixed(2));
        el.setAttribute("y2", y2.toFixed(2));
        if (sp.caps) {
          this.peaks[j] = this.h < 0.01 ? H : Math.max(H, this.peaks[j] - dt * 18);
          const cy = 38 - this.peaks[j] - 3.2;
          const c = this.caps[j];
          c.setAttribute("x1", (x - 1.4).toFixed(2));
          c.setAttribute("x2", (x + 1.4).toFixed(2));
          c.setAttribute("y1", cy.toFixed(2));
          c.setAttribute("y2", cy.toFixed(2));
        }
        if (sp.reflect) {
          const rl = this.refl[j];
          rl.setAttribute("x1", x.toFixed(2));
          rl.setAttribute("x2", x.toFixed(2));
          rl.setAttribute("y1", "41.5");
          rl.setAttribute("y2", (41.5 + H * 0.28).toFixed(2));
        }
      }
      return;
    }

    if (v.bars) {
      const k = v.k ?? 3;
      const sw = W / k;
      const n = 3 * k;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < k; j++) {
          const el = this.els[i * k + j];
          const sx1 = X0 + j * sw;
          const sx2 = sx1 + sw;
          const sy = YS[i];
          let x1: number, y1: number, x2: number, y2: number;
          if (v.bars === "r") {
            const cx = sx1 + sw / 2;
            const hl = lerp(sw / 2, (2 + 9 * barLen(i * k + j, t)) / 2, e);
            const an = (e * P) / 2;
            x1 = cx - Math.cos(an) * hl;
            x2 = cx + Math.cos(an) * hl;
            y1 = sy - Math.sin(an) * hl;
            y2 = sy + Math.sin(an) * hl;
          } else {
            const idx = j * 3 + i;
            const tx = X0 + ((idx + 0.5) * W) / n;
            const L = 3 + (v.bars === "c" ? 27 : 25) * barLen(idx, t);
            const ty1 = v.bars === "c" ? 24 - L / 2 : 38 - L;
            const ty2 = v.bars === "c" ? 24 + L / 2 : 38;
            x1 = lerp(sx1, tx, e);
            x2 = lerp(sx2, tx, e);
            y1 = lerp(sy, ty1, e);
            y2 = lerp(sy, ty2, e);
          }
          el.setAttribute("x1", x1.toFixed(2));
          el.setAttribute("y1", y1.toFixed(2));
          el.setAttribute("x2", x2.toFixed(2));
          el.setAttribute("y2", y2.toFixed(2));
          el.setAttribute("stroke-width", lerp(3, v.bars === "r" ? 2.6 : 2.2, e).toFixed(2));
        }
      }
      return;
    }

    const ys = v.two ? [18, 30] : YS;
    for (let i = 0; i < ys.length; i++) {
      const hi = v.stagger ? ease(clamp(this.h * 1.8 - i * 0.4)) : e;
      const other = v.only !== undefined && i !== v.only;
      const target = 24 + (v.gap ?? 0) * (i === 0 ? -1 : 1);
      const base = v.conv || other ? lerp(ys[i], target, hi) : ys[i];
      let d = "";
      for (let q = 0; q <= N; q++) {
        const u = q / N;
        const x = X0 + W * u;
        const env = v.noEnv ? 1 : Math.min(1, s(P * u) * 2.2);
        const y = base + (hi > 0.001 && v.fn ? hi * v.fn(u, t, i, tau) * env : 0);
        d += (q ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
      }
      const el = this.els[i];
      el.setAttribute("d", d);
      el.style.opacity = other ? String(1 - hi) : "1";
      el.style.strokeDasharray = v.dots && hi > 0.01 ? `${((1 - hi) * 40).toFixed(2)} ${(hi * 5.5).toFixed(2)}` : "";
    }
  }
}

export default function HamburgerWavesPage() {
  const [selected, setSelected] = useState(VERT_START);
  const [keepWave, setKeepWave] = useState(true);
  const [showLabel, setShowLabel] = useState(false);
  const tileSvgs = useRef<(SVGSVGElement | null)[]>([]);
  const tileAnims = useRef<IconAnim[]>([]);
  const headerAnim = useRef<IconAnim | null>(null);
  const headerBtn = useRef<HTMLElement | null>(null);
  const headerHover = useRef(false);
  const keepWaveRef = useRef(true);

  useEffect(() => {
    keepWaveRef.current = keepWave;
  }, [keepWave]);

  // Optional "MENU" word beside the header icon (idea 4).
  useEffect(() => {
    if (!showLabel) return;
    const style = document.createElement("style");
    style.textContent = `
      #mobile-menu-toggle.hb-label { width: auto !important; max-width: none !important; gap: 8px; padding: 0 10px; }
      #mobile-menu-toggle .hb-label-text { font-size: 12px; font-weight: 700; letter-spacing: 0.18em; color: #fff; }
    `;
    document.head.appendChild(style);
    let label: HTMLSpanElement | null = null;
    let btn: HTMLElement | null = null;
    const attach = () => {
      btn = document.getElementById("mobile-menu-toggle");
      if (!btn || btn.querySelector(".hb-label-text")) return;
      btn.classList.add("hb-label");
      label = document.createElement("span");
      label.className = "hb-label-text";
      label.textContent = /close/i.test(btn.getAttribute("aria-label") ?? "") ? "CLOSE" : "MENU";
      btn.prepend(label);
    };
    attach();
    const id = window.setInterval(() => {
      attach();
      if (btn && label) label.textContent = /close/i.test(btn.getAttribute("aria-label") ?? "") ? "CLOSE" : "MENU";
    }, 200);
    return () => {
      window.clearInterval(id);
      style.remove();
      label?.remove();
      btn?.classList.remove("hb-label");
    };
  }, [showLabel]);

  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    tileAnims.current = tileSvgs.current.map((svg, i) => new IconAnim(svg as SVGSVGElement, ALL_VARIANTS[i]));

    const style = document.createElement("style");
    style.textContent = `
      #mobile-menu-toggle { display: flex !important; }
      #mobile-menu-toggle > svg:not([data-hb-test]) { display: none !important; }
      /* test page only: the site preloader can stick over this route */
      .preloader-overlay { display: none !important; }
    `;
    document.head.appendChild(style);

    const headerSvg = document.createElementNS(NS, "svg") as SVGSVGElement;
    headerSvg.setAttribute("viewBox", "0 0 48 48");
    headerSvg.setAttribute("data-hb-test", "");
    headerSvg.style.width = "40px";
    headerSvg.style.height = "40px";
    headerSvg.style.overflow = "visible";
    headerSvg.style.color = "#ffffff";
    headerAnim.current = new IconAnim(headerSvg, ALL_VARIANTS[VERT_START]);

    const onEnter = () => (headerHover.current = true);
    const onLeave = () => (headerHover.current = false);

    const attach = () => {
      const btn = document.getElementById("mobile-menu-toggle");
      if (!btn) return;
      if (btn !== headerBtn.current) {
        headerBtn.current?.removeEventListener("mouseenter", onEnter);
        headerBtn.current?.removeEventListener("mouseleave", onLeave);
        btn.addEventListener("mouseenter", onEnter);
        btn.addEventListener("mouseleave", onLeave);
        headerBtn.current = btn;
      }
      if (headerSvg.parentNode !== btn) btn.appendChild(headerSvg);
    };

    let frame = 0;
    let raf = 0;
    const loop = () => {
      if (frame++ % 15 === 0) attach();
      const t = performance.now() / 1000;
      tileAnims.current.forEach((a) => a.tick(t));
      const ha = headerAnim.current;
      if (ha) {
        const open = /close/i.test(headerBtn.current?.getAttribute("aria-label") ?? "");
        if (open && keepWaveRef.current) ha.setLevel(1);
        else ha.setTarget(headerHover.current);
        ha.tick(t);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      style.remove();
      headerSvg.remove();
      headerBtn.current?.removeEventListener("mouseenter", onEnter);
      headerBtn.current?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    headerAnim.current?.setVariant(ALL_VARIANTS[selected]);
  }, [selected]);

  const renderTile = (v: Variant, i: number) => (
            <button
              key={v.n}
              type="button"
              onClick={() => setSelected(i)}
              onMouseEnter={() => tileAnims.current[i]?.setTarget(true)}
              onMouseLeave={() => tileAnims.current[i]?.setTarget(false)}
              onPointerDown={() => v.twoStage && tileAnims.current[i]?.setLevel(1)}
              onPointerUp={() => v.twoStage && tileAnims.current[i]?.setTarget(true)}
              onFocus={() => tileAnims.current[i]?.setTarget(true)}
              onBlur={() => tileAnims.current[i]?.setTarget(false)}
              aria-pressed={selected === i}
              className={`flex flex-col items-center gap-3 rounded-2xl border px-3 pt-6 pb-4 transition-colors ${
                selected === i
                  ? "border-[#a78bfa] bg-[#2a1850]"
                  : "border-white/10 bg-[#160c28]/80 hover:border-white/30"
              }`}
            >
              <svg
                ref={(el) => {
                  tileSvgs.current[i] = el;
                }}
                viewBox="0 0 48 48"
                className="h-16 w-16 overflow-visible text-white"
                aria-hidden="true"
              />
              <span className="text-sm text-white/80">
                <span className="mr-1 font-semibold text-[#a78bfa]">{i + 1}</span>
                {v.n}
              </span>
              {v.twoStage && <span className="text-xs text-white/50">Hover, then press and hold</span>}
              {selected === i && <span className="text-xs text-[#a78bfa]">In the header now</span>}
            </button>
  );

  return (
    <main className="min-h-screen px-4 pt-32 pb-24 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold">Menu icon test</h1>
        <p className="mb-6 max-w-2xl text-white/70">
          Hover a tile to preview it. Click a tile to put that style on the real menu button in the
          header (top right), then hover or click that button to try it on the site.
        </p>

        <label className="mb-8 inline-flex cursor-pointer items-center gap-2 text-white/80">
          <input type="checkbox" checked={keepWave} onChange={(e) => setKeepWave(e.target.checked)} />
          Keep the wave playing while the menu is open
        </label>
        <label className="mb-8 ml-6 inline-flex cursor-pointer items-center gap-2 text-white/80">
          <input type="checkbox" checked={showLabel} onChange={(e) => setShowLabel(e.target.checked)} />
          Show a &ldquo;MENU&rdquo; label next to the header icon
        </label>

        <h2 className="mb-1 text-xl font-semibold">Three vertical lines</h2>
        <p className="mb-4 max-w-3xl text-white/60">
          Three upright lines at rest that move like sound on hover.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {VERT_VARIANTS.map((v, k) => renderTile(v, VERT_START + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Menu-safe music ideas</h2>
        <p className="mb-4 max-w-3xl text-white/60">
          Instruments and sound, but the three lines always stay readable. Hover to play them.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {SAFE_VARIANTS.map((v, k) => renderTile(v, SAFE_START + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Still reads as a menu</h2>
        <p className="mb-4 max-w-3xl text-white/60">
          1: lines stay, a small record joins them. 2: the lines curve like record grooves but stay three
          lines. 3: hover only starts the curl; the full record plays when the menu is clicked open (try it
          in the header). Tick the box above to see 4, a MENU label.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {MENU_IDEA_VARIANTS.map((v, k) => renderTile(v, IDEA_START + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Vinyl versions</h2>
        <p className="mb-4 text-white/60">
          Three menu lines that curl into a record on hover, each with its own motion.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {VINYL_VARIANTS.map((v, k) => renderTile(v, VINYL_START + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">50 more music themes</h2>
        <p className="mb-4 text-white/60">
          Instruments, studio gear, player controls, concert and visualizers. All rest as three menu lines.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {MORE_VARIANTS.map((v, k) => renderTile(v, MORE_START + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Instruments and gear</h2>
        <p className="mb-4 text-white/60">
          Three normal menu lines at rest that rebuild into a piece of music gear on hover.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {GEAR_VARIANTS.map((v, k) => renderTile(v, GEAR_START + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Different bends</h2>
        <p className="mb-4 text-white/60">
          Built off Free ends, but each line bends its own way as they cross over each other.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {BEND_VARIANTS.map((v, k) => renderTile(v, BEND_START + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Wide sine variations</h2>
        <p className="mb-4 text-white/60">
          Based on Wide sine: the two lines stay apart at rest, then cross each other in different ways.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {WIDE_VARIANTS.map((v, k) => renderTile(v, WIDE_START + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Two crossing lines</h2>
        <p className="mb-4 text-white/60">
          Two lines that weave across each other on hover, built off Twin sine.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {CROSS_VARIANTS.map((v, k) => renderTile(v, CROSS_START + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Two lines</h2>
        <p className="mb-4 text-white/60">
          No middle line. The top and bottom lines turn into the sound wave.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {TWO_VARIANTS.map((v, k) => renderTile(v, TWO_START + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Equalizer at rest</h2>
        <p className="mb-4 text-white/60">
          These sit as equalizer bars like your screenshot, then come alive on hover.
        </p>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {EQ_VARIANTS.map((v, k) => renderTile(v, VARIANTS.length + k))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Three lines to sound wave</h2>
        <p className="mb-4 text-white/60">The original 20.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {VARIANTS.map((v, i) => renderTile(v, i))}
        </div>
      </div>
    </main>
  );
}
