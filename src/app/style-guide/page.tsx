"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Logo from "@/components/Logo";
import { PageNav } from "@/components/PageNav";
import ScrollToTop from "@/components/ScrollToTop";
import { GrainOverlay } from "@/components/GrainOverlay";
import CursorFollower from "@/components/CursorFollower";
import CustomScrollbar from "@/components/CustomScrollbar";
import { DevPerformancePanel } from "@/components/DevPerformancePanel";
import Preloader from "@/components/Preloader";

import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveStatusSign from "@/components/LiveStatusSign";
import RoleBadge from "@/components/RoleBadge";
import CountdownTimer from "@/components/CountdownTimer";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { EmergencyBroadcastCenter } from "@/components/EmergencyBroadcastCenter";
import ProximityNotify from "@/components/ProximityNotify";
import ProximityPanel from "@/components/ProximityPanel";

import FeaturedTrack from "@/components/FeaturedTrack";
import HeroAlbumPlayer from "@/components/HeroAlbumPlayer";
import VinylHeroPlayer from "@/components/VinylHeroPlayer";
import AudioPlayerSection from "@/components/AudioPlayer";

import HeroVideoPlayer from "@/components/HeroVideoPlayer";
import VideoSection from "@/components/VideoSection";
import InlineYTPlayer from "@/components/InlineYTPlayer";
import CustomYTPlayer from "@/components/CustomYTPlayer";
import BehindTheScenes from "@/components/BehindTheScenes";

import HeroLiveHub from "@/components/HeroLiveHub";
import HeroLiveThumbs from "@/components/HeroLiveThumbs";
import { FakeLiveStream } from "@/components/FakeLiveStream";
import LiveShowFeed from "@/components/LiveShowFeed";

import HeroUpcomingShows from "@/components/HeroUpcomingShows";
import TourList from "@/components/TourList";
import { CalendarPicker } from "@/components/CalendarPicker";
import ShowCrewPanel from "@/components/ShowCrewPanel";

import HomeMerch from "@/components/HomeMerch";

import CruiseHistoryTimeline from "@/components/CruiseHistoryTimeline";
import CruiseSnakeItinerary from "@/components/CruiseSnakeItinerary";
import CruiseVideoGallery from "@/components/CruiseVideoGallery";

import CruiseWaveAnimation from "@/components/CruiseWaveAnimation";
import CruiseChat from "@/components/CruiseChat";
import {
  EmbarkationCountdown,
  DailyPoll,
  OriginStats,
  PhotoWall,
  ImportantLinksWidget,
  SongRequestLeaderboard,
  CaptainsLog,
  ExcursionTeasers,
} from "@/components/CruiseWidgets";

import { NewsHeroLayouts } from "@/components/NewsHeroLayouts";
import AccomplishmentsLayouts from "@/components/AccomplishmentsLayouts";
import BioParallaxSlider from "@/components/BioParallaxSlider";
import PickAwardsSection from "@/components/PickAwardsSection";

import FanUploadForm from "@/components/FanUploadForm";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import LoginModal from "@/components/LoginModal";
import DirectMessageChat from "@/components/DirectMessageChat";
import AdminFeedPost from "@/components/AdminFeedPost";

import MemberDashboard from "@/components/MemberDashboard";
import { CrewDashboard } from "@/components/CrewDashboard";
import CrewFeed from "@/components/CrewFeed";
import { CrewHQ } from "@/components/CrewHQ";
import { CrewSetPasswordModal } from "@/components/CrewSetPasswordModal";
import PlannerDashboard from "@/components/PlannerDashboard";

import AwardPicksPanel from "@/components/admin/AwardPicksPanel";
import BulkInvitePanel from "@/components/admin/BulkInvitePanel";
import InviteChallengePanel from "@/components/admin/InviteChallengePanel";
import ReferralProgramPanel from "@/components/admin/ReferralProgramPanel";
import { RoleEmailDirectory } from "@/components/admin/RoleEmailDirectory";

const TourMap = dynamic(() => import("@/components/TourMap"), { ssr: false });
const AdminMap = dynamic(() => import("@/components/AdminMap"), { ssr: false });

/* ─────────────────────────────────────────────
   Token Map — auto-read from CSS custom props
   ───────────────────────────────────────────── */

const bgScale = [
  { token: "--color-bg-primary", label: "Primary", hex: "#f5f8ff" },
  { token: "--color-bg-deep", label: "Deep", hex: "#eef3fc" },
  { token: "--color-bg-surface", label: "Surface", hex: "#f5f8ff" },
  { token: "--color-bg-card", label: "Card", hex: "#eaf0fa" },
  { token: "--color-bg-elevated", label: "Elevated", hex: "#f5f8ff" },
];

const accentColors = [
  { token: "--color-accent", label: "Accent", hex: "#851DEF" },
  { token: "--color-accent-hover", label: "Accent Hover", hex: "#9d3cff" },
  { token: "--color-accent-soft", label: "Accent Soft", hex: "#a855f7" },
  { token: "--color-accent-fuchsia", label: "Fuchsia", hex: "#d946ef" },
  { token: "--color-accent-pink", label: "Pink", hex: "#ec4899" },
  { token: "--color-accent-blue", label: "Blue", hex: "#3b82f6" },
  { token: "--color-accent-cyan", label: "Cyan", hex: "#06b6d4" },
  { token: "--color-accent-green", label: "Green", hex: "#10b981" },
  { token: "--color-accent-amber", label: "Amber", hex: "#f59e0b" },
  { token: "--color-accent-red", label: "Red", hex: "#ef4444" },
  { token: "--color-accent-orange", label: "Orange", hex: "#f97316" },
  { token: "--color-accent-indigo", label: "Indigo", hex: "#6366f1" },
];

const textColors = [
  { token: "--color-text-primary", label: "Primary", hex: "#000000" },
  { token: "--color-text-secondary", label: "Secondary", hex: "#333333" },
  { token: "--color-text-muted", label: "Muted", hex: "#666666" },
  { token: "--color-text-disabled", label: "Disabled", hex: "#999999" },
];

const brandColors = [
  { token: "--color-brand-spotify", label: "Spotify", hex: "#1DB954" },
  { token: "--color-brand-apple-music", label: "Apple Music", hex: "#FC3C44" },
  { token: "--color-brand-facebook", label: "Facebook", hex: "#1877F2" },
];

const fontSizes = [
  { token: "--font-size-5xs", label: "5xs", note: "7px — micro labels" },
  { token: "--font-size-4xs", label: "4xs", note: "8px — tiny badges" },
  { token: "--font-size-3xs", label: "3xs", note: "10px — small metadata" },
  { token: "--font-size-2xs", label: "2xs", note: "~11px" },
  { token: "--font-size-xs", label: "xs", note: "~13px" },
  { token: "--font-size-sm", label: "sm", note: "~14px" },
  { token: "--font-size-base", label: "base", note: "16px body" },
  { token: "--font-size-lg", label: "lg", note: "fluid" },
  { token: "--font-size-xl", label: "xl", note: "fluid" },
  { token: "--font-size-2xl", label: "2xl", note: "fluid" },
  { token: "--font-size-3xl", label: "3xl", note: "fluid" },
  { token: "--font-size-4xl", label: "4xl", note: "fluid" },
  { token: "--font-size-5xl", label: "5xl", note: "fluid" },
  { token: "--font-size-6xl", label: "6xl", note: "fluid" },
];



const zLayers = [
  { token: "--z-base", value: "0", label: "Base" },
  { token: "--z-low", value: "1", label: "Low" },
  { token: "--z-default", value: "10", label: "Default" },
  { token: "--z-raised", value: "20", label: "Raised" },
  { token: "--z-high", value: "30", label: "High" },
  { token: "--z-overlay", value: "40", label: "Overlay" },
  { token: "--z-nav", value: "50", label: "Nav" },
  { token: "--z-modal", value: "9999", label: "Modal" },
  { token: "--z-overlay-fx", value: "99998", label: "Overlay FX" },
  { token: "--z-preloader", value: "100000", label: "Preloader" },
];

/* ─── Section Wrapper ─── */
function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-16 border-b border-white/5">
      <div className="site-container">
        <h2 className="text-3xl font-black uppercase tracking-wider text-white mb-2 font-[family-name:var(--font-rockstar)]">
          {title}
        </h2>
        <div className="w-16 h-0.5 bg-[var(--color-accent)] mb-10" />
        {children}
      </div>
    </section>
  );
}

/* ─── Token Badge ─── */
function TokenBadge({ token }: { token: string }) {
  return (
    <code className="text-[var(--font-size-4xs)] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded-md">
      {token}
    </code>
  );
}

/* ─── File Badge ─── */
function FileBadge({ path }: { path: string }) {
  return (
    <span className="text-[var(--font-size-4xs)] font-mono text-[var(--color-accent-cyan)] opacity-60">
      📁 {path}
    </span>
  );
}

/* ─── Color Swatch ─── */
function Swatch({ hex, token, label, textOnDark = true }: { hex: string; token: string; label: string; textOnDark?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="w-full h-20 rounded-xl border border-white/10 flex items-end p-3"
        style={{ backgroundColor: hex }}
      >
        <span className={`text-[var(--font-size-4xs)] font-bold uppercase tracking-wider ${textOnDark ? "text-white/70" : "text-black/70"}`}>
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <TokenBadge token={token} />
        <span className="text-[var(--font-size-4xs)] text-white/30 font-mono">{hex}</span>
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  const [activeNav, setActiveNav] = useState("colors");

  const navItems = [
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing" },
    { id: "z-index", label: "Z-Index" },
    { id: "buttons", label: "Buttons" },
    { id: "forms", label: "Forms" },
    { id: "components", label: "Components" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Sticky Sub-Nav */}
      <div className="sticky top-[60px] z-[60] bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border-b border-white/5">
        <div className="site-container">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            <h1 className="text-sm font-black uppercase tracking-widest text-white/60 mr-4 shrink-0 font-[family-name:var(--font-rockstar)]">
              Style Guide
            </h1>
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveNav(item.id)}
                className={`px-3 py-1.5 text-[var(--font-size-3xs)] font-bold uppercase tracking-widest rounded-lg transition-all shrink-0 ${
                  activeNav === item.id
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="py-20 bg-gradient-to-b from-[var(--color-accent)]/10 to-transparent">
        <div className="site-container">
          <p className="text-eyebrow mb-4 text-[var(--color-accent)] font-bold">Design System</p>
          <h1 className="heading-hero text-black mb-4">7th Heaven</h1>
          <p className="text-body max-w-2xl text-black/70">
            Single source of truth for all design tokens. Every color, font size, shadow, and spacing value
            used across the site is defined in{" "}
            <code className="text-[var(--color-accent)] font-mono text-sm">globals.css @theme</code> and
            rendered here using the real production values.
          </p>
          <FileBadge path="src/app/globals.css → @theme block" />
        </div>
      </div>

      {/* ═══ COLORS ═══ */}
      <Section title="Color Palette" id="colors">
        {/* Dark Background Scale */}
        <h3 className="text-lg font-bold text-black mb-4 uppercase tracking-wider">
          Background Scale <span className="text-black/40 text-sm">(5 semantic levels)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
          {bgScale.map((c) => (
            <Swatch key={c.token} {...c} textOnDark={false} />
          ))}
        </div>

        {/* Accent Colors */}
        <h3 className="text-lg font-bold text-black mb-4 uppercase tracking-wider">
          Accent Colors
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          {accentColors.map((c) => (
            <Swatch key={c.token} {...c} textOnDark />
          ))}
        </div>

        {/* Text Colors */}
        <h3 className="text-lg font-bold text-black mb-4 uppercase tracking-wider">
          Text Colors
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {textColors.map((c) => (
            <div key={c.token} className="flex items-center gap-3 p-4 bg-[var(--color-bg-card)] rounded-xl border border-black/10">
              <span style={{ color: c.hex }} className="text-xl font-bold">Aa</span>
              <div>
                <div className="text-[var(--font-size-3xs)] text-black/70 font-bold">{c.label}</div>
                <TokenBadge token={c.token} />
              </div>
            </div>
          ))}
        </div>

        {/* Brand Colors */}
        <h3 className="text-lg font-bold text-black mb-4 uppercase tracking-wider">
          Brand / Third-Party
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {brandColors.map((c) => (
            <Swatch key={c.token} {...c} textOnDark />
          ))}
        </div>
      </Section>

      {/* ═══ TYPOGRAPHY ═══ */}
      <Section title="Typography Scale" id="typography">
        <FileBadge path="src/app/globals.css → @theme --font-size-*" />

        <div className="mt-8 space-y-1">
          {fontSizes.map((f) => (
            <div
              key={f.token}
              className="flex items-baseline gap-4 py-3 border-b border-black/10 group hover:bg-black/[0.02] px-4 -mx-4 rounded-lg transition-colors"
            >
              <div className="w-16 shrink-0">
                <span className="text-[var(--font-size-3xs)] font-bold text-[var(--color-accent)] uppercase">
                  {f.label}
                </span>
              </div>
              <span
                style={{ fontSize: `var(${f.token})` }}
                className="text-black font-semibold leading-tight"
              >
                The quick brown fox
              </span>
              <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <TokenBadge token={f.token} />
                <span className="text-[var(--font-size-4xs)] text-black/40">{f.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Heading Hierarchy */}
        <h3 className="text-lg font-bold text-black mb-6 mt-16 uppercase tracking-wider">
          Heading Hierarchy <span className="text-black/40 text-sm">(h1–h6)</span>
        </h3>
        <div className="space-y-6 bg-[var(--color-bg-card)] p-8 rounded-2xl border border-black/10 text-black">
          <div>
            <h1>Heading 1 — The Stage Is Set</h1>
            <TokenBadge token="--font-size-5xl" />
          </div>
          <div>
            <h2>Heading 2 — Sound Check Complete</h2>
            <TokenBadge token="--font-size-4xl" />
          </div>
          <div>
            <h3>Heading 3 — Opening Act</h3>
            <TokenBadge token="--font-size-3xl" />
          </div>
          <div>
            <h4>Heading 4 — Main Event</h4>
            <TokenBadge token="--font-size-2xl" />
          </div>
          <div>
            <h5>Heading 5 — Encore Performance</h5>
            <TokenBadge token="--font-size-xl" />
          </div>
          <div>
            <h6>Heading 6 — After Party</h6>
            <TokenBadge token="--font-size-lg" />
          </div>
        </div>

        {/* Utility Classes */}
        <h3 className="text-lg font-bold text-black mb-6 mt-16 uppercase tracking-wider">
          Typography Utilities
        </h3>
        <div className="space-y-8">
          <div>
            <div className="heading-hero text-black mb-2">heading-hero</div>
            <TokenBadge token="@utility heading-hero" />
            <FileBadge path="globals.css" />
          </div>
          <div>
            <div className="heading-section text-black mb-2">heading-section</div>
            <TokenBadge token="@utility heading-section" />
          </div>
          <div>
            <div className="heading-card text-black mb-2">heading-card</div>
            <TokenBadge token="@utility heading-card" />
          </div>
          <div>
            <p className="text-body mb-2 text-black/80">
              Body text — This is the standard paragraph style used throughout the site.
              It uses Barlow at 1rem with 1.7 line-height and dark text color.
            </p>
            <TokenBadge token="@utility text-body" />
          </div>
          <div>
            <p className="text-eyebrow mb-2">Eyebrow label</p>
            <TokenBadge token="@utility text-eyebrow" />
          </div>
        </div>

        {/* Inline elements */}
        <h3 className="text-lg font-bold text-black mb-6 mt-16 uppercase tracking-wider">
          Inline Elements
        </h3>
        <div className="bg-[var(--color-bg-card)] p-8 rounded-2xl border border-black/10 space-y-4 text-body text-black">
          <p>Regular paragraph with <strong className="text-black font-bold">bold text</strong> and <em className="italic text-black/80">italic text</em>.</p>
          <p>Links look like <a href="#" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)] font-bold">this hyperlink style</a>.</p>
          <p>Inline <code className="text-[var(--color-accent)] bg-black/5 px-1.5 py-0.5 rounded-md text-sm font-mono font-bold">code</code> for technical references.</p>
          <blockquote className="border-l-2 border-[var(--color-accent)] pl-4 italic text-black/70">
            &ldquo;Pull quote — The music never stops when you&apos;re on the 7th Heaven cruise.&rdquo;
          </blockquote>
          <ul className="list-disc list-inside space-y-1 text-black/80">
            <li>Unordered list item one</li>
            <li>Unordered list item two
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Nested item</li>
              </ul>
            </li>
          </ul>
          <ol className="list-decimal list-inside space-y-1 text-black/80">
            <li>Ordered list item one</li>
            <li>Ordered list item two</li>
          </ol>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10">
                <th className="text-left py-2 text-black/70 font-bold">Column A</th>
                <th className="text-left py-2 text-black/70 font-bold">Column B</th>
                <th className="text-left py-2 text-black/70 font-bold">Column C</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black/5">
                <td className="py-2 text-black/60">Data 1</td>
                <td className="py-2 text-black/60">Data 2</td>
                <td className="py-2 text-black/60">Data 3</td>
              </tr>
            </tbody>
          </table>
          <hr className="border-white/10" />
          <p className="text-[var(--font-size-3xs)] text-white/30">Caption / small text at 10px (--font-size-3xs)</p>
        </div>
      </Section>

      {/* ═══ SPACING ═══ */}
      <Section title="Spacing Scale" id="spacing">
        <div className="space-y-3">
          {[
            { label: "Container Padding", token: "--space-container", value: "32px", tw: "px-8 / site-container" },
            { label: "gap-1", token: "Tailwind", value: "4px", tw: "gap-1" },
            { label: "gap-2", token: "Tailwind", value: "8px", tw: "gap-2" },
            { label: "gap-3", token: "Tailwind", value: "12px", tw: "gap-3" },
            { label: "gap-4", token: "Tailwind", value: "16px", tw: "gap-4" },
            { label: "gap-6", token: "Tailwind", value: "24px", tw: "gap-6" },
            { label: "gap-8", token: "Tailwind", value: "32px", tw: "gap-8" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4 py-2 border-b border-white/5">
              <div className="w-32 text-[var(--font-size-3xs)] text-white/70 font-bold">{s.label}</div>
              <div className="h-6 bg-[var(--color-accent)]/30 rounded-sm" style={{ width: s.value }} />
              <span className="text-[var(--font-size-4xs)] text-white/40 font-mono">{s.value}</span>
              <code className="text-[var(--font-size-4xs)] text-[var(--color-accent-cyan)] font-mono">{s.tw}</code>
            </div>
          ))}
        </div>
      </Section>



      {/* ═══ Z-INDEX ═══ */}
      <Section title="Z-Index Layers" id="z-index">
        <div className="relative h-[400px] bg-[var(--color-bg-surface)] rounded-2xl border border-white/5 overflow-hidden">
          {zLayers.map((z, i) => (
            <div
              key={z.token}
              className="absolute left-0 right-0 flex items-center justify-between px-6 h-10 border-b border-white/5"
              style={{
                bottom: `${i * 38}px`,
                backgroundColor: `rgba(133, 29, 239, ${0.03 + i * 0.03})`,
              }}
            >
              <span className="text-[var(--font-size-3xs)] font-bold text-white">{z.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[var(--font-size-4xs)] text-[var(--color-accent)] font-mono font-bold">{z.value}</span>
                <TokenBadge token={z.token} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ BUTTONS ═══ */}
      <Section title="Buttons" id="buttons">
        <FileBadge path="src/app/globals.css → @utility btn-primary, btn-outline" />

        <h3 className="text-lg font-bold text-white mb-4 mt-8 uppercase tracking-wider">Primary</h3>
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button className="btn-primary btn-primary-hover rounded-lg">Default</button>
          <button className="btn-primary btn-primary-hover rounded-lg opacity-80">Hover (simulated)</button>
          <button className="btn-primary rounded-lg opacity-50 cursor-not-allowed">Disabled</button>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Outline</h3>
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button className="btn-outline btn-outline-hover rounded-lg">Default</button>
          <button className="btn-outline rounded-lg border-[var(--color-accent)] bg-purple-500/10">Hover (simulated)</button>
          <button className="btn-outline rounded-lg opacity-50 cursor-not-allowed">Disabled</button>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Nav Button (Sign In)</h3>
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button className="px-3.5 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-md">
            SIGN IN
          </button>
          <FileBadge path="src/components/Header.tsx" />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Pill / Book Us</h3>
        <div className="flex flex-wrap items-center gap-4">
          <button className="px-6 py-2 border-2 border-white rounded-2xl text-white text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            BOOK US
          </button>
          <FileBadge path="src/components/Header.tsx" />
        </div>
      </Section>

      {/* ═══ FORMS ═══ */}
      <Section title="Form Inputs" id="forms">
        <div className="max-w-md space-y-4">
          <div>
            <label className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Text Input</label>
            <input
              type="text"
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 rounded-xl text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 rounded-xl text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Textarea</label>
            <textarea
              placeholder="Write your message..."
              rows={4}
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 rounded-xl text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors placeholder:text-white/20 resize-none"
            />
          </div>
          <div>
            <label className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Select</label>
            <select className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 rounded-xl text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors">
              <option>Option One</option>
              <option>Option Two</option>
              <option>Option Three</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ═══ LIVE COMPONENTS ═══ */}
      <Section title="Live Components" id="components">
        <p className="text-body mb-8">
          These are all real production components in the application imported and rendered live. Editing any component file below will instantly update it site-wide.
        </p>

        {/* ── 1. GLOBAL LAYOUT & NAVIGATION ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            1. Global Layout & Navigation
          </h2>
        </div>

        {/* Logo */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Logo</span>
          <FileBadge path="src/components/Logo.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-8 rounded-2xl border border-white/5 mb-12 flex items-center justify-center">
          <Link href="/">
            <Logo className="h-16 text-white hover:text-[var(--color-accent)] transition-colors cursor-pointer" />
          </Link>
        </div>

        {/* Header Navigation */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Header Navigation</span>
          <FileBadge path="src/components/Header.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-white/5 overflow-hidden mb-12">
          <div className="relative h-[80px]">
            <Header />
          </div>
        </div>

        {/* Footer */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Footer</span>
          <FileBadge path="src/components/Footer.tsx" />
        </h3>
        <div className="rounded-2xl border border-white/5 overflow-hidden mb-12">
          <Footer />
        </div>

        {/* Page Navigation & Dev Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Page Navigation</span>
              <FileBadge path="src/components/PageNav.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 flex items-center justify-center">
              <PageNav />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Dev Performance Panel</span>
              <FileBadge path="src/components/DevPerformancePanel.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5">
              <DevPerformancePanel />
            </div>
          </div>
        </div>

        {/* Utility Visual Effects */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Layout & Visual Overlay Helpers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl border border-white/5 text-center">
            <span className="text-xs font-bold text-white block mb-1">ScrollToTop</span>
            <FileBadge path="src/components/ScrollToTop.tsx" />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl border border-white/5 text-center">
            <span className="text-xs font-bold text-white block mb-1">GrainOverlay</span>
            <FileBadge path="src/components/GrainOverlay.tsx" />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl border border-white/5 text-center">
            <span className="text-xs font-bold text-white block mb-1">CursorFollower</span>
            <FileBadge path="src/components/CursorFollower.tsx" />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl border border-white/5 text-center">
            <span className="text-xs font-bold text-white block mb-1">CustomScrollbar</span>
            <FileBadge path="src/components/CustomScrollbar.tsx" />
          </div>
        </div>


        {/* ── 2. NOTIFICATIONS & BANNERS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            2. Notifications, Banners & Indicators
          </h2>
        </div>

        {/* Announcement Banner */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Announcement Banner</span>
          <FileBadge path="src/components/AnnouncementBanner.tsx" />
        </h3>
        <div className="mb-12">
          <AnnouncementBanner text="🔥 SPECIAL ANNOUNCEMENT: NEW ALBUM RELEASE & TOUR DATES 2026!" inline />
        </div>

        {/* User Role Badges */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>User Role Badges</span>
          <FileBadge path="src/components/RoleBadge.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <RoleBadge role="fan" size="md" showLabel />
            <span className="text-xs text-white/40">Fan Badge</span>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role="crew" size="md" showLabel />
            <span className="text-xs text-white/40">Crew Badge</span>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role="admin" size="md" showLabel />
            <span className="text-xs text-white/40">Admin Badge</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Countdown Timer</span>
          <FileBadge path="src/components/CountdownTimer.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12 flex flex-col md:flex-row items-center justify-around gap-6">
          <div className="text-center">
            <p className="text-xs text-white/40 mb-2 uppercase font-bold tracking-wider">Standard Layout</p>
            <CountdownTimer targetDate="2026-12-31" targetTime="08:00 pm" />
          </div>
          <div className="text-center">
            <p className="text-xs text-white/40 mb-2 uppercase font-bold tracking-wider">Compact Layout</p>
            <CountdownTimer targetDate="2026-12-31" compact />
          </div>
        </div>

        {/* Emergency Broadcast & Cookie Consent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Emergency Broadcast Center</span>
              <FileBadge path="src/components/EmergencyBroadcastCenter.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5">
              <EmergencyBroadcastCenter />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Cookie Consent Banner</span>
              <FileBadge path="src/components/CookieConsentBanner.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 relative min-h-[160px] overflow-hidden">
              <CookieConsentBanner />
            </div>
          </div>
        </div>


        {/* ── 3. MUSIC & AUDIO PLAYERS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            3. Music & Audio Players
          </h2>
        </div>

        {/* Featured Track Player */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Featured Track Player</span>
          <FileBadge path="src/components/FeaturedTrack.tsx" />
        </h3>
        <div className="mb-12">
          <FeaturedTrack />
        </div>

        {/* Hero Album Player */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Hero Album Player</span>
          <FileBadge path="src/components/HeroAlbumPlayer.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-white/5 overflow-hidden mb-12">
          <HeroAlbumPlayer />
        </div>

        {/* Vinyl Hero Player */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Vinyl Hero Player</span>
          <FileBadge path="src/components/VinylHeroPlayer.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-white/5 overflow-hidden mb-12 p-6">
          <VinylHeroPlayer />
        </div>

        {/* Full Audio Player Section */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Full Audio Player Section</span>
          <FileBadge path="src/components/AudioPlayer.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-white/5 overflow-hidden mb-16 p-6">
          <AudioPlayerSection />
        </div>


        {/* ── 4. VIDEO PLAYERS & MEDIA ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            4. Video Players & Media
          </h2>
        </div>

        {/* Hero Video Player */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Hero Video Player</span>
          <FileBadge path="src/components/HeroVideoPlayer.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-white/5 overflow-hidden mb-12 p-6">
          <HeroVideoPlayer />
        </div>

        {/* Video Section */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Video Section Grid</span>
          <FileBadge path="src/components/VideoSection.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <VideoSection />
        </div>

        {/* Inline & Custom YouTube Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Inline YouTube Player</span>
              <FileBadge path="src/components/InlineYTPlayer.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-4 rounded-2xl border border-white/5 min-h-[220px]">
              <InlineYTPlayer videoId="BzHUNTZ66zY" title="Ain't That Just Beautiful" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Custom YouTube Player</span>
              <FileBadge path="src/components/CustomYTPlayer.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-4 rounded-2xl border border-white/5 flex items-center justify-center min-h-[220px]">
              <FileBadge path="src/components/CustomYTPlayer.tsx" />
            </div>
          </div>
        </div>


        {/* ── 5. LIVE STREAMS & FEEDS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            5. Live Streams & Feeds
          </h2>
        </div>

        {/* Live Status Indicator */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Live Status Indicator</span>
          <FileBadge path="src/components/LiveStatusSign.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <LiveStatusSign />
        </div>

        {/* Hero Live Hub */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Hero Live Hub</span>
          <FileBadge path="src/components/HeroLiveHub.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <HeroLiveHub />
        </div>

        {/* Hero Live Thumbs */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Hero Live Thumbs</span>
          <FileBadge path="src/components/HeroLiveThumbs.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <HeroLiveThumbs />
        </div>

        {/* Live Show Feed */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Live Show Feed</span>
          <FileBadge path="src/components/LiveShowFeed.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-16">
          <LiveShowFeed />
        </div>


        {/* ── 6. TOUR, SHOWS & MAPS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            6. Tour, Shows & Maps
          </h2>
        </div>

        {/* Hero Upcoming Shows */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Upcoming Shows Hub</span>
          <FileBadge path="src/components/HeroUpcomingShows.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <HeroUpcomingShows
            upcomingShows={[
              {
                id: "1",
                venue: "Soldier Field",
                city: "Chicago",
                state: "IL",
                date: "Aug 15, 2026",
                startDate: "2026-08-15",
                time: "8:00 PM",
                ticketUrl: "#",
                vipUrl: "#",
                info: "Headline Outdoor Stadium Concert!"
              },
              {
                id: "2",
                venue: "Hard Rock Live",
                city: "Gary",
                state: "IN",
                date: "Aug 22, 2026",
                startDate: "2026-08-22",
                time: "9:00 PM",
                ticketUrl: "#",
                info: "Indoor Arena Experience"
              }
            ]}
          />
        </div>

        {/* Interactive Calendar Picker */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Calendar Picker</span>
          <FileBadge path="src/components/CalendarPicker.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <CalendarPicker slots={[]} onChangeSlots={() => {}} startTime="7:00 PM" onStartTimeChange={() => {}} endTime="10:00 PM" onEndTimeChange={() => {}} label="Select Dates" />
        </div>

        {/* Tour Map */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Interactive Tour Map</span>
          <FileBadge path="src/components/TourMap.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-16 h-[350px]">
          <TourMap shows={[]} />
        </div>


        {/* ── 7. STORE & MERCH ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            7. Store & Merch
          </h2>
        </div>

        {/* Homepage Merch Grid */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Homepage Merch Grid</span>
          <FileBadge path="src/components/HomeMerch.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-16">
          <HomeMerch />
        </div>


        {/* ── 8. CRUISE EXPERIENCE ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            8. Cruise Experience
          </h2>
        </div>

        {/* Cruise History Timeline */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Cruise History Timeline</span>
          <FileBadge path="src/components/CruiseHistoryTimeline.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <CruiseHistoryTimeline history={[]} />
        </div>

        {/* Cruise Video Gallery */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Cruise Video Gallery</span>
          <FileBadge path="src/components/CruiseVideoGallery.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <CruiseVideoGallery />
        </div>

        {/* Cruise Widgets */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Cruise Widgets</span>
          <FileBadge path="src/components/CruiseWidgets.tsx" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5">
            <EmbarkationCountdown />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5">
            <DailyPoll />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5">
            <ImportantLinksWidget />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5">
            <CaptainsLog />
          </div>
        </div>


        {/* ── 9. BAND, BIO & NEWS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            9. Band, Bio & News
          </h2>
        </div>

        {/* News Hero Layouts */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>News Hero Layouts</span>
          <FileBadge path="src/components/NewsHeroLayouts.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <NewsHeroLayouts
            newsItems={[
              {
                date: "January 2026",
                title: "2026 Tour Dates & Cruise Announced",
                content: "It's winter time, and besides our annual cruise we do every year, we are working in the studio on brand new releases."
              }
            ]}
          />
        </div>

        {/* Accomplishments Layouts */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Accomplishments Showcase</span>
          <FileBadge path="src/components/AccomplishmentsLayouts.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <AccomplishmentsLayouts
            accomplishments={[
              "Three #1 Hit Songs on Billboard",
              "Seven Major Radio Hit Songs",
              "Five CDs reached #1 on Billboard",
              "Opened for Bon Jovi & Kid Rock at Soldier Field",
              "Opened for Styx to 80,000 people",
              "Written/Recorded over 5,000 songs to date"
            ]}
          />
        </div>

        {/* Bio Parallax Slider */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Bio Parallax Slider</span>
          <FileBadge path="src/components/BioParallaxSlider.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-16">
          <BioParallaxSlider />
        </div>


        {/* ── 10. FAN INTERACTION & AUTH MODALS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            10. Fan Interaction & Auth Modals
          </h2>
        </div>

        {/* Fan Photo Upload Form */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Fan Upload Form</span>
          <FileBadge path="src/components/FanUploadForm.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <FanUploadForm />
        </div>

        {/* Profile Photo Uploader */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Profile Photo Uploader</span>
          <FileBadge path="src/components/ProfilePhotoUploader.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12 flex items-center justify-center">
          <ProfilePhotoUploader />
        </div>

        {/* Direct Message Chat */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Direct Message Chat</span>
          <FileBadge path="src/components/DirectMessageChat.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-16">
          <DirectMessageChat />
        </div>


        {/* ── 11. MEMBER & CREW DASHBOARDS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            11. Member & Crew Dashboards
          </h2>
        </div>

        {/* Member Dashboard */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Member Dashboard</span>
          <FileBadge path="src/components/MemberDashboard.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <MemberDashboard />
        </div>

        {/* Crew HQ */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Crew HQ Hub</span>
          <FileBadge path="src/components/CrewHQ.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <CrewHQ />
        </div>

        {/* Crew Feed */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Crew Feed</span>
          <FileBadge path="src/components/CrewFeed.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-16">
          <CrewFeed />
        </div>


        {/* ── 12. ADMIN CONTROL PANELS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            12. Admin Control Panels
          </h2>
        </div>

        {/* Award Picks Panel */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Award Picks Panel</span>
          <FileBadge path="src/components/admin/AwardPicksPanel.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <AwardPicksPanel />
        </div>

        {/* Bulk Invite Panel */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Bulk Invite Panel</span>
          <FileBadge path="src/components/admin/BulkInvitePanel.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <BulkInvitePanel />
        </div>


        {/* Referral Program Panel */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Referral Program Panel</span>
          <FileBadge path="src/components/admin/ReferralProgramPanel.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-12">
          <ReferralProgramPanel />
        </div>

        {/* Role Email Directory */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Role Email Directory</span>
          <FileBadge path="src/components/admin/RoleEmailDirectory.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-white/5 mb-16">
          <RoleEmailDirectory />
        </div>

      </Section>
    </div>
  );
}
