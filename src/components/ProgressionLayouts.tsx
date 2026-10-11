"use client";

import React from "react";
import {
  DualBarTimelineSetups,
  type DualBarSetupId,
} from "@/components/DualBarTimelineSetups";

export const RAIL_SETUPS = [
  {
    id: 1,
    name: "1. Laser-Threaded Rail",
    desc: "Neon laser beam threads directly through the center of all 4 milestone pills",
  },
  {
    id: 2,
    name: "2. Pro Audio Console",
    desc: "Concert soundboard channel strip with LED level meters and fader modules",
  },
  {
    id: 3,
    name: "3. Proportional Time Bar",
    desc: "True time-scaled horizontal bar reflecting actual duration proportions",
  },
  {
    id: 4,
    name: "4. Dual-Deck Milestone",
    desc: "Refined top milestone halo track with dedicated stage cards below",
  },
  {
    id: 5,
    name: "5. Neon Waveform Track",
    desc: "Glowing audio frequency waveform with rock concert energy peak during live set",
  },
] as const;

export type RailSetupId = (typeof RAIL_SETUPS)[number]["id"];

export interface ProgressionLayoutsProps {
  layoutId?: number;
  onSelectLayout?: (id: number) => void;
  openTimeline: string | null;
  setOpenTimeline: (stage: string | null) => void;
  effectiveEventStart: string;
  effectiveBandStart: string;
  effectiveBandEnd: string;
  effectiveEventEnd: string;
  handleSelectTimelineTime: (stage: string, t: string) => void;
  bandLiveMinutes: number;
  totalEventMinutes: number;
  preShowMinutes: number;
  postShowMinutes: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ProgressionLayouts({
  layoutId = 1,
  openTimeline,
  setOpenTimeline,
  effectiveEventStart,
  effectiveBandStart,
  effectiveBandEnd,
  effectiveEventEnd,
  handleSelectTimelineTime,
  bandLiveMinutes,
  totalEventMinutes,
  preShowMinutes,
  postShowMinutes,
  containerRef,
}: ProgressionLayoutsProps) {
  return (
    <div ref={containerRef} className="relative w-full">
      <DualBarTimelineSetups
        layoutId={(layoutId as DualBarSetupId) || 1}
        effectiveEventStart={effectiveEventStart}
        effectiveBandStart={effectiveBandStart}
        effectiveBandEnd={effectiveBandEnd}
        effectiveEventEnd={effectiveEventEnd}
        handleSelectTimelineTime={handleSelectTimelineTime}
        openTimeline={openTimeline}
        setOpenTimeline={setOpenTimeline}
        bandLiveMinutes={bandLiveMinutes}
        totalEventMinutes={totalEventMinutes}
        preShowMinutes={preShowMinutes}
        postShowMinutes={postShowMinutes}
      />
    </div>
  );
}
