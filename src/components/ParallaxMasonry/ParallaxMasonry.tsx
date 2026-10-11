/**
 * # ParallaxMasonry Component
 *
 * A high-performance responsive masonry gallery with multi-speed column parallax,
 * subtle inner image drift, zero layout shift, and smooth entrance reveals.
 *
 * ## Props:
 * - `items`: Array of gallery items to display.
 *    Each item requires:
 *      - `src`: Image source URL or path (string)
 *      - `alt`: Accessible image description (string)
 *      - `width`: Intrinsic image width in pixels for zero-CLS aspect ratio (number)
 *      - `height`: Intrinsic image height in pixels for zero-CLS aspect ratio (number)
 *      - `caption?`: Optional caption displayed over gradient scrim on hover (string)
 *      - `href?`: Optional destination URL (renders accessible <a> tag with focus ring)
 * - `parallaxStrength`: Multiplier for column drift velocity (number, default: 1).
 *    Set to 0 to disable column drift while preserving responsive masonry layout.
 * - `className`: Optional Tailwind or custom classes applied to the root container.
 * - `id`: Optional HTML ID for the section or gallery wrapper.
 * - `ariaLabel`: Accessible label for the gallery section (default: "Photo Gallery").
 *
 * ## Accessibility & Performance:
 * - Automatically respects `prefers-reduced-motion: reduce` by disabling all parallax and entrance tweens.
 * - Single column layout below 640px disables column drift to prevent vertical layout instability on mobile.
 * - Only the first row of images receives Next.js `priority={true}`; remaining images are lazy-loaded.
 * - Hooks directly into the application's existing Lenis smooth scroll instance.
 */

"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMasonryColumns, type MasonryItem } from "./useMasonryColumns";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ParallaxMasonryProps {
  items: MasonryItem[];
  parallaxStrength?: number;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export function ParallaxMasonry({
  items,
  parallaxStrength = 1,
  className = "",
  id,
  ariaLabel = "Photo Gallery",
}: ParallaxMasonryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Tracks whether the component is in view to dynamically attach will-change: transform
  const [isInView, setIsInView] = useState(false);

  // Hook for greedy shortest-column distribution and debounced resize
  const { columns, columnCount } = useMasonryColumns(items);

  // Debounced ScrollTrigger refresh when images finish loading
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleImageLoad = useCallback(() => {
    if (typeof window === "undefined") return;
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);
  }, []);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Check prefers-reduced-motion: if active, bypass all parallax & entrance animations
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Ensure all cards are fully visible in static masonry layout
      cardRefs.current.forEach((el) => {
        if (el) {
          gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
        }
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Entrance animation: cards fade and rise in with a small stagger on viewport entry once
      const allCards = Array.from(cardRefs.current.values()).filter(Boolean);
      if (allCards.length > 0) {
        gsap.fromTo(
          allCards,
          { opacity: 0, y: 40, force3D: true },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            stagger: 0.05,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      // 2. Multi-speed column parallax
      // Alternate drift speed (e.g. columns 1 & 3 move up at -8, columns 2 & 4 move down at +8)
      // Turned off below 640px (columnCount === 1) as specified
      if (columnCount > 1 && parallaxStrength > 0) {
        const drift = 8 * parallaxStrength;

        columnRefs.current.forEach((colEl, colIndex) => {
          if (!colEl) return;
          const isOddCol = colIndex % 2 === 0;
          const startY = isOddCol ? drift : -drift;
          const endY = isOddCol ? -drift : drift;

          gsap.fromTo(
            colEl,
            { yPercent: startY, force3D: true },
            {
              yPercent: endY,
              force3D: true,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });
      }

      // 3. Subtle inner image parallax:
      // Image container is 115% height within overflow-hidden, shifting ±7% (±4% on single column)
      imageRefs.current.forEach((imgEl, originalIdx) => {
        const cardEl = cardRefs.current.get(originalIdx);
        if (!imgEl || !cardEl) return;

        const innerDrift = columnCount === 1 ? 4 : 7;

        gsap.fromTo(
          imgEl,
          { yPercent: -innerDrift, force3D: true },
          {
            yPercent: innerDrift,
            force3D: true,
            ease: "none",
            scrollTrigger: {
              trigger: cardEl,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      // 4. In-view detection to toggle will-change: transform only when active
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          setIsInView(self.isActive);
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [columnCount, parallaxStrength, items.length]);

  return (
    <div
      ref={containerRef}
      id={id}
      role="region"
      aria-label={ariaLabel}
      className={`w-full ${className}`.trim()}
    >
      <div className="flex gap-4 md:gap-6 items-start w-full">
        {columns.map((columnItems, colIndex) => (
          <div
            key={`col-${colIndex}-${columnCount}`}
            ref={(el) => {
              columnRefs.current[colIndex] = el;
            }}
            className={`flex-1 min-w-0 flex flex-col gap-4 md:gap-6 ${
              isInView ? "will-change-transform" : ""
            }`.trim()}
          >
            {columnItems.map(({ item, originalIndex, itemIndexInColumn }) => {
              const isPriority = itemIndexInColumn === 0;
              const hasLink = Boolean(item.href);

              const cardContent = (
                <div
                  ref={(el) => {
                    if (el) {
                      cardRefs.current.set(originalIndex, el);
                    } else {
                      cardRefs.current.delete(originalIndex);
                    }
                  }}
                  style={
                    {
                      "--card-aspect": `${item.width} / ${item.height}`,
                    } as React.CSSProperties
                  }
                  className={`group relative block w-full overflow-hidden rounded-[var(--radius-box)] bg-zinc-900 border border-white/10 aspect-[var(--card-aspect)] ${
                    hasLink
                      ? "cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-shadow duration-300 ease-out"
                      : ""
                  }`}
                >
                  {/* Inner parallax container: 115% height centered with -top-[7.5%] */}
                  <div
                    ref={(el) => {
                      if (el) {
                        imageRefs.current.set(originalIndex, el);
                      } else {
                        imageRefs.current.delete(originalIndex);
                      }
                    }}
                    className={`absolute inset-x-0 -top-[7.5%] h-[115%] w-full ${
                      isInView ? "will-change-transform" : ""
                    }`.trim()}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1439px) 33vw, 25vw"
                      priority={isPriority}
                      onLoad={handleImageLoad}
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                    />
                  </div>

                  {/* Gradient Scrim on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />

                  {/* Caption sliding up on hover */}
                  {item.caption && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-[transform,opacity] duration-300 ease-out">
                      <p className="text-sm font-medium text-white drop-shadow-sm select-none line-clamp-2">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </div>
              );

              if (item.href) {
                return (
                  <Link
                    key={`${item.src}-${originalIndex}`}
                    href={item.href}
                    className="block w-full rounded-[var(--radius-box)] transition-none focus-visible:outline-hidden"
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div key={`${item.src}-${originalIndex}`} className="w-full">
                  {cardContent}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParallaxMasonry;
