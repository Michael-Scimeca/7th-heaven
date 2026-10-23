"use client";

import { useEffect, useRef } from "react";

// Two-line menu icon that turns into a sound wave.
// At rest it's two plain horizontal lines, so it still reads as a menu button.
// On hover (or keyboard focus) the lines bend into crossing sound waves.
// Because phones can't hover, it also plays the wave once, briefly, after the page loads.
// Rendered as a <g> inside the header toggle's 32x28 SVG; it attaches its own
// listeners to the closest <button>, so Header doesn't need any extra state.
//
// The wave style is "79 Free ends" from /hamburger-waves. To try another one, swap WAVE.

const X0 = 4;
const W = 24;
const YS = [7, 21];
const N = 48;
const INTRO_MS = 1600;

const WAVE = (u: number, t: number, i: number) => 3.6 * (i === 0 ? 1 : -1) * Math.sin(u * 2.5 * Math.PI - t * 4);
// The lines must never touch: centre-to-centre distance stays at least the
// stroke width (2.4) plus a clear ~4px gap (anything tighter blurs together
// at icon size). With amplitude 3.6 the closest approach is 14 - 2 * 3.6 = 6.8,
// and the clamp below guarantees it never drops under MIN_GAP.
const MIN_GAP = 6.6;

const restPath = (y: number) => `M${X0} ${y}L${X0 + W} ${y}`;

export default function SoundWaveLines({ open, ease }: { open: boolean; ease: string }) {
  const groupRef = useRef<SVGGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const group = groupRef.current;
    const btn = group?.closest("button");
    if (!group || !btn) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let h = 0;
    let target = 0;
    let raf = 0;
    let introTimer: ReturnType<typeof setTimeout> | undefined;

    const draw = (t: number) => {
      const e = h * h * (3 - 2 * h);
      const [top, bottom] = pathRefs.current;
      if (!top || !bottom) return;
      if (e < 0.001) {
        top.setAttribute("d", restPath(YS[0]));
        bottom.setAttribute("d", restPath(YS[1]));
        return;
      }
      let dTop = "";
      let dBottom = "";
      for (let q = 0; q <= N; q++) {
        const u = q / N;
        const x = (X0 + W * u).toFixed(2);
        let a = YS[0] + e * WAVE(u, t, 0);
        let b = YS[1] + e * WAVE(u, t, 1);
        if (b - a < MIN_GAP) {
          const mid = (a + b) / 2;
          a = mid - MIN_GAP / 2;
          b = mid + MIN_GAP / 2;
        }
        const cmd = q ? "L" : "M";
        dTop += `${cmd}${x} ${a.toFixed(2)}`;
        dBottom += `${cmd}${x} ${b.toFixed(2)}`;
      }
      top.setAttribute("d", dTop);
      bottom.setAttribute("d", dBottom);
    };

    // Desired state is re-read every frame (rather than trusting enter/leave
    // events alone) so a missed mouseleave can never leave the wave stuck on.
    let introOn = false;
    let focusOn = false;
    const wanted = () => !reduceMotion.matches && (introOn || focusOn || btn.matches(":hover"));

    const loop = () => {
      const t = performance.now() / 1000;
      target = wanted() ? 1 : 0;
      h += (target - h) * 0.12;
      if (target === 0 && h < 0.002) {
        h = 0;
        draw(t);
        raf = 0;
        return;
      }
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onFocus = () => {
      focusOn = btn.matches(":focus-visible");
      kick();
    };
    const onBlur = () => {
      focusOn = false;
      kick();
    };
    btn.addEventListener("pointerenter", kick);
    btn.addEventListener("mouseenter", kick);
    btn.addEventListener("focus", onFocus);
    btn.addEventListener("blur", onBlur);

    // One short wave after load, so touch users see the music touch too.
    const playIntro = () => {
      introOn = true;
      kick();
      introTimer = setTimeout(() => {
        introOn = false;
        kick();
      }, INTRO_MS);
    };
    const waitingOnPreloader = document.documentElement.classList.contains("is-preloading");
    if (waitingOnPreloader) {
      window.addEventListener("preloader-complete", playIntro, { once: true });
    } else {
      introTimer = setTimeout(playIntro, 600);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (introTimer) clearTimeout(introTimer);
      window.removeEventListener("preloader-complete", playIntro);
      btn.removeEventListener("pointerenter", kick);
      btn.removeEventListener("mouseenter", kick);
      btn.removeEventListener("focus", onFocus);
      btn.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <g
      ref={groupRef}
      style={{
        opacity: open ? 0 : 1,
        transition: `opacity 350ms ${ease}`,
        transitionDelay: open ? "0ms" : "200ms",
      }}
    >
      {YS.map((y, i) => (
        <path
          key={y}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={restPath(y)}
          stroke="#ffffff"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </g>
  );
}
