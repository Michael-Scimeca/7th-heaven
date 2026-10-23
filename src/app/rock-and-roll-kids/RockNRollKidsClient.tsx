/* eslint-disable react-doctor/iframe-missing-sandbox */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import SeventhButton from "@/components/SeventhButton";
import Button from "@/components/Button";
import CosmicTrackCard from "@/components/CosmicTrackCard";
import AddCmsButton from "@/components/AddCmsButton";
import SectionHeader from "@/components/SectionHeader";
import PageHero from "@/components/PageHero";
import { getMediaUrl } from "@/lib/sanity";
import {
  BookOpen,
  Tv,
  Guitar,
  Compass,
  Film,
  Gamepad2,
  Heart,
  Sparkles,
  Newspaper,
  Play,
  ExternalLink,
  Shield,
  Music,
  Users,
  Award,
  Flame,
  Star,
  CheckCircle2,
  Sliders,
  ChevronRight,
} from "lucide-react";
import {
  HERO_LAYOUT_PRESETS,
  HeroContentRenderer,
} from "./hero-layouts/heroLayoutPresets";

const ABOUT_DATA = {
  headline: "7th Heaven & the Rock 'n' Roll Kids",
  paragraph1:
    "7th heaven & the Rock 'n' Roll Kids is based on the band 7th heaven, which is globally known as a pop Rock Band. The animated series communicates messages of fun, positivity and social consciousness through the connection of music and imagination. Each episode focuses on problem solving, an adventure and a resolution.",
  paragraph2:
    "We have been working with a team of skilled people that are helping us build a new animated series based on 7th heaven. The show is based on the band as young kids, who bring positivity to other kids, which are called “The Rock and Roll Kids”. We are working to create this as an animated TV series and comic books, games, apps, videos and original music. In a world filled with so much negativity, we want to bring a breath of fresh air to kids and help influence them in a positive light thru rock and roll music.",
  studios: [
    { name: "7th heaven Official", url: "http://www.7thheavenband.com" },
    { name: "RNR Studios", url: "http://www.RNRStudios.net" },
    { name: "NTD Animation", url: "http://www.NTDAnimation.com" },
    { name: "NTD Graphics", url: "http://www.NTDGraphics.com" },
  ],
};

const ALL_PRODUCTS = [
  {
    id: "ep1",
    ep: "Episode 1",
    title: "Land Of Confusion",
    subtitle: "7th heaven and the Rock'n'Roll Kids Land Of Confusion",
    desc: "The Rock 'N' Roll Kids embark on their first epic adventure, bringing positivity and music to resolve chaos in the city.",
    amazonUrl: "https://www.amazon.com/gp/product/B096TJNDWR",
    coverImg: "/images/7hrrk/book1.jpg",
    badge: "Episode 1",
  },
  {
    id: "ep2",
    ep: "Episode 2",
    title: "Who Are You",
    subtitle: "7th heaven and the Rock'n'Roll Kids Who Are You",
    desc: "Identity, friendship, and staying true to yourself when XEC Records try to change the band's authentic rock sound.",
    amazonUrl: "https://www.amazon.com/gp/product/B08FNMPFTR",
    coverImg: "/images/7hrrk/book2.jpg",
    badge: "Episode 2",
  },
  {
    id: "ep3",
    ep: "Episode 3",
    title: "What You Give",
    subtitle: "7th heaven and the Rock'n'Roll Kids What You Give",
    desc: "A powerful tale of kindness and social consciousness as the kids use music to help community schools stay open.",
    amazonUrl: "https://www.amazon.com/gp/product/B08GLP426D",
    coverImg: "/images/7hrrk/book3.jpg",
    badge: "Episode 3",
  },
  {
    id: "ep4",
    ep: "Episode 4",
    title: "Runnin' Down A Dream",
    subtitle: "7th heaven and the Rock'n'Roll Kids Runnin' Down A Dream",
    desc: "High-octane concert energy, flying drones, and an unbelievable battle of the bands showdown against ancient rock rivals.",
    amazonUrl: "https://www.amazon.com/gp/product/B08R68B2QF",
    coverImg: "/images/7hrrk/book4.jpg",
    badge: "Episode 4",
  },
  {
    id: "ep5",
    ep: "Episode 5",
    title: "Last In Line",
    subtitle: "7th heaven and the Rock'n'Roll Kids Last In Line",
    desc: "The kids face their biggest challenge yet in an epic concert arena battle of music, heart, and teamwork.",
    amazonUrl:
      "https://www.amazon.com/gp/product/B08VYFJWYF?ref_=dbs_m_mng_rwt_calw_tpbk_4&storeType=ebooks",
    coverImg: "/images/7hrrk/book5.jpg",
    badge: "Episode 5",
  },
  {
    id: "ep6",
    ep: "Episode 6",
    title: "Operation Mind Crime",
    subtitle: "7th heaven and the Rock'n'Roll Kids Operation Mind Crime",
    desc: "Special illustrated black & white edition uncovering the mystery of XEC Records headquarters.",
    amazonUrl:
      "https://www.amazon.com/gp/product/B09HG6KW8M?ref_=dbs_m_mng_rwt_calw_tpbk_5&storeType=ebooks",
    coverImg: "/images/7hrrk/book6.jpg",
    badge: "Episode 6",
  },
  {
    id: "ep7",
    ep: "Episode 7",
    title: "Caught In The Game",
    subtitle: "7th heaven and the Rock'n'Roll Kids Caught In The Game",
    desc: "Trapped inside a virtual reality video game grid, the Rock 'N' Roll Kids use music chords to beat the game boss.",
    amazonUrl:
      "https://www.amazon.com/gp/product/B0B1K859QC?ref_=dbs_m_mng_rwt_calw_tpbk_6&storeType=ebooks",
    coverImg: "/images/7hrrk/book7.jpg",
    badge: "Episode 7",
  },
  {
    id: "ep8",
    ep: "Episode 8",
    title: "Don't Speak",
    subtitle: "7th heaven and the Rock'n'Roll Kids Don't Speak",
    desc: "A silent spell falls over the city until the band powers up their amplifiers to restore music and speech.",
    amazonUrl:
      "https://www.amazon.com/gp/product/B0BTRTCQ5W?ref_=dbs_m_mng_rwt_calw_tpbk_7&storeType=ebooks&qid=1681962352&sr=8-1",
    coverImg: "/images/7hrrk/book8.jpg",
    badge: "Episode 8",
  },
  {
    id: "ep9",
    ep: "Episode 9",
    title: "Bad Company",
    subtitle: "7th heaven and the Rock'n'Roll Kids Bad Company",
    desc: "Wild west desert showdown where the band brings rhythm, harmony, and friendship to outlaws.",
    amazonUrl:
      "https://www.amazon.com/7th-heaven-RocknRoll-Kids-Company/dp/B0CGZ1P2ZJ/ref=sr_1_3?crid=NHCNKT022TUP&keywords=7th+heaven+rock+kids&qid=1705630559&s=digital-text&sprefix=7th+heaven+rock+kids%2Cdigital-text%2C83&sr=1-3-catcorr",
    coverImg: "/images/7hrrk/book9.jpg",
    badge: "Episode 9",
  },
  {
    id: "cb",
    ep: "Coloring Book",
    title: "Coloring Book",
    subtitle: "7th heaven and the Rock'n'Roll Kids Coloring Book",
    desc: "20+ pages of high-resolution line art featuring all 7th Heaven characters, concert stages, and comic scenes.",
    amazonUrl:
      "https://www.amazon.com/heaven-RocknRoll-Kids-Coloring-Book/dp/1791341276/?_encoding=UTF8&pd_rd_w=y3LP8&content-id=amzn1.sym.cf86ec3a-68a6-43e9-8115-04171136930a&pf_rd_p=cf86ec3a-68a6-43e9-8115-04171136930a&pf_rd_r=135-6472012-0373844&pd_rd_wg=TnrXj&pd_rd_r=3a94a7b7-c821-4b82-85bb-e305d1283288&ref_=aufs_ap_sc_dsk",
    coverImg: "/images/comics/51q94xazn7l.jpg",
    badge: "Coloring Book",
  },
  {
    id: "ab",
    ep: "Art Book",
    title: "Art Book",
    subtitle: "7th heaven and the Rock'n'Roll Kids Art Book",
    desc: "Exclusive concept sketches, character designs, storyboards, and development artwork from RNR Studios.",
    amazonUrl:
      "https://www.amazon.com/7th-Heaven-RocknRoll-Kids-Introduction/dp/1718876688/ref=sr_1_2?s=books&ie=UTF8&qid=1526169915&sr=1-2",
    coverImg: "/images/7hrrk/artbook.jpg",
    badge: "Art Book",
  },
  {
    id: "vol1",
    ep: "Comic Book",
    title: "Comic Book - Vol. 1",
    subtitle: "7th heaven and the Rock'n'Roll Kids Comic Book Vol. 1",
    desc: "The complete volume 1 anthology combining multiple episode issues, full-color pages, and bonus poster art.",
    amazonUrl: "https://www.amazon.com/dp/B096TJNDWR",
    coverImg: "/images/7hrrk/artbook.jpg",
    badge: "Comic Book Vol. 1",
  },
];

const FEATURED_MUSIC_SINGLES = [
  {
    id: "3ZhqLJDRxQ8",
    title: "Land Of Confusion",
    subtitle: "Animated Official Music Video",
    tag: "Theme Song",
    desc: "The band's iconic animated cover of Genesis' classic anthem. Blending hard-hitting rock riffs with vibrant superhero visuals.",
    youtubeUrl: "https://www.youtube.com/watch?v=3ZhqLJDRxQ8",
  },
  {
    id: "BzHUNTZ66zY",
    title: "Ain't That Just Beautiful",
    subtitle: "Season 1 Featured Track",
    tag: "Featured Single",
    desc: "A high-energy rock anthem empowering kids to stay authentic, embrace their unique talents, and overcome peer pressure.",
    youtubeUrl: "https://www.youtube.com/watch?v=BzHUNTZ66zY",
  },
  {
    id: "wDEXG3kHjqk",
    title: "Sing",
    subtitle: "Social Consciousness Single",
    tag: "Inspirational Anthem",
    desc: "An uplifting message about kindness, giving back to your community, and spreading light through hard work and rock 'n' roll.",
    youtubeUrl: "https://www.youtube.com/watch?v=wDEXG3kHjqk",
  },
  {
    id: "W3dkLd9UkZU",
    title: "Time of Our Lives",
    subtitle: "Animated Concert Finale",
    tag: "Concert Anthem",
    desc: "The concert finale featuring the Rock 'N' Roll Kids on stage performing live for cheering crowds.",
    youtubeUrl: "https://www.youtube.com/watch?v=W3dkLd9UkZU",
  },
];

const GuitarIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m11.9 12.1 7.4-7.4a2 2 0 0 1 2.8 2.8l-7.4 7.4" />
    <path d="M7 17a3 3 0 1 0 4.2-4.2L8.5 10 4 14.5A3 3 0 0 0 7 17z" />
    <line x1="16" y1="5" x2="19" y2="8" />
  </svg>
);

const BassGuitarIcon = ({
  className = "w-3.5 h-3.5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 18a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    <path d="M12.5 11.5 20 4" />
    <path d="m18 4 2 2" />
    <path d="M2 14h2" />
    <path d="M4 20v-2" />
  </svg>
);

const DrumIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m4 3 8 7" />
    <path d="m20 3-8 7" />
    <ellipse cx="12" cy="11" rx="7" ry="2.5" />
    <path d="M5 11v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
    <path d="M5 11l3.5 8.5M12 11.5v8M19 11l-3.5 8.5" />
  </svg>
);

const MicIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const ChefHatIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 13.8a4.5 4.5 0 1 1 2.6-8.3 5 5 0 0 1 6.8 0 4.5 4.5 0 1 1 2.6 8.3" />
    <path d="M6 13.8V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5.2" />
  </svg>
);

const ExecutiveIcon = ({
  className = "w-3.5 h-3.5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </svg>
);

const DroneOpsIcon = ({
  className = "w-3.5 h-3.5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    <path d="m4.9 4.9 4.2 4.2" />
    <path d="m14.9 14.9 4.2 4.2" />
    <path d="m19.1 4.9-4.2 4.2" />
    <path d="m9.1 14.9-4.2 4.2" />
    <circle cx="4" cy="4" r="2" />
    <circle cx="20" cy="4" r="2" />
    <circle cx="4" cy="20" r="2" />
    <circle cx="20" cy="20" r="2" />
  </svg>
);

const mainCharacters = [
  {
    role: "Lead Guitarist",
    name: "Barefoot Rocker",
    image: "/images/comics/mark.png",
    desc: "Blonde hair, shades, and barefoot energy. Plays lightning-fast lead guitar solos and brings fearless optimism.",
    icon: GuitarIcon,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    role: "Bass Guitarist",
    name: "Cap Bassist",
    image: "/images/comics/frank.png",
    desc: "Baseball cap backwards, driving deep basslines that keep the groove locked down in every battle.",
    icon: BassGuitarIcon,
    color: "border-purple-500/30 bg-cyan-500/10",
  },
  {
    role: "Drums & Percussion",
    name: "Power Drummer",
    image: "/images/comics/dicky.png",
    desc: "The heartbeat of the band. Thunderous rhythms and high-tempo beats that power up the kids' magical music energy.",
    icon: DrumIcon,
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  {
    role: "Rhythm Guitarist",
    name: "Headband Shredder",
    image: "/images/comics/nick.png",
    desc: "Red headband and heavy rhythm chords. Crafts catchy riffs that solve problems and unite the crowd.",
    icon: GuitarIcon,
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
  {
    role: "Lead Vocalist",
    name: "Frontman Kid",
    image: "/images/comics/adam.png",
    desc: "Black hat and infectious mic vocals. Leads the team with powerful anthems of kindness and rock attitude.",
    icon: MicIcon,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    role: "Culinary & Backstage",
    name: "Big Sam",
    image: "/images/comics/nic-cage-placeholder.png",
    desc: "Red shirt chef keeping the band energized with great meals and warm backstage hospitality.",
    icon: ChefHatIcon,
    color: "text-red-400 border-red-500/30 bg-red-500/10",
  },
  {
    role: "Corporate Executive",
    name: "XEC Record Boss",
    image: "/images/comics/nic-cage-placeholder.png",
    desc: "Purple-skinned corporate villain who tries to control the music business until the kids show him true rock positivity.",
    icon: ExecutiveIcon,
    color: "  border-purple-500/30 bg-purple-900/30",
  },
  {
    role: "Stage & Tour Crew",
    name: "Security & Drone Ops",
    image: "/images/comics/nic-cage-placeholder.png",
    desc: "Dedicated crew with security gear and high-tech flying video drones capturing concert magic from above.",
    icon: DroneOpsIcon,
    color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
];

const DEFAULT_FOUNDERS = [
  {
    name: "Richard Hofherr",
    role: "Founder and songwriter of 7th heaven",
    desc: "Co-creator of 7th Heaven & The Rock 'n' Roll Kids animated series, comics, and video games.",
    phone: "(847) 551-5363",
    email: "Rich777@aol.com",
    mobileImg: "/images/contact/dickie-contact-mobile.webp",
    desktopImg: "/images/members/desktop-richy.webp",
  },
  {
    name: "Roy Adorjan",
    role: "Lead Animator & Character Designer",
    desc: "Co-creator and art director for 7th Heaven & The Rock 'n' Roll Kids.",
    phone: "",
    email: "info@minimartians.com",
    mobileImg: "/images/comics/roy-mobile.png",
    desktopImg: "/images/comics/desktop-roy.png",
  },
];

function getProductsList(sanityContent: any) {
  const comicsSection = sanityContent?.sections?.find(
    (s: any) => s.sectionId === "comics",
  );
  const sanityProducts =
    sanityContent?.products || comicsSection?.items || sanityContent?.books;
  if (!sanityProducts || sanityProducts.length === 0) return ALL_PRODUCTS;
  return sanityProducts.map((p: any, i: number) => {
    const fallback = ALL_PRODUCTS[i % ALL_PRODUCTS.length];
    return {
      id: p._id || p.id || `prod-${i}`,
      title: p.title || fallback.title,
      subtitle: p.subtitle || fallback.subtitle,
      desc: p.desc || p.description || fallback.desc,
      amazonUrl: p.amazonUrl || p.buyLink || fallback.amazonUrl,
      coverImg: getMediaUrl(
        p.coverImg || p.image || p.coverImage,
        fallback.coverImg,
      ),
      badge: p.badge || p.tag || fallback.badge,
    };
  });
}

function getCharactersList(sanityContent: any) {
  const charactersSection = sanityContent?.sections?.find(
    (s: any) => s.sectionId === "characters",
  );
  const sanityCharacters =
    sanityContent?.characters || charactersSection?.items;
  if (!sanityCharacters || sanityCharacters.length === 0) return mainCharacters;
  return sanityCharacters.map((c: any, i: number) => {
    const fallback = mainCharacters[i % mainCharacters.length];
    return {
      role: c.role || fallback.role,
      name: c.name || fallback.name,
      image: getMediaUrl(c.image, fallback.image),
      desc: c.desc || c.description || fallback.desc,
      icon: fallback.icon,
      color: fallback.color,
    };
  });
}

function getMusicSinglesList(sanityContent: any) {
  const sanitySingles = sanityContent?.musicSingles || sanityContent?.singles;
  if (!sanitySingles || sanitySingles.length === 0)
    return FEATURED_MUSIC_SINGLES;
  return sanitySingles.map((s: any, i: number) => {
    const fallback = FEATURED_MUSIC_SINGLES[i % FEATURED_MUSIC_SINGLES.length];
    return {
      id: s.youtubeId || s.id || fallback.id,
      title: s.title || fallback.title,
      subtitle: s.subtitle || fallback.subtitle,
      tag: s.tag || fallback.tag,
      desc: s.desc || s.description || fallback.desc,
      youtubeUrl:
        s.youtubeUrl ||
        `https://www.youtube.com/watch?v=${s.youtubeId || s.id || fallback.id}`,
    };
  });
}

function getFoundersList(sanityContent: any) {
  const foundersSection = sanityContent?.sections?.find(
    (s: any) => s.sectionId === "founders",
  );
  const sanityFounders = sanityContent?.founders || foundersSection?.founders;
  if (!sanityFounders || sanityFounders.length === 0) return DEFAULT_FOUNDERS;
  return sanityFounders.map((f: any, i: number) => {
    const fallback = DEFAULT_FOUNDERS[i % DEFAULT_FOUNDERS.length];
    return {
      name: f.name || fallback.name,
      role: f.role || fallback.role,
      desc: f.desc || f.description || fallback.desc,
      phone: f.phone || fallback.phone,
      email: f.email || fallback.email,
      mobileImg: getMediaUrl(
        f.mobileImg || f.imageMobile || f.image,
        fallback.mobileImg,
      ),
      desktopImg: getMediaUrl(
        f.desktopImg || f.imageDesktop || f.image,
        fallback.desktopImg,
      ),
    };
  });
}

export const COMIC_LAYOUT_PRESETS = [
  { id: 1, name: "Split Stage", desc: "Hero Issue #1 Showcase + 4-Col Grid", icon: "BookOpen" },
  { id: 2, name: "Bento Universe", desc: "Large 2x2 Feature Issue + Dynamic Asymmetric Tiles", icon: "Grid" },
  { id: 3, name: "Editorial Broadside", desc: "Full-Width Issue #1 Cinema Banner + 3-Col Archive", icon: "Columns" },
  { id: 4, name: "Collector Spotlight", desc: "Two Large Side-by-Side Headliners (Episodes & Artbook)", icon: "Flame" },
  { id: 5, name: "Interactive Reader", desc: "50/50 Sticky Left Feature Viewer + Right Issue Queue", icon: "Sliders" },
  { id: 6, name: "Vintage Comic Stand", desc: "Oversized Center Showcase + Tilted Comic Cards", icon: "Palette" },
  { id: 7, name: "Glassmorphic Vault", desc: "Luxury Frosted Purple Ultra-Card + Glow Pods", icon: "Sparkles" },
  { id: 8, name: "Story Timeline", desc: "Full-Width Story Arc Timeline with Large Issue Cards", icon: "Film" },
  { id: 9, name: "Staggered Stream", desc: "Alternating 2-Col Featured Issues with Deep Synopses", icon: "Star" },
  { id: 10, name: "Magazine Cover Story", desc: "Big Editorial Typography & Press Review Format", icon: "Newspaper" },
  { id: 11, name: "Comic Carousel Strip", desc: "Cinematic Marquee Hero + Horizontal Scrolling Reel", icon: "Film" },
  { id: 12, name: "Sticky Archive Sidebar", desc: "Sticky 1/3 Feature Panel + 2/3 Dense Book Grid", icon: "Sliders" },
  { id: 13, name: "Triptych Anthology", desc: "3 Equal Balanced Epic Covers + Micro Ribbons", icon: "Layers" },
  { id: 14, name: "Issue Accordion Strip", desc: "Full-Bleed Numbered Episode Chapter Slices", icon: "Sliders" },
  { id: 15, name: "Retail Metro Grid", desc: "Modern Clean 4-Col Grid with Direct Amazon Badges", icon: "BookOpen" },
  { id: 16, name: "Golden Ratio 62/38", desc: "Harmonic 62% Primary Feature Canvas + 38% Stack", icon: "Grid" },
  { id: 17, name: "Billboard Marquee", desc: "Ultra-Wide 24:9 Panoramic Marquee + 5-Col Micro Grid", icon: "Music" },
  { id: 18, name: "Brutalist Neon", desc: "Hard Black Borders, Neon Yellow Offsets & Code Chips", icon: "Flame" },
  { id: 19, name: "Compact Vault Matrix", desc: "High-Density 5-Col Quick-Access Book Catalog", icon: "Star" },
  { id: 20, name: "Chronicle Odyssey", desc: "Full-Bleed Center-Stage Timeline with Illuminated Trail", icon: "Sparkles" },
] as const;

export interface HeroColorTheme {
  id: string;
  name: string;
  shortLabel: string;
  swatchBg: string;
  accentBar: string;
  subtitle: string;
  numbers: string;
  primaryBtn: string;
  secondaryBtn: string;
  ambientTint: string;
}

export const HERO_COLOR_THEMES: HeroColorTheme[] = [
  {
    id: "cyber-lime",
    name: "Cyber Lime & Neon Rock",
    shortLabel: "Lime",
    swatchBg: "bg-lime-400",
    accentBar: "border-lime-400",
    subtitle: "text-lime-300/90",
    numbers: "text-lime-400",
    primaryBtn: "bg-lime-400 text-slate-950 shadow-lime-950/30 hover:bg-lime-300",
    secondaryBtn: "border-lime-400/40 text-lime-300 hover:bg-white/5",
    ambientTint: "from-lime-950/25 via-transparent to-transparent",
  },
  {
    id: "imperial-gold",
    name: "Imperial Gold & Comic Amber",
    shortLabel: "Gold",
    swatchBg: "bg-amber-400",
    accentBar: "border-amber-400",
    subtitle: "text-amber-300/90",
    numbers: "text-amber-400",
    primaryBtn: "bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-amber-950/30 hover:from-amber-300 hover:to-yellow-300",
    secondaryBtn: "border-amber-400/40 text-amber-300 hover:bg-white/5",
    ambientTint: "from-amber-950/30 via-transparent to-transparent",
  },
  {
    id: "electric-cyan",
    name: "Electric Cyan & Tron Neon",
    shortLabel: "Cyan",
    swatchBg: "bg-cyan-400",
    accentBar: "border-cyan-400",
    subtitle: "text-cyan-300/90",
    numbers: "text-cyan-400",
    primaryBtn: "bg-cyan-400 text-slate-950 shadow-cyan-950/30 hover:bg-cyan-300",
    secondaryBtn: "border-cyan-400/40 text-cyan-300 hover:bg-white/5",
    ambientTint: "from-cyan-950/30 via-transparent to-transparent",
  },
  {
    id: "sunset-flare",
    name: "Sunset Flame & Crimson",
    shortLabel: "Flame",
    swatchBg: "bg-orange-500",
    accentBar: "border-orange-500",
    subtitle: "text-orange-300/90",
    numbers: "text-orange-400",
    primaryBtn: "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-orange-950/30 hover:from-orange-400 hover:to-rose-400",
    secondaryBtn: "border-orange-400/40 text-orange-300 hover:bg-white/5",
    ambientTint: "from-orange-950/30 via-transparent to-transparent",
  },
  {
    id: "canary-comic",
    name: "Canary Yellow & Pop Art",
    shortLabel: "Canary",
    swatchBg: "bg-yellow-400",
    accentBar: "border-yellow-400",
    subtitle: "text-yellow-200/90",
    numbers: "text-yellow-400",
    primaryBtn: "bg-yellow-400 text-slate-950 shadow-yellow-950/30 hover:bg-yellow-300",
    secondaryBtn: "border-yellow-400/40 text-yellow-300 hover:bg-white/5",
    ambientTint: "from-yellow-950/20 via-transparent to-transparent",
  },
  {
    id: "amethyst-purple",
    name: "7th Heaven Royal Amethyst",
    shortLabel: "Purple",
    swatchBg: "bg-purple-500",
    accentBar: "border-purple-400",
    subtitle: "text-purple-300/90",
    numbers: "text-purple-400",
    primaryBtn: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-950/30 hover:from-purple-400 hover:to-indigo-400",
    secondaryBtn: "border-purple-400/40 text-purple-200 hover:bg-white/5",
    ambientTint: "from-purple-950/35 via-transparent to-transparent",
  },
  {
    id: "aurora-mint",
    name: "Aurora Mint & Emerald",
    shortLabel: "Mint",
    swatchBg: "bg-emerald-400",
    accentBar: "border-emerald-400",
    subtitle: "text-emerald-300/90",
    numbers: "text-emerald-400",
    primaryBtn: "bg-emerald-400 text-slate-950 shadow-emerald-950/30 hover:bg-emerald-300",
    secondaryBtn: "border-emerald-400/40 text-emerald-300 hover:bg-white/5",
    ambientTint: "from-emerald-950/30 via-transparent to-transparent",
  },
  {
    id: "arctic-ice",
    name: "Arctic Silver & Ice White",
    shortLabel: "Ice",
    swatchBg: "bg-white",
    accentBar: "border-white",
    subtitle: "text-slate-200/90",
    numbers: "text-white",
    primaryBtn: "bg-white text-slate-950 shadow-white/20 hover:bg-slate-200",
    secondaryBtn: "border-white/40 text-white hover:bg-white/5",
    ambientTint: "from-slate-900/40 via-transparent to-transparent",
  },
];

export default function RockNRollKidsClient({
  sanityContent,
}: {
  sanityContent?: any;
}) {
  const [selectedVideo, setSelectedVideo] = useState("3ZhqLJDRxQ8");
  const [bookFilter, setBookFilter] = useState<"all" | "episodes" | "art">("all");
  const [comicLayout, setComicLayout] = useState<number>(3);
  const [heroLayout, setHeroLayout] = useState<number>(1);
  const [colorTheme, setColorTheme] = useState<string>("arctic-ice");

  // Sync layout, hero layout, and color theme from URL / localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("layout");
    if (param) {
      const parsed = parseInt(param, 10);
      if (parsed >= 1 && parsed <= 20) setComicLayout(parsed);
    }
    const heroParam = urlParams.get("heroLayout");
    if (heroParam) {
      const parsed = parseInt(heroParam, 10);
      if (parsed >= 1 && parsed <= 20) setHeroLayout(parsed);
    } else {
      try {
        const savedHero = localStorage.getItem("7h_rrk_hero_layout_v1");
        if (savedHero) {
          const parsed = parseInt(savedHero, 10);
          if (parsed >= 1 && parsed <= 20) setHeroLayout(parsed);
        }
      } catch {
        // ignore
      }
    }
    const colorParam = urlParams.get("color");
    if (colorParam && HERO_COLOR_THEMES.some((t) => t.id === colorParam)) {
      setColorTheme(colorParam);
    } else {
      try {
        const saved = localStorage.getItem("7h_rrk_hero_color_v1");
        if (saved && HERO_COLOR_THEMES.some((t) => t.id === saved)) {
          setColorTheme(saved);
        } else {
          setColorTheme("arctic-ice");
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const activeColorTheme =
    HERO_COLOR_THEMES.find((t) => t.id === colorTheme) || HERO_COLOR_THEMES[7];

  const aboutSection = sanityContent?.sections?.find(
    (s: any) => s.sectionId === "about",
  );
  const comicsSection = sanityContent?.sections?.find(
    (s: any) => s.sectionId === "comics",
  );
  const foundersSection = sanityContent?.sections?.find(
    (s: any) => s.sectionId === "founders",
  );
  const productsList = getProductsList(sanityContent);
  const charactersList = getCharactersList(sanityContent);
  const musicSinglesList = getMusicSinglesList(sanityContent);
  const foundersList = getFoundersList(sanityContent);
  const videosList = musicSinglesList.filter(
    (v: any) => v.id !== selectedVideo,
  );

  const filteredProducts = productsList.filter((prod: any) => {
    if (bookFilter === "episodes") return prod.badge.startsWith("Episode");
    if (bookFilter === "art") return !prod.badge.startsWith("Episode");
    return true;
  });

  const badgeText = aboutSection?.badge || "We love art";
  const para1 = aboutSection?.subtitle || ABOUT_DATA.paragraph1;
  const para2 = aboutSection?.body || ABOUT_DATA.paragraph2;

  const FRANCHISE_PILLARS = [
    {
      Icon: Tv,
      title: "Animated TV Series",
      desc: "Multi-episode animated adventures teaching positivity through rock.",
      tag: "TV Series",
      accent: "text-cyan-300",
      pillClass: "border-cyan-400/40 bg-cyan-950/60 text-cyan-200",
    },
    {
      Icon: Gamepad2,
      title: "Mobile Games & Apps",
      desc: "Interactive video games, mobile apps, and coloring books.",
      tag: "Games & Apps",
      accent: "text-emerald-300",
      pillClass: "border-emerald-400/40 bg-emerald-950/60 text-emerald-200",
    },
    {
      Icon: BookOpen,
      title: "12 Published Comic Books",
      desc: "Action-packed superhero graphic novels available worldwide.",
      tag: "Comic Books",
      accent: "text-amber-300",
      pillClass: "border-amber-400/40 bg-amber-950/60 text-amber-200",
    },
    {
      Icon: Guitar,
      title: "Original Rock Soundtracks",
      desc: "Original band songs, music videos, and animated singles.",
      tag: "Rock Music",
      accent: "text-purple-300",
      pillClass: "border-purple-400/40 bg-purple-950/60 text-purple-200",
    },
  ];

  return (
    <main className="site-container page-container page-stack min-h-screen w-full overflow-x-hidden" id="rrk-main-page">
      {/* ── HERO: Full-Bleed Background Cast Artwork with Content Below (Zero Overlap) ── */}
      <header
        id="rrk-hero"
        aria-labelledby="rrk-hero-heading"
        className="relative flex flex-col gap-6 w-full"
      >
        {/* Full-bleed cast artwork background running edge-to-edge under the navbar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[calc(-1*(var(--header-height)+var(--page-top)+env(safe-area-inset-top,0px))+80px)] w-screen aspect-[1918/748] max-h-[640px] -z-10 overflow-hidden"
        >
          <Image
            src={getMediaUrl(
              sanityContent?.heroBannerImage,
              "/images/7hrrk/c-all.png",
            )}
            alt=""
            fill
            sizes="100vw"
            className="object-contain object-top"
            priority
          />
          {/* Subtle bottom fade to blend seamlessly into the site background and enhance overlapping text legibility */}
          <div
            className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[var(--color-bg-deep)] via-[var(--color-bg-deep)]/80 to-transparent"
          />
          {/* Active color setup ambient glow */}
          <div
            className={`absolute inset-0 bg-gradient-to-tr ${activeColorTheme.ambientTint}`}
          />
        </div>

        {/* Visual spacer with negative margin pulling content to overlap onto the hero section */}
        <div
          aria-hidden="true"
          className="w-full aspect-[1918/748] max-h-[640px] pointer-events-none -mb-28 sm:-mb-36 lg:-mb-44"
        />

        {/* Content Section: 20 Architectural Layout Presets Overlapping onto the Hero Section */}
        <HeroContentRenderer
          layoutId={heroLayout}
          activeColorTheme={activeColorTheme}
          sanityContent={sanityContent}
          para1={para1}
          para2={para2}
          productsList={productsList}
          pillars={FRANCHISE_PILLARS}
        />

        {/* ── 20 HERO LAYOUT PRESETS EXPLORER BAR ── */}
        <div className="relative z-10 mt-8 rounded-[var(--radius-box)] border border-white/10 bg-slate-950/70 p-4 backdrop-blur-xl shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="font-bold uppercase tracking-wider text-xs sm:text-sm text-white">
                Rock &apos;n&apos; Roll Kids — 20 Hero Section Layout Presets
              </h2>
            </div>
            <span className="text-slate-300 font-medium text-xs">
              Layout {heroLayout} of 20: <strong className="text-white">{HERO_LAYOUT_PRESETS[heroLayout - 1]?.name}</strong> ({HERO_LAYOUT_PRESETS[heroLayout - 1]?.desc})
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-1.5 sm:gap-2">
            {HERO_LAYOUT_PRESETS.map((p) => {
              const active = heroLayout === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setHeroLayout(p.id);
                    if (typeof window !== "undefined") {
                      const url = new URL(window.location.href);
                      url.searchParams.set("heroLayout", p.id.toString());
                      window.history.replaceState({}, "", url.toString());
                      try {
                        localStorage.setItem("7h_rrk_hero_layout_v1", p.id.toString());
                      } catch {}
                    }
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl p-2 sm:p-2.5 text-center transition-all cursor-pointer ${
                    active
                      ? "bg-white text-slate-950 font-bold shadow-lg shadow-white/10 border border-white"
                      : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white border border-white/5"
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-tight">#{p.id}</span>
                  <span className="mt-0.5 text-[9px] sm:text-[10px] font-semibold truncate max-w-full">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Character Roster Info Cards Grid */}
      <section
        id="rrk-cast"
        aria-labelledby="rrk-cast-heading"
        className="section"
      >
        <h2 id="rrk-cast-heading" className="sr-only">
          Character Cast Lineup
        </h2>
        <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {charactersList.map((char: any) => (
            <article
              key={char.name}
              className="group flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition-all duration-300 hover:border-purple-500/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-purple-950/20"
            >
              <div>
                {char.image && (
                  <div className="relative mb-5 flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-black/40 p-2">
                    <Image
                      src={char.image}
                      alt={char.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className={`mb-2 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase font-mono border ${char.color || "text-purple-400 border-purple-500/30 bg-purple-500/10"}`}>
                  {char.icon ? <char.icon className="h-3.5 w-3.5" /> : null}
                  <span>{char.role}</span>
                </div>
                <h3 className="mb-1 font-bold text-white tracking-tight">{char.name}</h3>
                <p className="text-xs text-white/70 leading-relaxed">{char.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── UNIFIED VIDEO MATRIX SHOWCASE ── */}
      <section
        id="rrk-videos"
        aria-labelledby="rrk-videos-heading"
        className="section"
      >
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN: Featured Singles Quick Select Tabs */}
          <div className="lg:col-span-5">
            <SectionHeader
              id="rrk-videos-heading"
              title="Featured Animated Singles"
              subtitle="Select a song below to switch the animated music video player."
              divider={false}
            />

            {/* Animated Singles Quick Select Buttons */}
            <div className="flex flex-col gap-3">
              <AddCmsButton
                label="ADD KIDS SONG / VIDEO IN SANITY CMS"
                onClick={() => window.open("/studio", "_blank")}
                className="w-full justify-center"
              />
              <div className="flex flex-wrap gap-2.5">
                {musicSinglesList.map((single: any) => (
                  <SeventhButton
                    key={single.id}
                    onClick={() => setSelectedVideo(single.id)}
                    isActive={selectedVideo === single.id}
                    className="!w-auto [&>span]:!min-w-0"
                  >
                    {single.title}
                  </SeventhButton>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Video Matrix Player & Video Grid Selector */}
          <div className="flex flex-col gap-4 lg:col-span-7">
            <div className="aspect-video w-full overflow-hidden rounded-[var(--radius-box)]">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}`}
                title="Rock and Roll Kids Player"
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
              {videosList.map((v: any) => (
                <CosmicTrackCard
                  key={v.id}
                  onClick={() => setSelectedVideo(v.id)}
                  isActive={selectedVideo === v.id}
                  tag={v.tag}
                  title={v.title}
                  subtitle={v.subtitle}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMIC BOOKS & EPISODES CATALOG (12 ITEMS GRID) ── */}
      <section
        id="rrk-comics"
        aria-labelledby="rrk-comics-heading"
        className="section"
      >
        <div className="mb-6 pb-4">
          <SectionHeader
            id="rrk-comics-heading"
            title={
              comicsSection?.title ||
              `Comic Books & Publications (${productsList.length} Items)`
            }
            subtitle={
              comicsSection?.body ||
              "Explore the official collection of 7th Heaven & The Rock 'n' Roll Kids comic books, digital e-books, coloring books, and exclusive concept art books. Each release follows the band on superhero adventures combining rock music, problem-solving, and positive life lessons for kids and families worldwide. All titles are available now on Amazon in print and digital formats."
            }
            divider={false}
          />
        </div>

        {/* ── 20 COMIC LAYOUT PRESETS EXPLORER BAR ── */}
        <div className="mb-8 rounded-[var(--radius-box)] border border-purple-500/25 bg-purple-950/20 p-4 backdrop-blur-xl shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="font-bold uppercase tracking-wider text-white">
                Rock &apos;n&apos; Roll Kids — 20 Comic &amp; Book Layout Presets
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-purple-300 font-medium">
                Layout {comicLayout} of 20: <strong className="text-white">{COMIC_LAYOUT_PRESETS[comicLayout - 1]?.name}</strong> ({COMIC_LAYOUT_PRESETS[comicLayout - 1]?.desc})
              </span>
              {/* Category Filter Pills */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 p-1">
                {(["all", "episodes", "art"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setBookFilter(filter)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all ${
                      bookFilter === filter
                        ? "bg-purple-600 text-white shadow-md shadow-purple-900/50"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {filter === "all" ? "All Items" : filter === "episodes" ? "Episodes 1-9" : "Art & Volumes"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-1.5 sm:gap-2">
            {COMIC_LAYOUT_PRESETS.map((p) => {
              const active = comicLayout === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setComicLayout(p.id);
                    if (typeof window !== "undefined") {
                      const url = new URL(window.location.href);
                      url.searchParams.set("layout", p.id.toString());
                      window.history.replaceState({}, "", url.toString());
                    }
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl p-2 sm:p-2.5 text-center transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-br from-amber-500 via-rose-600 to-purple-700 text-white shadow-lg shadow-purple-900/50 border border-amber-300"
                      : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white border border-white/5"
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-tight">#{p.id}</span>
                  <span className="mt-0.5 text-[9px] sm:text-[10px] font-semibold truncate max-w-full">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── LAYOUT RENDERER (10 ARCHITECTURES) ── */}
        {(() => {
          const leadItem = filteredProducts[0] || productsList[0];
          const remainingItems = filteredProducts.slice(1);

          /* ──────────────────────────────────────────────────────────
             LAYOUT 1: SPLIT STAGE (Oversized Issue #1 Hero + 4-Col Grid)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 1) {
            return (
              <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                {leadItem && (
                  <div className="relative overflow-hidden rounded-[var(--radius-box)] border border-purple-500/30 bg-gradient-to-r from-purple-950/60 via-black to-black p-6 sm:p-8 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-5 relative aspect-[3/4] max-h-[440px] w-full overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl">
                        <Image
                          src={leadItem.coverImg}
                          alt={leadItem.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover"
                          priority
                        />
                        <div className="absolute top-3 left-3 bg-amber-400 text-black text-[11px] font-black uppercase px-3 py-1 rounded-full shadow">
                          ★ Featured Series Anchor
                        </div>
                      </div>
                      <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                        <div>
                          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
                            {leadItem.badge} &bull; Official Comic Book
                          </span>
                          <h3 className="font-extrabold text-white mt-1">
                            {leadItem.title}
                          </h3>
                          <p className="text-xs text-white/60 mt-1">{leadItem.subtitle}</p>
                          <p className="text-sm sm:text-base text-white/90 leading-relaxed mt-4 italic border-l-2 border-purple-400/80 pl-4">
                            &ldquo;{leadItem.desc}&rdquo;
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <Button
                            variant="primary"
                            size="md"
                            href={leadItem.amazonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            icon={<ExternalLink className="h-4 w-4" />}
                          >
                            Order on Amazon ($9.99)
                          </Button>
                          <span className="text-xs text-white/60">
                            Available in Paperback &amp; Kindle eBook formats worldwide
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {remainingItems.map((prod: any) => (
                    <article
                      key={prod.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-[#0b0718]/90 p-4 shadow-lg transition-all duration-300 hover:border-purple-400/40 hover:bg-white/[0.05]"
                    >
                      <div>
                        <div className="relative mb-3 aspect-[3/4] w-full overflow-hidden rounded-[calc(var(--radius-box)-6px)] bg-black/40">
                          <Image
                            src={prod.coverImg}
                            alt={`${prod.title} book cover`}
                            fill
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <span className="mb-1 block text-muted text-xs font-semibold uppercase">{prod.badge}</span>
                        <h4 className="line-clamp-1 text-white font-bold">{prod.title}</h4>
                        <p className="mb-6 line-clamp-2 text-secondary text-sm">{prod.desc}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        href={prod.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Buy ${prod.title} on Amazon`}
                      >
                        Amazon Link
                      </Button>
                    </article>
                  ))}
                </div>
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 2: BENTO UNIVERSE (Large 2x2 Feature Issue + Bento Cards)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 2) {
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 [overflow-anchor:auto]">
                {filteredProducts.map((prod: any, idx: number) => {
                  const isLarge = idx === 0;
                  const isWide = idx === 3 || idx === 7;
                  return (
                    <article
                      key={prod.id}
                      className={`group relative overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-[#0c0819] p-4 flex flex-col justify-between transition-all hover:border-amber-400/50 hover:shadow-2xl ${
                        isLarge ? "sm:col-span-2 sm:row-span-2 min-h-[440px]" : isWide ? "sm:col-span-2 min-h-[260px]" : "min-h-[220px]"
                      }`}
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black/60 flex-1 min-h-[160px]">
                        <Image
                          src={prod.coverImg}
                          alt={prod.title}
                          fill
                          sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/75 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-300 backdrop-blur-md">
                          {prod.badge}
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className={`${isLarge ? "text-xl sm:text-2xl" : "text-sm"} font-bold text-white line-clamp-1`}>
                          {prod.title}
                        </h4>
                        <p className="text-xs text-white/70 line-clamp-2 mt-1">{prod.desc}</p>
                        <div className="mt-3">
                          <Button variant="secondary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                            View on Amazon
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 3: EDITORIAL BROADSIDE (Full-Width Cinema Banner + Archive)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 3) {
            return (
              <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                {leadItem && (
                  <div className="group relative overflow-hidden rounded-[var(--radius-box)] border border-purple-500/40 bg-black shadow-2xl">
                    <div className="relative aspect-[21/9] min-h-[340px] w-full overflow-hidden">
                      <Image
                        src={leadItem.coverImg}
                        alt={leadItem.title}
                        fill
                        sizes="100vw"
                        className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 sm:p-10 flex flex-col justify-end">
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
                          ★ Volume 1 Premier Broadside &bull; {leadItem.badge}
                        </span>
                        <h3 className="mt-2 font-extrabold text-white">
                          {leadItem.title}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/90 line-clamp-2 italic">
                          &ldquo;{leadItem.desc}&rdquo;
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <Button variant="primary" size="sm" href={leadItem.amazonUrl} target="_blank" rel="noopener noreferrer">
                            Buy Premier Edition on Amazon
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingItems.map((prod: any) => (
                    <article
                      key={prod.id}
                      className="group flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-4 hover:border-purple-400/40 hover:bg-white/[0.05] transition-all"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black/50 mb-3">
                        <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-purple-300">{prod.badge}</span>
                        <h4 className="font-bold text-white mt-0.5">{prod.title}</h4>
                        <p className="text-xs text-white/70 line-clamp-2 mt-1">{prod.desc}</p>
                      </div>
                      <div className="mt-4">
                        <Button variant="secondary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                          Amazon Link
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 4: COLLECTOR SPOTLIGHT (Two Large Side-by-Side Headliners)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 4) {
            const headliner1 = filteredProducts[0];
            const headliner2 = filteredProducts[1];
            const rest = filteredProducts.slice(2);
            return (
              <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[
                    { item: headliner1, tag: "Headliner 1: Series Premier" },
                    { item: headliner2, tag: "Headliner 2: Hit Adventure" },
                  ].map(
                    (head, i) =>
                      head.item && (
                        <div
                          key={head.item.id || head.tag}
                          className="group relative overflow-hidden rounded-[var(--radius-box)] border-2 border-purple-500/40 bg-[#0d081f] p-5 shadow-2xl transition-all hover:border-amber-400 flex flex-col sm:flex-row gap-5 items-center"
                        >
                          <div className="relative aspect-[3/4] w-44 shrink-0 overflow-hidden rounded-xl bg-black shadow-xl">
                            <Image src={head.item.coverImg} alt={head.item.title} fill sizes="176px" className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
                          </div>
                          <div className="flex flex-col justify-between gap-3">
                            <span className="text-[11px] font-mono font-bold uppercase text-amber-300">{head.tag}</span>
                            <h3 className="font-bold text-white">{head.item.title}</h3>
                            <p className="text-xs text-white/80 line-clamp-3 italic">&ldquo;{head.item.desc}&rdquo;</p>
                            <Button variant="primary" size="sm" href={head.item.amazonUrl} target="_blank" rel="noopener noreferrer" className="mt-2">
                              Get on Amazon
                            </Button>
                          </div>
                        </div>
                      ),
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {rest.map((prod: any) => (
                    <article key={prod.id} className="group rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-3 hover:border-purple-400/50 transition-all flex flex-col justify-between">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-black mb-2">
                        <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <h4 className="font-bold text-white truncate">{prod.title}</h4>
                      <p className="text-[11px] text-white/60 truncate">{prod.badge}</p>
                      <Button variant="secondary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-[10px]">
                        Amazon
                      </Button>
                    </article>
                  ))}
                </div>
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 5: INTERACTIVE READER (50/50 Sticky Left Feature Viewer + Right Queue)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 5) {
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start [overflow-anchor:auto]">
                {leadItem && (
                  <div className="lg:col-span-6 sticky top-24 rounded-[var(--radius-box)] border border-purple-500/30 bg-purple-950/20 p-6 backdrop-blur-xl shadow-2xl flex flex-col gap-5">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                      <Image src={leadItem.coverImg} alt={leadItem.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" priority />
                      <div className="absolute top-3 left-3 rounded-full bg-amber-400 text-black px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        Active Comic Spotlight
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-mono uppercase text-amber-300">{leadItem.badge}</span>
                      <h3 className="font-bold text-white mt-1">{leadItem.title}</h3>
                      <p className="text-sm text-white/80 mt-2 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5 italic">
                        &ldquo;{leadItem.desc}&rdquo;
                      </p>
                      <div className="mt-4 flex gap-3">
                        <Button variant="primary" size="md" fullWidth href={leadItem.amazonUrl} target="_blank" rel="noopener noreferrer">
                          Purchase on Amazon
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="lg:col-span-6 flex flex-col gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2 mb-1">
                    <Sliders className="h-4 w-4" /> Issue Catalog Archive ({remainingItems.length})
                  </span>
                  {remainingItems.map((prod: any) => (
                    <div key={prod.id} className="group flex gap-3.5 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-purple-400/40 transition-all items-center">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-black">
                        <Image src={prod.coverImg} alt={prod.title} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase text-purple-300">{prod.badge}</span>
                        <h4 className="font-bold text-white truncate">{prod.title}</h4>
                        <p className="text-xs text-white/60 line-clamp-1 italic mt-0.5">&ldquo;{prod.desc}&rdquo;</p>
                      </div>
                      <Button variant="secondary" size="sm" href={prod.amazonUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        Buy
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 6: VINTAGE COMIC STAND (Oversized Center Showcase + Tilted Cards)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 6) {
            return (
              <div className="flex flex-col gap-10 items-center [overflow-anchor:auto]">
                {leadItem && (
                  <div className="group bg-[#fcfcfd] text-black p-6 pb-8 rounded-sm shadow-2xl transition-transform hover:scale-[1.01] -rotate-1 max-w-xl w-full border border-neutral-300">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/95 rounded-sm">
                      <Image src={leadItem.coverImg} alt={leadItem.title} fill sizes="(max-width: 768px) 100vw, 576px" className="object-cover" priority />
                      <div className="absolute top-3 left-3 bg-red-600 text-white font-mono text-[10px] font-bold uppercase px-2.5 py-1 tracking-widest shadow">
                        ★ Issue of the Month
                      </div>
                    </div>
                    <div className="mt-5 text-center font-sans">
                      <p className="text-xl font-bold text-neutral-900 tracking-tight">{leadItem.title}</p>
                      <p className="text-xs text-neutral-500 mt-1 uppercase font-medium tracking-wider">{leadItem.badge} &bull; 7th Heaven Kids</p>
                      <p className="text-sm text-neutral-700 mt-3 font-serif italic max-w-md mx-auto">&ldquo;{leadItem.desc}&rdquo;</p>
                      <div className="mt-4">
                        <Button variant="primary" size="sm" href={leadItem.amazonUrl} target="_blank" rel="noopener noreferrer">
                          Order Collector Issue on Amazon
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                  {remainingItems.map((prod: any, i: number) => {
                    const rotation = i % 3 === 0 ? "hover:rotate-2 rotate-1" : i % 3 === 1 ? "hover:-rotate-2 -rotate-1" : "hover:rotate-1";
                    return (
                      <div key={prod.id} className={`group bg-[#f8f8fa] text-black p-4 pb-6 rounded-sm shadow-xl transition-all hover:-translate-y-1.5 ${rotation}`}>
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/90 rounded-sm">
                          <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                        </div>
                        <div className="mt-4 text-center font-sans">
                          <p className="text-sm font-bold text-neutral-900 tracking-tight">{prod.title}</p>
                          <p className="text-xs text-neutral-600 mt-0.5">{prod.badge}</p>
                          <p className="text-xs text-neutral-700 mt-2 font-serif italic line-clamp-2">&ldquo;{prod.desc}&rdquo;</p>
                          <div className="mt-3">
                            <Button variant="secondary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer" className="!bg-neutral-200 !text-neutral-900 hover:!bg-neutral-300">
                              Amazon Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 7: GLASSMORHPIC VAULT (Luxury Frosted Ultra-Card + Pods)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 7) {
            return (
              <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                {leadItem && (
                  <div className="group relative overflow-hidden rounded-[var(--radius-box)] border border-purple-400/40 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-black p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-purple-950/50">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-5 relative aspect-[3/4] max-h-[420px] w-full overflow-hidden rounded-xl border border-white/15 bg-black/60 shadow-2xl">
                        <Image src={leadItem.coverImg} alt={leadItem.title} fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
                        <div className="absolute top-3 left-3 rounded-full bg-purple-600/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                          ★ Ultra Comic Vault
                        </div>
                      </div>
                      <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                        <div>
                          <span className="text-xs font-mono uppercase text-amber-300 tracking-wider">{leadItem.badge}</span>
                          <h3 className="mt-1 font-bold text-white tracking-tight">{leadItem.title}</h3>
                          <p className="text-xs text-white/50 mt-1">{leadItem.subtitle}</p>
                          <blockquote className="mt-4 border-l-2 border-purple-400/80 pl-4 text-sm text-white/80 italic leading-relaxed">
                            &ldquo;{leadItem.desc}&rdquo;
                          </blockquote>
                        </div>
                        <Button variant="primary" size="md" href={leadItem.amazonUrl} target="_blank" rel="noopener noreferrer" className="w-fit">
                          Acquire Vault Edition on Amazon
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingItems.map((prod: any) => (
                    <article key={prod.id} className="group rounded-[var(--radius-box)] border border-purple-500/25 bg-purple-950/20 p-4 backdrop-blur-2xl shadow-xl hover:border-purple-400 hover:bg-purple-950/40 transition-all flex flex-col justify-between">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 bg-black/50 mb-3">
                        <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <span className="rounded-full border border-purple-400/40 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-purple-300">{prod.badge}</span>
                        <h4 className="font-bold text-white mt-1">{prod.title}</h4>
                        <p className="text-xs text-white/70 line-clamp-2 mt-1">{prod.desc}</p>
                      </div>
                      <div className="mt-4">
                        <Button variant="secondary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                          Amazon Link
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 8: STORY TIMELINE (Full-Width Story Arc Timeline with Large Issue Cards)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 8) {
            return (
              <div className="flex flex-col gap-6 [overflow-anchor:auto]">
                {filteredProducts.map((prod: any, idx: number) => (
                  <div key={prod.id} className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center hover:border-amber-400/40 transition-all">
                    <div className="md:col-span-3 relative aspect-[3/4] max-h-[220px] overflow-hidden rounded-xl bg-black">
                      <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300">
                        Issue #{idx + 1}
                      </div>
                    </div>
                    <div className="md:col-span-9 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold uppercase tracking-wider">
                          <Flame className="h-3.5 w-3.5 text-amber-400" /> {prod.badge} &bull; Story Arc Part {idx + 1}
                        </div>
                        <h3 className="font-bold text-white mt-1">{prod.title}</h3>
                        <p className="text-xs text-white/60">{prod.subtitle}</p>
                        <p className="text-sm text-white/80 mt-2 leading-relaxed">&ldquo;{prod.desc}&rdquo;</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="primary" size="sm" href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                          Read Issue on Amazon
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 9: STAGGERED STREAM (Alternating 2-Col Featured Issues)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 9) {
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 [overflow-anchor:auto]">
                {filteredProducts.map((prod: any, i: number) => {
                  const isLarge = i === 0 || i === 4;
                  return (
                    <article
                      key={prod.id}
                      className={`group relative overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] hover:border-amber-400/50 transition-all p-4 flex flex-col justify-between ${
                        isLarge ? "sm:col-span-2 min-h-[380px]" : "min-h-[260px]"
                      }`}
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black/50 mb-3 flex-1 min-h-[180px]">
                        <Image
                          src={prod.coverImg}
                          alt={prod.title}
                          fill
                          sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/80 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase text-amber-300">
                          {isLarge ? "★ Key Comic Arc" : prod.badge}
                        </div>
                      </div>
                      <div>
                        <h4 className={`${isLarge ? "text-xl sm:text-2xl" : "text-base"} font-bold text-white line-clamp-1`}>{prod.title}</h4>
                        <p className="text-xs text-white/70 line-clamp-2 mt-1">{prod.desc}</p>
                      </div>
                      <div className="mt-3">
                        <Button variant="secondary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                          Amazon Link
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 10: MAGAZINE COVER STORY (Big Editorial Press Review Format)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 10) {
            return (
              <div className="flex flex-col gap-10 border-t-2 border-white/20 pt-6 [overflow-anchor:auto]">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
                  <h3 className="font-serif font-black uppercase text-white tracking-tight">
                    COMIC CHRONICLES &bull; DISPATCH
                  </h3>
                  <span className="font-serif italic text-sm text-white/60">The Rock &apos;n&apos; Roll Kids Anthology</span>
                </div>

                {leadItem && (
                  <div className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/15 pb-10">
                    <div className="lg:col-span-5 relative aspect-[3/4] max-h-[460px] w-full overflow-hidden rounded-xl bg-black">
                      <Image src={leadItem.coverImg} alt={leadItem.title} fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
                      <div className="absolute top-4 left-4 bg-white text-black font-serif text-xs font-bold uppercase px-3 py-1 tracking-widest">
                        Volume Cover Story
                      </div>
                    </div>
                    <div className="lg:col-span-7 flex flex-col gap-3 font-serif">
                      <span className="text-xs uppercase tracking-widest text-amber-300 font-sans font-bold">
                        {leadItem.badge} &bull; Premier Story Release
                      </span>
                      <h4 className="font-bold text-white leading-tight">
                        {leadItem.title}
                      </h4>
                      <p className="text-sm sm:text-base text-white/80 leading-relaxed italic mt-2">
                        &ldquo;{leadItem.desc}&rdquo;
                      </p>
                      <div className="mt-4">
                        <Button variant="primary" size="md" href={leadItem.amazonUrl} target="_blank" rel="noopener noreferrer">
                          Order Issue on Amazon
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {remainingItems.map((prod: any) => (
                    <article key={prod.id} className="group border-b border-white/10 pb-6 flex flex-col justify-between">
                      <div>
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-black mb-3">
                          <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <span className="font-serif text-xs text-white/60">{prod.badge}</span>
                        <h4 className="mt-1 font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                          {prod.title}
                        </h4>
                        <p className="mt-1 font-serif text-xs text-white/75 leading-relaxed italic line-clamp-2">
                          &ldquo;{prod.desc}&rdquo;
                        </p>
                      </div>
                      <div className="mt-4">
                        <Button variant="secondary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                          Read on Amazon
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 11: COMIC CAROUSEL STRIP (Cinematic Marquee + Reel)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 11) {
            return (
              <div className="flex flex-col gap-10 [overflow-anchor:auto]">
                {leadItem && (
                  <div className="group relative overflow-hidden rounded-[var(--radius-box)] border border-amber-500/30 bg-gradient-to-t from-black via-zinc-950 to-black p-6 sm:p-8 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-5 relative aspect-[3/4] max-h-[420px] w-full overflow-hidden rounded-2xl bg-black border border-white/10">
                        <Image src={leadItem.coverImg} alt={leadItem.title} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
                        <div className="absolute top-3 left-3 rounded-full bg-amber-400 text-black px-3 py-1 text-xs font-black uppercase">
                          Featured Reel
                        </div>
                      </div>
                      <div className="lg:col-span-7 flex flex-col gap-3">
                        <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                          {leadItem.badge} &bull; Premier Issue
                        </span>
                        <h3 className="font-extrabold text-white">
                          {leadItem.title}
                        </h3>
                        <p className="text-xs text-white/60">{leadItem.subtitle}</p>
                        <p className="text-sm text-white/80 leading-relaxed italic mt-2">
                          &ldquo;{leadItem.desc}&rdquo;
                        </p>
                        <div className="mt-4 flex gap-3">
                          <Button variant="primary" size="md" href={leadItem.amazonUrl} target="_blank" rel="noopener noreferrer">
                            Buy on Amazon &rarr;
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <Film className="h-4 w-4 text-amber-400" />
                      <h4 className="font-mono uppercase tracking-wider text-white">Issue Reel Ribbon</h4>
                    </div>
                    <span className="text-xs text-white/50">Scroll horizontally &rarr;</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar">
                    {remainingItems.map((prod: any) => (
                      <div
                        key={prod.id}
                        className="group min-w-[220px] sm:min-w-[260px] shrink-0 snap-start rounded-2xl border border-white/10 bg-zinc-950 p-3 hover:border-amber-400/60 transition-all shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black mb-3">
                            <Image src={prod.coverImg} alt={prod.title} fill sizes="260px" className="object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute top-2 left-2 bg-black/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                              {prod.badge}
                            </div>
                          </div>
                          <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">{prod.title}</h4>
                          <p className="text-xs text-white/60 line-clamp-2 mt-1">{prod.desc}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <Button variant="secondary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                            Amazon
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 12: STICKY ARCHIVE SIDEBAR (Sticky 1/3 + 2/3 Dense)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 12) {
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start [overflow-anchor:auto]">
                {leadItem && (
                  <div className="lg:col-span-5 lg:sticky lg:top-24">
                    <div className="group relative overflow-hidden rounded-[var(--radius-box)] border border-cyan-400/30 bg-cyan-950/20 p-6 backdrop-blur-xl shadow-2xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">Spotlight Anthology</span>
                        <span className="text-xs text-white/60">{leadItem.badge}</span>
                      </div>
                      <div className="relative aspect-[3/4] max-h-[380px] w-full overflow-hidden rounded-2xl bg-black">
                        <Image src={leadItem.coverImg} alt={leadItem.title} fill sizes="(max-width: 1024px) 100vw, 40vw" priority className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <h3 className="font-black text-white group-hover:text-cyan-300 transition-colors">
                          {leadItem.title}
                        </h3>
                        <p className="text-xs font-mono text-cyan-300">{leadItem.subtitle}</p>
                        <p className="text-sm text-white/80 italic mt-1 leading-relaxed">&ldquo;{leadItem.desc}&rdquo;</p>
                        <div className="mt-4">
                          <Button variant="primary" size="md" fullWidth href={leadItem.amazonUrl} target="_blank" rel="noopener noreferrer">
                            Order Issue on Amazon
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                    <h4 className="font-bold uppercase tracking-wider text-white">Full Series Archive</h4>
                    <span className="text-xs text-white/50">{remainingItems.length} Issues</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {remainingItems.map((prod: any) => (
                      <div
                        key={prod.id}
                        className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-3 hover:border-cyan-400/40 hover:bg-white/[0.05] transition-all"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black mb-3">
                          <Image src={prod.coverImg} alt={prod.title} fill sizes="260px" className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <span className="text-xs font-mono text-cyan-300">{prod.badge}</span>
                        <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5 line-clamp-1">{prod.title}</h4>
                        <p className="text-xs text-white/60 line-clamp-2 mt-1">{prod.desc}</p>
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <Button variant="secondary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                            Amazon
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 13: TRIPTYCH ANTHOLOGY (3 Equal Balanced Stage Covers)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 13) {
            const triptych = filteredProducts.slice(0, 3);
            const remainder = filteredProducts.slice(3);

            return (
              <div className="flex flex-col gap-10 [overflow-anchor:auto]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {triptych.map((prod: any, idx: number) => {
                    const colors = [
                      "border-fuchsia-500/40 bg-fuchsia-950/20",
                      "border-indigo-500/40 bg-indigo-950/20",
                      "border-purple-500/40 bg-purple-950/20",
                    ];
                    const accents = ["text-fuchsia-400", "text-indigo-400", "text-purple-400"];

                    return (
                      <div
                        key={prod.id}
                        className={`group relative overflow-hidden rounded-[var(--radius-box)] border ${colors[idx % 3]} p-5 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-xl`}
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${accents[idx % 3]}`}>
                              Pillar 0{idx + 1} &bull; {prod.badge}
                            </span>
                          </div>
                          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black mb-4">
                            <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <h3 className="font-black text-white group-hover:text-purple-200 transition-colors">
                            {prod.title}
                          </h3>
                          <p className="text-xs text-white/80 mt-2 line-clamp-3 leading-relaxed">
                            &ldquo;{prod.desc}&rdquo;
                          </p>
                        </div>
                        <div className="mt-5 pt-3 border-t border-white/10">
                          <Button variant="primary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                            Order on Amazon
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {remainder.length > 0 && (
                  <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
                    <h4 className="font-mono uppercase tracking-widest text-white/60">Additional Comic Book Chapters</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {remainder.map((prod: any) => (
                        <div key={prod.id} className="group flex flex-col rounded-xl border border-white/10 bg-black/40 p-2 hover:border-purple-400 transition-all">
                          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-black mb-2">
                            <Image src={prod.coverImg} alt={prod.title} fill sizes="160px" className="object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <span className="text-[11px] font-bold text-white truncate">{prod.title}</span>
                          <a href={prod.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-300 hover:underline mt-1">Amazon &rarr;</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 14: ISSUE ACCORDION STRIP (Numbered Story Cuts)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 14) {
            return (
              <div className="flex flex-col gap-4 [overflow-anchor:auto]">
                {filteredProducts.map((prod: any, idx: number) => (
                  <div
                    key={prod.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 hover:border-amber-500/50 hover:bg-white/[0.04] transition-all shadow-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      <div className="md:col-span-1 flex md:flex-col items-center justify-between md:justify-center gap-1 font-mono text-xs text-amber-400 font-bold">
                        <span>#{String(idx + 1).padStart(2, "0")}</span>
                        <span className="hidden md:inline text-[10px] text-white/40">ISSUE</span>
                      </div>
                      <div className="md:col-span-3 relative aspect-[3/4] max-h-[180px] w-full overflow-hidden rounded-xl bg-black">
                        <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="md:col-span-6 flex flex-col gap-1.5">
                        <span className="text-xs uppercase font-mono text-amber-300 font-bold">{prod.badge}</span>
                        <h3 className="font-black text-white group-hover:text-amber-300 transition-colors">{prod.title}</h3>
                        <p className="text-xs text-white/60">{prod.subtitle}</p>
                        <p className="text-sm text-white/70 line-clamp-2 italic mt-1">&ldquo;{prod.desc}&rdquo;</p>
                      </div>
                      <div className="md:col-span-2 flex items-center justify-end">
                        <Button variant="primary" size="sm" href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                          Amazon &rarr;
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 15: RETAIL METRO GRID (Modern Clean 4-Col Grid)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 15) {
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 [overflow-anchor:auto]">
                {filteredProducts.map((prod: any) => (
                  <div
                    key={prod.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 hover:border-emerald-400/50 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between bg-gradient-to-r from-emerald-950/80 to-teal-950/60 border-b border-emerald-500/20 px-4 py-2 text-xs font-mono">
                      <span className="font-bold text-emerald-300">{prod.badge}</span>
                      <span className="text-white/60 text-[10px]">Print &bull; Kindle</span>
                    </div>
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                      <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                      <div>
                        <h4 className="font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">{prod.title}</h4>
                        <p className="text-xs text-white/70 mt-1 line-clamp-2 italic">&ldquo;{prod.desc}&rdquo;</p>
                      </div>
                      <div className="pt-3 border-t border-white/10">
                        <Button variant="primary" size="sm" fullWidth href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                          Amazon Store
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 16: GOLDEN RATIO 62/38 (Harmonic Asymmetry)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 16) {
            const goldenStack = filteredProducts.slice(1, 4);
            const goldenRest = filteredProducts.slice(4);

            return (
              <div className="flex flex-col gap-10 [overflow-anchor:auto]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {leadItem && (
                    <div className="lg:col-span-7 group relative overflow-hidden rounded-[var(--radius-box)] border border-amber-500/40 bg-zinc-950 p-6 flex flex-col justify-between shadow-2xl">
                      <div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                          <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">&Phi; Golden Issue Canvas</span>
                          <span className="text-xs text-white/60">{leadItem.badge}</span>
                        </div>
                        <div className="relative aspect-[3/4] max-h-[460px] w-full overflow-hidden rounded-2xl bg-black">
                          <Image src={leadItem.coverImg} alt={leadItem.title} fill sizes="(max-width: 1024px) 100vw, 60vw" priority className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      </div>
                      <div className="mt-5">
                        <h3 className="font-extrabold text-white group-hover:text-amber-300 transition-colors">{leadItem.title}</h3>
                        <p className="text-xs font-mono text-white/60 mt-1">{leadItem.subtitle}</p>
                        <p className="text-sm text-white/80 mt-2 leading-relaxed">&ldquo;{leadItem.desc}&rdquo;</p>
                        <div className="mt-4">
                          <Button variant="primary" size="md" href={leadItem.amazonUrl} target="_blank" rel="noopener noreferrer">
                            View Issue on Amazon
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
                    {goldenStack.map((prod: any) => (
                      <div key={prod.id} className="group flex-1 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 hover:border-amber-400/40 hover:bg-white/[0.05] transition-all">
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-black">
                          <Image src={prod.coverImg} alt={prod.title} fill sizes="100px" className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-xs font-mono text-amber-400">{prod.badge}</span>
                          <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">{prod.title}</span>
                          <p className="text-xs text-white/70 line-clamp-1 italic">&ldquo;{prod.desc}&rdquo;</p>
                          <a href={prod.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-300 hover:underline mt-1">Amazon &rarr;</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {goldenRest.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 border-t border-white/10 pt-6">
                    {goldenRest.map((prod: any) => (
                      <div key={prod.id} className="group flex flex-col rounded-xl border border-white/10 p-2 bg-black/40 hover:border-amber-400/50">
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-black mb-2">
                          <Image src={prod.coverImg} alt={prod.title} fill sizes="160px" className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <span className="text-xs font-bold text-white truncate">{prod.title}</span>
                        <a href={prod.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-300 hover:underline mt-0.5">Amazon</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 17: BILLBOARD MARQUEE (Ultra-Wide Header + Matrix)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 17) {
            return (
              <div className="flex flex-col gap-8 [overflow-anchor:auto]">
                {leadItem && (
                  <div className="group relative overflow-hidden rounded-[var(--radius-box)] border-2 border-purple-500/40 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      <div className="lg:col-span-4 relative aspect-[3/4] max-h-[360px] w-full overflow-hidden rounded-xl bg-black">
                        <Image src={leadItem.coverImg} alt={leadItem.title} fill sizes="360px" priority className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="lg:col-span-8 flex flex-col gap-2">
                        <span className="text-xs uppercase font-mono tracking-widest text-purple-300 font-bold">24:9 Panoramic Marquee Showcase</span>
                        <h3 className="font-black text-white mt-1">{leadItem.title}</h3>
                        <p className="text-xs font-mono text-purple-300">{leadItem.subtitle}</p>
                        <p className="text-sm text-white/80 mt-2 max-w-xl">&ldquo;{leadItem.desc}&rdquo;</p>
                        <div className="mt-4">
                          <Button variant="primary" size="md" href={leadItem.amazonUrl} target="_blank" rel="noopener noreferrer">
                            Buy on Amazon Store &rarr;
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {remainingItems.map((prod: any) => (
                    <div key={prod.id} className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-2 hover:border-purple-400 hover:bg-white/[0.05] transition-all">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-black mb-2">
                        <Image src={prod.coverImg} alt={prod.title} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <span className="text-xs font-bold text-white truncate">{prod.title}</span>
                      <a href={prod.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-300 hover:underline mt-1">Amazon Link &rarr;</a>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 18: BRUTALIST NEON (High-Contrast Yellow & Black)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 18) {
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono [overflow-anchor:auto]">
                {filteredProducts.map((prod: any, idx: number) => (
                  <div
                    key={prod.id}
                    className="group border-2 border-amber-400 bg-black p-4 text-left shadow-[6px_6px_0px_0px_rgba(251,191,36,0.8)] hover:shadow-[10px_10px_0px_0px_rgba(251,191,36,1)] transition-all"
                  >
                    <div className="flex items-center justify-between border-b-2 border-amber-400 pb-2 mb-3 text-xs">
                      <span className="bg-amber-400 text-black px-2 py-0.5 font-black uppercase">SYS.0{idx + 1}</span>
                      <span className="text-amber-300 font-bold">{prod.badge}</span>
                    </div>
                    <div className="relative aspect-[3/4] w-full overflow-hidden border border-amber-400/50 bg-black mb-3">
                      <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-black uppercase tracking-tight text-white group-hover:text-amber-400 truncate">{prod.title}</h4>
                      <p className="text-xs text-white/70 line-clamp-2 mt-1">// {prod.desc}</p>
                      <a href={prod.amazonUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center bg-amber-400 text-black font-black uppercase text-xs py-2 hover:bg-amber-300">
                        [EXECUTE ORDER ON AMAZON]
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 19: COMPACT VAULT MATRIX (Fast High-Density Browsing)
             ────────────────────────────────────────────────────────── */
          if (comicLayout === 19) {
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 [overflow-anchor:auto]">
                {filteredProducts.map((prod: any) => (
                  <div
                    key={prod.id}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950 p-2 hover:border-purple-400 hover:scale-105 transition-all shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-black mb-2">
                        <Image src={prod.coverImg} alt={prod.title} fill sizes="180px" className="object-cover" />
                        <div className="absolute top-1 left-1 bg-purple-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {prod.badge}
                        </div>
                      </div>
                      <h4 className="font-bold text-white truncate group-hover:text-purple-300">{prod.title}</h4>
                    </div>
                    <a href={prod.amazonUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-center rounded bg-white/10 py-1 text-[10px] font-semibold text-white hover:bg-purple-600">
                      Amazon
                    </a>
                  </div>
                ))}
              </div>
            );
          }

          /* ──────────────────────────────────────────────────────────
             LAYOUT 20: CHRONICLE ODYSSEY (Full-Bleed Center-Stage Timeline)
             ────────────────────────────────────────────────────────── */
          return (
            <div className="relative max-w-3xl mx-auto flex flex-col gap-12 [overflow-anchor:auto]">
              <div className="absolute top-0 bottom-0 left-4 sm:left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-amber-500 via-rose-500 to-purple-600 pointer-events-none" />

              {filteredProducts.map((prod: any, idx: number) => (
                <div
                  key={prod.id}
                  className="group relative flex flex-col gap-4 rounded-3xl border border-purple-500/30 bg-black/90 p-5 sm:p-7 backdrop-blur-xl shadow-2xl hover:border-amber-400 transition-all z-10"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                        Chronicle Chapter #{idx + 1} &bull; {prod.badge}
                      </span>
                    </div>
                    <span className="text-xs text-white/60">Comic Odyssey</span>
                  </div>

                  <div className="relative aspect-[3/4] max-h-[440px] w-full overflow-hidden rounded-2xl bg-black">
                    <Image src={prod.coverImg} alt={prod.title} fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-black text-white group-hover:text-amber-300 transition-colors">
                      {prod.title}
                    </h3>
                    <p className="text-xs font-mono text-white/60">{prod.subtitle}</p>
                    <p className="text-sm text-white/85 leading-relaxed italic mt-1">&ldquo;{prod.desc}&rdquo;</p>
                    <div className="mt-4">
                      <Button variant="primary" size="md" href={prod.amazonUrl} target="_blank" rel="noopener noreferrer">
                        Get Issue on Amazon
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* ── SERIES FOUNDERS & CREATORS ── */}
      <section
        id="rrk-founders"
        aria-labelledby="rrk-founders-heading"
        className="section"
      >
        <div className="mb-6 text-left">
          <SectionHeader
            id="rrk-founders-heading"
            title={foundersSection?.title || "Series Founders & Contact"}
            subtitle={
              foundersSection?.subtitle ||
              "Meet the creators and co-founders behind 7th Heaven and the Rock 'n' Roll Kids franchise, bringing animated music adventures, comic books, and live rock performances to life."
            }
            divider={false}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8 w-full">
          {foundersList.map((founder: any) => (
            <article
              key={founder.name}
              className="group flex flex-col gap-4"
            >
              <div className="relative flex aspect-[1.2/1] w-full items-end justify-center overflow-hidden rounded-[var(--radius-box)] [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] max-h-[500px] sm:max-h-[540px] md:max-h-[580px] lg:max-h-[620px]">
                {/* Mobile Image */}
                <Image
                  src={founder.mobileImg}
                  alt={`${founder.name} Mobile`}
                  fill
                  sizes="(max-width: 640px) 100vw, 0px"
                  className="object-contain object-bottom sm:hidden"
                />
                {/* Desktop Image */}
                <Image
                  src={founder.desktopImg}
                  alt={`${founder.name} Desktop`}
                  fill
                  sizes="(min-width: 1280px) 700px, (min-width: 768px) 50vw, 100vw"
                  className="hidden object-contain object-bottom sm:block"
                />
                {/* Bottom Gradient Mask Overlay */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 sm:h-32" />
              </div>
              <div className="flex w-full flex-col items-center gap-2 text-center">
                <h3 className="mb-2">{founder.name}</h3>
                <div>
                  <span className="font-mono text-xs font-bold tracking-wider text-purple-400 uppercase">
                    {founder.role}
                  </span>
                </div>
                <p className="mx-auto mb-1 max-w-md text-balance text-pretty">{founder.desc}</p>
                {founder.phone ? (
                  <a
                    href={`tel:${founder.phone.replace(/[^0-9]/g, "")}`}
                    className="mb-0 block"
                  >
                    {founder.phone}
                  </a>
                ) : null}
                {founder.email ? (
                  <a
                    href={`mailto:${founder.email}`}
                    className="a-btn block"
                  >
                    {founder.email}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
