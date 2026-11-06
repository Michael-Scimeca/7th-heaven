"use client";

import React, { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { BackgroundViewRenderer } from "./BackgroundViewRenderer";
import { BG_EVENT_KEY, getActiveBgView } from "./BackgroundViewsSwitcher";

const emptySubscribe = () => () => {};

function subscribeBgView(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(BG_EVENT_KEY, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(BG_EVENT_KEY, callback);
    window.removeEventListener("storage", callback);
  };
}

export default function GlobalBackgroundLayer() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const activeView = useSyncExternalStore(
    subscribeBgView,
    getActiveBgView,
    () => "arena-concert"
  );

  if (!mounted || pathname === "/media") return null;

  return (
    <div
      id="site-global-background-layer"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[5] isolate overflow-hidden select-none transition-all duration-700"
    >
      <BackgroundViewRenderer viewId={activeView} />
    </div>
  );
}
