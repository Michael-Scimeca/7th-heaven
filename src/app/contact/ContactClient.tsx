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
          <div className="mb-10 text-left">
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-left text-[var(--text-color)]">
              Contact <span className="gradient-text">Info</span>
            </h1>
            <p className="text-sm md:text-base text-[var(--muted-text)] max-w-xl mt-2 text-left">
              For booking, press inquiries, and production advance.
            </p>
          </div>

          {/* Contact Items List */}
          <div
            className="flex flex-col gap-10 max-w-2xl"
            onMouseLeave={() => setActivePhoto(DEFAULT_PHOTO)}
          >
            {contacts.map((contact) => {
              const photoForThisCard = getPhotoForCategory(contact);

              return (
                <div
                  key={contact.category || contact.name}
                  id={`contact-card-${contact.category}`}
                  onMouseEnter={() => setActivePhoto(photoForThisCard)}
                  className="flex flex-col justify-between border-b border-white/10 pb-8 last:border-b-0 last:pb-0 group/card transition-colors cursor-pointer"
                >
                  <div>
                    <h3 className="font-[var(--font-heading)] text-2xl md:text-3xl font-black text-[var(--color-accent)] group-hover/card:text-white transition-colors mb-1.5">
                      {contact.category}
                    </h3>
                    {contact.company && (
                      <p className="text-base md:text-xl font-extrabold text-[var(--text-color)] mb-0.5">
                        {contact.company}
                      </p>
                    )}
                    {contact.name && (
                      <p className="text-sm md:text-lg font-medium text-[var(--muted-text)]">
                        {contact.name}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}?subject=7th%20heaven`}
                        className="flex items-center gap-2.5 text-base md:text-xl font-bold text-[var(--text-color)] hover:text-[var(--color-accent)] transition-colors duration-150 group/link"
                      >
                        <Mail className="w-5 h-5 md:w-6 md:h-6 shrink-0 text-[#c084fc] group-hover/link:text-white transition-colors" />
                        <span>{contact.email}</span>
                      </a>
                    )}
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

      {/* Right Column: Preloaded Contact Photos Stage (A Little Bit Smaller) */}
      <div className="hidden lg:block absolute bottom-0 right-0 z-0 pointer-events-none w-[calc(50vw-540px)] min-w-[390px] max-w-[860px] h-[78vh] max-h-[760px]">
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
                  sizes="60vw"
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
