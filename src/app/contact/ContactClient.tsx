"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Phone, Sparkles } from "lucide-react";

export interface ContactItem {
  category: string;
  company?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  note?: string | null;
}

const ALL_PHOTOS = [
  { id: "/images/contact/Dickie-contact.png", alt: "Dickie - Booking & Management", scaleClass: "scale-100" },
  { id: "/images/contact/Lenny-contact.png", alt: "Lenny Rago - Press & Media", scaleClass: "scale-100" },
  { id: "/images/contact/Jeff-contact.png", alt: "Jeff Dobbs - Technical & Production", scaleClass: "scale-100" },
  { id: "/images/contact/Alan-contact.png", alt: "Alan McRae - Advance Non-Technical", scaleClass: "scale-100" },
  { id: "/images/contact/Mary-contact.png", alt: "Mary Grivas - 7th Heaven Cruise & Vacations", scaleClass: "scale-100" },
];

const DEFAULT_PHOTO = "/images/contact/Dickie-contact.png";

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
    return "/images/contact/Mary-contact.png";
  }
  if (catLower.includes("non-technical") || nameLower.includes("alan") || catLower.includes("alan")) {
    return "/images/contact/Alan-contact.png";
  }
  if (catLower.includes("press") || catLower.includes("media") || nameLower.includes("lenny")) {
    return "/images/contact/Lenny-contact.png";
  }
  if (nameLower.includes("jeff") || (catLower.includes("technical") && !catLower.includes("non-technical"))) {
    return "/images/contact/Jeff-contact.png";
  }
  return "/images/contact/Dickie-contact.png";
}

export default function ContactClient({ contacts }: { contacts: ContactItem[] }) {
  const [activePhoto, setActivePhoto] = useState<string>(DEFAULT_PHOTO);

  return (
    <section id="contact-page" className="site-container relative flex flex-col text-[var(--text-color)] pt-[100px] min-h-[calc(100vh-100px)] pb-0">

      {/* Hero Header */}
      <div className="text-start max-w-5xl mb-10 pt-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/70 border border-purple-400/40 backdrop-blur-md text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(168,85,247,0.5)] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
          <span>DIRECT BAND MANAGEMENT &amp; INQUIRIES</span>
        </div>
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black uppercase italic tracking-tighter text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)] leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          CONTACT <span className="inline-block pr-[0.15em] bg-gradient-to-r from-purple-300 via-pink-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(168,85,247,0.9)]">7TH HEAVEN</span>
        </h1>
        <p className="text-white/60 text-base md:text-lg font-medium mt-3 max-w-2xl leading-relaxed">
          Get in touch with the 7th Heaven team. Hover or select a contact department below to view representative details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start relative z-10">

        {/* Left Column: Contact Cards (Full Width on Mobile, Smaller on Tablet md:col-span-5) */}
        <div className="w-full max-w-full md:max-w-md md:col-span-5 lg:col-span-4 flex flex-col text-left">

          {/* Contact Cards List (1 Column Stacked) */}
          <div className="space-y-4 w-full">
            {contacts.map((contact) => {
              const photoForThisCard = getPhotoForCategory(contact);
              const isSelected = activePhoto === photoForThisCard;

              return (
                <div
                  key={(contact.email || "") + (contact.category || "") + (contact.name || "")}
                  onMouseEnter={() => setActivePhoto(photoForThisCard)}
                  onClick={() => setActivePhoto(photoForThisCard)}
                  className="pb-4 border-b border-white/10"
                >
                  {/* Category Pill */}
                  <div className="mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block">
                      {contact.category || "General Contact"}
                    </span>
                  </div>

                  {/* Name & Title / Note */}
                  <div className="mb-3">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                      {contact.name || "7th Heaven Representative"}
                    </h3>
                  </div>

                  {/* Contact Info: Email Top, Phone Directly Underneath (Width Only as Far as Text) */}
                  <div className="flex flex-col items-start gap-2.5">
                    {/* Email */}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-flex items-center gap-2.5 text-xs md:text-sm font-bold text-white/80 hover:text-purple-300 transition-colors group/link w-fit whitespace-nowrap"
                      >
                        <Mail className="w-4 h-4 shrink-0 text-[#c084fc] group-hover/link:text-white transition-colors" />
                        <span className="underline underline-offset-4 decoration-white/20 group-hover/link:decoration-purple-300 whitespace-nowrap">
                          {contact.email}
                        </span>
                      </a>
                    )}

                    {/* Phone Number Directly Below Email */}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone.replace(/-/g, "")}`}
                        className="inline-flex items-center gap-2.5 text-base md:text-xl font-black text-[var(--text-color)] hover:text-[var(--color-accent)] transition-colors duration-150 font-mono tracking-tight group/link w-fit whitespace-nowrap"
                      >
                        <Phone className="w-5 h-5 shrink-0 text-[#c084fc] group-hover/link:text-white transition-colors" />
                        <span className="whitespace-nowrap">{contact.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      {/* Right Column: Preloaded Contact Photos Stage (Visible on Tablet & Desktop) */}
      <div
        className="hidden md:block absolute bottom-0 right-0 z-0 pointer-events-none max-w-[1400px]"
        style={{
          height: "100vh",
          width: "88vw",
          right: -78,
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 75%, transparent 98%)",
          maskImage: "linear-gradient(to bottom, black 0%, black 75%, transparent 98%)",
        }}
      >
        <div className="relative w-full h-full flex items-end justify-end">
          {ALL_PHOTOS.map((photo) => {
            const isActive = activePhoto === photo.id;
            return (
              <div
                key={photo.id}
                className={`absolute inset-0 transition-all duration-500 ease-out flex items-end justify-end ${isActive
                  ? "opacity-100 scale-100 filter-none"
                  : "opacity-0 scale-95 filter blur-sm"
                  }`}
              >
                <Image
                  src={photo.id}
                  alt={photo.alt}
                  fill
                  priority
                  unoptimized
                  sizes="50vw"
                  className={`object-contain object-bottom pointer-events-none drop-shadow-2xl origin-bottom-right ${photo.scaleClass}`}
                />
              </div>
            );
          })}
          {/* Bottom Gradient Fade Mask */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#06000c] via-[#06000c]/80 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}
