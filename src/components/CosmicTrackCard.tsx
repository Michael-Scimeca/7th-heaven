"use client";

import React, { useRef, useEffect, type ButtonHTMLAttributes } from "react";
import gsap from "gsap";
import { Play } from "lucide-react";

export interface CosmicTrackCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  tag?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [255, 255, 255];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mixHex(hexA: string, hexB: string, t: number): string {
  const clamp01 = Math.min(1, Math.max(0, t));
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = Math.round(r1 + (r2 - r1) * clamp01);
  const g = Math.round(g1 + (g2 - g1) * clamp01);
  const b = Math.round(b1 + (b2 - b1) * clamp01);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * CosmicTrackCard — Rectangular media track card featuring GSAP cursor-tracking glow,
 * rotating gradient shine border, and clean header tag & play action.
 */
export const CosmicTrackCard = React.forwardRef<
  HTMLButtonElement,
  CosmicTrackCardProps
>(
  (
    {
      tag,
      title,
      subtitle,
      isActive = false,
      className = "",
      type = "button",
      style,
      ...buttonProps
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef =
      (forwardedRef as React.RefObject<HTMLButtonElement | null>) || internalRef;

    useEffect(() => {
      const button = (buttonRef as React.RefObject<HTMLButtonElement | null>).current;
      if (!button) return;

      const handlePointerMove = (e: PointerEvent) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        gsap.to(button, {
          "--pointer-x": `${x}px`,
          "--pointer-y": `${y}px`,
          duration: 0.6,
        });

        const start =
          getComputedStyle(button).getPropertyValue("--button-glow-start").trim() ||
          "#B000E8";
        const end =
          getComputedStyle(button).getPropertyValue("--button-glow-end").trim() ||
          "#009FFD";

        gsap.to(button, {
          "--button-glow": mixHex(start, end, rect.width ? x / rect.width : 0),
          duration: 0.2,
        });
      };

      button.addEventListener("pointermove", handlePointerMove);
      return () => button.removeEventListener("pointermove", handlePointerMove);
    }, [buttonRef]);

    return (
      <button
        ref={buttonRef}
        type={type}
        className={`gob-button sgb-generate-button !rounded-2xl ${isActive ? "sgb-is-forced" : ""} ${className}`}
        style={style}
        {...buttonProps}
      >
        <div className="gob-gradient" aria-hidden="true" />
        <span className="!p-4 sm:!p-5 !min-w-0 !w-full !block text-left">
          <div className="flex items-center justify-between gap-2 mb-2">
            {tag ? (
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300/90 truncate">
                {tag}
              </span>
            ) : <span />}
            <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5 shrink-0 ml-auto">
              <Play className="w-3 h-3 fill-current text-white/90" /> Play
            </span>
          </div>
          <h4 className="text-white text-base sm:text-lg font-bold uppercase tracking-wide truncate leading-snug">
            {title}
          </h4>
          {subtitle && (
            <p className="text-white/65 text-xs sm:text-sm truncate mt-1 font-normal">
              {subtitle}
            </p>
          )}
        </span>
      </button>
    );
  }
);

CosmicTrackCard.displayName = "CosmicTrackCard";

export default CosmicTrackCard;
