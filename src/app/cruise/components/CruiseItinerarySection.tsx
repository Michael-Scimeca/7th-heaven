"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  ITINERARY_2027,
  ITINERARY_2028,
  mapToSnakeItinerary,
} from "../cruiseData";

import SegmentedTabs from "@/components/SegmentedTabs";

const CruiseSnakeItinerary = dynamic(
  () => import("@/components/CruiseSnakeItinerary"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <span className="text-fluid-body text-white/40">Loading voyage itinerary...</span>
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
            <h2 id="itinerary-heading">
              Day-by-Day{" "}
              <span className="accent-gradient-text">Voyage Itinerary</span>
            </h2>
            <p className="max-w-2xl text-secondary mt-2 text-fluid-body">
              Explore daily port calls, cruising coordinates, sail-away party
              times, and exclusive onboard fan concerts.
            </p>
          </div>

          {/* Itinerary Year Toggle */}
          <div className="my-6 max-w-full overflow-x-auto hide-scrollbar py-1">
            <SegmentedTabs<2027 | 2028>
              tabs={[
                { id: 2027, label: "⭐ 2027 Star of the Seas (7-Night Caribbean)" },
                { id: 2028, label: "🌊 2028 Legend of the Seas (8-Night Bahamas)" },
              ]}
              activeTab={activeItinYear}
              onChange={(year) => setActiveItinYear(year)}
              layout="flex"
              shape="full"
              size="md"
              className="flex-nowrap inline-flex w-max shrink-0"
              ariaLabel="Itinerary year selector"
            />
          </div>
        </div>

        <div className="w-full">
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
