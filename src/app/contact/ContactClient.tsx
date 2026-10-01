"use client";
/* eslint-disable react-doctor/nextjs-no-img-element */

import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import PageHero from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";

export interface ContactItem {
  category: string;
  company?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  note?: string | null;
}

interface ContactPhoto {
  id: string;
  desktop: string;
  mobile: string;
  alt: string;
  scaleClass: string;
  name: string;
  role: string;
}

const ALL_PHOTOS: ContactPhoto[] = [
  {
    id: "dickie",
    desktop: "/images/contact/dickie-contact.webp",
    mobile: "/images/contact/dickie-contact-mobile.webp",
    alt: "Dickie - Booking & Management",
    scaleClass: "scale-100",
    name: "Dickie",
    role: "Booking & Management",
  },
  {
    id: "lenny",
    desktop: "/images/contact/lenny-contact.webp",
    mobile: "/images/contact/lenny-contact-mobile.webp",
    alt: "Lenny Rago - Press & Media",
    scaleClass: "scale-100",
    name: "Lenny Rago",
    role: "Press & Media",
  },
  {
    id: "jeff",
    desktop: "/images/contact/jeff-contact.webp",
    mobile: "/images/contact/jeff-contact-mobile.webp",
    alt: "Jeff Dobbs - Technical & Production",
    scaleClass: "scale-100",
    name: "Jeff Dobbs",
    role: "Technical & Production",
  },
  {
    id: "alan",
    desktop: "/images/contact/alan-contact.webp",
    mobile: "/images/contact/alan-contact-mobile.webp",
    alt: "Alan McRae - Advance Non-Technical",
    scaleClass: "scale-100",
    name: "Alan McRae",
    role: "Advance Non-Technical",
  },
  {
    id: "mary",
    desktop: "/images/contact/mary-contact.webp",
    mobile: "/images/contact/mary-contact-mobile.webp",
    alt: "Mary Grivas - 7th Heaven Cruise & Vacations",
    scaleClass: "scale-100",
    name: "Mary Grivas",
    role: "Cruise & Vacations",
  },
];

const PHOTO_MAP: Record<string, ContactPhoto> = {
  dickie: ALL_PHOTOS[0],
  lenny: ALL_PHOTOS[1],
  jeff: ALL_PHOTOS[2],
  alan: ALL_PHOTOS[3],
  mary: ALL_PHOTOS[4],
};

const DEFAULT_PHOTO_ID = "dickie";

function getPhotoForCategory(contact: ContactItem): string {
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

export default function ContactClient({
  contacts,
  title = "CONTACT",
  subtitle = "Get in touch with the 7th Heaven team. Select a department below to view representative details.",
}: {
  contacts: ContactItem[];
  title?: string;
  subtitle?: string;
}) {
  const [activePhotoId, setActivePhotoId] = useState<string>(DEFAULT_PHOTO_ID);

  return (
    <main
      id="contact-page"
      className="site-container page-container page-stack-sm relative flex h-full lg:min-h-[calc(100dvh-var(--header-height))] flex-col justify-between"
    >
      {/* Hero Header */}
      <PageHero
        title={title}
        titleId="contact-heading"
        subtitle={subtitle}
        className="relative z-10 max-w-5xl"
        align="left"
      />

      {/* ── MAIN CONTENT (Mobile/Tablet Stacked, Desktop Split) ── */}
      <section
        id="contact-team"
        aria-labelledby="contact-team-heading"
        className="section relative flex-1 flex flex-col justify-end pb-0"
      >
        <SectionHeader id="contact-team-heading" title="Contact Directory" visuallyHidden />
        <div className="relative z-10 w-full flex-1 flex flex-col justify-end">
          {/* Mobile & Tablet Stacked View (< lg) */}
          <div className="flex flex-col space-y-4 lg:hidden">
            {contacts.map((contact) => {
              const photoKey = getPhotoForCategory(contact);
              const photo = PHOTO_MAP[photoKey] || ALL_PHOTOS[0];
              const cardKey =
                (contact.email || "") +
                (contact.category || "") +
                (contact.name || "");

              return (
                <article
                  key={cardKey}
                  className="flex flex-col"
                >
                  {/* Category + Company */}
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="">
                      {contact.category}
                    </span>
                    {contact.company && (
                      <span className="text-sm font-semibold text-white/80">
                        {contact.company}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="title-group title-group--sub mb-4">
                    <h3 className="text-white uppercase">
                      {contact.name || photo.name || "7th Heaven Representative"}
                    </h3>
                  </div>

                  {contact.note && (
                    <p className="italic text-white/60">
                      {contact.note}
                    </p>
                  )}

                  {/* Action Buttons: Stacked vertically full width */}
                  <address className="not-italic flex flex-col gap-5 w-full">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex w-full items-center justify-center gap-2 border border-purple-500/40 bg-purple-950/60 px-4 py-3 font-semibold text-purple-200 transition-colors hover:bg-purple-900/80"
                      >
                        <Mail className="h-4 w-4 text-purple-400" />
                        <span className="truncate">{contact.email}</span>
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                        className="flex w-full items-center justify-center gap-2 border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white/80 transition-colors hover:bg-white/10"
                      >
                        <Phone className="h-4 w-4 text-emerald-400" />
                        <span>{contact.phone}</span>
                      </a>
                    )}
                  </address>

                  {/* Representative Full-Width Photo Stacked Underneath */}
                  <div className="contact-rep-stage-mask relative mt-4 overflow-hidden">
                    <img
                      src={photo.desktop || photo.mobile}
                      alt={photo.alt}
                      className="w-full object-contain object-top max-h-[500px]"
                    />
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop Split View (lg:grid) */}
          <div className="hidden grid-cols-1  gap-6 lg:grid lg:grid-cols-12 flex-1 w-full">
            {/* Left Column: Contact Cards Directory */}
            <div className="flex flex-col text-left lg:col-span-5">
              <ul className="flex flex-col space-y-3">
                {contacts.map((contact) => {
                  const photoKey = getPhotoForCategory(contact);
                  const photo = PHOTO_MAP[photoKey] || ALL_PHOTOS[0];
                  const isCardActive = activePhotoId === photoKey;
                  const cardKey =
                    (contact.email || "") +
                    (contact.category || "") +
                    (contact.name || "");

                  return (
                    <li key={cardKey}>
                      <button
                        type="button"
                        onMouseEnter={() => setActivePhotoId(photoKey)}
                        onClick={() => setActivePhotoId(photoKey)}
                        className={`w-full text-left transition-[background-color,color,border-color,box-shadow,transform] cursor-pointer ${isCardActive
                          ? "opacity-100"
                          : "opacity-75 hover:opacity-100"
                          } `}
                      >
                        <h2 className="text-white">
                          {contact.name || photo.name || "7th Heaven Representative"}
                        </h2>

                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="">
                            {contact.category}
                          </span>
                          {contact.company && (
                            <span className="">
                              {contact.company}
                            </span>
                          )}
                        </div>



                        <address className="not-italic flex flex-col gap-1.5">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="transition-colors inline-flex items-center gap-2 text-purple-200/90 hover:text-white hover:underline decoration-purple-400"
                            >
                              <Mail className="h-3.5 w-3.5 text-purple-400" />
                              <span>{contact.email}</span>
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="transition-colors inline-flex items-center gap-2 text-white/70 hover:text-emerald-400"
                            >
                              <Phone className="h-3.5 w-3.5 text-emerald-400" />
                              <span>{contact.phone}</span>
                            </a>
                          )}
                        </address>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right Column: Preloaded Representative Photo Stage for Desktop */}
            <aside
              aria-label="Contact Representative Media Stage"
              className="contact-rep-stage lg:col-span-7"
            >
              {ALL_PHOTOS.map((photo) => {
                const isActive = activePhotoId === photo.id;
                return (
                  <div
                    key={photo.id}
                    className={`absolute inset-0 flex items-end justify-end transition-opacity ${isActive
                      ? "pointer-events-none z-10 opacity-100"
                      : "pointer-events-none z-0 opacity-0"
                      } `}
                  >
                    <picture className="pointer-events-none flex h-full w-full items-end justify-end">
                      <source media="(max-width: 768px)" srcSet={photo.mobile} />
                      <source media="(min-width: 769px)" srcSet={photo.desktop} />
                      <img
                        src={photo.desktop}
                        alt={photo.alt}
                        loading="eager"
                        fetchPriority={isActive ? "high" : "low"}
                        decoding="sync"
                        className={`contact-rep-stage-img ${photo.scaleClass} `}
                      />
                    </picture>
                  </div>
                );
              })}
            </aside>
          </div>
        </div>
      </section>
    </main >
  );
}

