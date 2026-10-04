"use client";

import dynamic from "next/dynamic";
import LazyHeavy from "@/components/LazyHeavy";
import { CRUISE_HISTORY } from "../cruiseData";

const CruiseHistoryTimeline = dynamic(
  () => import("@/components/CruiseHistoryTimeline"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] w-full items-center justify-center rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02]">
        <span className="text-sm text-white/40">Loading history timeline...</span>
      </div>
    ),
  },
);

export default function CruiseHistorySection() {
  return (
    <section
      id="history"
      aria-labelledby="history-heading"
      className="section site-container"
    >
      <h2 id="history-heading" className="sr-only">
        Cruise History &amp; Voyage Milestones
      </h2>
      <LazyHeavy
        minHeight="600px"
        rootMargin="400px 0px"
        fallback={
          <div className="flex min-h-[400px] w-full items-center justify-center rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02]">
            <span className="text-sm text-white/40">Loading history timeline...</span>
          </div>
        }
      >
        <CruiseHistoryTimeline history={CRUISE_HISTORY} />
      </LazyHeavy>
    </section>
  );
}
