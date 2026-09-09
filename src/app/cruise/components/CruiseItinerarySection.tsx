"use client";

import React, { useState } from "react";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import { SectionBadge } from "@/components/SectionBadge";
import CruiseSnakeItinerary from "@/components/CruiseSnakeItinerary";
import { ITINERARY_2027, ITINERARY_2028, mapToSnakeItinerary } from "../cruiseData";

export default function CruiseItinerarySection() {
  const [activeItinYear, setActiveItinYear] = useState<2027 | 2028>(2027);

  return (
    <section id="itinerary" className="pt-20 pb-12 relative z-20" style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}>
      <div className="w-full mx-auto">
        <div className="text-left w-full mb-10">
          <SectionBadge label="Interactive Voyage Map" className="mb-3" />
          <h2 className="font-bold uppercase text-white leading-none">
            Day-by-Day <span className="accent-gradient-text">Voyage Itinerary</span>
          </h2>
          <p className="mt-3 font-semibold max-w-2xl">
            Explore daily port calls, cruising coordinates, sail-away party times, and exclusive fan concerts.
          </p>

          {/* Itinerary Year Toggle */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <FoolishShrimpButton
              type="button"
              onClick={() => setActiveItinYear(2027)}
              isActive={activeItinYear === 2027}
              className="!w-auto px-5 py-2 text-xs uppercase font-bold"
            >
              2027 Star of the Seas (7-Night)
            </FoolishShrimpButton>
            <FoolishShrimpButton
              type="button"
              onClick={() => setActiveItinYear(2028)}
              isActive={activeItinYear === 2028}
              className="!w-auto px-5 py-2 text-xs uppercase font-bold"
            >
              2028 Legend of the Seas (8-Night)
            </FoolishShrimpButton>
          </div>
        </div>

        <div className="w-full overflow-x-hidden">
          <CruiseSnakeItinerary
            key={`itin-${activeItinYear}`}
            itinerary={mapToSnakeItinerary(activeItinYear === 2027 ? ITINERARY_2027 : ITINERARY_2028)}
            hideHeader
          />
        </div>
      </div>
    </section>
  );
}
