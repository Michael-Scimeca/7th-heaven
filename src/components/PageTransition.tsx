"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import Logo from "@/components/Logo";
import { buildDecayingSlantClipPath } from "@/lib/curtainClipPath";
import { waitForPageReady } from "@/lib/waitForPageReady";
import { useTransition } from "@/context/TransitionContext";
import { useMember } from "@/context/MemberContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create("exo", "0.496, 0.004, 0, 1");
  } catch { }
}

const EXO_EASE = "exo";
const FAILSAFE_MS = 3000;
const CURTAIN_BG = "transparent";

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

export interface TransitionSettings {
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
}

export const DEFAULT_SETTINGS: TransitionSettings = {
  speedMult: 1,
  syncPaths: true,
  clipExitPath: true,
  clipRevealPath: true,
  revealX: 0,
  revealY: 30,
  revealScale: 1.00,
  revealRotation: 0,
  revealOrigin: "center center",
  revealEase: "circ.out",
  revealSlantRatio: 0.04,
  revealFlipSlant: true,
  revealDurationOffset: 0.1,
  exitSpeed: 0.65,
  exitX: 0,
  exitY: 0,
  exitScale: 1.0,
  exitRotation: 0,
  exitOrigin: "center center",
  exitEase: "circ.out",
  exitSlantRatio: 0.04,
  exitFlipSlant: true,
};

function buildRevealClipPath(
  progress: number,
  ratio: number,
  flip: boolean,
  rampFraction = 0.05
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
  rampFraction = 0.05
): string {
  const p = Math.min(1, Math.max(0, progress));
  const mainY = 100 * (1 - p);
  const rampedRatio = ratio * Math.min(1, p / (rampFraction || 1));
  const leadY = mainY / (1 + rampedRatio);
  const leftY = flip ? leadY : mainY;
  const rightY = flip ? mainY : leadY;
  return `polygon(0% 0%, 100% 0%, 100% ${rightY.toFixed(2)}%, 0% ${leftY.toFixed(2)}%)`;
}

function shouldSkip(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.location.search.includes("bypass=true")
  );
}

async function waitForNewPageContent(container: HTMLElement | null): Promise<void> {
  if (!container) return;

  // 0. Poll for DOM content population (text / elements mounted inside new route, max 500ms)
  const pollStart = performance.now();
  while (performance.now() - pollStart < 500) {
    const textLen = (container.textContent || "").trim().length;
    const childCount = container.children.length;
    if (textLen > 10 || childCount > 1 || container.querySelector("h1, h2, img, video, svg")) {
      break;
    }
    await new Promise((r) => setTimeout(r, 20));
  }

  // 1. Wait for double RAF (React paint commit)
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

  // 2. Wait for hero/above-the-fold images in the new page container to complete loading (max 350ms)
  const images = Array.from(container.querySelectorAll<HTMLImageElement>("img"));
  if (images.length > 0) {
    const uncompleted = images.filter((img) => !img.complete && img.src);
    if (uncompleted.length > 0) {
      await Promise.race([
        Promise.all(
          uncompleted.map(
            (img) =>
              new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
          )
        ),
        new Promise<void>((resolve) => setTimeout(resolve, 350)),
      ]);
    }
  }

  // 3. Wait for hero videos in the container to reach readyState >= 2 (max 300ms)
  const videos = Array.from(container.querySelectorAll<HTMLVideoElement>("video"));
  if (videos.length > 0) {
    const unready = videos.filter((v) => v.readyState < 2);
    if (unready.length > 0) {
      await Promise.race([
        Promise.all(
          unready.map(
            (v) =>
              new Promise<void>((resolve) => {
                const onReady = () => resolve();
                v.addEventListener("loadeddata", onReady, { once: true });
                v.addEventListener("canplay", onReady, { once: true });
                v.addEventListener("error", onReady, { once: true });
              })
          )
        ),
        new Promise<void>((resolve) => setTimeout(resolve, 300)),
      ]);
    }
  }

  // 4. Final double RAF to guarantee hardware compositing stability
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
      const currentX = 3 * (1 - sampleT) * (1 - sampleT) * sampleT * p1x + 3 * (1 - sampleT) * sampleT * sampleT * p2x + sampleT * sampleT * sampleT - t;
      if (Math.abs(currentX) < 0.0001) break;
      const currentSlope = 3 * (1 - sampleT) * (1 - sampleT) * p1x + 6 * (1 - sampleT) * sampleT * (p2x - p1x) + 3 * sampleT * sampleT * (1 - p2x);
      if (Math.abs(currentSlope) < 0.00001) break;
      sampleT -= currentX / currentSlope;
    }
    return 3 * (1 - sampleT) * (1 - sampleT) * sampleT * p1y + 3 * (1 - sampleT) * sampleT * sampleT * p2y + sampleT * sampleT * sampleT;
  };
}

const EASE_MAP: Record<string, (t: number) => number> = {
  "expo.out": (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  "power3.out": (t) => 1 - Math.pow(1 - t, 3),
  "power2.out": (t) => 1 - Math.pow(1 - t, 2),
  "circ.out": (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  "sine.out": (t) => Math.sin((t * Math.PI) / 2),
  "exo": cubicBezier(0.496, 0.004, 0, 1),
  "linear": (t) => t,
};

function solveEase(name: string): (t: number) => number {
  return EASE_MAP[name] || EASE_MAP["expo.out"];
}

function CurtainGradientOverlay({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const startTime = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const render = (now: number) => {
      const t = (now - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Deep Purple Base
      ctx.fillStyle = "#0c0817";
      ctx.fillRect(0, 0, w, h);

      // Node 1: Electric Violet
      const x1 = w * (0.35 + 0.25 * Math.sin(t * 1.8));
      const y1 = h * (0.4 + 0.2 * Math.cos(t * 1.4));
      const r1 = Math.max(w, h) * 0.6;
      const g1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, r1);
      g1.addColorStop(0, "rgba(147, 51, 234, 0.85)");
      g1.addColorStop(0.5, "rgba(133, 15, 183, 0.4)");
      g1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(x1, y1, r1, 0, Math.PI * 2);
      ctx.fill();

      // Node 2: Electric Crimson
      const x2 = w * (0.65 + 0.2 * Math.cos(t * 1.6));
      const y2 = h * (0.6 + 0.25 * Math.sin(t * 1.5));
      const r2 = Math.max(w, h) * 0.55;
      const g2 = ctx.createRadialGradient(x2, y2, 10, x2, y2, r2);
      g2.addColorStop(0, "rgba(255, 10, 61, 0.75)");
      g2.addColorStop(0.6, "rgba(164, 62, 23, 0.3)");
      g2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(x2, y2, r2, 0, Math.PI * 2);
      ctx.fill();

      // Node 3: Neon Cyan
      const x3 = w * (0.5 + 0.3 * Math.sin(t * 1.3 + 1));
      const y3 = h * (0.3 + 0.3 * Math.cos(t * 1.7 + 2));
      const r3 = Math.max(w, h) * 0.5;
      const g3 = ctx.createRadialGradient(x3, y3, 10, x3, y3, r3);
      g3.addColorStop(0, "rgba(6, 182, 212, 0.6)");
      g3.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g3;
      ctx.beginPath();
      ctx.arc(x3, y3, r3, 0, Math.PI * 2);
      ctx.fill();

      // react-doctor-disable-next-line three-prefer-set-animation-loop
      animId = requestAnimationFrame(render);
    };

    // react-doctor-disable-next-line three-prefer-set-animation-loop
    animId = requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[850]"
      style={{ opacity: 0.85 }}
    />
  );
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, pendingHref, setMode, clearPendingHref, requestTransition } = useTransition();

  const outerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const revealStartedForRef = useRef<string | null>(null);
  const tweenRef = useRef<any>(null);
  const contentTweenRef = useRef<any>(null);
  const outgoingTweensRef = useRef<any[]>([]);

  // Live tuning settings & persistence
  const [settings, setSettings] = useState<TransitionSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<"master" | "exit" | "reveal">("master");
  const [showControls, setShowControls] = useState<boolean>(true);
  const settingsRef = useRef<TransitionSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("7h_page_transition_settings_v23");
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
    } catch { }
  }, []);

  const updateSetting = <K extends keyof TransitionSettings>(key: K, val: TransitionSettings[K]) => {
    let next = { ...settings, [key]: val };
    if (next.syncPaths) {
      if (key === "exitSpeed") {
        // base duration sync
      } else if (key === "exitEase") {
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
      localStorage.setItem("7h_page_transition_settings_v18", JSON.stringify(next));
    } catch { }
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    settingsRef.current = DEFAULT_SETTINGS;
    try {
      localStorage.setItem("7h_page_transition_settings_v18", JSON.stringify(DEFAULT_SETTINGS));
    } catch { }
  };

  const triggerReplay = useCallback(() => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
    document.querySelectorAll(".exoape-snapshot-outer").forEach((node) => node.remove());
    document.documentElement.classList.remove("is-page-transitioning");

    clearPendingHref();
    setMode("idle");

    setTimeout(() => {
      requestTransition(currentPath);
    }, 40);
  }, [clearPendingHref, requestTransition, setMode]);

  const handleSpeedPreset = (multiplier: number) => {
    const next = { ...settingsRef.current, speedMult: multiplier };
    setSettings(next);
    settingsRef.current = next;
    try {
      localStorage.setItem("7h_page_transition_settings_v16", JSON.stringify(next));
    } catch { }

    setTimeout(() => {
      triggerReplay();
    }, 20);
  };

  const navPushedRef = useRef<string | null>(null);

  // 1. When mode === "covering", snapshot old page and trigger router.push
  useEffect(() => {
    if (mode !== "covering" || !pendingHref) return;

    if (navPushedRef.current === pendingHref) return;
    navPushedRef.current = pendingHref;

    document.documentElement.classList.add("is-page-transitioning");

    if (typeof window !== "undefined" && (window as any).__lenis) {
      try {
        (window as any).__lenis.stop();
      } catch { }
    }

    if (shouldSkip()) {
      document.documentElement.classList.remove("is-page-transitioning");
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch { }
      }
      // eslint-disable-next-line react-doctor/nextjs-no-client-side-redirect
      router.push(pendingHref);
      clearPendingHref();
      setMode("idle");
      return;
    }

    document.querySelectorAll(".exoape-snapshot-outer").forEach((node) => node.remove());

    const s = settingsRef.current;

    const snapshotOuter = document.createElement("div");
    snapshotOuter.className = "exoape-snapshot-outer";
    snapshotOuter.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 1;
      pointer-events: none;
      overflow: hidden;
      background-color: ${CURTAIN_BG};
    `;

    const snapshotInner = document.createElement("div");
    snapshotInner.className = "exoape-snapshot-inner";
    snapshotInner.style.cssText = `
      width: 100%;
      min-height: 100vh;
      transform-origin: ${s.exitOrigin || "center center"};
    `;

    const snapshotOverlay = document.createElement("div");
    snapshotOverlay.className = "exoape-snapshot-overlay";
    snapshotOverlay.style.cssText = `
      position: absolute;
      inset: 0;
      z-index: 10;
      background-color: rgba(13, 14, 19, 0.45);
      pointer-events: none;
      opacity: 0;
    `;

    if (contentRef.current) {
      const clone = contentRef.current.cloneNode(true) as HTMLElement;
      clone.style.transform = "none";
      clone.querySelectorAll("iframe").forEach((iframe) => iframe.remove());
      const origVideos = Array.from(contentRef.current.querySelectorAll("video"));
      clone.querySelectorAll("video").forEach((v, idx) => {
        const orig = origVideos[idx];
        if (orig) {
          try {
            v.currentTime = orig.currentTime;
            v.muted = true;
            v.autoplay = true;
            v.playsInline = true;
            v.setAttribute("autoplay", "");
            v.setAttribute("muted", "");
            v.setAttribute("playsinline", "");
            v.play().catch(() => { });
          } catch { }
        }
      });
      snapshotInner.appendChild(clone);
    }
    snapshotOuter.appendChild(snapshotInner);
    snapshotOuter.appendChild(snapshotOverlay);
    document.body.appendChild(snapshotOuter);

    // Pre-apply clip-path synchronously BEFORE router.push
    snapshotOuter.style.clipPath = "none";
    (snapshotOuter.style as any).webkitClipPath = "none";

    if (outerRef.current) {
      outerRef.current.style.willChange = "clip-path";
      outerRef.current.style.position = "relative";
      outerRef.current.style.zIndex = "900";
      const initialRevealClip = s.clipRevealPath
        ? buildRevealClipPath(0, s.revealSlantRatio, s.revealFlipSlant)
        : "none";
      outerRef.current.style.clipPath = initialRevealClip;
      (outerRef.current.style as any).webkitClipPath = initialRevealClip;
    }

    // eslint-disable-next-line react-doctor/nextjs-no-client-side-redirect
    router.push(pendingHref);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }
  }, [mode, pendingHref, router, clearPendingHref, setMode]);

  // 2. Start the synchronized wipe animation ONLY when the new page is ready (or after short fallback)
  useEffect(() => {
    if (mode !== "covering" || !pendingHref) return;

    const targetPath = pathOf(pendingHref);
    const isNewPageLoaded = pathname === targetPath || pathOf(pathname) === targetPath;

    let animStarted = false;
    let animId = 0;
    let fallbackTimer: ReturnType<typeof setTimeout>;

    const startAnimation = () => {
      if (animStarted) return;
      animStarted = true;

      const snapshotOuter = document.querySelector(".exoape-snapshot-outer") as HTMLElement | null;
      const snapshotInner = snapshotOuter?.querySelector(".exoape-snapshot-inner") as HTMLElement | null;
      const snapshotOverlay = snapshotOuter?.querySelector(".exoape-snapshot-overlay") as HTMLElement | null;

      const s = settingsRef.current;
      const durationMs = s.exitSpeed * s.speedMult * 1000;
      const easeFn = solveEase(s.exitEase);
      const initialScrollY = typeof window !== "undefined" ? window.scrollY : 0;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, Math.max(0, elapsed / durationMs));
        const p = easeFn(progress);

        if (snapshotOuter) {
          const exitClip = s.clipExitPath
            ? buildExitClipPath(p, s.exitSlantRatio, s.exitFlipSlant)
            : "none";
          snapshotOuter.style.clipPath = exitClip;
          (snapshotOuter.style as any).webkitClipPath = exitClip;
        }

        if (snapshotInner) {
          const curX = (s.exitX || 0) * p;
          const curY = -initialScrollY + (s.exitY || 0) * p;
          const curScale = 1 + ((s.exitScale || 1.1) - 1) * p;
          const curRot = (s.exitRotation || 0) * p;
          const curOpacity = 1 - p;

          snapshotInner.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0px) scale(${curScale.toFixed(3)}) rotate(${curRot.toFixed(2)}deg)`;
          snapshotInner.style.opacity = curOpacity.toFixed(3);
        }

        if (snapshotOverlay) {
          snapshotOverlay.style.opacity = (0.3 * p).toFixed(3);
        }

        if (outerRef.current) {
          const revealClip = s.clipRevealPath
            ? buildRevealClipPath(p, s.revealSlantRatio, s.revealFlipSlant)
            : "none";
          outerRef.current.style.clipPath = revealClip;
          (outerRef.current.style as any).webkitClipPath = revealClip;
        }

        if (contentRef.current) {
          const remP = 1 - p;
          const curY = (s.revealY ?? 100) * remP;
          const curRot = (s.revealRotation ?? 4) * remP;
          const curX = (s.revealX || 0) * remP;
          const curScale = 1 + ((s.revealScale || 1.0) - 1) * remP;

          contentRef.current.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0px) scale(${curScale.toFixed(3)}) rotate(${curRot.toFixed(2)}deg)`;
          contentRef.current.style.opacity = "1";
        }

        if (progress < 1) {
          animId = requestAnimationFrame(tick);
        } else {
          if (snapshotOuter && snapshotOuter.parentNode) {
            snapshotOuter.parentNode.removeChild(snapshotOuter);
          }
          document.documentElement.classList.remove("is-page-transitioning");

          requestAnimationFrame(() => {
            if (outerRef.current) {
              outerRef.current.style.clipPath = "";
              (outerRef.current.style as any).webkitClipPath = "";
              outerRef.current.style.willChange = "";
              outerRef.current.style.zIndex = "";
            }
            if (contentRef.current) {
              contentRef.current.style.transform = "";
              contentRef.current.style.opacity = "";
              contentRef.current.style.willChange = "";
              contentRef.current.style.transformOrigin = "";
            }
          });

          if (typeof window !== "undefined" && (window as any).__lenis) {
            try {
              (window as any).__lenis.start();
              (window as any).__lenis.resize();
            } catch { }
          }

          navPushedRef.current = null;
          revealStartedForRef.current = null;
          clearPendingHref();
          setMode("idle");
        }
      };

      animId = requestAnimationFrame(tick);
    };

    if (isNewPageLoaded) {
      waitForNewPageContent(contentRef.current).then(startAnimation);
    } else {
      fallbackTimer = setTimeout(() => {
        waitForNewPageContent(contentRef.current).then(startAnimation);
      }, 2500);
    }

    return () => {
      clearTimeout(fallbackTimer);
      cancelAnimationFrame(animId);
    };
  }, [mode, pendingHref, pathname, clearPendingHref, setMode]);



  useEffect(() => {
    if (mode === "idle") return;
    const s = settingsRef.current;
    const watchdogMs = Math.max(FAILSAFE_MS, (s.exitSpeed + (s.exitSpeed + 0.25)) * s.speedMult * 1000 + 5000);
    const id = setTimeout(() => {
      tweenRef.current?.kill();
      contentTweenRef.current?.kill();
      outgoingTweensRef.current.forEach((t) => t.kill());
      outgoingTweensRef.current = [];
      document.querySelectorAll(".exoape-snapshot-inner, .exoape-snapshot-overlay").forEach((el) => {
        gsap.killTweensOf(el);
      });
      document.querySelectorAll(".exoape-snapshot-outer").forEach((node) => node.remove());
      document.documentElement.classList.remove("is-page-transitioning");
      if (outerRef.current) {
        outerRef.current.style.position = "";
        outerRef.current.style.inset = "";
        outerRef.current.style.zIndex = "";
        outerRef.current.style.overflow = "";
        outerRef.current.style.clipPath = "";
        (outerRef.current.style as any).webkitClipPath = "";
        outerRef.current.style.willChange = "";
      }
      if (contentRef.current) {
        gsap.set(contentRef.current, { clearProps: "all" });
      }
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch { }
      }
      revealStartedForRef.current = null;
      clearPendingHref();
      setMode("idle");
    }, watchdogMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Safari WebKit Resize Fix: Ensure container styles reset cleanly on resize
  useEffect(() => {
    const handleResize = () => {
      if (mode === "idle") {
        if (outerRef.current) {
          outerRef.current.style.clipPath = "";
          (outerRef.current.style as any).webkitClipPath = "";
          outerRef.current.style.willChange = "";
        }
        if (contentRef.current) {
          contentRef.current.style.transform = "";
          contentRef.current.style.willChange = "";
        }
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [mode]);

  const requestTransitionRef = useRef(requestTransition);
  useEffect(() => {
    requestTransitionRef.current = requestTransition;
  }, [requestTransition]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el || el.tagName === "BUTTON" || el.closest("button")) return;
      const target = el.closest<HTMLAnchorElement>("a[href]");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
      if (target.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (currentPath.startsWith("/studio") || href.startsWith("/studio")) return;
      if (href === currentPath) return;

      try {
        router.prefetch(href);
      } catch { }

      e.preventDefault();
      requestTransitionRef.current(href);
    };

    const handleGlobalHover = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLAnchorElement>("a[href]");
      if (!target) return;
      const href = target.getAttribute("href");
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (currentPath.startsWith("/studio")) return;
      if (href && href.startsWith("/") && !href.startsWith("/studio")) {
        try {
          router.prefetch(href);
        } catch { }
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    document.addEventListener("mouseover", handleGlobalHover as unknown as EventListener, { passive: true });
    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
      document.removeEventListener("mouseover", handleGlobalHover as unknown as EventListener);
    };
  }, [router]);

  const revealOffset = settings.revealDurationOffset !== undefined ? settings.revealDurationOffset : 0.25;
  const revealDuration = (settings.exitSpeed + revealOffset) * settings.speedMult;
  const exitDuration = settings.exitSpeed * settings.speedMult;

  if (pathname?.startsWith("/studio")) {
    return <>{children}</>;
  }

  return (
    <>
      {mode !== "idle" && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 900,
            backgroundColor: CURTAIN_BG,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        ref={outerRef}
        className="exoape-page-outer"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}>
        <div
          ref={contentRef}
          className="exoape-page-inner transform-gpu"
          style={{
            width: "100%",
            minHeight: "100vh",
            transformOrigin: "center center",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}>
          {children}
        </div>
      </div>

      <TransitionTunerPanel
        settings={settings}
        exitDuration={exitDuration}
        showControls={showControls}
        activeTab={activeTab}
        setShowControls={setShowControls}
        setActiveTab={setActiveTab}
        updateSetting={updateSetting}
        resetDefaults={resetDefaults}
        handleSpeedPreset={handleSpeedPreset}
        triggerReplay={triggerReplay}
      />
    </>
  );
}

interface TransitionTunerPanelProps {
  settings: TransitionSettings;
  exitDuration: number;
  showControls: boolean;
  activeTab: "master" | "exit" | "reveal";
  setShowControls: (val: boolean) => void;
  setActiveTab: (val: "master" | "exit" | "reveal") => void;
  updateSetting: <K extends keyof TransitionSettings>(key: K, val: TransitionSettings[K]) => void;
  resetDefaults: () => void;
  handleSpeedPreset: (m: number) => void;
  triggerReplay: () => void;
}

function TransitionTunerPanel({
  settings,
  exitDuration,
  showControls,
  activeTab,
  setShowControls,
  setActiveTab,
  updateSetting,
  resetDefaults,
  handleSpeedPreset,
  triggerReplay,
}: TransitionTunerPanelProps) {
  const pathname = usePathname();
  const { member } = useMember();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      if (search.includes("tuner=false")) {
        setIsVisible(false);
        return;
      }
      const isRoleAdmin = member?.role === "admin";
      const isPathAdmin = pathname?.startsWith("/admin");
      const isCookieAdmin = document.cookie.includes("admin_authenticated=true");
      const isQueryAdmin = search.includes("tuner=true") || search.includes("admin=true");

      if (isRoleAdmin || isPathAdmin || isCookieAdmin || isQueryAdmin) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  }, [member, pathname]);

  if (!isVisible) return null;

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed bottom-20 right-4 z-[99999] flex flex-col gap-2 rounded-2xl border border-white/20 bg-black/95 p-3.5   backdrop-blur-md text-white text-xs select-none pointer-events-auto max-w-[320px] w-[320px] max-h-[75vh] overflow-y-auto overscroll-contain custom-scrollbar">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 r uppercase text-[11px] text-purple-400">
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          Transition Tuner UI
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
                alert("Transition settings copied to clipboard! Share this JSON with me to save permanently in code.");
              }
            }}
            title="Copy current settings JSON to clipboard"
            className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400 transition bg-purple-950/40">
            Copy JSON
          </button>
          <button
            onClick={resetDefaults}
            title="Reset all settings to default"
            className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition bg-white/5">
            Reset
          </button>
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-600/30 transition bg-purple-950/40">
            {showControls ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {showControls && (
        <div className="flex flex-col gap-3 pt-1">
          {/* ── TAB BAR SWITCHER ── */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
            <button
              onClick={() => setActiveTab("master")}
              className={`py-1.5 rounded-lg text-[10px]    uppercase  r transition ${activeTab === "master"
                ? "bg-purple-600 text-white shadow"
                : "text-white/60 hover:text-white hover:bg-white/5"
                }`}>
              ⚡ Master
            </button>
            <button
              onClick={() => setActiveTab("exit")}
              className={`py-1.5 rounded-lg text-[10px]    uppercase  r transition ${activeTab === "exit"
                ? "bg-fuchsia-600 text-white shadow"
                : "text-white/60 hover:text-white hover:bg-white/5"
                }`}>
              📤 Exit Path
            </button>
            <button
              onClick={() => setActiveTab("reveal")}
              className={`py-1.5 rounded-lg text-[10px]    uppercase  r transition ${activeTab === "reveal"
                ? "bg-cyan-600 text-white shadow"
                : "text-white/60 hover:text-white hover:bg-white/5"
                }`}>
              📥 Reveal Path
            </button>
          </div>

          {/* ── TAB 1: MASTER PATH & TIMING ── */}
          {activeTab === "master" && (
            <MasterTabSection settings={settings} exitDuration={exitDuration} updateSetting={updateSetting} />
          )}

          {/* ── TAB 2: OLD PAGE EXIT PATH & MOTION ── */}
          {activeTab === "exit" && (
            <ExitTabSection settings={settings} updateSetting={updateSetting} />
          )}

          {/* ── TAB 3: NEW PAGE REVEAL PATH & MOTION ── */}
          {activeTab === "reveal" && (
            <RevealTabSection settings={settings} updateSetting={updateSetting} />
          )}

          {/* ── SLOW-MO SPEED & REPLAY SECTION (ALWAYS VISIBLE) ── */}
          <div className="flex flex-col gap-2 rounded-xl border border-purple-500/20 bg-purple-950/20 p-3">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-white/70 uppercase r text-[10px] text-purple-400">Slow-Mo Speed</span>
              <strong className="text-purple-300">{settings.speedMult}x</strong>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2.5, 5, 10].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSpeedPreset(m)}
                  className={`flex-1 py-1 rounded text-[10px]    font-mono transition ${settings.speedMult === m
                    ? "bg-purple-600 text-white shadow ring-1 ring-purple-300 ring-offset-1 ring-offset-black font-extrabold"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}>
                  {m}x
                </button>
              ))}
            </div>

            <input
              type="range"
              min={0.5}
              max={15}
              step={0.5}
              value={settings.speedMult}
              onChange={(e) => updateSetting("speedMult", parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-white/20 rounded-lg"
            />

            <button
              onClick={triggerReplay}
              className="w-full    py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] uppercase r    transition active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer">
              <span>🎬 Replay Transition ({settings.speedMult}x)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface TabSectionProps {
  settings: TransitionSettings;
  exitDuration?: number;
  updateSetting: <K extends keyof TransitionSettings>(key: K, val: TransitionSettings[K]) => void;
}

function MasterTabSection({ settings, exitDuration, updateSetting }: TabSectionProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-purple-500/30 bg-purple-950/30 p-3">
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
        <p className="text-[11px] uppercase tracking-[0.15em] text-purple-300">
          Master Path & Sync
        </p>
        <span className="text-[9px] font-mono text-purple-400 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-500/30">
          {settings.syncPaths ? "Paths Synced" : "Paths Independent"}
        </span>
      </div>

      <label className="flex items-center gap-2 text-[11px] text-purple-200 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={settings.syncPaths}
          onChange={(e) => updateSetting("syncPaths", e.target.checked)}
          className="accent-purple-400 rounded"
        />
        <span>Lock Exit & Reveal Paths (1:1 Sync)</span>
      </label>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-500/15">
        <label className="flex items-center gap-1.5 text-[10px] text-white/80 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.clipExitPath}
            onChange={(e) => updateSetting("clipExitPath", e.target.checked)}
            className="accent-purple-400 rounded"
          />
          <span>Clip Exit Path</span>
        </label>
        <label className="flex items-center gap-1.5 text-[10px] text-white/80 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.clipRevealPath}
            onChange={(e) => updateSetting("clipRevealPath", e.target.checked)}
            className="accent-purple-400 rounded"
          />
          <span>Clip Reveal Path</span>
        </label>
      </div>

      <div className="flex items-center justify-between text-[11px] pt-1">
        <span className="text-white/70">Base duration</span>
        <span className="font-mono text-purple-300">{(exitDuration || 0).toFixed(2)}s</span>
      </div>
      <input
        type="range"
        min={0.2}
        max={3.0}
        step={0.05}
        value={settings.exitSpeed}
        onChange={(e) => updateSetting("exitSpeed", parseFloat(e.target.value))}
        className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="master-ease-select" className="text-[11px] text-white/70">
          Transition easing
        </label>
        <select
          id="master-ease-select"
          value={settings.exitEase}
          onChange={(e) => updateSetting("exitEase", e.target.value)}
          className="w-full rounded border border-white/20 bg-black/60 px-2 py-1 text-white text-[11px] focus:outline-none focus:border-purple-400">
          {EASE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-black text-white">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Slant ratio</span>
        <span className="font-mono text-purple-300">{settings.exitSlantRatio.toFixed(3)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={0.3}
        step={0.005}
        value={settings.exitSlantRatio}
        onChange={(e) => updateSetting("exitSlantRatio", parseFloat(e.target.value))}
        className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <label className="flex items-center gap-2 text-[11px] text-white/80 cursor-pointer pt-0.5 select-none">
        <input
          type="checkbox"
          checked={settings.exitFlipSlant}
          onChange={(e) => updateSetting("exitFlipSlant", e.target.checked)}
          className="accent-purple-400 rounded"
        />
        <span>Flip slant direction {settings.exitFlipSlant ? "(left leads)" : "(right leads)"}</span>
      </label>
    </div>
  );
}

function ExitTabSection({ settings, updateSetting }: TabSectionProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.15em] text-fuchsia-400 border-b border-fuchsia-500/20 pb-1.5">
        Old Page Exit Controls
      </p>

      <label className="flex items-center gap-2 text-[11px] text-fuchsia-200 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={settings.clipExitPath}
          onChange={(e) => updateSetting("clipExitPath", e.target.checked)}
          className="accent-fuchsia-400 rounded"
        />
        <span>Enable Old Page Clip Path</span>
      </label>

      <div className="flex flex-col gap-1">
        <label htmlFor="exit-ease-select" className="text-[11px] text-white/70">
          Exit easing curve
        </label>
        <select
          id="exit-ease-select"
          value={settings.exitEase}
          onChange={(e) => updateSetting("exitEase", e.target.value)}
          className="w-full rounded border border-white/20 bg-black/60 px-2 py-1 text-white text-[11px] focus:outline-none focus:border-fuchsia-400">
          {EASE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-black text-white">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Exit slant ratio</span>
        <span className="font-mono text-fuchsia-300">{settings.exitSlantRatio.toFixed(3)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={0.3}
        step={0.005}
        value={settings.exitSlantRatio}
        onChange={(e) => updateSetting("exitSlantRatio", parseFloat(e.target.value))}
        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Exit scale</span>
        <span className="font-mono text-fuchsia-300">{settings.exitScale.toFixed(2)}x</span>
      </div>
      <input
        type="range"
        min={1}
        max={2}
        step={0.05}
        value={settings.exitScale}
        onChange={(e) => updateSetting("exitScale", parseFloat(e.target.value))}
        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Exit X translation</span>
        <span className="font-mono text-fuchsia-300">{settings.exitX || 0}px</span>
      </div>
      <input
        type="range"
        min={-300}
        max={300}
        step={5}
        value={settings.exitX || 0}
        onChange={(e) => updateSetting("exitX", parseFloat(e.target.value))}
        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Exit Y translation</span>
        <span className="font-mono text-fuchsia-300">{settings.exitY || 0}px</span>
      </div>
      <input
        type="range"
        min={-300}
        max={300}
        step={5}
        value={settings.exitY || 0}
        onChange={(e) => updateSetting("exitY", parseFloat(e.target.value))}
        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Exit rotation</span>
        <span className="font-mono text-fuchsia-300">{settings.exitRotation}°</span>
      </div>
      <input
        type="range"
        min={-45}
        max={45}
        step={1}
        value={settings.exitRotation}
        onChange={(e) => updateSetting("exitRotation", parseFloat(e.target.value))}
        className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="exit-origin-select" className="text-[11px] text-white/70">
          Exit pivot origin
        </label>
        <select
          id="exit-origin-select"
          value={settings.exitOrigin}
          onChange={(e) => updateSetting("exitOrigin", e.target.value)}
          className="w-full rounded border border-white/20 bg-black/60 px-2 py-1 text-white text-[11px] focus:outline-none focus:border-fuchsia-400">
          {ORIGIN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-black text-white">
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function RevealTabSection({ settings, updateSetting }: TabSectionProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.15em] text-cyan-400 border-b border-cyan-500/20 pb-1.5">
        New Page Reveal Controls
      </p>

      <label className="flex items-center gap-2 text-[11px] text-cyan-200 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={settings.clipRevealPath}
          onChange={(e) => updateSetting("clipRevealPath", e.target.checked)}
          className="accent-cyan-400 rounded"
        />
        <span>Enable New Page Clip Path</span>
      </label>

      <div className="flex flex-col gap-1">
        <label htmlFor="reveal-ease-select" className="text-[11px] text-white/70">
          Reveal easing curve
        </label>
        <select
          id="reveal-ease-select"
          value={settings.revealEase}
          onChange={(e) => updateSetting("revealEase", e.target.value)}
          className="w-full rounded border border-white/20 bg-black/60 px-2 py-1 text-white text-[11px] focus:outline-none focus:border-cyan-400">
          {EASE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-black text-white">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Reveal slant ratio</span>
        <span className="font-mono text-cyan-300">{settings.revealSlantRatio.toFixed(3)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={0.3}
        step={0.005}
        value={settings.revealSlantRatio}
        onChange={(e) => updateSetting("revealSlantRatio", parseFloat(e.target.value))}
        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Reveal scale</span>
        <span className="font-mono text-cyan-300">{settings.revealScale.toFixed(2)}x</span>
      </div>
      <input
        type="range"
        min={1}
        max={2}
        step={0.05}
        value={settings.revealScale}
        onChange={(e) => updateSetting("revealScale", parseFloat(e.target.value))}
        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Reveal X translation</span>
        <span className="font-mono text-cyan-300">{settings.revealX || 0}px</span>
      </div>
      <input
        type="range"
        min={-300}
        max={300}
        step={5}
        value={settings.revealX || 0}
        onChange={(e) => updateSetting("revealX", parseFloat(e.target.value))}
        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Reveal Y translation</span>
        <span className="font-mono text-cyan-300">{settings.revealY !== undefined ? settings.revealY : 40}px</span>
      </div>
      <input
        type="range"
        min={-300}
        max={300}
        step={5}
        value={settings.revealY !== undefined ? settings.revealY : 40}
        onChange={(e) => updateSetting("revealY", parseFloat(e.target.value))}
        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/70">Reveal rotation</span>
        <span className="font-mono text-cyan-300">{settings.revealRotation || 0}°</span>
      </div>
      <input
        type="range"
        min={-45}
        max={45}
        step={1}
        value={settings.revealRotation || 0}
        onChange={(e) => updateSetting("revealRotation", parseFloat(e.target.value))}
        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="reveal-origin-select" className="text-[11px] text-white/70">
          Reveal pivot origin
        </label>
        <select
          id="reveal-origin-select"
          value={settings.revealOrigin || "center center"}
          onChange={(e) => updateSetting("revealOrigin", e.target.value)}
          className="w-full rounded border border-white/20 bg-black/60 px-2 py-1 text-white text-[11px] focus:outline-none focus:border-cyan-400">
          {ORIGIN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-black text-white">
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
