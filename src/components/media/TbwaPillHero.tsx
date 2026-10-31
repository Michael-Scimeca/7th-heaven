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
import DeltaCafesHeroOverlay from "./DeltaCafesHeroOverlay";
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

export interface TbwaPillHeroHandle {
  playTrackWithSound: (track: VideoTrack) => void;
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
  const [playingYtVideoId, setPlayingYtVideoId] = useState<string | null>(null);
  const [failedPreviewSrc, setFailedPreviewSrc] = useState<string | null>(null);
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  const isPlayingRef = useRef(true);
  const isMutedRef = useRef(true);
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
  const [isPointerIdle, setIsPointerIdle] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Auto-hide hero overlay text & HUD when mouse/pointer stops moving for 2 seconds
  useEffect(() => {
    if (isCinemaMode) return;

    const IDLE_HIDE_DELAY_MS = 2000;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let lastX = -1;
    let lastY = -1;

    const scheduleIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsPointerIdle(true);
      }, IDLE_HIDE_DELAY_MS);
    };

    const wakeOverlay = () => {
      setIsPointerIdle((prev) => (prev ? false : prev));
      scheduleIdle();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.clientX === lastX && e.clientY === lastY) return;
      lastX = e.clientX;
      lastY = e.clientY;
      wakeOverlay();
    };

    scheduleIdle();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", wakeOverlay, { passive: true });
    window.addEventListener("touchstart", wakeOverlay, { passive: true });
    window.addEventListener("keydown", wakeOverlay);

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", wakeOverlay);
      window.removeEventListener("touchstart", wakeOverlay);
      window.removeEventListener("keydown", wakeOverlay);
    };
  }, [isCinemaMode]);

  const activeTrack = externalActiveTrack ?? VIDEO_TRACKS[0];
  const isYtPlaying = Boolean(activeTrack.youtubeId && playingYtVideoId === activeTrack.youtubeId);
  const effectiveVolume = isMuted ? 0 : volume;

  // Helper to format seconds to mm:ss
  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  useEffect(() => {
    onVideoElement?.(videoRef.current);
  }, [onVideoElement, activeTrack.src]);

  const handleYtPlayingState = useEffectEvent(
    (stateCode: number, target: YTPlayerInstance) => {
      const YTState = window.YT?.PlayerState;
      if (YTState && stateCode === YTState.PLAYING) {
        playingYtIdRef.current = loadedYtIdRef.current;
        setPlayingYtVideoId(loadedYtIdRef.current);
        setIsPlaying(true);
        emitAudioState(isMutedRef.current, true, isCinemaModeRef.current);
        if (!isMutedRef.current) {
          target.unMute?.();
          target.setVolume?.(volumeRef.current);
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

  // Pre-warm a single persistent YouTube IFrame API player so clicking Sound / dragging Volume
  // unmutes & starts real synchronized song audio synchronously inside the user gesture.
  useEffect(() => {
    const host = ytHostRef.current;
    if (!host || !activeTrack.youtubeId) return;

    let cancelled = false;
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
            autoplay: isMutedRef.current ? 0 : 1,
            mute: isMutedRef.current ? 1 : 0,
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
                if (!isMutedRef.current && !isCinemaModeRef.current) {
                  e.target.loadVideoById?.(desiredId);
                } else {
                  e.target.cueVideoById?.(desiredId);
                }
              }
              if (!isMutedRef.current && !isCinemaModeRef.current) {
                e.target.unMute?.();
                e.target.setVolume?.(volumeRef.current);
                e.target.playVideo?.();
              }
            },
            onStateChange: (e: { data: number; target: YTPlayerInstance }) => {
              if (cancelled) return;
              handleYtPlayingState(e.data, e.target);
            },
          },
        });
      } catch {
        // Fallback gracefully to native video element
      }
    };

    loadYouTubeAPI(initPlayer);

    return () => {
      cancelled = true;
      ytReadyRef.current = false;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy?.();
        } catch {}
        ytPlayerRef.current = null;
      }
      host.innerHTML = "";
    };
    // Mount persistent YT host once; track switches are handled via loadVideoById / cueVideoById below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch YouTube track seamlessly when activeTrack.youtubeId changes
  useEffect(() => {
    if (!activeTrack.youtubeId) return;
    if (loadedYtIdRef.current === activeTrack.youtubeId) return;
    loadedYtIdRef.current = activeTrack.youtubeId;
    playingYtIdRef.current = null;

    const player = ytPlayerRef.current;
    if (!player || !ytReadyRef.current) return;

    if (!isMutedRef.current && !isCinemaModeRef.current) {
      player.loadVideoById?.(activeTrack.youtubeId);
      player.unMute?.();
      player.setVolume?.(volumeRef.current);
      player.playVideo?.();
    } else {
      player.cueVideoById?.(activeTrack.youtubeId);
    }
  }, [activeTrack.youtubeId]);

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

  // Toggle Video Play / Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;

    if (isYtPlaying && ytPlayerRef.current && ytReadyRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo?.();
        video?.pause();
        setIsPlaying(false);
        emitAudioState(isMutedRef.current, false, isCinemaModeRef.current);
      } else {
        ytPlayerRef.current.playVideo?.();
        video?.play().catch(() => {});
        setIsPlaying(true);
        emitAudioState(isMutedRef.current, true, isCinemaModeRef.current);
      }
      return;
    }

    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          emitAudioState(isMutedRef.current, true, isCinemaModeRef.current);
        })
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      emitAudioState(isMutedRef.current, false, isCinemaModeRef.current);
    }
  }, [emitAudioState, isYtPlaying, isPlaying]);

  // Toggle Mute — synchronously unlocks & plays real song audio via YT.Player
  const toggleMute = useCallback(() => {
    const nextMuted = !isMutedRef.current;
    isMutedRef.current = nextMuted;
    setIsMuted(nextMuted);

    const video = videoRef.current;
    const yt = ytPlayerRef.current;

    if (!nextMuted) {
      // Turning SOUND ON
      const restoredVol =
        volumeRef.current > 0 ? volumeRef.current : lastNonZeroVolumeRef.current || 100;
      volumeRef.current = restoredVol;
      lastNonZeroVolumeRef.current = restoredVol;
      setVolume(restoredVol);

      if (activeTrack.youtubeId && yt && ytReadyRef.current) {
        if (video) {
          video.muted = true;
        }
        yt.unMute?.();
        yt.setVolume?.(restoredVol);
        yt.playVideo?.();
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
      setIsPointerIdle(false);
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
          setIsPlaying(true);
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

  useImperativeHandle(
    ref,
    () => ({
      playTrackWithSound,
    }),
    [playTrackWithSound]
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
        lastNonZeroVolumeRef.current = nextVol;
        const wasMuted = isMutedRef.current;
        if (wasMuted) {
          isMutedRef.current = false;
          setIsMuted(false);
        }

        if (activeTrack.youtubeId && yt && ytReadyRef.current) {
          if (video) {
            video.muted = true;
          }
          yt.unMute?.();
          yt.setVolume?.(nextVol);
          if (wasMuted || playingYtIdRef.current !== activeTrack.youtubeId) {
            yt.playVideo?.();
            setIsPlaying(true);
            emitAudioState(false, true, isCinemaModeRef.current);
          } else {
            emitAudioState(false, isPlayingRef.current, isCinemaModeRef.current);
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
      if (isCinemaMode) return;
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
  const isOverlayHidden =
    isPointerIdle && !isScrubbing && !hasKeyboardFocus && !isCinemaMode;

  return (
    <div
      id="media-hero"
      className={`relative z-10 w-full scroll-mt-24 ${isDeltaHero || fullBleed ? "" : "max-w-[1600px] mx-auto"}`}
    >
      <div
        ref={containerRef}
        onFocusCapture={(e) => {
          if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) {
            setHasKeyboardFocus(true);
          }
        }}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setHasKeyboardFocus(false);
          }
        }}
        className={`relative w-full overflow-hidden flex items-center justify-center bg-black shadow-2xl group fullscreen:max-w-none fullscreen:w-full fullscreen:h-full fullscreen:aspect-auto fullscreen:rounded-none fullscreen:border-0 ${
          isOverlayHidden ? "cursor-none" : ""
        } ${
          isDeltaHero
            ? "h-[93dvh] min-h-[580px] rounded-none border-0"
            : fullBleed
              ? "h-[100dvh] min-h-[100dvh] rounded-none border-0"
              : "aspect-video rounded-[var(--radius-box)] border border-white/10"
        }`}
      >
        {/* Instant 60fps Local Loop Video Layer */}
        <video
          ref={videoRef}
          key={activeTrack.src}
          src={activeTrack.src}
          autoPlay
          playsInline
          muted
          loop
          onPointerUp={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            if (isMutedRef.current || !isPlaying) {
              playTrackWithSound(activeTrack);
            } else {
              toggleMute();
            }
          }}
          onError={() => setFailedPreviewSrc(activeTrack.src)}
          className={`size-full object-cover transition-opacity duration-500 ${
            isOverlayHidden ? "" : "cursor-pointer"
          }`}
        />

        {/* Real Synchronized Song Audio + 4K Video Layer (Active Once Audio/Full Track Unlocked) */}
        <div
          ref={ytHostRef}
          aria-hidden={!showYtLayer}
          className={`pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-300 [&_iframe]:size-full [&_iframe]:scale-105 [&_iframe]:border-0 ${
            showYtLayer ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Subtle Edge Vignette for Contrast & Legibility (Fades out when pointer is idle) */}
        <div
          className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ${
            isOverlayHidden ? "opacity-0" : "opacity-100"
          } ${
            isDeltaHero
              ? "bg-gradient-to-t from-black/70 via-black/20 to-black/35"
              : heroVariant !== 1
                ? "bg-gradient-to-t from-black/85 via-black/35 to-black/60"
                : fullBleed
                  ? "bg-gradient-to-t from-black via-black/20 to-black/50"
                  : "bg-gradient-to-t from-black/80 via-black/15 to-black/45"
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
              onClick={() => {
                setIsCinemaMode(false);
                emitAudioState(isMutedRef.current, isPlayingRef.current, false);
                onCinemaModeChange?.(false);
              }}
              className="absolute top-4 right-4 z-40 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/30 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-md transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3 text-red-400" />
              <span>RETURN TO PREVIEW</span>
            </button>
          </div>
        )}

        {/* All Hero Text & Control Overlays (Auto-hide smoothly when mouse stops moving) */}
        {!isCinemaMode && (
          <div
            data-idle={isOverlayHidden ? "true" : "false"}
            className="hero-idle-fade pointer-events-none absolute inset-0 z-20"
          >
            {/* Delta Cafés Full-Bleed Cinema Hero Overlay (#00 Default) */}
            {isDeltaHero && (
          <DeltaCafesHeroOverlay
            activeTrack={activeTrack}
            tracks={VIDEO_TRACKS}
            onTrackChange={playTrackWithSound}
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
