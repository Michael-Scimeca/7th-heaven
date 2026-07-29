"use client";
import dynamic from "next/dynamic";

// These components use browser APIs and must be client-only.
// Wrapping them here (a client component) allows ssr:false inside a Server Component layout.
const DevPerformancePanel = dynamic(
  () => import("@/components/DevPerformancePanel").then(m => ({ default: m.DevPerformancePanel })),
  { ssr: false }
);
const DirectMessageChat = dynamic(
  () => import("@/components/DirectMessageChat"),
  { ssr: false }
);

export default function ClientOnlyExtras() {
  return (
    <>
      <DirectMessageChat />
      <DevPerformancePanel />
    </>
  );
}
