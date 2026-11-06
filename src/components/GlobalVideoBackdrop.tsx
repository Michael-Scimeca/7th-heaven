"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { AmbientBlurVideoStack } from "@/components/AmbientBlurVideoStack";

export interface BackdropOverlaySettings {
  enabled: boolean;
  videoSrc: string;
  posterSrc: string;
  overlayDarkness: number; // 0 to 100%
  overlayColor: string; // hex
  isGradient: boolean; // true = gradient vignette, false = solid
  gradientDirection: "to-bottom" | "radial" | "to-top";
  blurAmount: number; // 0 to 64px
  videoOpacity: number; // 10 to 100%
  videoSaturation: number; // 50 to 200%
  isTunerOpen?: boolean; // When tuner is open, temporarily suspend blur and tint
  // Analog Film Grain & Noise controls
  noiseEnabled?: boolean;
  noiseOpacity?: number; // 0 to 100%
  noiseScale?: number; // 50 to 250% (base 160px)
  noiseBlendMode?: "overlay" | "soft-light" | "screen" | "color-dodge" | "multiply";
  noiseAnimated?: boolean;
  noiseSpeed?: number; // 0.1s to 1.0s
}

export interface VideoLoopPreset {
  id: string;
  title: string;
  sourceTrack: string;
  videoSrc: string;
  timeRange: string;
  size: string;
}

export const VIDEO_LOOP_PRESETS: VideoLoopPreset[] = [
  {
    id: "aint-that-just-beautiful",
    title: "Ain't That Just Beautiful",
    sourceTrack: "Official Music Video (2025)",
    videoSrc: "/movie/loops/aint-that-just-beautiful-30s.mp4",
    timeRange: "0:30 – 0:36 (6s loop)",
    size: "2.1 MB",
  },
  {
    id: "tbwa-arena-tour",
    title: "TBWA Arena Tour",
    sourceTrack: "Full Stage Concert Special",
    videoSrc: "/movie/loops/tbwa-hakuhodo-30s.mp4",
    timeRange: "0:30 – 0:36 (6s loop)",
    size: "1.6 MB",
  },
  {
    id: "monster",
    title: "Monster",
    sourceTrack: "Heavy Rock Powerhouse (2021)",
    videoSrc: "/movie/loops/monster-30s.mp4",
    timeRange: "0:30 – 0:36 (6s loop)",
    size: "1.6 MB",
  },
  {
    id: "are-we-there-yet",
    title: "Are We There Yet",
    sourceTrack: "Cross-Country Tour Anthem (2021)",
    videoSrc: "/movie/loops/are-we-there-yet-30s.mp4",
    timeRange: "0:30 – 0:36 (6s loop)",
    size: "3.0 MB",
  },
  {
    id: "summerfest-live",
    title: "Summerfest Main Stage",
    sourceTrack: "Outdoor Festival Crowd & Lasers",
    videoSrc: "/movie/loops/summerfest-live-30s.mp4",
    timeRange: "0:04 – 0:10 (6s loop)",
    size: "801 KB",
  },
];

export const DEFAULT_BACKDROP_SETTINGS: BackdropOverlaySettings = {
  enabled: true,
  videoSrc: "/movie/loops/aint-that-just-beautiful-30s.mp4",
  posterSrc: "/images/hero/tbwa-hakuhodo-poster.jpg",
  overlayDarkness: 100,
  overlayColor: "#0b0414",
  isGradient: true,
  gradientDirection: "to-top",
  blurAmount: 64,
  videoOpacity: 24,
  videoSaturation: 106,
  noiseEnabled: true,
  noiseOpacity: 100,
  noiseScale: 100,
  noiseBlendMode: "overlay",
  noiseAnimated: false,
  noiseSpeed: 0.35,
};

export const BACKDROP_STORAGE_KEY = "7h-backdrop-overlay-settings-v11";
export const BACKDROP_EVENT_KEY = "7h-backdrop-settings-change";

export function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

export function computeOverlayBackground(settings: BackdropOverlaySettings): {
  background: string;
  backgroundColor: string;
} {
  const factor = settings.overlayDarkness / 75;
  if (!settings.isGradient) {
    const solidAlpha = Math.min(1, factor * 0.75);
    return {
      background: "none",
      backgroundColor: hexToRgba(settings.overlayColor, solidAlpha),
    };
  }

  // Exact Media Page Parity: from-black/60 via-black/35 to-black/75
  const topA = Math.min(1, factor * 0.60);
  const midA = Math.min(1, factor * 0.35);
  const botA = Math.min(1, factor * 0.75);

  if (settings.gradientDirection === "radial") {
    return {
      background: `radial-gradient(ellipse at center, ${hexToRgba(settings.overlayColor, midA)} 0%, ${hexToRgba(settings.overlayColor, botA)} 100%)`,
      backgroundColor: "transparent",
    };
  }

  if (settings.gradientDirection === "to-top") {
    return {
      background: `linear-gradient(0deg, ${hexToRgba(settings.overlayColor, botA)} 0%, ${hexToRgba(settings.overlayColor, midA)} 50%, ${hexToRgba(settings.overlayColor, topA)} 100%)`,
      backgroundColor: "transparent",
    };
  }

  // Default: to-bottom (exact match to media page: bg-gradient-to-b from-black/60 via-black/35 to-black/75)
  return {
    background: `linear-gradient(180deg, ${hexToRgba(settings.overlayColor, topA)} 0%, ${hexToRgba(settings.overlayColor, midA)} 50%, ${hexToRgba(settings.overlayColor, botA)} 100%)`,
    backgroundColor: "transparent",
  };
}

export function applyBackdropSettingsToDOM(settings: BackdropOverlaySettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const { background, backgroundColor } = computeOverlayBackground(settings);

  root.style.setProperty("--backdrop-video-blur", `${settings.blurAmount}px`);
  root.style.setProperty("--backdrop-video-opacity", `${settings.videoOpacity / 100}`);
  root.style.setProperty("--backdrop-video-saturate", `${settings.videoSaturation}%`);
  root.style.setProperty("--backdrop-video-scale", settings.blurAmount > 0 ? "1.5" : "1");
  root.style.setProperty("--backdrop-overlay-darkness", `${settings.overlayDarkness}%`);
  root.style.setProperty("--backdrop-overlay-opacity", `${settings.overlayDarkness / 100}`);
  root.style.setProperty("--backdrop-overlay-color", settings.overlayColor);
  root.style.setProperty("--backdrop-overlay-mode", settings.isGradient ? "gradient" : "solid");
  root.style.setProperty("--backdrop-overlay-direction", settings.gradientDirection);
  root.style.setProperty("--backdrop-overlay-bg", background);
  root.style.setProperty("--backdrop-overlay-solid-color", backgroundColor);

  // Analog Film Grain & Noise CSS Variables
  const noiseEnabled = settings.noiseEnabled ?? true;
  const noiseOpacity = settings.noiseOpacity ?? 40;
  const noiseBlend = settings.noiseBlendMode ?? "overlay";
  const noiseScale = settings.noiseScale ?? 100;
  const noiseAnimated = settings.noiseAnimated ?? false;
  const noiseSpeed = settings.noiseSpeed ?? 0.35;
  const calculatedPx = Math.round(160 * (noiseScale / 100));

  root.style.setProperty("--backdrop-noise-display", noiseEnabled ? "block" : "none");
  root.style.setProperty("--backdrop-noise-opacity", `${noiseEnabled ? noiseOpacity / 100 : 0}`);
  root.style.setProperty("--backdrop-noise-blend", noiseBlend);
  root.style.setProperty("--backdrop-noise-size", `${calculatedPx}px ${calculatedPx}px`);
  root.style.setProperty(
    "--backdrop-noise-animation",
    noiseAnimated ? `filmGrainJitter ${noiseSpeed}s steps(4) infinite both` : "none"
  );
  root.style.setProperty("--canvas-grain-opacity", `${noiseEnabled ? noiseOpacity / 100 : 0}`);
  root.style.setProperty("--canvas-grain-blend", noiseBlend);
}

export default function GlobalVideoBackdrop() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [settings, setSettings] = useState<BackdropOverlaySettings>(DEFAULT_BACKDROP_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BACKDROP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
        applyBackdropSettingsToDOM({ ...DEFAULT_BACKDROP_SETTINGS, ...parsed });
      } else {
        applyBackdropSettingsToDOM(DEFAULT_BACKDROP_SETTINGS);
      }
    } catch {
      applyBackdropSettingsToDOM(DEFAULT_BACKDROP_SETTINGS);
    }

    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<BackdropOverlaySettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
        applyBackdropSettingsToDOM(customEvent.detail);
      }
    };

    const handleAlbumChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ albumId?: string }>;
      const albumId = customEvt.detail?.albumId;
      const albumMap: Record<string, string> = {
        "be-here": "/movie/be-here-clip.mp4",
        "01-be-here": "/movie/be-here-clip.mp4",
        "color-in-motion": "/movie/color-in-motion-clip.mp4",
        "07-color-in-motion": "/movie/color-in-motion-clip.mp4",
        luminous: "/movie/luminous-clip.mp4",
        "09-luminous": "/movie/luminous-clip.mp4",
      };
      if (albumId && albumMap[albumId]) {
        setSettings((prev) => ({ ...prev, videoSrc: albumMap[albumId] }));
      }
    };

    const handleSanityInit = (e: Event) => {
      const customEvt = e as CustomEvent<{ videoSrc?: string; posterSrc?: string }>;
      if (customEvt.detail) {
        setSettings((prev) => ({
          ...prev,
          videoSrc: customEvt.detail.videoSrc || prev.videoSrc,
          posterSrc: customEvt.detail.posterSrc || prev.posterSrc,
        }));
      }
    };

    window.addEventListener(BACKDROP_EVENT_KEY, handleSettingsChange);
    window.addEventListener("7h-album-change", handleAlbumChange);
    window.addEventListener("7h-backdrop-init-sanity", handleSanityInit);

    return () => {
      window.removeEventListener(BACKDROP_EVENT_KEY, handleSettingsChange);
      window.removeEventListener("7h-album-change", handleAlbumChange);
      window.removeEventListener("7h-backdrop-init-sanity", handleSanityInit);
    };
  }, []);

  // Strict Exclusion: /media renders its own synchronized #media-bleed-backdrop; do not touch admin tool areas
  const isMediaPage = pathname === "/media";
  const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/crm") || pathname?.startsWith("/studio");

  if (!mounted || isMediaPage || isAdminPage || !settings.enabled) {
    return null;
  }

  const backdrop = (
    <div
      id="global-bleed-backdrop"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden bg-transparent select-none"
    >
      {/* Fallback frame matching media page setup */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={settings.posterSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-150 blur-3xl saturate-150 opacity-65 backdrop-video-filter transition-opacity duration-1000"
      />

      {/* Live synchronized dual-buffer background video crossfading smoothly across entire page & footer */}
      {settings.videoSrc && (
        <AmbientBlurVideoStack
          loopSeconds={2}
          src={settings.videoSrc}
          variant="tuned"
          onActivePlaying={() => {
            if (typeof window !== "undefined") {
              (
                window as Window & { __7hHeroVideoReady?: boolean }
              ).__7hHeroVideoReady = true;
              window.dispatchEvent(new CustomEvent("7h-hero-video-ready"));
            }
          }}
        />
      )}

      {/* Cinematic dark scrim for crisp text contrast (exact match to media page: from-black/60 via-black/35 to-black/75) */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-black/35 to-black/75 backdrop-video-overlay transition-all duration-1000"
      />

      {/* Analog Film Grain / Noise directly inside video backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-film-noise backdrop-noise-surface pointer-events-none"
      />
    </div>
  );

  return createPortal(backdrop, document.body);
}
