"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  BackgroundViewRenderer,
} from "./BackgroundViewRenderer";
import {
  BG_EVENT_KEY,
  getActiveBgView,
} from "./BackgroundViewsSwitcher";

export default function GlobalBackgroundLayer() {
  const pathname = usePathname();
  const [activeView, setActiveView] = useState("arena-concert");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    setActiveView(getActiveBgView());

    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent<{ viewId: string }>).detail;
      if (detail?.viewId) setActiveView(detail.viewId);
    };

    window.addEventListener(BG_EVENT_KEY, handleChange);
    return () => window.removeEventListener(BG_EVENT_KEY, handleChange);
  }, []);

  if (!mounted || pathname === "/media") return null;

  return (
    <div
      id="site-global-background-layer"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[10] overflow-hidden select-none transition-all duration-700"
    >
      <BackgroundViewRenderer viewId={activeView} />
    </div>
  );
}
