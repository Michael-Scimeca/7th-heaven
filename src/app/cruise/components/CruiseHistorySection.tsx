"use client";

import React from "react";
import CruiseHistoryTimeline from "@/components/CruiseHistoryTimeline";
import LazyMount from "@/components/LazyMount";
import { useGLTF } from "@react-three/drei";
import { CRUISE_HISTORY } from "../cruiseData";

export default function CruiseHistorySection() {
  const handleVisible = React.useCallback(() => {
    if (typeof window !== "undefined") {
      useGLTF.preload("/objects/ship.glb");
    }
  }, []);

  return (
    <LazyMount
      as="section"
      id="history"
      minHeight="2800px"
      rootMargin="600px 0px"
      onVisible={handleVisible}
    >
      <CruiseHistoryTimeline history={CRUISE_HISTORY} />
    </LazyMount>
  );
}
