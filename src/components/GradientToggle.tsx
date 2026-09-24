"use client";

import React, { useState, useEffect, useRef } from "react";

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
  className = "",
}: GradientToggleProps) {
  const generatedId = React.useId();
  const toggleId = id || generatedId;

  const [animState, setAnimState] = useState<"idle" | "in" | "out">("idle");
  const prevChecked = useRef(checked);

  useEffect(() => {
    if (prevChecked.current !== checked) {
      prevChecked.current = checked;
      setAnimState(checked ? "in" : "out");
    }
  }, [checked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.checked;
    prevChecked.current = nextVal;
    setAnimState(nextVal ? "in" : "out");
    onChange(nextVal);
  };

  const handleAnimationEnd = () => {
    setAnimState("idle");
  };

  const thumbClass =
    animState === "in"
      ? "animate-squish-in"
      : animState === "out"
        ? "animate-squish-out"
        : checked
          ? "translate-x-[22px]"
          : "translate-x-0";

  return (
    <label
      htmlFor={toggleId}
      className={`group inline-flex cursor-pointer items-center gap-3 select-none ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
    >
      <div className="squishy-toggle relative inline-block h-[28px] w-[50px] shrink-0 overflow-hidden rounded-lg border border-white/25 bg-black/50 p-[3px] shadow-inner">
        <input
          id={toggleId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none rounded-full border-none opacity-0 outline-none disabled:cursor-not-allowed"
        />

        {/* Off background */}
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-white/10" />

        {/* On background (gradient) */}
        <div
          className={`pointer-events-none absolute inset-0 rounded-lg border border-[#8c0eaf] bg-linear-to-r from-[#6917BF] via-[#8c0eaf] to-[#6F008E] shadow-[0_0_15px_rgba(140,14,175,0.6)] ${checked ? "opacity-100" : "opacity-0"}`}
        />

        {/* Gooey Squishy Thumb */}
        <div
          onAnimationEnd={handleAnimationEnd}
          className={`squishy-thumb pointer-events-none absolute top-1/2 left-[3px] z-20 -mt-[11px] h-[22px] w-[22px] rounded-lg bg-white shadow-[0_2px_5px_rgba(0,0,0,0.5)] ${thumbClass}`}
        />
      </div>

      {label && (
        <span
          className={`text-left ${checked ? " " : "group-hover:text-white"}`}
        >
          {label}
        </span>
      )}
    </label>
  );
}

export default GradientToggle;
