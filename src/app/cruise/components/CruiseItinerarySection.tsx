"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import SeventhButton from "@/components/SeventhButton";
import { SectionBadge } from "@/components/SectionBadge";
import {
  ITINERARY_2027,
  ITINERARY_2028,
  mapToSnakeItinerary,
} from "../cruiseData";

const CruiseSnakeItinerary = dynamic(
  () => import("@/components/CruiseSnakeItinerary"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <span className="text-sm text-white/40">Loading voyage itinerary...</span>
      </div>
    ),
  },
);

interface CruiseItinerarySectionProps {
  sanityContent?: any;
}

export default function CruiseItinerarySection({
  sanityContent,
}: CruiseItinerarySectionProps) {
  const [activeItinYear, setActiveItinYear] = useState<2027 | 2028>(2027);

  const rawItin2027 = sanityContent?.itinerary2027?.length
    ? sanityContent.itinerary2027
    : ITINERARY_2027;
  const rawItin2028 = sanityContent?.itinerary2028?.length
    ? sanityContent.itinerary2028
    : ITINERARY_2028;

  return (
    <section
      id="itinerary"
      aria-labelledby="itinerary-heading"
      className="section relative z-20"
    >
      <div className="mx-auto w-full">
        <div className="site-container w-full text-left">
          <div className="title-group title-group--section">
            <h2 className="" id="itinerary-heading">
              Day-by-Day{" "}
              <span className="accent-gradient-text">Voyage Itinerary</span>
            </h2>
            <p className="max-w-2xl">
              Explore daily port calls, cruising coordinates, sail-away party
              times, and exclusive fan concerts.
            </p>
          </div>

          {/* Itinerary Year Toggle */}
          <div className="my-6 flex flex-wrap items-center gap-3">
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

        <div className="w-full ">
          <CruiseSnakeItinerary
            key={`itin-${activeItinYear}`}
            itinerary={mapToSnakeItinerary(
              activeItinYear === 2027 ? rawItin2027 : rawItin2028,
            )}
            hideHeader
          />
        </div>
      </div>
    </section>
  );
}
