"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  GitBranch,
  Globe,
  Terminal,
  FileCode,
  ExternalLink,
  Layers,
  DollarSign,
  Server,
  CheckCircle2,
  ListFilter,
  Network,
  ArrowRight,
  Search,
  X,
  Sparkles,
  Calendar,
  ShoppingBag,
  UserCheck,
  Radio,
  Mail,
  ShieldCheck,
  Lock,
} from "lucide-react";

// Dynamic Import for @xyflow/react User Flow Map Engine
const UserFlowMap = dynamic(() => import("@/components/UserFlowMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[850px] rounded-3xl border border-purple-500/30 bg-[#050505] flex flex-col items-center justify-center gap-4 text-purple-300 animate-pulse">
      <GitBranch className="w-10 h-10 animate-spin text-purple-400" />
      <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/60">
        Loading Interactive User Flow Graph Engine...
      </span>
    </div>
  ),
});

// --- RESTORED SITE STRUCTURE DATA FROM COMMIT 7f421dc ---
const siteStructure = [
  {
    title: "Public Experience (Fans & Band)",
    routes: [
      {
        path: "/",
        name: "Home Page",
        sections: ["Cinematic Hero Hub", "Proximity Notifications", "Next Show Banner", "Upcoming Shows Grid", "Cruise Promo Banner", "Tour Map", "Latest Release", "Music Player", "Merch Quick Shop", "Photo Gallery", "Video Section", "Behind the Scenes"],
        features: ["Dynamic Header Intersection", "Local Storage Opt-in tracking", "Live Stream Detection", "Supabase Real-Time Feed", "E2E Verified ⭐"],
        color: "text-purple-400",
        border: "border-purple-500/30",
        bg: "bg-purple-500/5",
      },
      {
        path: "/shows/past",
        name: "Past Shows Archive",
        sections: ["Searchable Historical Show Archive", "Past Venue Performances", "Setlists & Photos"],
        features: ["Supabase Real-Time Search", "Date Filtering", "Venue Geolocation"],
        color: "text-blue-400",
        border: "border-blue-500/30",
        bg: "bg-blue-500/5",
      },
      {
        path: "/shows/075144a7-588c-4d9a-a8b5-b44bca910b90",
        name: "Show Detail View",
        sections: ["Show Hero", "RSVP Controls", "Attendee List", "Invite Challenge Card", "QR Share Code", "Venue Directions", "Live Feed Banner"],
        features: ["Auto-RSVP via SMS Deep Link", "Twilio Webhook Reply Handling", "Supabase show_attendance", "Dynamic QR Generation"],
        color: "text-blue-400",
        border: "border-blue-500/30",
        bg: "bg-blue-500/5",
      },
      {
        path: "/video",
        name: "Video Gallery",
        sections: ["16:9 Thumbnail Grids", "Custom Inline Player", "Categorized Playlists"],
        features: ["Intelligent API Fallbacks", "Aspect Ratio Scaling", "Hydration Error Immunity"],
        color: "text-pink-400",
        border: "border-pink-500/30",
        bg: "bg-pink-500/5",
      },
      {
        path: "/fan-photo-wall",
        name: "Fan Photo Wall",
        sections: ["Dynamic Masonry Grid", "Hover Interactions", "Fullscreen Lightbox", "Upload Fan Photo Modal"],
        features: ["CSS Column-Based Masonry", "Focus Trapping Modal", "Optimized Image Loading"],
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/5",
      },
      {
        path: "/live",
        name: "Live Stream Hub",
        sections: ["Active Broadcast Gallery", "Real-Time Stream Detection", "Michael, Ryan, Sammy & Tony Cams"],
        features: ["LiveKit Room Aggregation", "Supabase Cross-Validation", "WebRTC Video Streams"],
        color: "text-rose-400",
        border: "border-rose-500/30",
        bg: "bg-rose-500/5",
      },
      {
        path: "/merch",
        name: "Official Merch Store",
        sections: ["Product Grid", "Headless Checkout", "Cart System", "QR Scanner Link"],
        features: ["Shopify Storefront API", "GraphQL Cart Mutations", "Dynamic Inventory"],
        color: "text-lime-400",
        border: "border-lime-500/30",
        bg: "bg-lime-500/5",
      },
      {
        path: "/book",
        name: "Book the Band",
        sections: ["Multi-Step Booking Form", "Event Type Selection", "Production & Extras", "Planner Dashboard Access"],
        features: ["Supabase Form Submission", "Role-Based Planner Accounts", "Token-Based Cancellation Links", "Booking Alert Emails"],
        color: "text-fuchsia-400",
        border: "border-fuchsia-500/30",
        bg: "bg-fuchsia-500/5",
      },
      {
        path: "/contact",
        name: "Contact HQ",
        sections: ["Contact Form", "Social Links", "Media Kit Link"],
        features: ["Form Validation", "Resend Integration"],
        color: "text-sky-400",
        border: "border-sky-500/30",
        bg: "bg-sky-500/5",
      },
      {
        path: "/cruise",
        name: "Caribbean Cruise 2026",
        sections: ["Cinematic Hero", "Interest Signup Form", "Live Fan Counter", "Day-by-Day Itinerary", "FAQ Accordion"],
        features: ["Supabase Interest Tracking", "Resend Email PIN Confirmation", "Token-Based Cancellation", "Cruiser Dashboard Link"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
    ],
  },
  {
    title: "Authentication & Dashboards",
    routes: [
      {
        path: "/fans",
        name: "Fan Club Dashboard",
        sections: ["Fan vs Crew Pathing", "Backstage Live Feed", "SMS Live Alert Opt-In", "Proximity Show Alerts", "Referral Program + QR Code", "Guitar Pick Lottery"],
        features: ["Role-Based Automatic Routing", "JWT Passwordless Auth PIN", "isCruiser Email Reconciliation", "Cross-Promo Cruise Banner"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
      {
        path: "/planner",
        name: "Planner Dashboard",
        sections: ["Booking Status Tracker", "Event Details View", "Re-Book Flow", "Inline Checklist Editing"],
        features: ["Role-Based Access", "Supabase Row-Level Security", "Real-Time Status Updates"],
        color: "text-teal-400",
        border: "border-teal-500/30",
        bg: "bg-teal-500/5",
      },
      {
        path: "/cruise/dashboard",
        name: "Cruise Passenger Dashboard",
        sections: ["Stateroom Cabin Setup", "Itinerary Calendar", "Lounge Chat", "Deck Tour Preview"],
        features: ["Supabase site_settings Messaging", "Real-time Notifications", "Role-Based Access"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
      {
        path: "/crew",
        name: "Crew HQ Dashboard",
        sections: ["Live Broadcast Studio", "Live Chat & Reactions", "Interactive Raffle Engine", "Gear Checklists"],
        features: ["LiveKit Streaming Control", "Cross-Tab Synchronization", "Real-Time Broadcast Toggles"],
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/5",
      },
      {
        path: "/admin",
        name: "Master Admin Command Center",
        sections: ["Band & Site Tab: Announcements, Analytics, Shopify Sales, Booking Approval, Live Streams, Photo Moderation, SMS/Newsletter Studio"],
        features: ["Band/Cruise Tab Toggle", "Leaflet Map Integration", "Secure Role-Based Access", "Supabase Read/Write", "Shopify API Aggregation"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      },
      {
        path: "/admin/emails",
        name: "Transactional Email Previews",
        sections: ["14 Email Templates (Booking, Auth PIN, Cruise Verification, Live Alert, Newsletter)"],
        features: ["Centralized Template Registry", "Resend API Test Sender", "HTML & Code Viewers"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      },
    ],
  },
];

// --- RESTORED API ENDPOINTS FROM COMMIT 7f421dc ---
const apiEndpoints = [
  { method: "GET", path: "/api/tour", desc: "Public show dates JSON feed", auth: "Public" },
  { method: "GET", path: "/api/health", desc: "System uptime and server diagnostic", auth: "Public" },
  { method: "POST", path: "/api/cruise/signup", desc: "Cruise interest registration & PIN gen", auth: "Public" },
  { method: "POST", path: "/api/cruise/verify-pin", desc: "Verify 6-digit PIN & generate session", auth: "Public" },
  { method: "POST", path: "/api/auth/send-pin", desc: "Passwordless authentication PIN email", auth: "Public" },
  { method: "POST", path: "/api/auth/verify-pin", desc: "Verify sign-in PIN & set session cookie", auth: "Public" },
  { method: "POST", path: "/api/booking/submit", desc: "Band booking inquiry submission", auth: "Public" },
  { method: "GET", path: "/api/live-rooms", desc: "LiveKit active broadcast room status", auth: "Public" },
  { method: "POST", path: "/api/admin/broadcast", desc: "Broadcast live notification alert to fans", auth: "Admin" },
];

// --- RESTORED INFRASTRUCTURE COST SERVICES FROM COMMIT 7f421dc ---
const infraServices = [
  { service: "Vercel Pro", icon: "▲", cost: "$20", unit: "/mo", plan: "App Host & Edge Routing", what: "Next.js Serverless SSR, ISR, Edge Middleware & SSL", color: "text-purple-400", link: "https://vercel.com" },
  { service: "Shopify Storefront", icon: "🛍️", cost: "$39", unit: "/mo", plan: "E-Commerce Engine", what: "Headless GraphQL Cart API & Product Catalog", color: "text-emerald-400", link: "https://shopify.com" },
  { service: "Supabase Pro", icon: "⚡", cost: "$25", unit: "/mo", plan: "Postgres & Auth", what: "PostgreSQL Database, Real-Time Sync & Row Security", color: "text-cyan-400", link: "https://supabase.com" },
  { service: "Resend API", icon: "✉️", cost: "Free–$20", unit: "/mo", plan: "Transactional Emails", what: "14 Custom HTML Email Templates for PINs & Bookings", color: "text-amber-400", link: "https://resend.com" },
  { service: "Twilio SMS", icon: "📲", cost: "~$0.0079", unit: "/msg", plan: "SMS Alerts & RSVPs", what: "Concert SMS Blasts & 2-Way Reply Webhooks", color: "text-rose-400", link: "https://twilio.com" },
  { service: "LiveKit Starter", icon: "📡", cost: "Free–$50", unit: "/mo", plan: "WebRTC Live Cams", what: "Multi-Angle Live Stage Streams & Low-Latency Video", color: "text-red-400", link: "https://livekit.io" },
];

// Tree Helper Sub-Components from Commit 7f421dc
function SiteNode({
  href,
  label,
  sub,
  color = "white",
  desc,
}: {
  href: string;
  label: string;
  sub?: string;
  desc?: string;
  color?: "white" | "purple" | "red" | "amber" | "cyan" | "teal" | "blue";
}) {
  const colorMap: Record<string, string> = {
    white: "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
    purple: "border-purple-500/30 bg-purple-500/5 hover:border-purple-400/50 hover:bg-purple-500/10",
    red: "border-red-500/30 bg-red-500/5 hover:border-red-400/50 hover:bg-red-500/10",
    amber: "border-amber-500/30 bg-amber-500/5 hover:border-amber-400/50 hover:bg-amber-500/10",
    cyan: "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/50 hover:bg-cyan-500/10",
    teal: "border-teal-500/30 bg-teal-500/5 hover:border-teal-400/50 hover:bg-teal-500/10",
    blue: "border-blue-500/30 bg-blue-500/5 hover:border-blue-400/50 hover:bg-blue-500/10",
  };
  const dotMap: Record<string, string> = { white: "bg-white/40", purple: "bg-purple-400", red: "bg-red-400", amber: "bg-amber-400", cyan: "bg-cyan-400", teal: "bg-teal-400", blue: "bg-blue-400" };
  const textMap: Record<string, string> = { white: "text-white/80", purple: "text-purple-300", red: "text-red-300", amber: "text-amber-300", cyan: "text-cyan-300", teal: "text-teal-300", blue: "text-blue-300" };

  const isLinkable = !href.includes("[") && href !== "#";
  const cls = `flex flex-col items-center justify-center border rounded-xl p-3 transition-all text-center group w-full cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${colorMap[color]}`;

  const inner = (
    <>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotMap[color]}`} />
        <span className={`text-xs font-black uppercase tracking-widest leading-tight ${textMap[color]}`}>{label}</span>
      </div>
      {sub && <span className="text-[10px] text-white/30 font-mono mt-0.5">{sub}</span>}
      {desc && <span className="text-[10px] text-white/20 leading-snug mt-1 max-w-[140px]">{desc}</span>}
    </>
  );

  if (isLinkable) {
    return <Link href={href} className={cls}>{inner}</Link>;
  }
  return <div className={cls}>{inner}</div>;
}

function BranchLine({ cols }: { cols: number }) {
  return (
    <div className="flex justify-around items-start py-3 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-white/10" />
      <div className="absolute top-3 bg-white/10 h-px" style={{ left: `calc(100%/${cols}/2)`, right: `calc(100%/${cols}/2)` }} />
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="w-px h-3 bg-white/10 mt-3" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-px h-2 bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export default function VisualSitemapClient({ initialTab = "flows" }: { initialTab?: "directory" | "flows" }) {
  const [activeTab, setActiveTab] = useState<"directory" | "flows">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return siteStructure;

    return siteStructure
      .map((cat) => {
        const matchingRoutes = cat.routes.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.path.toLowerCase().includes(q) ||
            r.sections.some((s) => s.toLowerCase().includes(q)) ||
            r.features.some((f) => f.toLowerCase().includes(q))
        );

        if (matchingRoutes.length > 0) {
          return { ...cat, routes: matchingRoutes };
        }
        return null;
      })
      .filter(Boolean) as typeof siteStructure;
  }, [searchQuery]);

  return (
    <div className="min-h-screen text-white pt-24 pb-20 px-4 sm:px-8 lg:px-[42px] max-w-[1700px] mx-auto space-y-8">

      {/* Top Header Card */}
      <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-black/80 to-cyan-950/40 p-6 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-cyan-600/15 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-purple-400" /> Octopus.do Visual Sitemap & Flow Engine
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300">
              7th Heaven Site Engine
            </h1>
            <p className="text-white/60 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Complete architectural sitemap, route hierarchy, API catalog, tech stack cost matrix, and interactive user flow map.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg"
            >
              <FileCode className="w-4 h-4 text-purple-300" />
              <span>XML Sitemap</span>
              <ExternalLink className="w-3 h-3 text-white/50" />
            </a>
          </div>
        </div>

        {/* TOP LEVEL TAB SWITCHER */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 p-1.5 bg-black/60 rounded-2xl border border-purple-500/30">
            <button
              onClick={() => setActiveTab("flows")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === "flows"
                  ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-300"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Network className="w-4 h-4 text-cyan-300" />
              <span>Interactive User Flow Map (@xyflow/react)</span>
            </button>

            <button
              onClick={() => setActiveTab("directory")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === "directory"
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-300"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Sitemap Tree & Tech Stack (Commit 7f421dc)</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-white/50 font-mono">
            <span>Current Mode: <strong className="text-purple-300 font-bold">{activeTab === "flows" ? "Interactive Screenshot Flow Map" : "Site Matrix & Infrastructure Costs"}</strong></span>
          </div>
        </div>
      </div>

      {/* =========================================================================
         TAB 1: INTERACTIVE USER FLOW MAP (@xyflow/react)
         ========================================================================= */}
      {activeTab === "flows" ? (
        <UserFlowMap />
      ) : (
        /* =========================================================================
           TAB 2: RESTORED SITEMAP TREE & TECH STACK FROM COMMIT 7f421dc
           ========================================================================= */
        <div className="space-y-12">
          
          {/* Visual Architecture Tree */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <GitBranch className="w-5 h-5" /> Visual Architecture Tree
              </h2>
            </div>

            <div className="p-6 rounded-3xl border border-purple-500/20 bg-black/80 backdrop-blur-xl overflow-x-auto space-y-4">
              <div className="flex justify-center">
                <SiteNode href="/" label="Home (7th Heaven Root)" sub="/" color="purple" wide desc="Hero Stream, Shows, Cruise & Audio" />
              </div>

              <BranchLine cols={7} />

              <div className="grid grid-cols-7 gap-3 min-w-[1200px]">
                <SiteNode href="/merch" label="Store & Merch" sub="/merch" color="teal" desc="Headless Shopify Storefront" />
                <SiteNode href="/shows/past" label="Shows Archive" sub="/shows/past" color="blue" desc="Past Show Archives & Booking" />
                <SiteNode href="/cruise" label="Cruise 2026" sub="/cruise" color="cyan" desc="Fan Cruise & Verification" />
                <SiteNode href="/fans" label="Fan Club Portal" sub="/fans" color="purple" desc="Member Hub & Pick Lottery" />
                <SiteNode href="/contact" label="Contact HQ" sub="/contact" color="amber" desc="Band Contact & Press Kit" />
                <SiteNode href="/live" label="Live Broadcasts" sub="/live" color="red" desc="LiveKit WebRTC Multi-Cam" />
                <SiteNode href="/admin" label="Crew & Admin" sub="/admin" color="teal" desc="Band HQ Command Center" />
              </div>
            </div>
          </section>

          {/* Search Bar for Site Matrix */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-black/60 border border-purple-500/30 p-4 rounded-2xl backdrop-blur-xl shadow-xl">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search routes, features, or components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-white/40 text-xs outline-none focus:border-purple-400 transition"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs font-mono text-white/50">Showing {filteredCategories.flatMap(c => c.routes).length} Route Cards</span>
          </div>

          {/* Detailed Route Matrix */}
          <section className="space-y-8">
            {filteredCategories.map((category) => (
              <div key={category.title} className="space-y-4">
                <h3 className="text-lg font-black uppercase tracking-wider text-purple-300 border-b border-purple-500/20 pb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> {category.title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.routes.map((route) => (
                    <div
                      key={route.path}
                      className={`rounded-2xl border p-6 ${route.border} ${route.bg} backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-purple-400/60 transition-all duration-200 group`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-black uppercase tracking-widest ${route.color}`}>
                            {route.name}
                          </span>
                        </div>

                        <code className="text-xs font-mono text-cyan-300 block bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                          {route.path}
                        </code>

                        <div className="space-y-1 pt-2">
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block font-bold">Key Sections</span>
                          <div className="flex flex-wrap gap-1">
                            {route.sections.map((sec) => (
                              <span key={sec} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/5">
                                {sec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <span className="text-[10px] font-mono text-purple-300/60 uppercase tracking-widest block font-bold">Tech Features</span>
                          <div className="flex flex-wrap gap-1">
                            {route.features.map((feat) => (
                              <span key={feat} className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-200 border border-purple-500/20 font-mono">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-end">
                        {!route.path.includes("[") && route.path !== "#" ? (
                          <Link href={route.path} className="text-xs font-extrabold text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
                            <span>Open Route</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                          </Link>
                        ) : (
                          <span className="text-[10px] font-mono text-white/30">Dynamic Route Pattern</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* REST API Endpoints Catalog */}
          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-xl font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Terminal className="w-5 h-5" /> REST API Endpoints Catalog
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {apiEndpoints.map((api) => (
                <div key={api.path} className="p-4 rounded-2xl bg-black/60 border border-amber-500/20 backdrop-blur-md space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                      {api.method}
                    </span>
                    <span className="text-[9px] font-mono text-white/40 uppercase">{api.auth}</span>
                  </div>
                  <code className="text-xs font-mono text-white font-bold block">{api.path}</code>
                  <p className="text-xs text-white/50">{api.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Restored Monthly Cost & Tech Stack Matrix from Commit 7f421dc */}
          <section className="space-y-6 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Server className="w-5 h-5" /> Platform Infrastructure & Cost Matrix (7f421dc)
                </h2>
                <p className="text-xs text-white/50 mt-1">Services powering 7th Heaven web app, hosting, database & live streaming.</p>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right">
                <span className="text-xs text-white/40 uppercase font-mono block font-bold">Estimated Monthly Total</span>
                <span className="text-xl font-black text-emerald-300">~$62–$157 / mo</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {infraServices.map((s) => (
                <div key={s.service} className="p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{s.icon}</span>
                      <h3 className={`font-black text-sm uppercase tracking-wider ${s.color}`}>{s.service}</h3>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-white text-base">{s.cost}</span>
                      <span className="text-[10px] text-white/40 font-mono">{s.unit}</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/60 leading-relaxed">{s.what}</p>

                  <div className="pt-2 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/40">{s.plan}</span>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-purple-300 font-bold hover:underline flex items-center gap-1">
                      <span>Visit</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* Footer Meta */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>7th Heaven Official Website — Complete Sitemap & Flow Engine</span>
        </div>
        <span>Includes full commit 7f421dc sitemap tree & cost matrix</span>
      </div>

    </div>
  );
}
