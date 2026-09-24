"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { SectionBadge } from "@/components/SectionBadge";
import LazyMount from "@/components/LazyMount";
import CheckMarkIcon from "@/components/CheckMarkIcon";
import { PORTS_DATA } from "../cruiseData";

interface CruisePortsCatalogSectionProps {
  sanityContent?: any;
}

export default function CruisePortsCatalogSection({
  sanityContent,
}: CruisePortsCatalogSectionProps) {
  const [portLayoutMode, setPortLayoutMode] = useState<
    "grid" | "spotlight" | "carousel" | "list"
  >("grid");
  const [activeSpotlightPort, setActiveSpotlightPort] = useState<number>(0);
  const [activePortImages, setActivePortImages] = useState<
    Record<string, string>
  >({});
  const [spotlightHoveredImage, setSpotlightHoveredImage] = useState<
    string | null
  >(null);
  const portCarouselRef = useRef<HTMLDivElement>(null);

  const portsList = sanityContent?.ports?.length
    ? sanityContent.ports
    : PORTS_DATA;

  const sectionTitle =
    sanityContent?.sections?.find((s: any) => s.sectionId === "ports")?.title ||
    "Ports of Call Catalog";
  const sectionTagline =
    sanityContent?.sections?.find((s: any) => s.sectionId === "ports")
      ?.subtitle || "Destination Explorer";

  return (
    <LazyMount
      as="section"
      id="ports"
      aria-label="Ports of Call Catalog"
      className="site-container py-section-fluid border-b border-white/10"
      minHeight="700px"
      rootMargin="300px 0px"
      style={{ contentVisibility: "auto", containIntrinsicSize: "700px" }}
    >
      <div>
        <div className="mb-10 max-w-3xl text-center md:text-left">
          <h2>{sectionTitle}</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-white/70 sm:text-base">
            Discover tropical paradises, pristine beaches, and breathtaking
            Caribbean destinations featured on our upcoming concert cruise
            itineraries.
          </p>
        </div>

        {/* LAYOUT 1: GRID VIEW */}
        {portLayoutMode === "grid" && (
          <ul className="animate-fadeIn grid grid-cols-1 gap-6 text-left md:grid-cols-2 lg:grid-cols-3">
            {portsList.map((port: any, idx: number) => {
              const currentImg = activePortImages[port.name] || port.image;
              return (
                <li key={`grid-${port.name}`}>
                  <article className="group flex h-full flex-col justify-between">
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-black sm:h-56">
                      {currentImg && (
                        <Image
                          key={currentImg}
                          width={400}
                          height={300}
                          unoptimized
                          src={currentImg}
                          alt={port.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute top-3 left-3 z-20">
                        <SectionBadge
                          label={`Port Call #${idx + 1}`}
                          className="border-white/20 !bg-black/90 shadow-lg backdrop-blur-md"
                        />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between pt-4">
                      <div>
                        <h4 className="mb-2 transition-colors group-hover:text-purple-300">
                          {port.name}
                        </h4>
                        <p>{port.desc}</p>

                        {/* Port Highlights */}
                        {port.highlights && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {port.highlights.map((h: string) => (
                              <span
                                key={h}
                                className="rounded-lg border border-white/10 bg-[#00000029] px-2 py-0.5"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Gallery Thumbnail Strip */}
                      {port.gallery && port.gallery.length > 1 && (
                        <div className="mt-4 flex flex-wrap gap-2 py-1">
                          {port.gallery.map((gImg: string, gIdx: number) => {
                            const isActive = currentImg === gImg;
                            return (
                              <button
                                key={gIdx}
                                type="button"
                                onMouseEnter={() =>
                                  setActivePortImages((prev) => ({
                                    ...prev,
                                    [port.name]: gImg,
                                  }))
                                }
                                onClick={() =>
                                  setActivePortImages((prev) => ({
                                    ...prev,
                                    [port.name]: gImg,
                                  }))
                                }
                                className={`h-11 w-14 shrink-0 cursor-pointer overflow-hidden border transition-all duration-200 ${isActive ? "z-10 scale-105 border-purple-400 ring-2 shadow-purple-500/20 ring-purple-500/60" : "border-white/20"}`}
                                title={`View photo ${gIdx + 1}`}
                              >
                                <Image
                                  width={56}
                                  height={44}
                                  unoptimized
                                  src={gImg}
                                  alt={`${port.name} thumb ${gIdx}`}
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        {/* LAYOUT 2: SPOTLIGHT HERO VIEW */}
        {portLayoutMode === "spotlight" && (
          <div className="animate-fadeIn grid grid-cols-1 gap-8 text-left lg:grid-cols-3">
            {/* Main Featured Hero Card */}
            <div className="relative overflow-hidden rounded-lg border-white/10 bg-[#00000029] shadow-2xl backdrop-blur-[16px] lg:col-span-2">
              <div className="relative h-72 w-full overflow-hidden bg-black md:h-96">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0c0c14] via-black/30 to-transparent" />
                {(spotlightHoveredImage ||
                  PORTS_DATA[activeSpotlightPort].image) && (
                  <Image
                    key={
                      spotlightHoveredImage ||
                      PORTS_DATA[activeSpotlightPort].image
                    }
                    width={800}
                    height={500}
                    unoptimized
                    src={
                      spotlightHoveredImage ||
                      PORTS_DATA[activeSpotlightPort].image
                    }
                    alt={PORTS_DATA[activeSpotlightPort].name}
                    className="animate-fadeIn h-full w-full scale-105 object-cover transition-all duration-500"
                  />
                )}
                <div className="absolute top-6 left-6 z-20">
                  <SectionBadge
                    label={`PORT CALL #${activeSpotlightPort + 1}`}
                    isActive
                    className="border-white/20 bg-black/90 shadow-lg backdrop-blur-md"
                  />
                </div>
              </div>
              <div className="- 6 relative z-20 p-8">
                <h3 className="mb-3">{PORTS_DATA[activeSpotlightPort].name}</h3>
                <p className="mb-6">{PORTS_DATA[activeSpotlightPort].desc}</p>

                {/* Highlights */}
                {PORTS_DATA[activeSpotlightPort].highlights && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {PORTS_DATA[activeSpotlightPort].highlights.map((h) => (
                      <span
                        key={h}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-900/60 px-3 py-1 text-purple-300"
                      >
                        <CheckMarkIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Gallery Thumbnails */}
                {PORTS_DATA[activeSpotlightPort].gallery && (
                  <div className="mb-6 border-t border-white/10 pt-4">
                    <span className="mb-2 block text-[10px] text-purple-300">
                      Destination Photo Gallery
                    </span>
                    <div className="flex flex-wrap gap-2.5 pt-1 pb-2">
                      {PORTS_DATA[activeSpotlightPort].gallery.map(
                        (gImg, gIdx) => {
                          const currentSpotlightImg =
                            spotlightHoveredImage ||
                            PORTS_DATA[activeSpotlightPort].image;
                          const isActive = currentSpotlightImg === gImg;
                          return (
                            <button
                              key={gIdx}
                              type="button"
                              onMouseEnter={() =>
                                setSpotlightHoveredImage(gImg)
                              }
                              onClick={() => setSpotlightHoveredImage(gImg)}
                              className={`h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-all duration-200 ${isActive ? "z-10 scale-105 border-purple-400 ring-2 shadow-purple-500/30 ring-purple-500/60" : "border-white/10"}`}
                              title={`View gallery image ${gIdx + 1}`}
                            >
                              <Image
                                width={96}
                                height={64}
                                unoptimized
                                src={gImg}
                                alt="Gallery Still"
                                className="h-full w-full object-cover"
                              />
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("book-now")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="cursor-pointer rounded-lg border-none bg-purple-600 px-6 py-3 transition-colors hover:bg-purple-500"
                  >
                    Book Cruise &amp; Visit{" "}
                    {PORTS_DATA[activeSpotlightPort].name.split(",")[0]}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Selectors */}
            <div className="space-y-3">
              <span className="mb-2 block text-[var(--font-size-2xs)] text-white/40">
                Select Destination to Preview:
              </span>
              {PORTS_DATA.map((port, idx) => (
                <button
                  key={`spotlight-${port.name}`}
                  type="button"
                  onClick={() => {
                    setActiveSpotlightPort(idx);
                    setSpotlightHoveredImage(null);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${activeSpotlightPort === idx ? "border-white/10 bg-[#00000029] backdrop-blur-[16px]" : "border-white/10 bg-[#00000029] backdrop-blur-[16px]"}`}
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
                    {port.image && (
                      <Image
                        width={200}
                        height={200}
                        unoptimized
                        src={port.image}
                        alt={port.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`truncate ${activeSpotlightPort === idx ? "text-purple-300" : " "}`}
                    >
                      {port.name}
                    </h4>
                    <span className="/35">Port #{idx + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LAYOUT 3: CAROUSEL SLIDER VIEW */}
        {portLayoutMode === "carousel" && (
          <div className="animate-fadeIn relative text-left">
            {/* Scroll buttons */}
            <div className="mb-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (portCarouselRef.current)
                    portCarouselRef.current.scrollBy({
                      left: -360,
                      behavior: "smooth",
                    });
                }}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border-white/10 bg-[#00000029] backdrop-blur-[16px] transition-colors"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => {
                  if (portCarouselRef.current)
                    portCarouselRef.current.scrollBy({
                      left: 360,
                      behavior: "smooth",
                    });
                }}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-[#00000029] backdrop-blur-[16px] transition-colors"
              >
                ▶
              </button>
            </div>

            <div
              ref={portCarouselRef}
              className="flex snap-x snap-mandatory scrollbar-none gap-6 overflow-x-auto pb-4"
              style={{ scrollbarWidth: "none" }}
            >
              {PORTS_DATA.map((port, idx) => {
                const currentImg = activePortImages[port.name] || port.image;
                return (
                  <div
                    key={`carousel-${port.name}`}
                    className="group flex w-[320px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-lg border-white/10 bg-[#00000029] backdrop-blur-[16px] transition-colors duration-300 hover:-translate-y-1 md:w-[380px]"
                  >
                    <div className="relative h-52 w-full overflow-hidden bg-black/60">
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0b0b12] via-transparent to-black/30" />
                      {currentImg && (
                        <Image
                          key={currentImg}
                          width={400}
                          height={300}
                          unoptimized
                          src={currentImg}
                          alt={port.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <span className="absolute top-4 left-4 z-20 rounded-lg border border-white/10 bg-black/70 px-3 py-1 text-purple-300 backdrop-blur-[45px]">
                        {idx + 1} / {PORTS_DATA.length}
                      </span>
                    </div>
                    <div className="relative z-20 -mt-8 p-6">
                      <h4 className="mb-2 transition-colors group-hover:text-purple-300">
                        {port.name}
                      </h4>
                      <p>{port.desc}</p>

                      {/* Highlights */}
                      {port.highlights && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {port.highlights.map((h) => (
                            <span
                              key={h}
                              className="rounded-lg border border-purple-500/30 bg-purple-900/40 px-2 py-0.5 text-[10px] text-purple-300"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Gallery Thumbnails */}
                      {port.gallery && port.gallery.length > 1 && (
                        <div className="mt-4 flex flex-wrap gap-2 py-1">
                          {port.gallery.map((gImg, gIdx) => {
                            const isActive = currentImg === gImg;
                            return (
                              <button
                                key={gIdx}
                                type="button"
                                onMouseEnter={() =>
                                  setActivePortImages((prev) => ({
                                    ...prev,
                                    [port.name]: gImg,
                                  }))
                                }
                                onClick={() =>
                                  setActivePortImages((prev) => ({
                                    ...prev,
                                    [port.name]: gImg,
                                  }))
                                }
                                className={`h-10 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-all duration-200 ${isActive ? "z-10 scale-105 border-purple-400 ring-2 shadow-purple-500/20 ring-purple-500/60" : "border-white/10"}`}
                              >
                                <Image
                                  width={48}
                                  height={40}
                                  unoptimized
                                  src={gImg}
                                  alt={`${port.name} thumb ${gIdx}`}
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LAYOUT 4: COMPACT LIST VIEW */}
        {portLayoutMode === "list" && (
          <div className="animate-fadeIn mx-auto max-w-5xl space-y-4 text-left">
            {PORTS_DATA.map((port, idx) => (
              <div
                key={`list-${port.name}`}
                className="flex flex-col items-start gap-6 rounded-2xl border-white/10 bg-[#00000029] p-4 backdrop-blur-[16px] transition-colors duration-300 hover:bg-white/[0.08] md:flex-row md:items-center md:p-6"
              >
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg md:h-28 md:w-48">
                  {port.image && (
                    <Image
                      width={200}
                      height={200}
                      unoptimized
                      src={port.image}
                      alt={port.name}
                      className="h-full w-full object-cover transition-transform"
                    />
                  )}
                  <span className="absolute top-2 left-2 rounded border border-white/10 bg-black/80 px-2 py-0.5 text-purple-300">
                    Port #{idx + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <h4>{port.name}</h4>
                  </div>
                  <p>{port.desc}</p>

                  {/* Highlights */}
                  {port.highlights && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {port.highlights.map((h) => (
                        <span
                          key={h}
                          className="rounded-lg border border-purple-500/30 bg-purple-900/40 px-2 py-0.5 text-[10px] text-purple-300"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("book-now")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="shrink-0 cursor-pointer rounded-xl border-white/10 bg-[#00000029] px-4 py-2 backdrop-blur-[16px] transition-colors"
                >
                  Book →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </LazyMount>
  );
}
