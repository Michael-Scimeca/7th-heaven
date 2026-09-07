"use client";

import React, { useEffect, useRef, useState, type ButtonHTMLAttributes } from "react";
import { gsap } from "gsap";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Physics2DPlugin);
}

export interface SparkleGenerateButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: React.ReactNode;
  /** Number of dust particles in the loop. Defaults to 10. */
  dotCount?: number;
  /** Lock the button into its active (hover) visual state -- glow, stroke
   *  trace and dust keep looping without a real pointer hover. Useful for
   *  style-guide demos or drawing attention to the CTA. */
  active?: boolean;
  isActive?: boolean;
  icon?: React.ReactNode | boolean;
  className?: string;
}

/**
 * "Generate Site" sparkle/dust button.
 * Ported from Aaron Iker's GSAP Sparkle Generate Button
 * (https://codepen.io/aaroniker/pen/gOdBBKq), customized:
 *  - permanent purple fill (not hover-only)
 *  - no star icon, label-only
 *  - dust particles rise from the button's center band and, at the end of
 *    their run, home back into the button and shrink instead of fading in
 *    place mid-flight
 */
export const SparkleGenerateButton = React.forwardRef<
  HTMLButtonElement,
  SparkleGenerateButtonProps
>(
  (
    {
      children = "Generate Site",
      dotCount = 10,
      active = false,
      isActive = false,
      icon,
      className = "",
      type = "button",
      ...buttonProps
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (forwardedRef as React.RefObject<HTMLButtonElement | null>) || internalRef;
    const dotsSvgRef = useRef<SVGSVGElement | null>(null);
    const circleTemplateRef = useRef<SVGCircleElement | null>(null);
    const finalTimelineRef = useRef<gsap.core.Tween | null>(null);
    const hoveringRef = useRef(false);
    const reduceMotionRef = useRef(false);

    const forced = active || isActive;
    const forcedRef = useRef(forced);
    useEffect(() => {
      forcedRef.current = forced;
    }, [forced]);

    // one-time DOM setup: dust layer
    useEffect(() => {
      let isMounted = true;
      let timerId: ReturnType<typeof setTimeout> | null = null;
      const button = buttonRef.current;
      if (!button) return;

      reduceMotionRef.current =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const width = button.offsetWidth;
      const height = button.offsetHeight;
      const svgNS = "http://www.w3.org/2000/svg";

      const createSVG = (
        w: number,
        h: number,
        cls: string,
        childType: string,
        attrs: Record<string, string>
      ) => {
        const svg = document.createElementNS(svgNS, "svg");
        svg.classList.add(cls);
        const child = document.createElementNS(svgNS, childType);
        svg.setAttributeNS(null, "viewBox", `0 0 ${w} ${h}`);
        Object.entries(attrs).forEach(([k, v]) => child.setAttribute(k, v));
        svg.appendChild(child);
        return { svg, child };
      };

      const dotsMade = createSVG(width, height, "sgb-dots", "circle", {
        cx: "0",
        cy: "0",
        r: "0",
      });
      dotsSvgRef.current = dotsMade.svg as unknown as SVGSVGElement;
      circleTemplateRef.current = dotsMade.child as unknown as SVGCircleElement;
      button.appendChild(dotsMade.svg);

      buildDots(dotCount);

      const ro = new ResizeObserver(() => {
        if (dotsSvgRef.current) buildDots(dotCount);
      });
      ro.observe(button);

      const onEnter = () => {
        hoveringRef.current = true;
        activate();
      };
      const onLeave = () => {
        hoveringRef.current = false;
        deactivate();
      };
      const onDown = () => {
        button.classList.add("sgb-is-clicked");
      };
      const onUp = () => {
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
          button.classList.remove("sgb-is-clicked");
        }, 500);
      };

      button.addEventListener("pointerenter", onEnter);
      button.addEventListener("pointerleave", onLeave);
      button.addEventListener("pointerdown", onDown);
      button.addEventListener("pointerup", onUp);
      button.addEventListener("pointercancel", onUp);

      return () => {
        isMounted = false;
        if (timerId) clearTimeout(timerId);
        ro.disconnect();
        button.removeEventListener("pointerenter", onEnter);
        button.removeEventListener("pointerleave", onLeave);
        button.removeEventListener("pointerdown", onDown);
        button.removeEventListener("pointerup", onUp);
        button.removeEventListener("pointercancel", onUp);
        finalTimelineRef.current?.kill();
        dotsSvgRef.current?.remove();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // rebuild the dust field whenever dotCount or text children change
    useEffect(() => {
      if (dotsSvgRef.current) buildDots(dotCount);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dotCount, children]);

    // Dots are strictly active ONLY on hover
    useEffect(() => {
      if (!hoveringRef.current) {
        deactivate();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forced]);

    function buildDots(count: number) {
      const button = buttonRef.current;
      const dotsSvg = dotsSvgRef.current;
      const circleTemplate = circleTemplateRef.current;
      if (reduceMotionRef.current || !button || !dotsSvg || !circleTemplate) return;

      const width = button.offsetWidth;
      const height = button.offsetHeight;

      dotsSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      finalTimelineRef.current?.kill();
      finalTimelineRef.current = null;
      while (dotsSvg.firstChild) dotsSvg.removeChild(dotsSvg.firstChild);

      const timeline = gsap.timeline({ paused: true });

      for (let i = 0; i < count; i++) {
        const p = circleTemplate.cloneNode(true) as SVGCircleElement;
        dotsSvg.appendChild(p);

        gsap.set(p, {
          attr: {
            cx: gsap.utils.random(width * 0.15, width * 0.85),
            cy: height * 0.5,
            r: 0,
          },
        });

        const durationRandom = gsap.utils.random(5, 7);
        const tl = gsap.timeline();
        tl.to(
          p,
          {
            duration: durationRandom,
            rotation: i % 2 === 0 ? 100 : -100,
            attr: {
              r: gsap.utils.random(0.8, 1.6),
              cy: -height * gsap.utils.random(0.2, 0.5),
            },
            physics2D: {
              angle: -90,
              gravity: gsap.utils.random(-1, -2.5),
              velocity: gsap.utils.random(4, 8),
            },
          },
          "-=" + durationRandom / 2
        ).to(
          p,
          {
            duration: durationRandom / 3,
            ease: "power2.in",
            x: 0,
            y: 0,
            attr: { cx: width / 2, cy: height / 2, r: 0 },
          },
          "-=" + durationRandom / 4
        );

        timeline.add(tl, i / 3);
      }

      finalTimelineRef.current = gsap.to(timeline, {
        duration: 10,
        repeat: -1,
        time: timeline.duration(),
        paused: true,
      });

      if (hoveringRef.current) finalTimelineRef.current.restart().play();
    }

    function activate() {
      const button = buttonRef.current;
      if (!button) return;
      if (finalTimelineRef.current) {
        finalTimelineRef.current.play();
      }
      gsap.to(button, {
        "--sgb-dots-opacity": ".9",
        duration: 0.25,
        onStart: () => finalTimelineRef.current?.play(),
      });
    }

    function deactivate() {
      const button = buttonRef.current;
      if (!button) return;
      gsap.to(button, {
        "--sgb-dots-opacity": "0",
        duration: 0.15,
        onComplete: () => finalTimelineRef.current?.pause(),
      });
    }

    return (
      <>
        <button
          ref={buttonRef}
          type={type}
          className={`sgb-generate-button ${forced ? "sgb-is-forced" : ""} ${className}`}
          {...buttonProps}
        >
          <span>
            {typeof icon === "object" && icon !== null ? icon : null}
            {children}
          </span>
        </button>

        <style jsx global>{`
          .sgb-generate-button {
            --sgb-shadow-wide: rgba(102, 3, 231, 0.94);
            --sgb-shadow-inset: rgba(232, 11, 11, 1);
            --sgb-shadow-outline: 2px;
            --sgb-dots-opacity: 0;
            --sgb-scale: 1;
            --sgb-translate-y: 0px;
            appearance: none;
            outline: none;
            border: 1px solid rgba(255, 255, 255, 0.25);
            padding: 10px 24px;
            border-radius: 29px;
            margin: 0;
            background: #7116ff26;
            color: #fff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            z-index: 1;
            transform: translateY(var(--sgb-translate-y, 0px)) translateZ(0);

            transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s, box-shadow 0.3s,
              color 0.3s;
          }

          .sgb-generate-button span {
            position: relative;
            z-index: 1;
            font-weight: 600;
            font-size: 16px;
            line-height: 26px;
            letter-spacing: 0.005em;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .sgb-generate-button svg {
            display: block;
            overflow: visible;
            pointer-events: none;
          }
          .sgb-generate-button svg.sgb-dots {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            fill: #ffffff;
            opacity: 0;
            pointer-events: none;
            overflow: visible;
            transition: opacity 0.3s ease;
          }
          .sgb-generate-button:hover svg.sgb-dots {
            opacity: var(--sgb-dots-opacity, 0.9);
          }

          .sgb-generate-button:hover,
          .sgb-generate-button.sgb-is-forced {
            animation: sgb-bg-fade 2s ease-in-out infinite alternate;
          }

          @keyframes sgb-bg-fade {
            0% {
              background: #7116ff26;
              border-color: rgba(255, 255, 255, 0.25);
            }
            100% {
              background: #7116ff99;
              border-color: rgba(255, 255, 255, 0.5);
            }
          }

          /* Tactile Push-Down & Background Fade on Click */
          .sgb-generate-button:active,
          .sgb-generate-button:hover:active,
          .sgb-generate-button.sgb-is-forced:active,
          .sgb-generate-button.sgb-is-clicked {
            --sgb-translate-y: 3px;
            animation: none !important;
            background: #7116ff8c;
            transition: transform 0.08s ease, background 0.08s ease, box-shadow 0.08s ease;
          }

          @media (prefers-reduced-motion: reduce) {
            .sgb-generate-button,
            .sgb-generate-button * {
              transition: none !important;
              animation: none !important;
            }
          }
        `}</style>
      </>
    );
  }
);

SparkleGenerateButton.displayName = "SparkleGenerateButton";

export default SparkleGenerateButton;
