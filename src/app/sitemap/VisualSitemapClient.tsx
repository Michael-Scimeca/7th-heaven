"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  CheckCircle2,
  FileCode,
  ArrowRight,
  Compass,
  Film,
  Calendar,
  CreditCard,
  X,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  GitBranch,
  LayoutGrid,
  ListTree,
  Network,
  ListFilter,
  UserPlus,
  LogIn,
  Key,
} from "lucide-react";

const UserFlowMap = dynamic(() => import("@/components/UserFlowMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[780px] rounded-3xl border border-purple-500/30 bg-[#050505] flex flex-col items-center justify-center gap-4 text-purple-300 animate-pulse">
      <GitBranch className="w-10 h-10 animate-spin" />
      <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/60">
        Loading Interactive User Flow Graph Engine...
      </span>
    </div>
  ),
});

interface NodeItem {
  id: string;
  code: string;
  path: string;
  type: "Static" | "SSG" | "Dynamic" | "API";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isPublic?: boolean;
  color: string;
  children?: NodeItem[];
}

interface TreeCategory {
  id: string;
  code: string;
  title: string;
  path: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  children: NodeItem[];
}

const HEADER_NAV_DATA: TreeCategory[] = [
  {
    id: "home",
    code: "0.0",
    title: "Home & Auth (/) ",
    path: "/",
    color: "#c084fc", // Purple Accent
    icon: Globe,
    description: "Website root entry, hero video, site navigation header & passwordless sign-in modal.",
    children: [
      { id: "home-signin", code: "0.1", path: "/#login", type: "Static", title: "Sign In / Login Modal", description: "Passwordless 6-digit PIN login modal window.", icon: LogIn, isPublic: true, color: "#c084fc" },
      { id: "home-signup", code: "0.2", path: "/fans/complete-profile", type: "Static", title: "Sign Up & Onboarding", description: "Fan account creation & profile details onboarding.", icon: UserPlus, isPublic: true, color: "#c084fc" },
      { id: "home-verify", code: "0.3", path: "/cruise/verify", type: "Static", title: "PIN Verification Screen", description: "Enter 6-digit email PIN code to authenticate.", icon: Key, isPublic: true, color: "#c084fc" },
    ],
  },
  {
    id: "shows",
    code: "1.0",
    title: "Shows & Concerts",
    path: "/shows/past",
    color: "#a855f7",
    icon: Calendar,
    description: "Live concert schedules, past show archives, venue details & booking requests.",
    children: [
      { id: "shows-past", code: "1.1", path: "/shows/past", type: "Static", title: "Past Shows Archive", description: "Searchable historical show archive and past venue performances.", icon: Globe, isPublic: true, color: "#a855f7" },
      { id: "shows-detail", code: "1.2", path: "/shows/075144a7-588c-4d9a-a8b5-b44bca910b90", type: "SSG", title: "Show Detail View", description: "Individual performance page with venue map, setlists & tickets.", icon: Globe, isPublic: true, color: "#a855f7" },
      { id: "shows-book", code: "1.3", path: "/book", type: "Static", title: "Booking Request", description: "Private party, festival, and venue booking inquiry form.", icon: Calendar, isPublic: true, color: "#a855f7" },
      { id: "shows-book-success", code: "1.3.1", path: "/book/success", type: "Static", title: "Booking Confirmation", description: "Inquiry submission success screen.", icon: CheckCircle2, isPublic: true, color: "#a855f7" },
      { id: "shows-book-cancel", code: "1.3.2", path: "/book/cancel", type: "Static", title: "Booking Canceled", description: "Inquiry cancellation feedback screen.", icon: Globe, isPublic: true, color: "#a855f7" },
      { id: "shows-faq", code: "1.4", path: "/faq", type: "Static", title: "Show FAQ", description: "Frequently asked questions regarding tickets, VIP & doors.", icon: Globe, isPublic: true, color: "#a855f7" },
    ],
  },
  {
    id: "fans",
    code: "2.0",
    title: "Fan Club & Community",
    path: "/fans",
    color: "#ec4899",
    icon: UserCheck,
    description: "Member portal, photo galleries, guitar pick lottery & fan profiles.",
    children: [
      { id: "fans-hub", code: "2.1", path: "/fans", type: "Static", title: "Fan Club Hub", description: "Central fan member dashboard, announcements & VIP perks.", icon: UserCheck, isPublic: true, color: "#ec4899" },
      { id: "fans-profile", code: "2.2", path: "/fans/sample_fan", type: "Dynamic", title: "Member Profile", description: "Public member profile showing badges & favorite tracks.", icon: UserCheck, isPublic: true, color: "#ec4899" },
      { id: "fans-complete", code: "2.3", path: "/fans/complete-profile", type: "Static", title: "Complete Profile", description: "Fan account onboarding and profile details setup.", icon: UserCheck, color: "#ec4899" },
      { id: "fans-photowall", code: "2.4", path: "/fan-photo-wall", type: "Static", title: "Fan Photo Wall", description: "Community concert photo stream & fan uploads.", icon: Film, isPublic: true, color: "#ec4899" },
      { id: "fans-picks", code: "2.5", path: "/picks", type: "Static", title: "Guitar Pick Lottery", description: "Collect digital guitar picks at live shows for prizes.", icon: Sparkles, isPublic: true, color: "#ec4899" },
      { id: "fans-planner", code: "2.6", path: "/planner", type: "Static", title: "Show Planner Portal", description: "Private event planner coordinator dashboard.", icon: UserCheck, color: "#ec4899" },
      { id: "fans-planner-verify", code: "2.6.1", path: "/planner/verify", type: "Static", title: "Planner Verify PIN", description: "Security PIN check for show planner access.", icon: Lock, color: "#ec4899" },
    ],
  },
  {
    id: "merch",
    code: "3.0",
    title: "Store & Merchandise",
    path: "/merch",
    color: "#f59e0b",
    icon: ShoppingBag,
    description: "Official band t-shirts, CDs, accessories & QR instant checkout.",
    children: [
      { id: "merch-shop", code: "3.1", path: "/merch", type: "Static", title: "Official Merch Store", description: "Browse and buy official 7th Heaven gear and albums.", icon: ShoppingBag, isPublic: true, color: "#f59e0b" },
      { id: "merch-qr", code: "3.2", path: "/qr/merch", type: "Dynamic", title: "QR Merch Scanner", description: "Fast mobile checkout at live venue merchandise tables.", icon: ShoppingBag, isPublic: true, color: "#f59e0b" },
      { id: "merch-paytest", code: "3.3", path: "/payment-test", type: "Static", title: "Payment Sandbox", description: "EPX payment gateway test environment.", icon: CreditCard, color: "#f59e0b" },
      { id: "merch-returns", code: "3.4", path: "/returns", type: "Static", title: "Return Policy", description: "Merchandise return & refund policy information.", icon: Globe, isPublic: true, color: "#f59e0b" },
    ],
  },
  {
    id: "live",
    code: "4.0",
    title: "Live Stream Hub",
    path: "/live",
    color: "#ef4444",
    icon: Radio,
    description: "Multi-angle concert streams, member cams & live chat.",
    children: [
      { id: "live-hub", code: "4.1", path: "/live", type: "Static", title: "Main Broadcast Room", description: "Interactive live concert stream with stage chat.", icon: Radio, isPublic: true, color: "#ef4444" },
      { id: "live-michael", code: "4.2", path: "/live/live_michael", type: "Static", title: "Michael Cam", description: "Dedicated Michael Scimeca stage angle.", icon: Radio, color: "#ef4444" },
      { id: "live-ryan", code: "4.3", path: "/live/live_ryan", type: "Static", title: "Ryan Cam", description: "Dedicated Ryan Cook guitar angle.", icon: Radio, color: "#ef4444" },
      { id: "live-sammy", code: "4.4", path: "/live/live_sammy", type: "Static", title: "Sammy Cam", description: "Dedicated Sammy drum kit angle.", icon: Radio, color: "#ef4444" },
      { id: "live-tony", code: "4.5", path: "/live/live_tony", type: "Static", title: "Tony Cam", description: "Dedicated Tony bass angle.", icon: Radio, color: "#ef4444" },
    ],
  },
  {
    id: "cruise",
    code: "5.0",
    title: "Caribbean Cruise 2026",
    path: "/cruise",
    color: "#06b6d4",
    icon: Sparkles,
    description: "Official 7th Heaven Fan Cruise booking, itinerary & stateroom hub.",
    children: [
      { id: "cruise-home", code: "5.1", path: "/cruise", type: "Static", title: "Cruise Main Landing", description: "Cruise details, lineup, ship amenities & booking info.", icon: Sparkles, isPublic: true, color: "#06b6d4" },
      { id: "cruise-dash", code: "5.2", path: "/cruise/dashboard", type: "Static", title: "Cruiser Dashboard", description: "Stateroom portal, itinerary calendar & party packages.", icon: Sparkles, color: "#06b6d4" },
      { id: "cruise-prev", code: "5.3", path: "/cruise/preview", type: "Static", title: "Cruise Ship Tour", description: "Virtual tour of ship decks and VIP venues.", icon: Sparkles, isPublic: true, color: "#06b6d4" },
      { id: "cruise-verify", code: "5.4", path: "/cruise/verify", type: "Static", title: "Verify Cruise PIN", description: "Cruiser security PIN verification screen.", icon: Lock, color: "#06b6d4" },
      { id: "cruise-cancel", code: "5.5", path: "/cruise/cancel", type: "Static", title: "Cruise Cancel", description: "Booking cancellation request procedure.", icon: Sparkles, color: "#06b6d4" },
    ],
  },
  {
    id: "admin",
    code: "6.0",
    title: "Band HQ & Admin",
    path: "/admin",
    color: "#10b981",
    icon: ShieldCheck,
    description: "Band management, road crew dashboards & contract repositories.",
    children: [
      { id: "admin-main", code: "6.1", path: "/admin", type: "Static", title: "Admin Portal", description: "Band leadership admin controls & site options.", icon: Lock, color: "#10b981" },
      { id: "admin-email-map", code: "6.1.1", path: "/admin/email-map", type: "Static", title: "Email Routing Matrix", description: "Venue & booking contact email routing map.", icon: Lock, color: "#10b981" },
      { id: "admin-emails", code: "6.1.2", path: "/admin/emails", type: "Static", title: "Newsletters", description: "Fan newsletter broadcasting studio.", icon: Lock, color: "#10b981" },
      { id: "admin-legal", code: "6.1.3", path: "/admin/legal", type: "Static", title: "Legal Contracts", description: "Venue agreements and stage technical riders.", icon: Lock, color: "#10b981" },
      { id: "crew-main", code: "6.2", path: "/crew", type: "Static", title: "Crew HQ", description: "Road crew schedule & gear checklists.", icon: ShieldCheck, color: "#10b981" },
      { id: "crew-michael", code: "6.2.1", path: "/crew-michael", type: "Static", title: "Michael Crew Setup", description: "Vocal mic & channel monitoring notes.", icon: ShieldCheck, color: "#10b981" },
      { id: "crew-ryan", code: "6.2.2", path: "/crew-ryan", type: "Static", title: "Ryan Rig Setup", description: "Guitar wireless & amp setup map.", icon: ShieldCheck, color: "#10b981" },
      { id: "crew-sam", code: "6.2.3", path: "/crew-sam", type: "Static", title: "Sam Drum Setup", description: "Drum kit mic map & monitor mix.", icon: ShieldCheck, color: "#10b981" },
      { id: "crew-tony", code: "6.2.4", path: "/crew-tony", type: "Static", title: "Tony Bass Setup", description: "Bass wireless & monitor mix.", icon: ShieldCheck, color: "#10b981" },
      { id: "crew-abbie", code: "6.2.5", path: "/crew-abbie", type: "Static", title: "Abbie Stage Ops", description: "Production & stage management notes.", icon: ShieldCheck, color: "#10b981" },
      { id: "crew-verify", code: "6.2.6", path: "/crew/verify", type: "Static", title: "Crew PIN Check", description: "Road crew security verification PIN.", icon: ShieldCheck, color: "#10b981" },
    ],
  },
  {
    id: "labs",
    code: "7.0",
    title: "UI Design System & Legal",
    path: "/style-guide",
    color: "#6366f1",
    icon: Layers,
    description: "Component library, media press kit, animation labs & legal terms.",
    children: [
      { id: "labs-style", code: "7.1", path: "/style-guide", type: "Static", title: "UI Style Guide & Studio", description: "Unified design tokens, fluid typography studio & swatches.", icon: Layers, isPublic: true, color: "#6366f1" },
      { id: "labs-media", code: "7.2", path: "/media", type: "Static", title: "Media & Press Kit", description: "Promotional photos, logos & stage riders.", icon: Film, isPublic: true, color: "#6366f1" },
      { id: "labs-contact", code: "7.3", path: "/contact", type: "Static", title: "Contact Us", description: "General contact & band management email.", icon: Globe, isPublic: true, color: "#6366f1" },
      { id: "labs-features", code: "7.4", path: "/features", type: "Static", title: "Band Features", description: "Career milestones, Billboard records & press.", icon: Globe, isPublic: true, color: "#6366f1" },
      { id: "labs-privacy", code: "7.5", path: "/privacy", type: "Static", title: "Privacy Policy", description: "Official data privacy terms.", icon: Globe, isPublic: true, color: "#6366f1" },
      { id: "labs-terms", code: "7.6", path: "/terms", type: "Static", title: "Terms of Service", description: "Website terms and conditions.", icon: Globe, isPublic: true, color: "#6366f1" },
      { id: "labs-hambuger", code: "7.7", path: "/hambuger", type: "Static", title: "Hamburger Menu Lab", description: "Menu animation test lab.", icon: Layers, color: "#6366f1" },
      { id: "labs-pagetransition", code: "7.8", path: "/pagetransition", type: "Static", title: "Page Transition Lab", description: "Curtain slide animation lab.", icon: Layers, color: "#6366f1" },
      { id: "labs-slideup", code: "7.9", path: "/slideup", type: "Static", title: "Slideup Stack Lab", description: "Scroll section stacking animation lab.", icon: Layers, color: "#6366f1" },
      { id: "labs-textcolor", code: "7.10", path: "/textcolor", type: "Static", title: "Gradient Text Lab", description: "Interactive gradient text generator.", icon: Layers, color: "#6366f1" },
      { id: "labs-video", code: "7.11", path: "/video", type: "Static", title: "Video Showcase Lab", description: "Custom YouTube video modal player lab.", icon: Film, color: "#6366f1" },
    ],
  },
  {
    id: "api",
    code: "8.0",
    title: "REST API Endpoints",
    path: "/api/tour",
    color: "#3b82f6",
    icon: Terminal,
    description: "JSON data feeds for tour dates, system health & playlists.",
    children: [
      { id: "api-tour", code: "8.1", path: "/api/tour", type: "API", title: "GET /api/tour", description: "Public REST endpoint returning upcoming show dates JSON.", icon: Terminal, color: "#3b82f6" },
      { id: "api-health", code: "8.2", path: "/api/health", type: "API", title: "GET /api/health", description: "System uptime and server health diagnostic API.", icon: Terminal, color: "#3b82f6" },
      { id: "api-announcement", code: "8.3", path: "/api/announcement", type: "API", title: "GET/POST /api/announcement", description: "Banner alerts & show update notifications feed.", icon: Terminal, color: "#3b82f6" },
      { id: "api-audio", code: "8.4", path: "/api/audio", type: "API", title: "GET /api/audio", description: "Music player audio tracklist JSON feed.", icon: Terminal, color: "#3b82f6" },
    ],
  },
];

export default function VisualSitemapClient({ initialTab = "directory" }: { initialTab?: "directory" | "flows" }) {
  const [activeTab, setActiveTab] = useState<"directory" | "flows">(initialTab);
  const [viewMode, setViewMode] = useState<"tree" | "compact" | "grid">("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const collapseAll = () => {
    const nextState: Record<string, boolean> = {};
    HEADER_NAV_DATA.forEach((c) => (nextState[c.id] = true));
    setCollapsedCategories(nextState);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  // Compute total statistics
  const stats = useMemo(() => {
    let totalNodes = 1;
    let publicCount = 1;
    let dynamicCount = 0;
    let apiCount = 0;

    HEADER_NAV_DATA.forEach((cat) => {
      cat.children.forEach((child) => {
        totalNodes++;
        if (child.isPublic) publicCount++;
        if (child.type === "Dynamic" || child.type === "SSG") dynamicCount++;
        if (child.type === "API") apiCount++;
      });
    });

    return { total: totalNodes, public: publicCount, dynamic: dynamicCount, api: apiCount };
  }, []);

  // Filtered Tree based on search query
  const filteredTree = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return HEADER_NAV_DATA;

    return HEADER_NAV_DATA.map((cat) => {
      const catMatches =
        cat.title.toLowerCase().includes(q) ||
        cat.path.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q);

      const matchingChildren = cat.children.filter(
        (child) =>
          child.title.toLowerCase().includes(q) ||
          child.path.toLowerCase().includes(q) ||
          child.description.toLowerCase().includes(q) ||
          child.type.toLowerCase().includes(q)
      );

      if (catMatches || matchingChildren.length > 0) {
        return {
          ...cat,
          children: catMatches ? cat.children : matchingChildren,
        };
      }
      return null;
    }).filter(Boolean) as TreeCategory[];
  }, [searchQuery]);

  return (
    <div className="min-h-screen text-white pt-24 pb-20 px-4 sm:px-8 lg:px-[42px] max-w-[1600px] mx-auto space-y-8">

      {/* Top Header Card */}
      <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/40 via-black/60 to-black/80 p-6 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-xl">
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
            <p className="text-white/60 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Interactive architectural map, route hierarchy & user flow diagrams modeled after Octopus.do. Inspect page trees, authentication journeys, PIN emails, and API endpoints in real-time.
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

        {/* TOP LEVEL MODE SWITCHER: SITEMAP DIRECTORY vs USER FLOW MAP */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 p-1.5 bg-black/60 rounded-2xl border border-purple-500/30">
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === "directory"
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-300"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Header Nav Sitemap Tree</span>
            </button>

            <button
              onClick={() => setActiveTab("flows")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === "flows"
                  ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-300"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Network className="w-4 h-4 text-cyan-300" />
              <span>User Flow Journey Map (@xyflow/react)</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-white/50">
            <span>Mode: <strong className="text-purple-300 font-mono">{activeTab === "directory" ? "Header Nav Sitemap Tree" : "Interactive React Flow Engine"}</strong></span>
          </div>
        </div>
      </div>

      {/* =========================================================================
         TAB 2: USER FLOW JOURNEY MAP CANVAS (@xyflow/react)
         ========================================================================= */}
      {activeTab === "flows" ? (
        <UserFlowMap />
      ) : (
        <>
          {/* =========================================================================
             TAB 1: OCTOPUS.DO DIRECTORY TREE (FIRST ROW = HEADER NAV CATEGORIES)
             ========================================================================= */}
          {/* Octopus.do Toolbar & View Switcher */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-black/60 border border-purple-500/30 p-3 rounded-2xl backdrop-blur-xl shadow-xl">
            
            {/* Left: View Mode Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-white/[0.05] rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode("tree")}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                  viewMode === "tree"
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Header Nav Tree Diagram</span>
              </button>

              <button
                onClick={() => setViewMode("compact")}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                  viewMode === "compact"
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>Compact Hierarchy</span>
              </button>

              <button
                onClick={() => setViewMode("grid")}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                  viewMode === "grid"
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Card Grid</span>
              </button>
            </div>

            {/* Center: Search Box */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search sitemap nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-white/40 text-xs outline-none focus:border-purple-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right: Expand/Collapse & Zoom Controls */}
            <div className="flex items-center gap-2">
              {viewMode === "tree" && (
                <div className="hidden lg:flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-white/80 px-2 font-bold">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                    title="Reset Zoom"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={expandAll}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold text-[11px] uppercase tracking-wider transition"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold text-[11px] uppercase tracking-wider transition"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: VISUAL TREE DIAGRAM (FIRST ROW IS ALL HEADER NAV ITEMS) */}
          {viewMode === "tree" && (
            <div className="overflow-x-auto pb-12 scrollbar-thin scrollbar-thumb-purple-500/20">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
                className="transition-transform duration-200 min-w-[1400px] space-y-12"
              >
                {/* FIRST ROW: HEADER NAV CATEGORIES DIRECTLY AT THE TOP LEVEL */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 relative items-start">
                  
                  {filteredTree.map((cat) => {
                    const CatIcon = cat.icon;
                    const isCollapsed = collapsedCategories[cat.id];

                    return (
                      <div key={cat.id} className="relative flex flex-col space-y-4">
                        
                        {/* FIRST ROW NODE: Header Navigation Category Card */}
                        <div
                          style={{ borderColor: `${cat.color}60` }}
                          className="relative rounded-2xl border bg-black/90 p-4 shadow-xl backdrop-blur-md space-y-2 z-10 transition-all hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:-translate-y-0.5"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                            <span
                              style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                              className="px-2 py-0.5 rounded font-mono text-[10px] font-bold"
                            >
                              HEADER NAV {cat.code}
                            </span>

                            <button
                              onClick={() => toggleCategoryCollapse(cat.id)}
                              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/70 font-mono text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <span>{cat.children.length} Sub-Pages</span>
                              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div
                              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                            >
                              <CatIcon className="w-4 h-4" />
                            </div>
                            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                              {cat.title}
                            </h3>
                          </div>

                          <p className="text-[11px] text-white/50 leading-relaxed">
                            {cat.description}
                          </p>
                        </div>

                        {/* Sub-Tree Branch Connecting Stem */}
                        {!isCollapsed && cat.children.length > 0 && (
                          <div className="pl-6 space-y-3 relative border-l-2 border-dashed border-purple-500/30 ml-4 pt-1">
                            {cat.children.map((child) => {
                              const ChildIcon = child.icon;

                              return (
                                <div
                                  key={child.id}
                                  className="group relative flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-purple-500/40 p-3 transition-all duration-200"
                                >
                                  <div className="absolute -left-[25px] top-4 w-5 h-0.5 bg-purple-500/30 group-hover:bg-purple-400 transition" />

                                  <div
                                    style={{ backgroundColor: `${child.color}15`, color: child.color }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/10 mt-0.5"
                                  >
                                    <ChildIcon className="w-3.5 h-3.5" />
                                  </div>

                                  <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-mono text-[9px] text-white/40">{child.code}</span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                                          child.type === "API"
                                            ? "bg-amber-500/20 text-amber-300"
                                            : child.type === "Dynamic"
                                            ? "bg-cyan-500/20 text-cyan-300"
                                            : child.type === "SSG"
                                            ? "bg-emerald-500/20 text-emerald-300"
                                            : "bg-white/10 text-white/60"
                                        }`}
                                      >
                                        {child.type}
                                      </span>
                                    </div>

                                    <h4 className="font-bold text-xs text-white group-hover:text-purple-300 transition truncate">
                                      {child.title}
                                    </h4>

                                    <code className="text-[10px] font-mono text-cyan-400/80 block truncate">
                                      {child.path}
                                    </code>

                                    <p className="text-[10px] text-white/50 line-clamp-2 leading-tight">
                                      {child.description}
                                    </p>

                                    <div className="pt-1 flex items-center justify-between">
                                      <span className="text-[8px] font-mono text-white/30">
                                        {child.isPublic ? "PUBLIC" : "MEMBER"}
                                      </span>
                                      {child.type === "API" ? (
                                        <a
                                          href={child.path}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[10px] font-extrabold text-amber-400 hover:underline flex items-center gap-1"
                                        >
                                          <span>JSON</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      ) : (
                                        <Link
                                          href={child.path}
                                          className="text-[10px] font-extrabold text-purple-400 hover:underline flex items-center gap-1"
                                        >
                                          <span>Open</span>
                                          <ArrowRight className="w-2.5 h-2.5" />
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    );
                  })}

                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: COMPACT HIERARCHY TREE LIST */}
          {viewMode === "compact" && (
            <div className="space-y-4">
              {filteredTree.map((cat) => {
                const CatIcon = cat.icon;
                const isCollapsed = collapsedCategories[cat.id];

                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-white/10 bg-black/60 overflow-hidden shadow-lg backdrop-blur-md"
                  >
                    <button
                      onClick={() => toggleCategoryCollapse(cat.id)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.05] transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                        >
                          <CatIcon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white/40">{cat.code}</span>
                            <h3 className="font-black text-sm text-white uppercase tracking-wider">
                              {cat.title}
                            </h3>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">{cat.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/70 font-mono text-xs font-bold">
                          {cat.children.length} Sub-Pages
                        </span>
                        {isCollapsed ? <ChevronRight className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                      </div>
                    </button>

                    {!isCollapsed && (
                      <div className="p-4 border-t border-white/10 bg-black/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cat.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <div
                              key={child.id}
                              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-purple-500/40 transition"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  style={{ backgroundColor: `${child.color}20`, color: child.color }}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                                >
                                  <ChildIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-white block truncate">{child.title}</span>
                                  <code className="text-[10px] font-mono text-cyan-400 block truncate">{child.path}</code>
                                </div>
                              </div>

                              {child.type === "API" ? (
                                <a
                                  href={child.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider transition shrink-0"
                                >
                                  JSON
                                </a>
                              ) : (
                                <Link
                                  href={child.path}
                                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-extrabold text-[10px] uppercase tracking-wider transition shrink-0"
                                >
                                  Visit
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 3: CARD GRID DIRECTORY */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTree.flatMap((cat) =>
                cat.children.map((child) => {
                  const ChildIcon = child.icon;
                  return (
                    <div
                      key={child.id}
                      className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-500/40 p-6 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                            {cat.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest border ${
                              child.type === "API"
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                : child.type === "Dynamic"
                                ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                                : child.type === "SSG"
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                : "bg-white/10 text-white/70 border-white/20"
                            }`}
                          >
                            {child.type}
                          </span>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition duration-300">
                            <ChildIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-white group-hover:text-purple-300 transition">
                              {child.title}
                            </h3>
                            <code className="text-[11px] font-mono text-cyan-400/80 group-hover:text-cyan-300 transition block mt-0.5">
                              {child.path}
                            </code>
                          </div>
                        </div>

                        <p className="text-xs text-white/60 leading-relaxed">
                          {child.description}
                        </p>
                      </div>

                      <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                          {child.isPublic ? "● Public Access" : "🔒 Member / Protected"}
                        </span>

                        {child.type === "API" ? (
                          <a
                            href={child.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 hover:text-amber-300 transition"
                          >
                            <span>Fetch JSON</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <Link
                            href={child.path}
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-400 group-hover:text-purple-300 transition"
                          >
                            <span>Visit Page</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Footer Meta Bar */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>7th Heaven Official Website — Header Nav Sitemap & Flow Engine</span>
        </div>
        <span>Modeled after Octopus.do visual sitemap & graph architecture</span>
      </div>

    </div>
  );
}
