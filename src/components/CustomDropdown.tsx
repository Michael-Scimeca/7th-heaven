"use client";

import React, { useState, useRef, useEffect } from "react";

export interface CustomDropdownOption<T extends string | number> {
  value: T;
  label: string;
}

export interface CustomDropdownProps<T extends string | number> {
  id?: string;
  label?: string;
  ariaLabel?: string;
  value: T;
  options: CustomDropdownOption<T>[] | T[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  chevronColor?: string;
}

export function CustomDropdown<T extends string | number>({
  id,
  ariaLabel,
  value,
  options,
  onChange,
  placeholder = "Select option",
  className = "",
  wrapperClassName = "w-full",
  chevronColor = "#f43f5e",
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to object format
  const normalizedOptions: CustomDropdownOption<T>[] = options.map((opt) => {
    if (typeof opt === "object" && opt !== null && "value" in opt) {
      return opt as CustomDropdownOption<T>;
    }
    return {
      value: opt as T,
      label: typeof opt === "number" ? `${opt} miles` : String(opt),
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectOption = (optValue: T) => {
    setIsOpen(false);
    onChange(optValue);
  };

  return (
    <div ref={dropdownRef} className={`relative ${wrapperClassName}`}>
      {/* Trigger Button */}
      <button
        id={id}
        aria-label={ariaLabel || "Select menu"}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-3 bg-[#00000029] border border-white/20 rounded-xl px-4 py-3 text-white text-base sm:text-lg font-semibold outline-none transition-all hover:border-white/40 focus:border-[var(--color-accent)] cursor-pointer select-none ${className}`}>
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={chevronColor}
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <path d="M12 15l-6-6h12l-6 6z" />
        </svg>
      </button>

      {/* Dropdown Options Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel || "Options"}
          className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#160f2d] border border-white/20 rounded-xl   overflow-hidden  backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-150 max-h-60 overflow-y-auto">
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => handleSelectOption(opt.value)}
                className={`w-full text-left px-4 py-3 text-base font-semibold transition-colors flex items-center justify-between cursor-pointer select-none !rounded-none ${isSelected
                  ? "bg-white/20 text-white   "
                  : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}>
                <span>{opt.label}</span>
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-pink-400 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;
