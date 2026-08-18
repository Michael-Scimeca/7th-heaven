'use client';

import React from 'react';

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

  return (
    <label
      htmlFor={toggleId}
      className={`inline-flex items-center gap-3 select-none cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="relative inline-block w-[48px] h-[26px] shrink-0 rounded-full overflow-hidden p-[3px] transition-all duration-300 shadow-sm border border-white/20">
        <input
          id={toggleId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />

        {/* Off background */}
        <div className="absolute inset-0 bg-white/10 transition-opacity duration-300" />

        {/* On background (gradient) */}
        <div className={`absolute inset-0 bg-linear-to-r from-[#6917BF] via-[#8c0eaf] to-[#6F008E] transition-opacity duration-300 ${checked ? 'opacity-100' : 'opacity-0'}`} />

        {/* Glow shadow on check */}
        <div className={`absolute inset-0 shadow-[0_0_12px_rgba(140,14,175,0.6)] transition-opacity duration-300 ${checked ? 'opacity-100' : 'opacity-0'}`} />

        {/* Sliding White Circle Thumb */}
        <div
          className={`relative z-10 w-[20px] h-[20px] rounded-full bg-white shadow-md transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            checked ? 'translate-x-[22px]' : 'translate-x-0'
          }`}
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
