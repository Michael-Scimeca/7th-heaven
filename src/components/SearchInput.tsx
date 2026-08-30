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
      className={`relative inline-flex items-center min-w-[220px] max-w-[300px] w-full ${containerClassName}`}
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
        inputClassName={`form-input no-bg-icon w-full font-semibold border-none outline-none py-2.5 !pl-11 !pr-8 text-white placeholder:text-white/40 rounded-lg transition-colors ${className}`}
      />
      <div className="!absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 z-20 flex items-center justify-center">
        <Search className="w-4 h-4" />
      </div>
      {showClear && value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          className="!absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-0.5 rounded bg-white/10 transition z-20 flex items-center justify-center cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      ) : null}
    </div>
  );
}

export default SearchInput;
