"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Waves, Guitar, Ship, Palmtree, Compass, Anchor, Clock } from "lucide-react";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import { SectionBadge } from "@/components/SectionBadge";
import { ITINERARY_2027, ITINERARY_2028 } from "../cruiseData";

export default function CruiseItinerarySection() {
  const [activeYear, setActiveYear] = useState<2027 | 2028>(2027);
  const currentItinerary = activeYear === 2027 ? ITINERARY_2027 : ITINERARY_2028;

  return (
    <section id="itinerary" className="pt-16 pb-12 relative z-20 text-left">
      <div className="w-full mx-auto">
        {/* Header & Year Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div>
            <SectionBadge label="Interactive Voyage Map" className="mb-3" />
            <h2 className="font-bold uppercase text-white leading-none">
              Day-by-Day <span className="accent-gradient-text">Voyage Itinerary</span>
            </h2>
            <p className="mt-3 font-semibold text-white/70 max-w-2xl text-base">
              Explore daily port calls, cruising coordinates, sail-away party times, and exclusive fan concerts.
            </p>
          </div>

          {/* Year Toggle Tabs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <FoolishShrimpButton
              type="button"
              onClick={() => setActiveYear(2027)}
              isActive={activeYear === 2027}
              className="!w-auto px-5 py-2.5 text-xs uppercase font-bold tracking-wider"
            >
              2027 Star of the Seas (7-Night)
            </FoolishShrimpButton>
            <FoolishShrimpButton
              type="button"
              onClick={() => setActiveYear(2028)}
              isActive={activeYear === 2028}
              className="!w-auto px-5 py-2.5 text-xs uppercase font-bold tracking-wider"
            >
              2028 Legend of the Seas (8-Night)
            </FoolishShrimpButton>
          </div>
        </div>

        {/* Itinerary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentItinerary.map((dayItem: any) => {
            const isSea = dayItem.type === "sea" || dayItem.port?.toLowerCase().includes("sea");
            const isDepart = dayItem.type === "depart" || dayItem.port?.toLowerCase().includes("canaveral") || dayItem.port?.toLowerCase().includes("lauderdale");

            return (
              <div
                key={`itin-card-${activeYear}-day-${dayItem.day}`}
                className="bg-[#0a0f1d] border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-purple-500/40"
              >
                <div>
                  {/* Card Header Image */}
                  <div className="relative aspect-[21/9] w-full overflow-hidden bg-black/60">
                    <Image
                      src={dayItem.photo || "/images/cruise/at-sea.png"}
                      alt={dayItem.port || dayItem.theme}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/40 to-transparent" />

                    {/* Floating Day Pill Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-black/80 border border-white/15 rounded-lg text-xs font-bold uppercase text-purple-300 backdrop-blur-md flex items-center gap-1.5 shadow-md">
                        {isSea ? (
                          <Waves className="w-3.5 h-3.5 text-cyan-400" />
                        ) : isDepart ? (
                          <Ship className="w-3.5 h-3.5 text-purple-400" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        DAY {dayItem.day} · {dayItem.port}
                      </span>
                    </div>

                    {/* Hours / Label Badge */}
                    {dayItem.label && (
                      <div className="absolute bottom-3 right-4">
                        <span className="px-2.5 py-1 bg-purple-950/80 border border-purple-500/30 rounded-md text-[11px] font-bold text-purple-200 backdrop-blur-sm flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          {dayItem.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Title & Content */}
                  <div className="p-5 md:p-6">
                    {dayItem.theme && (
                      <h3 className="text-lg md:text-xl font-bold uppercase text-white mb-4 leading-snug">
                        {dayItem.theme}
                      </h3>
                    )}

                    {/* Daily Schedule List */}
                    {dayItem.schedule && dayItem.schedule.length > 0 && (
                      <ul className="space-y-3">
                        {dayItem.schedule.map((item: any, idx: number) => {
                          const isBand = item.cat === "band" || item.event?.includes("🎸") || item.event?.toLowerCase().includes("concert") || item.event?.toLowerCase().includes("heaven");
                          const isExplore = item.cat === "explore" || item.event?.toLowerCase().includes("tour") || item.event?.toLowerCase().includes("spotting");
                          const isShipEvent = item.cat === "ship" || item.event?.toLowerCase().includes("dock") || item.event?.toLowerCase().includes("boarding") || item.event?.toLowerCase().includes("depart");

                          return (
                            <li
                              key={`sched-${dayItem.day}-${idx}`}
                              className="flex items-start gap-3 text-sm text-white/90 bg-white/[0.03] border border-white/5 p-2.5 rounded-xl"
                            >
                              {/* Time Pill */}
                              <span className="shrink-0 font-bold text-xs px-2.5 py-1 bg-black/50 border border-white/10 rounded-md text-purple-300 font-mono">
                                {item.time}
                              </span>

                              {/* Event Description */}
                              <div className="flex items-center gap-2 font-medium leading-tight pt-0.5">
                                {isBand && <Guitar className="w-4 h-4 text-purple-400 shrink-0" />}
                                {!isBand && isShipEvent && <Ship className="w-4 h-4 text-cyan-400 shrink-0" />}
                                {!isBand && !isShipEvent && isExplore && <Palmtree className="w-4 h-4 text-emerald-400 shrink-0" />}
                                {!isBand && !isShipEvent && !isExplore && <Compass className="w-4 h-4 text-amber-400 shrink-0" />}
                                <span className={isBand ? "font-bold text-white" : "text-white/80"}>
                                  {item.event}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
