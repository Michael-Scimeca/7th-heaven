"use client";

import { useEffect, useState, useRef } from "react";

export default function CursorFollower() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Detect touch device to hide follower
    const checkTouch = () => {
      const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsTouch(touch);
    };
    checkTouch();

    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Set initial trail position immediately to the mouse position on first movement
      if (!isVisible) {
        trailRef.current = { x: e.clientX, y: e.clientY };
      }
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isClickable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".cursor-pointer") ||
        target.classList.contains("cursor-pointer");

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `scale(${isClickable ? 1.8 : 1})`;
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Smooth spring animation for the trailing circle
    let animId: number;
    const updateTrail = () => {
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;

      // Interpolation factor (0.15 for smooth lag effect)
      trailRef.current.x += (targetX - trailRef.current.x) * 0.15;
      trailRef.current.y += (targetY - trailRef.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${trailRef.current.x}px, ${trailRef.current.y}px, 0) translate3d(-50%, -50%, 0)`;
      }
      animId = requestAnimationFrame(updateTrail);
    };
    animId = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [isTouch, isVisible]);

  if (isTouch || !isVisible) return null;

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[999999] will-change-transform"
        style={{
          transform: `translate3d(${trailRef.current.x}px, ${trailRef.current.y}px, 0) translate3d(-50%, -50%, 0)`,
          opacity: 0.9,
          transition: "opacity 0.3s ease-out",
        }}
      >
        <div
          ref={cursorDotRef}
          className="w-3 h-3 bg-gradient-to-tr from-[#7c00ff] to-[#d946ef] rounded-full shadow-[0_0_12px_rgba(217,70,239,0.7)] transition-transform duration-200 ease-out"
          style={{
            transform: "scale(1)",
          }}
        />
      </div>
    </>
  );
}
