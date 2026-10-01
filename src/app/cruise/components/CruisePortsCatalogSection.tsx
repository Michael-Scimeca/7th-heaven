"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Compass } from "lucide-react";
import { SectionBadge } from "@/components/SectionBadge";
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
            <div className="mb-2 flex items-center gap-2">
              <Compass className="h-4 w-4 text-[var(--color-amber)]" />
              <span className="text-fluid-caption font-bold tracking-widest text-[var(--color-amber)] uppercase">
                {sectionTagline}
              </span>
            </div>
            <h2 className="" id="ports-heading">{sectionTitle}</h2>
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
                              className={`h-16 w-24 sm:h-18 sm:w-28 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-box)] border transition-[border-color,box-shadow] ${
                                isActive
                                  ? "z-10 border-[var(--color-amber)] ring-2 shadow-amber-500/30 ring-[var(--color-amber)]/60"
                                  : "border-white/20 hover:border-white/60"
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
      </div>
    </section>
  );
}
