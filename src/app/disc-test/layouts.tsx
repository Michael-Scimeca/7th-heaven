"use client";

import { useEffect, useRef } from "react";
import type { DiscItem } from "./data";

export type Preview = { title: string; playing: boolean; pct: number };

export type LayoutProps = {
  item: DiscItem;
  items: DiscItem[];
  active: number;
  onOpen: () => void;
  onGo: (i: number) => void;
  /** first track of the centered album, or null for a non-album disc */
  preview?: Preview | null;
  onTogglePreview?: () => void;
};

const D = "font-[family-name:var(--font-display)] uppercase leading-[0.9] text-white";
const MUTED = "text-[var(--color-text-muted)]";
const SEC = "text-[var(--color-text-secondary)]";
const CHIP = "rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs backdrop-blur-md";
const pad = (v: number) => String(v).padStart(2, "0");

function Chips({ item }: { item: DiscItem }) {
  return (
    <ul className="flex flex-wrap justify-center gap-1.5">
      {item.meta.map(([k, v]) => (
        <li key={k} className={`${CHIP} ${SEC}`}>
          <span className={MUTED}>{k}</span> {v}
        </li>
      ))}
    </ul>
  );
}

/** Phones get a progress bar + counter (swipe already moves the discs);
 *  from sm up, every stop is a real tap target. */
function TimelineDots({ items, active, onGo }: Pick<LayoutProps, "items" | "active" | "onGo">) {
  const pct = (active / Math.max(1, items.length - 1)) * 100;
  return (
    <>
      <div className="sm:hidden">
        <div className="relative h-px w-full bg-white/20">
          <span
            className="absolute inset-y-0 left-0 bg-[var(--color-action)] transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
          <span
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-action)] transition-[left] duration-500"
            style={{ left: `${pct}%` }}
          />
        </div>
        <p className={`mt-3 text-center text-xs tabular-nums ${MUTED}`}>
          {pad(active + 1)} / {pad(items.length)}
        </p>
      </div>

      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          {/* line runs dot-center to dot-center (buttons are h-8 w-8, so inset by 1rem) */}
          <span className="absolute left-4 right-4 top-1/2 h-px bg-white/20" />
          <span
            className="absolute left-4 top-1/2 h-px bg-[var(--color-action)] transition-[width] duration-500"
            style={{ width: `calc((100% - 2rem) * ${active / Math.max(1, items.length - 1)})` }}
          />
          {items.map((it, i) => (
            <button
              key={it.slug}
              onClick={() => onGo(i)}
              aria-label={`Go to ${it.title}`}
              className="pointer-events-auto relative flex h-8 w-8 items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === active
                    ? "h-3 w-3 bg-[var(--color-action)]"
                    : i < active
                      ? "h-2 w-2 bg-white"
                      : "h-2 w-2 bg-white/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/** Small inline player for the centered album's first track. */
function MiniPlayer({ preview, onToggle }: { preview: Preview; onToggle: () => void }) {
  return (
    <div className="pointer-events-auto flex w-[min(86vw,320px)] items-center gap-3 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-4 backdrop-blur-md">
      <button
        onClick={onToggle}
        aria-label={preview.playing ? `Pause ${preview.title}` : `Play ${preview.title}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-action)] text-black transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-ring)]"
      >
        {preview.playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <rect x="2" y="1" width="3" height="10" fill="currentColor" />
            <rect x="7" y="1" width="3" height="10" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 1l8 5-8 5z" fill="currentColor" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-xs uppercase text-white">{preview.title}</p>
        <div className="mt-1 h-px w-full bg-white/20">
          <span
            className="block h-px bg-[var(--color-action)]"
            style={{ width: `${preview.pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/** Mini CD at the same tilt as the stage discs; spins and lifts on hover. */
function NavDisc({ item, active }: { item: DiscItem; active: boolean }) {
  return (
    // scale lives on the outer element so it can't clash with the inner tilt
    <span
      className={`relative block h-10 w-10 shrink-0 transition-transform duration-300 ease-out [perspective:600px] group-hover:scale-[1.35] ${
        active ? "scale-110" : ""
      }`}
    >
      <span className="absolute inset-0" style={{ transform: "rotateX(-35deg) rotateZ(16deg)" }}>
        <span
          className={`block h-full w-full rounded-full bg-cover bg-center shadow-[0_2px_6px_rgba(0,0,0,0.6)] ring-1 ring-white/30 group-hover:[animation:discThumbSpin_2.6s_linear_infinite] ${
            active ? "[animation:discThumbSpin_7s_linear_infinite]" : ""
          }`}
          style={{ backgroundImage: `url("${item.thumb}")` }}
        />
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#140a1c] ring-1 ring-white/25" />
      </span>
    </span>
  );
}

/** Vertical index of every CD, pinned to the right edge. */
function DiscNav({ items, active, onGo }: Pick<LayoutProps, "items" | "active" | "onGo">) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const row = ref.current?.querySelector('[aria-current="true"]');
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);
  return (
    <nav
      ref={ref}
      aria-label="All CDs"
      className="disc-nav-glass pointer-events-auto absolute right-0 top-0 hidden h-[100dvh] flex-col gap-1 overflow-y-auto border-l border-white/15 py-6 pl-6 pr-4 shadow-[-24px_0_50px_rgba(0,0,0,0.9)] lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((it, i) => {
        const on = i === active;
        return (
          <button
            key={it.slug}
            onClick={() => onGo(i)}
            aria-current={on ? "true" : undefined}
            className={`group flex min-h-[48px] items-center justify-end gap-3 py-1.5 pl-3 text-right transition-colors ${
              on ? "text-white" : "text-white hover:text-purple-300"
            }`}
          >
            <span className="flex flex-col items-end leading-tight">
              <span
                className={`max-w-[13rem] truncate text-[13px] sm:text-sm font-extrabold uppercase tracking-wide transition-colors ${
                  on ? "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" : "text-white group-hover:text-purple-300"
                }`}
              >
                {it.title}
              </span>
              <span
                className={`text-[11px] tabular-nums font-bold tracking-wider transition-colors ${
                  on ? "text-purple-300 font-extrabold" : "text-white/90"
                }`}
              >
                {it.meta[0]?.[1]}
              </span>
            </span>
            <NavDisc item={it} active={on} />
          </button>
        );
      })}
    </nav>
  );
}

/** Centered caption under the disc, with the timeline along the bottom. */
export function InfoLayout({
  item,
  items,
  active,
  onOpen,
  onGo,
  preview,
  onTogglePreview,
}: LayoutProps) {
  return (
    <div className="disc-chrome pointer-events-none absolute inset-0 text-[var(--color-text-primary)]">
      <h2 className="sr-only">{item.title}</h2>

      <div
        key={item.slug}
        className="disc-card absolute inset-x-0 bottom-[84px] flex flex-col items-center gap-2 px-4 text-center sm:bottom-[68px]"
      >
        <p className={`text-xs uppercase ${MUTED}`}>{item.category}</p>
        <div className={D} style={{ fontSize: "clamp(28px, 8vw, 46px)" }}>
          {item.title}
        </div>
        <Chips item={item} />
        {preview && onTogglePreview && (
          <MiniPlayer preview={preview} onToggle={onTogglePreview} />
        )}
      </div>

      <DiscNav items={items} active={active} onGo={onGo} />

      <div className="absolute inset-x-0 bottom-4 flex justify-center px-5 sm:px-8">
        <div className="w-full max-w-[500px]">
          <TimelineDots items={items} active={active} onGo={onGo} />
        </div>
      </div>
    </div>
  );
}
