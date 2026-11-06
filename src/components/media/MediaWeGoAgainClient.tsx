"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  BACKDROP_EVENT_KEY,
  BACKDROP_STORAGE_KEY,
  DEFAULT_BACKDROP_SETTINGS,
  applyBackdropSettingsToDOM,
  type BackdropOverlaySettings,
} from "@/components/GlobalVideoBackdrop";
import { AmbientBlurVideoStack } from "@/components/AmbientBlurVideoStack";
import { ListVideo, ChevronDown } from "lucide-react";
import PartnershipsMediaVault from "./PartnershipsMediaVault";
import TbwaPillHero, {
  VIDEO_TRACKS,
  type TbwaPillHeroHandle,
  type VideoTrack,
} from "./TbwaPillHero";
import { HERO_ALBUM_TRACKS } from "./deltaSmooothySlides";
import { TbwaHeroLayoutSwitcherBar, type HeroLayoutId } from "./TbwaHeroOverlays";
import DeltaSmooothyMediaStrip from "./DeltaSmooothyMediaStrip";
import DeltaHistorySection, {
  type StoriaBackdropSyncState,
} from "./DeltaHistorySection";
import { STORIA_ALL_YEARS_MILESTONES } from "./storia/storiaAllYearsData";
import { StoriaYearBackdropStack } from "./storia/StoriaYearBackdropStack";

export interface MediaVaultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Official Music Videos" | "Live Concerts" | "Medley Special" | "TV & Press" | "Cruise" | "Fan Media";
  type: "band" | "fan";
  mediaFormat?: "video" | "photo";
  photoSrc?: string;
  year: number;
  duration?: string;
  badge: string;
  tagline: string;
  synopsis: string;
  credits: {
    artist?: string;
    format?: string;
    venue?: string;
    audio?: string;
    release?: string;
    fanName?: string;
    city?: string;
    instagram?: string;
  };
  videoSrc?: string;
  youtubeId?: string;
  viewCount?: string;
}

export default function MediaWeGoAgainClient() {
  const [activeHeroTrack, setActiveHeroTrack] = useState<VideoTrack>(
    HERO_ALBUM_TRACKS[0]
  );
  const [heroVariant, setHeroVariant] = useState<HeroLayoutId>(0);
  const [isFullBleed, setIsFullBleed] = useState(false);
  const [isListOpen, setIsListOpen] = useState(true);
  const [isVaultOverlapping, setIsVaultOverlapping] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isHeroMusicPlaying, setIsHeroMusicPlaying] = useState(false);
  const [modalVideoSrc, setModalVideoSrc] = useState<string | null>(null);
  const [failedBgSrc, setFailedBgSrc] = useState<string | null>(null);
  const [heroVideoEl, setHeroVideoEl] = useState<HTMLVideoElement | null>(null);
  const [storiaBackdrop, setStoriaBackdrop] = useState<StoriaBackdropSyncState>(
    {
      isActive: false,
      activeIdx: 0,
    }
  );
  const heroRef = useRef<TbwaPillHeroHandle>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  // Close list on Escape key (only when no modal <dialog> is open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isListOpen) {
        if (e.defaultPrevented || document.querySelector("dialog[open]")) return;
        setIsListOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isListOpen]);

  const rawPlayingSrc = modalVideoSrc || activeHeroTrack.src;
  const currentPlayingSrc =
    failedBgSrc && rawPlayingSrc === failedBgSrc
      ? VIDEO_TRACKS[0].src
      : rawPlayingSrc;

  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );

  // Sync background video playback & time in real-time with hero video
  useEffect(() => {
    if (modalVideoSrc || currentPlayingSrc !== activeHeroTrack.src) return;
    const heroVideo = heroVideoEl;
    const bgVideo = bgVideoRef.current;
    if (!heroVideo || !bgVideo) return;

    const syncTime = () => {
      if (Math.abs(bgVideo.currentTime - heroVideo.currentTime) > 0.3) {
        bgVideo.currentTime = heroVideo.currentTime;
      }
    };
    const syncPlay = () => {
      bgVideo.play().catch(() => {});
    };
    const syncPause = () => {
      bgVideo.pause();
    };
    const syncRate = () => {
      bgVideo.playbackRate = heroVideo.playbackRate;
    };

    heroVideo.addEventListener("timeupdate", syncTime);
    heroVideo.addEventListener("seeking", syncTime);
    heroVideo.addEventListener("play", syncPlay);
    heroVideo.addEventListener("pause", syncPause);
    heroVideo.addEventListener("ratechange", syncRate);

    // Initial state sync
    syncTime();
    if (!heroVideo.paused && bgVideo.paused) {
      bgVideo.play().catch(() => {});
    } else if (heroVideo.paused && !bgVideo.paused) {
      bgVideo.pause();
    }

    return () => {
      heroVideo.removeEventListener("timeupdate", syncTime);
      heroVideo.removeEventListener("seeking", syncTime);
      heroVideo.removeEventListener("play", syncPlay);
      heroVideo.removeEventListener("pause", syncPause);
      heroVideo.removeEventListener("ratechange", syncRate);
    };
  }, [mounted, heroVideoEl, modalVideoSrc, currentPlayingSrc, activeHeroTrack.src]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BACKDROP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        applyBackdropSettingsToDOM({ ...DEFAULT_BACKDROP_SETTINGS, ...parsed });
      } else {
        applyBackdropSettingsToDOM(DEFAULT_BACKDROP_SETTINGS);
      }
    } catch {
      applyBackdropSettingsToDOM(DEFAULT_BACKDROP_SETTINGS);
    }

    const handleSettings = (e: Event) => {
      const detail = (e as CustomEvent<BackdropOverlaySettings>).detail;
      if (detail) {
        applyBackdropSettingsToDOM(detail);
        if (detail.videoSrc) {
          setActiveHeroTrack((prev: VideoTrack) => ({
            ...prev,
            src: detail.videoSrc,
          }));
        }
      }
    };
    const handleNowPlaying = (e: Event) => {
      const detail = (e as CustomEvent<{ src: string; title?: string }>).detail;
      if (detail?.src) {
        setActiveHeroTrack((prev: VideoTrack) => ({
          ...prev,
          src: detail.src,
          name: detail.title || prev.name,
        }));
      }
    };

    window.addEventListener(BACKDROP_EVENT_KEY, handleSettings);
    window.addEventListener("7h-now-playing-video", handleNowPlaying);
    return () => {
      window.removeEventListener(BACKDROP_EVENT_KEY, handleSettings);
      window.removeEventListener("7h-now-playing-video", handleNowPlaying);
    };
  }, []);

  const isDeltaMode = heroVariant === 0;

  useEffect(() => {
    if (isDeltaMode) {
      document.documentElement.dataset.deltaHero = "true";
    } else {
      delete document.documentElement.dataset.deltaHero;
    }
    return () => {
      delete document.documentElement.dataset.deltaHero;
    };
  }, [isDeltaMode]);

  return (
    <>
      {/* ── AMBIENT VIDEO BLUR BACKDROP (Portaled to document.body for true full bleed behind page AND footer) ── */}
      {mounted &&
        createPortal(
          <div
            id="media-bleed-backdrop"
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-[5] isolate overflow-hidden bg-black select-none"
          >
            {/* Fallback frame */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero/band-performance.webp"
              alt=""
              className="absolute inset-0 h-full w-full scale-150 object-cover opacity-65 blur-3xl saturate-150 transition-opacity duration-300 backdrop-video-filter"
            />

            {/* Live synchronized dual-buffer backdrop video crossfading smoothly across full page & footer */}
            {currentPlayingSrc && (
              <AmbientBlurVideoStack
                src={currentPlayingSrc}
                variant="tuned"
                activeVideoRef={bgVideoRef}
                onSourceError={(failedSrc) => {
                  if (failedSrc !== VIDEO_TRACKS[0].src) {
                    setFailedBgSrc(failedSrc);
                  }
                }}
              />
            )}

            {/* Cinematic dark scrim for crisp text contrast */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75 transition-opacity duration-150 backdrop-video-overlay"
            />

            {/* Active year's own image / primary video placeholder backdrop while viewing #delta-history */}
            <StoriaYearBackdropStack
              milestones={STORIA_ALL_YEARS_MILESTONES}
              activeIdx={storiaBackdrop.activeIdx}
              prevIdx={storiaBackdrop.prevIdx ?? null}
              isVisible={storiaBackdrop.isActive}
            />

            {/* Analog Film Grain / Noise directly inside full-bleed video backdrop (bleeds continuously across page AND footer) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-film-noise backdrop-noise-surface"
            />
          </div>,
          document.body
        )}

      <main
        id="media-page"
        aria-label="7th Heaven Media"
        className={`relative isolate min-h-screen w-full text-white overflow-x-clip transition-colors duration-500 ${
          isDeltaMode
            ? "bg-transparent pt-0 pb-20"
            : isFullBleed
              ? "bg-transparent pt-0 pb-0"
              : "bg-transparent pt-24 sm:pt-28 pb-20"
        }`}
      >
        {/* ── JJETTAS SIGNATURE MOMENTS BACKGROUND WATERMARK (HIDDEN IN FULL-BLEED DELTA CAFÉS MODE) ── */}
        {!isDeltaMode && (
          <div
            aria-hidden="true"
            className={`select-none pointer-events-none z-0 overflow-hidden ${
              isFullBleed
                ? "absolute top-14 inset-x-0 w-full"
                : "relative w-full site-container -mb-10 sm:-mb-14 md:-mb-20"
            }`}
          >
            <div
              className={`relative w-full overflow-hidden flex flex-col items-center ${
                isFullBleed ? "" : "max-w-[1600px] mx-auto"
              }`}
            >
              {/* Colossal Textured Purple Text with embedded synchronized emblems */}
              <div className="w-full flex justify-center">
                <svg
                  id="sig-moments-hero-svg"
                  viewBox="0 0 1820 200"
                  className="w-full h-auto max-h-[19vh] md:max-h-[23vh] select-none pointer-events-none [mask-image:linear-gradient(to_top,transparent_0%,rgba(0,0,0,0.25)_25%,rgba(0,0,0,0.85)_65%,black_100%)] [-webkit-mask-image:linear-gradient(to_top,transparent_0%,rgba(0,0,0,0.25)_25%,rgba(0,0,0,0.85)_65%,black_100%)]"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="GREAT MOMENTS"
                >
                  <defs>
                    {/* Dense tactile film noise filter */}
                    <filter id="textNoiseFilter" x="0%" y="0%" width="100%" height="100%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.85 0" />
                    </filter>

                    {/* Seamless repeating noise tile pattern */}
                    <pattern id="textNoisePattern" width="120" height="120" patternUnits="userSpaceOnUse">
                      <rect width="120" height="120" filter="url(#textNoiseFilter)" fill="#ffffff" />
                    </pattern>

                    {/* Vertical mask gradient from bottom (0 opacity) to top (high opacity) */}
                    <linearGradient id="textFadeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#000000" stopOpacity="0" />
                      <stop offset="25%" stopColor="#2b2b2b" stopOpacity="0.2" />
                      <stop offset="65%" stopColor="#777777" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#bbbbbb" stopOpacity="0.8" />
                    </linearGradient>

                    {/* Deep, dark rich purple gradient from bottom to top */}
                    <linearGradient id="textPurpleGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#0d031c" stopOpacity="0" />
                      <stop offset="25%" stopColor="#1a0738" stopOpacity="0.4" />
                      <stop offset="65%" stopColor="#2c0e5e" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#3c1480" stopOpacity="0.9" />
                    </linearGradient>

                    {/* Master text mask shaped as GREAT MOMENTS and faded by textFadeGradient */}
                    <mask id="masterTextMask">
                      <text
                        x="50%"
                        y="155"
                        textAnchor="middle"
                        fontFamily="var(--font-heading), Anton, sans-serif"
                        fontSize="180"
                        fontWeight="900"
                        letterSpacing="-0.025em"
                        fill="url(#textFadeGradient)"
                      >
                        GREAT MOMENTS
                      </text>
                    </mask>
                  </defs>

                  {/* Base dark purple gradient filled strictly within the text and faded at bottom */}
                  <rect width="100%" height="100%" fill="url(#textPurpleGradient)" mask="url(#masterTextMask)" />

                  {/* Tactile film noise stamped over the text with controlled blend to maintain deep dark tones */}
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#textNoisePattern)"
                    mask="url(#masterTextMask)"
                    className="mix-blend-overlay opacity-40"
                  />
                  {/* Extra fine grain layer with soft-light */}
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#textNoisePattern)"
                    mask="url(#masterTextMask)"
                    className="mix-blend-soft-light opacity-30"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ── HERO STAGE + SMOOOTHY REEL + MEDIA VAULT CATALOG ── */}
        <div
          className={
            isDeltaMode || isFullBleed
              ? "relative z-10 w-full"
              : "relative z-10 w-full site-container"
          }
        >
          {!isDeltaMode && (
            <div className={isFullBleed ? "px-4 sm:px-8 pt-20 pb-2 bg-black/70" : ""}>
              <TbwaHeroLayoutSwitcherBar
                activeHeroLayout={heroVariant}
                onSelectHeroLayout={setHeroVariant}
              />
            </div>
          )}

          <div
            className={`@container relative grid grid-cols-1 w-full ${
              isDeltaMode
                ? ""
                : isFullBleed
                  ? "min-h-[100dvh]"
                  : "max-w-[1600px] mx-auto"
            }`}
          >
            <div className="col-start-1 row-start-1 flex w-full flex-col self-start">
              <TbwaPillHero
                ref={heroRef}
                activeTrack={activeHeroTrack}
                heroVariant={heroVariant}
                fullBleed={isFullBleed}
                onToggleFullBleed={() => setIsFullBleed((prev) => !prev)}
                onVideoElement={setHeroVideoEl}
                onTrackChange={setActiveHeroTrack}
                onAudioStateChange={setIsHeroMusicPlaying}
                isListOpen={isListOpen}
                isOverlapped={!isDeltaMode && isListOpen && isVaultOverlapping}
                onToggleList={() => setIsListOpen((prev) => !prev)}
                onCinemaModeChange={setIsCinemaMode}
              />

              {/* ── SMOOOTHY × DELTA CAFÉS 100VW INFINITE REEL DIRECTLY UNDER VIDEO ── */}
              <div className={!isDeltaMode && isFullBleed ? "px-3 sm:px-6" : "w-full"}>
                <DeltaSmooothyMediaStrip
                  activeTrackId={activeHeroTrack.youtubeId || activeHeroTrack.id}
                  isMusicPlaying={isHeroMusicPlaying}
                  onSelectTrack={(track) => {
                    setModalVideoSrc(null);
                    heroRef.current?.playTrackWithSound(track);
                    setActiveHeroTrack(track);
                  }}
                  onPreviewTrack={(track) => {
                    setModalVideoSrc(null);
                    heroRef.current?.previewTrack(track);
                    setActiveHeroTrack(track);
                  }}
                  onStopTrack={() => {
                    heroRef.current?.pausePlayback();
                  }}
                />
              </div>
            </div>

            {/* ── MEDIA VAULT CATALOG (BELOW SMOOOTHY STRIP BY DEFAULT, OR OVERLAPPING VIDEO IN NON-DELTA MODES) ── */}
            {!isListOpen && (
              <div className="mx-auto flex w-full max-w-[1600px] justify-center px-4 sm:px-8 pt-6">
                <button
                  type="button"
                  onClick={() => setIsListOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-950/75 hover:bg-zinc-950 px-6 py-3 font-mono text-xs font-bold uppercase text-amber-100 hover:text-amber-50 transition-colors cursor-pointer"
                >
                  <ListVideo className="size-4 text-amber-300" />
                  <span>Open Media Vault Catalog (70)</span>
                </button>
              </div>
            )}

            {isListOpen && (
              <div
                id="partnerships-vault"
                className={`${
                  !isDeltaMode && isVaultOverlapping
                    ? `col-start-1 row-start-1 z-20 w-full pointer-events-none transition-[padding] duration-500 ${
                        isFullBleed
                          ? isCinemaMode
                            ? "pt-[calc(100dvh+1.5rem)] px-4 sm:px-8 pb-20"
                            : "pt-[68dvh] px-4 sm:px-8 pb-20"
                          : isCinemaMode
                            ? "pt-[calc(56.25cqw+1.5rem)]"
                            : "pt-[42.25cqw] @sm:pt-[36.25cqw]"
                      }`
                    : `relative z-20 mt-4 w-full ${
                        isDeltaMode
                          ? "px-4 sm:px-8 pt-4"
                          : isFullBleed
                            ? "px-4 sm:px-8 pb-20"
                            : "pb-16"
                      }`
                }`}
                role="region"
                aria-label="7th Heaven Media Vault Catalog"
              >
                {/* Glass catalog container */}
                <div
                  className={`pointer-events-auto relative mx-auto flex w-full max-w-[1600px] flex-col overflow-hidden rounded-[var(--radius-box)] border backdrop-blur-2xl ${
                    isDeltaMode
                      ? "border-amber-200/15 bg-zinc-950/75 shadow-2xl"
                      : "border-purple-500/30 bg-[#090314]/82 shadow-[0_-25px_60px_rgba(0,0,0,0.9)]"
                  }`}
                >
                  {/* Top gold accent stripe */}
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

                  {/* Tactile collapse handle */}
                  <div className="flex justify-center pt-2.5 pb-1">
                    <button
                      type="button"
                      onClick={() => setIsListOpen(false)}
                      className="h-1.5 w-14 rounded-full bg-white/30 hover:bg-white/60 transition-colors cursor-pointer"
                      aria-label="Collapse media list"
                    />
                  </div>

                  {/* Header bar of the list */}
                  <div className="flex items-center justify-between border-b border-white/10 px-6 sm:px-8 py-3.5 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
                        <ListVideo className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {/* heading-size-ok: compact dock bar title inside catalog shell */}
                          <h2 className="font-heading text-sm sm:text-base font-extrabold uppercase tracking-wide text-white">
                            MEDIA VAULT CATALOG
                          </h2>
                          <span className="hidden sm:inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-xs text-amber-300">
                            70 TITLES
                          </span>
                        </div>
                        <p className="text-xs font-mono text-zinc-400">
                          CLICK ANY VIDEO TO PLAY IN HERO • 25 SWITCHABLE FILTER LAYOUTS
                        </p>
                      </div>
                    </div>

                    {/* Overlap Toggle + Close / Hide Button */}
                    <div className="flex items-center gap-2">
                      {!isDeltaMode && (
                        <button
                          type="button"
                          onClick={() => setIsVaultOverlapping((prev) => !prev)}
                          aria-pressed={isVaultOverlapping}
                          className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 px-3.5 py-2 font-mono text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
                        >
                          <span>
                            {isVaultOverlapping ? "DOCK BELOW REEL" : "OVERLAP VIDEO"}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsListOpen(false)}
                        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2 font-mono text-xs font-bold text-white transition-colors cursor-pointer hover:border-amber-400/50"
                        title="Hide list"
                      >
                        <ChevronDown className="size-4 text-amber-400" />
                        <span>HIDE LIST</span>
                      </button>
                    </div>
                  </div>

                  {/* Full catalog content */}
                  <div className="px-4 sm:px-8 py-6">
                    <PartnershipsMediaVault
                      activeTrackId={activeHeroTrack.youtubeId || activeHeroTrack.id}
                      onSelectTrack={(track) => {
                        setModalVideoSrc(null);
                        heroRef.current?.playTrackWithSound(track);
                        setActiveHeroTrack(track);
                      }}
                      onVideoSelect={setModalVideoSrc}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM SECTION: "SINCE 1985, MUSIC THAT AWAKENS STORIES" 1985–2026 HISTORY TIMELINE ── */}
        <div className="relative z-10 w-full">
          <DeltaHistorySection
            onSectionBackdropChange={setStoriaBackdrop}
            onExploreArchive={() => {
              setIsListOpen(true);
              requestAnimationFrame(() => {
                const vaultEl = document.getElementById("partnerships-vault");
                if (!vaultEl) return;
                const lenis = (
                  window as Window & {
                    __lenis?: {
                      scrollTo: (
                        target: HTMLElement,
                        options?: { duration?: number; force?: boolean }
                      ) => void;
                    };
                  }
                ).__lenis;
                if (lenis) {
                  lenis.scrollTo(vaultEl, { duration: 1.1, force: true });
                } else {
                  vaultEl.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              });
            }}
          />
        </div>
      </main>
    </>
  );
}
