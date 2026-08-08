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
 * Recreated from https://codepen.io/nicolasjesenberger/pen/bGQwBYo (design by @liamdforsyth),
 * ported to a controlled React component sized to match the site's existing
 * w-12 h-6 toggle footprint (see style-guide "Toggles & Switches").
 *
 * The thumb's resting position/color always come from the `peer-checked`
 * utility classes below, so the toggle is correct even without JS. The
 * `animate-squish-in` / `animate-squish-out` classes (defined in
 * globals.css) are a pure enhancement layered on top for the bounce.
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
      className={`relative inline-block h-6 w-12 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
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
      <div className="pointer-events-none absolute inset-0 rounded-full bg-white/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-colors duration-300 peer-checked:bg-purple-600" />

      {/* thumb */}
      <div
        ref={thumbRef}
        onAnimationEnd={handleAnimationEnd}
        className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-[0_4px_4px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-out peer-checked:translate-x-6"
      />
    </div>
  );
}

export default SquishyToggle;
