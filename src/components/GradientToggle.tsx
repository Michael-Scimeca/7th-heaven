'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface GradientToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function GradientToggle({
  checked,
  onChange,
  label,
  id,
  disabled = false,
  className = '',
}: GradientToggleProps) {
  const generatedId = React.useId();
  const toggleId = id || generatedId;

  const [animState, setAnimState] = useState<'idle' | 'in' | 'out'>('idle');
  const prevChecked = useRef(checked);

  useEffect(() => {
    if (prevChecked.current !== checked) {
      prevChecked.current = checked;
      setAnimState(checked ? 'in' : 'out');
    }
  }, [checked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.checked;
    prevChecked.current = nextVal;
    setAnimState(nextVal ? 'in' : 'out');
    onChange(nextVal);
  };

  const handleAnimationEnd = () => {
    setAnimState('idle');
  };

  const thumbClass = animState === 'in'
    ? 'animate-squish-in'
    : animState === 'out'
    ? 'animate-squish-out'
    : checked
    ? 'translate-x-[22px]'
    : 'translate-x-0';

  return (
    <label
      htmlFor={toggleId}
      className={`inline-flex items-center gap-3 select-none cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="squishy-toggle relative inline-block w-[50px] h-[28px] shrink-0 rounded-full overflow-hidden p-[3px] transition-all duration-300 shadow-inner border border-white/25 bg-black/50">
        <input
          id={toggleId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none rounded-full border-none outline-none opacity-0 disabled:cursor-not-allowed"
        />

        {/* Off background */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-white/10 transition-opacity duration-300" />

        {/* On background (gradient) */}
        <div className={`pointer-events-none absolute inset-0 rounded-full bg-linear-to-r from-[#6917BF] via-[#8c0eaf] to-[#6F008E] border border-[#8c0eaf] shadow-[0_0_15px_rgba(140,14,175,0.6)] transition-opacity duration-300 ${checked ? 'opacity-100' : 'opacity-0'}`} />

        {/* Gooey Squishy Thumb */}
        <div
          onAnimationEnd={handleAnimationEnd}
          className={`squishy-thumb pointer-events-none absolute left-[3px] top-1/2 -mt-[11px] z-20 h-[22px] w-[22px] rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.5)] ${thumbClass}`}
        />
      </div>

      {label && (
        <span className={`text-xs font-bold leading-tight transition-colors text-left ${checked ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
          {label}
        </span>
      )}
    </label>
  );
}

export default GradientToggle;
