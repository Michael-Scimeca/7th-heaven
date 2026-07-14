"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─────────── Type Definitions ─────────── */
interface PageNode {
  id: string;
  name: string;
  route: string;
  screenshot: string;
  category: "public" | "dashboard" | "admin" | "email" | "module";
  desc: string;
  sections: string[];
  col: number;
  row: number;
}

interface Connection {
  from: string;
  to: string;
  label?: string;
  type: "navigation" | "data" | "email" | "auth";
}

/* ─────────── All Pages ─────────── */
const pages: PageNode[] = [
  // ── Column 0: Public Entry Pages ──
  { id: "home", name: "Home", route: "/", screenshot: "/sitemap-screenshots/home.png", category: "public", desc: "The cinematic hero hub — video background, live stream banner, upcoming shows, tour map, music player, merch quick shop, photo gallery, and news feed.", sections: ["Hero Video", "Live Banner", "Shows Grid", "Tour Map", "Music Player", "Merch Row", "Photo Gallery", "News Feed"], col: 0, row: 0 },
  { id: "bio", name: "Band Bio", route: "/bio", screenshot: "/sitemap-screenshots/bio.png", category: "public", desc: "Full band biography with historical timeline, accolades, and origin story.", sections: ["History Timeline", "Band Story", "Accolades"], col: 0, row: 1 },
  { id: "members", name: "Band Members", route: "/members", screenshot: "/sitemap-screenshots/members.png", category: "public", desc: "Grid of all band members with headshots and links to individual profile pages.", sections: ["Member Cards", "Profile Links", "Headshot Gallery"], col: 0, row: 2 },
  { id: "video", name: "Video Gallery", route: "/video", screenshot: "/sitemap-screenshots/video.png", category: "public", desc: "Categorized video playlists with custom inline player and 16:9 thumbnail grids.", sections: ["Playlist Tabs", "Inline Player", "Thumbnail Grid"], col: 0, row: 3 },
  { id: "news", name: "News", route: "/news", screenshot: "/sitemap-screenshots/news.png", category: "public", desc: "Sanity CMS-powered news articles and band announcements.", sections: ["Article Feed", "CMS Integration"], col: 0, row: 4 },
  { id: "contact", name: "Contact", route: "/contact", screenshot: "/sitemap-screenshots/contact.png", category: "public", desc: "Contact form with social media links and band email.", sections: ["Contact Form", "Social Links", "Band Email"], col: 0, row: 5 },

  // ── Column 1: Conversion Pages ──
  { id: "store", name: "Merch Store", route: "/store", screenshot: "/sitemap-screenshots/store.png", category: "public", desc: "Shopify Storefront API product catalog with headless cart system and checkout.", sections: ["Product Grid", "Cart System", "Headless Checkout", "Variant Selectors"], col: 1, row: 0 },
  { id: "book", name: "Book the Band", route: "/book", screenshot: "/sitemap-screenshots/book.png", category: "public", desc: "Multi-step booking form with event type selection, date picker, production options, and inline account creation.", sections: ["Multi-Step Form", "Event Types", "Date Picker", "Production Extras", "Account Creation"], col: 1, row: 1 },
  { id: "cruise", name: "Cruise Landing", route: "/cruise", screenshot: "/sitemap-screenshots/cruise.png", category: "public", desc: "Caribbean cruise landing page with hero, itinerary, FAQ, interest signup, and live fan counter.", sections: ["Cinematic Hero", "Day-by-Day Itinerary", "Interest Signup", "Live Counter", "FAQ Accordion", "Community Opt-In"], col: 1, row: 2 },
  { id: "live", name: "Live Streams", route: "/live", screenshot: "/sitemap-screenshots/live.png", category: "public", desc: "Real-time LiveKit WebRTC streaming hub with active broadcast gallery and auto-cleanup of stale feeds.", sections: ["Broadcast Gallery", "Stream Detection", "Auto-Cleanup"], col: 1, row: 3 },
  { id: "features", name: "Features", route: "/features", screenshot: "/sitemap-screenshots/features.png", category: "public", desc: "Platform features overview showcasing technical capabilities and fan experience tools.", sections: ["Feature Cards", "Tech Highlights"], col: 1, row: 4 },
  { id: "privacy", name: "Privacy Policy", route: "/privacy", screenshot: "/sitemap-screenshots/privacy.png", category: "public", desc: "Data collection policies, cookie policy, and user rights.", sections: ["Data Collection", "Cookie Policy", "User Rights"], col: 1, row: 5 },
  { id: "terms", name: "Terms of Service", route: "/terms", screenshot: "/sitemap-screenshots/terms.png", category: "public", desc: "Usage terms, liability limitations, and account rules.", sections: ["Usage Terms", "Liability", "Account Rules"], col: 1, row: 6 },

  // ── Column 2: Authenticated Dashboards ──
  { id: "fans", name: "Fan Dashboard", route: "/fans", screenshot: "/sitemap-screenshots/fans.png", category: "dashboard", desc: "Personal fan hub with SMS alert opt-in, proximity show alerts, prize wallet, referral QR codes, photo submissions, and pick awards.", sections: ["SMS Opt-In", "Proximity Alerts", "Prize Wallet", "Referral QR", "Photo Submissions", "Pick Awards", "Profile Settings"], col: 2, row: 0 },
  { id: "planner", name: "Planner Dashboard", route: "/planner", screenshot: "/sitemap-screenshots/planner.png", category: "dashboard", desc: "Event planner portal for tracking booking status, editing checklists, and managing event details.", sections: ["Booking Tracker", "Event Details", "Checklist Editor", "Re-Book Flow", "Login/Signup Gate"], col: 2, row: 1 },
  { id: "cruise_dash", name: "Cruise Dashboard", route: "/cruise/dashboard", screenshot: "/sitemap-screenshots/cruise-dashboard.png", category: "dashboard", desc: "Passenger lounge with important updates, cruise chat, day-by-day itinerary, embarkation countdown, and booking manager.", sections: ["Admin Updates", "Cruise Chat", "Itinerary View", "Countdown Timer", "Passenger Widget", "Important Links"], col: 2, row: 2 },
  { id: "cruise_verify", name: "Cruise PIN Verify", route: "/cruise/verify", screenshot: "/sitemap-screenshots/cruise-verify.png", category: "dashboard", desc: "6-digit PIN verification gate for cruise passengers — ocean-themed UI with animated waves, auto-advancing inputs, paste support, resend code, and redirect to cruise dashboard on success.", sections: ["6-Digit PIN Input", "Progress Bar", "Resend Code", "Auto-Redirect", "Error Shake"], col: 2, row: 3 },
  { id: "crew", name: "Crew Dashboard", route: "/crew", screenshot: "/sitemap-screenshots/crew.png", category: "dashboard", desc: "Crew broadcast studio with live streaming controls, chat moderation, interactive raffle engine, and flash merch drops.", sections: ["Broadcast Studio", "Live Chat", "Raffle Engine", "Flash Drops", "Fan Management"], col: 2, row: 4 },
  { id: "admin", name: "Admin Command", route: "/admin", screenshot: "/sitemap-screenshots/admin.png", category: "admin", desc: "Master operations center — band announcements, analytics, Shopify sales, booking approval, live streams, photo moderation, SMS blasts, community registry, and audit log.", sections: ["Band Announcements", "Analytics", "Shopify Sales", "Booking Approval", "Live Streams", "Photo Moderation", "SMS Blasts", "Community Registry", "Audit Log", "Cruise Tab"], col: 2, row: 5 },
  { id: "claim", name: "Raffle Prize Claim", route: "/claim/[pin]", screenshot: "/sitemap-screenshots/claim.png", category: "dashboard", desc: "Redemption portal for raffle winners — size selection, dynamic QR code verification, single-use security block, and manual hand-off validation.", sections: ["PIN Verification", "Prize Details", "Size Selection", "Redemption Hand-Off"], col: 2, row: 6 },

  // ── Column 3: Admin Tools & Email Templates ──
  { id: "admin_emails", name: "Email Templates", route: "/admin/emails", screenshot: "/sitemap-screenshots/admin-emails.png", category: "email", desc: "Visual email template editor with live HTML preview, code view, test send, and 14 templates covering booking, account, cruise, live stream, and newsletter.", sections: ["Template Sidebar", "Live Preview", "Code View", "Send Test", "14 Templates"], col: 3, row: 0 },
  { id: "admin_emailmap", name: "Email Map", route: "/admin/email-map", screenshot: "/sitemap-screenshots/admin-emailmap.png", category: "email", desc: "Visual architecture map showing how email templates connect to API triggers and user flows.", sections: ["Flow Diagram", "Trigger Mapping", "Template Links"], col: 3, row: 1 },
  { id: "admin_checklist", name: "Admin Checklist", route: "/admin/checklist", screenshot: "/sitemap-screenshots/admin-checklist.png", category: "admin", desc: "Pre-launch and maintenance checklist for platform health, security, and deployment status.", sections: ["Launch Status", "Security Checks", "Deployment Health"], col: 3, row: 2 },
  { id: "admin_legal", name: "Legal Compliance", route: "/admin/legal", screenshot: "/sitemap-screenshots/admin-legal.png", category: "admin", desc: "TCPA SMS rules, music performance rights, Shopify PCI security, COPPA chat rules, and ADA accessibility checklist.", sections: ["TCPA Rules", "Music Rights", "PCI Security", "COPPA", "ADA Accessibility"], col: 3, row: 3 },
];

/* ─────────── Connection Map ─────────── */
const connections: Connection[] = [
  // Navigation flows
  { from: "home", to: "store", label: "Merch Quick Shop", type: "navigation" },
  { from: "live", to: "claim", label: "Raffle Win Flow", type: "navigation" },
  { from: "claim", to: "store", label: "Shopify Checkout Link", type: "navigation" },
  { from: "home", to: "live", label: "Live Banner Link", type: "navigation" },
  { from: "home", to: "video", label: "Video Section", type: "navigation" },
  { from: "home", to: "news", label: "News Feed", type: "navigation" },
  { from: "home", to: "members", label: "Band Section", type: "navigation" },
  { from: "home", to: "cruise", label: "Cruise Promo", type: "navigation" },
  { from: "home", to: "bio", label: "About Link", type: "navigation" },
  { from: "members", to: "bio", label: "Profile Links", type: "navigation" },

  // Auth / Signup flows
  { from: "home", to: "fans", label: "Fan Sign-Up", type: "auth" },
  { from: "book", to: "planner", label: "Account Created", type: "auth" },
  { from: "cruise", to: "cruise_verify", label: "Enter PIN", type: "auth" },
  { from: "cruise_verify", to: "cruise_dash", label: "PIN Verified", type: "auth" },
  { from: "live", to: "fans", label: "Fan Interaction", type: "auth" },
  { from: "fans", to: "crew", label: "Crew Promotion", type: "auth" },

  // Data flows
  { from: "store", to: "admin", label: "Sales Data", type: "data" },
  { from: "book", to: "admin", label: "Booking Request", type: "data" },
  { from: "cruise", to: "admin", label: "Cruise Interest", type: "data" },
  { from: "fans", to: "admin", label: "Fan Registry", type: "data" },
  { from: "crew", to: "admin", label: "Stream Reports", type: "data" },
  { from: "cruise_dash", to: "admin", label: "Passenger Data", type: "data" },
  { from: "planner", to: "admin", label: "Booking Status", type: "data" },
  { from: "crew", to: "live", label: "Go Live", type: "data" },

  // Email triggers
  { from: "book", to: "admin_emails", label: "Booking Emails", type: "email" },
  { from: "cruise", to: "admin_emails", label: "Cruise Invite", type: "email" },
  { from: "admin", to: "admin_emails", label: "Admin Alerts", type: "email" },
  { from: "fans", to: "admin_emails", label: "Welcome Email", type: "email" },
  { from: "admin_emails", to: "admin_emailmap", label: "Template Map", type: "email" },

  // Admin tool links
  { from: "admin", to: "admin_checklist", label: "Launch Checks", type: "navigation" },
  { from: "admin", to: "admin_legal", label: "Compliance", type: "navigation" },
  { from: "admin", to: "admin_emails", label: "Email Editor", type: "navigation" },
];

/* ─────────── Color Schemes ─────────── */
const categoryStyles: Record<string, { border: string; activeBorder: string; glow: string; bg: string; text: string; badge: string }> = {
  public: { border: "border-cyan-500/20", activeBorder: "border-cyan-400", glow: "shadow-[0_0_30px_rgba(34,211,238,0.25)]", bg: "bg-cyan-500/5", text: "text-cyan-400", badge: "bg-cyan-500/20 text-cyan-300" },
  dashboard: { border: "border-violet-500/20", activeBorder: "border-violet-400", glow: "shadow-[0_0_30px_rgba(139,92,246,0.25)]", bg: "bg-violet-500/5", text: "text-violet-400", badge: "bg-violet-500/20 text-violet-300" },
  admin: { border: "border-rose-500/20", activeBorder: "border-rose-400", glow: "shadow-[0_0_30px_rgba(244,63,94,0.25)]", bg: "bg-rose-500/5", text: "text-rose-400", badge: "bg-rose-500/20 text-rose-300" },
  email: { border: "border-amber-500/20", activeBorder: "border-amber-400", glow: "shadow-[0_0_30px_rgba(245,158,11,0.25)]", bg: "bg-amber-500/5", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-300" },
  module: { border: "border-emerald-500/20", activeBorder: "border-emerald-400", glow: "shadow-[0_0_30px_rgba(16,185,129,0.25)]", bg: "bg-emerald-500/5", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
};

const connectionColors: Record<string, { stroke: string; activeStroke: string }> = {
  navigation: { stroke: "rgba(255,255,255,0.06)", activeStroke: "rgba(34,211,238,0.6)" },
  data: { stroke: "rgba(255,255,255,0.06)", activeStroke: "rgba(16,185,129,0.6)" },
  email: { stroke: "rgba(255,255,255,0.06)", activeStroke: "rgba(245,158,11,0.6)" },
  auth: { stroke: "rgba(255,255,255,0.06)", activeStroke: "rgba(139,92,246,0.6)" },
};

/* ─────────── Component ─────────── */
export default function VisualSitemapPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number; y: number; w: number; h: number }>>({});

  const measureCards = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const positions: Record<string, { x: number; y: number; w: number; h: number }> = {};
    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      positions[id] = {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        w: rect.width,
        h: rect.height,
      };
    });
    setCardPositions(positions);
  }, []);

  useEffect(() => {
    measureCards();
    window.addEventListener("resize", measureCards);
    const timeout = setTimeout(measureCards, 500);
    return () => {
      window.removeEventListener("resize", measureCards);
      clearTimeout(timeout);
    };
  }, [measureCards]);

  const isConnected = (nodeId: string) => {
    if (!hoveredId) return true;
    if (nodeId === hoveredId) return true;
    return connections.some(c => (c.from === hoveredId && c.to === nodeId) || (c.to === hoveredId && c.from === nodeId));
  };

  const isConnectionActive = (conn: Connection) => {
    if (!hoveredId) return false;
    return conn.from === hoveredId || conn.to === hoveredId;
  };

  const lightboxPage = lightboxId ? pages.find(p => p.id === lightboxId) : null;

  // Group pages by category for the legend
  const categories = [
    { key: "public", label: "Public Pages", icon: "🌐" },
    { key: "dashboard", label: "Dashboards", icon: "📊" },
    { key: "admin", label: "Admin Tools", icon: "🔧" },
    { key: "email", label: "Email Templates", icon: "📧" },
  ];

  const connTypes = [
    { key: "navigation", label: "Page Navigation", color: "bg-cyan-400" },
    { key: "auth", label: "Auth / Signup Flow", color: "bg-violet-400" },
    { key: "data", label: "Data Pipeline", color: "bg-emerald-400" },
    { key: "email", label: "Email Trigger", color: "bg-amber-400" },
  ];

  return (
    <main className="min-h-screen bg-[rgb(8,8,12)] pt-28 pb-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600 opacity-[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600 opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-600 opacity-[0.015] blur-[200px] rounded-full pointer-events-none" />

      {/* Animated dash keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dashFlow {
          to { stroke-dashoffset: -24; }
        }
        .dash-animate {
          animation: dashFlow 1s linear infinite;
        }
      `}} />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-3">
            <span className="text-[var(--color-accent)]">Visual</span> Connection Map
          </h1>
          <p className="text-white/35 uppercase tracking-[0.2em] text-xs md:text-sm max-w-3xl mx-auto mb-6">
            Every page, dashboard, module, and email template — and how they all connect.
          </p>

          {/* Links to other views */}
          <div className="flex justify-center gap-4 mb-8">
            <Link href="/sitemap" className="inline-flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest hover:text-white/60 transition-colors">
              📋 Directory Sitemap
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/sitemap/flowchart" className="inline-flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest hover:text-white/60 transition-colors">
              🗺️ Flowchart Sitemap
            </Link>
          </div>
        </header>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex flex-wrap gap-3 items-center">
            {categories.map(cat => (
              <span key={cat.key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider border ${categoryStyles[cat.key].border} ${categoryStyles[cat.key].bg} ${categoryStyles[cat.key].text}`}>
                {cat.icon} {cat.label}
              </span>
            ))}
          </div>
          <div className="w-px h-6 bg-white/10 self-center hidden md:block" />
          <div className="flex flex-wrap gap-3 items-center">
            {connTypes.map(ct => (
              <span key={ct.key} className="inline-flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-white/40">
                <span className={`w-3 h-0.5 rounded-full ${ct.color}`} />
                {ct.label}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive instruction */}
        <div className="text-center mb-8">
          <p className="text-white/20 text-[0.6rem] uppercase tracking-[0.3em] font-black animate-pulse">
            💡 Hover any card to highlight connections • Click screenshot to expand
          </p>
        </div>

        {/* ═══════════ Main Grid with SVG Overlay ═══════════ */}
        <div ref={containerRef} className="relative">
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]" style={{ overflow: "visible" }}>
            {connections.map((conn, idx) => {
              const from = cardPositions[conn.from];
              const to = cardPositions[conn.to];
              if (!from || !to) return null;

              const active = isConnectionActive(conn);
              const colors = connectionColors[conn.type];

              // Connect from right edge of source to left edge of target
              const x1 = from.x + from.w;
              const y1 = from.y + from.h / 2;
              const x2 = to.x;
              const y2 = to.y + to.h / 2;

              // If target is to the left, connect from left edge of source
              let sx1 = x1, sy1 = y1, sx2 = x2, sy2 = y2;
              if (x2 < from.x) {
                sx1 = from.x;
                sx2 = to.x + to.w;
              }
              // If same column, connect bottom to top
              if (Math.abs(from.x - to.x) < 50) {
                sx1 = from.x + from.w / 2;
                sy1 = from.y + from.h;
                sx2 = to.x + to.w / 2;
                sy2 = to.y;
              }

              const dx = (sx2 - sx1) * 0.4;
              const d = `M ${sx1} ${sy1} C ${sx1 + dx} ${sy1}, ${sx2 - dx} ${sy2}, ${sx2} ${sy2}`;

              return (
                <g key={idx}>
                  <path d={d} fill="none" stroke={active ? colors.activeStroke : colors.stroke} strokeWidth={active ? 2.5 : 1} className={active ? "dash-animate" : ""} style={active ? { strokeDasharray: "8, 4" } : undefined} />
                  {active && conn.label && (
                    <text x={(sx1 + sx2) / 2} y={(sy1 + sy2) / 2 - 8} textAnchor="middle" fill="white" fillOpacity={0.5} fontSize={9} fontWeight="bold" className="uppercase">{conn.label}</text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Grid Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {/* Column 0: Public Entry Pages */}
            <div className="space-y-3">
              <h2 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-cyan-400/60 mb-4 pb-2 border-b border-cyan-500/10">🌐 Public Pages</h2>
              {pages.filter(p => p.col === 0).map(page => {
                const style = categoryStyles[page.category];
                const connected = isConnected(page.id);
                const isHovered = hoveredId === page.id;
                return (
                  <div
                    key={page.id}
                    ref={(el) => { cardRefs.current[page.id] = el; }}
                    className={`group relative rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer ${
                      isHovered ? `${style.activeBorder} ${style.glow} scale-[1.02]` :
                      !connected ? "opacity-15 grayscale scale-[0.98]" :
                      `${style.border} hover:${style.activeBorder}`
                    } ${style.bg}`}
                    onMouseEnter={() => setHoveredId(page.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Screenshot thumbnail */}
                    <div className="relative w-full h-[120px] overflow-hidden bg-black/40 cursor-zoom-in" onClick={() => setLightboxId(page.id)}>
                      <Image src={page.screenshot} alt={page.name} fill className="object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" sizes="300px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                        <h3 className={`text-sm font-black uppercase tracking-wide ${style.text}`}>{page.name}</h3>
                        <span className="text-[0.5rem] font-mono px-1.5 py-0.5 rounded bg-black/50 text-white/50">{page.route}</span>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="text-[0.6rem] text-white/40 leading-relaxed line-clamp-2">{page.desc}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {page.sections.slice(0, 4).map((s, i) => (
                          <span key={i} className={`text-[0.5rem] px-1.5 py-0.5 rounded ${style.badge} font-semibold`}>{s}</span>
                        ))}
                        {page.sections.length > 4 && <span className="text-[0.5rem] text-white/30">+{page.sections.length - 4}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column 1: Conversion / Functional Pages */}
            <div className="space-y-3">
              <h2 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-cyan-400/60 mb-4 pb-2 border-b border-cyan-500/10">🎯 Conversion Pages</h2>
              {pages.filter(p => p.col === 1).map(page => {
                const style = categoryStyles[page.category];
                const connected = isConnected(page.id);
                const isHovered = hoveredId === page.id;
                return (
                  <div
                    key={page.id}
                    ref={(el) => { cardRefs.current[page.id] = el; }}
                    className={`group relative rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer ${
                      isHovered ? `${style.activeBorder} ${style.glow} scale-[1.02]` :
                      !connected ? "opacity-15 grayscale scale-[0.98]" :
                      `${style.border} hover:${style.activeBorder}`
                    } ${style.bg}`}
                    onMouseEnter={() => setHoveredId(page.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative w-full h-[120px] overflow-hidden bg-black/40 cursor-zoom-in" onClick={() => setLightboxId(page.id)}>
                      <Image src={page.screenshot} alt={page.name} fill className="object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" sizes="300px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                        <h3 className={`text-sm font-black uppercase tracking-wide ${style.text}`}>{page.name}</h3>
                        <span className="text-[0.5rem] font-mono px-1.5 py-0.5 rounded bg-black/50 text-white/50">{page.route}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[0.6rem] text-white/40 leading-relaxed line-clamp-2">{page.desc}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {page.sections.slice(0, 4).map((s, i) => (
                          <span key={i} className={`text-[0.5rem] px-1.5 py-0.5 rounded ${style.badge} font-semibold`}>{s}</span>
                        ))}
                        {page.sections.length > 4 && <span className="text-[0.5rem] text-white/30">+{page.sections.length - 4}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column 2: Authenticated Dashboards */}
            <div className="space-y-3">
              <h2 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-violet-400/60 mb-4 pb-2 border-b border-violet-500/10">📊 Dashboards</h2>
              {pages.filter(p => p.col === 2).map(page => {
                const style = categoryStyles[page.category];
                const connected = isConnected(page.id);
                const isHovered = hoveredId === page.id;
                return (
                  <div
                    key={page.id}
                    ref={(el) => { cardRefs.current[page.id] = el; }}
                    className={`group relative rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer ${
                      isHovered ? `${style.activeBorder} ${style.glow} scale-[1.02]` :
                      !connected ? "opacity-15 grayscale scale-[0.98]" :
                      `${style.border} hover:${style.activeBorder}`
                    } ${style.bg}`}
                    onMouseEnter={() => setHoveredId(page.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative w-full h-[120px] overflow-hidden bg-black/40 cursor-zoom-in" onClick={() => setLightboxId(page.id)}>
                      <Image src={page.screenshot} alt={page.name} fill className="object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" sizes="300px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                        <h3 className={`text-sm font-black uppercase tracking-wide ${style.text}`}>{page.name}</h3>
                        <span className="text-[0.5rem] font-mono px-1.5 py-0.5 rounded bg-black/50 text-white/50">{page.route}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[0.6rem] text-white/40 leading-relaxed line-clamp-2">{page.desc}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {page.sections.slice(0, 4).map((s, i) => (
                          <span key={i} className={`text-[0.5rem] px-1.5 py-0.5 rounded ${style.badge} font-semibold`}>{s}</span>
                        ))}
                        {page.sections.length > 4 && <span className="text-[0.5rem] text-white/30">+{page.sections.length - 4}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column 3: Admin Tools & Email Templates */}
            <div className="space-y-3">
              <h2 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-amber-400/60 mb-4 pb-2 border-b border-amber-500/10">📧 Admin & Email Tools</h2>
              {pages.filter(p => p.col === 3).map(page => {
                const style = categoryStyles[page.category];
                const connected = isConnected(page.id);
                const isHovered = hoveredId === page.id;
                return (
                  <div
                    key={page.id}
                    ref={(el) => { cardRefs.current[page.id] = el; }}
                    className={`group relative rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer ${
                      isHovered ? `${style.activeBorder} ${style.glow} scale-[1.02]` :
                      !connected ? "opacity-15 grayscale scale-[0.98]" :
                      `${style.border} hover:${style.activeBorder}`
                    } ${style.bg}`}
                    onMouseEnter={() => setHoveredId(page.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative w-full h-[120px] overflow-hidden bg-black/40 cursor-zoom-in" onClick={() => setLightboxId(page.id)}>
                      <Image src={page.screenshot} alt={page.name} fill className="object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" sizes="300px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                        <h3 className={`text-sm font-black uppercase tracking-wide ${style.text}`}>{page.name}</h3>
                        <span className="text-[0.5rem] font-mono px-1.5 py-0.5 rounded bg-black/50 text-white/50">{page.route}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[0.6rem] text-white/40 leading-relaxed line-clamp-2">{page.desc}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {page.sections.slice(0, 4).map((s, i) => (
                          <span key={i} className={`text-[0.5rem] px-1.5 py-0.5 rounded ${style.badge} font-semibold`}>{s}</span>
                        ))}
                        {page.sections.length > 4 && <span className="text-[0.5rem] text-white/30">+{page.sections.length - 4}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════ Detail Panel ═══════════ */}
        <div className="mt-10 p-6 bg-white/[0.02] border border-white/5 rounded-2xl min-h-[100px] transition-all duration-300">
          {hoveredId ? (() => {
            const page = pages.find(p => p.id === hoveredId);
            if (!page) return null;
            const style = categoryStyles[page.category];
            const outgoing = connections.filter(c => c.from === hoveredId);
            const incoming = connections.filter(c => c.to === hoveredId);
            return (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-black uppercase tracking-widest ${style.text}`}>{page.name}</h3>
                    <span className="text-[0.55rem] font-mono px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/5">{page.route}</span>
                    <span className={`text-[0.5rem] px-2 py-0.5 rounded font-bold uppercase ${style.badge}`}>{page.category}</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed mb-3">{page.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {page.sections.map((s, i) => (
                      <span key={i} className={`text-[0.55rem] px-2 py-0.5 rounded ${style.badge} font-semibold`}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className="w-px bg-white/5 hidden md:block" />
                <div className="md:w-[280px] space-y-3">
                  {outgoing.length > 0 && (
                    <div>
                      <p className="text-[0.55rem] font-black uppercase tracking-widest text-white/30 mb-1.5">Sends To →</p>
                      {outgoing.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-[0.6rem] text-white/50 py-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${connectionColors[c.type].activeStroke === "rgba(34,211,238,0.6)" ? "bg-cyan-400" : connectionColors[c.type].activeStroke === "rgba(16,185,129,0.6)" ? "bg-emerald-400" : connectionColors[c.type].activeStroke === "rgba(245,158,11,0.6)" ? "bg-amber-400" : "bg-violet-400"}`} />
                          <span className="font-bold text-white/70">{pages.find(p => p.id === c.to)?.name}</span>
                          {c.label && <span className="text-white/30">— {c.label}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {incoming.length > 0 && (
                    <div>
                      <p className="text-[0.55rem] font-black uppercase tracking-widest text-white/30 mb-1.5">← Receives From</p>
                      {incoming.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-[0.6rem] text-white/50 py-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${connectionColors[c.type].activeStroke === "rgba(34,211,238,0.6)" ? "bg-cyan-400" : connectionColors[c.type].activeStroke === "rgba(16,185,129,0.6)" ? "bg-emerald-400" : connectionColors[c.type].activeStroke === "rgba(245,158,11,0.6)" ? "bg-amber-400" : "bg-violet-400"}`} />
                          <span className="font-bold text-white/70">{pages.find(p => p.id === c.from)?.name}</span>
                          {c.label && <span className="text-white/30">— {c.label}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })() : (
            <div className="text-center text-white/20 text-[0.6rem] py-4 uppercase tracking-[0.3em] font-black animate-pulse">
              💡 Hover over any card to see its connections, sections, and data flows across the platform.
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-center">
          {[
            { value: pages.filter(p => p.category === "public").length, label: "Public Pages", color: "text-cyan-400" },
            { value: pages.filter(p => p.category === "dashboard").length, label: "Dashboards", color: "text-violet-400" },
            { value: pages.filter(p => p.category === "admin").length, label: "Admin Tools", color: "text-rose-400" },
            { value: pages.filter(p => p.category === "email").length, label: "Email Systems", color: "text-amber-400" },
            { value: connections.length, label: "Connections", color: "text-white/60" },
          ].map((stat, i) => (
            <div key={i} className="px-4">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[0.55rem] uppercase tracking-widest text-white/30 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ Lightbox Modal ═══════════ */}
      {lightboxPage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setLightboxId(null)}>
          <div className="max-w-5xl w-full max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightboxId(null)} className="absolute -top-10 right-0 text-white/40 hover:text-white text-sm uppercase tracking-widest font-bold cursor-pointer">✕ Close</button>
            <div className="bg-[rgb(12,12,18)] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className={`text-lg font-black uppercase tracking-widest ${categoryStyles[lightboxPage.category].text}`}>{lightboxPage.name}</h3>
                  <span className="text-xs font-mono text-white/40">{lightboxPage.route}</span>
                </div>
                <Link href={lightboxPage.route} className="text-xs uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors font-bold">
                  Visit Page →
                </Link>
              </div>
              <div className="relative w-full overflow-auto max-h-[75vh]">
                <Image src={lightboxPage.screenshot} alt={lightboxPage.name} width={1470} height={900} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
