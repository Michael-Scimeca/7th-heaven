"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

export interface ContactItem {
  category: string;
  company?: string | null;
  name?: string | null;
  email?: string | null;
  phone: string;
  note?: string | null;
}

const ALL_PHOTOS = [
  { id: "/images/contact/Dickie-contact.png", alt: "Dickie - Booking & Management", scaleClass: "scale-100" },
  { id: "/images/contact/Lenny-contact.png", alt: "Lenny Rago - Press & Media", scaleClass: "scale-100" },
  { id: "/images/contact/Jeff-contact.png", alt: "Jeff Dobbs - Technical & Production", scaleClass: "scale-[0.96]" },
  { id: "/images/contact/Alan-contact.png", alt: "Alan McRae - Advance Non-Technical", scaleClass: "scale-[1.12]" },
];

const DEFAULT_PHOTO = "/images/contact/Dickie-contact.png";

function getPhotoForCategory(contact: ContactItem): string {
  const catLower = (contact.category || "").toLowerCase();
  const nameLower = (contact.name || "").toLowerCase();

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start relative z-10">

        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-7 flex flex-col text-left">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Contact & Booking
            </h1>
            <p className="text-white/60 text-sm md:text-base font-semibold max-w-xl">
              Get in touch with the 7th Heaven team. Hover or select a contact department below to view representative details.
            </p>
          </div>

          {/* Contact Cards List (1 Column Stacked) */}
          <div className="space-y-4 max-w-2xl">
            {contacts.map((contact) => {
              const photoForThisCard = getPhotoForCategory(contact);
              const isSelected = activePhoto === photoForThisCard;

              return (
                <div
                  key={contact.phone + (contact.name || "")}
                  onMouseEnter={() => setActivePhoto(photoForThisCard)}
                  onClick={() => setActivePhoto(photoForThisCard)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-purple-950/40 border-purple-500/50 shadow-[0_0_30px_rgba(140,14,175,0.25)] translate-x-1"
                      : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  {/* Category Pill */}
                  <div className="mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {contact.category || "General Contact"}
                    </span>
                  </div>

                  {/* Name & Title / Note */}
                  <div className="mb-4">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                      {contact.name || "7th Heaven Representative"}
                    </h3>
                    {contact.note && (
                      <p className="text-white/60 text-xs md:text-sm mt-0.5 font-medium">
                        {contact.note}
                      </p>
                    )}
                  </div>

                  {/* Contact Info: Email Top, Phone Directly Underneath (1 Column Stacked) */}
                  <div className="flex flex-col gap-2.5 pt-3 border-t border-white/10">
                    {/* Email */}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-2.5 text-sm md:text-base font-bold text-white/80 hover:text-purple-300 transition-colors group/link"
                      >
                        <Mail className="w-4 h-4 shrink-0 text-[#c084fc] group-hover/link:text-white transition-colors" />
                        <span className="underline underline-offset-4 decoration-white/20 group-hover/link:decoration-purple-300">
                          {contact.email}
                        </span>
                      </a>
                    )}

                    {/* Phone Number Directly Below Email */}
                    <a
                      href={`tel:${contact.phone.replace(/-/g, "")}`}
                      className="flex items-center gap-2.5 text-xl md:text-3xl font-black text-[var(--text-color)] hover:text-[var(--color-accent)] transition-colors duration-150 font-mono tracking-tight group/link"
                    >
                      <Phone className="w-6 h-6 md:w-7 md:h-7 shrink-0 text-[#c084fc] group-hover/link:text-white transition-colors" />
                      <span>{contact.phone}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column: Preloaded Contact Photos Stage */}
      <div
        className="hidden lg:block absolute bottom-0 right-0 z-0 pointer-events-none max-w-[1400px]"
        style={{
          height: "100vh",
          width: "50vw",
          right: 0,
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
