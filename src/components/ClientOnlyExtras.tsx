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

export default function ClientOnlyExtras() {

  return (
    <>
      <DevGuideLine />
      <PagesPillDrawer />
      <WebVitalsReporter />
      <HomeShaderGradient />
    </>
  );
}
