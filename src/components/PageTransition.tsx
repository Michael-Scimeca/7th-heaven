"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import Logo from "@/components/Logo";
import { buildDecayingSlantClipPath } from "@/lib/curtainClipPath";
import { waitForPageReady } from "@/lib/waitForPageReady";
import { useTransition } from "@/context/TransitionContext";

const EXO_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";
const FAILSAFE_MS = 3000;
const CURTAIN_BG = "rgb(13, 14, 19)";

const EASE_OPTIONS: { label: string; value: string }[] = [
  { label: "circ.out (default)", value: "circ.out" },
  { label: "power1.out", value: "power1.out" },
  { label: "power2.out", value: "power2.out" },
  { label: "power3.out", value: "power3.out" },
  { label: "power4.out", value: "power4.out" },
  { label: "sine.out", value: "sine.out" },
  { label: "expo.out", value: "expo.out" },
  { label: "back.out(1.2)", value: "back.out(1.2)" },
  { label: "power1.inOut", value: "power1.inOut" },
  { label: "power2.inOut", value: "power2.inOut" },
  { label: "linear", value: "linear" },
  { label: "site cubic-bezier (EXO_EASE)", value: EXO_EASE },
];

export interface TransitionSettings {
  speedMult: number;
  revealScale: number;
  revealEase: string;
  revealSlantRatio: number;
  revealFlipSlant: boolean;
  exitSpeed: number;
  exitScale: number;
  exitRotation: number;
  exitEase: string;
  exitSlantRatio: number;
  exitFlipSlant: boolean;
}

export const DEFAULT_SETTINGS: TransitionSettings = {
  speedMult: 1,
  revealScale: 1.0,
  revealEase: "circ.out",
  revealSlantRatio: 0.18,
  revealFlipSlant: true,
  exitSpeed: 0.30,
  exitScale: 1.30,
  exitRotation: 0,
  exitEase: "circ.out",
  exitSlantRatio: 0.18,
  exitFlipSlant: true,
};

function buildRevealClipPath(progress: number, ratio: number, flip: boolean, rampFraction = 0.05): string {
  const p = Math.min(1, Math.max(0, progress));
  const mainY = 100 * (1 - p);
  const rampedRatio = ratio * Math.min(1, p / (rampFraction || 1));
  const leadY = mainY / (1 + rampedRatio);
  const leftY = flip ? leadY : mainY;
  const rightY = flip ? mainY : leadY;
  return `polygon(0% ${leftY}%, 100% ${rightY}%, 100% 100%, 0% 100%)`;
}

function buildExitClipPath(progress: number, ratio: number, flip: boolean, rampFraction = 0.05): string {
  const p = Math.min(1, Math.max(0, progress));
  const mainY = 100 * (1 - p);
  const rampedRatio = ratio * Math.min(1, p / (rampFraction || 1));
  const leadY = mainY / (1 + rampedRatio);
  const leftY = flip ? leadY : mainY;
  const rightY = flip ? mainY : leadY;
  return `polygon(0% 0%, 100% 0%, 100% ${rightY}%, 0% ${leftY}%)`;
}

function shouldSkip(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.location.search.includes("bypass=true")
  );
}

function pathOf(href: string): string {
  if (typeof window === "undefined") return href.split(/[?#]/)[0];
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href.split(/[?#]/)[0];
  }
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, pendingHref, setMode, clearPendingHref } = useTransition();

  const outerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const contentTweenRef = useRef<gsap.core.Tween | null>(null);
  const revealStartedForRef = useRef<string | null>(null);
  const outgoingTweensRef = useRef<gsap.core.Tween[]>([]);

  // Live tuning settings & persistence
  const [settings, setSettings] = useState<TransitionSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<"speed" | "reveal" | "exit">("speed");
  const [showControls, setShowControls] = useState<boolean>(true);
  const settingsRef = useRef<TransitionSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("7h_page_transition_settings_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          const merged = { ...DEFAULT_SETTINGS, ...parsed };
          setSettings(merged);
          settingsRef.current = merged;
        }
      }
    } catch {}
  }, []);

  const updateSetting = <K extends keyof TransitionSettings>(key: K, val: TransitionSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: val };
      settingsRef.current = next;
      try {
        localStorage.setItem("7h_page_transition_settings_v2", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    settingsRef.current = DEFAULT_SETTINGS;
    try {
      localStorage.setItem("7h_page_transition_settings_v2", JSON.stringify(DEFAULT_SETTINGS));
    } catch {}
  };

  useEffect(() => {
    if (mode !== "covering" || !pendingHref) return;

    document.documentElement.classList.add("is-page-transitioning");

    if (typeof window !== "undefined" && (window as any).__lenis) {
      try {
        (window as any).__lenis.stop();
      } catch {}
    }

    if (shouldSkip()) {
      document.documentElement.classList.remove("is-page-transitioning");
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch {}
      }
      // eslint-disable-next-line react-doctor/nextjs-no-client-side-redirect
      router.push(pendingHref);
      clearPendingHref();
      setMode("idle");
      return;
    }

    tweenRef.current?.kill();
    contentTweenRef.current?.kill();
    outgoingTweensRef.current.forEach((t) => t.kill());
    outgoingTweensRef.current = [];
    document.querySelectorAll(".exoape-snapshot-inner, .exoape-snapshot-overlay").forEach((el) => {
      gsap.killTweensOf(el);
    });
    document.querySelectorAll(".exoape-snapshot-outer").forEach((node) => node.remove());

    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    const snapshotOuter = document.createElement("div");
    snapshotOuter.className = "exoape-snapshot-outer";
    snapshotOuter.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 900;
      pointer-events: none;
      overflow: hidden;
      background-color: ${CURTAIN_BG};
    `;

    const snapshotInner = document.createElement("div");
    snapshotInner.className = "exoape-snapshot-inner";
    snapshotInner.style.cssText = `
      width: 100%;
      min-height: 100vh;
      transform-origin: center center;
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
      snapshotInner.appendChild(clone);
    }
    snapshotOuter.appendChild(snapshotInner);
    snapshotOuter.appendChild(snapshotOverlay);
    document.body.appendChild(snapshotOuter);

    const s = settingsRef.current;
    const duration = s.exitSpeed * s.speedMult;
    const ease = s.exitEase;

    revealStartedForRef.current = null;

    if (outerRef.current) {
      outerRef.current.style.overflow = "hidden";
      outerRef.current.style.willChange = "clip-path";
      outerRef.current.style.clipPath = buildRevealClipPath(0, s.revealSlantRatio, s.revealFlipSlant);
    }
    if (contentRef.current) {
      contentRef.current.style.willChange = "transform";
      gsap.set(contentRef.current, {
        y: windowHeight / 2,
        scale: s.revealScale,
        transformOrigin: "center center",
      });
    }

    // eslint-disable-next-line react-doctor/nextjs-no-client-side-redirect
    router.push(pendingHref);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }

    snapshotInner.style.willChange = "transform";
    const outgoingInnerTween = gsap.fromTo(
      snapshotInner,
      { scale: 1, y: 0, rotation: 0 },
      {
        scale: s.exitScale,
        y: -windowHeight / 2 - 30,
        rotation: s.exitRotation,
        duration,
        ease,
        onUpdate: function () {
          snapshotInner.style.clipPath = buildExitClipPath(
            this.progress(),
            s.exitSlantRatio,
            s.exitFlipSlant
          );
        },
        onComplete: () => {
          if (snapshotOuter.parentNode) {
            snapshotOuter.parentNode.removeChild(snapshotOuter);
          }
        },
      }
    );

    const outgoingOverlayTween = gsap.fromTo(
      snapshotOverlay,
      { opacity: 0 },
      {
        opacity: 1,
        duration,
        ease,
      }
    );

    outgoingTweensRef.current = [outgoingInnerTween, outgoingOverlayTween];
    setMode("covered");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pendingHref]);

  useEffect(() => {
    if (!pendingHref) return;
    if (pathname !== pathOf(pendingHref)) return;
    if (revealStartedForRef.current === pendingHref) return;
    revealStartedForRef.current = pendingHref;

    let cancelled = false;
    setMode("uncovering");

    const s = settingsRef.current;
    const revealDuration = (s.exitSpeed + 0.25) * s.speedMult;
    const ease = s.revealEase;
    const failsafeMs = Math.max(FAILSAFE_MS, (s.exitSpeed + revealDuration) * 1000 + 4000);
    const failsafe = new Promise<void>((resolve) => setTimeout(resolve, failsafeMs));

    Promise.race([waitForPageReady(), failsafe]).then(() => {
      if (cancelled) return;

      const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;

      if (outerRef.current) {
        outerRef.current.style.overflow = "hidden";
        outerRef.current.style.willChange = "clip-path";
      }

      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.classList.remove("is-page-transitioning");
          if (outerRef.current) {
            outerRef.current.style.overflow = "";
            outerRef.current.style.clipPath = "none";
            outerRef.current.style.willChange = "";
          }
          if (contentRef.current) {
            gsap.set(contentRef.current, { clearProps: "all" });
          }
          if (typeof window !== "undefined" && (window as any).__lenis) {
            try {
              (window as any).__lenis.start();
              (window as any).__lenis.resize();
            } catch {}
          }
          revealStartedForRef.current = null;
          clearPendingHref();
          setMode("idle");
        },
      });

      tweenRef.current = tl;

      if (contentRef.current) {
        contentRef.current.style.willChange = "transform";
        tl.fromTo(
          contentRef.current,
          { y: windowHeight / 2, scale: s.revealScale, transformOrigin: "center center" },
          { y: 0, scale: 1, duration: revealDuration, ease },
          0
        );
      }

      const proxy = { p: 0 };
      tl.to(
        proxy,
        {
          p: 1,
          duration: revealDuration,
          ease,
          onUpdate: () => {
            if (outerRef.current) {
              outerRef.current.style.clipPath = buildRevealClipPath(
                proxy.p,
                s.revealSlantRatio,
                s.revealFlipSlant
              );
            }
          },
        },
        0
      );
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingHref, pathname]);

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
        outerRef.current.style.clipPath = "none";
        outerRef.current.style.willChange = "";
      }
      if (contentRef.current) {
        gsap.set(contentRef.current, { clearProps: "all" });
      }
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch {}
      }
      revealStartedForRef.current = null;
      clearPendingHref();
      setMode("idle");
    }, watchdogMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const { requestTransition } = useTransition();
  const requestTransitionRef = useRef(requestTransition);
  useEffect(() => {
    requestTransitionRef.current = requestTransition;
  }, [requestTransition]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLAnchorElement>("a[href]");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
      if (target.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (href === currentPath) return;

      e.preventDefault();
      requestTransitionRef.current(href);
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  const revealDuration = (settings.exitSpeed + 0.25) * settings.speedMult;
  const exitDuration = settings.exitSpeed * settings.speedMult;

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
        }}
      >
        <div
          ref={contentRef}
          className="exoape-page-inner transform-gpu"
          style={{
            width: "100%",
            minHeight: "100vh",
            transformOrigin: "center center",
          }}
        >
          {children}
        </div>
      </div>

      {/* Floating Transition Tuning Control Panel (Positioned bottom-20 right-4 above sticky notes) */}
      <div className="fixed bottom-20 right-4 z-[99999] flex flex-col gap-2 rounded-2xl border border-white/20 bg-black/95 p-3.5 shadow-2xl backdrop-blur-md text-white text-xs select-none pointer-events-auto max-w-[320px] w-[320px] max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-[11px] text-purple-400">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            Transition Tuner UI
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetDefaults}
              title="Reset all settings to default"
              className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition bg-white/5"
            >
              Reset
            </button>
            <button
              onClick={() => setShowControls(!showControls)}
              className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-600/30 transition bg-purple-950/40"
            >
              {showControls ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>

        {showControls && (
          <div className="flex flex-col gap-3 pt-1">
            {/* Tab Selector */}
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveTab("speed")}
                className={`py-1 rounded text-[10px] font-bold uppercase transition ${
                  activeTab === "speed"
                    ? "bg-purple-600 text-white shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                ⚡ Speed
              </button>
              <button
                onClick={() => setActiveTab("reveal")}
                className={`py-1 rounded text-[10px] font-bold uppercase transition ${
                  activeTab === "reveal"
                    ? "bg-cyan-600 text-white shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                ✨ Reveal
              </button>
              <button
                onClick={() => setActiveTab("exit")}
                className={`py-1 rounded text-[10px] font-bold uppercase transition ${
                  activeTab === "exit"
                    ? "bg-fuchsia-600 text-white shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                💥 Exit
              </button>
            </div>

            {/* TAB 1: SPEED MULTIPLIER & MOTION */}
            {activeTab === "speed" && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-white/70">Slow-Mo Multiplier</span>
                  <strong className="text-purple-300 font-bold">{settings.speedMult}x</strong>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2.5, 5, 10].map((m) => (
                    <button
                      key={m}
                      onClick={() => updateSetting("speedMult", m)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold font-mono transition ${
                        settings.speedMult === m
                          ? "bg-purple-600 text-white shadow ring-1 ring-purple-300"
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
                  max={15}
                  step={0.5}
                  value={settings.speedMult}
                  onChange={(e) => updateSetting("speedMult", parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-white/50 font-mono pt-1">
                  <span>Reveal Total: <strong className="text-cyan-300">{revealDuration.toFixed(2)}s</strong></span>
                  <span>Exit Total: <strong className="text-fuchsia-300">{exitDuration.toFixed(2)}s</strong></span>
                </div>
              </div>
            )}

            {/* TAB 2: NEW PAGE REVEAL SETTINGS */}
            {activeTab === "reveal" && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/70">Reveal speed <span className="text-white/40">(exit + 0.25s)</span></span>
                  <span className="font-mono text-cyan-300 font-bold">{revealDuration.toFixed(2)}s</span>
                </div>

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

                <div className="flex flex-col gap-1">
                  <label htmlFor="reveal-ease-select" className="text-[11px] text-white/70">
                    Reveal easing
                  </label>
                  <select
                    id="reveal-ease-select"
                    value={settings.revealEase}
                    onChange={(e) => updateSetting("revealEase", e.target.value)}
                    className="w-full rounded border border-white/20 bg-black/60 px-2 py-1 text-white text-[11px] focus:outline-none focus:border-cyan-400"
                  >
                    {EASE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} className="bg-black text-white">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/70">Slant ratio</span>
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

                <label className="flex items-center gap-2 text-[11px] text-white/80 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={settings.revealFlipSlant}
                    onChange={(e) => updateSetting("revealFlipSlant", e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span>Flip slant direction {settings.revealFlipSlant ? "(left leads)" : "(right leads)"}</span>
                </label>
              </div>
            )}

            {/* TAB 3: OLD PAGE EXIT SETTINGS */}
            {activeTab === "exit" && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/70">Exit speed</span>
                  <span className="font-mono text-fuchsia-300 font-bold">{settings.exitSpeed.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={1.5}
                  step={0.05}
                  value={settings.exitSpeed}
                  onChange={(e) => updateSetting("exitSpeed", parseFloat(e.target.value))}
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
                  <label htmlFor="exit-ease-select" className="text-[11px] text-white/70">
                    Exit easing
                  </label>
                  <select
                    id="exit-ease-select"
                    value={settings.exitEase}
                    onChange={(e) => updateSetting("exitEase", e.target.value)}
                    className="w-full rounded border border-white/20 bg-black/60 px-2 py-1 text-white text-[11px] focus:outline-none focus:border-fuchsia-400"
                  >
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

                <label className="flex items-center gap-2 text-[11px] text-white/80 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={settings.exitFlipSlant}
                    onChange={(e) => updateSetting("exitFlipSlant", e.target.checked)}
                    className="accent-fuchsia-400 rounded"
                  />
                  <span>Flip slant direction {settings.exitFlipSlant ? "(left leads)" : "(right leads)"}</span>
                </label>
              </div>
            )}

            {/* Replay Slide-Up Button */}
            <button
              onClick={() => requestTransition(pathname)}
              disabled={mode !== "idle"}
              className="w-full mt-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span>🎬 Replay Transition ({settings.speedMult}x)</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
