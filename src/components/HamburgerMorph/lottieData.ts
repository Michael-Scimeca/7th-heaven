/**
 * Builds a Lottie (bodymovin) JSON from the shared keyframes — three shape layers,
 * each a rounded rect with animated size/roundness and an animated layer transform.
 * In production you'd usually export this from After Effects instead; generating it keeps all builds in sync.
 */

import { Bar, CLOSE, FPS, KEYS } from "./keyframes";

const EASE_OUT = { x: [0.65], y: [0] };
const EASE_IN = { x: [0.35], y: [1] };

function anim(get: (b: Bar) => number[], idx: number) {
  return {
    a: 1,
    k: KEYS.map((k, n) => ({
      t: k.t,
      s: get(k.bars[idx]),
      ...(n < KEYS.length - 1 ? { o: EASE_OUT, i: EASE_IN } : {}),
    })),
  };
}

function layer(idx: number, color: number[]) {
  return {
    ddd: 0,
    ind: idx + 1,
    ty: 4,
    nm: ["top", "mid", "bot"][idx],
    sr: 1,
    ks: {
      o: anim((b) => [b.o * 100], idx),
      r: anim((b) => [b.r], idx),
      p: anim((b) => [32 + b.x, 32 + b.y, 0], idx),
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          {
            ty: "rc",
            d: 1,
            s: anim((b) => [b.w, b.h], idx),
            p: { a: 0, k: [0, 0] },
            r: anim((b) => [Math.min(b.h, b.w) / 2], idx),
          },
          { ty: "fl", c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, r: 1 },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
        ],
      },
    ],
    ip: 0,
    op: CLOSE[1] + 1,
    st: 0,
    bm: 0,
  };
}

export function hamburgerLottie(color: [number, number, number] = [1, 1, 1]) {
  return {
    v: "5.7.4",
    fr: FPS,
    ip: 0,
    op: CLOSE[1] + 1,
    w: 64,
    h: 64,
    nm: "hamburger-morph",
    ddd: 0,
    assets: [],
    layers: [0, 1, 2].map((i) => layer(i, color)),
  };
}
