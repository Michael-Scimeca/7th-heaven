/* eslint-disable react-doctor/iframe-missing-sandbox */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Play, Music, Shield, ExternalLink, Mail,
  Users, Star, Tv, Zap, Heart
} from "lucide-react";

const ABOUT_DATA = {
  headline: "7th Heaven and the Rock 'n' Roll Kids",
  paragraph1: "7th heaven and the Rock 'n' Roll Kids is based on the band 7th heaven, which is globally known as a pop Rock Band. The animated series communicates messages of fun, positivity and social consciousness through the connection of music and imagination. Each episode focuses on problem solving, an adventure and a resolution.",
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
    amazonUrl: "https://www.amazon.com/dp/B096TJNDWR",
    coverImg: "/images/comics/719CbfCsqyL._SL1500_.jpg",
    badge: "Episode 5",
  },
  {
    id: "ep6",
    ep: "Episode 6",
    title: "Operation Mind Crime",
    subtitle: "7th heaven and the Rock'n'Roll Kids Operation Mind Crime",
    desc: "Special illustrated black & white edition uncovering the mystery of XEC Records headquarters.",
    amazonUrl: "https://www.amazon.com/dp/B096TJNDWR",
    coverImg: "/images/comics/81yWx2cHMjL._SL1500_.jpg",
    badge: "Episode 6",
  },
  {
    id: "ep7",
    ep: "Episode 7",
    title: "Caught In The Game",
    subtitle: "7th heaven and the Rock'n'Roll Kids Caught In The Game",
    desc: "Trapped inside a virtual reality video game grid, the Rock 'N' Roll Kids use music chords to beat the game boss.",
    amazonUrl: "https://www.amazon.com/dp/B096TJNDWR",
    coverImg: "/images/comics/61y6zQf1hCL._SL1500_.jpg",
    badge: "Episode 7",
  },
  {
    id: "ep8",
    ep: "Episode 8",
    title: "Don't Speak",
    subtitle: "7th heaven and the Rock'n'Roll Kids Don't Speak",
    desc: "A silent spell falls over the city until the band powers up their amplifiers to restore music and speech.",
    amazonUrl: "https://www.amazon.com/dp/B096TJNDWR",
    coverImg: "/images/comics/71mgiiwhIGL._SL1500_.jpg",
    badge: "Episode 8",
  },
  {
    id: "ep9",
    ep: "Episode 9",
    title: "Bad Company",
    subtitle: "7th heaven and the Rock'n'Roll Kids Bad Company",
    desc: "Wild west desert showdown where the band brings rhythm, harmony, and friendship to outlaws.",
    amazonUrl: "https://www.amazon.com/dp/B096TJNDWR",
    coverImg: "/images/comics/71njNs9hT2L._SL1500_.jpg",
    badge: "Episode 9",
  },
  {
    id: "cb",
    ep: "Coloring Book",
    title: "Coloring Book",
    subtitle: "7th heaven and the Rock'n'Roll Kids Coloring Book",
    desc: "20+ pages of high-resolution line art featuring all 7th Heaven characters, concert stages, and comic scenes.",
    amazonUrl: "https://www.amazon.com/dp/B096TJNDWR",
    coverImg: "/images/comics/51Q94xAzn7L.jpg",
    badge: "Coloring Book",
  },
  {
    id: "ab",
    ep: "Art Book",
    title: "Art Book",
    subtitle: "7th heaven and the Rock'n'Roll Kids Art Book",
    desc: "Exclusive concept sketches, character designs, storyboards, and development artwork from RNR Studios.",
    amazonUrl: "https://www.amazon.com/dp/B096TJNDWR",
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

const videosList = [
  {
    id: "3ZhqLJDRxQ8",
    title: "7th Heaven and the Rock 'n' Roll Kids Promo 1",
    tag: "Official Trailer",
    desc: "Official animated promo trailer for the upcoming TV series featuring original animation and music.",
  },
  {
    id: "vW9GMwJtUZ0",
    title: "Beautiful Life (Animated Video)",
    tag: "Music Video",
    desc: "High-energy animated music video communicating messages of fun, positivity, and hope.",
  },
  {
    id: "Fw9RruU3dT0",
    title: "Midwest Girls In The Summertime",
    tag: "Animated Single",
    desc: "Summer anthemic animated video celebrating good vibes and great rock and roll.",
  },
  {
    id: "W3dkLd9UkZU",
    title: "Time of Our Lives",
    tag: "Concert Finale",
    desc: "Full band animated concert performance showcasing the Rock 'N' Roll Kids live on stage.",
  },
];

const FEATURED_MUSIC_SINGLES = [
  {
    id: "vW9GMwJtUZ0",
    title: "Beautiful Life",
    subtitle: "Animated Official Music Video",
    tag: "Hit Single",
    desc: "A high-energy pop-rock anthem packed with vibrant animation, encouraging kids to embrace optimism, problem-solving, and joy.",
    youtubeUrl: "https://www.youtube.com/watch?v=vW9GMwJtUZ0",
  },
  {
    id: "Fw9RruU3dT0",
    title: "Midwest Girls In The Summertime",
    subtitle: "Animated Summer Anthem",
    tag: "Summer Single",
    desc: "Catchy summer melodies, energetic guitar solos, and fun animations celebrating sunshine and good vibes.",
    youtubeUrl: "https://www.youtube.com/watch?v=Fw9RruU3dT0",
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
    {/* Crossed drumsticks */}
    <path d="m4 3 8 7" />
    <path d="m20 3-8 7" />
    {/* Drum body & rim */}
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
    <path d="M6 13.8a4.5 4.5 0 1 1 2.6-8.3 5 5 0 0 1 9.8 1.7 4.5 4.5 0 1 1 .6 8.9V18H5v-4.2z" />
    <line x1="5" y1="21" x2="19" y2="21" />
  </svg>
);

const ExecutiveIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
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

export default function RockNRollKidsPage() {
  const [selectedVideo, setSelectedVideo] = useState("3ZhqLJDRxQ8");

  return (
    <div className="min-h-screen  text-white pt-24 pb-20 overflow-x-hidden">
      {/* ── NEON ARCADE SYNTHWAVE MATRIX (PERMANENT LAYOUT) ── */}
      <div className="animate-fadeIn">
        {/* Hero Header */}
        <section className="relative site-container py-8 text-center space-y-6">
          <h1 className="font-bold uppercase text-white font-mono">{ABOUT_DATA.headline}</h1>
          <p className="font-mono max-w-2xl mx-auto leading-relaxed">
            7th Heaven & The Rock &apos;N&apos; Roll Kids Official Animated Series, Books & Media Universe.
          </p>

          {/* Full Cast Lineup Image Banner (allcharacters2024.png) */}
          <div className="relative w-full rounded-lg overflow-hidden mt-4">
            <Image
              src="/images/comics/allcharacters2024.png"
              alt="7th Heaven and the Rock 'n' Roll Kids Full Cast Lineup 2024"
              width={1400}
              height={550}
              priority
              sizes="(max-width: 1280px) 100vw, 1400px"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>

          {/* Character Roster Info Cards Grid under the image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-4">
            {mainCharacters.map((char) => (
              <div key={char.name} className="flex flex-col justify-between pb-3.5 group  ">
                <div>
                  {char.image && (
                    <div className="relative w-full h-44 overflow-hidden mb-3 flex items-center justify-start">
                      <Image
                        src={char.image}
                        alt={char.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain object-left group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <char.icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono text-white uppercase">{char.role}</span>
                  </div>
                  <h4 className="font-bold text-white mb-1">{char.name}</h4>
                  <p className="leading-relaxed">{char.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="site-container space-y-16">
          {/* ── UNIFIED HERO SHOWCASE: ABOUT & CONCEPT (LEFT) + VIDEO MATRIX (RIGHT) ── */}
          <section className="space-y-6">


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Story Content & Featured Singles Tabs (LARGE TEXT) */}
              <div className="lg:col-span-5 space-y-6">
                <p className="font-medium text-cyan-100 leading-relaxed font-mono py-4">
                  {ABOUT_DATA.paragraph1}
                </p>
                <p className="leading-relaxed font-normal">
                  {ABOUT_DATA.paragraph2}
                </p>

                {/* Animated Singles Quick Select Buttons */}
                <div className="pt-3 border-t border-white/20 space-y-3">
                  <div className="flex flex-wrap gap-2.5">
                    {FEATURED_MUSIC_SINGLES.map((single) => (
                      <button
                        key={single.id}
                        type="button"
                        onClick={() => setSelectedVideo(single.id)}
                        className={`px-4 py-2 rounded-lg font-bold btn-cosmic-radial-property font-sans tracking-wide transition-all ${selectedVideo === single.id ? "bg-linear-to-r from-[#6917BF] via-[#8c0eaf] to-[#6F008E] text-white border-purple-400/50 shadow-md shadow-purple-600/30 scale-105 cursor-default"
                          : "bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer"
                          }`}
                      >
                        {single.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Video Matrix Player & Video Grid Selector */}
              <div className="lg:col-span-7 space-y-4">
                <div className="aspect-video w-full rounded-lg overflow-hidden  ">
                  <iframe src={`https://www.youtube.com/embed/${selectedVideo}`} title="Rock and Roll Kids Player" className="w-full h-full" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {videosList.map((v) => (
                    <button aria-label="Action button" type="button" key={v.id} onClick={() => setSelectedVideo(v.id)} className={`p-2.5 text-left transition-all rounded-lg text-white btn-cosmic-radial-property ${selectedVideo === v.id ? " "
                      : " "
                      }`}>
                      <span className="text-[9px] font-mono text-white block">{v.tag}</span>
                      <span className="font-bold text-cyan-100 line-clamp-1">{v.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── MODULE 3: COMPLETE PRODUCTS & BOOK COLLECTION (Pulled from products.html) ── */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 border- pb-3">
              <div>
                <h2 className="font-mono text-white font-bold uppercase">Comic Books & Publications (12 Items)</h2>
              </div>
              <a
                href="https://www.amazon.com/dp/B096TJNDWR"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-white font-mono font-bold uppercase rounded-lg flex items-center gap-2 btn-cosmic-radial-property w-fit"
              >
                <span>Paperback Book Series on Amazon</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 12-Item Book Grid with Real Covers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {ALL_PRODUCTS.map((p) => (
                <div key={p.id} className="group flex flex-col justify-between shadow-lg hover:shadow-pink-500/20">
                  <div>
                    <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-white/10 mb-2.5 bg-black">
                      <Image
                        src={p.coverImg}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-pink-400 block mb-0.5">{p.badge}</span>
                    <h3 className="font-bold text-white line-clamp-1 mb-1">{p.title}</h3>
                    <p className="line-clamp-2 mb-3">{p.desc}</p>
                  </div>
                  <a
                    href={p.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 btn-cosmic-radial-property  font-mono font-bold uppercase rounded-lg text-center transition-all block"
                  >
                    Amazon Link
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ── MODULE 5: CREATORS & CONTACT MATRIX (Pulled from contact.html) ── */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
              <div>
                <h2 className="font-mono text-white font-bold uppercase">Series Founders & Contact</h2>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-4">
              {/* Richard Hofherr Profile Card */}
              <div className="flex flex-col space-y-4 group">
                <div className="relative w-full h-[350px] sm:h-[500px] md:h-[600px] lg:h-[700px] max-h-[700px] rounded-2xl overflow-hidden transition-all flex items-center justify-center [mask-image:linear-gradient(to_bottom,black_50%,transparent_98%)] [-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent_98%)]">
                  {/* Mobile Image */}
                  <Image
                    src="/images/members/dicky-mobile.png"
                    alt="Richard Hofherr Mobile"
                    fill
                    sizes="(max-width: 640px) 100vw, 0px"
                    className="object-contain object-center sm:hidden"
                  />
                  {/* Desktop Image */}
                  <Image
                    src="/images/members/dicky.png"
                    alt="Richard Hofherr Desktop"
                    fill
                    sizes="(min-width: 641px) 50vw, 100vw"
                    className="object-contain object-center hidden sm:block"
                  />
                  {/* Bottom Gradient Mask Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-48 sm:h-64 bg-gradient-to-t from-[#05030a] via-[#05030a]/90 to-transparent pointer-events-none z-10" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-mono text-amber-400 font-bold">Richard Hofherr</h3>
                  <span className="font-mono rounded-lg inline-block">
                    7th heaven · NTD Animation
                  </span>
                  <p className="leading-relaxed mb-0">
                    Founder and songwriter of 7th heaven. Co-creator of 7th Heaven & The Rock &apos;n&apos; Roll Kids animated series, comics, and video games.
                  </p>
                  <a
                    href="mailto:Rich777@aol.com"
                    className="py-2.5  font-mono font-bold uppercase rounded-xl transition-all flex items-center justify-start gap-2 w-full"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Rich777@aol.com</span>
                  </a>
                </div>
              </div>

              {/* Roy Adorjan Profile Card */}
              <div className="flex flex-col space-y-4 group">
                <div className="relative w-full h-[350px] sm:h-[500px] md:h-[600px] lg:h-[700px] max-h-[700px] rounded-2xl overflow-hidden transition-all flex items-center justify-center [mask-image:linear-gradient(to_bottom,black_50%,transparent_98%)] [-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent_98%)]">
                  <Image
                    src="/images/comics/Roy.png"
                    alt="Roy Adorjan"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain object-center"
                  />
                  {/* Bottom Gradient Mask Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-48 sm:h-64 bg-gradient-to-t from-[#05030a] via-[#05030a]/90 to-transparent pointer-events-none z-10" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-mono text-purple-400 font-bold">Roy Adorjan</h3>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono rounded-lg inline-block">
                    RNR Studios
                  </span>
                  <p className="leading-relaxed mb-0">
                    Lead animator and character designer at RNR Studios. Co-creator and art director for 7th Heaven & The Rock &apos;n&apos; Roll Kids.
                  </p>
                  <a
                    href="mailto:info@minimartians.com"
                    className="py-2.5  font-mono font-bold uppercase rounded-xl transition-all flex items-center justify-start gap-2 w-full"
                  >
                    <Mail className="w-4 h-4" />
                    <span>info@minimartians.com</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
