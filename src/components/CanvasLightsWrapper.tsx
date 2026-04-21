"use client";

import dynamic from "next/dynamic";

const CanvasLights = dynamic(() => import("./CanvasLights"), { ssr: false });

export default function CanvasLightsWrapper() {
  return <CanvasLights />;
}
