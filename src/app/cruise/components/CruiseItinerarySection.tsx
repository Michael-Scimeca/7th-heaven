"use client";

import React, { useState } from "react";
import SeventhButton from "@/components/SeventhButton";
import { SectionBadge } from "@/components/SectionBadge";
import CruiseSnakeItinerary from "@/components/CruiseSnakeItinerary";
import LazyMount from "@/components/LazyMount";
import { ITINERARY_2027, ITINERARY_2028, mapToSnakeItinerary } from "../cruiseData";

interface CruiseItinerarySectionProps {
  sanityContent?: any;
}

export default function CruiseItinerarySection({ sanityContent }: CruiseItinerarySectionProps) {
  const [activeItinYear, setActiveItinYear] = useState<2027 | 2028>(2027);

  const rawItin2027 = sanityContent?.itinerary2027?.length ? sanityContent.itinerary2027 : ITINERARY_2027;
  const rawItin2028 = sanityContent?.itinerary2028?.length ? sanityContent.itinerary2028 : ITINERARY_2028;

  return (
    <LazyMount as="section" id="itinerary" className="py-section-fluid relative z-20 border-b border-white/10" minHeight="800px" rootMargin="300px 0px">
      <div className="w-full mx-auto">
        <div className="text-left w-full site-container">
          <SectionBadge label="Interactive Voyage Map" className="mb-3" />
          <h2>
            Day-by-Day <span className="accent-gradient-text">Voyage Itinerary</span>
          </h2>
          <p className="mt-3   max-w-2xl">
            Explore daily port calls, cruising coordinates, sail-away party times, and exclusive fan concerts.
          </p>

          {/* Itinerary Year Toggle */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <SeventhButton
              type="button"
              onClick={() => setActiveItinYear(2027)}
              isActive={activeItinYear === 2027}
              className="!w-auto"
            >
              2027 Star of the Seas (7-Night)
            </SeventhButton>
            <SeventhButton
              type="button"
              onClick={() => setActiveItinYear(2028)}
              isActive={activeItinYear === 2028}
              className="!w-auto"
            >
              2028 Legend of the Seas (8-Night)
            </SeventhButton>
          </div>
        </div>

        <div className="w-full overflow-x-hidden">
          <CruiseSnakeItinerary
            key={`itin-${activeItinYear}`}
            itinerary={mapToSnakeItinerary(activeItinYear === 2027 ? rawItin2027 : rawItin2028)}
            hideHeader
          />
        </div>
      </div>
    </LazyMount >
  );
}
