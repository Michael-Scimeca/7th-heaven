"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { waitForPageReady } from "@/lib/waitForPageReady";
import { useTransition } from "@/context/TransitionContext";
import { Toggle } from "@/components/Toggle";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create("exo", "0.496, 0.004, 0, 1");
  } catch {}
}

const EASE_OPTIONS: { label: string; value: string }[] = [
  { label: "power3.out (Smooth & Recommended)", value: "power3.out" },
  { label: "exo (Exo Ape Custom Curve)", value: "exo" },
  { label: "power2.out (Ultra Smooth)", value: "power2.out" },
  { label: "circ.out (Sharp Initial Burst)", value: "circ.out" },
  { label: "power1.out", value: "power1.out" },
  { label: "power4.out", value: "power4.out" },
  { label: "sine.out", value: "sine.out" },
  { label: "expo.out", value: "expo.out" },
  { label: "back.out(1.2)", value: "back.out(1.2)" },
  { label: "power1.inOut", value: "power1.inOut" },
  { label: "power2.inOut", value: "power2.inOut" },
  { label: "linear", value: "linear" },
];

const ORIGIN_OPTIONS: { label: string; value: string }[] = [
  { label: "center center (Default Middle Pivot)", value: "center center" },
  { label: "top left (0% 0% - Top Left Pivot)", value: "top left" },
  { label: "top right (100% 0% - Top Right Pivot)", value: "top right" },
  { label: "bottom left (0% 100%)", value: "bottom left" },
  { label: "bottom right (100% 100%)", value: "bottom right" },
];

export const CURTAIN_COLORS = [
  { label: "Obsidian", value: "#0d0e13" },
  { label: "Crimson", value: "#1a0810" },
  { label: "Royal Purple", value: "#120822" },
  { label: "Midnight Navy", value: "#070e1c" },
];

export interface TransitionSettings {
  enabled: boolean;
  speedMult: number;
  syncPaths: boolean;
  clipExitPath: boolean;
  clipRevealPath: boolean;
  revealX: number;
  revealY: number;
  revealScale: number;
  revealRotation: number;
  revealOrigin: string;
  revealEase: string;
  revealSlantRatio: number;
  revealFlipSlant: boolean;
  revealDurationOffset: number;
  exitSpeed: number;
  exitX: number;
  exitY: number;
  exitScale: number;
  exitRotation: number;
  exitOrigin: string;
  exitEase: string;
  exitSlantRatio: number;
  exitFlipSlant: boolean;
  curtainColor: string;
}

export const DEFAULT_SETTINGS: TransitionSettings = {
  enabled: true,
  speedMult: 1,
  syncPaths: true,
  clipExitPath: true,
  clipRevealPath: true,
  revealX: 0,
  revealY: 15,
  revealScale: 1.0,
  revealRotation: 0,
  revealOrigin: "center center",
  revealEase: "power3.out",
  revealSlantRatio: 0.04,
  revealFlipSlant: true,
  revealDurationOffset: 0.05,
  exitSpeed: 0.22,
  exitX: 0,
  exitY: 0,
  exitScale: 1.0,
  exitRotation: 0,
  exitOrigin: "center center",
  exitEase: "power3.out",
  exitSlantRatio: 0.04,
  exitFlipSlant: true,
  curtainColor: "#0d0e13",
};

export interface TransitionPreset {
  id: string;
  label: string;
  icon: string;
  desc: string;
  settings: Partial<TransitionSettings>;
}

export const TRANSITION_PRESETS: TransitionPreset[] = [
  {
    id: "snappy",
    label: "Snappy",
    icon: "⚡",
    desc: "0.22s fast responsive sweep",
    settings: {
      exitSpeed: 0.22,
      exitEase: "power3.out",
      exitSlantRatio: 0.04,
      exitFlipSlant: true,
      revealDurationOffset: 0.05,
      revealEase: "power3.out",
      revealSlantRatio: 0.04,
      revealFlipSlant: true,
      revealY: 15,
      revealScale: 1.0,
      syncPaths: true,
    },
  },
  {
    id: "cinematic",
    label: "Cinematic",
    icon: "🌊",
    desc: "0.45s fluid dramatic curve",
    settings: {
      exitSpeed: 0.45,
      exitEase: "exo",
      exitSlantRatio: 0.08,
      exitFlipSlant: true,
      revealDurationOffset: 0.12,
      revealEase: "exo",
      revealSlantRatio: 0.08,
      revealFlipSlant: true,
      revealY: 30,
      revealScale: 0.98,
      syncPaths: true,
    },
  },
  {
    id: "exo",
    label: "Exo Slant",
    icon: "📐",
    desc: "0.32s signature steep angle",
    settings: {
      exitSpeed: 0.32,
      exitEase: "circ.out",
      exitSlantRatio: 0.12,
      exitFlipSlant: true,
      revealDurationOffset: 0.08,
      revealEase: "circ.out",
      revealSlantRatio: 0.12,
      revealFlipSlant: true,
      revealY: 20,
      revealScale: 1.0,
      syncPaths: true,
    },
  },
  {
    id: "flat",
    label: "Flat Sweep",
    icon: "✨",
    desc: "0.26s clean horizontal level wipe",
    settings: {
      exitSpeed: 0.26,
      exitEase: "power2.out",
      exitSlantRatio: 0,
      exitFlipSlant: false,
      revealDurationOffset: 0.05,
      revealEase: "power2.out",
      revealSlantRatio: 0,
      revealFlipSlant: false,
      revealY: 0,
      revealScale: 1.0,
      syncPaths: true,
    },
  },
];

function buildRevealClipPath(
  progress: number,
  ratio: number,
  flip: boolean,
  rampFraction = 0.05,
): string {
  const p = Math.min(1, Math.max(0, progress));
  const mainY = 100 * (1 - p);
  const rampedRatio = ratio * Math.min(1, p / (rampFraction || 1));
  const leadY = mainY / (1 + rampedRatio);
  const leftY = flip ? leadY : mainY;
  const rightY = flip ? mainY : leadY;
  return `polygon(0% ${leftY.toFixed(2)}%, 100% ${rightY.toFixed(2)}%, 100% 100%, 0% 100%)`;
}

function buildExitClipPath(
  progress: number,
  ratio: number,
  flip: boolean,
  rampFraction = 0.05,
): string {
  const p = Math.min(1, Math.max(0, progress));
  const mainY = 100 * (1 - p);
  const rampedRatio = ratio * Math.min(1, p / (rampFraction || 1));
  const leadY = mainY / (1 + rampedRatio);
  const leftY = flip ? leadY : mainY;
  const rightY = flip ? mainY : leadY;
  return `polygon(0% 0%, 100% 0%, 100% ${rightY.toFixed(2)}%, 0% ${leftY.toFixed(2)}%)`;
}

function shouldSkip(settings?: TransitionSettings): boolean {
  if (typeof window === "undefined") return false;
  if (settings && !settings.enabled) return true;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.location.search.includes("bypass=true")
  );
}

async function waitForNewPageContent(
  _container: HTMLElement | null,
): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function pathOf(href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const u = new URL(href);
      return u.pathname;
    } catch {
      return href;
    }
  } else {
    return href.split(/[?#]/)[0];
  }
}

function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  return function (t: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let sampleT = t;
    for (let i = 0; i < 8; i++) {
      const currentX =
        3 * (1 - sampleT) * (1 - sampleT) * sampleT * p1x +
        3 * (1 - sampleT) * sampleT * sampleT * p2x +
        sampleT * sampleT * sampleT -
        t;
      if (Math.abs(currentX) < 0.0001) break;
      const currentSlope =
        3 * (1 - sampleT) * (1 - sampleT) * p1x +
        6 * (1 - sampleT) * sampleT * (p2x - p1x) +
        3 * sampleT * sampleT * (1 - p2x);
      if (Math.abs(currentSlope) < 0.00001) break;
      sampleT -= currentX / currentSlope;
    }
    return (
      3 * (1 - sampleT) * (1 - sampleT) * sampleT * p1y +
      3 * (1 - sampleT) * sampleT * sampleT * p2y +
      sampleT * sampleT * sampleT
    );
  };
}

const EASE_MAP: Record<string, (t: number) => number> = {
  "expo.out": (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  "power3.out": (t) => 1 - Math.pow(1 - t, 3),
  "power2.out": (t) => 1 - Math.pow(1 - t, 2),
  "circ.out": (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  "sine.out": (t) => Math.sin((t * Math.PI) / 2),
  exo: cubicBezier(0.496, 0.004, 0, 1),
  linear: (t) => t,
};

function solveEase(name: string): (t: number) => number {
  return EASE_MAP[name] || EASE_MAP["power3.out"] || ((t) => t);
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, pendingHref, setMode, clearPendingHref, requestTransition } =
    useTransition();

  const outerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isWipingRef = useRef<boolean>(false);
  const coverAnimIdRef = useRef<number>(0);
  const revealAnimIdRef = useRef<number>(0);
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const originPathRef = useRef<string | null>(null);
  const navPushedRef = useRef<string | null>(null);

  // Live tuning settings & persistence
  const [settings, setSettings] =
    useState<TransitionSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<"master" | "exit" | "reveal">(
    "master",
  );
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const settingsRef = useRef<TransitionSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Load saved settings & open state once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("7h_transition_settings_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          const merged = { ...DEFAULT_SETTINGS, ...parsed };
          if (merged.syncPaths) {
            merged.revealEase = merged.exitEase;
            merged.revealSlantRatio = merged.exitSlantRatio;
            merged.revealFlipSlant = merged.exitFlipSlant;
          }
          setSettings(merged);
          settingsRef.current = merged;
        }
      }
    } catch {}

    try {
      if (typeof window !== "undefined") {
        if (window.location.search.includes("tuner=true")) {
          setIsPanelOpen(true);
        } else {
          const savedOpen = localStorage.getItem("7h_transition_tuner_open");
          if (savedOpen === "true") {
            setIsPanelOpen(true);
          }
        }
      }
    } catch {}
  }, []);

  // Keyboard shortcut: Shift + T to toggle the transition controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "T" || e.key === "t") &&
        e.shiftKey &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement)?.tagName || "",
        )
      ) {
        e.preventDefault();
        setIsPanelOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Persist open/closed preference when panel state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "7h_transition_tuner_open",
        isPanelOpen ? "true" : "false",
      );
    } catch {}
  }, [isPanelOpen]);

  const togglePanelOpen = useCallback((open: boolean) => {
    setIsPanelOpen(open);
  }, []);

  const updateSetting = <K extends keyof TransitionSettings>(
    key: K,
    val: TransitionSettings[K],
  ) => {
    const next = { ...settings, [key]: val };
    if (next.syncPaths) {
      if (key === "exitEase") {
        next.revealEase = val as string;
      } else if (key === "exitSlantRatio") {
        next.revealSlantRatio = val as number;
      } else if (key === "exitFlipSlant") {
        next.revealFlipSlant = val as boolean;
      } else if (key === "revealEase") {
        next.exitEase = val as string;
      } else if (key === "revealSlantRatio") {
        next.exitSlantRatio = val as number;
      } else if (key === "revealFlipSlant") {
        next.exitFlipSlant = val as boolean;
      }
    }
    setSettings(next);
    settingsRef.current = next;
    try {
      localStorage.setItem(
        "7h_transition_settings_v1",
        JSON.stringify(next),
      );
    } catch {}
  };

  const applyPreset = (preset: TransitionPreset) => {
    const next = { ...settings, ...preset.settings };
    setSettings(next);
    settingsRef.current = next;
    try {
      localStorage.setItem(
        "7h_transition_settings_v1",
        JSON.stringify(next),
      );
    } catch {}
    triggerReplay();
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    settingsRef.current = DEFAULT_SETTINGS;
    try {
      localStorage.setItem(
        "7h_transition_settings_v1",
        JSON.stringify(DEFAULT_SETTINGS),
      );
    } catch {}
    triggerReplay();
  };

  const triggerReplay = useCallback(() => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "/";
    document
      .querySelectorAll(".exoape-snapshot-outer, .exoape-curtain-overlay")
      .forEach((node) => node.remove());
    document.documentElement.classList.remove("is-page-transitioning");

    clearPendingHref();
    setMode("idle");

    setTimeout(() => {
      requestTransition(currentPath, true);
    }, 40);
  }, [clearPendingHref, requestTransition, setMode]);

  const handleSpeedPreset = (multiplier: number) => {
    const next = { ...settingsRef.current, speedMult: multiplier };
    setSettings(next);
    settingsRef.current = next;
    try {
      localStorage.setItem(
        "7h_transition_settings_v1",
        JSON.stringify(next),
      );
    } catch {}

    setTimeout(() => {
      triggerReplay();
    }, 20);
  };

  const finishTransition = useCallback(() => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (coverAnimIdRef.current) {
      cancelAnimationFrame(coverAnimIdRef.current);
      coverAnimIdRef.current = 0;
    }
    if (revealAnimIdRef.current) {
      cancelAnimationFrame(revealAnimIdRef.current);
      revealAnimIdRef.current = 0;
    }
    if (curtainRef.current) {
      curtainRef.current.remove();
      curtainRef.current = null;
    }
    document
      .querySelectorAll(".exoape-snapshot-outer, .exoape-curtain-overlay")
      .forEach((node) => node.remove());

    document.documentElement.classList.remove("is-page-transitioning");

    if (contentRef.current) {
      contentRef.current.style.transform = "";
    }

    if (typeof window !== "undefined" && (window as any).__lenis) {
      try {
        (window as any).__lenis.start();
        (window as any).__lenis.resize();
      } catch {}
    }

    originPathRef.current = null;
    navPushedRef.current = null;
    isWipingRef.current = false;
    clearPendingHref();
    setMode("idle");
  }, [clearPendingHref, setMode]);

  const startRevealWipeRef = useRef<() => void>(() => {});

  const startRevealWipe = useCallback(() => {
    if (isWipingRef.current) return;
    isWipingRef.current = true;

    const curtain =
      curtainRef.current ||
      document.querySelector<HTMLDivElement>(".exoape-curtain-overlay");
    if (!curtain) {
      finishTransition();
      return;
    }

    const s = settingsRef.current;
    if (!s.clipRevealPath) {
      finishTransition();
      return;
    }

    const baseDuration = Math.max(
      0.05,
      s.exitSpeed + (s.revealDurationOffset ?? 0.05),
    );
    const durationMs = Math.max(
      50,
      Math.round(baseDuration * 1000 * (s.speedMult || 1)),
    );
    const easeFn = solveEase(s.revealEase || "power3.out");
    const startTime = performance.now();

    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    revealTimeoutRef.current = setTimeout(() => {
      finishTransition();
    }, durationMs + 200);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / durationMs));
      const p = easeFn(progress);

      const revealClip = buildExitClipPath(
        p,
        s.revealSlantRatio,
        s.revealFlipSlant,
      );
      curtain.style.clipPath = revealClip;
      (curtain.style as any).webkitClipPath = revealClip;

      // Smooth content easing
      if (contentRef.current && (s.revealY > 0 || s.revealScale !== 1.0)) {
        const remP = 1 - p;
        const curY = (s.revealY || 0) * remP;
        const curScale = 1 - (1 - (s.revealScale || 1.0)) * remP;
        contentRef.current.style.transform = `translate3d(0, ${curY.toFixed(1)}px, 0) scale(${curScale.toFixed(3)})`;
      }

      if (progress < 1) {
        revealAnimIdRef.current = requestAnimationFrame(tick);
      } else {
        finishTransition();
      }
    };

    revealAnimIdRef.current = requestAnimationFrame(tick);
  }, [finishTransition]);

  useEffect(() => {
    startRevealWipeRef.current = startRevealWipe;
  }, [startRevealWipe]);

  // 1. When mode === "covering", animate curtain cover and trigger router.push
  useEffect(() => {
    if (mode !== "covering" || !pendingHref) return;

    if (originPathRef.current === null) {
      originPathRef.current = pathname;
    }

    if (navPushedRef.current === pendingHref) return;
    navPushedRef.current = pendingHref;
    isWipingRef.current = false;

    const s = settingsRef.current;

    if (shouldSkip(s)) {
      document.documentElement.classList.remove("is-page-transitioning");
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch {}
      }
      // eslint-disable-next-line react-doctor/nextjs-no-client-side-redirect
      router.push(pendingHref);
      originPathRef.current = null;
      navPushedRef.current = null;
      isWipingRef.current = false;
      clearPendingHref();
      setMode("idle");
      return;
    }

    document.documentElement.classList.add("is-page-transitioning");

    if (typeof window !== "undefined" && (window as any).__lenis) {
      try {
        (window as any).__lenis.stop();
      } catch {}
    }

    document
      .querySelectorAll(".exoape-curtain-overlay, .exoape-snapshot-outer")
      .forEach((node) => node.remove());

    // Create lightweight GPU curtain overlay
    const curtain = document.createElement("div");
    curtain.className = "exoape-curtain-overlay";
    curtain.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 99999;
      pointer-events: none;
      background-color: ${s.curtainColor || "#0d0e13"};
      will-change: clip-path;
    `;
    document.body.appendChild(curtain);
    curtainRef.current = curtain;

    // Trigger router navigation in parallel
    // eslint-disable-next-line react-doctor/nextjs-no-client-side-redirect
    router.push(pendingHref);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      if ((window as any).__lenis) {
        try {
          (window as any).__lenis.scrollTo(0, { immediate: true });
        } catch {}
      }
    }

    const coverDurationMs = Math.max(
      40,
      Math.round(s.exitSpeed * 1000 * (s.speedMult || 1)),
    );
    const coverEase = solveEase(s.exitEase || "power3.out");
    const coverStart = performance.now();

    const coverTick = (now: number) => {
      const elapsed = now - coverStart;
      const progress = Math.min(1, Math.max(0, elapsed / coverDurationMs));
      const p = coverEase(progress);

      const coverClip = s.clipExitPath
        ? buildRevealClipPath(p, s.exitSlantRatio, s.exitFlipSlant)
        : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
      curtain.style.clipPath = coverClip;
      (curtain.style as any).webkitClipPath = coverClip;

      if (progress < 1) {
        coverAnimIdRef.current = requestAnimationFrame(coverTick);
      } else {
        const cleanPending = pathOf(pendingHref).replace(/\/+$/, "") || "/";
        const cleanCurrent = (pathname || "").replace(/\/+$/, "") || "/";
        const cleanOrigin =
          (originPathRef.current || "").replace(/\/+$/, "") || "/";
        if (cleanCurrent !== cleanOrigin || cleanCurrent === cleanPending) {
          startRevealWipeRef.current();
        } else {
          setTimeout(() => {
            if (mode === "covering" && !isWipingRef.current) {
              startRevealWipeRef.current();
            }
          }, 1500);
        }
      }
    };

    coverAnimIdRef.current = requestAnimationFrame(coverTick);

    return () => {
      if (coverAnimIdRef.current) {
        cancelAnimationFrame(coverAnimIdRef.current);
        coverAnimIdRef.current = 0;
      }
    };
  }, [mode, pendingHref, router, clearPendingHref, setMode, pathname]);

  // 2. When new route mounts, trigger reveal wipe
  useEffect(() => {
    if (mode !== "covering" || !pendingHref) return;
    if (isWipingRef.current) return;

    const cleanPending = pathOf(pendingHref).replace(/\/+$/, "") || "/";
    const cleanCurrent = (pathname || "").replace(/\/+$/, "") || "/";
    const cleanOrigin =
      (originPathRef.current || "").replace(/\/+$/, "") || "/";

    const isRouteChanged =
      originPathRef.current !== null && cleanCurrent !== cleanOrigin;
    const isTargetReached = cleanCurrent === cleanPending;

    if (isRouteChanged || isTargetReached) {
      waitForNewPageContent(contentRef.current).then(() => {
        if (mode === "covering" && !isWipingRef.current) {
          startRevealWipeRef.current();
        }
      });
    }
  }, [mode, pendingHref, pathname]);

  // Global unmount cleanup
  useEffect(() => {
    return () => {
      if (coverAnimIdRef.current) {
        cancelAnimationFrame(coverAnimIdRef.current);
      }
      if (revealAnimIdRef.current) {
        cancelAnimationFrame(revealAnimIdRef.current);
      }
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
      if (curtainRef.current) {
        curtainRef.current.remove();
        curtainRef.current = null;
      }
      document
        .querySelectorAll(".exoape-snapshot-outer, .exoape-curtain-overlay")
        .forEach((node) => node.remove());
      document.documentElement.classList.remove("is-page-transitioning");
    };
  }, []);

  // Failsafe watchdog
  useEffect(() => {
    if (mode === "idle") return;
    const watchdogMs = 3500;
    const id = setTimeout(() => {
      if (coverAnimIdRef.current) {
        cancelAnimationFrame(coverAnimIdRef.current);
        coverAnimIdRef.current = 0;
      }
      if (revealAnimIdRef.current) {
        cancelAnimationFrame(revealAnimIdRef.current);
        revealAnimIdRef.current = 0;
      }
      if (curtainRef.current) {
        curtainRef.current.remove();
        curtainRef.current = null;
      }
      document
        .querySelectorAll(".exoape-snapshot-outer, .exoape-curtain-overlay")
        .forEach((node) => node.remove());
      document.documentElement.classList.remove("is-page-transitioning");
      if (contentRef.current) {
        contentRef.current.style.transform = "";
      }
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch {}
      }
      isWipingRef.current = false;
      clearPendingHref();
      setMode("idle");
    }, watchdogMs);
    return () => clearTimeout(id);
  }, [mode, clearPendingHref, setMode]);

  const requestTransitionRef = useRef(requestTransition);
  useEffect(() => {
    requestTransitionRef.current = requestTransition;
  }, [requestTransition]);

  // Global Link interceptor
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el || el.tagName === "BUTTON" || el.closest("button")) return;
      const target = el.closest<HTMLAnchorElement>("a[href]");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      )
        return;
      if (
        target.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
      )
        return;

      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      if (currentPath.startsWith("/studio") || href.startsWith("/studio"))
        return;

      const cleanHref = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
      const cleanCurrent =
        currentPath.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
      if (cleanHref === cleanCurrent) {
        if (typeof window !== "undefined" && (window as any).__lenis) {
          (window as any).__lenis.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      try {
        router.prefetch(href);
      } catch {}

      e.preventDefault();
      requestTransitionRef.current(href);
    };

    const handleGlobalHover = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!target) return;
      const href = target.getAttribute("href");
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      if (currentPath.startsWith("/studio")) return;
      if (href && href.startsWith("/") && !href.startsWith("/studio")) {
        try {
          router.prefetch(href);
        } catch {}
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    document.addEventListener(
      "mouseover",
      handleGlobalHover as unknown as EventListener,
      { passive: true },
    );
    return () => {
      document.removeEventListener("click", handleGlobalClick, {
        capture: true,
      });
      document.removeEventListener(
        "mouseover",
        handleGlobalHover as unknown as EventListener,
      );
    };
  }, [router]);

  const exitDuration = settings.exitSpeed * settings.speedMult;

  if (pathname?.startsWith("/studio")) {
    return <>{children}</>;
  }

  return (
    <>
      {mode !== "idle" && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[900] bg-transparent pointer-events-none"
        />
      )}
      <div
        ref={outerRef}
        className="exoape-page-outer relative w-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
      >
        <div
          ref={contentRef}
          className="exoape-page-inner transform-gpu w-full [transform-origin:center_center] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
        >
          {children}
        </div>
      </div>

      {/* Floating launcher trigger button */}
      {!isPanelOpen && (
        <button
          type="button"
          onClick={() => togglePanelOpen(true)}
          className="pointer-events-auto fixed right-4 bottom-6 z-[99998] flex items-center gap-2 rounded-full border border-purple-500/40 bg-black/85 px-3.5 py-2 text-xs font-semibold text-purple-300 shadow-[0_4px_24px_rgba(147,51,234,0.35)] backdrop-blur-xl transition-all hover:scale-105 hover:border-purple-400 hover:text-white active:scale-95 select-none"
          title="Open Page Transition Controls (Shift+T)"
          aria-label="Open Page Transition Controls"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                settings.enabled ? "bg-purple-400 animate-ping" : "bg-zinc-500"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                settings.enabled ? "bg-purple-400" : "bg-zinc-500"
              }`}
            />
          </span>
          <span className="tracking-wide">Transitions</span>
          <span className="rounded bg-purple-500/20 px-1.5 py-0.5 font-mono text-[10px] text-purple-300">
            {settings.enabled ? `${settings.speedMult}x` : "OFF"}
          </span>
        </button>
      )}

      {/* Transition Tuner UI Panel */}
      {isPanelOpen && (
        <TransitionTunerPanel
          settings={settings}
          exitDuration={exitDuration}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          updateSetting={updateSetting}
          applyPreset={applyPreset}
          resetDefaults={resetDefaults}
          handleSpeedPreset={handleSpeedPreset}
          triggerReplay={triggerReplay}
          onClose={() => togglePanelOpen(false)}
        />
      )}
    </>
  );
}

interface TransitionTunerPanelProps {
  settings: TransitionSettings;
  exitDuration: number;
  activeTab: "master" | "exit" | "reveal";
  setActiveTab: (val: "master" | "exit" | "reveal") => void;
  updateSetting: <K extends keyof TransitionSettings>(
    key: K,
    val: TransitionSettings[K],
  ) => void;
  applyPreset: (preset: TransitionPreset) => void;
  resetDefaults: () => void;
  handleSpeedPreset: (m: number) => void;
  triggerReplay: () => void;
  onClose: () => void;
}

function TransitionTunerPanel({
  settings,
  exitDuration,
  activeTab,
  setActiveTab,
  updateSetting,
  applyPreset,
  resetDefaults,
  handleSpeedPreset,
  triggerReplay,
  onClose,
}: TransitionTunerPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyJson = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  return (
    <aside
      aria-label="Page transition controls"
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="custom-scrollbar pointer-events-auto fixed right-4 bottom-6 z-[99999] flex max-h-[82vh] w-[350px] max-w-[calc(100vw-32px)] flex-col gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-purple-500/25 bg-black/95 p-4 shadow-[0_12px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-white select-none"
    >
      {/* ── PANEL HEADER ── */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                settings.enabled ? "bg-purple-400 animate-ping" : "bg-zinc-500"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                settings.enabled ? "bg-purple-400" : "bg-zinc-500"
              }`}
            />
          </span>
          <span className="font-semibold text-sm tracking-wide text-white">
            Page Transitions
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyJson}
            title="Copy current settings JSON to clipboard"
            className="transition-colors rounded border border-purple-500/40 bg-purple-950/40 px-2 py-0.5 text-[10px] text-purple-300 hover:border-purple-400 hover:text-white"
          >
            {copied ? "Copied!" : "JSON"}
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            title="Reset all settings to default"
            className="transition-colors rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-white/60 hover:border-white/30 hover:text-white"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close transitions controls"
            className="transition-colors flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm text-white/70 hover:bg-white/15 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>

      {/* ── MASTER ON/OFF SWITCH ── */}
      <div className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-950/20 p-2.5">
        <div>
          <p className="text-xs font-semibold text-white">Transition Effect</p>
          <p className="text-[10px] text-white/50">
            {settings.enabled ? "Active on route changes" : "Instant navigation"}
          </p>
        </div>
        <Toggle
          size="sm"
          checked={settings.enabled}
          onChange={(val) => updateSetting("enabled", val)}
          label="Enable Transitions"
          hideLabel
        />
      </div>

      {/* ── PRESETS BAR ── */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
          Quick Presets
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {TRANSITION_PRESETS.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => applyPreset(p)}
              className="transition-all flex flex-col items-start rounded-lg border border-white/10 bg-white/5 p-2 text-left hover:border-purple-500/50 hover:bg-purple-950/30 active:scale-[0.98]"
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-purple-200">
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </div>
              <span className="text-[9px] text-white/50 leading-tight mt-0.5">
                {p.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── REPLAY BUTTON (INSTANT TEST) ── */}
      <button
        type="button"
        onClick={triggerReplay}
        className="transition-all flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 py-2.5 font-semibold text-xs shadow-lg shadow-purple-900/30 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98]"
      >
        <span>🎬 Test Transition (Replay)</span>
      </button>

      {/* ── SLOW-MO SPEED PRESETS ── */}
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-purple-300">Playback Speed</span>
          <span className="font-mono text-purple-200 font-bold">
            {settings.speedMult}x
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 5, 10].map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => handleSpeedPreset(m)}
              className={`rounded py-1 text-[10px] font-semibold transition-all ${
                settings.speedMult === m
                  ? "bg-purple-600 text-white shadow"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {m}x
            </button>
          ))}
        </div>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={settings.speedMult}
          onChange={(e) =>
            updateSetting("speedMult", parseFloat(e.target.value))
          }
          aria-label="Speed multiplier"
          className="h-1.5 w-full cursor-pointer bg-white/20 accent-purple-500"
        />
      </div>

      {/* ── TAB BAR SWITCHER ── */}
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("master")}
          className={`rounded py-1.5 text-[10px] font-semibold transition-all ${
            activeTab === "master"
              ? "bg-purple-600 text-white shadow"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          ⚡ Master
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("exit")}
          className={`rounded py-1.5 text-[10px] font-semibold transition-all ${
            activeTab === "exit"
              ? "bg-fuchsia-600 text-white shadow"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          📤 Exit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reveal")}
          className={`rounded py-1.5 text-[10px] font-semibold transition-all ${
            activeTab === "reveal"
              ? "bg-cyan-600 text-white shadow"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          📥 Reveal
        </button>
      </div>

      {/* ── TAB CONTENTS ── */}
      {activeTab === "master" && (
        <MasterTabSection
          settings={settings}
          exitDuration={exitDuration}
          updateSetting={updateSetting}
        />
      )}

      {activeTab === "exit" && (
        <ExitTabSection settings={settings} updateSetting={updateSetting} />
      )}

      {activeTab === "reveal" && (
        <RevealTabSection settings={settings} updateSetting={updateSetting} />
      )}
    </aside>
  );
}

interface TabSectionProps {
  settings: TransitionSettings;
  exitDuration?: number;
  updateSetting: <K extends keyof TransitionSettings>(
    key: K,
    val: TransitionSettings[K],
  ) => void;
}

function MasterTabSection({
  settings,
  exitDuration,
  updateSetting,
}: TabSectionProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-purple-500/30 bg-purple-950/25 p-3 text-xs">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-semibold text-purple-300">
          Master Timing & Path
        </span>
        <Toggle
          size="sm"
          checked={settings.syncPaths}
          onChange={(val) => updateSetting("syncPaths", val)}
          label="Lock Exit & Reveal"
        />
      </div>

      {/* Base Duration */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-white/70">Wipe Duration</span>
          <span className="font-mono text-purple-300 font-bold">
            {(exitDuration || 0).toFixed(2)}s
          </span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1.5}
          step={0.02}
          value={settings.exitSpeed}
          onChange={(e) =>
            updateSetting("exitSpeed", parseFloat(e.target.value))
          }
          aria-label="Wipe duration"
          className="h-1.5 w-full cursor-pointer bg-white/20 accent-purple-400"
        />
      </div>

      {/* Easing Dropdown */}
      <div className="flex flex-col gap-1">
        <label htmlFor="master-ease-select" className="text-white/70">
          Easing Curve
        </label>
        <select
          id="master-ease-select"
          value={settings.exitEase}
          onChange={(e) => updateSetting("exitEase", e.target.value)}
          className="focus-ring w-full rounded border border-white/20 bg-black/60 px-2 py-1.5 text-xs text-white"
        >
          {EASE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-black">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Slant Ratio */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-white/70">Slant Ratio</span>
          <span className="font-mono text-purple-300 font-bold">
            {settings.exitSlantRatio.toFixed(3)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={0.25}
          step={0.005}
          value={settings.exitSlantRatio}
          onChange={(e) =>
            updateSetting("exitSlantRatio", parseFloat(e.target.value))
          }
          aria-label="Slant ratio"
          className="h-1.5 w-full cursor-pointer bg-white/20 accent-purple-400"
        />
      </div>

      {/* Slant Direction Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-white/70">Slant Direction</span>
        <Toggle
          size="sm"
          checked={settings.exitFlipSlant}
          onChange={(val) => updateSetting("exitFlipSlant", val)}
          label={settings.exitFlipSlant ? "Left Leads" : "Right Leads"}
        />
      </div>

      {/* Curtain Theme Color */}
      <div className="flex flex-col gap-1.5 border-t border-purple-500/20 pt-2">
        <span className="text-white/70">Curtain Background</span>
        <div className="grid grid-cols-2 gap-1.5">
          {CURTAIN_COLORS.map((c) => (
            <button
              type="button"
              key={c.value}
              onClick={() => updateSetting("curtainColor", c.value)}
              className={`flex items-center gap-2 rounded-lg border p-1.5 text-left text-[11px] transition-all ${
                settings.curtainColor === c.value
                  ? "border-purple-400 bg-purple-900/40 text-white shadow"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/25"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: c.value }}
              />
              <span className="truncate">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExitTabSection({ settings, updateSetting }: TabSectionProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/25 p-3 text-xs">
      <div className="flex items-center justify-between border-b border-fuchsia-500/20 pb-2">
        <span className="font-semibold text-fuchsia-300">
          Old Page Exit Wipe
        </span>
        <Toggle
          size="sm"
          checked={settings.clipExitPath}
          onChange={(val) => updateSetting("clipExitPath", val)}
          label="Enable Exit Wipe"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="exit-ease-select" className="text-fuchsia-200">
          Exit Easing Curve
        </label>
        <select
          id="exit-ease-select"
          value={settings.exitEase}
          onChange={(e) => updateSetting("exitEase", e.target.value)}
          className="focus-ring w-full rounded border border-white/20 bg-black/60 px-2 py-1.5 text-xs text-white"
        >
          {EASE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-black">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-white/70">Exit Slant Ratio</span>
          <span className="font-mono text-fuchsia-300 font-bold">
            {settings.exitSlantRatio.toFixed(3)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={0.25}
          step={0.005}
          value={settings.exitSlantRatio}
          onChange={(e) =>
            updateSetting("exitSlantRatio", parseFloat(e.target.value))
          }
          aria-label="Exit slant ratio"
          className="h-1.5 w-full cursor-pointer bg-white/20 accent-fuchsia-400"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/70">Exit Slant Direction</span>
        <Toggle
          size="sm"
          checked={settings.exitFlipSlant}
          onChange={(val) => updateSetting("exitFlipSlant", val)}
          label={settings.exitFlipSlant ? "Left Leads" : "Right Leads"}
        />
      </div>
    </div>
  );
}

function RevealTabSection({ settings, updateSetting }: TabSectionProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-cyan-500/30 bg-cyan-950/25 p-3 text-xs">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <span className="font-semibold text-cyan-300">
          New Page Reveal Wipe
        </span>
        <Toggle
          size="sm"
          checked={settings.clipRevealPath}
          onChange={(val) => updateSetting("clipRevealPath", val)}
          label="Enable Reveal Wipe"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="reveal-ease-select" className="text-cyan-200">
          Reveal Easing Curve
        </label>
        <select
          id="reveal-ease-select"
          value={settings.revealEase}
          onChange={(e) => updateSetting("revealEase", e.target.value)}
          className="focus-ring w-full rounded border border-white/20 bg-black/60 px-2 py-1.5 text-xs text-white"
        >
          {EASE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-black">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-white/70">Reveal Slant Ratio</span>
          <span className="font-mono text-cyan-300 font-bold">
            {settings.revealSlantRatio.toFixed(3)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={0.25}
          step={0.005}
          value={settings.revealSlantRatio}
          onChange={(e) =>
            updateSetting("revealSlantRatio", parseFloat(e.target.value))
          }
          aria-label="Reveal slant ratio"
          className="h-1.5 w-full cursor-pointer bg-white/20 accent-cyan-400"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/70">Reveal Slant Direction</span>
        <Toggle
          size="sm"
          checked={settings.revealFlipSlant}
          onChange={(val) => updateSetting("revealFlipSlant", val)}
          label={settings.revealFlipSlant ? "Left Leads" : "Right Leads"}
        />
      </div>

      {/* Content Motion */}
      <div className="flex flex-col gap-2 border-t border-cyan-500/20 pt-2">
        <span className="font-semibold text-cyan-300">
          Content Reveal Motion
        </span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Translate Y Offset</span>
            <span className="font-mono text-cyan-300 font-bold">
              {settings.revealY || 0}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={settings.revealY || 0}
            onChange={(e) =>
              updateSetting("revealY", parseFloat(e.target.value))
            }
            aria-label="Reveal Y offset"
            className="h-1.5 w-full cursor-pointer bg-white/20 accent-cyan-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Scale In</span>
            <span className="font-mono text-cyan-300 font-bold">
              {(settings.revealScale || 1.0).toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min={0.92}
            max={1.05}
            step={0.01}
            value={settings.revealScale || 1.0}
            onChange={(e) =>
              updateSetting("revealScale", parseFloat(e.target.value))
            }
            aria-label="Reveal scale"
            className="h-1.5 w-full cursor-pointer bg-white/20 accent-cyan-400"
          />
        </div>
      </div>
    </div>
  );
}
