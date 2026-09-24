/* eslint-disable react-doctor/nextjs-no-client-fetch-for-server-data */
/* eslint-disable react-doctor/no-giant-component */
"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useHeroParallax } from "@/lib/useHeroParallax";
import HeroParallaxCustomizer from "@/components/HeroParallaxCustomizer";
import HeroUpNextBanner from "@/components/HeroUpNextBanner";
const emptySubscribe = () => () => {};

// Safe SSR-compatible desktop media query using useSyncExternalStore
const mqSubscribe = (cb: () => void) => {
  const mq =
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)")
      : null;
  mq?.addEventListener("change", cb);
  return () => mq?.removeEventListener("change", cb);
};
const mqSnapshot = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 1024px)").matches;
const mqServerSnapshot = () => false; // Server always returns false (no video on SSR)
import type { ReactNode, ComponentType } from "react";
import Image from "next/image";
import {
  VideoSnapshotContext,
  type VideoSnapshotContextValue,
} from "@/context/VideoSnapshotContext";

const ALBUM_VIDEOS: Record<string, string> = {
  "be-here": "/movie/be-here-clip.mp4",
  "01-be-here": "/movie/be-here-clip.mp4",
  "color-in-motion": "/movie/color-in-motion-clip.mp4",
  "07-color-in-motion": "/movie/color-in-motion-clip.mp4",
  luminous: "/movie/luminous-clip.mp4",
  "09-luminous": "/movie/luminous-clip.mp4",
};

const DEFAULT_VIDEO = "/movie/be-here-clip.mp4";

// Unique video URLs to prefetch in the background for instant album switching
const PREFETCH_URLS = [...new Set(Object.values(ALBUM_VIDEOS))];
const SNAPSHOT_INTERVAL_MS = 30_000; // 30 seconds
const MAX_SNAPSHOTS = 2;

const TINT_PRESETS = [
  { name: "Deep Charcoal", color: "#0d0914" },
  { name: "Electric Crimson", color: "#FF0A3D" },
  { name: "Electric Purple", color: "#851def" },
  { name: "Vibrant Blue", color: "#3b82f6" },
  { name: "Neon Amber", color: "#9333ea" },
  { name: "Emerald Green", color: "#10b981" },
];

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

const GRADIENT_PRESETS = [
  {
    name: "My Custom Choice",
    height: 46,
    opacity: 0.95,
    midstop: 37,
    color: "#000000",
  },
  {
    name: "Cinematic Dark",
    height: 75,
    opacity: 0.95,
    midstop: 35,
    color: "#000000",
  },
  {
    name: "Smooth Fade",
    height: 60,
    opacity: 0.85,
    midstop: 25,
    color: "#000000",
  },
  {
    name: "Deep Violet Shadow",
    height: 70,
    opacity: 0.95,
    midstop: 30,
    color: "#090314",
  },
];

// eslint-disable-next-line react-doctor/no-high-complexity-react-function
export default function HeroVideoPlayer({
  children,
  sanityContent,
}: {
  children?: ReactNode;
  sanityContent?: any;
}) {
  const [videoSrc, setVideoSrc] = useState(DEFAULT_VIDEO);
  const [isVideoFading, setIsVideoFading] = useState(false);
  const [videoReady, setVideoReady] = useState(true);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const [snapshots, setSnapshots] = useState<string[]>([]);

  // SSR-safe desktop detection — server always returns false, client reads matchMedia
  const isDesktop = useSyncExternalStore(
    mqSubscribe,
    mqSnapshot,
    mqServerSnapshot,
  );
  const activeMediaRef = isDesktop ? videoRef : mobileVideoRef;

  const isYouTube = !videoSrc.includes(".mp4");

  // ── Prefetch all album videos after first interaction for instant switching ──
  useEffect(() => {
    if (!isDesktop) return;
    let done = false;
    const prefetch = () => {
      if (done) return;
      done = true;
      PREFETCH_URLS.forEach((url) => {
        if (url === DEFAULT_VIDEO) return; // already loading
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "video";
        link.href = url;
        document.head.appendChild(link);
      });
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("scroll", prefetch);
      window.removeEventListener("pointerdown", prefetch);
      window.removeEventListener("touchstart", prefetch);
    };
    window.addEventListener("scroll", prefetch, { passive: true, once: true });
    window.addEventListener("pointerdown", prefetch, {
      passive: true,
      once: true,
    });
    window.addEventListener("touchstart", prefetch, {
      passive: true,
      once: true,
    });
    // Fallback: prefetch after 4 seconds if no interaction
    const t = setTimeout(prefetch, 4000);
    return () => {
      clearTimeout(t);
      cleanup();
    };
  }, [isDesktop]);

  const ytId = isYouTube ? videoSrc.replace(/^.*[=/]/, "") : "";

  // ── Tint Customizer states ──────────────────────────────────────────────────
  const [tintColor, setTintColor] = useState("#0d0914");
  const [tintOpacity, setTintOpacity] = useState(0.52);
  const [mixBlendMode, setMixBlendMode] = useState<
    "normal" | "multiply" | "screen" | "overlay" | "color" | "darken"
  >("normal");
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    const handleSongPlaying = (e: Event) => {
      const customEvt = e as CustomEvent<boolean>;
      setIsMusicPlaying(Boolean(customEvt.detail));
    };
    window.addEventListener("cursor:song-playing", handleSongPlaying);
    return () =>
      window.removeEventListener("cursor:song-playing", handleSongPlaying);
  }, []);

  // ── Bottom-Up & Video Mask Customizer states ───────────────────────────────
  const [videoMaskStart, setVideoMaskStart] = useState(60); // % depth where video mask fade begins
  const [gradHeight, setGradHeight] = useState(40); // %
  const [gradOpacity, setGradOpacity] = useState(0.85); // 0..1
  const [gradMidstop, setGradMidstop] = useState(25); // %
  const [gradColor, setGradColor] = useState("#000000");
  const [videoScreenY, setVideoScreenY] = useState(20); // % objectPosition Y (lower % shifts people DOWN)
  const [isGradUiOpen, setIsGradUiOpen] = useState(false);
  const [gradCopied, setGradCopied] = useState(false);

  // Parallax now lives in the shared useHeroParallax() hook (see below) so
  // tuning it here also tunes every other hero on the site that uses the
  // same hook. Only the target refs stay local — see `videoRef` above and
  // `foregroundRef` below.
  const foregroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedColor = localStorage.getItem("7h_tint_color");
    const savedOpacity = localStorage.getItem("7h_tint_opacity");
    const savedBlend = localStorage.getItem("7h_tint_blend");

    if (savedColor) setTintColor(savedColor);
    if (savedOpacity) setTintOpacity(parseFloat(savedOpacity));
    if (savedBlend) setMixBlendMode(savedBlend as any);

    // Load gradient & video position settings
    const savedMaskStart = localStorage.getItem("7h_hero_video_mask_start");
    const savedGradH = localStorage.getItem("7h_hero_grad_height");
    const savedGradO = localStorage.getItem("7h_hero_grad_opacity");
    const savedGradM = localStorage.getItem("7h_hero_grad_midstop");
    const savedGradC = localStorage.getItem("7h_hero_grad_color");
    const savedScreenY = localStorage.getItem("7h_hero_video_screen_y");

    if (savedMaskStart) setVideoMaskStart(parseFloat(savedMaskStart));
    if (savedGradH) setGradHeight(parseFloat(savedGradH));
    if (savedGradO) setGradOpacity(parseFloat(savedGradO));
    if (savedGradM) setGradMidstop(parseFloat(savedGradM));
    if (savedGradC) setGradColor(savedGradC);
    if (savedScreenY) setVideoScreenY(parseFloat(savedScreenY));
  }, []);

  const updateVideoMaskStart = (val: number) => {
    setVideoMaskStart(val);
    localStorage.setItem("7h_hero_video_mask_start", val.toString());
  };
  const updateGradHeight = (h: number) => {
    setGradHeight(h);
    localStorage.setItem("7h_hero_grad_height", h.toString());
  };
  const updateGradOpacity = (o: number) => {
    setGradOpacity(o);
    localStorage.setItem("7h_hero_grad_opacity", o.toString());
  };
  const updateGradMidstop = (m: number) => {
    setGradMidstop(m);
    localStorage.setItem("7h_hero_grad_midstop", m.toString());
  };
  const updateGradColor = (c: string) => {
    setGradColor(c);
    localStorage.setItem("7h_hero_grad_color", c);
  };
  const updateVideoScreenY = (y: number) => {
    setVideoScreenY(y);
    localStorage.setItem("7h_hero_video_screen_y", y.toString());
  };

  const copyGradCSS = () => {
    const cssText = `background: linear-gradient(to top, ${gradColor} 0%, ${hexToRgba(gradColor, gradOpacity * 0.75)} ${gradMidstop}%, transparent 100%);\nheight: ${gradHeight}%;`;
    navigator.clipboard.writeText(cssText);
    setGradCopied(true);
  };

  const [VinylComp, setVinylComp] = useState<ComponentType<any> | null>(null);
  const [YTComp, setYTComp] = useState<ComponentType<any> | null>(null);

  useEffect(() => {
    let loaded = false;
    const loadWidgets = () => {
      if (loaded) return;
      loaded = true;
      import("@/components/VinylHeroPlayer").then((mod) =>
        setVinylComp(() => mod.default),
      );
      import("@/components/HeroYTBackground").then((mod) =>
        setYTComp(() => mod.default),
      );
    };

    const cleanup = () => {
      window.removeEventListener("scroll", loadWidgets);
      window.removeEventListener("pointerdown", loadWidgets);
      window.removeEventListener("touchstart", loadWidgets);
      window.removeEventListener("mousemove", loadWidgets);
    };

    // Load immediately on desktop viewports so hero vinyl renders at 0ms
    const isDesktop =
      typeof window !== "undefined"
        ? window.matchMedia("(min-width: 768px)").matches
        : true;
    if (isDesktop) {
      loadWidgets();
    } else {
      window.addEventListener("scroll", loadWidgets, { passive: true });
      window.addEventListener("pointerdown", loadWidgets, { passive: true });
      window.addEventListener("touchstart", loadWidgets, { passive: true });
      window.addEventListener("mousemove", loadWidgets, { passive: true });
    }

    const t = setTimeout(loadWidgets, isDesktop ? 0 : 2500);

    return () => {
      cleanup();
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!gradCopied) return;
    const t = setTimeout(() => setGradCopied(false), 2000);
    return () => clearTimeout(t);
  }, [gradCopied]);

  const updateColor = (color: string) => {
    setTintColor(color);
    localStorage.setItem("7h_tint_color", color);
  };

  const updateOpacity = (opacity: number) => {
    setTintOpacity(opacity);
    localStorage.setItem("7h_tint_opacity", opacity.toString());
  };

  const updateBlend = (blend: typeof mixBlendMode) => {
    setMixBlendMode(blend);
    localStorage.setItem("7h_tint_blend", blend);
  };

  const copyCSS = () => {
    const cssText = `background-color: ${tintColor}; opacity: ${tintOpacity}; mix-blend-mode: ${mixBlendMode};`;
    navigator.clipboard.writeText(cssText);
    setCopied(true);
  };

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  // ── Canvas capture ──────────────────────────────────────────────────────────
  const captureFrame = useCallback(() => {
    if (typeof window === "undefined" || document.hidden) return;
    // Skip continuous frame capture on mobile screens to save memory and main thread CPU
    if (window.innerWidth < 768) return;

    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return;

    try {
      const canvas = document.createElement("canvas");
      // Capture at quarter-resolution for fast execution
      canvas.width = Math.round(video.videoWidth / 4);
      canvas.height = Math.round(video.videoHeight / 4);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.5);

      setSnapshots((prev) => [dataUrl, ...prev].slice(0, MAX_SNAPSHOTS));
    } catch {
      // Cross-origin or security errors — silently ignore
    }
  }, []);

  // Capture 3s after initial paint + every 30 s thereafter
  useEffect(() => {
    let active = true;

    const initialTimer = setTimeout(() => {
      if (active) captureFrame();
    }, 3000);

    const intervalId = setInterval(() => {
      if (active) captureFrame();
    }, SNAPSHOT_INTERVAL_MS);

    return () => {
      active = false;
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, [captureFrame, videoSrc]); // re-run when source changes

  // ── Album → video sync with smooth fade crossfade transition ────────────────
  const handleAlbumChange = useCallback(
    (albumId: string) => {
      const next = ALBUM_VIDEOS[albumId] ?? DEFAULT_VIDEO;
      if (next === videoSrc) return;

      // 1. Smoothly fade out current video
      setIsVideoFading(true);

      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => {
        // 2. Swap video source while hidden
        setVideoSrc(next);
      }, 280);
    },
    [videoSrc],
  );

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleCustomAlbumChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ albumId?: string }>;
      const albumId = customEvt.detail?.albumId;
      if (albumId) {
        handleAlbumChange(albumId);
      }
    };
    window.addEventListener("7h-album-change", handleCustomAlbumChange);
    return () =>
      window.removeEventListener("7h-album-change", handleCustomAlbumChange);
  }, [handleAlbumChange]);

  useEffect(() => {
    const video = activeMediaRef.current;
    if (video && !isYouTube) {
      const handlePlayStart = () => {
        setIsVideoFading(false);
        setVideoReady(true);
        if (typeof window !== "undefined") {
          (window as any).__7hHeroVideoReady = true;
          window.dispatchEvent(new CustomEvent("7h-hero-video-ready"));
        }
      };
      video.addEventListener("canplay", handlePlayStart, { once: true });
      video.addEventListener("playing", handlePlayStart, { once: true });

      if (video.readyState >= 3) {
        handlePlayStart();
      }

      const triggerPlay = () => {
        const target = activeMediaRef.current;
        if (target) {
          target
            .play()
            .then(() => {
              handlePlayStart();
            })
            .catch(() => {
              setIsVideoFading(false);
              setVideoReady(true);
              if (typeof window !== "undefined") {
                (window as any).__7hHeroVideoReady = true;
                window.dispatchEvent(new CustomEvent("7h-hero-video-ready"));
              }
            });
        }
      };

      triggerPlay();

      window.addEventListener("preloader-wiping", triggerPlay);
      window.addEventListener("preloader-complete", triggerPlay);
      window.addEventListener("7h-preloader-done", triggerPlay);

      return () => {
        video.removeEventListener("canplay", handlePlayStart);
        video.removeEventListener("playing", handlePlayStart);
        window.removeEventListener("preloader-wiping", triggerPlay);
        window.removeEventListener("preloader-complete", triggerPlay);
        window.removeEventListener("7h-preloader-done", triggerPlay);
      };
    }
  }, [videoSrc, isYouTube, isDesktop, activeMediaRef]);

  // ── Pause video when out of viewport to optimize GPU/CPU performance ─────────
  useEffect(() => {
    const video = activeMediaRef.current;
    if (!video || isYouTube) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0 },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [isYouTube, videoSrc, activeMediaRef]);

  // ── Parallax: background video drifts slower than the page as you scroll ────
  const parallax = useHeroParallax({
    mediaRef: activeMediaRef,
    foregroundRef,
    triggerSelector: "#hero",
    enabled: !isYouTube,
    remountKey: `${videoSrc}-${isDesktop ? "dt" : "mb"}`,
  });

  const ctxValue: VideoSnapshotContextValue = useMemo(
    () => ({ snapshots }),
    [snapshots],
  );

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video && video.currentTime < 15) {
      try {
        video.currentTime = 15;
      } catch (_) {}
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    const video = videoRef.current;
    if (video && video.currentTime < 15) {
      try {
        video.currentTime = 15;
      } catch (_) {}
    }
    captureFrame();
  }, [captureFrame]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const START_TIME = 15;
    const MAX_DURATION = 8; // Exactly 8 seconds long loop
    if (
      video.currentTime >= START_TIME + MAX_DURATION ||
      video.currentTime < START_TIME
    ) {
      try {
        video.currentTime = START_TIME;
      } catch (_) {}
    }
  }, []);

  const handleHeroClick = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (video.currentTime < 15) {
        video.currentTime = 15;
      }
      video.muted = true;
      video.play().catch(() => {});
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("7h-play-hero-music"));
    }
  }, []);

  return (
    <VideoSnapshotContext.Provider value={ctxValue}>
      <div className="relative flex h-full w-full flex-col justify-between">
        {/* On mobile (<768px), load ultra-compressed 433KB fast-start video loop (well within <1.5MB guidelines) */}
        {!isDesktop ? (
          <div
            className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(black 0%, black 75%, transparent 94%)",
              maskImage:
                "linear-gradient(black 0%, black 75%, transparent 94%)",
            }}
          >
            <video
              ref={mobileVideoRef}
              src="/movie/hero-mobile.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className={`absolute inset-0 z-10 h-full w-full scale-[1.38] object-cover transition-all duration-[250ms] ease-out ${!videoReady || isVideoFading ? "translate-y-[30px] opacity-0" : "translate-y-0 opacity-90"}`}
              style={{
                objectPosition: `center ${videoScreenY}%`,
              }}
            />
          </div>
        ) : isYouTube && YTComp ? (
          <div
            className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 45%, transparent 97%)",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 45%, transparent 97%)",
            }}
          >
            <YTComp videoId={ytId || "UQBvl_wZ0ak"} start={20} end={29} />
          </div>
        ) : (
          <div
            className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 65%, transparent 97%)",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 65%, transparent 97%)",
            }}
          >
            <video
              key={videoSrc}
              ref={videoRef}
              onCanPlay={handleCanPlay}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlaying={() => {
                setVideoReady(true);
                if (typeof window !== "undefined") {
                  (window as any).__7hHeroVideoReady = true;
                  window.dispatchEvent(new CustomEvent("7h-hero-video-ready"));
                }
              }}
              preload="auto"
              autoPlay
              muted
              loop
              playsInline
              className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-cover transition-all duration-[250ms] ease-out ${!videoReady || isVideoFading ? "translate-y-[30px] scale-[1.50] opacity-0 blur-sm filter" : "blur-0 translate-y-0 scale-[1.43] opacity-100 filter"}`}
              style={{
                objectPosition: `center ${videoScreenY}%`,
              }}
            >
              <source src={videoSrc} type="video/mp4" />
              <track kind="captions" />
            </video>
          </div>
        )}
        <div
          role="button"
          tabIndex={0}
          aria-label="Play video audio and music player"
          className="absolute inset-0 z-[1] h-full min-h-[48px] w-full min-w-[48px] cursor-pointer transition-all duration-700 ease-in-out"
          onClick={handleHeroClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleHeroClick();
            }
          }}
          title="Click to play video audio & music player"
          style={{
            opacity: isMusicPlaying
              ? Math.min(tintOpacity * 0.35, 0.18)
              : tintOpacity,
            mixBlendMode: mixBlendMode,
          }}
        />

        {/* ── Tint Customizer Floating Panel (Dev/Tester Only) ── */}
        {mounted && localStorage.getItem("7h_tint_tester") === "true" && (
          <div className="absolute top-[104px] right-6 z-40 flex flex-col items-end md:right-8">
            {!isCustomizerOpen ? (
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-black/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-[45px] transition-colors hover:bg-black/85 active:scale-95"
                title="Open Video Tint Customizer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group- transition-colors duration-300 group-hover:rotate-45"
                >
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              </button>
            ) : (
              <div className="flex w-[280px] animate-[scaleIn_0.2s_ease-out] flex-col gap-4 border border-white/10 bg-black/75 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl select-none">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex flex-col">
                    <span className="font-[family-name:var(--font-rockstar)] text-[var(--color-accent)] text-[var(--font-size-2xs)]">
                      Video Tint Tester
                    </span>
                    <span className="text-white/40">
                      Customize background tint
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCustomizerOpen(false)}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                {/* Presets */}
                <div className="space-y-1.5">
                  <span className="/45 block">Presets</span>
                  <div className="flex flex-wrap gap-2">
                    {TINT_PRESETS.map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => updateColor(preset.color)}
                        className={`relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border transition-colors hover:scale-115`}
                        style={{
                          backgroundColor: preset.color,
                          borderColor:
                            tintColor === preset.color
                              ? "#9333ea"
                              : "rgba(255,255,255,0.2)",
                        }}
                        title={preset.name}
                      >
                        {tintColor === preset.color && (
                          <div className="shadow-[0_0_4px_rgba(147, 51, 234,0.8)] h-1.5 w-1.5 rounded-lg bg-purple-600" />
                        )}
                      </button>
                    ))}
                    {/* Custom Color Selector */}
                    <div
                      className="relative flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[var(--color-accent)]/80 transition-transform hover:scale-115"
                      title="Custom Color"
                    >
                      <input
                        type="color"
                        value={tintColor}
                        onChange={(e) => updateColor(e.target.value)}
                        className="absolute -inset-1 h-[200%] w-[200%] cursor-pointer border-none p-0 opacity-0"
                      />
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1.5">
                  <div className="/45 r flex justify-between">
                    <span>Opacity</span>
                    <span className="text-[var(--color-accent)]">
                      {Math.round(tintOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={tintOpacity}
                    onChange={(e) => updateOpacity(parseFloat(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-amber-500"
                  />
                </div>

                {/* Blend Modes */}
                <div className="space-y-1.5">
                  <span className="/45 block">Mix Blend Mode</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        "normal",
                        "multiply",
                        "overlay",
                        "screen",
                        "color",
                        "darken",
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateBlend(mode)}
                        className={`cursor-pointer rounded border px-1 py-1 transition-colors ${mixBlendMode === mode ? "border-[var(--color-border-purple)] bg-[var(--color-purple-primary)] text-[var(--color-text-main)] shadow-[0_0_8px_var(--color-purple-glow)]" : "border-white/10 bg-[#00000029] hover:border-white/10 hover:bg-white/10"}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Values HUD */}
                <div className="space-y-0.5 rounded-lg border border-white/10 bg-white/[0.02] p-2 text-white/40">
                  <div>
                    Color: <span>{tintColor}</span>
                  </div>
                  <div>
                    Opacity: <span>{tintOpacity}</span>
                  </div>
                  <div>
                    Blend: <span>{mixBlendMode}</span>
                  </div>
                </div>

                {/* Copy CSS Button */}
                <button
                  onClick={copyCSS}
                  className="shadow-[0_4px_12px_rgba(147, 51, 234,0.2)] flex w-full cursor-pointer items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 py-2 text-[var(--font-size-2xs)] transition-colors hover:from-amber-600 hover:to-orange-700 active:scale-97"
                >
                  {copied ? (
                    <>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-[scaleIn_0.15s_ease-out]"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy CSS Snippet
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Shared across every hero on the site — see src/lib/useHeroParallax.ts.
         * Positioned lower than the tint panel above so the two don't overlap. */}
        <HeroParallaxCustomizer
          {...parallax}
          positionClassName="top-[160px] right-6 md:right-8"
        />

        {/* ── Hero Foreground Content & Text Overlay (Parallaxes UP on scroll) ── */}
        <div
          ref={foregroundRef}
          className="site-container pointer-events-none relative z-[10] flex h-full w-full flex-col justify-end pb-20"
        >
          {/* Two-column layout on Desktop (lg+), stacked on Tablet & Mobile */}
          <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            {/* Left Column: Hero Title & Subheading Content */}
            <div className="pointer-events-auto flex max-w-[750px] flex-1 flex-col gap-3 lg:max-w-[50%]">
              {/* Hero Main Headline */}
              <h1>{sanityContent?.heroHeading || "7TH HEAVEN"}</h1>

              {/* Hero Subheading */}
              <p className="/90 text-sm leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] sm:text-base md:text-lg lg:text-xl">
                {sanityContent?.heroSubheading ||
                  "Billboard #1 Chart-Topping Hits, High-Energy Festival Anthems & 40 Years of Unforgettable Live Performance."}
              </p>
            </div>

            {/* Right Column: UP NEXT Show Banner (Smaller & Compact) */}
            <div className="pointer-events-auto w-full shrink-0 lg:w-auto lg:max-w-[550px]">
              <HeroUpNextBanner />
            </div>
          </div>

          {children && (
            <div className="pointer-events-auto mt-4 flex w-full flex-col items-end gap-6 md:flex-row">
              <div className="relative z-30 flex justify-start">{children}</div>
            </div>
          )}
        </div>
      </div>
    </VideoSnapshotContext.Provider>
  );
}
