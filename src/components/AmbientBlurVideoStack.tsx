"use client";

import React, { useEffect, useRef } from "react";
import { useVideoBlurCrossfade } from "@/hooks/useVideoBlurCrossfade";

export interface AmbientBlurVideoStackProps {
  readonly src: string;
  readonly variant: "delta" | "tuned";
  readonly activeVideoRef?: React.RefObject<HTMLVideoElement | null>;
  readonly onSourceError?: (failedSrc: string) => void;
  readonly onActivePlaying?: () => void;
  /** Replays only the first this-many seconds of each video instead of the whole file */
  readonly loopSeconds?: number;
}

/**
 * Group-composited dual-buffer ambient blurred `<video>` stack:
 * - Wraps outgoing + incoming `<video>` elements inside a single isolated opacity group
 *   so total backdrop luminance remains constant (zero dark dip, zero fallback photo flash,
 *   and zero brightness pop when the outgoing `<video>` unmounts).
 * - Smoothly swells optical blur during video switches so concert colors melt seamlessly.
 */
export function AmbientBlurVideoStack({
  src,
  variant,
  activeVideoRef,
  onSourceError,
  onActivePlaying,
  loopSeconds,
}: AmbientBlurVideoStackProps) {
  const {
    layers,
    notifyLayerReady,
    promoteIncomingLayer,
    dropFailedIncoming,
  } = useVideoBlurCrossfade(src, { fallbackDurationMs: 1300 });

  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loopSeconds) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      stageRef.current?.querySelectorAll("video").forEach((video) => {
        if (video.currentTime >= loopSeconds) video.currentTime = 0;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loopSeconds]);

  if (!src || layers.length === 0) return null;

  const stageClass =
    variant === "delta"
      ? "backdrop-video-stage-delta"
      : "backdrop-video-stage-tuned";

  const layerVariantClass =
    variant === "delta"
      ? "backdrop-video-crossfade-delta"
      : "backdrop-video-crossfade-tuned";

  return (
    <div ref={stageRef} className={`pointer-events-none absolute inset-0 isolate overflow-hidden ${stageClass}`}>
      {layers.map((layer) => {
        const isIncoming =
          layer.phase === "entering" || layer.phase === "active";

        return (
          <video
            key={layer.id}
            ref={(el) => {
              if (layer.isTarget && activeVideoRef) {
                activeVideoRef.current = el;
              }
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                if (el.paused) {
                  el.play().catch(() => {});
                }
                if (isIncoming && el.readyState >= 2) {
                  notifyLayerReady(layer.id);
                }
              }
            }}
            src={layer.src}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            data-state={layer.phase}
            data-loop-seconds={loopSeconds}
            onLoadedData={() => {
              if (isIncoming) notifyLayerReady(layer.id);
            }}
            onCanPlay={(e) => {
              if (e.currentTarget.paused) {
                e.currentTarget.play().catch(() => {});
              }
              if (isIncoming) notifyLayerReady(layer.id);
            }}
            onPlaying={() => {
              if (isIncoming) notifyLayerReady(layer.id);
              if (layer.isTarget) {
                onActivePlaying?.();
              }
            }}
            onTransitionEnd={(e) => {
              if (
                isIncoming &&
                e.target === e.currentTarget &&
                e.propertyName === "opacity"
              ) {
                promoteIncomingLayer(layer.id);
              }
            }}
            onError={() => {
              if (isIncoming) {
                dropFailedIncoming(layer.id);
              }
              onSourceError?.(layer.src);
            }}
            className={`absolute inset-0 size-full object-cover ${layerVariantClass}`}
          />
        );
      })}
    </div>
  );
}

