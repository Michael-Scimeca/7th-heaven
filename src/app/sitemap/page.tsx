"use client";

import Link from "next/link";

function TreeNode({ path, label, color, children }: { path: string; label: string; color: string; children?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="text-white/15 select-none">├─</span>
        <span className={`${color} font-bold`}>{path}</span>
        <span className="text-white/25 text-[0.7rem]">{label}</span>
      </div>
      {children && (
        <div className="ml-6 border-l border-white/5 pl-4 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

const siteStructure = [
  {
    title: "Public Experience (Fans)",
    routes: [
      {
        path: "/",
        name: "Home Page",
        sections: ["Cinematic Hero Hub", "Proximity Notifications", "Next Show Banner", "Upcoming Shows Grid", "Cruise Promo Banner", "Tour Map", "Latest Release", "Music Player", "Merch Quick Shop", "Photo Gallery", "Video Section", "Behind the Scenes"],
        features: ["Dynamic Header Intersection", "Local Storage Opt-in tracking", "Live Stream Detection", "Supabase Real-Time Feed"],
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
        path: "/members/[slug]",
        name: "Individual Band Members",
        sections: ["Hero Profile", "Extended Q&A", "Gear/Instruments"],
        features: ["Dynamic Routing", "Sanity CMS Data Fetching"],
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
        path: "/live",
        name: "Live Stream Hub",
        sections: ["Active Broadcast Gallery", "Real-Time Stream Detection", "Auto-Cleanup of Stale Feeds"],
        features: ["LiveKit Room Aggregation", "Supabase Cross-Validation", "WebRTC Video Streams"],
        color: "text-rose-400",
        border: "border-rose-500/30",
        bg: "bg-rose-500/5",
      },
      {
        path: "/news",
        name: "News & Updates",
        sections: ["Featured Article Layout", "Chronological Updates", "Band Announcements"],
        features: ["Sanity CMS Integration", "Server-Side Rendering"],
        color: "text-violet-400",
        border: "border-violet-500/30",
        bg: "bg-violet-500/5",
      },
      {
        path: "/store",
        name: "Merch Store",
        sections: ["Product Grid", "Headless Checkout", "Cart System"],
        features: ["Shopify Storefront API", "GraphQL Cart Mutations", "Dynamic Inventory"],
        color: "text-lime-400",
        border: "border-lime-500/30",
        bg: "bg-lime-500/5",
      },
      {
        path: "/book",
        name: "Book the Band",
        sections: ["Multi-Step Booking Form", "Event Type Selection", "Production & Extras", "Planner Dashboard Access", "Inline Account Creation"],
        features: ["Supabase Form Submission", "Role-Based Planner Accounts", "Token-Based Cancellation Links", "Cancel Token Generation"],
        color: "text-fuchsia-400",
        border: "border-fuchsia-500/30",
        bg: "bg-fuchsia-500/5",
      },
      {
        path: "/book/cancel",
        name: "Booking Cancellation",
        sections: ["Token Validation", "Booking Details Display", "Cancellation Confirmation", "Success/Error States"],
        features: ["Secure Token + ID Verification", "No-Login Required", "Supabase Status Update", "Immediate Admin Notification"],
        color: "text-fuchsia-400",
        border: "border-fuchsia-500/30",
        bg: "bg-fuchsia-500/5",
      },
      {
        path: "/contact",
        name: "Contact",
        sections: ["Contact Form", "Social Links", "Band Email"],
        features: ["Form Validation", "Resend Integration"],
        color: "text-sky-400",
        border: "border-sky-500/30",
        bg: "bg-sky-500/5",
      },
      {
        path: "/cruise",
        name: "Caribbean Cruise",
        sections: ["Cinematic Hero", "Interest Signup Form", "Live Fan Counter", "Day-by-Day Itinerary", "What's Included", "FAQ Accordion"],
        features: ["Supabase Interest Tracking", "Resend Email Confirmation", "Token-Based Cancellation", "Referral Tracking"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
      {
        path: "/cruise/cancel",
        name: "Cruise Cancellation",
        sections: ["Token Validation", "Cancellation Confirmation", "Confirmation Email"],
        features: ["Secure Token Links", "Supabase Record Deletion", "Resend Cancellation Email"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
      {
        path: "/merch",
        name: "Merch Landing",
        sections: ["Featured Products", "Category Filters", "Quick Buy Links"],
        features: ["Shopify Storefront API", "Dynamic Pricing"],
        color: "text-lime-400",
        border: "border-lime-500/30",
        bg: "bg-lime-500/5",
      },
      {
        path: "/privacy",
        name: "Privacy Policy",
        sections: ["Data Collection", "Cookie Policy", "User Rights"],
        features: ["Static Legal Content"],
        color: "text-gray-400",
        border: "border-gray-500/30",
        bg: "bg-gray-500/5",
      },
      {
        path: "/terms",
        name: "Terms of Service",
        sections: ["Usage Terms", "Liability", "Account Rules"],
        features: ["Static Legal Content"],
        color: "text-gray-400",
        border: "border-gray-500/30",
        bg: "bg-gray-500/5",
      },
    ],
  },
  {
    title: "Authentication & Dashboards",
    routes: [
      {
        path: "/fans",
        name: "Fan Dashboard",
        sections: ["Fan vs Crew Pathing", "VIP Rewards & Loyalty", "Secure Supabase Login", "VIP Inbox", "Referral QR Code"],
        features: ["Role-Based Automatic Routing", "JWT Session Management", "Frictionless UI/UX Access"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
      {
        path: "/planner",
        name: "Planner Dashboard",
        sections: ["Booking Status Tracker", "Event Details View", "Re-Book Flow", "Inline Checklist Editing", "Public Landing with Login"],
        features: ["Role-Based Access", "Supabase Row-Level Security", "Real-Time Status Updates", "Non-Authenticated Browse Mode"],
        color: "text-teal-400",
        border: "border-teal-500/30",
        bg: "bg-teal-500/5",
      },
      {
        path: "/claim",
        name: "Raffle Prize Claim",
        sections: ["PIN Verification", "Prize Details", "Claim Confirmation"],
        features: ["Secure Token Validation", "One-Time PIN System"],
        color: "text-yellow-400",
        border: "border-yellow-500/30",
        bg: "bg-yellow-500/5",
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
        sections: ["Live Broadcast Studio", "Live Chat & Reactions", "Interactive Raffle Engine", "Shopify Flash Drops"],
        features: ["LiveKit Streaming", "Cross-Tab Synchronization", "Real-Time Broadcast Toggles", "Supabase Subscriptions"],
        color: "text-orange-400",
        border: "border-orange-500/30",
        bg: "bg-orange-500/5",
      },
      {
        path: "/admin",
        name: "Master Admin Command Center",
        sections: ["Real-Time Analytics Dashboard", "Shopify Sales Data", "Booking Request Approval", "Interactive Traffic Heatmap", "Event Planners Directory", "Fan Photo Moderation Queue", "Live Stream Status", "SMS / Newsletter Proximity Blasts", "Crew Alert System", "Community Registry"],
        features: ["Leaflet Mapbox Integration", "Secure Role-Based Access", "Supabase Read/Write", "Shopify API Aggregation"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      },
      {
        path: "/sitemap",
        name: "Architecture & Sitemap",
        sections: ["Visual Structure Tree", "Component Registry", "API Endpoint Catalog", "Database Migrations"],
        features: ["Self-Documenting Frontend", "Color-Coded Status Tracking"],
        color: "text-white",
        border: "border-white/30",
        bg: "bg-white/5",
      },
      {
        path: "/test-supabase",
        name: "Database Diagnostic Tool",
        sections: ["Connection Tester", "Permissions Check"],
        features: ["Client-Side DB Diagnostics"],
        color: "text-gray-400",
        border: "border-gray-500/30",
        bg: "bg-gray-500/5",
      },
      {
        path: "/admin/emails",
        name: "Email Template Previews",
        sections: ["Template Sidebar", "Live HTML Preview", "Code View", "Send Test Email"],
        features: ["Centralized Template Registry", "Category Filtering", "Resend Test Integration"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      },
      {
        path: "/studio",
        name: "Sanity Studio",
        sections: ["Content Editing", "Tour Dates", "News Articles", "Site Settings", "Media Library"],
        features: ["Headless CMS", "Draft Preview", "Structured Content"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
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
                    href={route.path.includes('[') ? '#' : (route.path !== "#" ? route.path : "/")}
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

        {/* Tech Stack Section */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-8 border-b border-white/10 pb-4">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { name: "Next.js 16", desc: "React framework — SSR, API routes, ISR", color: "text-white", icon: "▲" },
              { name: "Supabase", desc: "Auth, Postgres database, real-time subscriptions, RLS policies", color: "text-emerald-400", icon: "⚡" },
              { name: "LiveKit", desc: "WebRTC video streaming — rooms, tokens, egress", color: "text-indigo-400", icon: "📡" },
              { name: "Sanity CMS", desc: "Headless CMS — tour dates, news, band bios, settings", color: "text-red-400", icon: "📝" },
              { name: "Shopify", desc: "Storefront API — merch products, headless checkout, cart", color: "text-green-400", icon: "🛒" },
              { name: "Resend", desc: "Transactional email — booking confirmations, admin alerts", color: "text-blue-400", icon: "📧" },
              { name: "Twilio", desc: "SMS notifications — booking status, crew alerts", color: "text-rose-400", icon: "📱" },
              { name: "Vercel", desc: "Hosting & deployment — edge functions, CDN", color: "text-white/80", icon: "🚀" },
              { name: "TypeScript", desc: "Type-safe development across all components", color: "text-blue-300", icon: "🔷" },
              { name: "Leaflet", desc: "Interactive maps — tour venue locations, geo-pins", color: "text-lime-400", icon: "🗺️" },
              { name: "QR Server API", desc: "Dynamic QR codes — referral links, ticket claims", color: "text-amber-400", icon: "📸" },
              { name: "TensorFlow.js", desc: "AI Moderation — client-side NSFW image scanning", color: "text-orange-400", icon: "🧠" },
              { name: "Upstash Redis", desc: "Rate limiting — API abuse prevention", color: "text-rose-500", icon: "🛡️" },
            ].map((tech, i) => (
              <div key={i} className="p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{tech.icon}</span>
                  <h3 className={`text-sm font-black uppercase tracking-wide ${tech.color}`}>{tech.name}</h3>
                </div>
                <p className="text-[0.7rem] text-white/40 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SMS Text Messages */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            📲 SMS Text Messages
          </h2>
          <p className="text-white/30 text-xs mb-8">All outbound text messages sent via Twilio — 4 templates total.</p>
          <div className="space-y-4">
            {[
              {
                trigger: "Fan Subscribes to Show Alerts",
                route: "/api/sms/subscribe",
                message: `7th Heaven Show Alerts: You're subscribed, [Name]! We'll text you when we play near [ZIP]. Reply STOP to opt out. Msg freq varies. Msg & data rates may apply.`,
                color: "text-emerald-400",
                border: "border-emerald-500/30",
                icon: "✅",
              },
              {
                trigger: "Crew Member Goes LIVE",
                route: "/api/sms/live-alert",
                message: `7th Heaven: 🎸 [Host Name] just went LIVE! Tune in now at 7thheavenband.com/live\n\nReply STOP to unsubscribe.`,
                color: "text-rose-400",
                border: "border-rose-500/30",
                icon: "🔴",
              },
              {
                trigger: "Fan Unsubscribes",
                route: "/api/sms/unsubscribe",
                message: `7th Heaven: You've been unsubscribed from Show Alerts. You will no longer receive texts. Reply START to re-subscribe.`,
                color: "text-amber-400",
                border: "border-amber-500/30",
                icon: "🚫",
              },
              {
                trigger: "Admin Sends Proximity Blast",
                route: "/api/sms/send",
                message: `🎸 7th Heaven is playing in your area!\n\n📍 [Venue] — [City, State]\n📅 [Date]\n🚪 Doors: [Doors Time] | Show: [Show Time]\n✅ All Ages\n🎟️ FREE — No Cover\n\nReply STOP to unsubscribe.`,
                color: "text-purple-400",
                border: "border-purple-500/30",
                icon: "📡",
              },
            ].map((sms, i) => (
              <div key={i} className={`p-5 rounded-xl border ${sms.border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{sms.icon}</span>
                    <div>
                      <h3 className={`text-sm font-black uppercase tracking-wide ${sms.color}`}>{sms.trigger}</h3>
                      <span className="text-[0.6rem] text-white/20 font-mono">{sms.route}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[0.55rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live</span>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-lg p-4">
                  <p className="text-[0.8rem] text-white/70 font-mono leading-relaxed whitespace-pre-line">{sms.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Email Templates */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            📧 Email Templates
          </h2>
          <p className="text-white/30 text-xs mb-8">All transactional emails sent via Resend — 11 templates total. <a href="/admin/emails" className="text-[var(--color-accent)] hover:text-white transition-colors">Preview all →</a></p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Booking Confirmation", desc: "Sent to the event planner after submitting a booking request.", category: "Booking", status: "live", icon: "📋" },
              { name: "Booking Admin Alert", desc: "Sent to admin when a new booking request comes in.", category: "Booking", status: "live", icon: "⚡" },
              { name: "Booking Cancelled Alert", desc: "Sent to admin when a planner cancels their booking via token link.", category: "Booking", status: "live", icon: "🚨" },
              { name: "Raffle Winner", desc: "Sent to the fan who wins a live raffle with their claim PIN.", category: "Live Stream", status: "live", icon: "🏆" },
              { name: "Raffle Entry Confirmation", desc: "Sent when a fan enters a live raffle.", category: "Live Stream", status: "live", icon: "🎟️" },
              { name: "Cruise Signup Confirmation", desc: "Branded HTML email confirming cruise interest with cancellation link.", category: "Cruise", status: "live", icon: "🚢" },
              { name: "Cruise Cancellation", desc: "Sent when a fan cancels their cruise interest via token link.", category: "Cruise", status: "live", icon: "❌" },
              { name: "Welcome — Fan", desc: "Sent after a fan creates their account.", category: "Account", status: "live", icon: "🎸" },
              { name: "Welcome — Planner", desc: "Sent after a planner creates their account from the booking flow.", category: "Account", status: "live", icon: "📋" },
              { name: "Booking Status Update", desc: "Sent when a booking is approved, cancelled, or completed.", category: "Booking", status: "live", icon: "✅" },
              { name: "Newsletter Blast", desc: "Sent to all fans & subscribers from the admin dashboard.", category: "Newsletter", status: "live", icon: "📨" },
            ].map((email, i) => (
              <div key={i} className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{email.icon}</span>
                    <h3 className="text-sm font-bold text-white">{email.name}</h3>
                  </div>
                  <span className={`text-[0.55rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    email.status === 'live'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>{email.status}</span>
                </div>
                <p className="text-[0.7rem] text-white/40 leading-relaxed mb-2">{email.desc}</p>
                <span className="text-[0.6rem] text-[var(--color-accent)]/60 font-bold uppercase tracking-widest">{email.category}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Remember Before Launch */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            ⚠️ Remember Before Launch
          </h2>
          <p className="text-white/30 text-xs mb-8">Critical deployment checklist — complete these before going live.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Verify Resend Domain",
                desc: "Add and verify 7thheavenband.com in the Resend dashboard so emails send from your own domain instead of onboarding@resend.dev.",
                link: "https://resend.com/domains",
                linkText: "Open Resend Dashboard",
                icon: "📧",
                color: "text-blue-400",
                border: "border-blue-500/30",
              },
              {
                title: "Set Production Email Sender",
                desc: "After domain verification, update your production .env with: RESEND_FROM_EMAIL=noreply@7thheavenband.com",
                icon: "🔑",
                color: "text-amber-400",
                border: "border-amber-500/30",
              },
              {
                title: "Update NEXT_PUBLIC_SITE_URL",
                desc: "Change NEXT_PUBLIC_SITE_URL from http://localhost:3000 to your production URL in .env so email links point to the right place.",
                icon: "🌐",
                color: "text-emerald-400",
                border: "border-emerald-500/30",
              },
              {
                title: "Run Pending Migrations",
                desc: "All 9 migrations applied ✓ — profiles, bookings, feed, chat, newsletter, SMS, setlist, cruise, and referrals.",
                icon: "✅",
                color: "text-emerald-400",
                border: "border-emerald-500/30",
              },
              {
                title: "Verify Supabase Auth Providers",
                desc: "Enable Google, Facebook, and Apple OAuth providers in Supabase → Authentication → Providers with production redirect URLs.",
                icon: "🔐",
                color: "text-cyan-400",
                border: "border-cyan-500/30",
              },
              {
                title: "Hook Up Google Analytics",
                desc: "Create a Google Analytics property and add the tracking ID to your production .env as NEXT_PUBLIC_GA_ID to start tracking traffic.",
                icon: "📊",
                color: "text-purple-400",
                border: "border-purple-500/30",
              },
              {
                title: "Shopify Storefront Token",
                desc: "Ensure the Shopify Storefront API token is set for production and the store password protection is removed.",
                icon: "🛒",
                color: "text-green-400",
                border: "border-green-500/30",
              },
            ].map((item, i) => (
              <div key={i} className={`p-5 rounded-xl border ${item.border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{item.icon}</span>
                  <h3 className={`text-sm font-black uppercase tracking-wide ${item.color}`}>{item.title}</h3>
                </div>
                <p className="text-[0.75rem] text-white/50 leading-relaxed mb-3">{item.desc}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className={`text-[0.65rem] font-bold uppercase tracking-widest ${item.color} hover:text-white transition-colors`}>
                    {item.linkText} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* API Routes */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            🔌 API Routes
          </h2>
          <p className="text-white/30 text-xs mb-8">All server-side API endpoints — 25 routes across 15 domains.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { route: "/api/announcement", method: "GET / POST", desc: "Global alert banner read/write with auto-expire", color: "text-purple-400" },
              { route: "/api/settings", method: "GET", desc: "Sanity site settings (hero, bio, stats)", color: "text-purple-400" },
              { route: "/api/booking", method: "POST", desc: "Submit booking request + email notifications", color: "text-fuchsia-400" },
              { route: "/api/admin/fans", method: "GET", desc: "Fan analytics — signups, tiers, trends", color: "text-red-400" },
              { route: "/api/admin/newsletter", method: "POST", desc: "Blast branded email to all fans", color: "text-red-400" },
              { route: "/api/cruise/signup", method: "POST", desc: "Cruise interest signup + confirmation email", color: "text-cyan-400" },
              { route: "/api/cruise/cancel", method: "POST", desc: "Token-based cruise cancellation", color: "text-cyan-400" },
              { route: "/api/cruise/count", method: "GET", desc: "Live count of cruise signups", color: "text-cyan-400" },
              { route: "/api/email", method: "POST", desc: "Generic Resend email sender", color: "text-blue-400" },
              { route: "/api/feed", method: "GET / POST", desc: "Fan social feed — posts, likes, comments", color: "text-emerald-400" },
              { route: "/api/like", method: "POST", desc: "Toggle like on feed posts", color: "text-emerald-400" },
              { route: "/api/fans", method: "GET / POST", desc: "Fan profile CRUD operations", color: "text-cyan-400" },
              { route: "/api/live", method: "GET / POST", desc: "Live stream state management", color: "text-rose-400" },
              { route: "/api/live-rooms", method: "GET", desc: "Aggregate active LiveKit rooms", color: "text-rose-400" },
              { route: "/api/livekit", method: "POST", desc: "Generate LiveKit auth tokens", color: "text-indigo-400" },
              { route: "/api/stream", method: "GET / POST", desc: "Stream CRUD + Supabase sync", color: "text-rose-400" },
              { route: "/api/close-all-streams", method: "POST", desc: "Emergency kill-switch for all streams", color: "text-rose-400" },
              { route: "/api/sms/subscribe", method: "POST", desc: "SMS opt-in for show alerts", color: "text-amber-400" },
              { route: "/api/sms/unsubscribe", method: "POST", desc: "SMS opt-out handler", color: "text-amber-400" },
              { route: "/api/sms/send", method: "POST", desc: "Admin proximity SMS blast", color: "text-amber-400" },
              { route: "/api/sms/live-alert", method: "POST", desc: "Auto-SMS when crew goes live", color: "text-amber-400" },
              { route: "/api/shopify", method: "GET / POST", desc: "Shopify cart + product queries", color: "text-green-400" },
              { route: "/api/merch", method: "GET", desc: "Merch product listings", color: "text-green-400" },
              { route: "/api/tour", method: "GET", desc: "Tour dates from Sanity", color: "text-blue-400" },
              { route: "/api/newsletter/subscribe", method: "POST", desc: "Public newsletter signup", color: "text-violet-400" },
              { route: "/api/notify", method: "POST", desc: "Push notification dispatcher", color: "text-orange-400" },
              { route: "/api/booking/cancel", method: "POST", desc: "Token-based booking cancellation", color: "text-fuchsia-400" },
              { route: "/api/sms/auto-blast", method: "GET", desc: "Cron-triggered auto proximity SMS", color: "text-amber-400" },
              { route: "/api/admin/settings", method: "GET / POST", desc: "Admin key/value settings store", color: "text-red-400" },
              { route: "/api/admin/shows", method: "GET", desc: "Upcoming public shows for SMS picker", color: "text-red-400" },
              { route: "/api/audio", method: "GET", desc: "Audio track metadata/streaming", color: "text-pink-400" },
              { route: "/api/draft-mode", method: "GET", desc: "Toggle Sanity Visual Editing mode", color: "text-indigo-400" },
              { route: "/api/seed-content", method: "POST", desc: "Database content seeding tool", color: "text-gray-400" },
              { route: "/api/seed-tours", method: "POST", desc: "Tour dates sanity seeding tool", color: "text-gray-400" },
              { route: "/api/setup-db", method: "POST", desc: "Initial Supabase schema bootstrap", color: "text-gray-400" },
              { route: "/api/shopify/auth", method: "GET", desc: "Shopify OAuth initiation", color: "text-green-400" },
              { route: "/api/shopify/inventory", method: "GET", desc: "Shopify stock level syncing", color: "text-green-400" },
            ].map((api, i) => (
              <div key={i} className="p-3.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[0.65rem] font-mono text-white/60 font-bold">{api.route}</span>
                  <span className="text-[0.5rem] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-white/30">{api.method}</span>
                </div>
                <p className={`text-[0.65rem] ${api.color} leading-relaxed`}>{api.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Database Migrations */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            🗄️ Database Migrations
          </h2>
          <p className="text-white/30 text-xs mb-8">Supabase Postgres schema — 9 migration files in order of execution.</p>
          <div className="space-y-2">
            {[
              { file: "migration_001.sql", desc: "Core tables — profiles, bookings, feed_posts, feed_comments, sms_subscribers", status: "applied" },
              { file: "migration_002.sql", desc: "Live streams table + show_checkins + fan_points + raffle system tables", status: "applied" },
              { file: "migration_003_fan_feed.sql", desc: "Feed enhancements — likes, comments, image uploads", status: "applied" },
              { file: "migration_005_unique_email.sql", desc: "Unique email constraint on profiles table", status: "applied" },
              { file: "migration_006_newsletter.sql", desc: "Newsletter subscribers table + chat delete policy", status: "applied" },
              { file: "migration_007_sms_setlist.sql", desc: "SMS subscribers + setlist request tables", status: "applied" },
              { file: "migration_008_cruise_signups.sql", desc: "cruise_signups table — email, name, token, referral tracking", status: "applied" },
              { file: "migration_009_referrals.sql", desc: "Referral system — user_id linking for signup attribution", status: "applied" },
              { file: "migration_003_cancel_token.sql", desc: "Add cancel_token column to bookings for unauthenticated cancellation", status: "live" },
              { file: "migration_004_auto_blast.sql", desc: "site_settings + sms_blast_log tables for auto-blast system", status: "live" },
              { file: "migration_004_pinned_message.sql", desc: "Adds pinned_message column to live_streams for persistent sync", status: "live" },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <span className="text-[0.55rem] font-mono font-bold text-white/20 w-4 text-right">{i + 1}</span>
                <span className="text-[0.7rem] font-mono font-bold text-[var(--color-accent)] min-w-[260px]">{m.file}</span>
                <span className="text-[0.65rem] text-white/50 flex-1">{m.desc}</span>
                <span className={`text-[0.5rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
                  m.status === 'applied' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>{m.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Page Tree */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            🌳 Page Tree
          </h2>
          <p className="text-white/30 text-xs mb-8">Hierarchical view of all routes and how they connect.</p>

          <div className="bg-[#08080e] border border-white/5 rounded-2xl p-8 font-mono text-[0.8rem] leading-loose overflow-x-auto">
            {/* Root */}
            <div className="text-white font-bold">/ <span className="text-white/30 font-normal ml-2">Home</span></div>

            {/* Public */}
            <div className="ml-6 border-l border-white/10 pl-4 mt-1 space-y-0.5">
              <TreeNode path="/tour" label="Tour Dates" color="text-blue-400" />
              <TreeNode path="/video" label="Video Gallery" color="text-pink-400" />
              <TreeNode path="/bio" label="Band Bio" color="text-amber-400" />
              <TreeNode path="/news" label="News & Updates" color="text-violet-400" />
              <TreeNode path="/fan-photo-wall" label="Fan Photo Wall" color="text-emerald-400" />
              <TreeNode path="/contact" label="Contact" color="text-sky-400" />
              <TreeNode path="/privacy" label="Privacy Policy" color="text-gray-400" />
              <TreeNode path="/terms" label="Terms of Service" color="text-gray-400" />

              {/* Live */}
              <TreeNode path="/live" label="Live Stream Hub" color="text-rose-400">
                <TreeNode path="/live/[room]" label="Individual Stream" color="text-rose-400/60" />
              </TreeNode>

              {/* Store */}
              <TreeNode path="/store" label="Merch Store" color="text-lime-400" />
              <TreeNode path="/merch" label="Merch Landing" color="text-lime-400" />

              {/* Booking */}
              <TreeNode path="/book" label="Book the Band" color="text-fuchsia-400">
                <TreeNode path="/book/cancel" label="Booking Cancellation" color="text-fuchsia-400/60" />
              </TreeNode>

              {/* Cruise */}
              <TreeNode path="/cruise" label="Caribbean Cruise" color="text-cyan-400">
                <TreeNode path="/cruise/cancel" label="Cruise Cancellation" color="text-cyan-400/60" />
              </TreeNode>
            </div>

            {/* Auth / Dashboards */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-white/50 text-[0.6rem] uppercase tracking-widest mb-2">🔐 Authenticated</div>
              <div className="ml-6 border-l border-white/10 pl-4 space-y-0.5">
                <TreeNode path="/fans" label="Fan Dashboard" color="text-cyan-400" />
                <TreeNode path="/planner" label="Planner Dashboard" color="text-teal-400">
                  <TreeNode path="/planner/v1" label="Planner V1 (Active)" color="text-teal-400/60" />
                </TreeNode>
                <TreeNode path="/crew" label="Crew Dashboard" color="text-orange-400" />
                <TreeNode path="/claim" label="Raffle Prize Claim" color="text-yellow-400" />
              </div>
            </div>

            {/* Admin */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-white/50 text-[0.6rem] uppercase tracking-widest mb-2">⚙️ Admin</div>
              <div className="ml-6 border-l border-white/10 pl-4 space-y-0.5">
                <TreeNode path="/admin" label="Admin Dashboard" color="text-red-400">
                  <TreeNode path="/admin/emails" label="Email Template Previews" color="text-red-400/60" />
                  <TreeNode path="/admin/features" label="Feature Flags" color="text-red-400/60" />
                  <TreeNode path="/admin/feed" label="Feed Moderation" color="text-red-400/60" />
                </TreeNode>
                <TreeNode path="/studio" label="Sanity Studio (CMS)" color="text-red-400" />
                <TreeNode path="/sitemap" label="Site Map (This Page)" color="text-purple-400" />
              </div>
            </div>

            {/* API */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-white/50 text-[0.6rem] uppercase tracking-widest mb-2">🔌 API Routes</div>
              <div className="ml-6 border-l border-white/10 pl-4 space-y-0.5">
                <TreeNode path="/api/booking" label="Booking CRUD" color="text-fuchsia-400/60">
                  <TreeNode path="/api/booking/cancel" label="Token Cancellation" color="text-fuchsia-400/40" />
                </TreeNode>
                <TreeNode path="/api/sms" label="SMS System" color="text-amber-400/60">
                  <TreeNode path="/api/sms/subscribe" label="Opt-in" color="text-amber-400/40" />
                  <TreeNode path="/api/sms/unsubscribe" label="Opt-out" color="text-amber-400/40" />
                  <TreeNode path="/api/sms/send" label="Proximity Blast" color="text-amber-400/40" />
                  <TreeNode path="/api/sms/auto-blast" label="Auto Cron" color="text-amber-400/40" />
                  <TreeNode path="/api/sms/live-alert" label="Live Alert" color="text-amber-400/40" />
                </TreeNode>
                <TreeNode path="/api/cruise" label="Cruise System" color="text-cyan-400/60">
                  <TreeNode path="/api/cruise/signup" label="Signup" color="text-cyan-400/40" />
                  <TreeNode path="/api/cruise/cancel" label="Cancel" color="text-cyan-400/40" />
                  <TreeNode path="/api/cruise/count" label="Count" color="text-cyan-400/40" />
                </TreeNode>
                <TreeNode path="/api/admin" label="Admin APIs" color="text-red-400/60">
                  <TreeNode path="/api/admin/settings" label="Settings Store" color="text-red-400/40" />
                  <TreeNode path="/api/admin/shows" label="Show Picker" color="text-red-400/40" />
                  <TreeNode path="/api/admin/fans" label="Fan Analytics" color="text-red-400/40" />
                  <TreeNode path="/api/admin/newsletter" label="Newsletter" color="text-red-400/40" />
                  <TreeNode path="/api/admin/crew-alert" label="Crew Alert" color="text-red-400/40" />
                </TreeNode>
                <TreeNode path="/api/live" label="Live Streams" color="text-rose-400/60" />
                <TreeNode path="/api/feed" label="Social Feed" color="text-emerald-400/60" />
                <TreeNode path="/api/shopify" label="Shopify" color="text-green-400/60" />
                <TreeNode path="/api/email" label="Email Sender" color="text-blue-400/60" />
                <TreeNode path="/api/tour" label="Tour Dates" color="text-blue-400/60" />
              </div>
            </div>
          </div>
        </section>

        {/* ── VISUAL PAGE TREE ── */}
        <section className="mt-16 pt-14 border-t border-white/[0.06]">
          <div className="mb-10">
            <span className="inline-block text-[0.6rem] font-black uppercase tracking-[0.25em] text-purple-400 border border-purple-500/30 px-3 py-1 mb-4">Visual Hierarchy</span>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Page Tree</h2>
            <p className="text-white/30 text-sm">How every page connects — scroll horizontally to see the full tree.</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 mb-10 text-[0.6rem] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20 inline-block" /> Public</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Fan Account Required</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Crew Only</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Admin Only</span>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[920px]">

              {/* Root */}
              <div className="flex justify-center">
                <SiteNode href="/" label="HOME" sub="/" color="white" wide />
              </div>
              <BranchLine cols={6} />

              {/* Level 1 */}
              <div className="grid grid-cols-6 gap-3">
                <SiteNode href="/tour"   label="TOUR"    sub="/tour"    color="white" />
                <SiteNode href="/bio"    label="BIO"     sub="/bio"     color="white" />
                <SiteNode href="/video"  label="VIDEO"   sub="/video"   color="white" />
                <SiteNode href="/cruise" label="CRUISE"  sub="/cruise"  color="white" />
                <SiteNode href="/fans"   label="FAN HUB" sub="/fans"    color="purple" />
                <SiteNode href="/live"   label="LIVE"    sub="/live"    color="white" />
              </div>

              {/* Level 2 */}
              <div className="grid grid-cols-6 gap-3 mt-1">
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/shows/[id]" label="SHOW PAGE" sub="/shows/[id]" color="white" />
                  <VertLine />
                  <div className="flex flex-col gap-1 w-full">
                    <SiteNode href="/shows/[id]" label="WHO'S GOING" sub="attendees" color="purple" small />
                    <SiteNode href="/live/[room]" label="LIVE FEED" sub="if active" color="red" small />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/bio" label="BAND MEMBERS" sub="lineup" color="white" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/video" label="GALLERY" sub="music videos" color="white" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/cruise/cancel" label="CANCEL RSVP" sub="/cruise/cancel" color="white" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <div className="flex flex-col gap-1 w-full">
                    <SiteNode href="/fans" label="PROXIMITY" sub="shows near me" color="purple" small />
                    <SiteNode href="/fans" label="WHO'S GOING" sub="rsvp + attendees" color="purple" small />
                    <SiteNode href="/fans" label="VIP INBOX" sub="raffle + pins" color="purple" small />
                    <SiteNode href="/fans" label="LIVE ALERTS" sub="active streams" color="purple" small />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/live/[room]" label="STREAM" sub="/live/[room]" color="white" />
                  <VertLine />
                  <div className="flex flex-col gap-1 w-full">
                    <SiteNode href="/live/[room]" label="LIVE CHAT" sub="real-time" color="white" small />
                    <SiteNode href="/live/[room]" label="RAFFLE" sub="win & pin" color="purple" small />
                  </div>
                </div>
              </div>

              {/* Protected divider */}
              <div className="my-12 border-t border-white/[0.06] relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#050505] px-4 text-[0.55rem] uppercase tracking-widest text-white/20 font-bold">Protected Sections</span>
              </div>

              {/* Crew / Admin / Utilities */}
              <div className="grid grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                  <SiteNode href="/crew" label="CREW LOGIN" sub="/crew" color="red" wide />
                  <VertLine />
                  <SiteNode href="/crew" label="CREW DASHBOARD" sub="broadcast hub" color="red" wide />
                  <VertLine />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <SiteNode href="/crew" label="GO LIVE" sub="start stream" color="red" small />
                    <SiteNode href="/crew" label="RAFFLE" sub="manage raffles" color="red" small />
                    <SiteNode href="/crew" label="PIN VERIFY" sub="winner codes" color="red" small />
                    <SiteNode href="/crew" label="CHAT TOOLS" sub="pin messages" color="red" small />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <SiteNode href="/admin" label="ADMIN" sub="/admin" color="amber" wide />
                  <VertLine />
                  <SiteNode href="/admin" label="CONTENT PANEL" sub="manage site" color="amber" wide />
                  <VertLine />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <SiteNode href="/admin" label="TOUR DATES" sub="Sanity sync" color="amber" small />
                    <SiteNode href="/admin" label="ALERT BANNER" sub="site-wide msg" color="amber" small />
                    <SiteNode href="/admin" label="SYNC SHOWS" sub="/api/sync-shows" color="amber" small />
                    <SiteNode href="/admin" label="SUBSCRIBERS" sub="newsletter+SMS" color="amber" small />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <SiteNode href="/book" label="BOOK" sub="/book" color="white" wide />
                  <VertLine />
                  <SiteNode href="/book" label="EVENT PLANNER" sub="booking form" color="white" wide />
                  <VertLine />
                  <div className="flex flex-col gap-2 w-full">
                    <SiteNode href="/fan-photo-wall" label="FAN WALL" sub="/fan-photo-wall" color="white" />
                    <SiteNode href="/demo/proximity" label="PROXIMITY DEMO" sub="/demo/proximity" color="purple" />
                    <SiteNode href="/sitemap" label="SITE MAP" sub="/sitemap" color="white" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

// ── Tree sub-components ─────────────────────────────────────────────────────

function SiteNode({
  href, label, sub, color = "white", wide = false, small = false,
}: {
  href: string; label: string; sub?: string;
  color?: "white" | "purple" | "red" | "amber";
  wide?: boolean; small?: boolean;
}) {
  const colorMap = {
    white:  "border-white/[0.08] bg-white/[0.03] hover:border-white/20",
    purple: "border-purple-500/30 bg-purple-500/5 hover:border-purple-400/50",
    red:    "border-red-500/30 bg-red-500/5 hover:border-red-400/50",
    amber:  "border-amber-500/30 bg-amber-500/5 hover:border-amber-400/50",
  };
  const dotMap   = { white: "bg-white/20", purple: "bg-purple-500", red: "bg-red-500", amber: "bg-amber-500" };
  const textMap  = { white: "text-white/80", purple: "text-purple-300", red: "text-red-300", amber: "text-amber-300" };
  return (
    <a href={href} className={`flex flex-col items-center justify-center border transition-all text-center group w-full ${colorMap[color]} ${wide ? "px-6 py-3" : small ? "px-2 py-2" : "px-3 py-3"}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotMap[color]}`} />
        <span className={`text-[0.55rem] font-black uppercase tracking-widest leading-tight ${textMap[color]}`}>{label}</span>
      </div>
      {sub && <span className="text-[0.45rem] text-white/20 font-mono mt-0.5">{sub}</span>}
    </a>
  );
}

function VertLine() {
  return (
    <div className="flex flex-col items-center shrink-0 py-0.5">
      <div className="w-px h-4 bg-white/[0.08]" />
      <div className="w-1 h-1 rounded-full bg-white/[0.08]" />
      <div className="w-px h-2 bg-white/[0.08]" />
    </div>
  );
}

function BranchLine({ cols }: { cols: number }) {
  return (
    <div className="flex justify-around items-start py-3 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-white/[0.08]" />
      <div className="absolute top-3 bg-white/[0.08] h-px" style={{ left: `calc(100%/${cols}/2)`, right: `calc(100%/${cols}/2)` }} />
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="w-px h-3 bg-white/[0.08] mt-3" />
          <div className="w-1 h-1 rounded-full bg-white/[0.08]" />
          <div className="w-px h-2 bg-white/[0.08]" />
        </div>
      ))}
    </div>
  );
}
