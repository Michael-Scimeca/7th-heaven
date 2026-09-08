"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { SectionBadge } from "@/components/SectionBadge";
import LazyMount from "@/components/LazyMount";
import { PORTS_DATA } from "../cruiseData";

export default function CruisePortsCatalogSection() {
  const [portLayoutMode, setPortLayoutMode] = useState<"grid" | "spotlight" | "carousel" | "list">("grid");
  const [activeSpotlightPort, setActiveSpotlightPort] = useState<number>(0);
  const portCarouselRef = useRef<HTMLDivElement>(null);

  return (
    <div className="site-container py-section-fluid">
      {/* ── SECTION 2: PORTS OF CALL ── */}
      <div id="ports" style={{ contentVisibility: "auto", containIntrinsicSize: "700px" }}>
        <LazyMount minHeight="700px" rootMargin="300px 0px">
          {/* Ports of Call Section */}
          <div>
            <div className="text-center md:text-left mb-10">
              <span className="font-bold uppercase tracking-[0.25em] text-purple-400">Destination Explorer</span>
              <h3 className="font-bold uppercase italic text-white mt-0.5">
                Ports of Call Catalog
              </h3>
            </div>

            {/* LAYOUT 1: GRID VIEW */}
            {portLayoutMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left animate-fadeIn">
                {PORTS_DATA.map((port, idx) => (
                  <div key={`grid-${port.name}`} className="flex flex-col justify-between group rounded-2xl overflow-hidden">
                    <div className="h-48 w-full relative overflow-hidden rounded-lg bg-black">
                      {port.image && <Image width={400} height={300} unoptimized src={port.image} alt={port.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                      <div className="absolute top-3 left-3 z-20">
                        <SectionBadge label={`Port Call #${idx + 1}`} />
                      </div>
                    </div>
                    <div className="pt-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold uppercase text-white mb-2 group-hover:text-purple-300 transition-colors">{port.name}</h4>
                        <p className="font-semibold">{port.desc}</p>

                        {/* Port Highlights */}
                        {port.highlights && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {port.highlights.map(h => (
                              <span key={h} className="font-bold px-2 py-0.5 rounded-lg text-white border border-white/10 bg-[#00000029]">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Gallery Thumbnail Strip */}
                      {port.gallery && port.gallery.length > 1 && (
                        <div className="flex gap-1.5 mt-4 overflow-x-auto scrollbar-none">
                          {
                            port.gallery.map((gImg, gIdx) => (
                              <div key={gIdx} className="w-12 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                <Image width={48} height={40} unoptimized src={gImg} alt={`${port.name} thumb ${gIdx}`} className="w-full h-full object-cover" />
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LAYOUT 2: SPOTLIGHT HERO VIEW */}
            {portLayoutMode === "spotlight" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fadeIn">
                {/* Main Featured Hero Card */}
                <div className="lg:col-span-2 bg-[#00000029] border-white/10 backdrop-blur-[16px] rounded-lg overflow-hidden relative shadow-2xl">
                  <div className="h-72 md:h-96 w-full relative overflow-hidden bg-black">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-black/30 to-transparent z-10" />
                    {PORTS_DATA[activeSpotlightPort].image && (
                      <Image width={800} height={500} unoptimized src={PORTS_DATA[activeSpotlightPort].image} alt={PORTS_DATA[activeSpotlightPort].name} className="w-full h-full object-cover scale-105" />
                    )}
                    <div className="absolute top-6 left-6 z-20">
                      <SectionBadge label="⭐ Featured Destination Spotlight" isActive />
                    </div>
                  </div>
                  <div className="p-8 relative z-20 -mt-16">
                    <h3 className="font-bold uppercase text-white mb-3">
                      {PORTS_DATA[activeSpotlightPort].name}
                    </h3>
                    <p className="mb-4">
                      {PORTS_DATA[activeSpotlightPort].desc}
                    </p>

                    {/* Highlights */}
                    {PORTS_DATA[activeSpotlightPort].highlights && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {PORTS_DATA[activeSpotlightPort].highlights.map(h => (
                          <span key={h} className="font-bold uppercase text-purple-300 bg-purple-900/60 px-3 py-1 rounded-lg border border-purple-500/40">
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Gallery Thumbnails */}
                    {PORTS_DATA[activeSpotlightPort].gallery && (
                      <div className="mb-6 pt-4 border-t border-white/10">
                        <span className="text-[10px] uppercase text-purple-300 font-bold block mb-2">Destination Photo Gallery</span>
                        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
                          {PORTS_DATA[activeSpotlightPort].gallery.map((gImg, gIdx) => (
                            <div key={gIdx} className="w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                              <Image width={96} height={64} unoptimized src={gImg} alt="Gallery Still" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 items-center">
                      <button
                        type="button"
                        onClick={() => document.getElementById("book-now")?.scrollIntoView({ behavior: "smooth" })}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase transition-colors cursor-pointer border-none rounded-lg shadow-lg"
                      >
                        Book Cruise &amp; Visit {PORTS_DATA[activeSpotlightPort].name.split(',')[0]}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar Selectors */}
                <div className="space-y-3">
                  <span className="text-[var(--font-size-2xs)] font-bold text-white/40 uppercase block mb-2">Select Destination to Preview:</span>
                  {PORTS_DATA.map((port, idx) => (
                    <button
                      key={`spotlight-${port.name}`}
                      type="button"
                      onClick={() => setActiveSpotlightPort(idx)}
                      className={`w-full p-4 text-left transition-colors cursor-pointer flex items-center gap-4 rounded-2xl border ${activeSpotlightPort === idx ? "bg-[#00000029] border-white/10 backdrop-blur-[16px]" : "bg-[#00000029] border-white/10 backdrop-blur-[16px]"}`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black border border-white/10">
                        {port.image && <Image width={200} height={200} unoptimized src={port.image} alt={port.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold uppercase truncate ${activeSpotlightPort === idx ? "text-purple-300" : "text-white"}`}>
                          {port.name}
                        </h4>
                        <span className="text-white/35">Port #{idx + 1}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LAYOUT 3: CAROUSEL SLIDER VIEW */}
            {portLayoutMode === "carousel" && (
              <div className="relative animate-fadeIn text-left">
                {/* Scroll buttons */}
                <div className="flex justify-end gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (portCarouselRef.current) portCarouselRef.current.scrollBy({ left: -360, behavior: "smooth" });
                    }}
                    className="w-11 h-11 rounded-lg bg-[#00000029] border-white/10 backdrop-blur-[16px] text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (portCarouselRef.current) portCarouselRef.current.scrollBy({ left: 360, behavior: "smooth" });
                    }}
                    className="w-11 h-11 rounded-lg bg-[#00000029] border border-white/10 backdrop-blur-[16px] text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ▶
                  </button>
                </div>

                <div
                  ref={portCarouselRef}
                  className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4"
                  style={{ scrollbarWidth: "none" }}
                >
                  {PORTS_DATA.map((port, idx) => (
                    <div
                      key={`carousel-${port.name}`}
                      className="w-[320px] md:w-[380px] shrink-0 snap-start bg-[#00000029] border-white/10 backdrop-blur-[16px] rounded-lg overflow-hidden flex flex-col justify-between transition-colors duration-300 group hover:-translate-y-1"
                    >
                      <div className="h-52 w-full relative overflow-hidden bg-black/60">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12] via-transparent to-black/30 z-10" />
                        {port.image && <Image width={400} height={300} unoptimized src={port.image} alt={port.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                        <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/70 backdrop-blur-[45px] border border-white/10 rounded-lg font-bold uppercase text-purple-300">
                          {idx + 1} / {PORTS_DATA.length}
                        </span>
                      </div>
                      <div className="p-6 relative z-20 -mt-8">
                        <h4 className="font-bold text-white uppercase mb-2 group-hover:text-purple-300 transition-colors">{port.name}</h4>
                        <p>{port.desc}</p>

                        {/* Highlights */}
                        {port.highlights && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {port.highlights.map(h => (
                              <span key={h} className="text-[10px] font-bold uppercase text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-lg border border-purple-500/30">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LAYOUT 4: COMPACT LIST VIEW */}
            {portLayoutMode === "list" && (
              <div className="space-y-4 animate-fadeIn text-left max-w-5xl mx-auto">
                {PORTS_DATA.map((port, idx) => (
                  <div key={`list-${port.name}`} className="bg-[#00000029] border-white/10 backdrop-blur-[16px] rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6 transition-colors duration-300 hover:bg-white/[0.08]">
                    <div className="w-full md:w-48 h-32 md:h-28 overflow-hidden rounded-lg relative shrink-0">
                      {port.image && <Image width={200} height={200} unoptimized src={port.image} alt={port.name} className="w-full h-full object-cover transition-transform" />}
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 rounded font-bold text-purple-300 uppercase border border-white/10">
                        Port #{idx + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold uppercase text-white">{port.name}</h4>
                      </div>
                      <p>{port.desc}</p>

                      {/* Highlights */}
                      {port.highlights && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {port.highlights.map(h => (
                            <span key={h} className="text-[10px] font-bold uppercase text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-lg border border-purple-500/30">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById("book-now")?.scrollIntoView({ behavior: "smooth" })}
                      className="shrink-0 px-4 py-2 bg-[#00000029] border-white/10 backdrop-blur-[16px] text-white font-bold uppercase transition-colors cursor-pointer rounded-xl"
                    >
                      Book →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </LazyMount>
      </div>
    </div>
  );
}
