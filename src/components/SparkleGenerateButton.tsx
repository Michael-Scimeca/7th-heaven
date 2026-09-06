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

    const strokeGroupRef = useRef<HTMLDivElement | null>(null);

    // one-time DOM setup: dust layer + dashed stroke-trace layer
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
      const style = getComputedStyle(button);
      const borderRadius = parseInt(style.borderRadius, 10) || height / 2;
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

      const strokeGroup = document.createElement("div");
      strokeGroup.classList.add("sgb-stroke");
      strokeGroupRef.current = strokeGroup;

      const computeDashArray = (w: number, h: number) => {
        const straight = 2 * Math.max(0, w - h);
        const curves = Math.PI * h;
        const perimeter = straight + curves;
        if (perimeter <= 0) return "48 52";
        const dashPercent = Math.min(52, Math.max(30, Math.round((w / perimeter) * 100)));
        return `${dashPercent} ${100 - dashPercent}`;
      };

      const createStrokeSVG = () => {
        const svg = document.createElementNS(svgNS, "svg");
        svg.classList.add("sgb-stroke-line");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        const computedR = Math.min(borderRadius, Math.min(width, height) / 2);
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", "1");
        rect.setAttribute("y", "1");
        rect.setAttribute("width", String(Math.max(0, width - 2)));
        rect.setAttribute("height", String(Math.max(0, height - 2)));
        rect.setAttribute("rx", String(computedR));
        rect.setAttribute("ry", String(computedR));
        rect.setAttribute("pathLength", "100");
        rect.style.strokeDasharray = computeDashArray(width, height);
        svg.appendChild(rect);
        return svg;
      };

      const s1 = createStrokeSVG();
      const s2 = createStrokeSVG();
      strokeGroup.appendChild(s1);
      strokeGroup.appendChild(s2);
      button.appendChild(strokeGroup);

      const updateStrokeRects = () => {
        const btn = buttonRef.current;
        if (!btn || !strokeGroupRef.current) return;
        const box = btn.getBoundingClientRect();
        const w = box.width || btn.offsetWidth;
        const h = box.height || btn.offsetHeight;
        if (w <= 0 || h <= 0) return;

        const st = getComputedStyle(btn);
        const rawR = parseFloat(st.borderRadius);
        const r = isNaN(rawR) ? h / 2 : Math.min(rawR, Math.min(w, h) / 2);
        const dashStr = computeDashArray(w, h);

        const svgs = strokeGroupRef.current.querySelectorAll("svg");
        svgs.forEach((svg) => {
          svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
          svg.setAttribute("preserveAspectRatio", "none");
          const rect = svg.querySelector("rect");
          if (rect) {
            rect.setAttribute("x", "1");
            rect.setAttribute("y", "1");
            rect.setAttribute("width", String(Math.max(0, w - 2)));
            rect.setAttribute("height", String(Math.max(0, h - 2)));
            rect.setAttribute("rx", String(r));
            rect.setAttribute("ry", String(r));
            rect.setAttribute("pathLength", "100");
            rect.style.strokeDasharray = dashStr;
          }
        });
      };

      buildDots(dotCount);
      updateStrokeRects();

      const ro = new ResizeObserver(() => {
        updateStrokeRects();
        if (dotsSvgRef.current) buildDots(dotCount);
      });
      ro.observe(button);

      const onWindowResize = () => {
        updateStrokeRects();
      };
      window.addEventListener("resize", onWindowResize);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (isMounted) updateStrokeRects();
        }).catch(() => {});
      }

      const onEnter = () => {
        hoveringRef.current = true;
        updateStrokeRects();
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
        window.removeEventListener("resize", onWindowResize);
        button.removeEventListener("pointerenter", onEnter);
        button.removeEventListener("pointerleave", onLeave);
        button.removeEventListener("pointerdown", onDown);
        button.removeEventListener("pointerup", onUp);
        button.removeEventListener("pointercancel", onUp);
        finalTimelineRef.current?.kill();
        dotsSvgRef.current?.remove();
        strokeGroup.remove();
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
      const borderRadius = height / 2;

      dotsSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      if (strokeGroupRef.current) {
        const svgs = strokeGroupRef.current.querySelectorAll("svg");
        svgs.forEach((svg) => {
          svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
          const rect = svg.querySelector("rect");
          if (rect) {
            rect.setAttribute("x", "1");
            rect.setAttribute("y", "1");
            rect.setAttribute("width", String(Math.max(0, width - 2)));
            rect.setAttribute("height", String(Math.max(0, height - 2)));
            rect.setAttribute("rx", String(borderRadius));
            rect.setAttribute("ry", String(borderRadius));
            rect.setAttribute("pathLength", "100");
          }
        });
      }

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
          {/* 5-Radial Purple Gradient Cosmic Background Container */}
          <div className="sgb-cosmic-bg" aria-hidden="true">
            <div className="sgb-radial sgb-radial-1" />
            <div className="sgb-radial sgb-radial-2" />
            <div className="sgb-radial sgb-radial-3" />
            <div className="sgb-radial sgb-radial-4" />
            <div className="sgb-radial sgb-radial-5" />
          </div>

          <span>
            {typeof icon === "object" && icon !== null ? icon : null}
            {children}
          </span>
        </button>

        {/* SVG Blur Filter Definition for the Gradient Background */}
        <svg
          width="0"
          height="0"
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
          aria-hidden="true"
        >
          <defs>
            <filter id="sgb-cosmic-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

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
            background: transparent;
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

          /* 5-Radial Purple Gradient Cosmic Background with SVG Blur Filter */
          .sgb-cosmic-bg {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
            background-color: #3b0764;
            filter: url(#sgb-cosmic-blur);
            transition: filter 0.4s ease, opacity 0.4s ease;
          }

          .sgb-radial {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            mix-blend-mode: screen;
            transition: transform 0.6s ease-out, opacity 0.4s ease;
          }

          /* 5 Distinct Radial Gradient Purple Blobs */
          .sgb-radial-1 {
            top: -30%;
            left: -10%;
            width: 70%;
            height: 110%;
            background: radial-gradient(circle, rgba(97, 11, 110, 0.78) 0%, rgba(216, 180, 254, 0) 70%);
            animation: sgb-drift-1 4s ease-in-out infinite alternate;
          }

          .sgb-radial-2 {
            top: -25%;
            right: -10%;
            width: 75%;
            height: 110%;
            background: radial-gradient(circle, rgba(85, 10, 156, 0.79) 0%, rgba(126, 34, 206, 0) 70%);
            animation: sgb-drift-2 5s ease-in-out infinite alternate;
          }

          .sgb-radial-3 {
            bottom: -35%;
            left: 20%;
            width: 80%;
            height: 120%;
            background: radial-gradient(circle, rgba(51, 12, 117, 0.57) 0%, rgba(76, 29, 149, 0) 75%);
            animation: sgb-drift-3 1s ease-in-out infinite alternate;
          }

          .sgb-radial-4 {
            bottom: -25%;
            left: -15%;
            width: 60%;
            height: 100%;
            background: radial-gradient(circle, rgba(78, 12, 128, 0.48) 0%, rgba(236, 72, 153, 0) 70%);
            animation: sgb-drift-4 2.5s ease-in-out infinite alternate;
          }

          .sgb-radial-5 {
            bottom: -25%;
            right: -15%;
            width: 65%;
            height: 105%;
            background: radial-gradient(circle, rgba(67, 6, 85, 0.4) 0%, rgba(147, 51, 234, 0) 70%);
            animation: sgb-drift-5 2.5s ease-in-out infinite alternate;
          }

          @keyframes sgb-drift-1 {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(12px, 8px) scale(1.15); }
          }

          @keyframes sgb-drift-2 {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(-10px, 10px) scale(1.12); }
          }

          @keyframes sgb-drift-3 {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(6px, -12px) scale(1.18); }
          }

          @keyframes sgb-drift-4 {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(14px, -6px) scale(1.1); }
          }

          @keyframes sgb-drift-5 {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(-8px, -10px) scale(1.14); }
          }

          .sgb-generate-button:hover .sgb-cosmic-bg,
          .sgb-generate-button.sgb-is-forced .sgb-cosmic-bg {
            filter: url(#sgb-cosmic-blur) brightness(1.25);
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

          .sgb-generate-button .sgb-stroke {
            mix-blend-mode: hard-light;
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
          }
          .sgb-generate-button .sgb-stroke svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            fill: none;
            stroke-width: 1px;
            stroke: #ffffff;
            stroke-dasharray: 38 62;
            stroke-dashoffset: 0;
            stroke-linecap: round;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .sgb-generate-button .sgb-stroke svg:nth-child(2) {
            stroke-width: 1px;
            stroke-opacity: 0.45;
            filter: blur(3.5px);
          }

          .sgb-generate-button:hover,
          .sgb-generate-button.sgb-is-forced {
          }
          .sgb-generate-button:hover .sgb-stroke svg,
          .sgb-generate-button.sgb-is-forced .sgb-stroke svg {
            animation: sgb-stroke 4.2s linear infinite !important;
            opacity: 1 !important;
          }

          /* Tactile Push-Down & Moving Outline Animation on Click */
          .sgb-generate-button:active,
          .sgb-generate-button:hover:active,
          .sgb-generate-button.sgb-is-forced:active,
          .sgb-generate-button.sgb-is-clicked {
            --sgb-translate-y: 3px;
            transition: transform 0.08s ease, box-shadow 0.08s ease;
          }

          .sgb-generate-button:active .sgb-stroke svg,
          .sgb-generate-button.sgb-is-clicked .sgb-stroke svg {
            animation: sgb-stroke-click 0.5s linear infinite !important;
            stroke: #ffffff82 !important;
            stroke-width: 1px !important;
            opacity: 1 !important;
          }

          @keyframes sgb-stroke {
            0% {
              stroke-dashoffset: 100;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }

          @keyframes sgb-stroke-click {
            0% {
              stroke-dashoffset: 100;
            }
            100% {
              stroke-dashoffset: -100;
            }
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
