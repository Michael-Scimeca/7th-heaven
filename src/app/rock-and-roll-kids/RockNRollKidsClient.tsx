/* eslint-disable react-doctor/iframe-missing-sandbox */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import TransitionLink from "@/components/TransitionLink";
import SectionBadge from "@/components/SectionBadge";
import { getMediaUrl } from "@/lib/sanity";

const ABOUT_DATA = {
  headline: "7th Heaven & the Rock 'n' Roll Kids",
  paragraph1: "7th heaven & the Rock 'n' Roll Kids is based on the band 7th heaven, which is globally known as a pop Rock Band. The animated series communicates messages of fun, positivity and social consciousness through the connection of music and imagination. Each episode focuses on problem solving, an adventure and a resolution.",
  paragraph2: "We have been working with a team of skilled people that are helping us build a new animated series based on 7th heaven. The show is based on the band as young kids, who bring positivity to other kids, which are called “The Rock and Roll Kids”. We are working to create this as an animated TV series and comic books, games, apps, videos and original music. In a world filled with so much negativity, we want to bring a breath of fresh air to kids and help influence them in a positive light thru rock and roll music.",
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
    coverImg: "/images/comics/71j5h9aU3iS._SL1500_.jpg",
    badge: "Episode 1",
  },
  {
    id: "ep2",
    ep: "Episode 2",
    title: "Who Are You",
    subtitle: "7th heaven and the Rock'n'Roll Kids Who Are You",
    desc: "Identity, friendship, and staying true to yourself when XEC Records try to change the band's authentic rock sound.",
    amazonUrl: "https://www.amazon.com/gp/product/B08FNMPFTR",
    coverImg: "/images/comics/71tQzMjwGaL._SL1360_.jpg",
    badge: "Episode 2",
  },
  {
    id: "ep3",
    ep: "Episode 3",
    title: "What You Give",
    subtitle: "7th heaven and the Rock'n'Roll Kids What You Give",
    desc: "A powerful tale of kindness and social consciousness as the kids use music to help community schools stay open.",
    amazonUrl: "https://www.amazon.com/gp/product/B08GLP426D",
    coverImg: "/images/comics/71OoJ1jhGXL._SL1360_.jpg",
    badge: "Episode 3",
  },
  {
    id: "ep4",
    ep: "Episode 4",
    title: "Runnin' Down A Dream",
    subtitle: "7th heaven and the Rock'n'Roll Kids Runnin' Down A Dream",
    desc: "High-octane concert energy, flying drones, and an unbelievable battle of the bands showdown against ancient rock rivals.",
    amazonUrl: "https://www.amazon.com/gp/product/B08R68B2QF",
    coverImg: "/images/comics/719L5F4iUyL._SL1500_.jpg",
    badge: "Episode 4",
  },
  {
    id: "ep5",
    ep: "Episode 5",
    title: "Last In Line",
    subtitle: "7th heaven and the Rock'n'Roll Kids Last In Line",
    desc: "The kids face their biggest challenge yet in an epic concert arena battle of music, heart, and teamwork.",
    amazonUrl: "https://www.amazon.com/gp/product/B08VYFJWYF?ref_=dbs_m_mng_rwt_calw_tpbk_4&storeType=ebooks",
    coverImg: "/images/comics/719CbfCsqyL._SL1500_.jpg",
    badge: "Episode 5",
  },
  {
    id: "ep6",
    ep: "Episode 6",
    title: "Operation Mind Crime",
    subtitle: "7th heaven and the Rock'n'Roll Kids Operation Mind Crime",
    desc: "Special illustrated black & white edition uncovering the mystery of XEC Records headquarters.",
    amazonUrl: "https://www.amazon.com/gp/product/B09HG6KW8M?ref_=dbs_m_mng_rwt_calw_tpbk_5&storeType=ebooks",
    coverImg: "/images/comics/81yWx2cHMjL._SL1500_.jpg",
    badge: "Episode 6",
  },
  {
    id: "ep7",
    ep: "Episode 7",
    title: "Caught In The Game",
    subtitle: "7th heaven and the Rock'n'Roll Kids Caught In The Game",
    desc: "Trapped inside a virtual reality video game grid, the Rock 'N' Roll Kids use music chords to beat the game boss.",
    amazonUrl: "https://www.amazon.com/gp/product/B0B1K859QC?ref_=dbs_m_mng_rwt_calw_tpbk_6&storeType=ebooks",
    coverImg: "/images/comics/61y6zQf1hCL._SL1500_.jpg",
    badge: "Episode 7",
  },
  {
    id: "ep8",
    ep: "Episode 8",
    title: "Don't Speak",
    subtitle: "7th heaven and the Rock'n'Roll Kids Don't Speak",
    desc: "A silent spell falls over the city until the band powers up their amplifiers to restore music and speech.",
    amazonUrl: "https://www.amazon.com/gp/product/B0BTRTCQ5W?ref_=dbs_m_mng_rwt_calw_tpbk_7&storeType=ebooks&qid=1681962352&sr=8-1",
    coverImg: "/images/comics/71mgiiwhIGL._SL1500_.jpg",
    badge: "Episode 8",
  },
  {
    id: "ep9",
    ep: "Episode 9",
    title: "Bad Company",
    subtitle: "7th heaven and the Rock'n'Roll Kids Bad Company",
    desc: "Wild west desert showdown where the band brings rhythm, harmony, and friendship to outlaws.",
    amazonUrl: "https://www.amazon.com/7th-heaven-RocknRoll-Kids-Company/dp/B0CGZ1P2ZJ/ref=sr_1_3?crid=NHCNKT022TUP&keywords=7th+heaven+rock+kids&qid=1705630559&s=digital-text&sprefix=7th+heaven+rock+kids%2Cdigital-text%2C83&sr=1-3-catcorr",
    coverImg: "/images/comics/71njNs9hT2L._SL1500_.jpg",
    badge: "Episode 9",
  },
  {
    id: "cb",
    ep: "Coloring Book",
    title: "Coloring Book",
    subtitle: "7th heaven and the Rock'n'Roll Kids Coloring Book",
    desc: "20+ pages of high-resolution line art featuring all 7th Heaven characters, concert stages, and comic scenes.",
    amazonUrl: "https://www.amazon.com/heaven-RocknRoll-Kids-Coloring-Book/dp/1791341276/?_encoding=UTF8&pd_rd_w=y3LP8&content-id=amzn1.sym.cf86ec3a-68a6-43e9-8115-04171136930a&pf_rd_p=cf86ec3a-68a6-43e9-8115-04171136930a&pf_rd_r=135-6472012-0373844&pd_rd_wg=TnrXj&pd_rd_r=3a94a7b7-c821-4b82-85bb-e305d1283288&ref_=aufs_ap_sc_dsk",
    coverImg: "/images/comics/51Q94xAzn7L.jpg",
    badge: "Coloring Book",
  },
  {
    id: "ab",
    ep: "Art Book",
    title: "Art Book",
    subtitle: "7th heaven and the Rock'n'Roll Kids Art Book",
    desc: "Exclusive concept sketches, character designs, storyboards, and development artwork from RNR Studios.",
    amazonUrl: "https://www.amazon.com/7th-Heaven-RocknRoll-Kids-Introduction/dp/1718876688/ref=sr_1_2?s=books&ie=UTF8&qid=1526169915&sr=1-2",
    coverImg: "/images/comics/71d2WbDeBHL._SL1360_.jpg",
    badge: "Art Book",
  },
  {
    id: "vol1",
    ep: "Comic Book",
    title: "Comic Book - Vol. 1",
    subtitle: "7th heaven and the Rock'n'Roll Kids Comic Book Vol. 1",
    desc: "The complete volume 1 anthology combining multiple episode issues, full-color pages, and bonus poster art.",
    amazonUrl: "https://www.amazon.com/dp/B096TJNDWR",
    coverImg: "/images/comics/71d2WbDeBHL._SL1360_.jpg",
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
    id: "97tX0sM3vE8",
    title: "Who Are You",
    subtitle: "Season 1 Featured Track",
    tag: "Featured Single",
    desc: "A high-energy rock anthem empowering kids to stay authentic, embrace their unique talents, and overcome peer pressure.",
    youtubeUrl: "https://www.youtube.com/watch?v=97tX0sM3vE8",
  },
  {
    id: "J3_lX9S5k4o",
    title: "What You Give",
    subtitle: "Social Consciousness Single",
    tag: "Inspirational Anthem",
    desc: "An uplifting message about kindness, giving back to your community, and spreading light through hard work and rock 'n' roll.",
    youtubeUrl: "https://www.youtube.com/watch?v=J3_lX9S5k4o",
  },
  {
    id: "W3dkLd9UkZU",
    title: "Time of Our Lives",
    subtitle: "Animated Concert Finale",
    tag: "Concert Anthem",
    desc: "The grand finale song showcasing the Rock 'N' Roll Kids on stage performing live for cheering crowds.",
    youtubeUrl: "https://www.youtube.com/watch?v=W3dkLd9UkZU",
  },
];

const GuitarIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m11.9 12.1 7.4-7.4a2 2 0 0 1 2.8 2.8l-7.4 7.4" />
    <path d="M7 17a3 3 0 1 0 4.2-4.2L8.5 10 4 14.5A3 3 0 0 0 7 17z" />
    <line x1="16" y1="5" x2="19" y2="8" />
  </svg>
);

const BassGuitarIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    <path d="M12.5 11.5 20 4" />
    <path d="m18 4 2 2" />
    <path d="M2 14h2" />
    <path d="M4 20v-2" />
  </svg>
);

const DrumIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m4 3 8 7" />
    <path d="m20 3-8 7" />
    <ellipse cx="12" cy="11" rx="7" ry="2.5" />
    <path d="M5 11v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
    <path d="M5 11l3.5 8.5M12 11.5v8M19 11l-3.5 8.5" />
  </svg>
);

const MicIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const ChefHatIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 13.8a4.5 4.5 0 1 1 2.6-8.3 5 5 0 0 1 6.8 0 4.5 4.5 0 1 1 2.6 8.3" />
    <path d="M6 13.8V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5.2" />
  </svg>
);

const ExecutiveIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </svg>
);

const DroneOpsIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
    image: "/images/comics/Mark.png",
    desc: "Blonde hair, shades, and barefoot energy. Plays lightning-fast lead guitar solos and brings fearless optimism.",
    icon: GuitarIcon,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    role: "Bass Guitarist",
    name: "Cap Bassist",
    image: "/images/comics/Frank.png",
    desc: "Baseball cap backwards, driving deep basslines that keep the groove locked down in every battle.",
    icon: BassGuitarIcon,
    color: "   border-cyan-500/30 bg-cyan-500/10",
  },
  {
    role: "Drums & Percussion",
    name: "Power Drummer",
    image: "/images/comics/Dicky.png",
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
    color: "text-purple-300 border-purple-500/30 bg-purple-900/30",
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
    mobileImg: "/images/contact/Dickie-contact-mobile.png",
    desktopImg: "/images/members/desktop-richy.png",
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
  const comicsSection = sanityContent?.sections?.find((s: any) => s.sectionId === "comics");
  const sanityProducts = sanityContent?.products || comicsSection?.items || sanityContent?.books;
  if (!sanityProducts || sanityProducts.length === 0) return ALL_PRODUCTS;
  return sanityProducts.map((p: any, i: number) => {
    const fallback = ALL_PRODUCTS[i % ALL_PRODUCTS.length];
    return {
      id: p._id || p.id || `prod-${i}`,
      title: p.title || fallback.title,
      subtitle: p.subtitle || fallback.subtitle,
      desc: p.desc || p.description || fallback.desc,
      amazonUrl: p.amazonUrl || p.buyLink || fallback.amazonUrl,
      coverImg: getMediaUrl(p.coverImg || p.image || p.coverImage, fallback.coverImg),
      badge: p.badge || p.tag || fallback.badge,
    };
  });
}

function getCharactersList(sanityContent: any) {
  const charactersSection = sanityContent?.sections?.find((s: any) => s.sectionId === "characters");
  const sanityCharacters = sanityContent?.characters || charactersSection?.items;
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
  if (!sanitySingles || sanitySingles.length === 0) return FEATURED_MUSIC_SINGLES;
  return sanitySingles.map((s: any, i: number) => {
    const fallback = FEATURED_MUSIC_SINGLES[i % FEATURED_MUSIC_SINGLES.length];
    return {
      id: s.youtubeId || s.id || fallback.id,
      title: s.title || fallback.title,
      subtitle: s.subtitle || fallback.subtitle,
      tag: s.tag || fallback.tag,
      desc: s.desc || s.description || fallback.desc,
      youtubeUrl: s.youtubeUrl || `https://www.youtube.com/watch?v=${s.youtubeId || s.id || fallback.id}`,
    };
  });
}

function getFoundersList(sanityContent: any) {
  const foundersSection = sanityContent?.sections?.find((s: any) => s.sectionId === "founders");
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
      mobileImg: getMediaUrl(f.mobileImg || f.imageMobile || f.image, fallback.mobileImg),
      desktopImg: getMediaUrl(f.desktopImg || f.imageDesktop || f.image, fallback.desktopImg),
    };
  });
}

export default function RockNRollKidsClient({
  sanityContent,
}: {
  sanityContent?: any;
}) {
  const [selectedVideo, setSelectedVideo] = useState("3ZhqLJDRxQ8");

  const aboutSection = sanityContent?.sections?.find((s: any) => s.sectionId === "about");
  const comicsSection = sanityContent?.sections?.find((s: any) => s.sectionId === "comics");
  const foundersSection = sanityContent?.sections?.find((s: any) => s.sectionId === "founders");
  const productsList = getProductsList(sanityContent);
  const charactersList = getCharactersList(sanityContent);
  const musicSinglesList = getMusicSinglesList(sanityContent);
  const foundersList = getFoundersList(sanityContent);
  const videosList = musicSinglesList.filter((v: any) => v.id !== selectedVideo);

  return (
    <div className="min-h-screen text-white pt-[100px] overflow-x-hidden">
      {/* ── NEON ARCADE SYNTHWAVE MATRIX (PERMANENT LAYOUT) ── */}
      <div>
        {/* Hero Header */}
        <section className="relative site-container text-center space-y-6">
          <h1 className="mb-3">
            {sanityContent?.heroHeading || ABOUT_DATA.headline}
          </h1>
          <p className="font-sans max-w-2xl mx-auto">
            {sanityContent?.heroSubheading ||
              "An animated adventure series communicating messages of fun, positivity, and social consciousness through music and imagination."}
          </p>

          {/* Full Cast Lineup Image Banner (allc.png) */}
          <div
            className="relative w-full rounded-lg overflow-hidden mt-4">
            <Image
              src={getMediaUrl(sanityContent?.heroBannerImage, "/images/comics/allc.png")}
              alt="7th Heaven and the Rock 'n' Roll Kids Full Cast Lineup"
              width={1400}
              height={550}
              priority
              sizes="(max-width: 1280px) 100vw, 1400px"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>
          <div className="mt-8 mb-8 text-left w-full space-y-3">
            <h2 className="text-white text-2xl sm:text-3xl font-bold uppercase tracking-wide font-sans mb-3 text-left">
              {aboutSection?.title || "Story & Concept"}
            </h2>
            <div className="space-y-3 text-white/90 text-sm sm:text-base leading-relaxed max-w-4xl">
              <p className="font-sans">
                {aboutSection?.subtitle || ABOUT_DATA.paragraph1}
              </p>
            </div>
          </div>
          {/* Character Roster Info Cards Grid under the image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-4 mb-12">
            {charactersList.map((char: any) => (
              <div
                key={char.name}
                className="flex flex-col justify-between group">
                <div>
                  {char.image && (
                    <div className="relative w-full h-44 overflow-hidden mb-3 flex items-center justify-start">
                      <Image
                        src={char.image}
                        alt={char.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain object-left"
                      />
                    </div>
                  )}
                  <SectionBadge className="mb-2 gap-1.5">
                    {char.icon ? <char.icon className="w-3.5 h-3.5" /> : null}
                    {char.role}
                  </SectionBadge>
                  <h4 className="text-white mb-1">{char.name}</h4>
                  <p>{char.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="site-container space-y-16">
          {/* ── UNIFIED VIDEO MATRIX SHOWCASE ── */}
          <section className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Featured Singles Quick Select Tabs */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-white text-xl sm:text-2xl font-bold uppercase tracking-wide font-sans mb-1">
                    Featured Animated Singles
                  </h3>
                  <p className="text-white/70 text-sm">
                    Select a song below to switch the animated music video player.
                  </p>
                </div>

                {/* Animated Singles Quick Select Buttons */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex flex-wrap gap-2.5">
                    {musicSinglesList.map((single: any) => (
                      <FoolishShrimpButton
                        key={single.id}
                        onClick={() => setSelectedVideo(single.id)}
                        className={`px-4 py-2 transition-all ${selectedVideo === single.id
                          ? "scale-105 opacity-100"
                          : "opacity-80 hover:opacity-100"
                          }`}>
                        {single.title}
                      </FoolishShrimpButton>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Video Matrix Player & Video Grid Selector */}
              <div className="lg:col-span-7 space-y-4">
                <div className="aspect-video w-full rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo}`}
                    title="Rock and Roll Kids Player"
                    className="w-full h-full"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                  />
                </div>

                <div className="grid grid-rows-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                  {videosList.map((v: any) => (
                    <FoolishShrimpButton
                      key={v.id}
                      onClick={() => setSelectedVideo(v.id)}
                      className={`!h-auto !py-3 !px-4 !justify-start text-left transition-all ${selectedVideo === v.id
                        ? "scale-[1.02] opacity-100"
                        : "opacity-80 hover:opacity-100"
                        }`}>
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-purple-300 font-sans text-[11px] uppercase">
                            {v.tag}
                          </span>
                          <span className="text-xs text-white/50">▶ Play</span>
                        </div>
                        <h4 className="text-white font-sans text-sm mb-0.5 truncate">
                          {v.title}
                        </h4>
                        <p className="text-white/60 text-xs line-clamp-1">
                          {v.subtitle}
                        </p>
                      </div>
                    </FoolishShrimpButton>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── COMIC BOOKS & EPISODES CATALOG (12 ITEMS GRID) ── */}
          <section className="space-y-6 pt-6">
            <div className="border-b border-white/10 pb-4">
              <div>
                <h2 className="text-white font-sans text-2xl sm:text-3xl font-bold uppercase mb-1">
                  {comicsSection?.title || `Comic Books & Publications (${productsList.length} Items)`}
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-3xl mt-1.5">
                  {comicsSection?.subtitle || "Printed Comics & E-Books featuring 7th Heaven & the Rock 'n' Roll Kids adventures, episode storylines, line art coloring books, and concept artwork."}
                </p>
              </div>
            </div>

            {/* 12-Item Book Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsList.map((prod: any) => (
                <div
                  key={prod.id}
                  className="bg-[#0b0718]/90 border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between p-4 transition-all group">
                  <div>
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden mb-3 bg-black/40">
                      <Image
                        src={prod.coverImg}
                        alt={prod.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-sans text-purple-400 font-bold uppercase tracking-wider block mb-1">
                      {prod.badge}
                    </span>
                    <h3 className="text-white font-sans text-base font-bold mb-1.5 line-clamp-1">
                      {prod.title}
                    </h3>
                    <p className="text-white/70 text-xs leading-relaxed mb-4 line-clamp-2">
                      {prod.desc}
                    </p>
                  </div>

                  <a
                    href={prod.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block">
                    <FoolishShrimpButton className="w-full !py-2 !px-3 text-center justify-center font-bold text-xs">
                      <span>Amazon Link</span>
                    </FoolishShrimpButton>
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ── SERIES FOUNDERS & CREATORS ── */}
          <section className="space-y-6 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h2 className="font-sans text-white text-2xl sm:text-3xl font-bold uppercase mb-1">
                  {foundersSection?.title || "Series Founders & Contact"}
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-3xl mt-1.5">
                  {foundersSection?.subtitle || foundersSection?.body || "Meet the series creators and art team behind 7th Heaven & The Rock 'n' Roll Kids."}
                </p>
              </div>
            </div>

            {foundersSection?.image && (
              <div className="relative w-full rounded-2xl overflow-hidden pt-2">
                <Image
                  src={getMediaUrl(foundersSection.image)}
                  alt={foundersSection?.title || "Series Founders"}
                  width={1200}
                  height={400}
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {foundersList.map((founder: any) => (
                <div key={founder.name} className="flex flex-col space-y-4 group">
                  <div className="relative w-full aspect-[4/3] sm:aspect-[1.2/1] max-h-[460px] rounded-2xl overflow-hidden transition-all flex items-end justify-center [mask-image:linear-gradient(to_bottom,black_75%,transparent_98%)] [-webkit-mask-image:linear-gradient(to_bottom,black_75%,transparent_98%)]">
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
                      sizes="(min-width: 641px) 50vw, 100vw"
                      className="object-contain object-bottom hidden sm:block"
                    />
                    {/* Bottom Gradient Mask Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 pointer-events-none z-10" />
                  </div>
                  <div className="flex flex-col items-center text-center mt-2 space-y-2.5 w-full">
                    <h3 className="font-sans text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide mb-2">
                      {founder.name}
                    </h3>
                    <div>
                      <SectionBadge
                        label={founder.role}
                        isActive
                      />
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed max-w-md mx-auto mb-1">
                      {founder.desc}
                    </p>
                    {founder.phone ? (
                      <a
                        href={`tel:${founder.phone.replace(/[^0-9]/g, "")}`}
                        className="!text-white font-bold text-sm sm:text-base hover:underline block mb-0 mt-1">
                        {founder.phone}
                      </a>
                    ) : null}
                    {founder.email ? (
                      <a
                        href={`mailto:${founder.email}`}
                        className="text-purple-400 font-bold text-sm sm:text-base hover:underline block">
                        {founder.email}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>


        </div>
      </div>
    </div>
  );
}
