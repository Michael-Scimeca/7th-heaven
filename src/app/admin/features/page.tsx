"use client";

import { useState, useEffect } from "react";

interface Feature {
  id: string;
  name: string;
  description: string;
  status: "live" | "in-progress" | "planned" | "needs-api-key";
  category: "pages" | "components" | "integrations" | "infrastructure";
  apiKeysNeeded?: string[];
  notes?: string;
}

const features: Feature[] = [
  // ─── Pages ───
  {
    id: "home",
    name: "Homepage",
    description: "Hero section, featured videos, music player, about preview, tour dates preview",
    status: "live",
    category: "pages",
  },
  {
    id: "video",
    name: "Video Gallery",
    description: "10 categories, inline YouTube player, grayscale thumbnails, progress bars, featured latest releases section",
    status: "live",
    category: "pages",
  },
  {
    id: "tour",
    name: "Tour Dates",
    description: "Filterable tour schedule with search, category filters, and responsive table layout",
    status: "live",
    category: "pages",
  },
  {
    id: "bio",
    name: "Band Bio",
    description: "Band biography and member profiles",
    status: "live",
    category: "pages",
  },
  {
    id: "news",
    name: "News / Updates",
    description: "Latest band news and announcements",
    status: "live",
    category: "pages",
  },
  {
    id: "contact",
    name: "Contact Page",
    description: "Contact form and booking info",
    status: "live",
    category: "pages",
  },

  // ─── Components ───
  {
    id: "featured-videos",
    name: "Featured Videos Section",
    description: "Latest video hero (left) + 2×2 grid of recent videos (right) with progress bars and Play Video button",
    status: "live",
    category: "components",
  },
  {
    id: "video-nav",
    name: "Video Category Navigation",
    description: "Sticky category nav with flex-wrap on mobile, slash separators, flush left alignment",
    status: "live",
    category: "components",
  },
  {
    id: "music-player",
    name: "Audio Player",
    description: "Inline audio player for music tracks with play/pause, seek, and track list",
    status: "live",
    category: "components",
  },
  {
    id: "sms-signup",
    name: "SMS Text Alerts Signup",
    description: "Fans enter phone number + zip code to get text alerts about upcoming shows in their area",
    status: "needs-api-key",
    category: "components",
    apiKeysNeeded: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
    notes: "UI and API routes built. Add Twilio keys to .env.local to activate SMS sending.",
  },

  // ─── Integrations ───
  {
    id: "youtube-api",
    name: "YouTube Data API",
    description: "Fetches video metadata (view counts, durations) from YouTube",
    status: "needs-api-key",
    category: "integrations",
    apiKeysNeeded: ["YOUTUBE_API_KEY"],
    notes: "Move API key to .env.local for production security.",
  },
  {
    id: "twilio-sms",
    name: "Twilio SMS Integration",
    description: "Sends text message alerts to subscribers about nearby events. Handles opt-in/opt-out compliance (TCPA).",
    status: "needs-api-key",
    category: "integrations",
    apiKeysNeeded: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
    notes: "Routes: POST /api/sms/subscribe (sign up), POST /api/sms/send (blast by zip), DELETE /api/sms/send (opt-out)",
  },

  // ─── Infrastructure ───
  {
    id: "responsive-padding",
    name: "Global Responsive Padding",
    description: "32px mobile / 48px desktop standardized via site-container utility",
    status: "live",
    category: "infrastructure",
  },
  {
    id: "video-pagination",
    name: "Video Grid Pagination",
    description: "Load More button after 9 videos (3 rows). Official Music Videos has 30 entries.",
    status: "planned",
    category: "infrastructure",
  },
  {
    id: "image-optimization",
    name: "next/image Sizes Props",
    description: "Add sizes attributes to all images for better Core Web Vitals",
    status: "planned",
    category: "infrastructure",
  },
];

const statusConfig = {
  live: { label: "Live", color: "bg-emerald-500", textColor: "text-emerald-400" },
  "in-progress": { label: "In Progress", color: "bg-amber-500", textColor: "text-amber-400" },
  planned: { label: "Planned", color: "bg-blue-500", textColor: "text-blue-400" },
  "needs-api-key": { label: "Needs API Key", color: "bg-orange-500", textColor: "text-orange-400" },
};

const categoryLabels = {
  pages: "Pages",
  components: "Components",
  integrations: "Integrations",
  infrastructure: "Infrastructure",
};

export default function AdminFeaturesPage() {
  const [filter, setFilter] = useState<string>("all");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/sms/subscribe")
      .then((r) => r.json())
      .then((d) => setSubscriberCount(d.total))
      .catch(() => setSubscriberCount(0));
  }, []);

  const filtered = filter === "all" ? features : features.filter((f) => f.category === filter || f.status === filter);

  const stats = {
    total: features.length,
    live: features.filter((f) => f.status === "live").length,
    planned: features.filter((f) => f.status === "planned").length,
    needsKey: features.filter((f) => f.status === "needs-api-key").length,
  };

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="site-container py-16">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)]">
            Admin
          </span>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
            Website <span className="gradient-text">Features</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Overview of all features, integrations, and their current status.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Features", value: stats.total, accent: false },
            { label: "Live", value: stats.live, accent: true },
            { label: "Planned", value: stats.planned, accent: false },
            { label: "SMS Subscribers", value: subscriberCount ?? "—", accent: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-white/10 p-5"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-black ${stat.accent ? "text-[var(--color-accent)]" : "text-white"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: "all", label: "All" },
            { key: "pages", label: "Pages" },
            { key: "components", label: "Components" },
            { key: "integrations", label: "Integrations" },
            { key: "infrastructure", label: "Infrastructure" },
            { key: "needs-api-key", label: "Needs API Key" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`text-[0.65rem] font-bold uppercase tracking-[0.12em] px-4 py-2 border transition-all cursor-pointer ${
                filter === tab.key
                  ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feature list */}
        <div className="space-y-3">
          {filtered.map((feature) => {
            const sc = statusConfig[feature.status];
            return (
              <div
                key={feature.id}
                className="border border-white/10 p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${sc.color}`} />
                    <h3 className="text-[0.85rem] font-bold text-white">
                      {feature.name}
                    </h3>
                    <span className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-white/30 border border-white/10 px-2 py-0.5">
                      {categoryLabels[feature.category]}
                    </span>
                  </div>
                  <span className={`text-[0.6rem] font-bold uppercase tracking-[0.1em] ${sc.textColor} shrink-0`}>
                    {sc.label}
                  </span>
                </div>
                <p className="text-[0.75rem] text-white/50 leading-relaxed pl-5">
                  {feature.description}
                </p>
                {feature.apiKeysNeeded && (
                  <div className="mt-3 pl-5 flex flex-wrap gap-1.5">
                    {feature.apiKeysNeeded.map((key) => (
                      <code
                        key={key}
                        className="text-[0.6rem] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5"
                      >
                        {key}
                      </code>
                    ))}
                  </div>
                )}
                {feature.notes && (
                  <p className="text-[0.65rem] text-white/30 mt-2 pl-5 italic">
                    {feature.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* ENV setup guide */}
        <div className="mt-16 border border-white/10 p-8">
          <h2 className="text-lg font-bold text-white mb-4">
            🔑 Environment Setup
          </h2>
          <p className="text-sm text-white/50 mb-4">
            Create a <code className="text-[var(--color-accent)]">.env.local</code> file in the project root with:
          </p>
          <pre className="bg-white/5 border border-white/10 p-4 text-sm text-white/70 overflow-x-auto">
{`# YouTube
YOUTUBE_API_KEY=your_youtube_api_key

# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx`}
          </pre>
        </div>
      </div>
    </div>
  );
}
