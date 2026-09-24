/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

interface Track {
  id: string;
  number: number;
  title: string;
  duration: string;
  audioUrl: string;
}

interface Album {
  id: string;
  title: string;
  subtitle?: string;
  year: string;
  coverImage: string;
  centerLabelColor: string;
  storeUrl: string;
  tracks: Track[];
}

const ALBUMS: Album[] = [
  {
    id: "be-here",
    title: "BE HERE",
    subtitle: "POP MUSIC",
    year: "2021",
    coverImage: "/images/album/Be-Here.png",
    centerLabelColor: "#eab308",
    storeUrl: "/merch",
    tracks: [
      {
        id: "bh1",
        number: 1,
        title: "ARE WE THERE YET",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDElMjBBcmUlMjBXZSUyMFRoZXJlJTIwWWV0Lm1wMw==",
      },
      {
        id: "bh2",
        number: 2,
        title: "COME WHAT MAY",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDIlMjBDb21lJTIwV2hhdCUyME1heS5tcDM=",
      },
      {
        id: "bh3",
        number: 3,
        title: "FOR NEVER AND EVER",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDMlMjBGb3IlMjBOZXZlciUyMGFuZCUyMEV2ZXIubXAz",
      },
      {
        id: "bh4",
        number: 4,
        title: "SUNDRESSES",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDQlMjBTdW5kcmVzc2VzLm1wMw==",
      },
      {
        id: "bh5",
        number: 5,
        title: "AIN'T THAT JUST BEAUTIFUL",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDUlMjBBaW50JTIwVGhhdCUyMEp1c3QlMjBCZWF1dGlmdWwubXAz",
      },
      {
        id: "bh6",
        number: 6,
        title: "MONSTER",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDYlMjBNb25zdGVyLm1wMw==",
      },
      {
        id: "bh7",
        number: 7,
        title: "COUNTRY IN THE CITY",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDclMjBDb3VudHJ5JTIwSW4lMjBUaGUlMjBDaXR5Lm1wMw==",
      },
      {
        id: "bh8",
        number: 8,
        title: "I LOVE THESE DAYS",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDglMjBJJTIwTG92ZSUyMFRoZXNlJTIwRGF5cy5tcDM=",
      },
      {
        id: "bh9",
        number: 9,
        title: "INFINITY AND A DAY",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDklMjBJbmZpbml0eSUyMEFuZCUyMEElMjBEYXkubXAz",
      },
      {
        id: "bh10",
        number: 10,
        title: "LEGENDS",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTAlMjBMZWdlbmRzLm1wMw==",
      },
      {
        id: "bh11",
        number: 11,
        title: "GET BACK UP AGAIN",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTElMjJHZXQlMjBCYWNrJTIwVXAlMjBBZ2Fpbi5tcDM=",
      },
      {
        id: "bh12",
        number: 12,
        title: "TAKE A RIDE OF LIFE",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTIlMjJUYWtlJTIwQSUyMFJpZGUlMjBPZiUyMExpZmUubXAz",
      },
      {
        id: "bh13",
        number: 13,
        title: "SATURDAY NIGHT",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTMlMjJTYXR1cmRheSUyME5pZ2h0Lm1wMw==",
      },
      {
        id: "bh14",
        number: 14,
        title: "I WANNA SEE YOU SHINE",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTQlMjJJJTIwV2FubmElMjBTZWUlMjBZb3UlMjBTaGluZS5tcDM=",
      },
    ],
  },
  {
    id: "color-in-motion",
    title: "COLOR IN MOTION",
    subtitle: "7TH HEAVEN",
    year: "2018",
    coverImage: "/images/album/colot-in-motion.png",
    centerLabelColor: "#ec4899",
    storeUrl: "/merch",
    tracks: [
      {
        id: "cim1",
        number: 1,
        title: "THIS IS WHERE THE PARTY'S AT",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzAxJTIwVGhpcyUyMElzJTIwV2hlcmUlMjBUaGUlMjBQYXJ0eSUyN3MlMjBBdC5tcDM=",
      },
      {
        id: "cim2",
        number: 2,
        title: "WONDERFUL WORLD",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzAyJTIwV29uZGVyZnVsJTIwV29ybGQubXAz",
      },
      {
        id: "cim3",
        number: 3,
        title: "SAY IT ALREADY",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzAzJTIwU2F5JTIwSXQlMjBBbHJlYWR5Lm1wMw==",
      },
      {
        id: "cim4",
        number: 4,
        title: "TIME AND AGAIN",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA0JTIwVGltZSUyMEFuZCUyMEFnYWluLm1wMw==",
      },
      {
        id: "cim5",
        number: 5,
        title: "BETTER LUCK NEXT TIME",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA1JTIwQmV0dGVyJTIwTHVjayUyME5leHQlMjBUaW1lLm1wMw==",
      },
      {
        id: "cim6",
        number: 6,
        title: "I SEE YOU SMILE",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA2JTIwSSUyMFNlZSUyMFlvdSUyMFNtaWxlLm1wMw==",
      },
      {
        id: "cim7",
        number: 7,
        title: "MAKE YOU LOVE ME",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA3JTIwTWFrZSUyMFlvdSUyMExvdmUlMjBNZS5tcDM=",
      },
      {
        id: "cim8",
        number: 8,
        title: "HAPPY NOW",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA4JTIwSGFwcHklMjJOb3cubXAz",
      },
      {
        id: "cim9",
        number: 9,
        title: "PICKING UP THE PIECES",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA5JTIwUGlja2luZyUyMFVwJTIwVGhlJTIwUGllY2VzLm1wMw==",
      },
      {
        id: "cim10",
        number: 10,
        title: "CLOSEST THING",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzEwJTIwQ2xvc2VzdCUyMFRoaW5nLm1wMw==",
      },
    ],
  },
  {
    id: "luminous",
    title: "LUMINOUS",
    subtitle: "7TH HEAVEN",
    year: "2017",
    coverImage: "/images/album/luminous.png",
    centerLabelColor: "#8b5cf6",
    storeUrl: "/merch",
    tracks: [
      {
        id: "lu1",
        number: 1,
        title: "HOME",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wMSUyMEhvbWUubXAz",
      },
      {
        id: "lu2",
        number: 2,
        title: "BEAUTIFUL LIFE",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wMiUyMEJlYXV0aWZ1bCUyMExpZmUubXAz",
      },
      {
        id: "lu3",
        number: 3,
        title: "MIDWEST GIRL IN THE SUMMERTIME",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wMyUyME1pZHdlc3QlMjBHaXJsJTIwaW4lMjB0aGUlMjJTdW1tZXJ0aW1lLm1wMw==",
      },
      {
        id: "lu4",
        number: 4,
        title: "ALWAYS",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNCUyMEFsd2F5cy5tcDM=",
      },
      {
        id: "lu5",
        number: 5,
        title: "IF YOU CHANGE YOUR MIND",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNSUyMklmJTIwWW91JTIwQ2hhbmdlJTIwWW91ciUyME1pbmQubXAz",
      },
      {
        id: "lu6",
        number: 6,
        title: "CONTACT",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNiUyMkNvbnRhY3QubXAz",
      },
      {
        id: "lu7",
        number: 7,
        title: "FORGET ABOUT ME",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNyUyMkZvcmdldCUyMkFib3V0JTIyTWUubXAz",
      },
      {
        id: "lu8",
        number: 8,
        title: "EYES WIDE OPEN",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wOCUyMkV5ZXMlMjJXaWRlJTIyT3Blbi5tcDM=",
      },
      {
        id: "lu9",
        number: 9,
        title: "SO WONDERFUL",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wOSUyMlNvJTIyV29uZGVyZnVsLm1wMw==",
      },
      {
        id: "lu10",
        number: 10,
        title: "SOS",
        duration: "3:30",
        audioUrl:
          "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8xMCUyMlNPUy5tcDM=",
      },
    ],
  },
];

/*--------------------
SoundWaveCanvas
--------------------*/
const lerp = (v0: number, v1: number, t: number) => v0 * (1 - t) + v1 * t;

function SoundWaveCanvas({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ h: 0, amp: 0, rafId: 0, isVisible: true });
  const drawRef = useRef<(time: number) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = stateRef.current.isVisible;
        stateRef.current.isVisible = entry.isIntersecting;
        if (entry.isIntersecting && !wasVisible) {
          cancelAnimationFrame(stateRef.current.rafId);
          stateRef.current.rafId = requestAnimationFrame((ts) =>
            drawRef.current(ts / 1000),
          );
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const draw = useCallback(
    (time: number) => {
      // Stop loop when off-screen, tab hidden, or page transitioning
      if (
        !stateRef.current.isVisible ||
        document.hidden ||
        (typeof window !== "undefined" &&
          (window as unknown as Record<string, boolean>).__pageTransitionActive)
      ) {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const st = stateRef.current;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;

      // settings: width:150, height:6, amplitude:-0.18, speed:5.7
      const targetH = isPlaying ? 6 : 0.8;
      const targetAmp = isPlaying ? Math.abs(-0.18) * Math.PI * 2 : 0.05;
      st.h = lerp(st.h, targetH, 0.055);
      st.amp = lerp(st.amp, targetAmp, 0.055);

      ctx.clearRect(0, 0, W, H);

      const steps = 150;
      const speed = 5.7;

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W;
        const t = time * speed + (i / steps) * st.amp * Math.PI * 2;
        const y = H / 2 - Math.sin(t) * st.h;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = "#d946ef";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      st.rafId = requestAnimationFrame((ts) => drawRef.current(ts / 1000));
    },
    [isPlaying],
  );

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    const st = stateRef.current;
    cancelAnimationFrame(st.rafId);
    st.rafId = requestAnimationFrame((ts) => draw(ts / 1000));
    return () => cancelAnimationFrame(st.rafId);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "24px", height: "24px", display: "block" }}
    />
  );
}

export default function VinylHeroPlayer({
  onAlbumChange,
}: {
  onAlbumChange?: (albumId: string) => void;
}) {
  const [activeAlbumIdx, setActiveAlbumIdx] = useState(0);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showTracklist, setShowTracklist] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [scale, setScale] = useState(1);
  const [isPlayerReady, setIsPlayerReady] = useState(true);
  const [bufferPercent, setBufferPercent] = useState(0);
  const [tracklistScrollPct, setTracklistScrollPct] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const swiperRef = useRef<import("swiper").Swiper | null>(null);

  const handleTracklistScroll = (e: React.UIEvent<HTMLOListElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll > 0) {
      setTracklistScrollPct(
        Math.min(100, Math.max(0, (target.scrollTop / maxScroll) * 100)),
      );
    }
  };

  const updateBufferProgress = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.buffered.length > 0 && audio.duration > 0) {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      const pct = Math.min(
        100,
        Math.round((bufferedEnd / audio.duration) * 100),
      );
      setBufferPercent(pct);
    }
  };

  /* eslint-disable react-doctor/effect-needs-cleanup */
  useEffect(() => {
    // Phase 1: Border box (.fancy) renders FIRST immediately on mount.
    // Phase 2: Albums & MP3 controls smoothly fade in when ready.
    const isPreloading =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("is-preloading");
    const fallbackDelay = isPreloading ? 500 : 350;
    let preloaderDoneTimer: ReturnType<typeof setTimeout> | undefined;

    const timer = setTimeout(() => {
      setIsPlayerReady(true);
    }, fallbackDelay);

    const handlePreloaderDone = () => {
      preloaderDoneTimer = setTimeout(() => setIsPlayerReady(true), 150);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("7h-preloader-done", handlePreloaderDone);
    }

    return () => {
      clearTimeout(timer);
      if (preloaderDoneTimer) clearTimeout(preloaderDoneTimer);
      if (typeof window !== "undefined") {
        window.removeEventListener("7h-preloader-done", handlePreloaderDone);
      }
    };
  }, []);

  /* eslint-disable-next-line react-doctor/effect-needs-cleanup */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const update = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 768) {
          setScale(Math.max(0.45, (window.innerWidth - 40) / 740));
        } else {
          setScale(1);
        }
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Let the global cursor know when a track is actually playing, so it can
  // shrink into the "now playing" (X) badge — see CursorFollower.tsx's
  // "cursor:song-playing" window event listener.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("cursor:song-playing", { detail: isPlaying }),
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("cursor:song-playing", { detail: false }),
      );
    };
  }, [isPlaying]);

  // Auto-pause hero audio track when the viewer scrolls hero completely out of view
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined"
    )
      return;

    const getHero = () =>
      document.getElementById("hero") || document.querySelector(".morph-pick");
    const heroEl = getHero();
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          const audio = audioRef.current;
          if (audio && !audio.paused) {
            audio.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0 },
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  // Whenever the active album or track changes, reload the audio source IF actively playing.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = ALBUMS[activeAlbumIdx]?.tracks[activeTrackIdx]?.audioUrl;
    if (!url) return;

    if (isPlaying) {
      audio.src = url;
      audio.load();
      audio.play().catch(console.warn);
    }
  }, [activeAlbumIdx, activeTrackIdx, isPlaying]);

  useEffect(() => {
    const handleToggleHeroMusic = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying || !audio.paused) {
        audio.pause();
        setIsPlaying(false);
      } else {
        if (!audio.src) {
          const url = ALBUMS[activeAlbumIdx]?.tracks[activeTrackIdx]?.audioUrl;
          if (url) audio.src = url;
        }
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn("Hero audio play failed:", err);
            setIsPlaying(false);
          });
      }
    };
    window.addEventListener("7h-play-hero-music", handleToggleHeroMusic);
    window.addEventListener("7h-toggle-hero-music", handleToggleHeroMusic);
    return () => {
      window.removeEventListener("7h-play-hero-music", handleToggleHeroMusic);
      window.removeEventListener("7h-toggle-hero-music", handleToggleHeroMusic);
    };
  }, [activeAlbumIdx, activeTrackIdx, isPlaying]);

  const currentAlbum = ALBUMS[activeAlbumIdx];
  const currentTrack =
    currentAlbum.tracks[activeTrackIdx] || currentAlbum.tracks[0];

  const loadTrack = (trackIdx: number) => {
    const url = currentAlbum.tracks[trackIdx]?.audioUrl;
    if (!url) return;
    setActiveTrackIdx(trackIdx);
    setProgress(0);
    setCurrentTime("0:00");
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
  };

  const playTrack = (trackIdx: number) => {
    const url = currentAlbum.tracks[trackIdx]?.audioUrl;
    if (!url) return;
    setActiveTrackIdx(trackIdx);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime("0:00");
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying || !audio.paused) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src) {
        const url = ALBUMS[activeAlbumIdx]?.tracks[activeTrackIdx]?.audioUrl;
        if (url) audio.src = url;
      }
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio play failed:", err);
          setIsPlaying(false);
        });
    }
  };

  const prevTrack = () => {
    const idx =
      activeTrackIdx > 0 ? activeTrackIdx - 1 : currentAlbum.tracks.length - 1;
    if (isPlaying) {
      playTrack(idx);
    } else {
      loadTrack(idx);
    }
  };

  const nextTrack = () => {
    const idx =
      activeTrackIdx < currentAlbum.tracks.length - 1 ? activeTrackIdx + 1 : 0;
    if (isPlaying) {
      playTrack(idx);
    } else {
      loadTrack(idx);
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    const newIdx =
      typeof swiper.activeIndex === "number"
        ? swiper.activeIndex
        : swiper.realIndex;
    if (newIdx !== undefined && newIdx !== activeAlbumIdx) {
      setActiveAlbumIdx(newIdx);
      setActiveTrackIdx(0);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime("0:00");
      setDuration("0:00");
      const albumId = ALBUMS[newIdx]?.id ?? "";
      onAlbumChange?.(albumId);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("7h-album-change", { detail: { albumId } }),
        );
      }
      if (audioRef.current) {
        audioRef.current.pause();
        const url = ALBUMS[newIdx]?.tracks[0]?.audioUrl;
        if (url) {
          audioRef.current.src = url;
          audioRef.current.load();
        }
      }
    }
    setIsDragging(false);
  };

  const goToAlbum = (idx: number) => {
    const clamped = Math.max(0, Math.min(ALBUMS.length - 1, idx));
    swiperRef.current?.slideTo(clamped);
    setActiveAlbumIdx(clamped);
    setActiveTrackIdx(0);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime("0:00");
    setDuration("0:00");
    const albumId = ALBUMS[clamped]?.id ?? "";
    onAlbumChange?.(albumId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("7h-album-change", { detail: { albumId } }),
      );
    }
    if (audioRef.current) {
      audioRef.current.pause();
      const url = ALBUMS[clamped]?.tracks[0]?.audioUrl;
      if (url) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    const fmt = (s: number) =>
      `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    const durKnown = isFinite(dur) && !isNaN(dur) && dur > 0;
    if (durKnown) setProgress((cur / dur) * 100);
    setCurrentTime(fmt(cur));
    setDuration(durKnown ? fmt(dur) : "0:00");
  };

  // Fire as soon as the browser knows the duration — before the user presses play
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    const fmt = (s: number) =>
      `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    if (isFinite(dur) && !isNaN(dur) && dur > 0) setDuration(fmt(dur));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const pct = parseFloat(e.target.value);
    const dur = audioRef.current.duration || 0;
    audioRef.current.currentTime = (pct / 100) * dur;
    setProgress(pct);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const unscaledWidth = 777; // 740 * 1.05 (5% bigger)
  const unscaledHeight = 331; // 315 * 1.05 (5% bigger)

  return (
    <div
      className="relative flex hidden items-end justify-end md:flex"
      style={{
        width: scale < 1 ? `${unscaledWidth * scale}px` : `${unscaledWidth}px`,
        height:
          scale < 1 ? `${unscaledHeight * scale}px` : `${unscaledHeight}px`,
      }}
    >
      <div
        className="absolute right-[-11px] bottom-0 select-none"
        style={{
          width: `${unscaledWidth}px`,

          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "bottom right",
        }}
      >
        {/* Hidden Audio — src managed imperatively via useEffect/playTrack, NOT via React src= prop */}
        <audio
          ref={audioRef}
          preload="auto"
          onTimeUpdate={() => {
            handleTimeUpdate();
            updateBufferProgress();
          }}
          onProgress={updateBufferProgress}
          onLoadedMetadata={() => {
            handleLoadedMetadata();
            updateBufferProgress();
          }}
          onEnded={nextTrack}
          onWaiting={() => setIsBuffering(true)}
          onLoadStart={() => setIsBuffering(true)}
          onCanPlay={() => {
            setIsBuffering(false);
            updateBufferProgress();
          }}
          onPlaying={() => setIsBuffering(false)}
          onPause={() => setIsBuffering(false)}
          onError={() => setIsBuffering(false)}
        >
          <track kind="captions" />
        </audio>

        {/* ── SWIPER VINYL DISC SLIDER ── */}
        <div
          className="vinyl-slider-wrap"
          style={{
            width: "777px",
            height: "263px",
            position: "relative",
          }}
        >
          <div className="relative" style={{ width: "777px" }}>
            {/* LAYER 1: Sleeve card background — sits BEHIND the disc — LOADS IMMEDIATELY ON PAGE LOAD */}
            <div className="pointer-events-none absolute inset-0 z-[-1] flex items-center justify-center">
              <div className="fancy h-[263px] w-[293px] rounded-lg shadow-[0_0_40px_rgba(147,51,234,0.25)]">
                <div className="fancy-inner flex items-center justify-center">
                  {!isPlayerReady && (
                    <div className="flex animate-pulse flex-col items-center gap-2 opacity-60">
                      <div className="h-7 w-7 animate-spin rounded-lg border-2 border-purple-400/40 border-t-purple-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LAYER 2 & 3: Vinyl disc track & Controls overlay — REVEALED SMOOTHLY ONCE READY */}
            <div
              className={`transition-all duration-700 ease-out ${isPlayerReady ? "blur-0 pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0 blur-xs"}`}
            >
              {/* LAYER 2: Swiper disc track — wrapped in fade mask so side discs dissolve */}
              <div
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, rgba(0, 0, 0, 0.3) 0%, black 10%, black 100%)",
                  maskImage:
                    "linear-gradient(to right, rgba(0, 0, 0, 0.3) 0%, black 10%, black 100%)",
                }}
              >
                <Swiper
                  slidesPerView="auto"
                  centeredSlides={true}
                  loop={false}
                  initialSlide={activeAlbumIdx}
                  spaceBetween={0}
                  grabCursor={true}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  onSlideChange={handleSlideChange}
                  onSliderFirstMove={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  style={{
                    overflow: "visible",
                    position: "relative",
                    zIndex: 20,
                  }}
                  className="vinyl-swiper"
                >
                  {ALBUMS.map((album, idx) => (
                    <SwiperSlide
                      key={album.id}
                      style={{
                        width: "165px",
                        height: "250px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {({ isActive }) => {
                        const vinylSrc = `/vin${(idx % 3) + 1}.png`;
                        return (
                          <button
                            type="button"
                            className={`relative mx-auto flex cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 p-0 transition-opacity duration-0 ${isActive && !isDragging ? "z-10 scale-110 opacity-100" : "z-0 scale-90 opacity-90"} ${isActive ? "vinyl-spinning" : ""}`}
                            style={{
                              width: "165px",
                              height: "165px",
                              animationPlayState: isActive
                                ? isPlaying
                                  ? "running"
                                  : "paused"
                                : undefined,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isActive) {
                                togglePlay();
                              } else {
                                // Switch to this album and auto-play first track
                                goToAlbum(idx);
                                playTrack(0);
                              }
                            }}
                          >
                            {/* Real vinyl disc image */}
                            <Image
                              src={vinylSrc}
                              alt={`${album.title} vinyl`}
                              fill
                              priority={isActive}
                              fetchPriority={isActive ? "high" : "auto"}
                              sizes="165px"
                              className="rounded-full object-cover"
                            />
                            {/* Center label with album art — sits on top of the vinyl image */}
                            <div className="relative z-10 flex items-center justify-center">
                              <div
                                className="relative h-[60px] w-[60px] overflow-hidden rounded-full border-2 border-purple-400 shadow-[0_0_12px_rgba(234,179,8,0.6)]"
                                style={{
                                  backgroundColor: album.centerLabelColor,
                                }}
                              >
                                <Image
                                  src={album.coverImage}
                                  alt={album.title}
                                  fill
                                  sizes="60px"
                                  className="rounded-full object-cover brightness-110 contrast-105"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-end !rounded-full bg-gradient-to-t via-transparent to-transparent pb-1.5 text-center">
                                  <span className="text-[var(--font-size-5xs)]">
                                    {album.title}
                                  </span>
                                  <span className="mt-0.5 h-2 w-2 rounded-lg border border-black/60 bg-white" />
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      }}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* LAYER 3: Controls overlay — z-30, floats ABOVE the disc */}
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                <div className="pointer-events-none relative flex h-[263px] w-[293px] flex-col justify-between p-4">
                  {/* Bottom: Title + Waveform */}
                  <div className="pointer-events-none mt-auto flex items-end justify-between">
                    <div className="pointer-events-auto flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTracklist((prev) => !prev);
                        }}
                        className="min-w-[130px] cursor-pointer rounded-lg border-0 bg-white px-3 py-1 text-left"
                      >
                        <div className="flex items-center gap-1 text-[12px]">
                          <span className="truncate">{currentAlbum.title}</span>
                          {isBuffering ? (
                            <span className="flex shrink-0 animate-pulse items-center gap-1 rounded-lg border border-[#d946ef]/30 bg-[#d946ef]/15 px-1.5 py-0.5 text-[12px] text-[#d946ef]">
                              <span className="h-2 w-2 animate-spin rounded-lg border border-[#d946ef] border-t-transparent" />
                              LOADING{" "}
                              {bufferPercent > 0 ? `${bufferPercent}%` : "SONG"}
                            </span>
                          ) : (
                            <span className="shrink-0 rounded bg-[var(--color-accent)]/10 px-0.5 text-[10px]">
                              PLAYLIST
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 truncate text-[10px] text-black/70">
                          {currentTrack.title}
                        </div>
                      </button>
                      {/* BUY CD button */}
                      <Link
                        href={currentAlbum.storeUrl}
                        onClick={(e) => e.stopPropagation()}
                        className="! z-10 flex shrink-0 items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-[10px] font-black shadow-[0_0_14px_rgba(147,51,234,0.8)] transition-all hover:bg-purple-500"
                        style={{ color: "#ffffff", fill: "#ffffff" }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="#ffffff"
                          style={{ color: "#ffffff", fill: "#ffffff" }}
                          className="shrink-0"
                        >
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                        </svg>
                        <span
                          style={{ color: "#ffffff" }}
                          className="! font-black"
                        >
                          BUY CD
                        </span>
                      </Link>
                    </div>
                    <SoundWaveCanvas isPlaying={isPlaying} />
                  </div>

                  {/* Progress Scrubber — pinned to very bottom */}
                  <div className="pointer-events-auto mt-2 px-1">
                    <div className="group relative flex h-4 w-full cursor-pointer items-center">
                      {/* Track Background */}
                      <div className="h-1.5 w-full overflow-hidden rounded-lg border border-white/10 bg-white/10 backdrop-blur-[45px] transition-all duration-200 group-hover:bg-white/20">
                        {/* Filled Progress Gradient Bar */}
                        <div
                          className="h-full rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-[#d946ef] shadow-[0_0_10px_rgba(217,70,239,0.8)]"
                          style={{
                            width: `${Math.min(100, Math.max(0, progress))}%`,
                          }}
                        />
                      </div>
                      {/* Glowing Thumb Handle */}
                      <div
                        className="pointer-events-none absolute top-1/2 -ml-2 h-4 w-4 -translate-y-1/2 scale-90 rounded-lg border-2 border-[#d946ef] bg-white shadow-[0_0_12px_#d946ef] transition-transform duration-150 group-hover:scale-125"
                        style={{
                          left: `${Math.min(100, Math.max(0, progress))}%`,
                        }}
                      />
                      {/* Invisible Native Input for 100% accessible dragging/seeking */}
                      <input
                        aria-label="Seek audio position"
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={progress}
                        onChange={handleSeek}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />
                    </div>
                    <div className="mt-0.5 flex justify-between">
                      <span>{currentTime}</span>
                      <span>{duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ── TRACKLIST PANEL — aligned flush with the top of the glass sleeve box ── */}
            <div
              className={`absolute top-0 bottom-0 z-40 flex origin-left flex-col text-left transition-colors duration-500 ease-out ${showTracklist ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
              style={{
                left: "calc(50% + 135px)",
                width: showTracklist ? "220px" : "0px",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex h-full flex-col justify-start overflow-hidden rounded-lg border border-white/10 bg-[#0a00653b] pt-2 backdrop-blur-[45px]">
                {/* Always-Visible Glowing Purple Scrollbar Indicator Track */}
                <div className="pointer-events-none absolute top-[38px] right-1.5 bottom-2 z-50 w-1.5 overflow-hidden rounded-lg border border-white/10 bg-white/10">
                  <div
                    className="w-full rounded-lg bg-gradient-to-b from-white via-white/90 to-white/70 shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-transform duration-75"
                    style={{
                      height: "35%",
                      transform: `translateY(${tracklistScrollPct * 1.3}px)`,
                    }}
                  />
                </div>
                <div className="mb-1.5 flex items-center justify-between border-b border-white/10 px-4 pb-1 whitespace-nowrap">
                  <span className="text-[12px] text-[var(--color-accent)]">
                    {currentAlbum.title} TRACKLIST
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      aria-label="Close tracklist"
                      onClick={() => setShowTracklist(false)}
                      className="cursor-pointer px-1 text-[10px] text-white/50 transition-colors hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <ol
                  className="pointer-events-auto max-h-[200px] scrollbar-none space-y-1 overflow-y-scroll pt-2 pr-3.5 pb-2 text-[12px] whitespace-nowrap [&::-webkit-scrollbar]:hidden"
                  style={{
                    scrollBehavior: "smooth",
                    overscrollBehavior: "contain",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  onScroll={handleTracklistScroll}
                  onWheel={(e) => e.stopPropagation()}
                >
                  {currentAlbum.tracks.map((track, tIdx) => {
                    const isSelected = tIdx === activeTrackIdx;
                    return (
                      <li key={track.id}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(tIdx);
                          }}
                          className={`flex w-full items-center gap-2 !rounded-none border-0 px-3 py-[1px] text-left transition-colors duration-200 ${isSelected ? "cursor-default bg-[var(--color-accent)]/15 text-[var(--color-accent)]" : "cursor-pointer bg-[#00000029] hover:text-white"}`}
                        >
                          <span className="w-4 text-right text-[12px] opacity-50">
                            {track.number}.
                          </span>
                          <span className="flex-1 truncate text-[14px]">
                            {track.title}
                          </span>
                          {isSelected && isPlaying && (
                            <span className="h-2 w-2 animate-pulse bg-[#d946ef]" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
