"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code,
  Globe,
  Lock,
  Radio,
  ShoppingBag,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Terminal,
  ShieldCheck,
  UserCheck,
  Film
} from "lucide-react";

interface RouteItem {
  path: string;
  type: "Static" | "SSG" | "Dynamic" | "API";
  label: string;
  category: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const ALL_ROUTES: RouteItem[] = [
  // ── Main Pages ──
  { path: "/", type: "Static", label: "Home Page", category: "Public Pages", icon: Globe },
  { path: "/shows/past", type: "Static", label: "Past Shows Archive", category: "Public Pages", icon: Globe },
  { path: "/shows/075144a7-588c-4d9a-a8b5-b44bca910b90", type: "SSG", label: "Show Detail (Sample)", category: "Public Pages", icon: Globe },
  { path: "/contact", type: "Static", label: "Contact & Booking", category: "Public Pages", icon: Globe },
  { path: "/book", type: "Static", label: "Booking Request Form", category: "Public Pages", icon: Globe },
  { path: "/book/cancel", type: "Static", label: "Booking Canceled", category: "Public Pages", icon: Globe },
  { path: "/book/success", type: "Static", label: "Booking Success", category: "Public Pages", icon: Globe },
  { path: "/faq", type: "Static", label: "Frequently Asked Questions", category: "Public Pages", icon: Globe },
  { path: "/features", type: "Static", label: "Band Features", category: "Public Pages", icon: Globe },
  { path: "/media", type: "Static", label: "Media & Press Kit", category: "Public Pages", icon: Globe },
  { path: "/privacy", type: "Static", label: "Privacy Policy", category: "Public Pages", icon: Globe },
  { path: "/terms", type: "Static", label: "Terms of Service", category: "Public Pages", icon: Globe },
  { path: "/returns", type: "Static", label: "Return Policy", category: "Public Pages", icon: Globe },

  // ── Store & Merchandise ──
  { path: "/merch", type: "Static", label: "Official Merch", category: "Store & Merch", icon: ShoppingBag },
  { path: "/qr/merch", type: "Dynamic", label: "QR Code Merch Scanner", category: "Store & Merch", icon: ShoppingBag },

  // ── Fan Portal ──
  { path: "/fans", type: "Static", label: "Fan Club Hub", category: "Fan Portal", icon: UserCheck },
  { path: "/fans/complete-profile", type: "Static", label: "Complete Fan Profile", category: "Fan Portal", icon: UserCheck },
  { path: "/fans/sample_fan", type: "Dynamic", label: "Fan Member Profile", category: "Fan Portal", icon: UserCheck },
  { path: "/fan-photo-wall", type: "Static", label: "Fan Photo Wall", category: "Fan Portal", icon: UserCheck },
  { path: "/picks", type: "Static", label: "Pick Collector Lottery", category: "Fan Portal", icon: Sparkles },
  { path: "/planner", type: "Static", label: "Show Planner Portal", category: "Fan Portal", icon: UserCheck },
  { path: "/planner/verify", type: "Static", label: "Planner Verification", category: "Fan Portal", icon: UserCheck },

  // ── Live Stream & Broadcast ──
  { path: "/live", type: "Static", label: "Live Stream Hub", category: "Live Stream", icon: Radio },
  { path: "/live/live_michael", type: "Static", label: "Michael Live Stream", category: "Live Stream", icon: Radio },
  { path: "/live/live_ryan", type: "Static", label: "Ryan Live Stream", category: "Live Stream", icon: Radio },
  { path: "/live/live_sammy", type: "Static", label: "Sammy Live Stream", category: "Live Stream", icon: Radio },
  { path: "/live/live_tony", type: "Static", label: "Tony Live Stream", category: "Live Stream", icon: Radio },

  // ── Cruise Portal ──
  { path: "/cruise", type: "Static", label: "Fan Cruise 2026", category: "Cruise Portal", icon: Sparkles },
  { path: "/cruise/dashboard", type: "Static", label: "Cruise Dashboard", category: "Cruise Portal", icon: Sparkles },
  { path: "/cruise/preview", type: "Static", label: "Cruise Preview", category: "Cruise Portal", icon: Sparkles },
  { path: "/cruise/verify", type: "Static", label: "Cruise Verify PIN", category: "Cruise Portal", icon: Sparkles },
  { path: "/cruise/cancel", type: "Static", label: "Cruise Booking Cancel", category: "Cruise Portal", icon: Sparkles },

  // ── Crew & Admin Dashboards ──
  { path: "/admin", type: "Static", label: "Admin Main Portal", category: "Admin & Crew", icon: Lock },
  { path: "/admin/email-map", type: "Static", label: "Admin Email Routing Map", category: "Admin & Crew", icon: Lock },
  { path: "/admin/emails", type: "Static", label: "Admin Newsletter & Broadcasts", category: "Admin & Crew", icon: Lock },
  { path: "/admin/legal", type: "Static", label: "Admin Legal Contracts", category: "Admin & Crew", icon: Lock },
  { path: "/crew", type: "Static", label: "Crew HQ", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew-michael", type: "Static", label: "Michael Crew Dashboard", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew-ryan", type: "Static", label: "Ryan Crew Dashboard", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew-sam", type: "Static", label: "Sam Crew Dashboard", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew-tony", type: "Static", label: "Tony Crew Dashboard", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew-abbie", type: "Static", label: "Abbie Crew Dashboard", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew/verify", type: "Static", label: "Crew Verification", category: "Admin & Crew", icon: ShieldCheck },

  // ── UI Demos & Interactive Lab ──
  { path: "/style-guide", type: "Static", label: "Full UI Style Guide & Fluid Studio", category: "UI Demos & Labs", icon: Layers },
  { path: "/hambuger", type: "Static", label: "Hamburger Menu Animation", category: "UI Demos & Labs", icon: Layers },
  { path: "/textcolor", type: "Static", label: "Text Color Gradient Studio", category: "UI Demos & Labs", icon: Layers },
  { path: "/video", type: "Static", label: "Video Showcase Studio", category: "UI Demos & Labs", icon: Film },
  { path: "/payment-test", type: "Static", label: "Payment Test Shop (EPX Mock)", category: "UI Demos & Labs", icon: ShoppingBag },

  // ── API Endpoints ──
  { path: "/api/tour", type: "API", label: "GET Tour Dates JSON", category: "API Routes", icon: Terminal },
  { path: "/api/health", type: "API", label: "GET Health Check", category: "API Routes", icon: Terminal },
  { path: "/api/announcement", type: "API", label: "GET/POST Announcement Banner", category: "API Routes", icon: Terminal },
  { path: "/api/audio", type: "API", label: "GET Audio Playlist Tracks", category: "API Routes", icon: Terminal },
  { path: "/api/booking", type: "API", label: "POST Booking Submission", category: "API Routes", icon: Terminal },
  { path: "/api/booking/availability", type: "API", label: "GET Booking Availability Calendar", category: "API Routes", icon: Terminal },
  { path: "/api/calendar/ics", type: "API", label: "GET Tour Calendar ICS Feed", category: "API Routes", icon: Terminal },
  { path: "/api/cruise/signup", type: "API", label: "POST Cruise Fan Signup", category: "API Routes", icon: Terminal },
  { path: "/api/cruise/count", type: "API", label: "GET Cruise Booking Counter", category: "API Routes", icon: Terminal },
  { path: "/api/sms/live-alert", type: "API", label: "POST Twilio Live Alert SMS", category: "API Routes", icon: Terminal },
  { path: "/api/newsletter/subscribe", type: "API", label: "POST Newsletter Subscription", category: "API Routes", icon: Terminal },
  { path: "/api/admin/shows", type: "API", label: "GET/POST Admin Show Management", category: "API Routes", icon: Terminal },
  { path: "/api/admin/broadcast", type: "API", label: "POST Broadcast Email Alert", category: "API Routes", icon: Terminal },
  { path: "/api/admin/referral-leaderboard", type: "API", label: "GET Fan Referral Ranks", category: "API Routes", icon: Terminal },
  { path: "/api/livekit", type: "API", label: "GET LiveKit Stream Token", category: "API Routes", icon: Terminal },
  { path: "/api/close-all-streams", type: "API", label: "POST Emergency Stream Shutdown", category: "API Routes", icon: Terminal },
];

const CATEGORIES = ["All", "Public Pages", "Store & Merch", "Fan Portal", "Live Stream", "Cruise Portal", "Admin & Crew", "UI Demos & Labs", "API Routes"];

export default function DevRouteList() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredRoutes = ALL_ROUTES.filter((r) => {
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    const matchesSearch =
      r.path.toLowerCase().includes(search.toLowerCase()) ||
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="w-full mt-16 mb-12 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto rounded-3xl bg-[rgba(15,15,22,0.85)] border border-purple-500/20 backdrop-blur-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">

        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg  bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black uppercase tracking-wide text-white">
                  Developer Route Directory
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {ALL_ROUTES.length} Routes Pre-rendered
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Explore every pre-built static page, SSG route, dashboard, and backend API endpoint.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2.5  rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          >
            <span>{isOpen ? "Collapse Directory" : "Expand All Routes"}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Main Section */}
        {isOpen && (
          <div className="pt-6 space-y-6 animate-fadeIn">

            {/* Search & Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeCategory === cat
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                      : "bg-[#e1e6ff29]   hover:bg-white/10 text-white/60 hover:text-white"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search routes or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10  rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60 font-mono"
                />
              </div>
            </div>

            {/* Route Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredRoutes.map((item) => {
                const IconComponent = item.icon || Globe;
                const isApi = item.type === "API";

                return (
                  <div
                    key={item.path}
                    className="group relative p-3.5 rounded-lg  bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/80">
                            {item.category}
                          </span>
                        </div>

                        {/* Type Badge */}
                        <span
                          className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${item.type === "Static"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : item.type === "SSG"
                              ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                              : item.type === "Dynamic"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white group-hover:text-purple-200 transition-colors line-clamp-1">
                        {item.label}
                      </h4>
                      <p className="text-[11px] font-mono text-white/50 mt-1 truncate">
                        {item.path}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      {isApi ? (
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Test API Endpoint <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <Link
                          href={item.path}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Open Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredRoutes.length === 0 && (
              <div className="py-12 text-center text-white/40 text-xs font-mono">
                No matching routes found for "{search}".
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
