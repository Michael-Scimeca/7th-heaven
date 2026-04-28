import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Map — 7th Heaven",
  description: "Full sitemap and page hierarchy for 7thHeavenBand.com",
};

export default function SiteMapPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-[72px] pb-24">
      <div className="site-container py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[0.65rem] font-black uppercase tracking-[0.25em] text-purple-400 border border-purple-500/30 px-4 py-1.5 mb-5">
            Platform Architecture
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Site Map</h1>
          <p className="text-white/40 text-base max-w-md mx-auto">
            Every page and how it connects — public, fan-only, and crew-only sections.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-5 mb-16 text-[0.65rem] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-white/25 inline-block" /> Public</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Fan Account Required</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Crew Only</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Admin Only</span>
        </div>

        {/* Tree — scrollable on small screens */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[960px]">

            {/* ROOT */}
            <div className="flex justify-center">
              <SiteNode href="/" label="HOME" sub="/" color="white" wide />
            </div>

            {/* Branch line to 6 children */}
            <BranchLine cols={6} />

            {/* LEVEL 1 */}
            <div className="grid grid-cols-6 gap-3">
              <SiteNode href="/tour"   label="TOUR"    sub="/tour"    color="white" />
              <SiteNode href="/bio"    label="BIO"     sub="/bio"     color="white" />
              <SiteNode href="/video"  label="VIDEO"   sub="/video"   color="white" />
              <SiteNode href="/cruise" label="CRUISE"  sub="/cruise"  color="white" />
              <SiteNode href="/fans"   label="FAN HUB" sub="/fans"    color="purple" />
              <SiteNode href="/live"   label="LIVE"    sub="/live"    color="white" />
            </div>

            {/* LEVEL 2 — children per column */}
            <div className="grid grid-cols-6 gap-3 mt-1">

              {/* Tour → Show Page */}
              <div className="flex flex-col items-center gap-1">
                <VertLine />
                <SiteNode href="/shows/[id]" label="SHOW PAGE" sub="/shows/[id]" color="white" />
                <VertLine />
                <div className="grid grid-cols-1 gap-1 w-full">
                  <SiteNode href="/shows/[id]" label="WHO'S GOING" sub="attendee list" color="purple" small />
                  <SiteNode href="/live/[room]" label="LIVE FEED"   sub="if crew is live" color="red" small />
                </div>
              </div>

              {/* Bio → Members */}
              <div className="flex flex-col items-center gap-1">
                <VertLine />
                <SiteNode href="/bio" label="BAND MEMBERS" sub="lineup section" color="white" />
              </div>

              {/* Video → Gallery */}
              <div className="flex flex-col items-center gap-1">
                <VertLine />
                <SiteNode href="/video" label="GALLERY" sub="music videos" color="white" />
              </div>

              {/* Cruise → Cancel */}
              <div className="flex flex-col items-center gap-1">
                <VertLine />
                <SiteNode href="/cruise/cancel" label="CANCEL RSVP" sub="/cruise/cancel" color="white" />
              </div>

              {/* Fan Hub children */}
              <div className="flex flex-col items-center gap-1">
                <VertLine />
                <div className="flex flex-col gap-1 w-full">
                  <SiteNode href="/fans" label="PROXIMITY" sub="shows near me" color="purple" small />
                  <SiteNode href="/fans" label="WHO'S GOING" sub="rsvp + attendees" color="purple" small />
                  <SiteNode href="/fans" label="VIP INBOX" sub="raffle wins + pins" color="purple" small />
                  <SiteNode href="/fans" label="LIVE ALERTS" sub="active streams" color="purple" small />
                </div>
              </div>

              {/* Live → Stream room */}
              <div className="flex flex-col items-center gap-1">
                <VertLine />
                <SiteNode href="/live/[room]" label="STREAM" sub="/live/[room]" color="white" />
                <VertLine />
                <div className="flex flex-col gap-1 w-full">
                  <SiteNode href="/live/[room]" label="LIVE CHAT"   sub="real-time chat"  color="white"  small />
                  <SiteNode href="/live/[room]" label="RAFFLE"      sub="win & pin"       color="purple" small />
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="my-14 border-t border-white/[0.06] relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#050505] px-4 text-[0.6rem] uppercase tracking-widest text-white/20 font-bold">Protected Sections</span>
            </div>

            {/* CREW / ADMIN / UTILITIES */}
            <div className="grid grid-cols-3 gap-8">

              {/* Crew */}
              <div className="flex flex-col items-center">
                <SiteNode href="/crew" label="CREW LOGIN" sub="/crew" color="red" wide />
                <VertLine />
                <SiteNode href="/crew" label="CREW DASHBOARD" sub="broadcast hub" color="red" wide />
                <VertLine />
                <div className="grid grid-cols-2 gap-2 w-full">
                  <SiteNode href="/crew" label="GO LIVE"     sub="start stream"    color="red" small />
                  <SiteNode href="/crew" label="RAFFLE"      sub="manage raffles"  color="red" small />
                  <SiteNode href="/crew" label="PIN VERIFY"  sub="winner codes"    color="red" small />
                  <SiteNode href="/crew" label="CHAT TOOLS"  sub="pin messages"    color="red" small />
                </div>
              </div>

              {/* Admin */}
              <div className="flex flex-col items-center">
                <SiteNode href="/admin" label="ADMIN" sub="/admin" color="amber" wide />
                <VertLine />
                <SiteNode href="/admin" label="CONTENT PANEL" sub="manage site" color="amber" wide />
                <VertLine />
                <div className="grid grid-cols-2 gap-2 w-full">
                  <SiteNode href="/admin" label="TOUR DATES"  sub="Sanity sync"      color="amber" small />
                  <SiteNode href="/admin" label="ALERT BANNER" sub="site-wide msg"   color="amber" small />
                  <SiteNode href="/admin" label="SYNC SHOWS"  sub="/api/sync-shows"  color="amber" small />
                  <SiteNode href="/admin" label="SUBSCRIBERS" sub="newsletter + SMS" color="amber" small />
                </div>
              </div>

              {/* Booking + Utilities */}
              <div className="flex flex-col items-center">
                <SiteNode href="/book" label="BOOK" sub="/book" color="white" wide />
                <VertLine />
                <SiteNode href="/book" label="EVENT PLANNER" sub="booking form" color="white" wide />
                <VertLine />
                <div className="flex flex-col gap-2 w-full">
                  <SiteNode href="/fan-wall"        label="FAN WALL"       sub="/fan-wall"        color="white" />
                  <SiteNode href="/demo/proximity"  label="PROXIMITY DEMO" sub="/demo/proximity"  color="purple" />
                  <SiteNode href="/sitemap"         label="SITE MAP"       sub="/sitemap"         color="white" />
                </div>
              </div>

            </div>

            {/* API Routes */}
            <div className="mt-16 p-6 bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[0.6rem] uppercase tracking-widest text-white/20 font-bold mb-4">API Surface</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "/api/proximity/shows",
                  "/api/proximity/profile",
                  "/api/proximity/attendees",
                  "/api/sync-shows",
                  "/api/live-rooms",
                  "/api/newsletter/subscribe",
                  "/api/sms/send",
                  "/api/admin/shows",
                  "/api/booking",
                  "/api/email",
                ].map((route) => (
                  <span key={route} className="font-mono text-[0.6rem] px-3 py-1.5 border border-white/[0.06] text-white/30 bg-white/[0.02]">{route}</span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────

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
    <a
      href={href}
      className={`flex flex-col items-center justify-center border transition-all text-center group w-full
        ${colorMap[color]}
        ${wide  ? "px-6 py-4" : small ? "px-2 py-2" : "px-3 py-3"}
      `}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotMap[color]}`} />
        <span className={`text-[0.58rem] font-black uppercase tracking-widest leading-tight ${textMap[color]}`}>{label}</span>
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
      {/* vertical stem down from root */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-white/[0.08]" />
      {/* horizontal bar */}
      <div className="absolute top-3 bg-white/[0.08] h-px" style={{ left: `calc(100%/${cols}/2)`, right: `calc(100%/${cols}/2)` }} />
      {/* vertical drops */}
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
