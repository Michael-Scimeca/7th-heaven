"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { LayoutGrid, Sparkles, SlidersHorizontal, List, MapPin, Compass } from "lucide-react";
import { SectionBadge } from "@/components/SectionBadge";
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
    <section
      id="ports"
      aria-labelledby="ports-heading"
      className="section site-container"
    >
      <div>
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="title-group title-group--section max-w-2xl text-left">
            <div className="mb-2 flex items-center gap-2">
              <Compass className="h-4 w-4 text-[var(--color-amber)]" />
              <span className="text-fluid-caption font-bold tracking-widest text-[var(--color-amber)] uppercase">
                {sectionTagline}
              </span>
            </div>
            <h2 className="" id="ports-heading">{sectionTitle}</h2>
            <p className="text-secondary mt-2">
              Discover tropical paradises, pristine beaches, and breathtaking
              Caribbean destinations featured on our upcoming concert cruise
              itineraries.
            </p>
          </div>

          {/* Interactive Layout Switcher */}
          <div
            role="tablist"
            aria-label="Port layout view options"
            className="flex items-center gap-1.5 self-start rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-1 backdrop-blur-md md:self-auto"
          >
            {[
              { id: "grid" as const, label: "Grid", icon: LayoutGrid },
              { id: "spotlight" as const, label: "Spotlight", icon: Sparkles },
              { id: "carousel" as const, label: "Carousel", icon: SlidersHorizontal },
              { id: "list" as const, label: "List", icon: List },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={portLayoutMode === id}
                type="button"
                onClick={() => setPortLayoutMode(id)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-[calc(var(--radius-box)-2px)] px-3 py-1.5 text-fluid-caption font-medium transition-colors ${
                  portLayoutMode === id
                    ? "border border-amber-500/30 bg-[var(--color-amber)]/20 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* LAYOUT 1: GRID VIEW */}
        {portLayoutMode === "grid" && (
          <ul className="animate-fadeIn grid grid-cols-1 gap-6 text-left md:grid-cols-2 lg:grid-cols-3">
            {portsList.map((port: any, idx: number) => {
              const currentImg = activePortImages[port.name] || port.image;
              return (
                <li key={`grid-${port.name}`}>
                  <article className="group flex h-full flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-[border-color,transform] hover:border-[var(--color-amber)]/40 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-48 w-full overflow-hidden rounded-[var(--radius-box)] bg-black sm:h-56">
                      {currentImg && (
                        <Image
                          key={currentImg}
                          width={400}
                          height={300}
                          loading="lazy"
                          unoptimized
                          src={currentImg}
                          alt={port.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute top-3 left-3 z-20">
                        <SectionBadge
                          label={`Port Call #${idx + 1}`}
                          className="border-white/20 !bg-black/90 shadow-lg"
                        />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col pt-5">
                      <div>
                        <h3 className="text-fluid-h4 text-white mb-2">{port.name}</h3>
                        <p className="text-secondary text-fluid-body line-clamp-3">{port.desc}</p>

                        {/* Port Highlights */}
                        {port.highlights && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {port.highlights.map((h: string) => (
                              <span
                                key={h}
                                className="rounded-[var(--radius-box)] border border-white/10 bg-white/5 px-2.5 py-1 text-fluid-caption text-white/80"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Gallery Thumbnail Strip */}
                      {port.gallery && port.gallery.length > 1 && (
                        <div className="mt-5 flex flex-wrap gap-2.5 border-t border-white/10 pt-4">
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
                                className={`h-16 w-24 sm:h-18 sm:w-28 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-box)] border transition-[border-color,transform,box-shadow] ${
                                  isActive
                                    ? "z-10 scale-105 border-[var(--color-amber)] ring-2 shadow-amber-500/30 ring-[var(--color-amber)]/60"
                                    : "border-white/20 hover:border-white/60 hover:scale-102"
                                } `}
                                title={`View photo ${gIdx + 1}`}
                              >
                                <Image
                                  width={120}
                                  height={80}
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
            <div className="relative overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-sm lg:col-span-2">
              <div className="relative h-72 w-full overflow-hidden bg-black md:h-96">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0a0c] via-black/40 to-transparent" />
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
                      className="animate-fadeIn h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  )}
                <div className="absolute top-6 left-6 z-20">
                  <SectionBadge
                    label={`PORT CALL #${activeSpotlightPort + 1}`}
                    isActive
                    className="border-white/20 bg-black/90 shadow-lg"
                  />
                </div>
              </div>
              <div className="relative z-20 p-6 md:p-8">
                <h3 className="text-fluid-h3 text-white mb-3">{PORTS_DATA[activeSpotlightPort].name}</h3>
                <p className="text-secondary text-fluid-body mb-6">{PORTS_DATA[activeSpotlightPort].desc}</p>

                {/* Highlights */}
                {PORTS_DATA[activeSpotlightPort].highlights && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {PORTS_DATA[activeSpotlightPort].highlights.map((h) => (
                      <span
                        key={h}
                        className="inline-flex items-center gap-1.5 rounded-[var(--radius-box)] border border-amber-500/30 bg-amber-950/40 px-3 py-1 text-fluid-caption font-medium text-amber-200"
                      >
                        <CheckMarkIcon className="h-3.5 w-3.5 shrink-0 text-[var(--color-amber)]" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Gallery Thumbnails */}
                {PORTS_DATA[activeSpotlightPort].gallery && (
                  <div className="mb-6 border-t border-white/10 pt-4">
                    <span className="mb-2 block text-fluid-caption font-semibold tracking-wider text-white/60 uppercase">
                      Destination Photo Gallery
                    </span>
                    <div className="flex flex-wrap gap-3 pt-1 pb-2">
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
                              className={`h-20 w-32 sm:h-24 sm:w-36 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-box)] border transition-[border-color,transform,box-shadow] ${
                                isActive
                                  ? "z-10 scale-105 border-[var(--color-amber)] ring-2 shadow-amber-500/30 ring-[var(--color-amber)]/60"
                                  : "border-white/15 hover:border-white/50 hover:scale-102"
                              } `}
                              title={`View gallery image ${gIdx + 1}`}
                            >
                              <Image
                                width={150}
                                height={100}
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
                    className="cursor-pointer rounded-[var(--radius-box)] border border-amber-500/40 bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-3 text-fluid-body font-bold text-white shadow-lg transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
                  >
                    Book Cruise &amp; Visit{" "}
                    {PORTS_DATA[activeSpotlightPort].name.split(",")[0]}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Selectors */}
            <div className="space-y-3">
              <span className="mb-2 block text-fluid-caption font-semibold tracking-wider text-white/50 uppercase">
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
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-[var(--radius-box)] border p-4 text-left transition-[border-color,background-color,box-shadow] ${
                    activeSpotlightPort === idx
                      ? "border-[var(--color-amber)]/50 bg-white/[0.08] shadow-md"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  } `}
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black">
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
                      className={`text-fluid-body truncate ${
                        activeSpotlightPort === idx ? "text-white" : "text-white/80"
                      }`}
                    >
                      {port.name}
                    </h4>
                    <span className="text-fluid-caption text-[var(--color-amber)]">Port Call #{idx + 1}</span>
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
                aria-label="Scroll left"
                onClick={() => {
                  if (portCarouselRef.current)
                    portCarouselRef.current.scrollBy({
                      left: -360,
                      behavior: "smooth",
                    });
                }}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[var(--radius-box)] border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
              >
                ◀
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => {
                  if (portCarouselRef.current)
                    portCarouselRef.current.scrollBy({
                      left: 360,
                      behavior: "smooth",
                    });
                }}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[var(--radius-box)] border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
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
                    className="group flex w-[85vw] max-w-[340px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-[border-color,transform] hover:border-[var(--color-amber)]/40 hover:-translate-y-1 md:w-[380px]"
                  >
                    <div className="relative h-52 w-full overflow-hidden bg-black/60">
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0a0c] via-transparent to-black/30" />
                      {currentImg && (
                        <Image
                          key={currentImg}
                          width={400}
                          height={300}
                          unoptimized
                          src={currentImg}
                          alt={port.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <span className="absolute top-4 left-4 z-20 rounded-full border border-white/10 bg-black/80 px-3 py-1 text-fluid-caption font-semibold text-white">
                        {idx + 1} / {PORTS_DATA.length}
                      </span>
                    </div>
                    <div className="relative z-20 p-5">
                      <h4 className="text-fluid-h4 text-white mb-2">{port.name}</h4>
                      <p className="text-secondary text-fluid-body line-clamp-3">{port.desc}</p>

                      {/* Highlights */}
                      {port.highlights && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {port.highlights.map((h) => (
                            <span
                              key={h}
                              className="rounded-[var(--radius-box)] border border-white/10 bg-white/5 px-2 py-0.5 text-fluid-caption text-white/80"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Gallery Thumbnails */}
                      {port.gallery && port.gallery.length > 1 && (
                        <div className="mt-4 flex flex-wrap gap-2.5 border-t border-white/10 pt-3">
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
                                className={`h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-box)] border transition-[border-color,transform,box-shadow] ${
                                  isActive
                                    ? "z-10 scale-105 border-[var(--color-amber)] ring-2 shadow-amber-500/20 ring-[var(--color-amber)]/60"
                                    : "border-white/20 hover:border-white/50 hover:scale-102"
                                } `}
                              >
                                <Image
                                  width={80}
                                  height={56}
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
                className="flex flex-col items-start gap-6 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-[border-color,background-color] hover:border-[var(--color-amber)]/30 hover:bg-white/[0.06] md:flex-row md:items-center md:p-6"
              >
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-[var(--radius-box)] md:h-28 md:w-48">
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
                  <span className="absolute top-2 left-2 rounded-full border border-white/10 bg-black/80 px-2.5 py-0.5 text-fluid-caption font-semibold text-white">
                    Port #{idx + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <h4 className="text-fluid-h4 text-white">{port.name}</h4>
                  </div>
                  <p className="text-secondary text-fluid-body">{port.desc}</p>

                  {/* Highlights */}
                  {port.highlights && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {port.highlights.map((h) => (
                        <span
                          key={h}
                          className="rounded-[var(--radius-box)] border border-white/10 bg-white/5 px-2 py-0.5 text-fluid-caption text-white/80"
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
                  className="shrink-0 cursor-pointer rounded-[var(--radius-box)] border border-white/20 bg-white/10 px-5 py-2.5 text-fluid-body font-semibold text-white transition-[border-color,background-color] hover:border-[var(--color-amber)] hover:bg-[var(--color-amber)]/20"
                >
                  Book →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
