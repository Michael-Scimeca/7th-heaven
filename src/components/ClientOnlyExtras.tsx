"use client";
import {
  useState,
  useEffect,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import { usePathname } from "next/navigation";

// Sections that render CruiseChat for fans: /cruise/[username], /fans/[username], /live/*
const CHAT_SECTION_RE = /^\/(cruise|fans|live)(\/|$)/;

export default function ClientOnlyExtras() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [DevGuide, setDevGuide] = useState<ComponentType | null>(null);
  const [SpacingInspector, setSpacingInspector] = useState<ComponentType | null>(null);
  const [FluidGap, setFluidGap] = useState<ComponentType | null>(null);
  const [BlurTuner, setBlurTuner] = useState<ComponentType | null>(null);
  const [PickTuner, setPickTuner] = useState<ComponentType | null>(null);
  const [Vitals, setVitals] = useState<ComponentType | null>(null);
  const [StickyNotes, setStickyNotes] = useState<ComponentType | null>(null);
  const [MemberDash, setMemberDash] = useState<ComponentType | null>(null);
  const [LiveCursors, setLiveCursors] = useState<ComponentType | null>(null);

  useEffect(() => {
    let loaded = false;

    const loadExtras = () => {
      if (loaded) return;
      loaded = true;

      // Skip development-only guide overlay outside development
      if (
        process.env.NODE_ENV === "development" ||
        (typeof window !== "undefined" &&
          (window.location.search.includes("dev=true") ||
            window.location.search.includes("gap=true") ||
            window.location.search.includes("tuner=true")))
      ) {
        import("@/components/DevGuideLine")
          .then((m) => setDevGuide(() => m.default))
          .catch(() => {});
        import("@/components/SpacingInspector")
          .then((m) => setSpacingInspector(() => m.default))
          .catch(() => {});
        import("@/components/FluidGapTuner")
          .then((m) => setFluidGap(() => m.default))
          .catch(() => {});
      }

      if (
        typeof window !== "undefined" &&
        (window.location.search.includes("tuner=true") ||
          window.location.search.includes("tune=true"))
      ) {
        import("@/components/BlurTuner")
          .then((m) => setBlurTuner(() => m.default))
          .catch(() => {});
      }

      // Guitar-pick menu icon tuner: always in dev, or ?tuner=true / ?picks=true
      if (
        process.env.NODE_ENV === "development" ||
        (typeof window !== "undefined" &&
          /[?&](tuner|tune|picks)=true/.test(window.location.search))
      ) {
        import("@/components/PickIconTuner")
          .then((m) => setPickTuner(() => m.default))
          .catch(() => {});
      }

      import("@/components/WebVitalsReporter")
        .then((m) => setVitals(() => m.default))
        .catch(() => {});

      // Defer internal annotation overlay to browser idle time
      const scheduleIdle =
        typeof window !== "undefined" && "requestIdleCallback" in window
          ? (window as any).requestIdleCallback
          : (cb: () => void) => setTimeout(cb, 4000);

      scheduleIdle(() => {
        import("@/components/StickyNotesOverlay")
          .then((m) => setStickyNotes(() => m.default))
          .catch(() => {});
      });

      if (
        window.location.pathname.includes("/member") ||
        window.location.pathname.includes("/dashboard")
      ) {
        import("@/components/MemberDashboard")
          .then((m) => setMemberDash(() => m.default))
          .catch(() => {});
      }
    };

    // In development mode, load extras immediately so dev tools are instantly ready
    if (process.env.NODE_ENV === "development") {
      loadExtras();
      return () => {};
    }

    // Load extra scripts during browser idle time (or 8s max timeout) instead of stealing CPU on first scroll/touch
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = (window as any).requestIdleCallback(loadExtras, {
        timeout: 8000,
      });
      return () => (window as any).cancelIdleCallback(idleId);
    } else {
      const timerId = setTimeout(loadExtras, 8000);
      return () => clearTimeout(timerId);
    }
  }, []);

  // Live cursors + "N here": only on pages with the fan chat (CruiseChat).
  // Loaded on first visit to one of those sections; unmounting on other pages
  // disconnects from the realtime channel.
  const onChatPage = CHAT_SECTION_RE.test(pathname ?? "");
  useEffect(() => {
    if (!onChatPage || LiveCursors) return;
    import("@/components/LiveCursors")
      .then((m) => setLiveCursors(() => m.default))
      .catch(() => {});
  }, [onChatPage, LiveCursors]);

  if (!mounted) return null;

  return (
    <>
      {DevGuide && <DevGuide />}
      {SpacingInspector && <SpacingInspector />}
      {FluidGap && <FluidGap />}
      {BlurTuner && <BlurTuner />}
      {PickTuner && <PickTuner />}
      {Vitals && <Vitals />}
      {StickyNotes && <StickyNotes />}
      {MemberDash && <MemberDash />}
      {LiveCursors && onChatPage && <LiveCursors />}
    </>
  );
}
