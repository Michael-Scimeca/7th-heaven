"use client";

import React from "react";
import Image from "next/image";
import type { StoriaMilestone } from "./storiaData";

function isVividSceneBackdrop(src: string | undefined): src is string {
  if (!src) return false;
  if (src.startsWith("/images/members/")) return false;
  if (src === "/images/hero/hero-desktop-poster.webp") return false;
  if (src === "/images/hero/hero-mobile-poster.webp") return false;
  return true;
}

export function getMilestoneBackdropSrc(m: StoriaMilestone): string {
  if (isVividSceneBackdrop(m.imageSrc)) {
    return m.imageSrc;
  }
  const heroPoster = m.mediaGallery?.[0]?.posterSrc;
  if (isVividSceneBackdrop(heroPoster)) {
    return heroPoster;
  }
  const wideVideoPoster = m.mediaGallery?.find(
    (t) => t.kind === "video" && isVividSceneBackdrop(t.posterSrc)
  )?.posterSrc;
  if (wideVideoPoster) {
    return wideVideoPoster;
  }
  if (isVividSceneBackdrop(m.secondaryImageSrc)) {
    return m.secondaryImageSrc;
  }
  return heroPoster || m.imageSrc;
}

/**
 * Full-bleed directional vertical-sliding era backdrop showing the active year's
 * own image / primary video placeholder. Slides UP when scrolling down to later
 * years and slides DOWN when scrolling up to earlier years, pre-rendering
 * `activeIdx ± 1` so adjacent eras are already decoded in GPU memory.
 */
export function StoriaYearBackdropStack({
  milestones,
  activeIdx,
  prevIdx = null,
  isVisible = true,
}: {
  milestones: readonly StoriaMilestone[];
  activeIdx: number;
  prevIdx?: number | null;
  isVisible?: boolean;
}) {
  const safeIdx = Math.max(0, Math.min(milestones.length - 1, activeIdx));
  const safePrevIdx =
    prevIdx !== null && prevIdx !== undefined
      ? Math.max(0, Math.min(milestones.length - 1, prevIdx))
      : null;
  const isMultiStepJump =
    safePrevIdx !== null && Math.abs(safeIdx - safePrevIdx) > 1;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-zinc-950 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {milestones.map((m, idx) => {
        const isOutgoing =
          safePrevIdx !== null && idx === safePrevIdx && idx !== safeIdx;
        if (Math.abs(idx - safeIdx) > 1 && !isOutgoing) return null;

        const isActive = idx === safeIdx;
        const pos: "above" | "active" | "below" = isActive
          ? "active"
          : idx < safeIdx
            ? "above"
            : "below";
        const jumpAttr =
          isActive && isMultiStepJump && safePrevIdx !== null
            ? safeIdx > safePrevIdx
              ? "from-below"
              : "from-above"
            : "none";
        const backdropSrc = getMilestoneBackdropSrc(m);
        const isLetterboxedFrame = backdropSrc.startsWith(
          "/images/media/video-frames/"
        );

        return (
          <div
            key={`${m.id}-backdrop`}
            data-pos={pos}
            data-outgoing={isOutgoing ? "true" : "false"}
            data-jump={jumpAttr}
            className="storia-vertical-slide storia-vertical-slide--backdrop absolute inset-x-0 -inset-y-[32dvh]"
          >
            <div className="storia-vertical-slide-media absolute inset-0">
              <Image
                src={backdropSrc}
                alt=""
                fill
                sizes="100vw"
                className={`object-cover ${
                  isLetterboxedFrame
                    ? "scale-[1.52] blur-2xl saturate-150"
                    : "scale-[1.28] blur-2xl saturate-150"
                }`}
              />
            </div>
          </div>
        );
      })}

      {/* Editorial legibility scrim keeping the blurred era colors glowing while anchoring white arc & headline contrast */}
      <div className="absolute inset-0 z-30 bg-gradient-to-r from-black/65 via-black/30 to-black/45" />
      <div className="absolute inset-0 z-30 bg-gradient-to-b from-black/50 via-black/15 to-black/65" />
    </div>
  );
}
