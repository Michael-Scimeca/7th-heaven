'use client';

import React, { useRef } from 'react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    onChange(next);

    const thumb = thumbRef.current;
    if (!thumb) return;
    thumb.classList.remove('animate-squish-in', 'animate-squish-out');
    void thumb.offsetWidth; // force reflow so the animation restarts every time
    thumb.classList.add(next ? 'animate-squish-in' : 'animate-squish-out');
  };

  const handleAnimationEnd = () => {
    thumbRef.current?.classList.remove('animate-squish-in', 'animate-squish-out');
  };

  return (
    <div
      className={`squishy-toggle relative inline-block h-[30px] w-[52px] select-none bg-[oklab(0.999994_0.0000455678_0.0000200868_/_0.02)] ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
      />

      {/* track */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[#aeaeae] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-colors duration-300 peer-checked:bg-[#9333ea]" />

      {/* thumb */}
      <div
        ref={thumbRef}
        onAnimationEnd={handleAnimationEnd}
        className="pointer-events-none absolute left-1 top-1 h-[22px] w-[22px] rounded-full bg-white shadow-[0_4px_4px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.2)] peer-checked:translate-x-[22px]"
      />
    </div>
  );
}

export default SquishyToggle;
