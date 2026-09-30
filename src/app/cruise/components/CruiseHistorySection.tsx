"use client";

import React from "react";
import CruiseHistoryTimeline from "@/components/CruiseHistoryTimeline";
import { CRUISE_HISTORY } from "../cruiseData";

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
