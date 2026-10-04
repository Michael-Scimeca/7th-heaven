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
          <div className="flex flex-col space-y-8 lg:hidden">
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
                  <address className="not-italic flex flex-col gap-3 w-full">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        aria-label={`Send email to ${repName} (${contact.category}): ${contact.email}`}
                        className="flex w-full items-center justify-center gap-2 border border-action/40 bg-action-soft px-4 py-3 font-semibold text-action transition-colors hover:bg-action/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ring rounded-[var(--radius-box)] min-h-[44px]"
                      >
                        <Mail className="h-4 w-4 text-action shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                        aria-label={`Call ${repName} (${contact.category}): ${contact.phone}`}
                        className="flex w-full items-center justify-center gap-2 border border-action/40 bg-action-soft px-4 py-3 font-semibold text-action transition-colors hover:bg-action/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ring rounded-[var(--radius-box)] min-h-[44px]"
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
                      loading={idx === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="w-full object-contain object-top max-h-[500px]"
                    />
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop Split View (lg:grid) */}
          <div className="hidden grid-cols-1 gap-6 lg:grid lg:grid-cols-12 flex-1 w-full">
            {/* Left Column: Contact Cards Directory */}
            <div className="flex flex-col text-left lg:col-span-5">
              <ul className="flex flex-col space-y-4">
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
                    <li key={cardKey}>
                      <article
                        onMouseEnter={() => setActivePhotoId(photoKey)}
                        onFocus={() => setActivePhotoId(photoKey)}
                        className="w-full text-left transition-[background-color,color,border-color,box-shadow,transform]"
                      >
                        <h3 className={`text-white transition-opacity ${isCardActive ? "opacity-100" : "opacity-75"}`}>
                          {repName}
                        </h3>

                        <div className={`mb-2 flex flex-wrap items-center gap-1.5 text-sm uppercase tracking-wide text-[color:var(--color-text-secondary)] transition-opacity ${isCardActive ? "opacity-100" : "opacity-75"}`}>
                          <span>{contact.category}</span>
                          {contact.company && (
                            <>
                              <span className="opacity-40" aria-hidden="true">•</span>
                              <span>{contact.company}</span>
                            </>
                          )}
                        </div>

                        {contact.note && (
                          <p className={`mb-2 italic text-[color:var(--color-text-muted)] text-sm transition-opacity ${isCardActive ? "opacity-100" : "opacity-75"}`}>
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
                    className={`absolute inset-0 flex items-end justify-end transition-opacity duration-300 ${isActive
                      ? "pointer-events-none z-10 opacity-100"
                      : "pointer-events-none z-0 opacity-0"
                      }`}
                  >
                    <picture className="pointer-events-none flex h-full w-full items-end justify-end">
                      <source media="(max-width: 768px)" srcSet={photo.mobile} />
                      <source media="(min-width: 769px)" srcSet={photo.desktop} />
                      <img
                        src={photo.desktop}
                        alt={photo.alt}
                        loading={photo.id === DEFAULT_PHOTO_ID ? "eager" : "lazy"}
                        fetchPriority={isActive ? "high" : "low"}
                        decoding={photo.id === DEFAULT_PHOTO_ID ? "sync" : "async"}
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
    </main>
  );
}

