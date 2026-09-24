"use client";

import React, { useState, useEffect } from "react";
import TransitionLink from "@/components/TransitionLink";
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
  Bell,
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
  {
    path: "/",
    type: "Static",
    label: "Home Page",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/shows/past",
    type: "Static",
    label: "Past Shows Archive",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/contact",
    type: "Static",
    label: "Contact & Booking",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/book",
    type: "Static",
    label: "Booking Request Form",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/book/cancel",
    type: "Static",
    label: "Booking Canceled",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/book/success",
    type: "Static",
    label: "Booking Success",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/faq",
    type: "Static",
    label: "FAQ & Support",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/features",
    type: "Static",
    label: "Band Features",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/media",
    type: "Static",
    label: "Media & Press Kit",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/privacy",
    type: "Static",
    label: "Privacy Policy",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/terms",
    type: "Static",
    label: "Terms of Service",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/returns",
    type: "Static",
    label: "Return Policy",
    category: "Public Pages",
    icon: Globe,
  },
  {
    path: "/rock-and-roll-kids",
    type: "Static",
    label: "Rock 'n' Roll Kids Series",
    category: "Public Pages",
    icon: Sparkles,
  },
  {
    path: "/notifications",
    type: "Static",
    label: "🔔 Push Notifications Tester",
    category: "Public Pages",
    icon: Bell,
  },

  // ── Store & Merch ──
  {
    path: "/merch",
    type: "Static",
    label: "Official Merch Catalog",
    category: "Store & Merch",
    icon: ShoppingBag,
  },
  {
    path: "/qr/merch",
    type: "Dynamic",
    label: "QR Merch Scanner",
    category: "Store & Merch",
    icon: ShoppingBag,
  },

  // ── Fan Portal ──
  {
    path: "/fans",
    type: "Static",
    label: "Fan Club Hub",
    category: "Fan Portal",
    icon: UserCheck,
  },
  {
    path: "/fans/complete-profile",
    type: "Static",
    label: "Complete Fan Profile",
    category: "Fan Portal",
    icon: UserCheck,
  },
  {
    path: "/fans/sample_fan",
    type: "Dynamic",
    label: "Fan Profile View",
    category: "Fan Portal",
    icon: UserCheck,
  },
  {
    path: "/fan-media-wall",
    type: "Static",
    label: "Fan Media Wall",
    category: "Fan Portal",
    icon: UserCheck,
  },
  {
    path: "/planner",
    type: "Static",
    label: "Show Planner Portal",
    category: "Fan Portal",
    icon: UserCheck,
  },
  {
    path: "/planner/verify",
    type: "Static",
    label: "Planner Verification",
    category: "Fan Portal",
    icon: UserCheck,
  },

  // ── Live Stream ──
  {
    path: "/live",
    type: "Static",
    label: "Live Stream Hub",
    category: "Live Stream",
    icon: Radio,
  },
  {
    path: "/live/live_michael",
    type: "Static",
    label: "Michael Stream Room",
    category: "Live Stream",
    icon: Radio,
  },
  {
    path: "/live/live_ryan",
    type: "Static",
    label: "Ryan Stream Room",
    category: "Live Stream",
    icon: Radio,
  },
  {
    path: "/live/live_sammy",
    type: "Static",
    label: "Sammy Stream Room",
    category: "Live Stream",
    icon: Radio,
  },
  {
    path: "/live/live_tony",
    type: "Static",
    label: "Tony Stream Room",
    category: "Live Stream",
    icon: Radio,
  },

  // ── Cruise Portal ──
  {
    path: "/cruise",
    type: "Static",
    label: "Fan Cruise 2026",
    category: "Cruise Portal",
    icon: Sparkles,
  },
  {
    path: "/cruise/dashboard",
    type: "Static",
    label: "Cruise Dashboard",
    category: "Cruise Portal",
    icon: Sparkles,
  },
  {
    path: "/cruise/preview",
    type: "Static",
    label: "Cruise Preview",
    category: "Cruise Portal",
    icon: Sparkles,
  },
  {
    path: "/cruise/verify",
    type: "Static",
    label: "Cruise Verify PIN",
    category: "Cruise Portal",
    icon: Sparkles,
  },
  {
    path: "/cruise/cancel",
    type: "Static",
    label: "Cruise Cancel Page",
    category: "Cruise Portal",
    icon: Sparkles,
  },

  // ── Admin & Crew ──
  {
    path: "/admin",
    type: "Static",
    label: "Admin Main Portal",
    category: "Admin & Crew",
    icon: Lock,
  },
  {
    path: "/admin/email-map",
    type: "Static",
    label: "Admin Email Routing Map",
    category: "Admin & Crew",
    icon: Lock,
  },
  {
    path: "/admin/emails",
    type: "Static",
    label: "Admin Broadcast Emails",
    category: "Admin & Crew",
    icon: Lock,
  },
  {
    path: "/admin/legal",
    type: "Static",
    label: "Admin Legal Contracts",
    category: "Admin & Crew",
    icon: Lock,
  },
  {
    path: "/crew",
    type: "Static",
    label: "Crew HQ",
    category: "Admin & Crew",
    icon: ShieldCheck,
  },
  {
    path: "/crew-michael",
    type: "Static",
    label: "Michael Crew Portal",
    category: "Admin & Crew",
    icon: ShieldCheck,
  },
  {
    path: "/crew-ryan",
    type: "Static",
    label: "Ryan Crew Portal",
    category: "Admin & Crew",
    icon: ShieldCheck,
  },
  {
    path: "/crew-sam",
    type: "Static",
    label: "Sam Crew Portal",
    category: "Admin & Crew",
    icon: ShieldCheck,
  },
  {
    path: "/crew-tony",
    type: "Static",
    label: "Tony Crew Portal",
    category: "Admin & Crew",
    icon: ShieldCheck,
  },
  {
    path: "/crew-abbie",
    type: "Static",
    label: "Abbie Crew Portal",
    category: "Admin & Crew",
    icon: ShieldCheck,
  },

  // ── UI Demos & Labs ──
  {
    path: "/style-guide",
    type: "Static",
    label: "UI Style Guide & Studio",
    category: "UI Demos & Labs",
    icon: Layers,
  },
  {
    path: "/hambuger",
    type: "Static",
    label: "Hamburger Menu Demo",
    category: "UI Demos & Labs",
    icon: Layers,
  },
  {
    path: "/textcolor",
    type: "Static",
    label: "Text Color Gradient Studio",
    category: "UI Demos & Labs",
    icon: Layers,
  },
  {
    path: "/video",
    type: "Static",
    label: "Video Showcase Studio",
    category: "UI Demos & Labs",
    icon: Film,
  },
  {
    path: "/payment-test",
    type: "Static",
    label: "Payment Test Shop (EPX)",
    category: "UI Demos & Labs",
    icon: ShoppingBag,
  },

  // ── API Routes ──
  {
    path: "/api/tour",
    type: "API",
    label: "GET Tour Dates JSON",
    category: "API Routes",
    icon: Terminal,
  },
  {
    path: "/api/health",
    type: "API",
    label: "GET Health Check",
    category: "API Routes",
    icon: Terminal,
  },
  {
    path: "/api/announcement",
    type: "API",
    label: "GET/POST Announcement",
    category: "API Routes",
    icon: Terminal,
  },
  {
    path: "/api/audio",
    type: "API",
    label: "GET Audio Playlist Tracks",
    category: "API Routes",
    icon: Terminal,
  },
  {
    path: "/api/booking",
    type: "API",
    label: "POST Booking Submission",
    category: "API Routes",
    icon: Terminal,
  },
  {
    path: "/api/sms/live-alert",
    type: "API",
    label: "POST Twilio Live Alert SMS",
    category: "API Routes",
    icon: Terminal,
  },
  {
    path: "/api/admin/shows",
    type: "API",
    label: "GET/POST Admin Shows",
    category: "API Routes",
    icon: Terminal,
  },
];

const CATEGORIES = [
  "All",
  "Public Pages",
  "Store & Merch",
  "Fan Portal",
  "Live Stream",
  "Cruise Portal",
  "Admin & Crew",
  "UI Demos & Labs",
  "API Routes",
];

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
        className="group fixed bottom-6 left-6 z-[9999] flex cursor-pointer items-center gap-3 rounded-lg border-2 border-white/30 bg-[#8b3dff] px-8 py-4.5 text-base font-black shadow-[0_12px_40px_rgba(139,61,255,0.85),0_0_20px_rgba(255,255,255,0.3)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-[#7b2cff] active:scale-95 md:text-lg"
        aria-label="Open Pages Directory"
      >
        <Menu className="h-6 w-6 transition-transform group-hover:scale-110 md:h-7 md:w-7" />
        <span>PAGES</span>
        <span className="ml-1 rounded-lg bg-white/25 px-2.5 py-1">
          {ALL_SITE_ROUTES.length}
        </span>
      </button>

      {/* ── MODAL DRAWER OVERLAY ── */}
      {isOpen && (
        <div className="animate-fadeIn fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl md:p-6">
          {/* Backdrop Click to Close */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-purple-500/30 bg-[rgba(18,18,26,0.95)] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] md:p-8">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[#8b3dff]/40 bg-[#8b3dff]/20 p-3 text-[#a855f7]">
                  <Menu className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="flex items-center gap-2">
                    Pages Directory
                    <span className="bg- purple-white/20 rounded-lg border border-purple-500/30 px-2.5 py-0.5 text-purple-300">
                      {ALL_SITE_ROUTES.length} Total Routes
                    </span>
                  </h2>
                  <p className="mt-0.5">
                    Click any page link below to navigate directly across the
                    7th Heaven web application.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-white/10 bg-[#00000029] p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close Pages Modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="shrink-0 space-y-4 border-b border-white/10 py-4">
              <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
                {/* Category Pills */}
                <div className="flex max-w-full flex-wrap gap-1.5 overflow-x-auto">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-lg px-3 py-1.5 transition-colors ${activeCategory === cat ? "bg-[#8b3dff] shadow-purple-950/60" : "bg-[#00000029] hover:bg-white/10 hover:text-white"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[240px]">
                  <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search routes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 py-2 pr-4 pl-9 placeholder-white/40 focus:border-[#8b3dff] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Grid of Pages */}
            <div className="custom-scrollbar grid flex-1 grid-cols-1 gap-3 overflow-y-auto py-4 pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => {
                const IconComp = item.icon || Globe;
                const isApi = item.type === "API";

                return (
                  <div
                    key={item.path}
                    className="group flex flex-col justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-[background-color,border-color] hover:border-purple-500/40 hover:bg-purple-900/10"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <IconComp className="h-4 w-4 text-purple-400" />
                          <span className="text-[10px] text-purple-300">
                            {item.category}
                          </span>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[12px] ${item.type === "Static" ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : item.type === "SSG" ? "border border-white/20 bg-purple-500/10 text-purple-300" : item.type === "Dynamic" ? "border border-amber-500/20 bg-amber-500/10 text-amber-300" : "border border-rose-500/20 bg-rose-500/10 text-rose-400"}`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <h3 className="transition-colors group-hover:text-purple-200">
                        {item.label}
                      </h3>
                      <p className="truncate">{item.path}</p>
                    </div>

                    <div className="mt-3 border-t border-white/5 pt-2.5">
                      {isApi ? (
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] text-rose-400 transition-colors hover:text-rose-300"
                        >
                          Test Endpoint <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <TransitionLink
                          href={item.path}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 text-[11px] text-purple-400 transition-colors hover:text-purple-300"
                        >
                          Open Page <ExternalLink className="h-3 w-3" />
                        </TransitionLink>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-white/40">
                No matching pages found for "{search}".
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
