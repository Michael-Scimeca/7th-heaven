"use client";

import React from "react";
import { Search, X } from "lucide-react";
import InputField from "./InputField";

export interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  showClear?: boolean;
  onClear?: () => void;
  autoFocus?: boolean;
  width?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  containerClassName = "",
  id,
  name,
  ariaLabel = "Search",
  showClear = true,
  onClear,
  autoFocus,
  width,
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  };

  const widthStyle = width ? { width } : undefined;

  return (
    <div
      className={`relative inline-flex w-full max-w-[300px] min-w-[220px] items-center ${containerClassName}`}
      style={widthStyle}
    >
      <InputField
        id={id}
        name={name}
        aria-label={ariaLabel}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        glow={true}
        inputClassName={`form-input no-bg-icon w-full   border-none outline-none py-2.5 !pl-11 !pr-8   placeholder: text-white/40 rounded-lg transition-colors ${className}`}
      />
      <div className="pointer-events-none !absolute top-1/2 left-3 z-20 flex -translate-y-1/2 items-center justify-center text-white/50">
        <Search className="h-4 w-4" />
      </div>
      {showClear && value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          className="hover- btn-transition !absolute top-1/2 right-2 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded bg-white/10 p-0.5 text-white/50"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}

export default SearchInput;
