"use client";

import React from "react";
import CruiseHistoryTimeline from "@/components/CruiseHistoryTimeline";
import { CRUISE_HISTORY } from "../cruiseData";

export default function CruiseHistorySection() {
  return (
    <div style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}>
      <CruiseHistoryTimeline history={CRUISE_HISTORY} />
    </div>
  );
}
