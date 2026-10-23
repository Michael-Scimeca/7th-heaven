"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Check,
  Eye,
  Music,
  Calendar,
  Ticket,
  ExternalLink,
  Layers,
  Flame,
  Radio,
  Sliders,
  ChevronDown,
} from "lucide-react";
import GuitarPickIcon from "@/components/GuitarPickIcon";

export interface NavLayoutOption {
  id: number;
  slug: string;
  name: string;
  category: "Floating" | "Symmetrical" | "Minimal" | "Editorial" | "Concert" | "App-Style";
  tagline: string;
  description: string;
  features: string[];
}

export const NAV_LAYOUTS: NavLayoutOption[] = [
  {
    id: 1,
    slug: "split-symmetrical",
    name: "01. Split Symmetrical (Current)",
    category: "Symmetrical",
    tagline: "Centered band logo with balanced flanking navigation links",
    description: "The current production layout: 7th Heaven brand logo anchored in the optical center, flanked evenly by primary content links on the left and utility/booking links on the right.",
    features: [
      "Centered brand identity",
      "Balanced 3-and-2 link distribution",
      "High-contrast purple Sign In pill on the right",
      "Seamless sticky backdrop blur",
    ],
  },
  {
    id: 2,
    slug: "classic-left-brand",
    name: "02. Classic Left Brand + Right Nav",
    category: "Editorial",
    tagline: "Traditional entertainment site layout with high utility and instant scanning",
    description: "Rock logo anchored on the far left with all navigation items and the Sign In CTA unified on the far right. Extremely intuitive, fast to scan, and leaves the center open for high-impact hero photography.",
    features: [
      "Instant familiarity and zero learning curve",
      "Unified right-hand navigation cluster",
      "Clean hierarchy with plenty of breathing room",
      "Maximized space for hero center content",
    ],
  },
  {
    id: 3,
    slug: "floating-glass-pill",
    name: "03. Floating Glass Pill (Island Nav)",
    category: "Floating",
    tagline: "Elevated frosted glass capsule hovering over the page content",
    description: "A detached, floating rounded pill container with deep backdrop blur, subtle metallic border, and glowing neon edges. Gives the site an ultra-modern, high-end Web3/Apple aesthetic.",
    features: [
      "Detached floating pill with 24px top clearance",
      "Frosted glassmorphism (backdrop-blur-xl bg-white/[0.06])",
      "Compact, unified capsule",
      "Refined hover states on links",
    ],
  },
  {
    id: 4,
    slug: "two-tier-concert-stack",
    name: "04. Two-Tier Concert Bar (Stack & Sub-Nav)",
    category: "Concert",
    tagline: "Top tier band insignia with dedicated secondary navigation rail",
    description: "Dual-deck navigation: The top bar showcases the large 7th Heaven emblem and live tour status badge, while a lower slimline bar delivers clean, evenly-spaced category navigation.",
    features: [
      "Prominent, unconstrained band logo",
      "Live tour ticker/status integrated on top",
      "Dedicated clean category strip below",
      "Perfect for major tour announcements and festival releases",
    ],
  },
  {
    id: 5,
    slug: "asymmetric-rock-voltage",
    name: "05. Asymmetric Rock Voltage (Heavy Left Mark)",
    category: "Editorial",
    tagline: "Bold electric rock aesthetic with heavy slanted logo and neon accents",
    description: "Aggressive, high-energy layout featuring an oversized italic band mark on the left with an electric violet underglow, and right-aligned links with energetic purple indicators.",
    features: [
      "Oversized high-voltage band typography",
      "Electric violet glow accents",
      "Right-aligned nav links with hover energy lines",
      "Bold, unmistakable rock and roll attitude",
    ],
  },
  {
    id: 6,
    slug: "minimalist-off-canvas",
    name: "06. Minimalist Off-Canvas (Zenith Hamburger)",
    category: "Minimal",
    tagline: "Ultra-clean horizon with live touring ticker and guitar-pick menu toggle",
    description: "Removes desktop clutter by showing only the 7th Heaven brand mark, an animated 'NOW TOURING: 2026' live indicator, and a sleek guitar-pick menu trigger that reveals full navigation on click.",
    features: [
      "100% unobstructed hero imagery",
      "Live tour status ticker in the center",
      "Signature guitar-pick toggle button",
      "Full theatrical overlay on expansion",
    ],
  },
  {
    id: 7,
    slug: "segmented-command-dock",
    name: "07. Segmented Command Dock (iOS / macOS Style)",
    category: "App-Style",
    tagline: "Segmented tactile switch dock with glowing pill chips",
    description: "An app-like segmented control dock: Each navigation destination sits inside an inset pill slot that illuminates on hover, giving tactile satisfaction and high-tech polish.",
    features: [
      "Apple/macOS segmented control styling",
      "Tactile pill chips for every page link",
      "Glow highlight on active destination",
      "Compact, modern, and fun to click",
    ],
  },
  {
    id: 8,
    slug: "editorial-brutalist",
    name: "08. Editorial Brutalist (High Voltage Grid)",
    category: "Editorial",
    tagline: "Hard vertical divider lines, wide-tracking condensed typography, and bold borders",
    description: "Inspired by iconic music editorial magazines and brutalist gig posters: Hard border rules, vertical line dividers between every link, and stark high-contrast typography.",
    features: [
      "Stark vertical column dividers between links",
      "Wide-tracking condensed typography",
      "Full-bleed top and bottom hairline borders",
      "Sharp, authoritative, print-inspired layout",
    ],
  },
  {
    id: 9,
    slug: "concert-utility-ticker",
    name: "09. Concert Utility Header (Live Show Ticker)",
    category: "Concert",
    tagline: "Integrated live show announcement micro-bar above standard nav",
    description: "Features a dynamic top alert banner for upcoming concerts, festival ticket drops, and cruise countdowns, directly stacked above a clean left-logo, right-nav header.",
    features: [
      "Integrated 'NEXT SHOW' live countdown ticker",
      "Quick ticket reservation link in top utility bar",
      "High commercial conversion for live shows",
      "Distinct dual-layer organization",
    ],
  },
  {
    id: 10,
    slug: "theatrical-cinematic-fade",
    name: "10. Theatrical Cinematic Fade",
    category: "Minimal",
    tagline: "No hard borders, seamless gradient feathering, and floating ticket CTA",
    description: "Completely borderless navigation that melts seamlessly into the stage lighting gradient background. Navigation links float effortlessly with subtle glowing dot indicators.",
    features: [
      "Zero hard borders or harsh container lines",
      "Soft progressive gradient fade into page content",
      "Micro-dot glowing active indicators",
      "Deeply immersive cinematic atmosphere",
    ],
  },
  {
    id: 11,
    slug: "centered-island-hub",
    name: "11. Centered Island Hub (All-in-One Center Cluster)",
    category: "Floating",
    tagline: "Brand logo and all links unified into a single optical centerpiece",
    description: "Brings the band mark, navigation links, and sign-in button together into a single clustered centerpiece in the middle of the header, leaving wide breathing room on both flanks.",
    features: [
      "Single cohesive focal point in viewport center",
      "Clean symmetrical breathing room on left and right",
      "Compact horizontal footprint",
      "Sophisticated boutique design feel",
    ],
  },
  {
    id: 12,
    slug: "super-bar-social-audio",
    name: "12. Super-Bar with Integrated Social & Audio",
    category: "Concert",
    tagline: "Full-spectrum entertainment header with quick Spotify, Apple Music & social icons",
    description: "Designed for music fans: Combines the primary page navigation with instant streaming links (Spotify, Apple Music, YouTube) right inside the top header alongside Sign In.",
    features: [
      "Embedded music streaming icons (Spotify, Apple Music)",
      "Direct fan engagement from the top of every page",
      "Balanced tripartite distribution",
      "High-utility rock band portal structure",
    ],
  },
  {
    id: 13,
    slug: "slimline-action-rail",
    name: "13. Slimline Action Rail (48px Compact)",
    category: "Minimal",
    tagline: "Low-profile 48px header maximizing screen space for page photography",
    description: "An ultra-sleek, space-saving 48px navigation rail. Ideal for photographic and video-heavy pages where maximum vertical viewport belongs to band imagery.",
    features: [
      "Ultra-compact 48px height",
      "Micro-typography with tracking-widest styling",
      "Leaves maximum screen real estate for hero photos",
      "Crisp, swift, non-distracting navigation",
    ],
  },
  {
    id: 14,
    slug: "audio-equalizer-nav",
    name: "14. Audio Equalizer Wave Nav",
    category: "Concert",
    tagline: "Animated real-time soundwave visualizer flanking the band logo",
    description: "Directly embeds animated soundwave frequency bars alongside the 7th Heaven brand logo. Instantly communicates live concert energy the moment the visitor arrives.",
    features: [
      "Animated bouncing equalizer visualizer beside logo",
      "Interactive audio stream cue",
      "Vibrant neon violet equalizer bars",
      "Distinctive musical identity anchor",
    ],
  },
  {
    id: 15,
    slug: "neomorphic-violet-glow",
    name: "15. Neomorphic Violet Glow Bar",
    category: "Floating",
    tagline: "Multi-layered purple glow aura with frosted inner depth",
    description: "Embraces the nocturnal purple lighting theme of 7th Heaven with intense ambient violet halos, luminous glass borders, and glowing button depression effects.",
    features: [
      "Ambient purple neon backlight aura",
      "Luminous translucent container borders",
      "Glow-halo button hover states",
      "Atmospheric rock club mood lighting",
    ],
  },
  {
    id: 16,
    slug: "dual-category-hubs",
    name: "16. Centered Logo with Dual Category Hubs",
    category: "Symmetrical",
    tagline: "Organized into two mega hubs: 'The Music' (left) & 'The Experience' (right)",
    description: "Groups links into two logical mental models: Left side hosts music & media (Media, Kids, Merch); Right side hosts live experiences (Cruise, Tour, Contact, VIP).",
    features: [
      "Clear conceptual grouping for fans and buyers",
      "Centered logo as the balancing anchor",
      "Category cluster labels with micro-subtitles",
      "Intuitive mental architecture",
    ],
  },
  {
    id: 17,
    slug: "full-bleed-festival-grid",
    name: "17. Full-Bleed Grid Nav (The Festival Board)",
    category: "Editorial",
    tagline: "Evenly spaced columnar grid spanning 100% of screen width",
    description: "A structured full-width grid layout where every nav destination occupies an equal-width cell across the entire browser viewport, with rich full-height hover fill transitions.",
    features: [
      "Full 100% viewport width spanning grid",
      "Equal-width clickable cells with vertical borders",
      "Full-height background fill on hover",
      "Festival lineup poster aesthetic",
    ],
  },
  {
    id: 18,
    slug: "bottom-floating-app-bar",
    name: "18. Rock Horizon (Bottom Floating App Bar)",
    category: "App-Style",
    tagline: "Modern mobile/app bar anchored at the bottom viewport fold",
    description: "Flips conventional web layout on its head: Keeps the top of the screen completely clear for breathtaking band visuals, while anchoring a sleek floating control bar at the bottom.",
    features: [
      "Fixed at the bottom screen fold (Dynamic Island / Spotify style)",
      "Zero visual obstruction at the top of the page",
      "Natural thumb-reach for touch and trackpads",
      "Includes mini audio play bar toggle",
    ],
  },
  {
    id: 19,
    slug: "vip-gold-ticket-stub",
    name: "19. VIP Gold & Amethyst Ticket Stub Nav",
    category: "Concert",
    tagline: "Concert-ticket themed CTA button with barcode and perforated edge motif",
    description: "Infuses authentic rock concert memorabilia into the nav: The Sign In button is styled as a VIP backstage pass ticket stub with perforated edge notches and barcode lines.",
    features: [
      "Backstage pass / VIP ticket stub action button",
      "Perforated notch styling and barcode motifs",
      "High-conversion curiosity trigger for fan sign-ups",
      "Classic rock collectible charm",
    ],
  },
  {
    id: 20,
    slug: "dual-capsule-islands",
    name: "20. Split Asymmetric Capsule (Dual Islands)",
    category: "Floating",
    tagline: "Two distinct floating glass capsules: Brand Island (left) + Nav Island (right)",
    description: "Deconstructs the single nav bar into two independent floating glass islands: An isolated brand pill on the left, and a dedicated navigation pill on the right.",
    features: [
      "Two independent floating glass islands",
      "Distinct identity separation between brand and navigation",
      "Modern editorial tech aesthetic",
      "High visual polish with dual drop-shadows",
    ],
  },
];

export default function NavLayoutsClient() {
  const [selectedLayoutId, setSelectedLayoutId] = useState<number>(1);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const activeLayout =
    NAV_LAYOUTS.find((l) => l.id === selectedLayoutId) || NAV_LAYOUTS[0];

  const categories = [
    "All",
    "Floating",
    "Symmetrical",
    "Concert",
    "Minimal",
    "Editorial",
    "App-Style",
  ];

  const filteredLayouts =
    filterCategory === "All"
      ? NAV_LAYOUTS
      : NAV_LAYOUTS.filter((l) => l.category === filterCategory);

  return (
    <main className="min-h-screen bg-[#07050d] text-white pb-32">
      {/* ── TOP LIVE PREVIEW AREA ── */}
      <section
        id="active-nav-preview-section"
        aria-labelledby="active-nav-preview-heading"
        className="sticky top-0 z-50 bg-[#090613]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl transition-all duration-300"
      >
        <div className="w-full px-4 sm:px-8 py-2 border-b border-white/5 bg-purple-950/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 uppercase tracking-widest font-mono text-[10px]">
              Active Live Preview:
            </span>
            <span className="font-bold text-white tracking-wide">
              {activeLayout.name}
            </span>
            <span className="rounded-full bg-purple-600/30 border border-purple-400/30 px-2 py-0.5 text-[10px] text-purple-300">
              {activeLayout.category}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-white/50 text-[11px]">
            <span>Click any layout below to switch instantly</span>
            <span>•</span>
            <Link
              href="/contact"
              className="text-purple-300 hover:text-white underline underline-offset-2 transition-colors"
            >
              Back to Contact Page →
            </Link>
          </div>
        </div>

        {/* Dynamic Nav Renderer based on active layout */}
        <div className="w-full relative transition-all duration-300">
          <RenderDynamicNav layoutId={activeLayout.id} />
        </div>
      </section>

      {/* ── INTRO HERO ── */}
      <div className="site-container page-container pt-8 pb-4 flex flex-col gap-4">
        <div>
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
            20 Navigation Layouts
          </h1>
          <p className="mt-2 text-white/70 max-w-2xl text-sm sm:text-base leading-relaxed">
            Select any layout below to preview it live at the top of the screen. Pick the layout style that best matches your vision for the 7th Heaven header navigation.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {categories.map((cat) => {
            const isSelected = filterCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 20 CARDS GALLERY GRID ── */}
      <section
        id="nav-catalog-grid"
        aria-labelledby="nav-catalog-heading"
        className="site-container page-container mt-6"
      >
        <h2 id="nav-catalog-heading" className="sr-only">
          Navigation Layout Gallery
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {filteredLayouts.map((layout) => {
            const isSelected = layout.id === selectedLayoutId;
            return (
              <article
                key={layout.id}
                onClick={() => setSelectedLayoutId(layout.id)}
                className={`flex flex-col justify-between rounded-[var(--radius-box)] border transition-all duration-200 cursor-pointer overflow-hidden p-6 ${
                  isSelected
                    ? "border-purple-400 bg-purple-950/20 shadow-xl shadow-purple-900/30 ring-2 ring-purple-500/40"
                    : "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                }`}
              >
                <div>
                  {/* Top Bar with Number & Badge */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-400">
                        #{String(layout.id).padStart(2, "0")}
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80">
                        {layout.category}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 font-medium border border-emerald-500/30">
                        <Check className="h-3.5 w-3.5" /> Active Live
                      </span>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-bold text-white">
                    {layout.name}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-purple-300 font-medium">
                    {layout.tagline}
                  </p>
                  <p className="mt-2 text-xs text-white/60 leading-relaxed">
                    {layout.description}
                  </p>

                  {/* Mini Visual Preview Box */}
                  <div className="my-5 rounded-xl border border-white/10 bg-[#0c0917] p-3 shadow-inner overflow-hidden pointer-events-none">
                    <div className="scale-[0.88] origin-top-left w-[114%]">
                      <RenderDynamicNav layoutId={layout.id} isCardPreview />
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="flex flex-col gap-1.5 text-xs text-white/70 mt-3">
                    {layout.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/40 font-mono">
                    Layout ID: {layout.slug}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLayoutId(layout.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-purple-500 text-white shadow-md shadow-purple-500/50"
                        : "bg-white/10 text-white hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {isSelected ? "Previewing at Top" : "Preview at Top"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Nav Renderer for each of the 20 layout options
// ─────────────────────────────────────────────────────────────────────────────
function RenderDynamicNav({
  layoutId,
  isCardPreview = false,
}: {
  layoutId: number;
  isCardPreview?: boolean;
}) {
  const containerClass = isCardPreview ? "py-2" : "py-3 px-4 sm:px-8";

  // Common links
  const leftLinks = ["MEDIA", "ROCK & ROLL KIDS", "MERCH"];
  const rightLinks = ["CRUISE", "CONTACT"];
  const allLinks = ["MEDIA", "ROCK & ROLL KIDS", "MERCH", "CRUISE", "CONTACT"];

  switch (layoutId) {
    // ── 01. Split Symmetrical (Current) ──
    case 1:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider text-white/80">
            {leftLinks.map((l) => (
              <span key={l} className="hover:text-purple-300 transition-colors">
                {l}
              </span>
            ))}
          </div>

          <div className="font-heading italic text-2xl sm:text-3xl font-black text-white tracking-wider">
            7th heaven
          </div>

          <div className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider text-white/80">
            {rightLinks.map((l) => (
              <span key={l} className="hover:text-purple-300 transition-colors">
                {l}
              </span>
            ))}
            <span className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-600/40">
              SIGN IN
            </span>
          </div>
        </div>
      );

    // ── 02. Classic Left Brand + Right Nav ──
    case 2:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="font-heading italic text-2xl sm:text-3xl font-black text-white tracking-wider">
            7th heaven
          </div>
          <div className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider text-white/80">
            {allLinks.map((l) => (
              <span key={l} className="hover:text-purple-300 transition-colors">
                {l}
              </span>
            ))}
            <span className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-600/40">
              SIGN IN
            </span>
          </div>
        </div>
      );

    // ── 03. Floating Glass Pill (Island Nav) ──
    case 3:
      return (
        <div className={`w-full flex justify-center ${containerClass}`}>
          <div className="flex items-center justify-between gap-8 rounded-full border border-white/20 bg-white/[0.08] backdrop-blur-2xl px-6 py-2.5 shadow-2xl shadow-purple-950/50 w-full max-w-4xl">
            <div className="font-heading italic text-xl font-black text-white tracking-wider">
              7th heaven
            </div>
            <div className="flex items-center gap-5 text-xs font-bold tracking-wider text-white/80">
              {allLinks.map((l) => (
                <span key={l} className="hover:text-purple-300 transition-colors">
                  {l}
                </span>
              ))}
            </div>
            <span className="rounded-full bg-purple-600 px-4 py-1 text-xs font-bold text-white shadow-md shadow-purple-600/50">
              SIGN IN
            </span>
          </div>
        </div>
      );

    // ── 04. Two-Tier Concert Bar (Stack & Sub-Nav) ──
    case 4:
      return (
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-6 py-2 border-b border-white/10">
            <div className="font-heading italic text-2xl sm:text-3xl font-black text-white tracking-wider">
              7th heaven
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/60 border border-purple-800/40 rounded-full px-3 py-1">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>LIVE TOUR 2026: 120+ DATES ON SALE</span>
            </div>
            <span className="rounded-full bg-purple-600 px-3.5 py-1 text-xs font-bold text-white">
              SIGN IN
            </span>
          </div>
          <div className="w-full flex justify-center gap-8 py-2 text-xs font-bold tracking-wider text-white/80 bg-white/[0.02]">
            {allLinks.map((l) => (
              <span key={l} className="hover:text-purple-300 transition-colors">
                {l}
              </span>
            ))}
          </div>
        </div>
      );

    // ── 05. Asymmetric Rock Voltage (Heavy Left Mark) ──
    case 5:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="flex items-center gap-4">
            <div className="font-heading italic text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              7TH HEAVEN
            </div>
            <span className="hidden sm:inline-block h-6 w-px bg-purple-500/50" />
            <span className="hidden sm:inline-block text-[11px] font-mono tracking-widest text-purple-300 uppercase">
              Official Site
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs sm:text-sm font-bold tracking-wider text-white/85">
            {allLinks.map((l) => (
              <span key={l} className="hover:text-purple-400 transition-colors border-b-2 border-transparent hover:border-purple-500 pb-0.5">
                {l}
              </span>
            ))}
            <span className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-600/50">
              VIP LOGIN
            </span>
          </div>
        </div>
      );

    // ── 06. Minimalist Off-Canvas (Zenith Hamburger) ──
    case 6:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="font-heading italic text-2xl font-black text-white tracking-wider">
            7th heaven
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60 font-mono tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>CHICAGO, IL • NEXT SHOW: SATURDAY</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white/80 hidden sm:inline">MENU</span>
            <div className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
              <GuitarPickIcon open={false} className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      );

    // ── 07. Segmented Command Dock (iOS / macOS Style) ──
    case 7:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="font-heading italic text-2xl font-black text-white tracking-wider">
            7th heaven
          </div>
          <div className="flex items-center gap-1 bg-white/5 border border-white/15 p-1 rounded-full backdrop-blur-xl">
            {allLinks.map((l, i) => (
              <span
                key={l}
                className={`rounded-full px-3.5 py-1 text-xs font-bold tracking-wide transition-all ${
                  i === 0
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/50"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {l}
              </span>
            ))}
          </div>
          <span className="rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-1.5 text-xs font-bold text-white">
            SIGN IN
          </span>
        </div>
      );

    // ── 08. Editorial Brutalist (High Voltage Grid) ──
    case 8:
      return (
        <div className="w-full border-b border-white/20 divide-x divide-white/20 flex items-stretch">
          <div className="px-6 py-3 font-heading italic text-2xl font-black text-white tracking-wider shrink-0 bg-white/5">
            7TH HEAVEN
          </div>
          {allLinks.map((l) => (
            <div
              key={l}
              className="flex-1 flex items-center justify-center px-4 py-3 text-xs font-mono font-bold tracking-widest text-white/80 hover:bg-purple-900/30 hover:text-white transition-colors"
            >
              {l}
            </div>
          ))}
          <div className="px-6 py-3 flex items-center justify-center bg-purple-600 text-white text-xs font-bold tracking-wider shrink-0">
            SIGN IN
          </div>
        </div>
      );

    // ── 09. Concert Utility Header (Live Show Ticker) ──
    case 9:
      return (
        <div className="w-full flex flex-col">
          <div className="w-full bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 py-1.5 px-6 border-b border-purple-800/40 flex items-center justify-between text-[11px] font-mono text-purple-300">
            <span className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-purple-400" />
              <span>UPCOMING SHOW: RIVERS CASINO • OCT 25</span>
            </span>
            <span className="underline cursor-pointer hover:text-white">
              GET VIP TICKETS & PASSES →
            </span>
          </div>
          <div className={`w-full flex items-center justify-between ${containerClass}`}>
            <div className="font-heading italic text-2xl font-black text-white tracking-wider">
              7th heaven
            </div>
            <div className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider text-white/80">
              {allLinks.map((l) => (
                <span key={l} className="hover:text-purple-300 transition-colors">
                  {l}
                </span>
              ))}
              <span className="rounded-full bg-purple-600 px-4 py-1 text-xs font-bold text-white shadow-md shadow-purple-600/40">
                SIGN IN
              </span>
            </div>
          </div>
        </div>
      );

    // ── 10. Theatrical Cinematic Fade ──
    case 10:
      return (
        <div className={`w-full flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent ${containerClass}`}>
          <div className="font-heading italic text-3xl font-black text-white tracking-wider drop-shadow-md">
            7th heaven
          </div>
          <div className="flex items-center gap-7 text-xs sm:text-sm font-bold tracking-widest text-white/90">
            {allLinks.map((l, i) => (
              <span key={l} className="flex flex-col items-center gap-1 hover:text-purple-300 transition-colors cursor-pointer">
                <span>{l}</span>
                {i === 0 && <span className="h-1 w-1 rounded-full bg-purple-400" />}
              </span>
            ))}
          </div>
          <span className="border border-white/30 rounded-full px-5 py-1 text-xs font-bold text-white backdrop-blur-md hover:bg-white/10 transition-colors">
            SIGN IN
          </span>
        </div>
      );

    // ── 11. Centered Island Hub (All-in-One Center Cluster) ──
    case 11:
      return (
        <div className={`w-full flex items-center justify-center ${containerClass}`}>
          <div className="flex items-center gap-8 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl px-8 py-2">
            <span className="text-xs font-bold text-white/80 hover:text-purple-300">MEDIA</span>
            <span className="text-xs font-bold text-white/80 hover:text-purple-300">KIDS</span>
            <div className="font-heading italic text-2xl font-black text-white px-2">
              7th heaven
            </div>
            <span className="text-xs font-bold text-white/80 hover:text-purple-300">CRUISE</span>
            <span className="text-xs font-bold text-white/80 hover:text-purple-300">CONTACT</span>
            <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
              SIGN IN
            </span>
          </div>
        </div>
      );

    // ── 12. Super-Bar with Integrated Social & Audio ──
    case 12:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="font-heading italic text-2xl font-black text-white tracking-wider">
            7th heaven
          </div>
          <div className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider text-white/80">
            {allLinks.map((l) => (
              <span key={l} className="hover:text-purple-300 transition-colors">
                {l}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">
              <Music className="h-3.5 w-3.5" />
            </span>
            <span className="h-7 w-7 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xs">
              <Radio className="h-3.5 w-3.5" />
            </span>
            <span className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-bold text-white">
              SIGN IN
            </span>
          </div>
        </div>
      );

    // ── 13. Slimline Action Rail (48px Compact) ──
    case 13:
      return (
        <div className="w-full h-12 flex items-center justify-between px-6 border-b border-white/10 bg-[#07050d]/90 backdrop-blur-md">
          <div className="font-heading italic text-lg font-black text-white">
            7th heaven
          </div>
          <div className="flex items-center gap-5 text-[11px] font-bold tracking-widest text-white/70">
            {allLinks.map((l) => (
              <span key={l} className="hover:text-white transition-colors">
                {l}
              </span>
            ))}
          </div>
          <span className="rounded-full bg-purple-600/80 px-3 py-1 text-[11px] font-bold text-white">
            SIGN IN
          </span>
        </div>
      );

    // ── 14. Audio Equalizer Wave Nav ──
    case 14:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="flex items-center gap-3">
            <div className="font-heading italic text-2xl font-black text-white tracking-wider">
              7th heaven
            </div>
            {/* Visual Equalizer Bars */}
            <div className="flex items-end gap-0.5 h-5 px-2">
              <span className="w-1 bg-purple-400 h-3 animate-pulse rounded-full" />
              <span className="w-1 bg-purple-300 h-5 animate-pulse rounded-full" />
              <span className="w-1 bg-purple-500 h-2 animate-pulse rounded-full" />
              <span className="w-1 bg-purple-400 h-4 animate-pulse rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider text-white/80">
            {allLinks.map((l) => (
              <span key={l} className="hover:text-purple-300 transition-colors">
                {l}
              </span>
            ))}
            <span className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-600/40">
              SIGN IN
            </span>
          </div>
        </div>
      );

    // ── 15. Neomorphic Violet Glow Bar ──
    case 15:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="font-heading italic text-2xl font-black text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">
            7th heaven
          </div>
          <div className="flex items-center gap-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl px-6 py-2 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
            {allLinks.map((l) => (
              <span key={l} className="text-xs font-bold text-white/80 hover:text-purple-300 transition-colors">
                {l}
              </span>
            ))}
          </div>
          <span className="rounded-xl bg-purple-600 border border-purple-400/50 px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]">
            SIGN IN
          </span>
        </div>
      );

    // ── 16. Centered Logo with Dual Category Hubs ──
    case 16:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400">
              THE MUSIC
            </span>
            <div className="flex items-center gap-4 text-xs font-bold text-white/80">
              <span>MEDIA</span>
              <span>KIDS</span>
              <span>MERCH</span>
            </div>
          </div>

          <div className="font-heading italic text-2xl font-black text-white">
            7th heaven
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400">
              THE EXPERIENCE
            </span>
            <div className="flex items-center gap-4 text-xs font-bold text-white/80">
              <span>CRUISE</span>
              <span>CONTACT</span>
              <span className="rounded-full bg-purple-600 px-3 py-0.5 text-xs text-white">
                SIGN IN
              </span>
            </div>
          </div>
        </div>
      );

    // ── 17. Full-Bleed Grid Nav (The Festival Board) ──
    case 17:
      return (
        <div className="w-full grid grid-cols-7 border-y border-white/10 text-center divide-x divide-white/10">
          <div className="col-span-2 py-3 px-4 font-heading italic text-xl font-black text-white text-left">
            7TH HEAVEN
          </div>
          {allLinks.map((l) => (
            <div key={l} className="py-3 px-2 text-xs font-bold text-white/80 hover:bg-white/5 transition-colors flex items-center justify-center">
              {l}
            </div>
          ))}
        </div>
      );

    // ── 18. Rock Horizon (Bottom Floating App Bar) ──
    case 18:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="font-heading italic text-xl font-black text-white/50">
            7th heaven (Header Cleared for Visuals)
          </div>
          <div className="rounded-full border border-purple-500/40 bg-purple-950/80 px-6 py-2 flex items-center gap-6 shadow-2xl">
            <span className="text-xs font-bold text-purple-300">↓ DOCKED AT SCREEN BOTTOM</span>
            <div className="flex items-center gap-4 text-xs font-bold text-white">
              {allLinks.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      );

    // ── 19. VIP Gold & Amethyst Ticket Stub ──
    case 19:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          <div className="font-heading italic text-2xl font-black text-white">
            7th heaven
          </div>
          <div className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wider text-white/80">
            {allLinks.map((l) => (
              <span key={l} className="hover:text-purple-300 transition-colors">
                {l}
              </span>
            ))}
            {/* Ticket Stub Button */}
            <div className="relative rounded-md bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white font-mono text-xs font-bold px-4 py-1.5 shadow-lg border border-purple-400/40 flex items-center gap-2">
              <Ticket className="h-3.5 w-3.5 text-amber-300" />
              <span>VIP PASS / SIGN IN</span>
            </div>
          </div>
        </div>
      );

    // ── 20. Split Asymmetric Capsule (Dual Islands) ──
    case 20:
      return (
        <div className={`w-full flex items-center justify-between ${containerClass}`}>
          {/* Island 1: Brand Mark */}
          <div className="rounded-full border border-white/15 bg-white/[0.08] backdrop-blur-xl px-5 py-2 shadow-xl">
            <span className="font-heading italic text-xl font-black text-white tracking-wider">
              7th heaven
            </span>
          </div>

          {/* Island 2: Links & Action */}
          <div className="rounded-full border border-white/15 bg-white/[0.08] backdrop-blur-xl px-6 py-2 shadow-xl flex items-center gap-6">
            <div className="flex items-center gap-5 text-xs font-bold tracking-wider text-white/80">
              {allLinks.map((l) => (
                <span key={l} className="hover:text-purple-300 transition-colors">
                  {l}
                </span>
              ))}
            </div>
            <span className="rounded-full bg-purple-600 px-3.5 py-1 text-xs font-bold text-white shadow-md">
              SIGN IN
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
