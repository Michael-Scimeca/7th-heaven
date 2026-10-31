"use client";

import { useEffect, useRef } from "react";

// Lottie version of the mobile menu icon (public/lottie/menu-soundbars.json).
// At rest: three menu lines. On hover / keyboard focus / while the menu is open:
// the lines swing around and rotate into short/tall/short sound bars (the middle line
// spins in place, the outer two orbit it like a pinwheel), then a looping pulse.
// On leave/close they keep spinning the same way back into three lines.
// Timeline (60fps): open 0–30, pulse 30–90 (loops), close 90–120.
// Regenerate the JSON with scripts/gen-menu-soundbars-lottie.py.

// Which animation to use. Try them on the live site with ?menu=orbit | quick | calm | pinwheel
// (the choice is remembered in localStorage while you click around).
// Regenerate the orbit files with scripts/gen-menu-orbit-lotties.py.
const MENU_ICONS: Record<string, string> = {
  orbit: "/lottie/menu-orbit.json", // #1 Orbit · counter-clockwise · top to bottom
  quick: "/lottie/menu-orbit-quick.json", // #5 Quick
  calm: "/lottie/menu-orbit-calm.json", // #6 Slow and calm
  pinwheel: "/lottie/menu-soundbars.json", // earlier pinwheel version
};
const DEFAULT_ICON = "orbit";

function pickIconSrc() {
  let key = DEFAULT_ICON;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("menu");
    if (fromUrl && MENU_ICONS[fromUrl]) {
      key = fromUrl;
      localStorage.setItem("7h_menu_icon", fromUrl);
    } else {
      const saved = localStorage.getItem("7h_menu_icon");
      if (saved && MENU_ICONS[saved]) key = saved;
    }
  } catch {}
  return MENU_ICONS[key];
}

const OPEN: [number, number] = [0, 30];
const PULSE: [number, number] = [30, 90];
const CLOSE_START = 90;
const END = 120;

type Anim = {
  playSegments: (seg: [number, number], force?: boolean) => void;
  goToAndStop: (frame: number, isFrame?: boolean) => void;
  resetSegments: (forceFlag: boolean) => void;
  addEventListener: (name: string, cb: () => void) => () => void;
  removeEventListener: (name: string, cb: () => void) => void;
  onComplete?: (() => void) | null;
  setSpeed: (s: number) => void;
  loop: boolean | number;
  currentFrame: number;
  firstFrame: number;
  destroy: () => void;
};

export default function SoundBarsLottie({ open }: { open: boolean }) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const fallbackRef = useRef<SVGSVGElement>(null);
  const openRef = useRef(open);
  const syncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    openRef.current = open;
    syncRef.current?.();
  }, [open]);

  useEffect(() => {
    const box = boxRef.current;
    const btn = box?.closest("button");
    if (!box || !btn) return () => {};

    let anim: Anim | null = null;
    let cancelled = false;
    const ac = new AbortController();
    let hover = false;
    let focus = false;
    let active = false;
    let mode: "rest" | "opening" | "pulsing" | "closing" = "rest";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const absFrame = () => (anim ? anim.firstFrame + anim.currentFrame : 0);

    const sync = () => {
      if (!anim) return;
      const want = openRef.current || hover || focus;
      if (want === active) return;
      active = want;

      if (reduceMotion.matches) {
        anim.resetSegments(true);
        anim.goToAndStop(want ? PULSE[0] : 0, true);
        mode = want ? "pulsing" : "rest";
        return;
      }

      const f = absFrame();
      anim.loop = false;
      if (want) {
        mode = "opening";
        if (f > CLOSE_START && f < END) {
          // interrupted mid-close: spin back the way it came, into the bars
          anim.playSegments([f, CLOSE_START], true);
        } else {
          anim.playSegments([0, OPEN[1]], true);
        }
      } else if (mode === "opening" && f > CLOSE_START) {
        // was spinning back from a half-finished close: carry on closing from here
        mode = "closing";
        anim.playSegments([f, END], true);
      } else if (mode === "opening" && f < OPEN[1]) {
        mode = "closing";
        anim.playSegments([Math.max(f, 0.01), 0], true); // reverse back to lines
      } else {
        mode = "closing";
        anim.playSegments([CLOSE_START, END], true);
      }
    };
    syncRef.current = sync;

    const onEnter = () => {
      hover = true;
      sync();
    };
    const onLeave = () => {
      hover = false;
      sync();
    };
    const onFocus = () => {
      focus = btn.matches(":focus-visible");
      sync();
    };
    const onBlur = () => {
      focus = false;
      sync();
    };
    btn.addEventListener("pointerenter", onEnter);
    btn.addEventListener("pointerleave", onLeave);
    btn.addEventListener("focus", onFocus);
    btn.addEventListener("blur", onBlur);

    const onComplete = () => {
      if (!anim) return;
      if (mode === "opening") {
        mode = "pulsing";
        anim.goToAndStop(OPEN[1], true);
      } else if (mode === "closing") {
        mode = "rest";
        // clear the last played segment, otherwise frame 0 means "start of that segment"
        anim.resetSegments(true);
        anim.goToAndStop(0, true);
      }
    };

    Promise.all([
      import("lottie-web"),
      fetch(pickIconSrc(), { signal: ac.signal }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([mod, data]) => {
        if (cancelled || !data) return;
        const lottie = (mod as { default?: unknown }).default ?? mod;
        anim = (lottie as { loadAnimation: (o: object) => Anim }).loadAnimation({
          container: box,
          renderer: "svg",
          loop: false,
          autoplay: false,
          animationData: data,
        });
        anim.goToAndStop(0, true);
        if (fallbackRef.current) fallbackRef.current.style.display = "none";
        anim.onComplete = onComplete;
        active = false;
        sync();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      ac.abort();
      syncRef.current = null;
      btn.removeEventListener("pointerenter", onEnter);
      btn.removeEventListener("pointerleave", onLeave);
      btn.removeEventListener("focus", onFocus);
      btn.removeEventListener("blur", onBlur);
      if (anim) {
        anim.onComplete = null;
        anim.destroy();
      }
    };
  }, []);

  return (
    <span ref={boxRef} className="relative block h-[28px] w-[32px]" aria-hidden="true">
      {/* static three lines until the Lottie file has loaded */}
      <svg
        ref={fallbackRef}
        viewBox="0 0 32 28"
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <line x1="6" y1="8" x2="26" y2="8" />
        <line x1="6" y1="14" x2="26" y2="14" />
        <line x1="6" y1="20" x2="26" y2="20" />
      </svg>
    </span>
  );
}
