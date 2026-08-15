"use client";
import dynamic from "next/dynamic";

// These components use browser APIs and must be client-only.
// Wrapping them here (a client component) allows ssr:false inside a Server Component layout.
const DevGuideLine = dynamic(
  () => import("@/components/DevGuideLine"),
  { ssr: false }
);

const PagesPillDrawer = dynamic(
  () => import("@/components/PagesPillDrawer"),
  { ssr: false }
);

const WebVitalsReporter = dynamic(
  () => import("@/components/WebVitalsReporter"),
  { ssr: false }
);

const HomeShaderGradient = dynamic(
  () => import("@/components/HomeShaderGradient"),
  { ssr: false }
);

import { useState, useEffect } from "react";

export default function ClientOnlyExtras() {
  const [mounted, setMounted] = useState(false);
  const [shouldLoadShader, setShouldLoadShader] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    if (!isDesktop) return;

    // Defer 99.2 KiB WebGL shader bundle until after initial paint & main thread is idle
    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(() => setShouldLoadShader(true), { timeout: 3000 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const t = setTimeout(() => setShouldLoadShader(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      <DevGuideLine />
      <PagesPillDrawer />
      <WebVitalsReporter />
      {shouldLoadShader && <HomeShaderGradient />}
    </>
  );
}
