"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  Globe,
  Lock,
  Radio,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Film,
  Layers,
  Terminal,
  Bell
} from "lucide-react";

interface RouteItem {
  path: string;
  type: "Static" | "SSG" | "Dynamic" | "API";
  label: string;
  category: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const ALL_SITE_ROUTES: RouteItem[] = [
  // ── Main Pages ──
  { path: "/", type: "Static", label: "Home Page", category: "Public Pages", icon: Globe },
  { path: "/shows/past", type: "Static", label: "Past Shows Archive", category: "Public Pages", icon: Globe },
  { path: "/contact", type: "Static", label: "Contact & Booking", category: "Public Pages", icon: Globe },
  { path: "/book", type: "Static", label: "Booking Request Form", category: "Public Pages", icon: Globe },
  { path: "/book/cancel", type: "Static", label: "Booking Canceled", category: "Public Pages", icon: Globe },
  { path: "/book/success", type: "Static", label: "Booking Success", category: "Public Pages", icon: Globe },
  { path: "/faq", type: "Static", label: "FAQ & Support", category: "Public Pages", icon: Globe },
  { path: "/features", type: "Static", label: "Band Features", category: "Public Pages", icon: Globe },
  { path: "/media", type: "Static", label: "Media & Press Kit", category: "Public Pages", icon: Globe },
  { path: "/privacy", type: "Static", label: "Privacy Policy", category: "Public Pages", icon: Globe },
  { path: "/terms", type: "Static", label: "Terms of Service", category: "Public Pages", icon: Globe },
  { path: "/returns", type: "Static", label: "Return Policy", category: "Public Pages", icon: Globe },
  { path: "/notifications", type: "Static", label: "🔔 Push Notifications Tester", category: "Public Pages", icon: Bell },

  // ── Store & Merch ──
  { path: "/merch", type: "Static", label: "Official Merch Catalog", category: "Store & Merch", icon: ShoppingBag },
  { path: "/qr/merch", type: "Dynamic", label: "QR Merch Scanner", category: "Store & Merch", icon: ShoppingBag },

  // ── Fan Portal ──
  { path: "/fans", type: "Static", label: "Fan Club Hub", category: "Fan Portal", icon: UserCheck },
  { path: "/fans/complete-profile", type: "Static", label: "Complete Fan Profile", category: "Fan Portal", icon: UserCheck },
  { path: "/fans/sample_fan", type: "Dynamic", label: "Fan Profile View", category: "Fan Portal", icon: UserCheck },
  { path: "/fan-photo-wall", type: "Static", label: "Fan Photo Wall", category: "Fan Portal", icon: UserCheck },
  { path: "/picks", type: "Static", label: "Guitar Pick Collector", category: "Fan Portal", icon: Sparkles },
  { path: "/planner", type: "Static", label: "Show Planner Portal", category: "Fan Portal", icon: UserCheck },
  { path: "/planner/verify", type: "Static", label: "Planner Verification", category: "Fan Portal", icon: UserCheck },

  // ── Live Stream ──
  { path: "/live", type: "Static", label: "Live Stream Hub", category: "Live Stream", icon: Radio },
  { path: "/live/live_michael", type: "Static", label: "Michael Stream Room", category: "Live Stream", icon: Radio },
  { path: "/live/live_ryan", type: "Static", label: "Ryan Stream Room", category: "Live Stream", icon: Radio },
  { path: "/live/live_sammy", type: "Static", label: "Sammy Stream Room", category: "Live Stream", icon: Radio },
  { path: "/live/live_tony", type: "Static", label: "Tony Stream Room", category: "Live Stream", icon: Radio },

  // ── Cruise Portal ──
  { path: "/cruise", type: "Static", label: "Fan Cruise 2026", category: "Cruise Portal", icon: Sparkles },
  { path: "/cruise/dashboard", type: "Static", label: "Cruise Dashboard", category: "Cruise Portal", icon: Sparkles },
  { path: "/cruise/preview", type: "Static", label: "Cruise Preview", category: "Cruise Portal", icon: Sparkles },
  { path: "/cruise/verify", type: "Static", label: "Cruise Verify PIN", category: "Cruise Portal", icon: Sparkles },
  { path: "/cruise/cancel", type: "Static", label: "Cruise Cancel Page", category: "Cruise Portal", icon: Sparkles },

  // ── Admin & Crew ──
  { path: "/admin", type: "Static", label: "Admin Main Portal", category: "Admin & Crew", icon: Lock },
  { path: "/admin/email-map", type: "Static", label: "Admin Email Routing Map", category: "Admin & Crew", icon: Lock },
  { path: "/admin/emails", type: "Static", label: "Admin Broadcast Emails", category: "Admin & Crew", icon: Lock },
  { path: "/admin/legal", type: "Static", label: "Admin Legal Contracts", category: "Admin & Crew", icon: Lock },
  { path: "/crew", type: "Static", label: "Crew HQ", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew-michael", type: "Static", label: "Michael Crew Portal", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew-ryan", type: "Static", label: "Ryan Crew Portal", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew-sam", type: "Static", label: "Sam Crew Portal", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew-tony", type: "Static", label: "Tony Crew Portal", category: "Admin & Crew", icon: ShieldCheck },
  { path: "/crew-abbie", type: "Static", label: "Abbie Crew Portal", category: "Admin & Crew", icon: ShieldCheck },

  // ── UI Demos & Labs ──
  { path: "/style-guide", type: "Static", label: "UI Style Guide & Studio", category: "UI Demos & Labs", icon: Layers },
  { path: "/hambuger", type: "Static", label: "Hamburger Menu Demo", category: "UI Demos & Labs", icon: Layers },
  { path: "/textcolor", type: "Static", label: "Text Color Gradient Studio", category: "UI Demos & Labs", icon: Layers },
  { path: "/video", type: "Static", label: "Video Showcase Studio", category: "UI Demos & Labs", icon: Film },
  { path: "/payment-test", type: "Static", label: "Payment Test Shop (EPX)", category: "UI Demos & Labs", icon: ShoppingBag },

  // ── API Routes ──
  { path: "/api/tour", type: "API", label: "GET Tour Dates JSON", category: "API Routes", icon: Terminal },
  { path: "/api/health", type: "API", label: "GET Health Check", category: "API Routes", icon: Terminal },
  { path: "/api/announcement", type: "API", label: "GET/POST Announcement", category: "API Routes", icon: Terminal },
  { path: "/api/audio", type: "API", label: "GET Audio Playlist Tracks", category: "API Routes", icon: Terminal },
  { path: "/api/booking", type: "API", label: "POST Booking Submission", category: "API Routes", icon: Terminal },
  { path: "/api/sms/live-alert", type: "API", label: "POST Twilio Live Alert SMS", category: "API Routes", icon: Terminal },
  { path: "/api/admin/shows", type: "API", label: "GET/POST Admin Shows", category: "API Routes", icon: Terminal },
];

const CATEGORIES = ["All", "Public Pages", "Store & Merch", "Fan Portal", "Live Stream", "Cruise Portal", "Admin & Crew", "UI Demos & Labs", "API Routes"];

export default function PagesPillDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Prevent page scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filtered = ALL_SITE_ROUTES.filter((r) => {
    const matchCat = activeCategory === "All" || r.category === activeCategory;
    const matchSearch =
      r.path.toLowerCase().includes(search.toLowerCase()) ||
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* ── PURPLE FLOATING PILL BUTTON (Matching Screenshot) ── */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#8b3dff] hover:bg-[#7b2cff] active:scale-95 text-white font-black text-sm uppercase tracking-widest transition-all duration-200 shadow-[0_10px_35px_rgba(139,61,255,0.6)] border border-white/20 group cursor-pointer"
        aria-label="Open Pages Directory"
      >
        <Menu className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
        <span>PAGES</span>
        <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
          {ALL_SITE_ROUTES.length}
        </span>
      </button>

      {/* ── MODAL DRAWER OVERLAY ── */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn font-sans">

          {/* Backdrop Click to Close */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-5xl max-h-[85vh] rounded-3xl bg-[rgba(18,18,26,0.95)] border border-purple-500/30 p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col z-10 overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg  bg-[#8b3dff]/20 border border-[#8b3dff]/40 text-[#a855f7]">
                  <Menu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Pages Directory
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {ALL_SITE_ROUTES.length} Total Routes
                    </span>
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Click any page link below to navigate directly across the 7th Heaven web application.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-lg  bg-[#e1e6ff29]   hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                aria-label="Close Pages Modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="py-4 space-y-4 shrink-0 border-b border-white/10">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 overflow-x-auto max-w-full">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5  rounded-lg text-xs font-bold transition-all ${activeCategory === cat
                        ? "bg-[#8b3dff] text-white shadow-lg shadow-purple-950/60"
                        : "bg-[#e1e6ff29]   hover:bg-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search routes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black/50 border border-white/15  rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#8b3dff] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Grid of Pages */}
            <div className="flex-1 overflow-y-auto py-4 pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 custom-scrollbar">
              {filtered.map((item) => {
                const IconComp = item.icon || Globe;
                const isApi = item.type === "API";

                return (
                  <div
                    key={item.path}
                    className="group p-4 rounded-lg  bg-white/[0.03] hover:bg-purple-900/10 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <IconComp className="w-4 h-4 text-purple-400" />
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300">
                            {item.category}
                          </span>
                        </div>
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

                      <h3 className="text-xs font-bold text-white group-hover:text-purple-200 transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-[11px] font-mono text-white/50 mt-1 truncate">
                        {item.path}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5">
                      {isApi ? (
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Test Endpoint <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <Link
                          href={item.path}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Open Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-white/40 text-xs font-mono">
                No matching pages found for "{search}".
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
