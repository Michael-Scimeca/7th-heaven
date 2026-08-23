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
    <section id="contact-page" className="site-container relative flex flex-col text-[var(--text-color)] pt-[clamp(75px,10vh,120px)] min-h-[calc(100vh-100px)] pb-6">

      {/* Hero Header */}
      <div className="text-start max-w-5xl mb-[clamp(1rem,2.5vh,2.5rem)] pt-2 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e1e6ff29] border border-white/30 backdrop-blur-[16px] text-white text-[clamp(0.65rem,1vh,0.75rem)] font-black uppercase tracking-[0.2em] mb-[clamp(0.35rem,1vh,1rem)]">
          <span>DIRECT BAND MANAGEMENT &amp; INQUIRIES</span>
        </div>
        <h1 className="text-[clamp(2.5rem,6vh,7.5rem)] font-black uppercase italic tracking-tighter text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)] leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
          CONTACT <span className="inline-block pr-[0.15em] bg-gradient-to-r from-purple-300 via-pink-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(168,85,247,0.9)]">7TH HEAVEN</span>
        </h1>
        <p className=" text-white  text-[clamp(0.8rem,1.2vh,1.125rem)] font-medium mt-[clamp(0.25rem,0.8vh,0.75rem)] max-w-2xl leading-relaxed">
          Get in touch with the 7th Heaven team. Hover or select a contact department below to view representative details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start relative z-10">

        {/* Left Column: Contact Cards (Full Width on Mobile, Smaller on Tablet md:col-span-5) */}
        <div className="w-full max-w-full md:max-w-md md:col-span-5 lg:col-span-4 flex flex-col text-left">

          {/* Contact Cards List (1 Column Stacked) */}
          <div className="space-y-[clamp(0.4rem,1.2vh,1rem)] w-full">
            {contacts.map((contact) => {
              const photoForThisCard = getPhotoForCategory(contact);

              return (
                <div
                  key={(contact.email || "") + (contact.category || "") + (contact.name || "")}
                  onMouseEnter={() => setActivePhoto(photoForThisCard)}
                  onClick={() => setActivePhoto(photoForThisCard)}
                  className="pb-[clamp(0.4rem,1.2vh,1rem)] border-b border-white/10"
                >
                  {/* Category Pill */}
                  <div className="mb-[clamp(0.2rem,0.6vh,0.5rem)]">
                    <span className="px-2.5 py-0.5 rounded-full text-[clamp(0.65rem,0.95vh,0.75rem)] font-black uppercase tracking-wider text-white bg-[#e1e6ff29] border border-white/30 backdrop-blur-[16px]  inline-block">
                      {contact.category || "General Contact"}
                    </span>
                  </div>

                  {/* Name & Title / Note */}
                  <div className="mb-[clamp(0.2rem,0.6vh,0.5rem)]">
                    <h3 className="text-[clamp(1.1rem,2vh,1.5rem)] font-black text-white tracking-tight leading-snug">
                      {contact.name || "7th Heaven Representative"}
                    </h3>
                  </div>

                  {/* Contact Info: Email Top, Phone Directly Underneath */}
                  <div className="flex flex-col items-start gap-[clamp(0.15rem,0.5vh,0.625rem)]">
                    {/* Email */}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-flex items-center gap-2 text-[clamp(0.75rem,1.1vh,0.875rem)] font-bold text-white/80 hover:text-purple-300 transition-colors group/link w-fit whitespace-nowrap"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0 text-[#c084fc] group-hover/link:text-white transition-colors" />
                        <span className="underline underline-offset-4 decoration-white/20 group-hover/link:decoration-purple-300 whitespace-nowrap">
                          {contact.email}
                        </span>
                      </a>
                    )}

                    {/* Phone Number Directly Below Email */}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone.replace(/-/g, "")}`}
                        className="inline-flex items-center gap-2 text-[clamp(0.9rem,1.5vh,1.25rem)] font-black text-[var(--text-color)] hover:text-[var(--color-accent)] transition-colors duration-150 font-mono tracking-tight group/link w-fit whitespace-nowrap"
                      >
                        <Phone className="w-4 h-4 shrink-0 text-[#c084fc] group-hover/link:text-white transition-colors" />
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
          marginBottom: "-8%",
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
                style={{ marginBottom: "-6%" }}
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

        </div>
      </div>
    </section>
  );
}
