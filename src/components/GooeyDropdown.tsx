'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface Option {
  label: string;
  value: string;
  icon?: string;
}

export interface GooeyDropdownProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  theme?: 'dark' | 'light' | 'neon';
  id?: string;
  disabled?: boolean;
}

export function GooeyDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  theme = 'neon',
  id = 'gooey-dropdown',
  disabled = false,
}: GooeyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block w-full text-left select-none">
      {/* SVG Gooey Filter definition */}
      <svg className="hidden">
        <defs>
          <filter id={`goo-filter-${id}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Main Container with SVG Filter applied */}
      <div style={{ filter: `url(#goo-filter-${id})` }} className="relative w-full">
        {/* Toggle Face / Header Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-between font-bold text-sm transition-all duration-300 shadow-lg outline-none border ${
            disabled
              ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/10 text-white/50'
              : theme === 'neon'
              ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer'
              : theme === 'dark'
              ? 'bg-[#12121a] hover:bg-[#1a1a24] text-white border-white/10 shadow-md cursor-pointer'
              : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-md cursor-pointer'
          }`}
        >
          <span className="truncate flex items-center gap-2">
            {selectedOption?.icon && <span>{selectedOption.icon}</span>}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </span>
          <span
            className={`w-2 h-2 border-r-2 border-b-2 transition-transform duration-300 ml-2 ${
              theme === 'light' ? 'border-slate-800' : 'border-white'
            } ${isOpen ? '-rotate-135 translate-y-0.5' : 'rotate-45 -translate-y-0.5'}`}
          />
        </button>

        {/* Dropdown Items List with Liquid Gooey Animation */}
        <div
          className={`absolute left-0 right-0 z-30 transition-all duration-300 ease-[cubic-bezier(0.93,0.88,0.1,0.8)] ${
            isOpen
              ? 'top-[calc(100%+12px)] opacity-100 visible pointer-events-auto'
              : 'top-1/2 opacity-0 invisible pointer-events-none'
          }`}
        >
          {/* Liquid Tail element */}
          <div
            className={`absolute -top-3 right-6 w-4 h-6 pointer-events-none ${
              theme === 'light' ? 'bg-white' : theme === 'neon' ? 'bg-purple-600' : 'bg-[#12121a]'
            }`}
          />

          <ul
            className={`w-full p-2 rounded-xl flex flex-col gap-1 shadow-2xl overflow-hidden ${
              theme === 'neon'
                ? 'bg-purple-600 text-white border border-purple-400/50 shadow-[0_10px_30px_rgba(168,85,247,0.4)]'
                : theme === 'dark'
                ? 'bg-[#0f0f15] text-white border border-white/10'
                : 'bg-white text-slate-900 border border-slate-200'
            }`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? theme === 'neon'
                          ? 'bg-purple-900 text-white font-black border border-purple-400/30'
                          : 'bg-purple-600 text-white font-black'
                        : theme === 'light'
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {opt.icon && <span>{opt.icon}</span>}
                      <span>{opt.label}</span>
                    </span>
                    {isSelected && <span className="text-cyan-400 font-extrabold text-xs">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GooeyDropdown;
