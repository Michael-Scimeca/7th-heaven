"use client";
/* eslint-disable react-doctor/nextjs-no-img-element */

import { useState, useEffect } from "react";
import Image from "next/image";
import { Mail, Phone, Sparkles } from "lucide-react";
import { SectionBadge } from "@/components/SectionBadge";
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
}

const ALL_PHOTOS: ContactPhoto[] = [
  {
    id: "dickie",
    desktop: "/images/contact/Dickie-contact.webp",
    mobile: "/images/contact/Dickie-contact-mobile.webp",
    alt: "Dickie - Booking & Management",
    scaleClass: "scale-100",
  },
  {
    id: "lenny",
    desktop: "/images/contact/Lenny-contact.webp",
    mobile: "/images/contact/Lenny-contact-mobile.webp",
    alt: "Lenny Rago - Press & Media",
    scaleClass: "scale-100",
  },
  {
    id: "jeff",
    desktop: "/images/contact/Jeff-contact.webp",
    mobile: "/images/contact/Jeff-contact-mobile.webp",
    alt: "Jeff Dobbs - Technical & Production",
    scaleClass: "scale-100",
  },
  {
    id: "alan",
    desktop: "/images/contact/Alan-contact.webp",
    mobile: "/images/contact/Alan-contact-mobile.webp",
    alt: "Alan McRae - Advance Non-Technical",
    scaleClass: "scale-100",
  },
  {
    id: "mary",
    desktop: "/images/contact/Mary-contact.webp",
    mobile: "/images/contact/Mary-contact-mobile.webp",
    alt: "Mary Grivas - 7th Heaven Cruise & Vacations",
    scaleClass: "scale-100",
  },
];

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
  subtitle = "Get in touch with the 7th Heaven team. Hover or select a contact department below to view representative details.",
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
      className="site-container page-container relative flex min-h-[calc(100vh-100px)] flex-col overflow-hidden pb-0"
    >
      {/* Hero Header */}
      <header className="relative z-10 mb-[clamp(1rem,2.5vh,2.5rem)] max-w-5xl text-start">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1>{title}</h1>
            <p className="mt-3 max-w-2xl">{subtitle}</p>
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

      <div className="relative z-10 grid min-h-[700px] flex-1 grid-cols-1 items-stretch gap-6 md:grid-cols-12">
        {/* Left Column: Contact Cards (Full Width on Mobile, Smaller on Tablet md:col-span-5) */}
        <section
          aria-label="Contact Directory"
          className="flex h-full min-h-full w-full max-w-full flex-1 flex-col text-left md:col-span-5 md:max-w-md lg:col-span-4"
        >
          {/* Contact Cards List (1 Column Stacked, Distributed to fill section height) */}
          <ul className="flex h-full w-full flex-1 flex-col justify-between pb-6">
            {contacts.map((contact) => {
              const photoForThisCard = getPhotoForCategory(contact);
              const isCardActive = activePhotoId === photoForThisCard;

              return (
                <li
                  key={
                    (contact.email || "") +
                    (contact.category || "") +
                    (contact.name || "")
                  }
                  className="border-b border-white/10"
                >
                  <article className="flex flex-col">
                    <button
                      type="button"
                      onMouseEnter={() => setActivePhotoId(photoForThisCard)}
                      onClick={() => setActivePhotoId(photoForThisCard)}
                      className="group w-full cursor-pointer rounded text-left focus:ring-1 focus:ring-purple-400 focus:outline-none"
                    >
                      {/* Name & Title / Note */}
                      <div className="mb-[clamp(0.2rem,0.6vh,0.5rem)]">
                        <h3 className="transition-colors group-hover:text-purple-300">
                          {contact.name || "7th Heaven Representative"}
                        </h3>
                      </div>

                      {/* Category Pill */}
                      <div className="mb-[clamp(0.2rem,0.6vh,0.5rem)]">
                        <SectionBadge
                          label={contact.category || "General Contact"}
                          isActive={isCardActive}
                        />
                      </div>
                    </button>

                    {/* Contact Info: Email Top, Phone Directly Underneath */}
                    <address className="flex flex-col items-start pb-2 not-italic">
                      {/* Email */}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="a-btn group/link inline-flex w-fit items-center gap-2 text-[clamp(0.75rem,1.1vh,0.875rem)] whitespace-nowrap transition-colors hover:text-purple-300"
                        >
                          <span className="whitespace-nowrap decoration-white/20 underline-offset-4 group-hover/link:decoration-purple-300">
                            {contact.email}
                          </span>
                        </a>
                      )}

                      {/* Phone Number Directly Below Email */}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone.replace(/-/g, "")}`}
                          className="group/link inline-flex w-fit items-center gap-2 text-[clamp(0.9rem,1.5vh,1.25rem)] whitespace-nowrap transition-colors duration-150 hover:text-[var(--color-accent)]"
                        >
                          <span className="whitespace-nowrap">
                            {contact.phone}
                          </span>
                        </a>
                      )}
                    </address>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Right Column: Preloaded Contact Photos Stage Attached to Container */}
        <aside
          aria-label="Contact Representative Media Stage"
          className="pointer-events-none relative hidden min-h-[450px] items-end justify-end self-stretch md:col-span-7 md:flex lg:col-span-8"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 80%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 80%, transparent 100%)",
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
    </main>
  );
}
