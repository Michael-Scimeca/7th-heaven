"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Compass, Calendar as CalendarIcon, Sparkles } from "lucide-react";
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
            <div className="mb-2 flex items-center gap-2">
              <Compass className="h-4 w-4 text-[var(--color-amber)]" />
              <span className="text-fluid-caption font-bold tracking-widest text-[var(--color-amber)] uppercase">
                Voyage Timeline
              </span>
            </div>
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
          <div className="my-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveItinYear(2027)}
              className={`cursor-pointer rounded-[var(--radius-box)] border px-4 py-2.5 text-fluid-body font-semibold transition-[border-color,background-color] ${
                activeItinYear === 2027
                  ? "border-[var(--color-amber)]/60 bg-[var(--color-amber)]/20 text-white shadow-md"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              ⭐ 2027 Star of the Seas (7-Night Caribbean)
            </button>
            <button
              type="button"
              onClick={() => setActiveItinYear(2028)}
              className={`cursor-pointer rounded-[var(--radius-box)] border px-4 py-2.5 text-fluid-body font-semibold transition-[border-color,background-color] ${
                activeItinYear === 2028
                  ? "border-[var(--color-amber)]/60 bg-[var(--color-amber)]/20 text-white shadow-md"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              🌊 2028 Legend of the Seas (8-Night Bahamas)
            </button>
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
