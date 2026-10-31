"use client";

import React, { useState } from "react";
import {
  Truck,
  DoorOpen,
  Guitar,
  Moon,
  Clock,
  Sparkles,
  Ticket,
  ListOrdered,
  Layers,
  Activity,
  ArrowRight,
  Radio,
  Sliders,
  Calendar,
} from "lucide-react";

export interface ItineraryRecapProps {
  date: string;
  loadInTime: string;
  doorsTime: string;
  onStageTime: string;
  setEndTime: string;
  wrapTime: string;
  venueName?: string;
  venueCity?: string;
  venueState?: string;
  parkingAddress?: string;
  parkingTypeLabel?: string;
  className?: string;
  initialLayoutIndex?: number;
  showSwitcher?: boolean;
}

export const RECAP_LAYOUTS = [
  { id: 1, name: "1. Editorial Prose", icon: Sparkles },
  { id: 2, name: "2. Visual Stepper", icon: ListOrdered },
  { id: 3, name: "3. VIP Ticket Stub", icon: Ticket },
  { id: 4, name: "4. Call Sheet Grid", icon: Layers },
  { id: 5, name: "5. Glowing Pill Ribbon", icon: ArrowRight },
  { id: 6, name: "6. Vertical Stage Log", icon: Clock },
  { id: 7, name: "7. Mini DAW Track", icon: Activity },
  { id: 8, name: "8. Glass Chips", icon: Sliders },
  { id: 9, name: "9. Flight Console Strip", icon: Radio },
  { id: 10, name: "10. Hero Stage Banner", icon: Guitar },
] as const;

export default function ItineraryRecapLayouts({
  date,
  loadInTime,
  doorsTime,
  onStageTime,
  setEndTime,
  wrapTime,
  venueName,
  venueCity,
  venueState,
  parkingAddress,
  parkingTypeLabel,
  className = "",
  initialLayoutIndex = 10,
  showSwitcher = false,
}: ItineraryRecapProps) {
  const [activeLayout, setActiveLayout] = useState<number>(initialLayoutIndex);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Interactive Layout Switcher Bar (only shown if showSwitcher is true) */}
      {showSwitcher && (
        <div className="flex flex-col gap-1.5 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Recap Style (10 Layouts)
            </span>
            <span className="text-[10px] font-mono text-white/40">
              Layout #{activeLayout}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
            {RECAP_LAYOUTS.map((item) => {
              const isSelected = activeLayout === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveLayout(item.id)}
                  className={`group flex items-center gap-1 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Render Selected Layout */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-3.5 backdrop-blur-md transition-all">
        {/* LAYOUT 1: Natural Editorial Prose (Fixed punctuation spacing) */}
        {activeLayout === 1 && (
          <div className="text-xs sm:text-[13px] leading-relaxed text-white/80">
            <span>7th Heaven plays on </span>
            <span className="inline-flex items-center rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-300">
              {date}
            </span>
            <span>. Load-in at </span>
            <span className="inline-flex items-center rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-xs font-semibold text-emerald-300">
              {loadInTime}
            </span>
            <span>, doors at </span>
            <span className="inline-flex items-center rounded-md bg-sky-500/20 px-1.5 py-0.5 text-xs font-semibold text-sky-300">
              {doorsTime}
            </span>
            <span>, on stage </span>
            <span className="inline-flex items-center rounded-md bg-purple-500/30 px-1.5 py-0.5 text-xs font-semibold text-purple-300">
              {onStageTime}
            </span>
            <span> to </span>
            <span className="inline-flex items-center rounded-md bg-pink-500/30 px-1.5 py-0.5 text-xs font-semibold text-pink-300">
              {setEndTime}
            </span>
            <span>, wrapping at </span>
            <span className="inline-flex items-center rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-300">
              {wrapTime}
            </span>
            <span>.</span>
          </div>
        )}

        {/* LAYOUT 2: Visual Milestone Stepper (Horizontal Run-of-Show) */}
        {activeLayout === 2 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-white/50">
              <span>Show Run-of-Show</span>
              <span className="text-amber-300 font-medium">{date}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                <Truck className="h-3.5 w-3.5 text-emerald-400 mb-1" />
                <span className="text-[10px] text-white/50 uppercase">Load-In</span>
                <span className="text-xs font-bold text-emerald-300">{loadInTime}</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-sky-950/30 border border-sky-500/20">
                <DoorOpen className="h-3.5 w-3.5 text-sky-400 mb-1" />
                <span className="text-[10px] text-white/50 uppercase">Doors</span>
                <span className="text-xs font-bold text-sky-300">{doorsTime}</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-purple-950/50 border border-purple-500/40 shadow-sm shadow-purple-950">
                <Guitar className="h-3.5 w-3.5 text-purple-300 mb-1" />
                <span className="text-[10px] text-purple-200/70 uppercase">On Stage</span>
                <span className="text-xs font-bold text-purple-200">{onStageTime}</span>
                <span className="text-[9px] text-pink-300">to {setEndTime}</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-amber-950/30 border border-amber-500/20">
                <Moon className="h-3.5 w-3.5 text-amber-400 mb-1" />
                <span className="text-[10px] text-white/50 uppercase">Wrap</span>
                <span className="text-xs font-bold text-amber-300">{wrapTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 3: VIP Concert Ticket Stub */}
        {activeLayout === 3 && (
          <div className="rounded-lg border border-dashed border-amber-400/30 bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-amber-950/40 p-3">
            <div className="flex items-center justify-between border-b border-dashed border-white/15 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                  7th Heaven Live Itinerary
                </span>
              </div>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white/80">
                {date}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs divide-x divide-white/10">
              <div className="pr-2">
                <span className="block text-[9px] uppercase tracking-wider text-white/40">Load-in</span>
                <span className="font-bold text-emerald-300">{loadInTime}</span>
              </div>
              <div className="px-2">
                <span className="block text-[9px] uppercase tracking-wider text-white/40">Doors</span>
                <span className="font-bold text-sky-300">{doorsTime}</span>
              </div>
              <div className="px-2">
                <span className="block text-[9px] uppercase tracking-wider text-purple-300">Band Set</span>
                <span className="font-bold text-purple-200">{onStageTime}–{setEndTime}</span>
              </div>
              <div className="pl-2">
                <span className="block text-[9px] uppercase tracking-wider text-white/40">Curfew</span>
                <span className="font-bold text-amber-300">{wrapTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 4: Production Call Sheet Grid */}
        {activeLayout === 4 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span className="font-mono uppercase">Production Call Sheet</span>
              <span className="font-semibold text-amber-300">{date}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/[0.03] border border-white/10 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-white/50">Crew Arrival</span>
                    <span className="font-bold text-white">{loadInTime}</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Load-in</span>
              </div>

              <div className="rounded-lg bg-white/[0.03] border border-white/10 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-4 w-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-white/50">Venue Doors</span>
                    <span className="font-bold text-white">{doorsTime}</span>
                  </div>
                </div>
                <span className="text-[10px] text-sky-400 font-mono">Open</span>
              </div>

              <div className="col-span-2 rounded-lg bg-purple-950/40 border border-purple-500/30 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Guitar className="h-4 w-4 text-purple-300 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-purple-300/70">7th Heaven Live Performance</span>
                    <span className="font-bold text-white">{onStageTime} to {setEndTime}</span>
                  </div>
                </div>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                  Live Show
                </span>
              </div>

              <div className="col-span-2 rounded-lg bg-white/[0.03] border border-white/10 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-white/50">Curfew & Load-out</span>
                    <span className="font-bold text-white">{wrapTime}</span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-mono">Wrap</span>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 5: Glowing Itinerary Pill Ribbon */}
        {activeLayout === 5 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-medium">
              <Calendar className="h-3 w-3 text-amber-300" />
              <span>Itinerary for <strong className="text-white">{date}</strong></span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-300">
                <Truck className="h-3 w-3" /> {loadInTime}
              </span>
              <span className="text-white/30 text-[11px]">→</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 font-semibold text-sky-300">
                <DoorOpen className="h-3 w-3" /> {doorsTime}
              </span>
              <span className="text-white/30 text-[11px]">→</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/50 bg-purple-600/30 px-3 py-1 font-bold text-purple-200 shadow-sm shadow-purple-900/50">
                <Guitar className="h-3.5 w-3.5 text-purple-300" /> {onStageTime}–{setEndTime}
              </span>
              <span className="text-white/30 text-[11px]">→</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-300">
                <Moon className="h-3 w-3" /> {wrapTime}
              </span>
            </div>
          </div>
        )}

        {/* LAYOUT 6: Vertical Hairline Stage Log */}
        {activeLayout === 6 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-white/50 mb-1 border-b border-white/10 pb-1">
              <span>Event Day Log</span>
              <span className="font-semibold text-amber-300">{date}</span>
            </div>
            <div className="relative pl-5 border-l-2 border-white/15 flex flex-col gap-2.5 text-xs">
              <div className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
                <div className="flex items-baseline justify-between">
                  <span className="text-white/60">Load-in & Crew Set</span>
                  <span className="font-bold text-emerald-300">{loadInTime}</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-sky-400 ring-2 ring-sky-950" />
                <div className="flex items-baseline justify-between">
                  <span className="text-white/60">Doors Open to Guests</span>
                  <span className="font-bold text-sky-300">{doorsTime}</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-purple-400 ring-2 ring-purple-950 animate-ping" />
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-purple-400 ring-2 ring-purple-950" />
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-purple-200">7th Heaven On Stage</span>
                  <span className="font-bold text-purple-300">{onStageTime} – {setEndTime}</span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-amber-950" />
                <div className="flex items-baseline justify-between">
                  <span className="text-white/60">Event Concludes (Curfew)</span>
                  <span className="font-bold text-amber-300">{wrapTime}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 7: Mini DAW Audio Track Bar */}
        {activeLayout === 7 && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Timeline Visualizer</span>
              <span className="font-mono text-[11px] text-amber-300 font-bold">{date}</span>
            </div>
            {/* Visual Bar */}
            <div className="h-6 w-full rounded-md bg-black/50 border border-white/10 flex overflow-hidden p-0.5 gap-0.5">
              <div className="h-full w-[20%] bg-emerald-500/30 rounded-sm flex items-center justify-center text-[9px] font-mono text-emerald-300 px-1">
                {loadInTime}
              </div>
              <div className="h-full w-[15%] bg-sky-500/20 rounded-sm flex items-center justify-center text-[9px] font-mono text-sky-300 px-1">
                Doors
              </div>
              <div className="h-full w-[40%] bg-gradient-to-r from-purple-600 to-pink-600 rounded-sm flex items-center justify-center text-[10px] font-bold text-white px-2 shadow-inner">
                🎸 7th Heaven ({onStageTime}–{setEndTime})
              </div>
              <div className="h-full w-[25%] bg-amber-500/20 rounded-sm flex items-center justify-center text-[9px] font-mono text-amber-300 px-1">
                Wrap {wrapTime}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-white/50 px-1">
              <span>🚚 Prep @ {loadInTime}</span>
              <span>🚪 Doors @ {doorsTime}</span>
              <span>🌙 Curfew @ {wrapTime}</span>
            </div>
          </div>
        )}

        {/* LAYOUT 8: Glassmorphic Floating Chips with Relative Timing */}
        {activeLayout === 8 && (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-white/70">
              Playing on <span className="font-bold text-amber-300">{date}</span>:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
                <span className="block text-[10px] uppercase text-emerald-400 font-bold">Load-in</span>
                <span className="text-sm font-black text-white">{loadInTime}</span>
                <span className="block text-[9px] text-white/40 mt-0.5">Soundcheck</span>
              </div>
              <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-2">
                <span className="block text-[10px] uppercase text-sky-400 font-bold">Doors</span>
                <span className="text-sm font-black text-white">{doorsTime}</span>
                <span className="block text-[9px] text-white/40 mt-0.5">Crowd In</span>
              </div>
              <div className="rounded-lg bg-purple-500/20 border border-purple-500/40 p-2 shadow-sm shadow-purple-950">
                <span className="block text-[10px] uppercase text-purple-300 font-bold">Live Show</span>
                <span className="text-sm font-black text-purple-200">{onStageTime}</span>
                <span className="block text-[9px] text-pink-300 mt-0.5">to {setEndTime}</span>
              </div>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
                <span className="block text-[10px] uppercase text-amber-400 font-bold">Curfew</span>
                <span className="text-sm font-black text-white">{wrapTime}</span>
                <span className="block text-[9px] text-white/40 mt-0.5">Load-out</span>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 9: Stage Flight Strip Console */}
        {activeLayout === 9 && (
          <div className="font-mono text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] text-white/50 border-b border-white/10 pb-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>FLIGHT STRIP // 7TH HEAVEN</span>
              </div>
              <span className="text-amber-300 font-bold">{date}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center bg-black/40 p-2 rounded border border-white/10">
              <div>
                <span className="block text-[9px] text-white/40">GATE</span>
                <span className="font-bold text-emerald-300">{loadInTime}</span>
              </div>
              <div>
                <span className="block text-[9px] text-white/40">BOARD</span>
                <span className="font-bold text-sky-300">{doorsTime}</span>
              </div>
              <div className="bg-purple-950/60 rounded px-1 py-0.5 border border-purple-500/40">
                <span className="block text-[9px] text-purple-300 font-bold">TAKEOFF</span>
                <span className="font-black text-purple-200">{onStageTime}</span>
              </div>
              <div>
                <span className="block text-[9px] text-white/40">LANDING</span>
                <span className="font-bold text-amber-300">{wrapTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 10: Hero Live Stage Banner */}
        {activeLayout === 10 && (
          <div className="flex flex-col gap-2.5">
            {/* Live Set Showcase */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-900/60 via-purple-700/50 to-pink-900/60 p-3 border border-purple-400/40 shadow-lg shadow-purple-950/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/30 text-purple-200 border border-purple-300/30">
                    <Guitar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-purple-200/80">
                      7th Heaven On Stage
                    </span>
                    <span className="text-base font-black text-white tracking-wide">
                      {onStageTime} <span className="text-pink-300 text-xs font-medium">to</span> {setEndTime}
                    </span>
                    {venueName && (
                      <span className="block text-[11px] text-purple-200/90 font-medium truncate mt-0.5">
                        📍 {venueName}
                        {venueCity ? ` · ${venueCity}` : ""}
                        {venueState ? `, ${venueState}` : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="inline-block rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                    {date}
                  </span>
                </div>
              </div>
            </div>

            {/* Production Waypoints */}
            <div className="flex items-center justify-between text-xs px-1 text-white/60">
              <div className="flex items-center gap-1.5">
                <Truck className="h-3 w-3 text-emerald-400" />
                <span>Load-in <strong className="text-emerald-300">{loadInTime}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <DoorOpen className="h-3 w-3 text-sky-400" />
                <span>Doors <strong className="text-sky-300">{doorsTime}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Moon className="h-3 w-3 text-amber-400" />
                <span>Wrap <strong className="text-amber-300">{wrapTime}</strong></span>
              </div>
            </div>

            {/* Dynamic Itinerary Sentence with Color Badges */}
            <div className="mt-1 pt-2.5 border-t border-white/10 text-xs sm:text-[13px] leading-relaxed text-white/80">
              <span>7th Heaven plays </span>
              {venueName ? (
                <>
                  <span>at </span>
                  <span className="inline-flex items-center rounded-md bg-purple-500/20 px-1.5 py-0.5 text-xs font-semibold text-purple-300">
                    {venueName}
                    {venueCity ? ` (${venueCity}${venueState ? `, ${venueState}` : ""})` : ""}
                  </span>
                  <span> on </span>
                </>
              ) : (
                <span>on </span>
              )}
              <span className="inline-flex items-center rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-300">
                {date}
              </span>
              <span>. Load-in at </span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-xs font-semibold text-emerald-300">
                {loadInTime}
              </span>
              <span>, doors at </span>
              <span className="inline-flex items-center rounded-md bg-sky-500/20 px-1.5 py-0.5 text-xs font-semibold text-sky-300">
                {doorsTime}
              </span>
              <span>, on stage </span>
              <span className="inline-flex items-center rounded-md bg-purple-500/30 px-1.5 py-0.5 text-xs font-semibold text-purple-300">
                {onStageTime}
              </span>
              <span> to </span>
              <span className="inline-flex items-center rounded-md bg-pink-500/30 px-1.5 py-0.5 text-xs font-semibold text-pink-300">
                {setEndTime}
              </span>
              <span>, wrapping at </span>
              <span className="inline-flex items-center rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-300">
                {wrapTime}
              </span>
              <span>.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
