"use client";

import React, { useRef, type ButtonHTMLAttributes } from "react";

export interface SparkleGenerateButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: React.ReactNode;
  /** Number of dust particles in the loop. Defaults to 10. */
  dotCount?: number;
  /** Lock the button into its active (hover) visual state */
  active?: boolean;
  isActive?: boolean;
  icon?: React.ReactNode | boolean;
  className?: string;
}

/**
 * Pure CSS "Generate Site" button (GSAP disabled for maximum performance).
 */
export const SparkleGenerateButton = React.forwardRef<
  HTMLButtonElement,
  SparkleGenerateButtonProps
>(
  (
    {
      children = "Generate Site",
      dotCount,
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

    const forced = active || isActive;

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
          .sgb-generate-button,
          .sgb-generate-button *,
          .sgb-generate-button:focus,
          .sgb-generate-button:focus-visible,
          .sgb-generate-button span:focus,
          .sgb-generate-button span:focus-visible,
          .sgb-generate-button::-moz-focus-inner {
            outline: none !important;
            outline-style: none !important;
            box-shadow: none;
            -webkit-user-select: none;
            user-select: none;
          }

          .sgb-generate-button {
            --sgb-shadow-wide: rgba(102, 3, 231, 0.94);
            --sgb-shadow-inset: rgba(232, 11, 11, 1);
            --sgb-shadow-outline: 2px;
            --sgb-scale: 1;
            --sgb-translate-y: 0px;
            appearance: none;
            outline: none !important;
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
            transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s, box-shadow 0.3s, color 0.3s;
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
            white-space: nowrap;
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

          .sgb-generate-button:active,
          .sgb-generate-button:hover:active,
          .sgb-generate-button.sgb-is-forced:active {
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
