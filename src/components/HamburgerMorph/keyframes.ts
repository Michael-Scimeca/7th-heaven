/**
 * Shared keyframes for the hamburger morph, in a 64×64 box at 60fps.
 * Each bar: centre offset (x, y) from the box centre, width w, height h, rotation r (deg), opacity o.
 * Open plays frames 0 → 48, close plays 48 → 100. Frame 49 resets the middle bar after it vanished.
 * Used by the SVG, Canvas and Lottie builds so all three animate identically.
 */

export type Bar = { x: number; y: number; w: number; h: number; r: number; o: number };
export type Key = { t: number; bars: [Bar, Bar, Bar] };

const bar = (x: number, y: number, w: number, h = 6, r = 0, o = 1): Bar => ({ x, y, w, h, r, o });

export const FPS = 60;
export const OPEN: [number, number] = [0, 48];
export const CLOSE: [number, number] = [48, 100];

export const KEYS: Key[] = [
  // hamburger
  { t: 0, bars: [bar(0, -10, 32), bar(0, 0, 32), bar(0, 10, 32)] },
  // chevron: outer bars stretch and tilt in, middle shrinks left
  { t: 17, bars: [bar(4, -7, 40, 6, 28), bar(-11, 0, 14), bar(4, 7, 40, 6, -28)] },
  // off-centre X, middle peeled into a dot
  { t: 35, bars: [bar(6, 0, 40, 6, 45), bar(-17, 0, 9, 9, 0, 0.7), bar(6, 0, 40, 6, -45)] },
  // X centred, dot gone
  { t: 48, bars: [bar(0, 0, 40, 6, 45), bar(-17, 0, 0, 0, 0, 0), bar(0, 0, 40, 6, -45)] },
  // (close) middle reappears as a sliver in the centre
  { t: 49, bars: [bar(0, 0, 40, 6, 45), bar(0, 0, 6, 6, 0, 1), bar(0, 0, 40, 6, -45)] },
  // uncrossed with uneven lengths
  { t: 67, bars: [bar(0, -10, 22), bar(0, 0, 36), bar(0, 10, 28)] },
  // overshoot (stands in for the elastic settle)
  { t: 80, bars: [bar(0, -10, 35), bar(0, 0, 30), bar(0, 10, 33)] },
  // back to the hamburger
  { t: 100, bars: [bar(0, -10, 32), bar(0, 0, 32), bar(0, 10, 32)] },
];

/** cubic ease-in-out, close to cubic-bezier(.65,0,.35,1) */
export const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Bars at any frame, eased between surrounding keys. */
export function barsAt(t: number): [Bar, Bar, Bar] {
  if (t <= KEYS[0].t) return KEYS[0].bars;
  const last = KEYS[KEYS.length - 1];
  if (t >= last.t) return last.bars;
  let i = 0;
  while (KEYS[i + 1].t < t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const p = ease((t - a.t) / (b.t - a.t));
  return a.bars.map((ba, n) => {
    const bb = b.bars[n];
    return {
      x: lerp(ba.x, bb.x, p),
      y: lerp(ba.y, bb.y, p),
      w: lerp(ba.w, bb.w, p),
      h: lerp(ba.h, bb.h, p),
      r: lerp(ba.r, bb.r, p),
      o: lerp(ba.o, bb.o, p),
    };
  }) as [Bar, Bar, Bar];
}
