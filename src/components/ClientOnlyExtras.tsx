"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, type ComponentType } from "react";

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

export default function ClientOnlyExtras() {
  const [mounted, setMounted] = useState(false);
  const [ShaderComp, setShaderComp] = useState<ComponentType | null>(null);

  useEffect(() => {
    setMounted(true);
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    if (!isDesktop) return;

    // True runtime lazy-import: prevents Next.js from adding 99.8 KiB WebGL chunk to static HTML preloads
    const loadShader = () => {
      import("@/components/HomeShaderGradient").then((mod) => {
        setShaderComp(() => mod.default);
      });
    };

    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(loadShader, { timeout: 3500 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const t = setTimeout(loadShader, 2500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      <DevGuideLine />
      <PagesPillDrawer />
      <WebVitalsReporter />
      {ShaderComp && <ShaderComp />}
    </>
  );
}
