"use client";

import React from "react";
import dynamic from "next/dynamic";
import { CRUISE_HISTORY } from "../cruiseData";

const CruiseHistoryTimeline = dynamic(
  () => import("@/components/CruiseHistoryTimeline"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[300px] w-full items-center justify-center">
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
      <CruiseHistoryTimeline history={CRUISE_HISTORY} />
    </section>
  );
}
