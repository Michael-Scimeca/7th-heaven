"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  ShoppingBag,
  UserCheck,
  Radio,
  Sparkles,
  Lock,
  ShieldCheck,
  Layers,
  Terminal,
  Search,
  ExternalLink,
  MapPin,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Compass,
  Film,
  Calendar,
  CreditCard,
  X,
  Tag,
  Share2,
} from "lucide-react";

interface RouteItem {
  path: string;
  type: "Static" | "SSG" | "Dynamic" | "API";
  label: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isPublic?: boolean;
}

const ALL_ROUTES: RouteItem[] = [
  // ── Public Pages ──
  { path: "/", type: "Static", label: "Home Page", category: "Public Pages", description: "Official homepage featuring music player, tour dates, video showcase, and latest news.", icon: Globe, isPublic: true },
  { path: "/shows/past", type: "Static", label: "Past Shows Archive", category: "Public Pages", description: "Searchable archive of historical 7th Heaven performances and past venue dates.", icon: Globe, isPublic: true },
  { path: "/shows/075144a7-588c-4d9a-a8b5-b44bca910b90", type: "SSG", label: "Show Detail (Sample)", category: "Public Pages", description: "Individual show page with venue details, setlists, maps, and ticketing links.", icon: Globe, isPublic: true },
  { path: "/contact", type: "Static", label: "Contact & Booking", category: "Public Pages", description: "Get in touch with band management, press inquiries, and general contact.", icon: Globe, isPublic: true },
  { path: "/book", type: "Static", label: "Booking Request Form", category: "Public Pages", description: "Request 7th Heaven for festival, private party, corporate event, or venue bookings.", icon: Calendar, isPublic: true },
  { path: "/book/cancel", type: "Static", label: "Booking Canceled", category: "Public Pages", description: "Booking inquiry canceled notice and retry options.", icon: Globe, isPublic: true },
  { path: "/book/success", type: "Static", label: "Booking Success", category: "Public Pages", description: "Confirmation screen after submitting a band booking request.", icon: CheckCircle2, isPublic: true },
  { path: "/faq", type: "Static", label: "Frequently Asked Questions", category: "Public Pages", description: "Answers to common questions about shows, tickets, VIP packages, and band history.", icon: Globe, isPublic: true },
  { path: "/features", type: "Static", label: "Band Features", category: "Public Pages", description: "Press coverage, radio records, and career milestone highlights.", icon: Globe, isPublic: true },
  { path: "/media", type: "Static", label: "Media & Press Kit", category: "Public Pages", description: "High-res promotional photos, logos, bio documents, and stage riders.", icon: Film, isPublic: true },
  { path: "/privacy", type: "Static", label: "Privacy Policy", category: "Public Pages", description: "Data privacy practices, cookie policies, and user information rights.", icon: Globe, isPublic: true },
  { path: "/terms", type: "Static", label: "Terms of Service", category: "Public Pages", description: "Official terms and conditions for using 7thheavenband.com.", icon: Globe, isPublic: true },
  { path: "/returns", type: "Static", label: "Return Policy", category: "Public Pages", description: "Merchandise return and exchange policy details.", icon: Globe, isPublic: true },

  // ── Store & Merchandise ──
  { path: "/merch", type: "Static", label: "Official Merch Store", category: "Store & Merch", description: "Official 7th Heaven apparel, shirts, CDs, guitar picks, and accessories.", icon: ShoppingBag, isPublic: true },
  { path: "/qr/merch", type: "Dynamic", label: "QR Code Merch Scanner", category: "Store & Merch", description: "Instant merchandise ordering at live shows via QR code scanning.", icon: ShoppingBag, isPublic: true },
  { path: "/payment-test", type: "Static", label: "Payment Test Shop (EPX Mock)", category: "Store & Merch", description: "EPX payment gateway test checkout sandbox.", icon: CreditCard },

  // ── Fan Portal ──
  { path: "/fans", type: "Static", label: "Fan Club Hub", category: "Fan Portal", description: "Central fan dashboard for exclusive content, member perks, and rankings.", icon: UserCheck, isPublic: true },
  { path: "/fans/complete-profile", type: "Static", label: "Complete Fan Profile", category: "Fan Portal", description: "Fan account onboarding and profile details setup.", icon: UserCheck },
  { path: "/fans/sample_fan", type: "Dynamic", label: "Fan Member Profile", category: "Fan Portal", description: "Public fan profile page showcasing show badges and favorite songs.", icon: UserCheck, isPublic: true },
  { path: "/fan-photo-wall", type: "Static", label: "Fan Photo Wall", category: "Fan Portal", description: "Community gallery of uploaded concert photos and band memories.", icon: Film, isPublic: true },
  { path: "/picks", type: "Static", label: "Pick Collector Lottery", category: "Fan Portal", description: "Collect digital guitar picks at shows for exclusive prize entries.", icon: Sparkles, isPublic: true },
  { path: "/planner", type: "Static", label: "Show Planner Portal", category: "Fan Portal", description: "Private show organizer & event coordinator management dashboard.", icon: UserCheck },
  { path: "/planner/verify", type: "Static", label: "Planner Verification", category: "Fan Portal", description: "PIN verification for show planner portal access.", icon: Lock },

  // ── Live Stream & Broadcast ──
  { path: "/live", type: "Static", label: "Live Stream Hub", category: "Live Stream", description: "Watch 7th Heaven concert live streams, multi-cam feeds, and backstage commentary.", icon: Radio, isPublic: true },
  { path: "/live/live_michael", type: "Static", label: "Michael Live Stream", category: "Live Stream", description: "Dedicated Michael Scimeca stage cam stream.", icon: Radio },
  { path: "/live/live_ryan", type: "Static", label: "Ryan Live Stream", category: "Live Stream", description: "Dedicated Ryan Cook guitar stream.", icon: Radio },
  { path: "/live/live_sammy", type: "Static", label: "Sammy Live Stream", category: "Live Stream", description: "Dedicated Sammy drums stream.", icon: Radio },
  { path: "/live/live_tony", type: "Static", label: "Tony Live Stream", category: "Live Stream", description: "Dedicated Tony bass stream.", icon: Radio },

  // ── Cruise Portal ──
  { path: "/cruise", type: "Static", label: "Fan Cruise 2026", category: "Cruise Portal", description: "Official 7th Heaven Caribbean Fan Cruise 2026 booking & itinerary hub.", icon: Sparkles, isPublic: true },
  { path: "/cruise/dashboard", type: "Static", label: "Cruise Dashboard", category: "Cruise Portal", description: "Cruiser stateroom portal, schedule, and party packages.", icon: Sparkles },
  { path: "/cruise/preview", type: "Static", label: "Cruise Preview", category: "Cruise Portal", description: "Ship virtual tour and VIP event previews.", icon: Sparkles, isPublic: true },
  { path: "/cruise/verify", type: "Static", label: "Cruise Verify PIN", category: "Cruise Portal", description: "Cruiser account security PIN verification.", icon: Lock },
  { path: "/cruise/cancel", type: "Static", label: "Cruise Booking Cancel", category: "Cruise Portal", description: "Fan cruise booking cancellation procedure.", icon: Sparkles },

  // ── Admin & Crew ──
  { path: "/admin", type: "Static", label: "Admin Main Portal", category: "Admin & Crew", description: "Band leadership admin portal for site settings and show management.", icon: Lock },
  { path: "/admin/email-map", type: "Static", label: "Admin Email Routing Map", category: "Admin & Crew", description: "Configuration matrix for venue & fan email routing.", icon: Lock },
  { path: "/admin/emails", type: "Static", label: "Admin Newsletter & Broadcasts", category: "Admin & Crew", description: "Send fan newsletters and email announcements.", icon: Lock },
  { path: "/admin/legal", type: "Static", label: "Admin Legal Contracts", category: "Admin & Crew", description: "Band contract repository and performance riders.", icon: Lock },
  { path: "/crew", type: "Static", label: "Crew HQ Dashboard", category: "Admin & Crew", description: "Road crew schedule, stage setup riders, and equipment checklists.", icon: ShieldCheck },
  { path: "/crew-michael", type: "Static", label: "Michael Crew Dashboard", category: "Admin & Crew", description: "Personal setup notes & channel assignments for Michael.", icon: ShieldCheck },
  { path: "/crew-ryan", type: "Static", label: "Ryan Crew Dashboard", category: "Admin & Crew", description: "Guitar rig & wireless frequency map for Ryan.", icon: ShieldCheck },
  { path: "/crew-sam", type: "Static", label: "Sam Crew Dashboard", category: "Admin & Crew", description: "Drum kit mic map & monitor mix settings for Sammy.", icon: ShieldCheck },
  { path: "/crew-tony", type: "Static", label: "Tony Crew Dashboard", category: "Admin & Crew", description: "Bass setup & IEM frequencies for Tony.", icon: ShieldCheck },
  { path: "/crew-abbie", type: "Static", label: "Abbie Crew Dashboard", category: "Admin & Crew", description: "Production & stage management notes for Abbie.", icon: ShieldCheck },
  { path: "/crew/verify", type: "Static", label: "Crew Verification", category: "Admin & Crew", description: "Security PIN check for crew area access.", icon: ShieldCheck },

  // ── UI Demos & Interactive Lab ──
  { path: "/style-guide", type: "Static", label: "Full UI Style Guide & Studio", category: "UI Demos & Labs", description: "Comprehensive component library, typography scale, color swatches, and design system tokens.", icon: Layers, isPublic: true },
  { path: "/hambuger", type: "Static", label: "Hamburger Menu Animation", category: "UI Demos & Labs", description: "Interactive full-screen navigation menu transition test.", icon: Layers },
  { path: "/pagetransition", type: "Static", label: "Page Transition Showcase", category: "UI Demos & Labs", description: "Fluid curtain slide page transition demo.", icon: Layers },
  { path: "/slideup", type: "Static", label: "Slideup Section Stacking", category: "UI Demos & Labs", description: "Layered scroll section stacking animation demo.", icon: Layers },
  { path: "/textcolor", type: "Static", label: "Text Color Gradient Studio", category: "UI Demos & Labs", description: "Interactive gradient text background generator.", icon: Layers },
  { path: "/video", type: "Static", label: "Video Showcase Studio", category: "UI Demos & Labs", description: "Custom YouTube video modal player demo.", icon: Film },

  // ── API Routes ──
  { path: "/api/tour", type: "API", label: "GET Tour Dates JSON", category: "API Routes", description: "Public REST endpoint returning upcoming show dates.", icon: Terminal },
  { path: "/api/health", type: "API", label: "GET Health Check", category: "API Routes", description: "Server status & uptime health diagnostic check.", icon: Terminal },
  { path: "/api/announcement", type: "API", label: "GET/POST Announcement Banner", category: "API Routes", description: "API endpoint for banner notices and urgent show alerts.", icon: Terminal },
  { path: "/api/audio", type: "API", label: "GET Audio Playlist Tracks", category: "API Routes", description: "API endpoint returning audio player tracklist JSON.", icon: Terminal },
];

const CATEGORIES = [
  "All Categories",
  "Public Pages",
  "Store & Merch",
  "Fan Portal",
  "Live Stream",
  "Cruise Portal",
  "Admin & Crew",
  "UI Demos & Labs",
  "API Routes",
];

export default function VisualSitemapClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const filteredRoutes = useMemo(() => {
    return ALL_ROUTES.filter((route) => {
      const matchesCategory =
        selectedCategory === "All Categories" || route.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        route.label.toLowerCase().includes(q) ||
        route.path.toLowerCase().includes(q) ||
        route.category.toLowerCase().includes(q) ||
        route.description.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    return {
      total: ALL_ROUTES.length,
      public: ALL_ROUTES.filter((r) => r.isPublic).length,
      dynamic: ALL_ROUTES.filter((r) => r.type === "Dynamic" || r.type === "SSG").length,
      api: ALL_ROUTES.filter((r) => r.type === "API").length,
    };
  }, []);

  return (
    <div className="min-h-screen text-white pt-24 pb-20 px-6 sm:px-8 lg:px-[42px] max-w-7xl mx-auto space-y-10">

      {/* Header Banner */}
      <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/30 via-black/50 to-black/80 p-8 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-cyan-600/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Navigation Directory
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300">
              Site Map
            </h1>
            <p className="text-white/60 text-sm max-w-2xl leading-relaxed">
              Explore every public page, fan portal, live stream room, merch shop, admin dashboard, and API endpoint across the 7th Heaven web app.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg"
            >
              <FileCode className="w-4 h-4 text-purple-300" />
              <span>XML Sitemap</span>
              <ExternalLink className="w-3 h-3 text-white/50" />
            </a>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="block text-white/40 text-[10px] font-mono uppercase tracking-widest">Total Routes</span>
            <span className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">{stats.total}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="block text-white/40 text-[10px] font-mono uppercase tracking-widest">Public Pages</span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">{stats.public}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="block text-white/40 text-[10px] font-mono uppercase tracking-widest">Dynamic / SSG</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">{stats.dynamic}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="block text-white/40 text-[10px] font-mono uppercase tracking-widest">API Endpoints</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">{stats.api}</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search pages by name, path, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-black/60 border border-purple-500/30 text-white placeholder:text-white/40 text-xs font-medium outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                    : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/10 border-white/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Routes Directory Grid */}
      {filteredRoutes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">No matching routes found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Try adjusting your search query or switching category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Categories");
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => {
            const Icon = route.icon;
            const isApi = route.type === "API";

            return (
              <div
                key={route.path}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-500/40 p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Top Badge Strip */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                      {route.category}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest border ${
                        route.type === "API"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : route.type === "Dynamic"
                          ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                          : route.type === "SSG"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : "bg-white/10 text-white/70 border-white/20"
                      }`}
                    >
                      {route.type}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white group-hover:text-purple-300 transition">
                        {route.label}
                      </h3>
                      <code className="text-[11px] font-mono text-cyan-400/80 group-hover:text-cyan-300 transition block mt-0.5">
                        {route.path}
                      </code>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-white/60 leading-relaxed">
                    {route.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    {route.isPublic ? "● Public Access" : "🔒 Member / Protected"}
                  </span>

                  {isApi ? (
                    <a
                      href={route.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 hover:text-amber-300 transition"
                    >
                      <span>Fetch JSON</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={route.path}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-400 group-hover:text-purple-300 transition"
                    >
                      <span>Visit Page</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Meta Note */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>7th Heaven Official Website — Site Directory & Visual Map</span>
        </div>
        <span>Built with Next.js App Router & Tailwind CSS</span>
      </div>

    </div>
  );
}
