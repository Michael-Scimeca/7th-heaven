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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDesktop(typeof window !== "undefined" && window.innerWidth >= 768);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <DevGuideLine />
      <PagesPillDrawer />
      <WebVitalsReporter />
      {isDesktop && <HomeShaderGradient />}
    </>
  );
}
