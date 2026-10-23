"use client";
/* eslint-disable react-doctor/nextjs-no-img-element */

import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import PageHero from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import SeventhButton from "@/components/SeventhButton";

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
  width: number;
  height: number;
  mobileWidth: number;
  mobileHeight: number;
}

const ALL_PHOTOS: ContactPhoto[] = [
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
      className="site-container page-container page-stack-sm relative z-10 min-h-screen"
    >
      {/* Hero Header */}
      <PageHero
        title={title}
        titleId="contact-heading"
        subtitle={subtitle}
        className="relative z-10 max-w-5xl"
        align="left"
      />

      {/* ── 1. CONTACT PEOPLE DIRECTORY (FIRST SECTION) ── */}
      <section
        id="contact-team"
        aria-labelledby="contact-team-heading"
        className="section relative pb-0 lg:min-h-[calc(100dvh-12rem)] flex flex-col"
      >
        <SectionHeader id="contact-team-heading" title="Contact Directory" visuallyHidden />
        <div className="relative z-10 w-full flex-1 flex flex-col">
          {/* Mobile & Tablet Stacked View (< lg) */}
          <div className="flex flex-col gap-8 lg:hidden">
            {contacts.map((contact, idx) => {
              const photoKey = getPhotoForCategory(contact);
              const photo = PHOTO_MAP[photoKey] || ALL_PHOTOS[0];
              const cardKey =
                (contact.email || "") +
                (contact.category || "") +
                (contact.name || "");
              const repName = contact.name || photo.name || "7th Heaven Representative";

              return (
                <article
                  key={cardKey}
                  className="flex flex-col"
                >
                  {/* Category + Company */}
                  <div className="mb-2 flex flex-wrap items-center gap-1.5 text-sm uppercase tracking-wide text-[color:var(--color-text-secondary)]">
                    <span>{contact.category}</span>
                    {contact.company && (
                      <>
                        <span className="opacity-40" aria-hidden="true">•</span>
                        <span>{contact.company}</span>
                      </>
                    )}
                  </div>

                  {/* Name */}
                  <div className="title-group title-group--sub mb-4">
                    <h3 className="text-white uppercase">
                      {repName}
                    </h3>
                  </div>

                  {contact.note && (
                    <p className="mb-3 italic text-[color:var(--color-text-muted)] text-sm">
                      {contact.note}
                    </p>
                  )}

                  {/* Action Buttons: Stacked vertically matching action styling */}
                  <address className="not-italic flex flex-col gap-1.5 w-fit">
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
            {/* Booking CTA on Mobile (Stacked directly below contacts) */}
            <div
              id="contact-booking-cta-mobile"
              className="mt-2 pt-6 border-t border-white/10 w-full"
            >
              <div className="flex flex-col items-start gap-4 w-full max-w-xl">
                <div>
                  <h2 id="contact-booking-heading-mobile" className="text-white">
                    Book 7th Heaven for an Event
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-nocturne-rose leading-relaxed">
                    Check live touring availability, lock in your date, review staging and technical riders, and submit your custom concert request directly online.
                  </p>
                </div>
                <div>
                  <SeventhButton href="/book">
                    Go to Online Booking Form →
                  </SeventhButton>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout (Position absolute representative stage with overlapping z-10 content) */}
          <div className="hidden lg:block relative flex-1 w-full min-h-[calc(100dvh-14rem)]">
            {/* Left Column: Contact Cards Directory */}
            <div className="relative z-10 flex flex-col text-left w-full max-w-xl items-start">
              <ul className="flex flex-col gap-6 w-full max-w-lg items-start">
                {contacts.map((contact) => {
                  const photoKey = getPhotoForCategory(contact);
                  const photo = PHOTO_MAP[photoKey] || ALL_PHOTOS[0];
                  const isCardActive = activePhotoId === photoKey;
                  const cardKey =
                    (contact.email || "") +
                    (contact.category || "") +
                    (contact.name || "");
                  const repName = contact.name || photo.name || "7th Heaven Representative";

                  return (
                    <li key={cardKey} className="w-full">
                      <article
                        onMouseEnter={() => setActivePhotoId(photoKey)}
                        onFocus={() => setActivePhotoId(photoKey)}
                        className={`w-full text-left transition-opacity duration-200 cursor-pointer ${isCardActive
                          ? "opacity-100"
                          : "opacity-75 hover:opacity-100"
                          }`}
                      >
                        <h3 className="text-white">
                          {repName}
                        </h3>

                        <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm uppercase tracking-wide text-[color:var(--color-text-secondary)]">
                          <span>{contact.category}</span>
                          {contact.company && (
                            <>
                              <span className="opacity-40" aria-hidden="true">•</span>
                              <span>{contact.company}</span>
                            </>
                          )}
                        </div>

                        {contact.note && (
                          <p className="mb-1 italic text-[color:var(--color-text-muted)] text-xs sm:text-sm">
                            {contact.note}
                          </p>
                        )}

                        <address className="not-italic flex flex-col gap-1 text-sm">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              aria-label={`Send email to ${repName} (${contact.category}): ${contact.email}`}
                              className="transition-colors inline-flex items-center gap-2 text-action hover:text-action-hover hover:underline underline-offset-4 decoration-action/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ring focus-visible:text-action-hover focus-visible:underline rounded-[var(--radius-xs)] w-fit min-h-[32px]"
                            >
                              <Mail className="h-4 w-4 text-action shrink-0" />
                              <span>{contact.email}</span>
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                              aria-label={`Call ${repName} (${contact.category}): ${contact.phone}`}
                              className="transition-colors inline-flex items-center gap-2 text-action hover:text-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ring focus-visible:text-action-hover rounded-[var(--radius-xs)] w-fit min-h-[32px]"
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

              {/* Booking CTA on Desktop (Directly below contact cards in left column) */}
              <div
                id="contact-booking-cta"
                className="mt-8 pt-6 border-t border-white/10 w-full"
              >
                <div className="flex flex-col items-start gap-4 w-full max-w-xl">
                  <div>
                    <h2 id="contact-booking-heading" className="text-white">
                      Book 7th Heaven for an Event
                    </h2>
                    <p className="mt-2 text-sm text-nocturne-rose leading-relaxed">
                      Check live touring availability, lock in your date, review staging and technical riders, and submit your custom concert request directly online.
                    </p>
                  </div>
                  <div>
                    <SeventhButton href="/book">
                      Go to Online Booking Form →
                    </SeventhButton>
                  </div>
                </div>
              </div>
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
                    className={`absolute inset-0 flex items-end justify-end transition-opacity duration-300 ${isActive
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
                        decoding={photo.id === DEFAULT_PHOTO_ID ? "sync" : "async"}
                        className="contact-rep-stage-img"
                      />
                    </picture>
                  </div>
                );
              })}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

