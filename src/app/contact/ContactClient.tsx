"use client";
/* eslint-disable react-doctor/nextjs-no-img-element */

import { useState, useEffect } from "react";
import { Mail, Phone } from "lucide-react";
import { useMember } from "@/context/MemberContext";
import AddCmsButton from "@/components/AddCmsButton";

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
    desktop: "/images/contact/Dickie-contact.webp",
    mobile: "/images/contact/Dickie-contact-mobile.webp",
    alt: "Dickie - Booking & Management",
    scaleClass: "scale-100",
    name: "Dickie",
    role: "Booking & Management",
  },
  {
    id: "lenny",
    desktop: "/images/contact/Lenny-contact.webp",
    mobile: "/images/contact/Lenny-contact-mobile.webp",
    alt: "Lenny Rago - Press & Media",
    scaleClass: "scale-100",
    name: "Lenny Rago",
    role: "Press & Media",
  },
  {
    id: "jeff",
    desktop: "/images/contact/Jeff-contact.webp",
    mobile: "/images/contact/Jeff-contact-mobile.webp",
    alt: "Jeff Dobbs - Technical & Production",
    scaleClass: "scale-100",
    name: "Jeff Dobbs",
    role: "Technical & Production",
  },
  {
    id: "alan",
    desktop: "/images/contact/Alan-contact.webp",
    mobile: "/images/contact/Alan-contact-mobile.webp",
    alt: "Alan McRae - Advance Non-Technical",
    scaleClass: "scale-100",
    name: "Alan McRae",
    role: "Advance Non-Technical",
  },
  {
    id: "mary",
    desktop: "/images/contact/Mary-contact.webp",
    mobile: "/images/contact/Mary-contact-mobile.webp",
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
  const { member } = useMember();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (
      member?.role === "admin" ||
      member?.role === "crew" ||
      (typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin"))
    ) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [member?.role]);

  return (
    <main
      id="contact-page"
      className="site-container page-container relative flex min-h-screen flex-col pb-16"
    >
      {/* Hero Header */}
      <header className="relative z-10 mb-8 max-w-5xl text-start">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1>{title}</h1>
            <p className="mt-3 max-w-2xl text-white/70">{subtitle}</p>
          </div>
          {isAdmin && (
            <AddCmsButton
              label="EDIT IN SANITY"
              onClick={() =>
                window.open("/studio/structure/pageContent;contactUs", "_blank")
              }
              className="shrink-0 self-start sm:self-auto"
            />
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT (Mobile/Tablet Stacked, Desktop Split) ── */}
      {/* Mobile & Tablet Stacked View (< lg) */}
      <div className="relative z-10 flex flex-col space-y-12 lg:hidden">
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
              className="flex flex-col space-y-3 pb-8 border-b border-white/10 last:border-b-0"
            >
              {/* Category Pill */}
              <div>
                <span className="inline-block rounded-full border border-purple-400/30 bg-purple-500/20 px-3.5 py-1 text-xs font-bold text-purple-300 uppercase tracking-wider">
                  {contact.category}
                </span>
              </div>

              {/* Name & Company */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                  {contact.name || photo.name || "7th Heaven Representative"}
                </h3>
                {contact.company && (
                  <p className="text-sm font-semibold text-purple-200/70 mt-1">
                    {contact.company}
                  </p>
                )}
              </div>

              {contact.note && (
                <p className="text-xs italic text-white/60">
                  {contact.note}
                </p>
              )}

              {/* Action Buttons */}
              <address className="not-italic flex flex-col sm:flex-row gap-3 pt-2">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-950/60 px-4 py-2.5 text-xs font-semibold text-purple-200 transition-all hover:bg-purple-900/80"
                  >
                    <Mail className="h-4 w-4 text-purple-400" />
                    <span className="truncate">{contact.email}</span>
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/80 transition-all hover:bg-white/10"
                  >
                    <Phone className="h-4 w-4 text-emerald-400" />
                    <span>{contact.phone}</span>
                  </a>
                )}
              </address>

              {/* Representative Full-Width Photo Stacked Underneath */}
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-purple-900/20 to-black shadow-xl">
                <img
                  src={photo.desktop || photo.mobile}
                  alt={photo.alt}
                  className="w-full object-cover object-top max-h-[500px]"
                />
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop Split View (lg:grid) */}
      <div className="relative z-10 hidden grid-cols-1 items-stretch gap-8 lg:grid lg:grid-cols-12">
        {/* Left Column: Contact Cards Directory */}
        <section
          aria-label="Contact Directory"
          className="flex flex-col text-left lg:col-span-5"
        >
          <ul className="flex flex-col space-y-4">
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
                    className={`w-full text-left rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
                      isCardActive
                        ? "border-purple-500/60 bg-gradient-to-r from-purple-950/50 via-purple-900/30 to-black/50 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
                        : "border-white/10 bg-white/[0.04] hover:border-purple-500/30 hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-300">
                        {contact.category}
                      </span>
                      {contact.company && (
                        <span className="text-xs text-white/40 font-medium">
                          {contact.company}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3">
                      {contact.name || photo.name || "7th Heaven Representative"}
                    </h3>

                    <address className="not-italic flex flex-col gap-1.5 text-xs">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-purple-200/90 hover:text-white hover:underline decoration-purple-400"
                        >
                          <Mail className="h-3.5 w-3.5 text-purple-400" />
                          <span>{contact.email}</span>
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-white/70 hover:text-emerald-400"
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
        </section>

        {/* Right Column: Preloaded Representative Photo Stage for Desktop */}
        <aside
          aria-label="Contact Representative Media Stage"
          className="pointer-events-none relative hidden min-h-[550px] items-end justify-end self-stretch lg:flex lg:col-span-7"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
          }}
        >
          {ALL_PHOTOS.map((photo) => {
            const isActive = activePhotoId === photo.id;
            return (
              <div
                key={photo.id}
                className={`absolute inset-0 flex items-end justify-end transition-opacity duration-300 ease-out ${
                  isActive
                    ? "pointer-events-auto z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                }`}
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
                    className={`pointer-events-none max-h-full max-w-full origin-bottom-right object-contain object-bottom ${photo.scaleClass}`}
                  />
                </picture>
              </div>
            );
          })}
        </aside>
      </div>
    </main >
  );
}

