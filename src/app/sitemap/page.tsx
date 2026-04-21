"use client";

import Link from "next/link";

const siteStructure = [
  {
    title: "Public Experience (Fans)",
    routes: [
      {
        path: "/",
        name: "Home Page",
        sections: ["Cinematic Hero Hub", "Proximity Notifications", "Next Show Banner", "Mailing List Footer"],
        features: ["Dynamic Header Intersection", "Local Storage Opt-in tracking"],
        color: "text-purple-400",
        border: "border-purple-500/30",
        bg: "bg-purple-500/5",
      },
      {
        path: "/tour",
        name: "Tour Dates",
        sections: ["Interactive Venue Map", "Chronological Next Show Pin", "Smart Search & Filters", "Tour Table Dates"],
        features: ["Leaflet Dynamic Map Rendering", "Real-Time Date Filtering algorithms", "Geo-coordinates integration"],
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
        path: "/bio",
        name: "Band Bio",
        sections: ["History Timeline", "Band Member Profiles", "Accolades"],
        features: ["Static Content Hydration"],
        color: "text-amber-400",
        border: "border-amber-500/30",
        bg: "bg-amber-500/5",
      },
      {
        path: "/fan-photo-wall",
        name: "Fan Photo Wall",
        sections: ["Dynamic Masonry Grid", "Hover Interactions", "Fullscreen Lightbox"],
        features: ["CSS Column-Based Masonry", "Focus Trapping Modal", "Optimized Image Loading"],
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/5",
      },
      {
        path: "/live/demo",
        name: "Live Broadcast",
        sections: ["LiveKit WebSocket Tunnel", "Real-Time Chat Engine", "Emoji Reaction Layer"],
        features: ["Zero-Latency UDP Video Tunnel", "Bidirectional RTC Websockets", "Client-Side Animation Engine"],
        color: "text-rose-400",
        border: "border-rose-500/30",
        bg: "bg-rose-500/5",
      },
    ],
  },
  {
    title: "Authentication & E-Commerce",
    routes: [
      {
        path: "/members",
        name: "Member Onboarding",
        sections: ["Fan vs Crew Pathing", "Account Benefits Splash", "Secure Supabase Login"],
        features: ["Role-Based Automatic Routing", "JWT Session Management", "Frictionless UI/UX Access"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
      {
        path: "#",
        name: "Shopify Store (External)",
        sections: ["cartCreate GraphQL Tunnel", "Dynamic Headless Checkout", "Password Protected Preview"],
        features: ["Shopify Native Cart API", "Zero-Database Inventory Sync", "Single Source of Truth Transactions"],
        color: "text-green-400",
        border: "border-green-500/30",
        bg: "bg-green-500/5",
      },
    ],
  },
  {
    title: "Internal Infrastructure (Staff)",
    routes: [
      {
        path: "/crew",
        name: "Crew Dashboard",
        sections: ["Live Broadcast Studio", "System Metrics", "Moderation Panel", "Community Security Registry"],
        features: ["Admin Action Auditing Log", "Real-Time Broadcast Toggles", "Role Protection Middleware", "Server-Side Terminations"],
        color: "text-orange-400",
        border: "border-orange-500/30",
        bg: "bg-orange-500/5",
      },
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-[rgb(10,10,15)] pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--color-accent)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600 opacity-[0.02] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">
            <span className="text-[var(--color-accent)]">Site</span> Map
          </h1>
          <p className="text-white/40 uppercase tracking-[0.2em] text-xs md:text-sm max-w-2xl mx-auto">
            A complete architectural overview of the 7th Heaven digital ecosystem.
          </p>
        </header>

        <div className="space-y-16">
          {siteStructure.map((category, idx) => (
            <section key={idx} className="relative">
              <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-8 border-b border-white/10 pb-4">
                {category.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.routes.map((route, rIdx) => (
                  <Link
                    key={rIdx}
                    href={route.path !== "#" ? route.path : "/"}
                    className={`group relative flex flex-col p-6 rounded-xl border ${route.border} ${route.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] overflow-hidden`}
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-black tracking-wide uppercase ${route.color}`}>
                        {route.name}
                      </h3>
                      <div className="text-[0.65rem] py-1 px-2 rounded bg-white/5 text-white/50 font-mono">
                        {route.path}
                      </div>
                    </div>

                    <div className="flex-1 mt-2 space-y-6">
                      {/* Sections Block */}
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-widest text-white/30 mb-3 font-semibold">
                          Core Sections
                        </p>
                        <ul className="space-y-3">
                          {route.sections.map((section, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-3">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                              <span className="text-sm text-white/70 leading-snug font-medium">
                                {section}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Features Block */}
                      {route.features && route.features.length > 0 && (
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-[0.65rem] uppercase tracking-widest text-white/40 mb-3 font-semibold">
                            Technical Features
                          </p>
                          <ul className="space-y-2">
                            {route.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2">
                                <span className={`mt-[4px] w-2 h-2 shrink-0 border border-current ${route.color} rotate-45`}></span>
                                <span className="text-xs text-white/50 font-mono leading-tight">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
