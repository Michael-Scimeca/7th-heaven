'use client';

import React, { useRef, useEffect } from 'react';

export interface SquishyToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  className?: string;
}

/**
 * Squishy toggle switch.
 * Recreated from https://codepen.io/nicolasjesenberger/pen/bGQwBYo (design by @liamdforsyth).
 *
 * This mirrors the standalone reference demo 1:1 (52x30 track, 22x22 thumb,
 * #aeaeae / #9333ea colors) — keep this file and the reference demo in sync
 * if either one changes.
 *
 * The thumb's resting position/color always come from the `peer-checked`
 * utility classes below, so the toggle is correct even without JS. The
 * `animate-squish-in` / `animate-squish-out` classes (defined in
 * globals.css) are a pure enhancement layered on top for the bounce.
 *
 * IMPORTANT: the thumb intentionally has no `transition-transform`. Layering
 * a CSS transition and the squish `animation` on the same `transform`
 * property causes the browser to matrix-interpolate between a transform
 * with `scale(...)` and one without it when control hands back from the
 * animation to the transition — producing a wild, far-flung intermediate
 * frame. The animation (with `forwards`) fully owns the motion; don't add
 * `transition-transform` back here.
 *
 * The outer pill also needs `overflow-hidden`. The bounce easing
 * (cubic-bezier(0,0,.3,1.5)) intentionally overshoots past its keyframe
 * target before settling — that's what makes it feel springy — so without
 * clipping, the thumb visibly pokes outside the track at the peak of the
 * bounce. Clipping to the pill shape contains that overshoot without
 * touching the animation curve itself.
 */
export function SquishyToggle({
  checked,
  onChange,
  disabled = false,
  label = 'Toggle switch',
  id = 'squishy-toggle',
  className = '',
}: SquishyToggleProps) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const thumb = thumbRef.current;
    if (!thumb) return;
    thumb.classList.remove('animate-squish-in', 'animate-squish-out');
    void thumb.offsetWidth; // force reflow so the animation restarts every time
    thumb.classList.add(checked ? 'animate-squish-in' : 'animate-squish-out');
  }, [checked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const handleAnimationEnd = () => {
    thumbRef.current?.classList.remove('animate-squish-in', 'animate-squish-out');
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`squishy-toggle relative inline-block h-[30px] w-[52px] shrink-0 select-none overflow-hidden rounded-full border border-white/25 bg-black/50 shadow-inner ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none rounded-full border-none outline-none opacity-0 disabled:cursor-not-allowed"
      />

      {/* track */}
      <div className="squishy-track pointer-events-none absolute inset-0 rounded-full bg-white/10 transition-colors duration-300 peer-checked:bg-[#9333ea] peer-checked:border-[#a855f7] peer-checked:shadow-[0_0_12px_rgba(168,85,247,0.6)]" />

      {/* thumb — resting position set via inline style so it's always correct;
          the squish animation overrides transform during the bounce then hands back */}
      <div
        ref={thumbRef}
        onAnimationEnd={handleAnimationEnd}
        style={{ transform: `translateX(${checked ? 24 : 0}px)` }}
        className="squishy-thumb pointer-events-none absolute left-[3px] top-1/2 -mt-[11px] z-20 h-[22px] w-[22px] rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
}

export default SquishyToggle;

