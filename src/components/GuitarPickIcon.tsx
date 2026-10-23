"use client";

/**
 * Mobile menu icon: 4 guitar picks pointing at the centre (a "+"), which
 * spins when the menu opens. Every visual knob is a CSS variable so it can be
 * tuned live with PickIconTuner (?tuner=true or ?picks=true) and made
 * permanent by pasting the tuner's "Copy CSS" output into globals.css.
 *
 *   --pick-size            icon box size                       (28px)
 *   --pick-gap             distance from centre to each tip     (3.5px, in icon units)
 *   --pick-scale           size of each pick                    (1)
 *   --pick-width           pick width multiplier                (1)
 *   --pick-length          pick length multiplier               (1)
 *   --pick-rest            resting rotation                     (0deg)
 *   --pick-spin            rotation added per click             (135deg)
 *   --pick-continuous      0 = spin out & back, 1 = keep spinning each click (0)
 *   --pick-duration        spin duration                        (700ms)
 *   --pick-ease            spin easing                          (site "swoosh" curve)
 *   --pick-color           fill colour                          (#ffffff)
 *   --pick-hover-color     fill colour on hover                 (= --pick-color)
 */

import { useState, type CSSProperties } from "react";

// One pick, tip at the origin, body pointing straight up (26 units long, 22 wide).
export const GUITAR_PICK_PATH =
  "M0 0C-1.6 0 -2.6 -1.3 -4 -3.5C-7.2 -8.3 -10.6 -12.9 -11.1 -17.1C-11.6 -21.9 -8.6 -26 0 -26C8.6 -26 11.6 -21.9 11.1 -17.1C10.6 -12.9 7.2 -8.3 4 -3.5C2.6 -1.3 1.6 0 0 0Z";

const SWOOSH_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";

export default function GuitarPickIcon({ open, className = "" }: { open: boolean; className?: string }) {
  // Count every open/close so "continuous" mode can keep spinning the same way.
  const [turns, setTurns] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setTurns((t) => t + 1);
  }

  const svgStyle = {
    "--pick-open": open ? 1 : 0,
    "--pick-turns": turns,
    width: "var(--pick-size, 28px)",
    height: "var(--pick-size, 28px)",
    transform:
      "rotate(calc(var(--pick-rest, 0deg) + var(--pick-spin, 135deg) * (var(--pick-open) * (1 - var(--pick-continuous, 0)) + var(--pick-turns) * var(--pick-continuous, 0))))",
    transitionProperty: "transform, color",
    transitionDuration: "var(--pick-duration, 700ms)",
    transitionTimingFunction: `var(--pick-ease, ${SWOOSH_EASE})`,
  } as CSSProperties;

  const pickStyle: CSSProperties = {
    transformOrigin: "0 0",
    transform:
      "translateY(calc(var(--pick-gap, 3.5px) * -1)) scale(calc(var(--pick-scale, 1) * var(--pick-width, 1)), calc(var(--pick-scale, 1) * var(--pick-length, 1)))",
    transition: "transform 300ms ease",
  };

  return (
    <svg
      viewBox="-31 -31 62 62"
      fill="currentColor"
      aria-hidden="true"
      className={`overflow-visible text-[var(--pick-color,#ffffff)] group-hover:text-[var(--pick-hover-color,var(--pick-color,#ffffff))] motion-reduce:!transition-none ${className}`}
      style={svgStyle}
    >
      {[0, 90, 180, 270].map((deg) => (
        <g key={deg} transform={`rotate(${deg})`}>
          <path d={GUITAR_PICK_PATH} style={pickStyle} />
        </g>
      ))}
    </svg>
  );
}
