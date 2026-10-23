"use client";
/* eslint-disable react-doctor/nextjs-no-img-element */

import React, { useState } from "react";
import { Mail, Phone, Calendar, Radio, Sliders, Compass } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

export interface ContactItem {
  category: string;
  company?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  note?: string | null;
}

export interface ContactPhoto {
  id: string;
  desktop: string;
  mobile: string;
  alt: string;
  scaleClass: string;
  name: string;
  role: string;
  width: number;
  height: number;
  mobileWidth: number;
  mobileHeight: number;
}

export const ALL_PHOTOS: ContactPhoto[] = [
  {
    id: "dickie",
    desktop: "/images/contact/dickie-contact.webp",
    mobile: "/images/contact/dickie-contact-mobile.webp",
    alt: "Dickie - Booking & Management",
    scaleClass: "",
    name: "Dickie",
    role: "Booking & Management",
    width: 1074,
    height: 768,
    mobileWidth: 654,
    mobileHeight: 468,
  },
  {
    id: "lenny",
    desktop: "/images/contact/lenny-contact.webp",
    mobile: "/images/contact/lenny-contact-mobile.webp",
    alt: "Lenny Rago - Press & Media",
    scaleClass: "",
    name: "Lenny Rago",
    role: "Press & Media",
    width: 1074,
    height: 768,
    mobileWidth: 654,
    mobileHeight: 468,
  },
  {
    id: "jeff",
    desktop: "/images/contact/jeff-contact.webp",
    mobile: "/images/contact/jeff-contact-mobile.webp",
    alt: "Jeff Dobbs - Technical & Production",
    scaleClass: "",
    name: "Jeff Dobbs",
    role: "Technical & Production",
    width: 1074,
    height: 768,
    mobileWidth: 654,
    mobileHeight: 468,
  },
  {
    id: "alan",
    desktop: "/images/contact/alan-contact.webp",
    mobile: "/images/contact/alan-contact-mobile.webp",
    alt: "Alan McRae - Advance Non-Technical",
    scaleClass: "",
    name: "Alan McRae",
    role: "Advance Non-Technical",
    width: 1074,
    height: 688,
    mobileWidth: 654,
    mobileHeight: 419,
  },
  {
    id: "mary",
    desktop: "/images/contact/mary-contact.webp",
    mobile: "/images/contact/mary-contact-mobile.webp",
    alt: "Mary Grivas - 7th Heaven Cruise & Vacations",
    scaleClass: "",
    name: "Mary Grivas",
    role: "Cruise & Vacations",
    width: 1074,
    height: 768,
    mobileWidth: 654,
    mobileHeight: 468,
  },
];

export const PHOTO_MAP: Record<string, ContactPhoto> = {
  dickie: ALL_PHOTOS[0],
  lenny: ALL_PHOTOS[1],
  jeff: ALL_PHOTOS[2],
  alan: ALL_PHOTOS[3],
  mary: ALL_PHOTOS[4],
};

export const DEFAULT_PHOTO_ID = "dickie";

export function getPhotoForCategory(contact: ContactItem): string {
  const catLower = (contact.category || "").toLowerCase();
  const nameLower = (contact.name || "").toLowerCase();
  const emailLower = (contact.email || "").toLowerCase();

  if (
    catLower.includes("excursion") ||
    catLower.includes("hotel") ||
    catLower.includes("air") ||
    catLower.includes("vacation") ||
    catLower.includes("cruise") ||
    nameLower.includes("mary") ||
    emailLower.includes("mary")
  ) {
    return "mary";
  }
  if (
    catLower.includes("non-technical") ||
    nameLower.includes("alan") ||
    catLower.includes("alan")
  ) {
    return "alan";
  }
  if (
    catLower.includes("press") ||
    catLower.includes("media") ||
    nameLower.includes("lenny")
  ) {
    return "lenny";
  }
  if (
    nameLower.includes("jeff") ||
    (catLower.includes("technical") && !catLower.includes("non-technical"))
  ) {
    return "jeff";
  }
  return "dickie";
}

export const FALLBACK_CONTACTS: ContactItem[] = [
  {
    category: "Booking",
    company: "NTD Management",
    name: null,
    email: "info@NTDManagement.com",
    phone: "847-551-5363",
    note: null,
  },
  {
    category: "Press • Media",
    company: "NTD Records",
    name: "Lenny Rago",
    email: "LRago@NTDRecords.com",
    phone: "847-269-6200",
    note: null,
  },
  {
    category: "Technical • Production • Advance",
    company: null,
    name: "Jeff Dobbs",
    email: "jeffdobbs64@yahoo.com",
    phone: "847-772-5333",
    note: null,
  },
  {
    category: "Advance — Non-Technical",
    company: null,
    name: "Alan McRae",
    email: "Alan@NTDManagement.com",
    phone: "630-842-9129",
    note: null,
  },
  {
    category: "Cruise • Excursions / Hotels & Air",
    company: "NTD Vacations",
    name: "Mary Grivas",
    email: "Mary@NTDVacations.com",
    phone: "877-683-9753 Ext 5",
    note: null,
  },
];

export function ContactDirectorySection({
  contacts = FALLBACK_CONTACTS,
  hideGuidelines = false,
  showHeading = true,
}: {
  contacts?: ContactItem[];
  hideGuidelines?: boolean;
  showHeading?: boolean;
}) {
  const [activePhotoId, setActivePhotoId] = useState<string>(DEFAULT_PHOTO_ID);

  return (
    <div className="w-full flex flex-col gap-16">
      {/* ── MAIN DIRECTORY CONTENT (Mobile/Tablet Stacked, Desktop Split) ── */}
      <section
        id="contact-team"
        aria-labelledby="contact-team-heading"
        className="section relative pb-0"
      >
        {showHeading && (
          <SectionHeader
            id="contact-team-heading"
            title="Representative Directory"
            subtitle="Hover or select a department below to view direct representative details."
          />
        )}
        <div className="relative z-10 w-full">
          {/* Mobile & Tablet Stacked View (< lg) */}
          <div className="flex flex-col gap-8 lg:hidden">
            {contacts.map((contact, idx) => {
              const photoKey = getPhotoForCategory(contact);
              const photo = PHOTO_MAP[photoKey] || ALL_PHOTOS[0];
              const cardKey =
                (contact.email || "") +
                (contact.category || "") +
                (contact.name || "");
              const repName =
                contact.name || photo.name || "7th Heaven Representative";

              return (
                <article
                  key={`mobile-${cardKey}-${idx}`}
                  className="flex flex-col text-left"
                >
                  <h3 className="text-white text-xl font-bold">{repName}</h3>

                  <div className="mb-2 flex flex-wrap items-center gap-1.5 text-sm uppercase tracking-wide text-[color:var(--color-text-secondary)]">
                    <span>{contact.category}</span>
                    {contact.company && (
                      <>
                        <span className="opacity-40" aria-hidden="true">
                          •
                        </span>
                        <span>{contact.company}</span>
                      </>
                    )}
                  </div>

                  {contact.note && (
                    <p className="mb-3 italic text-[color:var(--color-text-muted)] text-sm">
                      {contact.note}
                    </p>
                  )}

                  <address className="not-italic flex flex-col gap-1.5 mt-4 w-fit">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        aria-label={`Send email to ${repName} (${contact.category}): ${contact.email}`}
                        className="transition-colors inline-flex items-center gap-2 text-action hover:text-action-hover hover:underline underline-offset-4 decoration-action/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ring focus-visible:text-action-hover focus-visible:underline rounded-[var(--radius-xs)] w-fit min-h-[36px]"
                      >
                        <Mail className="h-4 w-4 text-action shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                        aria-label={`Call ${repName} (${contact.category}): ${contact.phone}`}
                        className="transition-colors inline-flex items-center gap-2 text-action hover:text-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ring focus-visible:text-action-hover rounded-[var(--radius-xs)] w-fit min-h-[36px]"
                      >
                        <Phone className="h-4 w-4 text-action shrink-0" />
                        <span>{contact.phone}</span>
                      </a>
                    )}
                  </address>

                  {/* Representative Full-Width Photo Stacked Underneath */}
                  <div className="contact-rep-stage-mask relative mt-4 overflow-hidden">
                    <img
                      src={photo.desktop || photo.mobile}
                      alt={photo.alt}
                      title={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="eager"
                      decoding="async"
                      className="w-full object-contain object-top max-h-[340px] sm:max-h-[380px]"
                    />
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop Layout (Position absolute representative stage with overlapping z-10 content) */}
          <div className="hidden lg:block relative flex-1 w-full min-h-[calc(100dvh-14rem)]">
            {/* Left Column: Contact Cards Directory */}
            <div className="relative z-10 flex flex-col text-left w-full max-w-xl items-start">
              <ul className="flex flex-col gap-6">
                {contacts.map((contact) => {
                  const photoKey = getPhotoForCategory(contact);
                  const photo = PHOTO_MAP[photoKey] || ALL_PHOTOS[0];
                  const isCardActive = activePhotoId === photoKey;
                  const cardKey =
                    (contact.email || "") +
                    (contact.category || "") +
                    (contact.name || "");
                  const repName =
                    contact.name || photo.name || "7th Heaven Representative";

                  return (
                    <li key={cardKey}>
                      <article
                        onMouseEnter={() => setActivePhotoId(photoKey)}
                        onFocus={() => setActivePhotoId(photoKey)}
                        className={`w-full text-left transition-opacity duration-200 cursor-pointer ${
                          isCardActive
                            ? "opacity-100"
                            : "opacity-75 hover:opacity-100"
                        }`}
                      >
                        <h3 className="text-white">
                          {repName}
                        </h3>

                        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-sm uppercase tracking-wide text-[color:var(--color-text-secondary)]">
                          <span>{contact.category}</span>
                          {contact.company && (
                            <>
                              <span className="opacity-40" aria-hidden="true">
                                •
                              </span>
                              <span>{contact.company}</span>
                            </>
                          )}
                        </div>

                        {contact.note && (
                          <p className="mb-2 italic text-[color:var(--color-text-muted)] text-sm">
                            {contact.note}
                          </p>
                        )}

                        <address className="not-italic flex flex-col gap-1.5">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              aria-label={`Send email to ${repName} (${contact.category}): ${contact.email}`}
                              className="transition-colors inline-flex items-center gap-2 text-action hover:text-action-hover hover:underline underline-offset-4 decoration-action/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ring focus-visible:text-action-hover focus-visible:underline rounded-[var(--radius-xs)] w-fit min-h-[36px]"
                            >
                              <Mail className="h-4 w-4 text-action shrink-0" />
                              <span>{contact.email}</span>
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                              aria-label={`Call ${repName} (${contact.category}): ${contact.phone}`}
                              className="transition-colors inline-flex items-center gap-2 text-action hover:text-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ring focus-visible:text-action-hover rounded-[var(--radius-xs)] w-fit min-h-[36px]"
                            >
                              <Phone className="h-4 w-4 text-action shrink-0" />
                              <span>{contact.phone}</span>
                            </a>
                          )}
                        </address>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right Side: Preloaded Representative Photo Stage for Desktop */}
            <aside
              aria-label="Contact Representative Media Stage"
              className="contact-rep-stage"
            >
              {ALL_PHOTOS.map((photo) => {
                const isActive = activePhotoId === photo.id;
                return (
                  <div
                    key={photo.id}
                    className={`absolute inset-0 flex items-end justify-end transition-opacity duration-300 ${
                      isActive
                        ? "pointer-events-none z-10 opacity-100"
                        : "pointer-events-none z-0 opacity-0"
                    }`}
                  >
                    <picture className="pointer-events-none flex h-full w-full items-end justify-end">
                      <source
                        media="(max-width: 768px)"
                        srcSet={photo.mobile}
                        width={photo.mobileWidth}
                        height={photo.mobileHeight}
                      />
                      <source
                        media="(min-width: 769px)"
                        srcSet={photo.desktop}
                        width={photo.width}
                        height={photo.height}
                      />
                      <img
                        src={photo.desktop}
                        alt={photo.alt}
                        title={photo.alt}
                        width={photo.width}
                        height={photo.height}
                        loading="eager"
                        fetchPriority={isActive ? "high" : "low"}
                        decoding={
                          photo.id === DEFAULT_PHOTO_ID ? "sync" : "async"
                        }
                        className={`contact-rep-stage-img ${photo.scaleClass}`}
                      />
                    </picture>
                  </div>
                );
              })}
            </aside>
          </div>
        </div>
      </section>

      {/* ── DEPARTMENT INFORMATION & BOOKING GUIDE ── */}
      {!hideGuidelines && (
        <section
          id="contact-guide"
          aria-labelledby="contact-guide-heading"
          className="section"
        >
          <SectionHeader
            id="contact-guide-heading"
            title="Booking & Department Guidelines"
            subtitle="Direct information for festival committees, corporate event buyers, media, and travelers."
            divider={false}
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article className="flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-purple-500/40">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <h5 className="mb-2 font-bold text-white">
                  Concert & Event Booking
                </h5>
                <p className="text-sm text-white/70 leading-relaxed">
                  Looking to bring 7th Heaven to your summer festival, county
                  fair, casino ballroom, corporate gala, or private party? With
                  over 100 high-energy concerts annually, our management team
                  provides full tour riders, staging specs, and marketing
                  collateral.
                </p>
              </div>
              <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/50">
                Department: NTD Management
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-purple-500/40">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                  <Radio className="h-6 w-6" />
                </div>
                <h5 className="mb-2 font-bold text-white">
                  Press & Media Relations
                </h5>
                <p className="text-sm text-white/70 leading-relaxed">
                  For radio and television appearances, podcast interviews, press
                  credentials, high-resolution band photos, and feature stories,
                  reach out directly to our public relations and record label
                  team at NTD Records.
                </p>
              </div>
              <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/50">
                Department: NTD Records
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-purple-500/40">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                  <Sliders className="h-6 w-6" />
                </div>
                <h5 className="mb-2 font-bold text-white">
                  Technical Advance & Production
                </h5>
                <p className="text-sm text-white/70 leading-relaxed">
                  Venue production managers, audio engineers, and stage leads
                  can coordinate technical riders, stage plots, patch lists,
                  lighting requirements, and power specifications directly with
                  our touring production crew.
                </p>
              </div>
              <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/50">
                Department: Tour Technical Advance
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-purple-500/40">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                  <Compass className="h-6 w-6" />
                </div>
                <h5 className="mb-2 font-bold text-white">
                  Annual Music Cruise Inquiries
                </h5>
                <p className="text-sm text-white/70 leading-relaxed">
                  Planning to sail with 7th Heaven on our annual Caribbean or
                  European music voyage? Mary Grivas at NTD Vacations assists
                  with cabin selection, VIP concert passes, group rates, airfare,
                  hotel packages, and travel insurance.
                </p>
              </div>
              <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/50">
                Department: NTD Vacations
              </div>
            </article>
          </div>
        </section>
      )}
    </div>
  );
}
