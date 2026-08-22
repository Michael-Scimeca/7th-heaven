"use client";
import { useState, useEffect, type ComponentType } from "react";

export default function ClientOnlyExtras() {
  const [mounted, setMounted] = useState(false);
  const [DevGuide, setDevGuide] = useState<ComponentType | null>(null);
  const [Vitals, setVitals] = useState<ComponentType | null>(null);
  const [StickyNotes, setStickyNotes] = useState<ComponentType | null>(null);

  useEffect(() => {
    setMounted(true);
    let loaded = false;

    const loadExtras = () => {
      if (loaded) return;
      loaded = true;
      import("@/components/DevGuideLine").then((m) => setDevGuide(() => m.default));
      import("@/components/WebVitalsReporter").then((m) => setVitals(() => m.default));
      import("@/components/StickyNotesOverlay").then((m) => setStickyNotes(() => m.default));
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("scroll", loadExtras);
      window.removeEventListener("pointerdown", loadExtras);
      window.removeEventListener("touchstart", loadExtras);
      window.removeEventListener("mousemove", loadExtras);
    };

    window.addEventListener("scroll", loadExtras, { passive: true });
    window.addEventListener("pointerdown", loadExtras, { passive: true });
    window.addEventListener("touchstart", loadExtras, { passive: true });
    window.addEventListener("mousemove", loadExtras, { passive: true });

    // Fallback: 6-second delay if no interaction occurs
    const t = setTimeout(loadExtras, 6000);

    return () => {
      clearTimeout(t);
      cleanup();
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {DevGuide && <DevGuide />}
      {Vitals && <Vitals />}
      {StickyNotes && <StickyNotes />}
    </>
  );
}
