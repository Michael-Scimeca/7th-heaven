"use client";

import React, { useEffect, useState } from "react";
import { AmbientBlurVideoStack } from "@/components/AmbientBlurVideoStack";
import {
  BACKDROP_EVENT_KEY,
  BACKDROP_STORAGE_KEY,
  DEFAULT_BACKDROP_SETTINGS,
  applyBackdropSettingsToDOM,
  type BackdropOverlaySettings,
} from "@/components/GlobalVideoBackdrop";

const DEFAULT_ARENA_VIDEO_SRC = "/movie/loops/aint-that-just-beautiful-30s.mp4";

export function BackgroundViewRenderer({ viewId }: { viewId: string }) {
  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_ARENA_VIDEO_SRC;
    try {
      const stored = localStorage.getItem(BACKDROP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<BackdropOverlaySettings>;
        if (parsed.videoSrc) return parsed.videoSrc;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_BACKDROP_SETTINGS.videoSrc || DEFAULT_ARENA_VIDEO_SRC;
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BACKDROP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<BackdropOverlaySettings>;
        applyBackdropSettingsToDOM({ ...DEFAULT_BACKDROP_SETTINGS, ...parsed });
        if (parsed.videoSrc) setVideoSrc(parsed.videoSrc);
      } else {
        applyBackdropSettingsToDOM(DEFAULT_BACKDROP_SETTINGS);
      }
    } catch {
      applyBackdropSettingsToDOM(DEFAULT_BACKDROP_SETTINGS);
    }

    const handleBackdropSettings = (e: Event) => {
      const detail = (e as CustomEvent<BackdropOverlaySettings>).detail;
      if (detail) {
        applyBackdropSettingsToDOM(detail);
        if (detail.videoSrc) {
          setVideoSrc(detail.videoSrc);
        }
      }
    };

    const handleAlbumChange = (e: Event) => {
      const albumId = (e as CustomEvent<{ albumId?: string }>).detail?.albumId;
      const albumMap: Record<string, string> = {
        "be-here": "/movie/be-here-clip.mp4",
        "01-be-here": "/movie/be-here-clip.mp4",
        "color-in-motion": "/movie/color-in-motion-clip.mp4",
        "07-color-in-motion": "/movie/color-in-motion-clip.mp4",
        luminous: "/movie/luminous-clip.mp4",
        "09-luminous": "/movie/luminous-clip.mp4",
      };
      if (albumId && albumMap[albumId]) {
        setVideoSrc(albumMap[albumId]);
      }
    };

    window.addEventListener(BACKDROP_EVENT_KEY, handleBackdropSettings);
    window.addEventListener("7h-album-change", handleAlbumChange);
    return () => {
      window.removeEventListener(BACKDROP_EVENT_KEY, handleBackdropSettings);
      window.removeEventListener("7h-album-change", handleAlbumChange);
    };
  }, []);

  switch (viewId) {
    case "arena-concert":
      return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          {/* Fallback image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero/band-performance.webp"
            alt=""
            className="absolute inset-0 h-full w-full scale-150 object-cover opacity-65 blur-3xl saturate-150 backdrop-video-filter"
          />
          {/* Synchronized Concert Video Bleed across page & footer */}
          <AmbientBlurVideoStack src={videoSrc} variant="tuned" loopSeconds={2} />
          {/* Contrast scrim controlled by Backdrop Video Tuner */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/75 backdrop-video-overlay" />
          {/* 35mm Analog Film Noise controlled by Analog Noise Tuner */}
          <div className="pointer-events-none absolute inset-0 bg-film-noise backdrop-noise-surface" />
        </div>
      );

    case "jjettas-editorial":
      return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0b0a0f] select-none">
          {/* Upper JJettas Purple Atmosphere Glow */}
          <div className="absolute -top-[15vw] left-1/2 h-[65vw] w-[120vw] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(79,43,171,0.6)_0%,rgba(158,109,233,0.25)_40%,transparent_75%)] opacity-85 blur-3xl" />
          {/* Secondary ambient warmth */}
          <div className="absolute top-[30vh] right-[5vw] h-[45vw] w-[45vw] rounded-full bg-[radial-gradient(circle,rgba(238,172,26,0.12)_0%,transparent_65%)] opacity-60 blur-3xl" />
          <AmbientBlurVideoStack src={videoSrc} variant="tuned" loopSeconds={2} />
          {/* Vignette darkening towards bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0a0f]/40 to-[#0b0a0f] backdrop-video-overlay" />
          {/* Film Grain */}
          <div className="absolute inset-0 bg-film-noise backdrop-noise-surface" />
        </div>
      );

    case "fluid-aurora":
      return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0a0514] select-none">
          {/* Aurora Lobe 1 (Electric Violet) */}
          <div className="absolute -top-[20%] -left-[10%] h-[80vw] w-[80vw] animate-pulse rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.45)_0%,transparent_65%)] blur-3xl duration-1000" />
          {/* Aurora Lobe 2 (Royal Indigo) */}
          <div className="absolute top-[20%] -right-[15%] h-[75vw] w-[75vw] rounded-full bg-[radial-gradient(circle,rgba(67,56,202,0.4)_0%,transparent_65%)] blur-3xl" />
          {/* Aurora Lobe 3 (Sunset Amber/Magenta) */}
          <div className="absolute top-[50%] left-[10%] h-[60vw] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.25)_0%,rgba(192,38,211,0.2)_45%,transparent_70%)] blur-3xl" />
          <AmbientBlurVideoStack src={videoSrc} variant="tuned" loopSeconds={2} />
          {/* Dark scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 backdrop-video-overlay" />
          {/* Tactile Noise */}
          <div className="absolute inset-0 bg-film-noise backdrop-noise-surface" />
        </div>
      );

    case "stadium-beams":
      return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#050508] select-none">
          {/* Left Volumetric Light Cone */}
          <div className="pointer-events-none absolute top-0 left-[15%] h-[120vh] w-[40vw] origin-top -rotate-12 transform bg-[linear-gradient(180deg,rgba(245,158,11,0.45)_0%,rgba(147,51,234,0.25)_50%,transparent_100%)] opacity-30 blur-2xl" />
          {/* Right Volumetric Light Cone */}
          <div className="pointer-events-none absolute top-0 right-[15%] h-[120vh] w-[45vw] origin-top rotate-12 transform bg-[linear-gradient(180deg,rgba(168,85,247,0.5)_0%,rgba(59,130,246,0.2)_50%,transparent_100%)] opacity-30 blur-2xl" />
          {/* Ground Concert Stage Horizon Glow */}
          <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-[radial-gradient(ellipse_at_bottom,rgba(238,172,26,0.2)_0%,rgba(124,58,237,0.15)_45%,transparent_80%)] blur-3xl" />
          <AmbientBlurVideoStack src={videoSrc} variant="tuned" loopSeconds={2} />
          {/* Stadium Haze Scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90 backdrop-video-overlay" />
          {/* Film Noise */}
          <div className="absolute inset-0 bg-film-noise backdrop-noise-surface" />
        </div>
      );

    case "noir-gold":
    default:
      return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#060608] select-none">
          {/* Delicate Champagne Gold Top Horizon Light */}
          <div className="absolute -top-[10vw] left-1/2 h-[35vw] w-[85vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(238,172,26,0.14)_0%,rgba(238,172,26,0.03)_50%,transparent_75%)] opacity-90 blur-3xl" />
          <AmbientBlurVideoStack src={videoSrc} variant="tuned" loopSeconds={2} />
          {/* Subtle Deep Obsidian Floor */}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent backdrop-video-overlay" />
          {/* Subtle Fine Stardust Noise */}
          <div className="absolute inset-0 bg-film-noise backdrop-noise-surface" />
        </div>
      );
  }
}
