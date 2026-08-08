"use client";

import React from "react";
import BioScrollReveal, { RevealMember } from "@/components/BioScrollReveal";

const SAMPLE_MEMBERS: RevealMember[] = [
  {
    id: "rich-richards",
    name: "RICH RICHARDS",
    role: "FOUNDER / GUITAR & KEYBOARDS",
    subtitle: "EST. 1985",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
    description: "Founder and primary songwriter of 7th Heaven, playing over 5,000 festival, stadium, and venue shows across North America.",
    linkHref: "/bio",
  },
  {
    id: "keith-semple",
    name: "KEITH SEMPLE",
    role: "LEAD VOCALS & GUITAR",
    subtitle: "THE VOICE",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    description: "Powerhouse lead vocalist and finalist on NBC's The Voice. Delivers high-octane stadium vocal performances every night.",
    linkHref: "/bio",
  },
  {
    id: "mark-vandenberg",
    name: "MARK VANDENBERG",
    role: "DRUMS & PERCUSSION",
    subtitle: "THE RHYTHM",
    imageUrl: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?q=80&w=1200&auto=format&fit=crop",
    description: "Master percussionist driving 7th Heaven's iconic high-energy arena rock tempo and live stadium show pulse.",
    linkHref: "/bio",
  },
  {
    id: "nick-cox",
    name: "NICK COX",
    role: "LEAD GUITAR",
    subtitle: "THE SOLOS",
    imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop",
    description: "Virtuoso lead guitarist crafting soaring solos, dual-guitar harmonies, and electrifying live stage solos.",
    linkHref: "/bio",
  },
  {
    id: "sami-aser",
    name: "SAMI ASER",
    role: "BASS & BACKING VOCALS",
    subtitle: "THE GROOVE",
    imageUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=1200&auto=format&fit=crop",
    description: "Laying down thunderous bass grooves and multi-part vocal harmonies that anchor 7th Heaven's signature sound.",
    linkHref: "/bio",
  },
];

export default function ScrollRevealDemoPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <BioScrollReveal
        title="BAND MEMBERS & LEADERSHIP"
        subtitle="SCROLL-DRIVEN GSAP REVEAL SHOWCASE"
        members={SAMPLE_MEMBERS}
      />
    </div>
  );
}
