"use client";
import { useState, useEffect, useSyncExternalStore, type ComponentType } from "react";

export default function ClientOnlyExtras() {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [DevGuide, setDevGuide] = useState<ComponentType | null>(null);
  const [Vitals, setVitals] = useState<ComponentType | null>(null);
  const [StickyNotes, setStickyNotes] = useState<ComponentType | null>(null);
  const [CruiseMaskEditor, setCruiseMaskEditor] = useState<ComponentType | null>(null);
  const [MemberDash, setMemberDash] = useState<ComponentType | null>(null);

  useEffect(() => {
    let loaded = false;

    if (typeof document !== "undefined" && !document.querySelector("link[rel='manifest']")) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest.json";
      document.head.appendChild(link);
    }

    const loadExtras = () => {
      if (loaded) return;
      loaded = true;

      // Skip development-only guide overlay outside development
      if (process.env.NODE_ENV === "development" || (typeof window !== "undefined" && window.location.search.includes("dev=true"))) {
        import("@/components/DevGuideLine").then((m) => setDevGuide(() => m.default)).catch(() => {});
      }

      import("@/components/WebVitalsReporter").then((m) => setVitals(() => m.default)).catch(() => {});

      // Defer internal annotation overlay to browser idle time
      const scheduleIdle = typeof window !== "undefined" && "requestIdleCallback" in window
        ? (window as any).requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 4000);

      scheduleIdle(() => {
        import("@/components/StickyNotesOverlay").then((m) => setStickyNotes(() => m.default)).catch(() => {});
      });

      if (window.location.pathname.includes("/cruise")) {
        import("@/components/CruiseHeroMaskEditor").then((m) => setCruiseMaskEditor(() => m.default)).catch(() => {});
      }
      if (window.location.pathname.includes("/member") || window.location.pathname.includes("/dashboard")) {
        import("@/components/MemberDashboard").then((m) => setMemberDash(() => m.default)).catch(() => {});
      }
    };

    // Load extra scripts during browser idle time (or 8s max timeout) instead of stealing CPU on first scroll/touch
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = (window as any).requestIdleCallback(loadExtras, { timeout: 8000 });
      return () => (window as any).cancelIdleCallback(idleId);
    } else {
      const timerId = setTimeout(loadExtras, 8000);
      return () => clearTimeout(timerId);
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      {DevGuide && <DevGuide />}
      {Vitals && <Vitals />}
      {StickyNotes && <StickyNotes />}
      {CruiseMaskEditor && <CruiseMaskEditor />}
      {MemberDash && <MemberDash />}
    </>
  );
}
