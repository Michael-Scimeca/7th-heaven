/* eslint-disable react-doctor/no-adjust-state-on-prop-change, react-doctor/prefer-use-effect-event, react-doctor/prefer-html-dialog, react-doctor/no-unguarded-browser-global-in-render-or-hook-init */
"use client";

/**
 * Media test page: the clip keeps playing from the clicked tile and grows to full bleed, with no
 * cut along the way. It matches the tile's position and playback time before it appears. Each style
 * below is a different way of making that one continuous move.
 */

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface OpenedTile {
  title: string;
  label: string;
  image: string;
  youtubeId?: string;
}
export interface TileRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const QUART = "cubic-bezier(0.76, 0, 0.24, 1)";
const SINE = "cubic-bezier(0.37, 0, 0.63, 1)";
const SPRING = "cubic-bezier(0.34, 1.32, 0.64, 1)";

interface Pose {
  x: number;
  y: number;
  scale: number;
  insetX: number;
  insetY: number;
  round: number;
}
const FULL: Pose = { x: 0, y: 0, scale: 1, insetX: 0, insetY: 0, round: 0 };

/* Where the full-screen clip must sit to look exactly like the tile: same crop, no stretch */
const tilePose = (t: TileRect, W: number, H: number): Pose => {
  const scale = Math.max(t.w / W, t.h / H);
  return {
    x: t.x + t.w / 2 - W / 2,
    y: t.y + t.h / 2 - H / 2,
    scale,
    insetX: (W - t.w / scale) / 2,
    insetY: (H - t.h / scale) / 2,
    round: 10 / scale,
  };
};
const mix = (a: Pose, b: Pose, n: number): Pose => ({
  x: a.x + (b.x - a.x) * n,
  y: a.y + (b.y - a.y) * n,
  scale: a.scale + (b.scale - a.scale) * n,
  insetX: a.insetX + (b.insetX - a.insetX) * n,
  insetY: a.insetY + (b.insetY - a.insetY) * n,
  round: a.round + (b.round - a.round) * n,
});
const frame = (p: Pose, extra: Keyframe = {}, before = "", after = ""): Keyframe => ({
  transform: `${before} translate(${p.x}px, ${p.y}px) scale(${p.scale}) ${after}`.trim(),
  clipPath: `inset(${p.insetY}px ${p.insetX}px ${p.insetY}px ${p.insetX}px round ${p.round}px)`,
  ...extra,
});

interface Motion {
  frames: Keyframe[];
  duration: number;
  easing: string;
}
type Build = (from: Pose, W: number, H: number) => Motion;
const simple = (duration: number, easing: string): Build => (from) => ({
  frames: [frame(from), frame(FULL)],
  duration,
  easing,
});

const STYLES: { name: string; build: Build }[] = [
  { name: "Silk", build: simple(1100, EXPO) },
  { name: "Even Glide", build: simple(1000, SINE) },
  { name: "Power Glide", build: simple(1000, QUART) },
  { name: "Slow Cinema", build: simple(2000, QUART) },
  { name: "Quick Snap", build: simple(500, EXPO) },
  { name: "Soft Spring", build: simple(950, SPRING) },
  {
    name: "Wide Then Tall",
    build: (from) => ({
      frames: [
        frame(from),
        frame({ ...mix(from, FULL, 0.55), insetX: 0, insetY: from.insetY * 0.6 }, { offset: 0.5 }),
        frame(FULL),
      ],
      duration: 1300,
      easing: SINE,
    }),
  },
  {
    name: "Tall Then Wide",
    build: (from) => ({
      frames: [
        frame(from),
        frame({ ...mix(from, FULL, 0.55), insetY: 0, insetX: from.insetX * 0.6 }, { offset: 0.5 }),
        frame(FULL),
      ],
      duration: 1300,
      easing: SINE,
    }),
  },
  {
    name: "Center Then Grow",
    build: (from) => ({
      frames: [frame(from), frame({ ...from, x: 0, y: 0 }, { offset: 0.4 }), frame(FULL)],
      duration: 1400,
      easing: QUART,
    }),
  },
  {
    name: "Breath In",
    build: (from) => ({
      frames: [frame(from), frame({ ...from, scale: from.scale * 0.95 }, { offset: 0.2 }), frame(FULL)],
      duration: 1200,
      easing: QUART,
    }),
  },
  {
    name: "Gentle Arc",
    build: (from, _W, H) => ({
      frames: [frame(from), frame({ ...mix(from, FULL, 0.5), y: from.y * 0.5 - H * 0.07 }, { offset: 0.5 }), frame(FULL)],
      duration: 1200,
      easing: SINE,
    }),
  },
  {
    name: "Push Past",
    build: (from) => ({
      frames: [frame(from), frame({ ...FULL, scale: 1.05 }, { offset: 0.72 }), frame(FULL)],
      duration: 1400,
      easing: SINE,
    }),
  },
  {
    name: "3D Turn",
    build: (from) => ({
      frames: [frame(from, {}, "perspective(1600px)", "rotateY(-22deg)"), frame(FULL, {}, "perspective(1600px)", "rotateY(0deg)")],
      duration: 1200,
      easing: QUART,
    }),
  },
  {
    name: "3D Lean",
    build: (from) => ({
      frames: [frame(from, {}, "perspective(1600px)", "rotateX(18deg)"), frame(FULL, {}, "perspective(1600px)", "rotateX(0deg)")],
      duration: 1200,
      easing: QUART,
    }),
  },
  {
    name: "Slight Spin",
    build: (from) => ({
      frames: [frame(from, {}, "", "rotate(-5deg)"), frame(FULL, {}, "", "rotate(0deg)")],
      duration: 1100,
      easing: QUART,
    }),
  },
  {
    name: "Rounded Glide",
    build: (from, W, H) => ({
      frames: [
        frame(from),
        frame({ ...mix(from, FULL, 0.8), round: Math.min(W, H) * 0.08 }, { offset: 0.75 }),
        frame(FULL),
      ],
      duration: 1200,
      easing: SINE,
    }),
  },
  {
    name: "Focus Pull",
    build: (from) => ({
      frames: [
        frame(from, { filter: "blur(0px)" }),
        frame(mix(from, FULL, 0.5), { filter: "blur(14px)", offset: 0.5 }),
        frame(FULL, { filter: "blur(0px)" }),
      ],
      duration: 1200,
      easing: SINE,
    }),
  },
  {
    name: "Light Bloom",
    build: (from) => ({
      frames: [
        frame(from, { filter: "brightness(1)" }),
        frame(mix(from, FULL, 0.55), { filter: "brightness(1.7)", offset: 0.55 }),
        frame(FULL, { filter: "brightness(1)" }),
      ],
      duration: 1200,
      easing: SINE,
    }),
  },
  {
    name: "Color Wake",
    build: (from) => ({
      frames: [frame(from, { filter: "saturate(0.2)" }), frame(FULL, { filter: "saturate(1)" })],
      duration: 1400,
      easing: QUART,
    }),
  },
  {
    name: "Liquid Corners",
    build: (from, W, H) => ({
      frames: [
        frame(from),
        frame({ ...mix(from, FULL, 0.45), round: Math.min(W, H) * 0.3 }, { offset: 0.4 }),
        frame({ ...mix(from, FULL, 0.85), round: Math.min(W, H) * 0.05 }, { offset: 0.75 }),
        frame(FULL),
      ],
      duration: 1400,
      easing: SINE,
    }),
  },
];

const STORE = "srt-open-style";

export default function TileOpener({
  opened,
  onReveal,
  onClose,
  children,
}: {
  opened: { tile: OpenedTile; rect: TileRect; time: number } | null;
  onReveal: () => void;
  onClose: () => void;
  children?: ReactNode;
}) {
  const [style, setStyle] = useState(0);
  const [run, setRun] = useState(0);
  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);
  const [closing, setClosing] = useState(false);
  const [sound, setSound] = useState(false);
  const mediaRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(STORE));
      if (saved >= 0 && saved < STYLES.length) setStyle(saved);
    } catch {
      // storage unavailable: start with the first style
    }
  }, []);

  const choose = (i: number) => {
    setStyle(i);
    setRun((n) => n + 1);
    setSound(false);
    try {
      localStorage.setItem(STORE, String(i));
    } catch {
      // storage unavailable: the choice lasts for this visit
    }
  };

  useEffect(() => {
    setReady(false);
    setClosing(false);
    setSound(false);
  }, [opened]);

  // Wait until the full-screen copy shows the same moment as the tile before swapping to it
  const markReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    if (!opened) return;
    const fallback = window.setTimeout(markReady, 600);
    return () => window.clearTimeout(fallback);
  }, [opened, markReady]);

  useEffect(() => {
    if (!opened || !ready) return;
    const media = mediaRef.current;
    if (!media) return;
    onReveal();
    closeRef.current?.focus();
    setSettled(false);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSettled(true);
      return;
    }
    const motion = STYLES[style].build(tilePose(opened.rect, window.innerWidth, window.innerHeight), window.innerWidth, window.innerHeight);
    const animation = media.animate(motion.frames, { duration: motion.duration, easing: motion.easing, fill: "both" });
    let cancelled = false;
    animation.finished
      .then(() => {
        if (!cancelled) setSettled(true);
      })
      .catch(() => {
        // replaced by a newer run
      });
    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [opened, ready, style, run, onReveal]);

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, close]);

  const youtubeId = opened?.tile.youtubeId;

  return createPortal(
    <>
      {opened && (
        <div
          className="srt-open"
          data-closing={closing}
          data-ready={ready}
          role="dialog"
          aria-modal="true"
          aria-label={opened.tile.title}
        >
          {youtubeId ? (
            <video
              ref={(el) => {
                mediaRef.current = el;
              }}
              className="srt-open-media"
              src={`/movie/previews/${youtubeId}.mp4`}
              poster={opened.tile.image}
              autoPlay
              loop
              muted
              playsInline
              onLoadedMetadata={(e) => {
                const el = e.currentTarget;
                if (opened.time > 0 && opened.time < el.duration) el.currentTime = opened.time;
                else markReady();
              }}
              onSeeked={markReady}
              onError={markReady}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={(el) => {
                mediaRef.current = el;
              }}
              className="srt-open-media"
              src={opened.tile.image}
              alt=""
              onLoad={markReady}
              onError={markReady}
            />
          )}
          {sound && youtubeId && (
            <iframe
              className="srt-open-video"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              title={opened.tile.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
          <div className="srt-open-actions">
            {settled && youtubeId && !sound && (
              <button type="button" className="srt-open-close" onClick={() => setSound(true)}>
                Watch full video with sound
              </button>
            )}
            <button ref={closeRef} type="button" className="srt-open-close" onClick={close}>
              Close
            </button>
          </div>
        </div>
      )}
      <div className="srt-open-picker" role="group" aria-label="Choose styles">
        {children}
        <p aria-live="polite">
          Open style {style + 1}: {STYLES[style].name}
        </p>
        <div>
          {STYLES.map((e, i) => (
            <button key={e.name} type="button" title={e.name} aria-label={e.name} aria-pressed={i === style} onClick={() => choose(i)}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body,
  );
}
