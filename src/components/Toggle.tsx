"use client";

import React, { useState, useRef, useEffect } from "react";

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  hideLabel?: boolean;
  labelPosition?: "left" | "right";
  description?: React.ReactNode;
  size?: "sm" | "md";
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLLabelElement>) => void;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

/**
 * Unified accessible toggle switch component.
 *
 * IMPORTANT ARCHITECTURAL NOTES:
 * 1. The thumb intentionally has NO transition on `transform`.
 *    Layering a CSS transition and the squish `animation` on the same `transform`
 *    property causes the browser to matrix-interpolate between a transform with `scale(...)`
 *    and one without it when control hands back from the animation to the transition —
 *    producing a wild, far-flung intermediate frame. The CSS keyframe animation fully owns the motion.
 *
 * 2. The track needs `overflow: hidden`.
 *    The bounce easing (cubic-bezier(0,0,.3,1.5)) intentionally overshoots past its keyframe
 *    target before settling — that's what makes it feel springy — so without clipping, the
 *    thumb visibly pokes outside the track at the peak of the bounce. Clipping contains that
 *    overshoot cleanly without modifying the spring curve.
 *
 * 3. All styles and animations are driven by CSS classes and CSS custom property tokens
 *    defined in the TOGGLE block in globals.css. No hex colors or runtime inline style objects.
 */
export function Toggle({
  checked = false,
  onChange,
  label,
  hideLabel = false,
  labelPosition = "right",
  description,
  size = "md",
  disabled = false,
  id,
  name,
  className = "",
  onClick,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}: ToggleProps) {
  const generatedId = React.useId();
  const toggleId = id || generatedId;
  const descId = description ? `${toggleId}-desc` : undefined;

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
    onChange?.(nextVal);
  };

  const handleAnimationEnd = () => {
    setAnimState("idle");
  };

  const handleClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    // Keep e.stopPropagation so a toggle sitting inside a clickable card/row
    // does not trigger ancestor container click handlers.
    e.stopPropagation();
    onClick?.(e);
  };

  const resolvedAriaDescribedBy = [ariaDescribedBy, descId]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <label
      htmlFor={toggleId}
      onClick={handleClick}
      className={`toggle toggle-- ${size}  ${labelPosition === "left" ? "toggle--label-left" : ""}  ${disabled ? "toggle--disabled" : ""} max-w-full ${className} `}
    >
      <input
        id={toggleId}
        name={name}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        aria-label={hideLabel && typeof label === "string" ? label : undefined}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={resolvedAriaDescribedBy}
        className="toggle__input"
      />

      <span className="toggle__track">
        <span className="toggle__fill" />
        <span
          className="toggle__thumb"
          data-anim={animState === "idle" ? undefined : animState}
          onAnimationEnd={handleAnimationEnd}
        />
      </span>

      {(label || description) && (
        <span className={`toggle__label min-w-0 flex-1 ${hideLabel ? "sr-only" : ""} `}>
          {label && <span className="toggle__title min-w-0 break-words">{label}</span>}
          {description && !hideLabel && (
            <span id={descId} className="toggle__description min-w-0 break-words">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}

export default Toggle;
