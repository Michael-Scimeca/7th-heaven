"use client";

import React, {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Play,
  Pause,
  Volume1,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  ListVideo,
} from "lucide-react";
import { loadYouTubeAPI } from "@/lib/youtube-api";
import { registerSyncedVideo } from "@/lib/videoFrameSync";
import { useVideoBlurCrossfade } from "@/hooks/useVideoBlurCrossfade";
import DeltaCafesHeroOverlay from "./DeltaCafesHeroOverlay";
import {
  HERO_ALBUM_PAGINATION_SLIDES,
  HERO_ALBUM_TRACKS,
} from "./deltaSmooothySlides";
import { TbwaHeroVideoOverlay, type HeroLayoutId } from "./TbwaHeroOverlays";

/* -------------------------------------------------------------------------- */
/*                                VIDEO TRACKS                                */
/* -------------------------------------------------------------------------- */

export interface VideoTrack {
  id: string;
  name: string;
  badge: string;
  subtitle: string;
  src: string;
  youtubeId: string;
  year?: string | number;
  duration?: string;
}

export const VIDEO_TRACKS: readonly VideoTrack[] = [
  {
    id: "better-this-way",
    name: "Better This Way",
    badge: "BILLBOARD #1",
    subtitle: "Billboard Top 40 Single • #1 on Midwest Radio Charts",
    src: "/movie/color-in-motion-clip.mp4",
    youtubeId: "FMo5aARV1MA",
    year: "2019",
    duration: "4:54",
  },
  {
    id: "aint-that-just-beautiful",
    name: "Ain't That Just Beautiful",
    badge: "OFFICIAL 4K RELEASE",
    subtitle: "Official Studio Music Video • Worldwide 4K Release",
    src: "/movie/hero-colorinmostion.mp4",
    youtubeId: "BzHUNTZ66zY",
    year: "2025",
    duration: "3:35",
  },
  {
    id: "taste-of-chicago-live",
    name: "Taste of Chicago Headline",
    badge: "LIVE ARENA TOUR",
    subtitle: "Live Arena Festival Concert Broadcast • 4K HDR",
    src: "/movie/fest1-clip.mp4",
    youtubeId: "8QJ7XfltJIM",
    year: "2024",
    duration: "45:20",
  },
  {
    id: "monster-rock",
    name: "Monster",
    badge: "STUDIO CUT",
    subtitle: "High-Energy Hard Rock Single • Official Video",
    src: "/movie/be-here-clip.mp4",
    youtubeId: "SWV7-pmtoA8",
    year: "2021",
    duration: "4:48",
  },
  {
    id: "sing-anthem",
    name: "Sing",
    badge: "FAN FAVORITE",
    subtitle: "Signature Live Radio Single & Fan Anthem",
    src: "/movie/luminous-clip.mp4",
    youtubeId: "wDEXG3kHjqk",
    year: "2017",
    duration: "3:38",
  },
];

interface YTPlayerInstance {
  playVideo?: () => void;
  pauseVideo?: () => void;
  mute?: () => void;
  unMute?: () => void;
  isMuted?: () => boolean;
  getPlayerState?: () => number;
  setVolume?: (volume: number) => void;
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime?: () => number;
  getDuration?: () => number;
  getVideoLoadedFraction?: () => number;
  loadVideoById?: (videoId: string) => void;
  cueVideoById?: (videoId: string) => void;
  destroy?: () => void;
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

const HERO_POINTER_IDLE_MS = 1600;
const HERO_TOUCH_IDLE_MS = 2600;

export interface TbwaPillHeroHandle {
  playTrackWithSound: (track: VideoTrack) => void;
  previewTrack: (track: VideoTrack) => void;
  pausePlayback: () => void;
}

export interface TbwaPillHeroProps {
  ref?: React.Ref<TbwaPillHeroHandle>;
  activeTrack?: VideoTrack;
  heroVariant?: HeroLayoutId;
  fullBleed?: boolean;
  onToggleFullBleed?: () => void;
  onVideoElement?: (el: HTMLVideoElement | null) => void;
  onTrackChange?: (track: VideoTrack) => void;
  onAudioStateChange?: (isAudioActive: boolean) => void;
  isListOpen?: boolean;
  isOverlapped?: boolean;
  onToggleList?: () => void;
  onCinemaModeChange?: (isCinema: boolean) => void;
}

export default function TbwaPillHero({
  ref,
  activeTrack: externalActiveTrack,
  heroVariant = 0,
  fullBleed = false,
  onToggleFullBleed,
  onVideoElement,
  onTrackChange,
  onAudioStateChange,
  isListOpen = false,
  isOverlapped = false,
  onToggleList,
  onCinemaModeChange,
}: TbwaPillHeroProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const ytReadyRef = useRef(false);
  const loadedYtIdRef = useRef<string>("");
  const playingYtIdRef = useRef<string | null>(null);

  // Playback & Audio States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(100);
  const [scrollVolumeFactor, setScrollVolumeFactor] = useState(1);
  const [playingYtVideoId, setPlayingYtVideoId] = useState<string | null>(null);
  const [failedPreviewSrc, setFailedPreviewSrc] = useState<string | null>(null);
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  const isPlayingRef = useRef(true);
  const isMutedRef = useRef(true);
  const userExplicitlyMutedRef = useRef(false);
  const userPausedRef = useRef(false);
  const scrollFrozenRef = useRef(false);
  const scrollVolumeFactorRef = useRef(1);
  const volumeRef = useRef(100);
  const lastNonZeroVolumeRef = useRef(100);
  const isCinemaModeRef = useRef(false);

  const emitAudioState = useCallback(
    (
      nextMuted = isMutedRef.current,
      nextPlaying = isPlayingRef.current,
      nextCinema = isCinemaModeRef.current
    ) => {
      isMutedRef.current = nextMuted;
      isPlayingRef.current = nextPlaying;
      isCinemaModeRef.current = nextCinema;
      onAudioStateChange?.(!nextMuted && nextPlaying && !nextCinema);
    },
    [onAudioStateChange]
  );

  // Video Progress & Scrubber States
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isPointerActive, setIsPointerActive] = useState(false);
  const isPointerActiveRef = useRef(false);
  const pointerIdleTimerRef = useRef<number | null>(null);
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const clearPointerIdleTimer = useCallback(() => {
    if (pointerIdleTimerRef.current !== null) {
      window.clearTimeout(pointerIdleTimerRef.current);
      pointerIdleTimerRef.current = null;
    }
  }, []);

  const deactivateHeroPointer = useCallback(() => {
    clearPointerIdleTimer();
    if (isPointerActiveRef.current) {
      isPointerActiveRef.current = false;
      setIsPointerActive(false);
    }
  }, [clearPointerIdleTimer]);

  const wakeHeroPointer = useCallback(
    (idleMs = HERO_POINTER_IDLE_MS) => {
      if (!isPointerActiveRef.current) {
        isPointerActiveRef.current = true;
        setIsPointerActive(true);
      }
      clearPointerIdleTimer();
      pointerIdleTimerRef.current = window.setTimeout(() => {
        pointerIdleTimerRef.current = null;
        isPointerActiveRef.current = false;
        setIsPointerActive(false);
      }, idleMs);
    },
    [clearPointerIdleTimer]
  );

  // Show hero overlay content while the pointer is moving inside the hero stage,
  // and hide it once pointer movement stops.
  useEffect(() => {
    const isPointInsideHero = (clientX: number, clientY: number): boolean => {
      const el = containerRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    };

    const handleWindowPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      const prev = lastPointerPosRef.current;
      if (
        prev &&
        Math.abs(e.clientX - prev.x) < 1 &&
        Math.abs(e.clientY - prev.y) < 1
      ) {
        return;
      }
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

      if (isPointInsideHero(e.clientX, e.clientY)) {
        wakeHeroPointer();
      } else {
        deactivateHeroPointer();
      }
    };

    const handleWindowPointerDown = (e: PointerEvent) => {
      if (isPointInsideHero(e.clientX, e.clientY)) {
        lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
        wakeHeroPointer(
          e.pointerType === "touch" ? HERO_TOUCH_IDLE_MS : HERO_POINTER_IDLE_MS
        );
      }
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (
        isPointInsideHero(e.clientX, e.clientY) &&
        isPointerActiveRef.current
      ) {
        wakeHeroPointer();
      }
    };

    const handleWindowLeaveOrBlur = () => {
      deactivateHeroPointer();
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", handleWindowPointerDown, {
      passive: true,
    });
    window.addEventListener("pointerup", handleWindowPointerUp, {
      passive: true,
    });
    document.documentElement.addEventListener(
      "mouseleave",
      handleWindowLeaveOrBlur
    );
    window.addEventListener("blur", handleWindowLeaveOrBlur);

    return () => {
      clearPointerIdleTimer();
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerdown", handleWindowPointerDown);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleWindowLeaveOrBlur
      );
      window.removeEventListener("blur", handleWindowLeaveOrBlur);
    };
  }, [clearPointerIdleTimer, deactivateHeroPointer, wakeHeroPointer]);

  const activeTrack = externalActiveTrack ?? VIDEO_TRACKS[0];
  const {
    layers: heroVideoLayers,
    notifyLayerReady: notifyHeroLayerReady,
    promoteIncomingLayer: promoteHeroIncomingLayer,
    dropFailedIncoming: dropFailedHeroIncoming,
  } = useVideoBlurCrossfade(activeTrack.src, { fallbackDurationMs: 1050 });
  const isYtPlaying = Boolean(activeTrack.youtubeId && playingYtVideoId === activeTrack.youtubeId);
  const effectiveVolume = isMuted ? 0 : Math.round(volume * scrollVolumeFactor);

  // Helper to format seconds to mm:ss
  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    onVideoElement?.(el);
    if (!el) return;
    return registerSyncedVideo(el, activeTrack.src, "hero");
  }, [onVideoElement, activeTrack.src]);

  // Diminish volume to 0 as user scrolls past the hero video; freeze playback at 0 and resume on scroll back up
  useEffect(() => {
    let rafId: number | null = null;

    const syncScrollPlaybackAndVolume = () => {
      rafId = null;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const heroHeight = rect.height;
      if (heroHeight <= 0) return;

      const visibleBottom = Math.max(0, Math.min(heroHeight, rect.bottom));
      const freezeThreshold = heroHeight * 0.25;
      const activeRange = Math.max(1, heroHeight - freezeThreshold);
      const rawFactor = Math.max(0, Math.min(1, (visibleBottom - freezeThreshold) / activeRange));
      const factor = rawFactor <= 0.01 ? 0 : rawFactor >= 0.99 ? 1 : rawFactor;

      scrollVolumeFactorRef.current = factor;
      setScrollVolumeFactor((prev) =>
        Math.abs(prev - factor) >= 0.01 ||
        (factor === 0 && prev !== 0) ||
        (factor === 1 && prev !== 1)
          ? factor
          : prev
      );

      const targetVol = volumeRef.current;
      const attenuatedVol = Math.round(targetVol * factor);
      const yt = ytPlayerRef.current;
      const video = videoRef.current;

      if (video) {
        video.volume = Math.max(0, Math.min(1, attenuatedVol / 100));
      }
      if (yt && ytReadyRef.current && !isMutedRef.current) {
        yt.setVolume?.(attenuatedVol);
      }

      if (attenuatedVol <= 0 || factor <= 0) {
        if (!scrollFrozenRef.current && !userPausedRef.current && !isCinemaModeRef.current) {
          scrollFrozenRef.current = true;
          if (yt && ytReadyRef.current) {
            yt.setVolume?.(0);
            yt.pauseVideo?.();
          }
          if (video && !video.paused) {
            video.pause();
          }
          const allVideos = el.querySelectorAll("video");
          allVideos.forEach((v) => {
            if (!v.paused) v.pause();
          });
          setIsPlaying(false);
          emitAudioState(isMutedRef.current, false, isCinemaModeRef.current);
        }
      } else if (scrollFrozenRef.current) {
        scrollFrozenRef.current = false;
        if (!userPausedRef.current && !isCinemaModeRef.current) {
          if (yt && ytReadyRef.current && activeTrack.youtubeId) {
            if (!isMutedRef.current) {
              yt.unMute?.();
              yt.setVolume?.(attenuatedVol);
            } else {
              yt.mute?.();
            }
            yt.playVideo?.();
          }
          if (video) {
            video.muted = activeTrack.youtubeId ? true : isMutedRef.current;
            video.volume = Math.max(0, Math.min(1, attenuatedVol / 100));
            if (video.paused) {
              video.play().catch(() => {});
            }
          }
          setIsPlaying(true);
          emitAudioState(isMutedRef.current, true, isCinemaModeRef.current);
        }
      }
    };

    const onScrollOrResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(syncScrollPlaybackAndVolume);
    };

    syncScrollPlaybackAndVolume();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [activeTrack.youtubeId, emitAudioState]);

  const handleYtPlayingState = useEffectEvent(
    (stateCode: number, target: YTPlayerInstance) => {
      const YTState = window.YT?.PlayerState;
      if (YTState && stateCode === YTState.PLAYING) {
        if (userPausedRef.current || isCinemaModeRef.current || scrollFrozenRef.current) {
          target.pauseVideo?.();
          return;
        }
        playingYtIdRef.current = loadedYtIdRef.current;
        setPlayingYtVideoId(loadedYtIdRef.current);
        setIsPlaying(true);
        emitAudioState(isMutedRef.current, true, isCinemaModeRef.current);
        if (!isMutedRef.current) {
          target.unMute?.();
          target.setVolume?.(Math.round(volumeRef.current * scrollVolumeFactorRef.current));
        } else {
          target.mute?.();
        }
      } else if (YTState && stateCode === YTState.PAUSED) {
        if (playingYtIdRef.current === loadedYtIdRef.current) {
          setIsPlaying(false);
          emitAudioState(isMutedRef.current, false, isCinemaModeRef.current);
        }
      } else if (YTState && stateCode === YTState.ENDED) {
        target.seekTo?.(0, true);
        target.playVideo?.();
      }
    }
  );

  // Pre-warm and pre-play a single persistent YouTube IFrame API player from frame 0
  // so unmuting has 0ms buffering delay and sticky user activation unlocks real song audio automatically.
  useEffect(() => {
    const host = ytHostRef.current;
    if (!host || !activeTrack.youtubeId) return;

    let cancelled = false;
    let verifyUnmuteTimer: number | null = null;
    const initialVideoId = activeTrack.youtubeId;
    loadedYtIdRef.current = initialVideoId;

    const initPlayer = () => {
      if (cancelled || !ytHostRef.current || ytPlayerRef.current) return;
      host.innerHTML = "";
      const mountEl = document.createElement("div");
      host.appendChild(mountEl);

      try {
        ytPlayerRef.current = new window.YT.Player(mountEl, {
          width: "100%",
          height: "100%",
          videoId: initialVideoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            loop: 1,
            playlist: initialVideoId,
            origin: window.location.origin,
          },
          events: {
            onReady: (e: { target: YTPlayerInstance }) => {
              if (cancelled) return;
              ytReadyRef.current = true;
              const desiredId = loadedYtIdRef.current;
              if (desiredId && desiredId !== initialVideoId) {
                e.target.loadVideoById?.(desiredId);
              }
              if (isCinemaModeRef.current || userPausedRef.current) {
                e.target.pauseVideo?.();
                return;
              }

              const restoredVol =
                volumeRef.current > 0 ? volumeRef.current : lastNonZeroVolumeRef.current || 100;

              if (!isMutedRef.current && !userExplicitlyMutedRef.current) {
                // User already clicked an unmute/play control while YT was initializing
                volumeRef.current = restoredVol;
                lastNonZeroVolumeRef.current = restoredVol;
                e.target.unMute?.();
                e.target.setVolume?.(restoredVol);
                e.target.playVideo?.();
                return;
              }

              const hasStickyActivation =
                typeof navigator !== "undefined" &&
                Boolean(navigator.userActivation?.hasBeenActive);

              if (hasStickyActivation && !userExplicitlyMutedRef.current) {
                // Browser session already has sticky user activation — attempt audible playback and verify
                e.target.unMute?.();
                e.target.setVolume?.(restoredVol);
                e.target.playVideo?.();

                const checkAudiblePlayback = (attempt: number) => {
                  if (
                    cancelled ||
                    isCinemaModeRef.current ||
                    userExplicitlyMutedRef.current ||
                    userPausedRef.current
                  ) {
                    return;
                  }
                  const ytMuted = e.target.isMuted?.();
                  const ytState = e.target.getPlayerState?.();
                  const YTState = window.YT?.PlayerState;

                  if (ytMuted === false && ytState === YTState?.PLAYING) {
                    volumeRef.current = restoredVol;
                    lastNonZeroVolumeRef.current = restoredVol;
                    isMutedRef.current = false;
                    setVolume(restoredVol);
                    setIsMuted(false);
                    setIsPlaying(true);
                    emitAudioState(false, true, isCinemaModeRef.current);
                  } else if (
                    attempt < 2 &&
                    ytMuted === false &&
                    (ytState === YTState?.BUFFERING || ytState === -1)
                  ) {
                    verifyUnmuteTimer = window.setTimeout(() => checkAudiblePlayback(attempt + 1), 350);
                  } else if (isMutedRef.current) {
                    // Audible autoplay blocked without fresh gesture — keep pre-playing muted cleanly
                    e.target.mute?.();
                    e.target.playVideo?.();
                  }
                };

                verifyUnmuteTimer = window.setTimeout(() => checkAudiblePlayback(1), 280);
              } else {
                e.target.mute?.();
                e.target.playVideo?.();
              }
            },
            onStateChange: (e: { data: number; target: YTPlayerInstance }) => {
              if (cancelled) return;
              handleYtPlayingState(e.data, e.target);
            },
          },
        });

        const iframeEl = host.querySelector("iframe");
        if (iframeEl) {
          iframeEl.setAttribute(
            "allow",
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          );
        }
      } catch {
        // Fallback gracefully to native video element
      }
    };

    loadYouTubeAPI(initPlayer);

    return () => {
      cancelled = true;
      if (verifyUnmuteTimer !== null) {
        window.clearTimeout(verifyUnmuteTimer);
      }
      ytReadyRef.current = false;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy?.();
        } catch {}
        ytPlayerRef.current = null;
      }
      host.innerHTML = "";
    };
    // Mount persistent YT host once; track switches are handled via loadVideoById below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch YouTube track seamlessly when activeTrack.youtubeId changes (pre-playing even while muted)
  useEffect(() => {
    if (!activeTrack.youtubeId) return;
    if (loadedYtIdRef.current === activeTrack.youtubeId) return;
    loadedYtIdRef.current = activeTrack.youtubeId;
    playingYtIdRef.current = null;

    const player = ytPlayerRef.current;
    if (!player || !ytReadyRef.current) return;

    player.loadVideoById?.(activeTrack.youtubeId);
    if (isCinemaModeRef.current || scrollFrozenRef.current) {
      player.pauseVideo?.();
      return;
    }

    if (!isMutedRef.current) {
      player.unMute?.();
      player.setVolume?.(Math.round(volumeRef.current * scrollVolumeFactorRef.current));
      player.playVideo?.();
    } else {
      player.mute?.();
      player.playVideo?.();
    }
  }, [activeTrack.youtubeId]);

  // Unlock real song audio automatically on the user's first click/tap/keypress on a cold tab
  useEffect(() => {
    if (!isMuted || isCinemaMode) return;

    const unlockOnFirstGesture = (e: Event) => {
      if (userExplicitlyMutedRef.current || !isMutedRef.current || isCinemaModeRef.current) {
        return;
      }
      if (document.querySelector("dialog[open]")) {
        return;
      }
      if (e instanceof KeyboardEvent) {
        if (e.metaKey || e.ctrlKey || e.altKey || e.key === "Shift" || e.key === "Tab" || e.key === "Escape") {
          return;
        }
      }
      if (
        e.target instanceof Element &&
        e.target.closest("a[href], [data-audio-control], [data-smooothy-card]")
      ) {
        return;
      }

      const restoredVol =
        volumeRef.current > 0 ? volumeRef.current : lastNonZeroVolumeRef.current || 100;
      const attenuatedVol = Math.round(restoredVol * scrollVolumeFactorRef.current);
      volumeRef.current = restoredVol;
      lastNonZeroVolumeRef.current = restoredVol;
      isMutedRef.current = false;

      setVolume(restoredVol);
      setIsMuted(false);

      const yt = ytPlayerRef.current;
      const video = videoRef.current;

      if (scrollFrozenRef.current) {
        if (yt && ytReadyRef.current) {
          yt.unMute?.();
          yt.setVolume?.(0);
          yt.pauseVideo?.();
        }
        if (video) {
          video.volume = 0;
          if (!video.paused) video.pause();
        }
        emitAudioState(false, false, false);
        return;
      }

      setIsPlaying(true);
      emitAudioState(false, true, false);

      if (activeTrack.youtubeId && yt && ytReadyRef.current) {
        if (video) {
          video.muted = true;
          video.volume = Math.max(0, Math.min(1, attenuatedVol / 100));
          if (video.paused) {
            video.play().catch(() => {});
          }
        }
        yt.unMute?.();
        yt.setVolume?.(attenuatedVol);
        yt.playVideo?.();
      } else if (video && !activeTrack.youtubeId) {
        video.muted = false;
        video.volume = Math.max(0, Math.min(1, attenuatedVol / 100));
        video.play().catch(() => {});
      }
    };

    window.addEventListener("click", unlockOnFirstGesture);
    window.addEventListener("keydown", unlockOnFirstGesture);
    return () => {
      window.removeEventListener("click", unlockOnFirstGesture);
      window.removeEventListener("keydown", unlockOnFirstGesture);
    };
  }, [isMuted, isCinemaMode, activeTrack.youtubeId, emitAudioState]);

  // Poll YouTube currentTime / duration whenever full YouTube audio+video layer is active
  useEffect(() => {
    if (!isYtPlaying || isCinemaMode) return;

    const tick = () => {
      const player = ytPlayerRef.current;
      if (!player || isScrubbing) return;
      const t = player.getCurrentTime?.() ?? 0;
      const d = player.getDuration?.() ?? 0;
      const b = player.getVideoLoadedFraction?.() ?? 0;
      if (d > 0) {
        setCurrentTime(t);
        setDuration(d);
        setBuffered(b);
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [isYtPlaying, isCinemaMode, isScrubbing]);

  // Local <video> Time & Buffer Update Listeners (active while local preview loop is shown)
  useEffect(() => {
    if (isYtPlaying) return;
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(video.currentTime);
      }
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered(bufferedEnd / video.duration);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setCurrentTime(video.currentTime || 0);
    };

    const onDurationChange = () => {
      setDuration(video.duration || 0);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("durationchange", onDurationChange);

    if (video.duration) {
      setDuration(video.duration);
      setCurrentTime(video.currentTime);
    }

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("durationchange", onDurationChange);
    };
  }, [isScrubbing, activeTrack.src, isYtPlaying]);

  // Scrubber / Seek Handler
  const handleSeek = useCallback(
    (clientX: number) => {
      const bar = progressBarRef.current;
      if (!bar) return;

      const rect = bar.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = clickX / rect.width;

      if (isYtPlaying && ytPlayerRef.current) {
        const ytDur = ytPlayerRef.current.getDuration?.() ?? duration;
        if (ytDur > 0) {
          const newTime = percentage * ytDur;
          ytPlayerRef.current.seekTo?.(newTime, true);
          const previewVideo = videoRef.current;
          if (previewVideo && previewVideo.duration > 0) {
            previewVideo.currentTime = newTime % previewVideo.duration;
          }
          setCurrentTime(newTime);
        }
        return;
      }

      const video = videoRef.current;
      if (!video || !video.duration) return;
      const newTime = percentage * video.duration;
      video.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [isYtPlaying, duration]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsScrubbing(true);
    handleSeek(e.clientX);
  };

  const handlePointerHover = (e: React.PointerEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setHoverPosition(percent);
    setHoverTime((percent / 100) * duration);
  };

  const handlePointerLeave = () => {
    setHoverPosition(null);
    setHoverTime(null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const delta = e.key === "ArrowLeft" ? -5 : 5;

    if (isYtPlaying && ytPlayerRef.current) {
      const cur = ytPlayerRef.current.getCurrentTime?.() ?? currentTime;
      const dur = ytPlayerRef.current.getDuration?.() ?? duration;
      if (dur > 0) {
        const next = Math.max(0, Math.min(dur, cur + delta));
        ytPlayerRef.current.seekTo?.(next, true);
        setCurrentTime(next);
      }
      return;
    }

    const video = videoRef.current;
    if (!video || !video.duration) return;
    const next = Math.max(0, Math.min(video.duration, video.currentTime + delta));
    video.currentTime = next;
    setCurrentTime(next);
  };

  // Stop / Pause both YouTube audio and hero video cleanly
  const pausePlayback = useCallback(() => {
    userPausedRef.current = true;
    isPlayingRef.current = false;
    if (ytPlayerRef.current && ytReadyRef.current) {
      ytPlayerRef.current.pauseVideo?.();
    }
    videoRef.current?.pause();
    setIsPlaying(false);
    emitAudioState(isMutedRef.current, false, isCinemaModeRef.current);
  }, [emitAudioState]);

  // Toggle Video Play / Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    const yt = ytPlayerRef.current;

    if (isPlaying) {
      pausePlayback();
      return;
    }

    userPausedRef.current = false;
    if (isMutedRef.current && !userExplicitlyMutedRef.current) {
      const restoredVol =
        volumeRef.current > 0 ? volumeRef.current : lastNonZeroVolumeRef.current || 100;
      volumeRef.current = restoredVol;
      lastNonZeroVolumeRef.current = restoredVol;
      isMutedRef.current = false;
      setVolume(restoredVol);
      setIsMuted(false);
    }

    if (activeTrack.youtubeId && yt && ytReadyRef.current) {
      if (!isMutedRef.current) {
        yt.unMute?.();
        yt.setVolume?.(volumeRef.current);
      }
      yt.playVideo?.();
    }
    video?.play().catch(() => {});
    setIsPlaying(true);
    emitAudioState(isMutedRef.current, true, isCinemaModeRef.current);
  }, [activeTrack.youtubeId, emitAudioState, isPlaying, pausePlayback]);

  // Toggle Mute — synchronously unlocks & plays real song audio via YT.Player
  const toggleMute = useCallback(() => {
    const nextMuted = !isMutedRef.current;
    isMutedRef.current = nextMuted;
    setIsMuted(nextMuted);

    const video = videoRef.current;
    const yt = ytPlayerRef.current;

    if (!nextMuted) {
      // Turning SOUND ON
      userExplicitlyMutedRef.current = false;
      userPausedRef.current = false;
      const restoredVol =
        volumeRef.current > 0 ? volumeRef.current : lastNonZeroVolumeRef.current || 100;
      volumeRef.current = restoredVol;
      lastNonZeroVolumeRef.current = restoredVol;
      setVolume(restoredVol);

      if (activeTrack.youtubeId) {
        if (video) {
          video.muted = true;
          if (video.paused) {
            video.play().catch(() => {});
          }
        }
        if (yt && ytReadyRef.current) {
          yt.unMute?.();
          yt.setVolume?.(restoredVol);
          yt.playVideo?.();
        }
        setIsPlaying(true);
        emitAudioState(false, true, isCinemaModeRef.current);
      } else if (video) {
        video.muted = false;
        video.volume = restoredVol / 100;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            emitAudioState(false, true, isCinemaModeRef.current);
          })
          .catch(() => {});
      } else {
        emitAudioState(false, isPlayingRef.current, isCinemaModeRef.current);
      }
    } else {
      // Turning SOUND OFF (keep current video position & progress seamless)
      userExplicitlyMutedRef.current = true;
      if (yt && ytReadyRef.current) {
        yt.mute?.();
      }
      if (video) {
        video.muted = true;
      }
      emitAudioState(true, isPlayingRef.current, isCinemaModeRef.current);
    }
  }, [activeTrack.youtubeId, emitAudioState]);

  // Synchronously unmute & play a selected track's music inside a user click/tap gesture
  const playTrackWithSound = useCallback(
    (track: VideoTrack) => {
      userExplicitlyMutedRef.current = false;
      userPausedRef.current = false;
      if (isCinemaModeRef.current) {
        isCinemaModeRef.current = false;
        setIsCinemaMode(false);
        onCinemaModeChange?.(false);
      }

      const restoredVol =
        volumeRef.current > 0 ? volumeRef.current : lastNonZeroVolumeRef.current || 100;
      volumeRef.current = restoredVol;
      lastNonZeroVolumeRef.current = restoredVol;
      isMutedRef.current = false;

      setVolume(restoredVol);
      setIsMuted(false);
      setIsPlaying(true);
      emitAudioState(false, true, false);
      onTrackChange?.(track);

      const video = videoRef.current;
      const yt = ytPlayerRef.current;

      if (track.youtubeId) {
        const isSwitchingTrack = loadedYtIdRef.current !== track.youtubeId;
        loadedYtIdRef.current = track.youtubeId;

        if (isSwitchingTrack) {
          playingYtIdRef.current = null;
          setPlayingYtVideoId(null);
          setCurrentTime(0);
        }

        if (video) {
          video.muted = true;
          if (video.paused) {
            video.play().catch(() => {});
          }
        }

        if (yt && ytReadyRef.current) {
          yt.unMute?.();
          yt.setVolume?.(restoredVol);
          if (isSwitchingTrack) {
            yt.loadVideoById?.(track.youtubeId);
            yt.unMute?.();
            yt.setVolume?.(restoredVol);
          }
          yt.playVideo?.();
        }
        return;
      }

      if (video) {
        video.muted = false;
        video.volume = restoredVol / 100;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            emitAudioState(false, true, false);
          })
          .catch(() => {});
      }
    },
    [emitAudioState, onCinemaModeChange, onTrackChange]
  );

  // Switch hero video preview & track metadata while preserving current mute/audible state
  const previewTrack = useCallback(
    (track: VideoTrack) => {
      userPausedRef.current = false;
      isPlayingRef.current = true;
      if (isCinemaModeRef.current) {
        isCinemaModeRef.current = false;
        setIsCinemaMode(false);
        onCinemaModeChange?.(false);
      }

      setIsPlaying(true);
      emitAudioState(isMutedRef.current, true, false);
      onTrackChange?.(track);

      const video = videoRef.current;
      if (video && video.paused) {
        video.play().catch(() => {});
      }
    },
    [emitAudioState, onCinemaModeChange, onTrackChange]
  );

  useImperativeHandle(
    ref,
    () => ({
      playTrackWithSound,
      previewTrack,
      pausePlayback,
    }),
    [playTrackWithSound, previewTrack, pausePlayback]
  );

  // Adjust Volume Slider (0..100) — dragging above 0 unmutes & unlocks real song audio
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVol = Math.max(0, Math.min(100, Number(e.target.value)));
      volumeRef.current = nextVol;
      setVolume(nextVol);

      const video = videoRef.current;
      const yt = ytPlayerRef.current;

      if (nextVol > 0) {
        userExplicitlyMutedRef.current = false;
        lastNonZeroVolumeRef.current = nextVol;
        const wasMuted = isMutedRef.current;
        if (wasMuted) {
          isMutedRef.current = false;
          setIsMuted(false);
        }

        if (activeTrack.youtubeId) {
          if (video) {
            video.muted = true;
            if (video.paused) {
              video.play().catch(() => {});
            }
          }
          if (yt && ytReadyRef.current) {
            yt.unMute?.();
            yt.setVolume?.(nextVol);
            if (wasMuted || !isPlayingRef.current || playingYtIdRef.current !== activeTrack.youtubeId) {
              yt.playVideo?.();
              setIsPlaying(true);
              emitAudioState(false, true, isCinemaModeRef.current);
            } else {
              emitAudioState(false, isPlayingRef.current, isCinemaModeRef.current);
            }
          } else {
            setIsPlaying(true);
            emitAudioState(false, true, isCinemaModeRef.current);
          }
        } else if (video) {
          video.muted = false;
          video.volume = nextVol / 100;
          if (wasMuted) {
            video
              .play()
              .then(() => {
                setIsPlaying(true);
                emitAudioState(false, true, isCinemaModeRef.current);
              })
              .catch(() => {});
          } else {
            emitAudioState(false, isPlayingRef.current, isCinemaModeRef.current);
          }
        }
      } else {
        userExplicitlyMutedRef.current = true;
        isMutedRef.current = true;
        setIsMuted(true);
        if (yt && ytReadyRef.current) {
          yt.mute?.();
        }
        if (video) {
          video.muted = true;
        }
        emitAudioState(true, isPlayingRef.current, isCinemaModeRef.current);
      }
    },
    [activeTrack.youtubeId, emitAudioState]
  );

  // Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // Ensure Local Preview Video Autoplays on Mount and upon track changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Keep local preview muted whenever YT is supplying real audio
    video.muted = activeTrack.youtubeId ? true : isMuted;
    video.defaultMuted = true;
    video.playsInline = true;

    const tryAutoplay = () => {
      if (
        isCinemaMode ||
        userPausedRef.current ||
        scrollFrozenRef.current ||
        !isPlayingRef.current
      ) {
        return;
      }
      const promise = video.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            if (!playingYtIdRef.current) {
              setIsPlaying(true);
            }
          })
          .catch(() => {
            video.muted = true;
            video
              .play()
              .then(() => {
                if (!playingYtIdRef.current) setIsPlaying(true);
              })
              .catch(() => {});
          });
      }
    };

    if (video.readyState >= 2) {
      tryAutoplay();
    } else {
      video.addEventListener("loadeddata", tryAutoplay, { once: true });
      video.addEventListener("canplay", tryAutoplay, { once: true });
    }

    return () => {
      video.removeEventListener("loadeddata", tryAutoplay);
      video.removeEventListener("canplay", tryAutoplay);
    };
  }, [activeTrack.src, activeTrack.youtubeId, isMuted, isCinemaMode]);

  const hasLocalVideoFallbackNeeded = failedPreviewSrc === activeTrack.src;
  const showYtLayer = isYtPlaying && !isCinemaMode && hasLocalVideoFallbackNeeded;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const isDeltaHero = heroVariant === 0;

  return (
    <div
      id="media-hero"
      className={`relative z-10 w-full scroll-mt-24 ${isDeltaHero || fullBleed ? "" : "max-w-[1600px] mx-auto"}`}
    >
      <div
        ref={containerRef}
        data-pointer-active={isPointerActive ? "true" : "false"}
        data-force-open={isScrubbing ? "true" : "false"}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") {
            const rect = e.currentTarget.getBoundingClientRect();
            if (
              e.clientX < rect.left ||
              e.clientX > rect.right ||
              e.clientY < rect.top ||
              e.clientY > rect.bottom
            ) {
              deactivateHeroPointer();
            }
          }
        }}
        className={`hero-hover-stage relative w-full overflow-hidden flex items-center justify-center bg-black shadow-2xl group fullscreen:max-w-none fullscreen:w-full fullscreen:h-full fullscreen:aspect-auto fullscreen:rounded-none fullscreen:border-0 ${
          isDeltaHero
            ? "h-[93dvh] min-h-[580px] rounded-none border-0"
            : fullBleed
              ? "h-[100dvh] min-h-[100dvh] rounded-none border-0"
              : "aspect-video rounded-[var(--radius-box)] border border-white/10"
        }`}
      >
        {/* Dual-Buffer 60fps Local Loop Video Layers (Optical Blur Dissolve on Track Switch) */}
        {heroVideoLayers.map((layer) => {
          const isIncoming =
            layer.phase === "entering" || layer.phase === "active";

          return (
            <video
              key={layer.id}
              ref={(el) => {
                if (layer.isTarget) {
                  videoRef.current = el;
                } else if (el) {
                  el.muted = true;
                }
                if (isIncoming && el && el.readyState >= 2) {
                  notifyHeroLayerReady(layer.id);
                }
              }}
              src={layer.src}
              autoPlay
              playsInline
              muted
              loop
              preload="auto"
              data-state={layer.phase}
              data-audio-control={layer.isTarget ? "" : undefined}
              onLoadedData={() => {
                if (isIncoming) notifyHeroLayerReady(layer.id);
              }}
              onCanPlay={(e) => {
                if (
                  !isCinemaMode &&
                  !userPausedRef.current &&
                  !scrollFrozenRef.current &&
                  isPlayingRef.current &&
                  e.currentTarget.paused
                ) {
                  e.currentTarget.play().catch(() => {});
                }
                if (isIncoming) notifyHeroLayerReady(layer.id);
              }}
              onPlaying={() => {
                if (isIncoming) notifyHeroLayerReady(layer.id);
              }}
              onTransitionEnd={(e) => {
                if (
                  isIncoming &&
                  e.target === e.currentTarget &&
                  e.propertyName === "opacity"
                ) {
                  promoteHeroIncomingLayer(layer.id);
                }
              }}
              onPointerUp={
                layer.isTarget
                  ? (e) => {
                      if (e.pointerType === "mouse" && e.button !== 0) return;
                      if (isMutedRef.current || !isPlaying) {
                        playTrackWithSound(activeTrack);
                      } else {
                        toggleMute();
                      }
                    }
                  : undefined
              }
              onError={() => {
                if (isIncoming) {
                  dropFailedHeroIncoming(layer.id);
                }
                setFailedPreviewSrc(layer.src);
              }}
              className={`hero-video-crossfade-layer absolute inset-0 z-[1] size-full object-cover ${
                !layer.isTarget ? "pointer-events-none" : "cursor-pointer"
              }`}
            />
          );
        })}

        {/* Real Synchronized Song Audio + 4K Video Layer (Kept opacity-100 behind <video> to avoid zero-opacity iframe throttling) */}
        <div
          ref={ytHostRef}
          aria-hidden={!showYtLayer}
          className={`pointer-events-none absolute inset-0 overflow-hidden opacity-100 [&_iframe]:size-full [&_iframe]:scale-105 [&_iframe]:border-0 ${
            showYtLayer ? "z-10" : "z-0"
          }`}
        />

        {/* Active Overlay Video Tint & Contrast Scrim (Reveals cleanly on hero hover; clears when not hovering) */}
        <div
          aria-hidden="true"
          data-cinema={isCinemaMode ? "true" : "false"}
          className={`hero-active-video-tint pointer-events-none absolute inset-0 z-10 ${
            isDeltaHero
              ? ""
              : heroVariant !== 1
                ? "bg-black/30"
                : ""
          }`}
        />

        {/* Full 4K Cinema YouTube Player Mode */}
        {isCinemaMode && (
          <div className="absolute inset-0 z-30 bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${activeTrack.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={activeTrack.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full border-0"
            />
            <button
              type="button"
              data-audio-control=""
              onClick={() => {
                setIsCinemaMode(false);
                if (!isMutedRef.current) {
                  ytPlayerRef.current?.unMute?.();
                  ytPlayerRef.current?.setVolume?.(volumeRef.current);
                }
                ytPlayerRef.current?.playVideo?.();
                setIsPlaying(true);
                emitAudioState(isMutedRef.current, true, false);
                onCinemaModeChange?.(false);
              }}
              className="absolute top-4 right-4 z-40 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/30 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-md transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3 text-red-400" />
              <span>RETURN TO PREVIEW</span>
            </button>
          </div>
        )}

        {/* All Hero Text & Control Overlays (Reveals smoothly whenever hovering anywhere on the hero video) */}
        {!isCinemaMode && (
          <div className="hero-idle-fade pointer-events-none absolute inset-0 z-20">
            {/* Delta Cafés Full-Bleed Cinema Hero Overlay (#00 Default) */}
            {isDeltaHero && (
          <DeltaCafesHeroOverlay
            activeTrack={activeTrack}
            tracks={HERO_ALBUM_TRACKS}
            paginationSlides={HERO_ALBUM_PAGINATION_SLIDES}
            onTrackChange={playTrackWithSound}
            onPreviewTrack={previewTrack}
            onStopTrack={pausePlayback}
            onOpenCinema={() => {
              ytPlayerRef.current?.pauseVideo?.();
              setIsCinemaMode(true);
              emitAudioState(isMutedRef.current, false, true);
              onCinemaModeChange?.(true);
            }}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            volume={volume}
            effectiveVolume={effectiveVolume}
            onVolumeChange={handleVolumeChange}
            currentTime={currentTime}
            duration={duration}
            progressPercent={progressPercent}
            formatTime={formatTime}
            progressBarRef={progressBarRef}
            onPointerDown={handlePointerDown}
            onPointerMove={(e) => {
              handlePointerHover(e);
              if (isScrubbing) handleSeek(e.clientX);
            }}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
            onKeyDown={handleKeyDown}
          />
        )}

        {/* TBWA\Hakuhodo Video-Overlay Layouts (#02–#05) */}
        {heroVariant !== 0 && heroVariant !== 1 && (
          <TbwaHeroVideoOverlay
            variant={heroVariant}
            activeTrack={activeTrack}
            tracks={VIDEO_TRACKS}
            onTrackChange={playTrackWithSound}
            totalCatalogCount={70}
            isListOpen={isOverlapped}
            onToggleList={onToggleList}
            fullBleed={fullBleed}
            onToggleFullBleed={onToggleFullBleed}
            onOpenCinema={() => {
              ytPlayerRef.current?.pauseVideo?.();
              setIsCinemaMode(true);
              emitAudioState(isMutedRef.current, false, true);
              onCinemaModeChange?.(true);
            }}
            onToggleFullscreen={toggleFullscreen}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            volume={volume}
            effectiveVolume={effectiveVolume}
            onVolumeChange={handleVolumeChange}
            currentTime={currentTime}
            duration={duration}
            buffered={buffered}
            progressPercent={progressPercent}
            isScrubbing={isScrubbing}
            hoverPosition={hoverPosition}
            hoverTime={hoverTime}
            formatTime={formatTime}
            progressBarRef={progressBarRef}
            onPointerDown={handlePointerDown}
            onPointerMove={(e) => {
              handlePointerHover(e);
              if (isScrubbing) handleSeek(e.clientX);
            }}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
            onKeyDown={handleKeyDown}
          />
        )}

        {/* Top Bar: Track Badge + Quick Sound Toggle (Clean 16:9 Stage #01) */}
        {heroVariant === 1 && (
          <div
            className={`pointer-events-none absolute top-4 sm:top-6 z-30 flex items-center justify-between gap-3 font-mono text-xs tracking-widest text-white/75 uppercase ${
              fullBleed
                ? "inset-x-6 sm:inset-x-12 lg:inset-x-16"
                : "inset-x-4 sm:inset-x-8"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-block size-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
              <span className="font-bold text-white truncate">FEATURED VAULT VIDEO</span>
              <span className="hidden sm:inline text-white/40">/</span>
              <span className="hidden sm:inline text-purple-300 font-bold truncate">
                {activeTrack.badge}
              </span>
            </div>

            <div className="pointer-events-auto flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2.5">
                <span className="text-white/90 font-semibold">{activeTrack.name}</span>
                <span className="text-white/30">•</span>
                <span className="text-white/60">{activeTrack.duration} • 4K</span>
              </div>

              <button
                type="button"
                onClick={toggleMute}
                aria-pressed={!isMuted}
                aria-label={isMuted ? "Turn video sound on" : "Mute video sound"}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-extrabold uppercase tracking-wider backdrop-blur-xl shadow-xl transition-colors cursor-pointer ${
                  isMuted
                    ? "border-amber-400/70 bg-black/80 text-amber-300 hover:bg-amber-400 hover:text-zinc-950"
                    : "border-amber-300 bg-amber-400 text-zinc-950 hover:bg-amber-300"
                }`}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="size-4" />
                    <span>Tap for Sound</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="size-4" />
                    <span>Sound {volume}%</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Always-Visible Video Player Control Dock (Clean 16:9 Stage #01) */}
        {heroVariant === 1 && (
          <div
            className={`pointer-events-auto absolute z-30 flex flex-col gap-2 transition-[bottom] duration-500 group-fullscreen:bottom-6 ${
              isOverlapped
                ? fullBleed
                  ? "bottom-[calc(32dvh+0.75rem)]"
                  : "bottom-[calc(14cqw+0.5rem)] @sm:bottom-[calc(20cqw+0.75rem)]"
                : "bottom-4 sm:bottom-6"
            } ${
              fullBleed
                ? "inset-x-6 sm:inset-x-12 lg:inset-x-16"
                : "inset-x-4 sm:inset-x-8"
            }`}
          >
            {/* Interactive Scrubber Progress Bar */}
            <div
              ref={progressBarRef}
              role="slider"
              tabIndex={0}
              aria-label="Video playback progress"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              onPointerDown={handlePointerDown}
              onPointerMove={(e) => {
                handlePointerHover(e);
                if (isScrubbing) handleSeek(e.clientX);
              }}
              onPointerLeave={handlePointerLeave}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onKeyDown={handleKeyDown}
              className="group/bar relative w-full h-6 flex items-center cursor-pointer select-none touch-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full"
            >
              <div className="relative w-full h-2 group-hover/bar:h-3 transition-[height] duration-200 rounded-full bg-white/25 ring-1 ring-black/40 backdrop-blur-md overflow-hidden">
                <div
                  style={
                    {
                      "--buffer": `${Math.min(100, Math.max(0, buffered * 100))}%`,
                    } as React.CSSProperties
                  }
                  className="absolute inset-y-0 left-0 w-[var(--buffer)] bg-white/35 rounded-full transition-[width] duration-300 pointer-events-none"
                />
                {hoverPosition !== null && (
                  <div
                    style={{ "--hover-pos": `${hoverPosition}%` } as React.CSSProperties}
                    className="absolute inset-y-0 left-0 w-[var(--hover-pos)] bg-purple-300/35 rounded-full pointer-events-none"
                  />
                )}
                <div
                  style={
                    {
                      "--progress": `${progressPercent}%`,
                    } as React.CSSProperties
                  }
                  className="absolute inset-y-0 left-0 w-[var(--progress)] bg-gradient-to-r from-purple-600 via-fuchsia-400 to-amber-300 rounded-full pointer-events-none"
                />
              </div>

              <div
                style={
                  {
                    "--thumb-pos": `${progressPercent}%`,
                  } as React.CSSProperties
                }
                className={`absolute top-1/2 left-[var(--thumb-pos)] -translate-x-1/2 -translate-y-1/2 size-3.5 rounded-full bg-white border-2 border-purple-500 shadow-md transition-transform pointer-events-none ${
                  isScrubbing ? "scale-125" : "scale-100 group-hover/bar:scale-125"
                }`}
              />

              {hoverPosition !== null && hoverTime !== null && (
                <div
                  style={{ "--hover-pos": `${hoverPosition}%` } as React.CSSProperties}
                  className="absolute -top-8 left-[var(--hover-pos)] -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 border border-purple-400/30 text-xs font-mono font-semibold text-white tabular-nums pointer-events-none whitespace-nowrap shadow-lg"
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Bottom Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Left: Play/Pause + Mute/Unmute + Volume Slider + Timecode */}
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/85 px-2 py-1.5 backdrop-blur-xl shadow-xl">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause Video" : "Play Video"}
                  className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-purple-600 cursor-pointer shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="size-3.5" />
                  ) : (
                    <Play className="size-3.5 translate-x-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  aria-pressed={!isMuted}
                  aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
                  className={`flex size-8 items-center justify-center rounded-full transition-colors cursor-pointer shrink-0 ${
                    isMuted
                      ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/50 hover:bg-amber-400 hover:text-zinc-950"
                      : "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                  }`}
                >
                  {isMuted || effectiveVolume === 0 ? (
                    <VolumeX className="size-3.5" />
                  ) : effectiveVolume < 50 ? (
                    <Volume1 className="size-3.5" />
                  ) : (
                    <Volume2 className="size-3.5" />
                  )}
                </button>

                {/* Native Accessible Volume Range Slider */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={effectiveVolume}
                  onChange={handleVolumeChange}
                  aria-label="Video volume"
                  aria-valuetext={isMuted ? "Muted (0 percent)" : `${volume} percent volume`}
                  style={
                    {
                      "--slider-progress": `${effectiveVolume}%`,
                    } as React.CSSProperties
                  }
                  className="media-volume-slider w-16 sm:w-24 shrink-0"
                />

                {/* Always-Visible Current Time / Duration */}
                <div className="flex items-center gap-1 font-mono text-xs font-semibold text-white/85 px-2 tracking-wider tabular-nums select-none">
                  <span className="text-white">{formatTime(currentTime)}</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white/65">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right: List Toggle Button, Layout Mode Switcher, Watch 4K Button, Fullscreen */}
              <div className="flex items-center gap-2">
                {onToggleList && (
                  <button
                    type="button"
                    onClick={onToggleList}
                    aria-label={isListOpen ? "Hide Video List" : "Browse Media List"}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-bold transition-colors backdrop-blur-md cursor-pointer ${
                      isListOpen
                        ? "border-amber-400/80 bg-amber-500/25 text-amber-300 hover:bg-amber-500/35"
                        : "border-white/30 bg-black/80 text-white hover:border-amber-400/70 hover:bg-black/95"
                    }`}
                    title={
                      isListOpen
                        ? "Hide list so nothing overlaps video"
                        : "Open media list overlay"
                    }
                  >
                    <ListVideo className="size-3.5 text-amber-400" />
                    <span>{isListOpen ? "HIDE LIST ▼" : "EXPLORE LIST (70) ▲"}</span>
                  </button>
                )}

                {onToggleFullBleed && (
                  <button
                    type="button"
                    onClick={onToggleFullBleed}
                    aria-label="Toggle Full Bleed vs Boxed Mode"
                    className="hidden md:flex items-center gap-1.5 rounded-full border border-white/20 bg-black/80 hover:bg-white/15 px-3 py-1.5 font-mono text-xs text-white/90 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
                    title="Switch between Full Bleed and Boxed Pill hero video"
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        fullBleed ? "bg-amber-400" : "bg-zinc-400"
                      }`}
                    />
                    <span>{fullBleed ? "FULL BLEED" : "BOXED VIEW"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    ytPlayerRef.current?.pauseVideo?.();
                    setIsCinemaMode(true);
                    emitAudioState(isMutedRef.current, false, true);
                    onCinemaModeChange?.(true);
                  }}
                  aria-label="Toggle Full 4K Video Cinema"
                  className="flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-600/90 hover:bg-red-500 px-3.5 py-1.5 font-mono text-xs font-bold text-white backdrop-blur-md transition-colors cursor-pointer"
                >
                  <Play className="size-3 fill-white" />
                  <span>WATCH 4K</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label="Toggle Fullscreen"
                  className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/80 px-3 py-1.5 font-mono text-xs text-white hover:bg-white/10 backdrop-blur-md transition-colors cursor-pointer"
                >
                  <Maximize2 className="size-3" />
                  <span className="hidden lg:inline">FULLSCREEN</span>
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
}
