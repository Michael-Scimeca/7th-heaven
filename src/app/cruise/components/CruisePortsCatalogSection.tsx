"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionBadge } from "@/components/SectionBadge";
import ContentFeatureIcon from "@/components/ContentFeatureIcon";
import { PORTS_DATA } from "../cruiseData";

interface CruisePortsCatalogSectionProps {
  sanityContent?: any;
}

export default function CruisePortsCatalogSection({
  sanityContent,
}: CruisePortsCatalogSectionProps) {
  const [activePortImages, setActivePortImages] = useState<
    Record<string, string>
  >({});

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
          <div className="title-group title-group--section max-w-3xl text-left">
            <h2 id="ports-heading">
              Ports of Call{" "}
              <span className="accent-gradient-text">Catalog</span>
            </h2>
            <p className="text-secondary mt-2 text-fluid-body">
              Discover tropical paradises, pristine beaches, and breathtaking
              Caribbean destinations featured on our upcoming concert cruise
              itineraries.
            </p>
          </div>
        </div>

        {/* PORTS GRID VIEW */}
        <ul className="grid grid-cols-1 gap-6 text-left md:grid-cols-2 lg:grid-cols-3">
          {portsList.map((port: any, idx: number) => {
            const currentImg = activePortImages[port.name] || port.image;
            return (
              <li key={`grid-${port.name}`}>
                <article className="flex h-full flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:border-white/25">
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
                        className="h-full w-full object-cover"
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

                      {/* Port Highlights List */}
                      {port.highlights && port.highlights.length > 0 && (
                        <ul className="mt-4 flex flex-col gap-2.5">
                          {port.highlights.map((h: string) => (
                            <li
                              key={h}
                              className="flex items-start gap-2.5 text-fluid-body text-white/90"
                            >
                              <ContentFeatureIcon className="!mt-0.5 shrink-0" />
                              <span className="leading-snug">{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Gallery Thumbnail Strip */}
                    {port.gallery && port.gallery.length > 1 && (
                      <div className="mt-5 border-t border-white/10 pt-4">
                        <div className="mb-2.5 flex items-center justify-between">
                          <span className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">
                            Port Gallery ({port.gallery.length})
                          </span>
                          <span className="text-[10px] text-white/40">
                            Hover or click to preview
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {port.gallery.map((gImg: string, gIdx: number) => {
                            const isActive = currentImg === gImg;
                            return (
                              <button
                                key={gIdx}
                                type="button"
                                aria-label={`View photo ${gIdx + 1} of ${port.name}`}
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
                                className={`group relative h-16 w-[calc(25%-8px)] min-w-[70px] max-w-[100px] shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-box)] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:h-18 ${
                                  isActive
                                    ? "z-10 border-[var(--color-amber)] ring-2 shadow-amber-500/30 ring-[var(--color-amber)]/60 opacity-100"
                                    : "border-white/20 hover:border-white/60 opacity-75 hover:opacity-100"
                                }`}
                                title={`View photo ${gIdx + 1}`}
                              >
                                <Image
                                  width={240}
                                  height={160}
                                  unoptimized
                                  src={gImg}
                                  alt={`${port.name} thumbnail ${gIdx + 1}`}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
