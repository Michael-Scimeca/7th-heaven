"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
   Token Definitions — the source of truth
   ───────────────────────────────────────────── */

interface ColorToken {
  token: string;
  label: string;
  hex: string;
  group: string;
}

const allColorTokens: ColorToken[] = [
  // Background Scale
  { token: "--color-bg-primary", label: "BG Primary", hex: "#f5f8ff", group: "Background" },
  { token: "--color-bg-deep", label: "BG Deep", hex: "#f5f8ff", group: "Background" },
  { token: "--color-bg-surface", label: "BG Surface", hex: "#ffffff", group: "Background" },
  { token: "--color-bg-card", label: "BG Card", hex: "#ffffff", group: "Background" },
  { token: "--color-bg-elevated", label: "BG Elevated", hex: "#ffffff", group: "Background" },
  // Root vars
  { token: "--bg-color", label: "Root BG", hex: "#f5f8ff", group: "Root" },
  { token: "--text-color", label: "Root Text", hex: "#000000", group: "Root" },
  { token: "--card-bg", label: "Root Card BG", hex: "#ffffff", group: "Root" },
  { token: "--accent-color", label: "Root Accent", hex: "#851DEF", group: "Root" },
  // Accent Colors
  { token: "--color-accent", label: "Accent", hex: "#851DEF", group: "Accent" },
  { token: "--color-accent-hover", label: "Accent Hover", hex: "#9d3cff", group: "Accent" },
  { token: "--color-accent-soft", label: "Accent Soft", hex: "#a855f7", group: "Accent" },
  { token: "--color-accent-fuchsia", label: "Fuchsia", hex: "#d946ef", group: "Accent" },
  { token: "--color-accent-pink", label: "Pink", hex: "#9333ea", group: "Accent" },
  { token: "--color-accent-blue", label: "Blue", hex: "#3b82f6", group: "Accent" },
  { token: "--color-accent-cyan", label: "Cyan", hex: "#9333ea", group: "Accent" },
  { token: "--color-accent-green", label: "Green", hex: "#10b981", group: "Accent" },
  { token: "--color-accent-amber", label: "Amber", hex: "#9333ea", group: "Accent" },
  { token: "--color-accent-red", label: "Red", hex: "#ef4444", group: "Accent" },
  { token: "--color-accent-orange", label: "Orange", hex: "#f97316", group: "Accent" },
  { token: "--color-accent-indigo", label: "Indigo", hex: "#6366f1", group: "Accent" },
  // Text Colors
  { token: "--color-text-primary", label: "Text Primary", hex: "#000000", group: "Text" },
  { token: "--color-text-secondary", label: "Text Secondary", hex: "#000000", group: "Text" },
  { token: "--color-text-muted", label: "Text Muted", hex: "rgba(0,0,0,0.6)", group: "Text" },
  { token: "--color-text-disabled", label: "Text Disabled", hex: "#999999", group: "Text" },
  // State
  { token: "--color-success", label: "Success", hex: "#10b981", group: "State" },
  { token: "--color-warning", label: "Warning", hex: "#9333ea", group: "State" },
  { token: "--color-error", label: "Error", hex: "#ef4444", group: "State" },
  { token: "--color-info", label: "Info", hex: "#3b82f6", group: "State" },
  // Brand
  { token: "--color-brand-spotify", label: "Spotify", hex: "#1DB954", group: "Brand" },
  { token: "--color-brand-apple-music", label: "Apple Music", hex: "#FC3C44", group: "Brand" },
  { token: "--color-brand-facebook", label: "Facebook", hex: "#1877F2", group: "Brand" },
  // Borders
  { token: "--color-border", label: "Border", hex: "rgba(0,0,0,0.08)", group: "Border" },
  { token: "--color-border-hover", label: "Border Hover", hex: "rgba(255,10,61,0.4)", group: "Border" },
];

interface TypographyToken {
  token: string;
  label: string;
  defaultValue: string;
  note: string;
}

const typographyTokens: TypographyToken[] = [
  { token: "--font-size-5xs", label: "5xs", defaultValue: "0.53rem", note: "~8.5px — micro labels" },
  { token: "--font-size-4xs", label: "4xs", defaultValue: "0.62rem", note: "~10px — tiny badges" },
  { token: "--font-size-3xs", label: "3xs", defaultValue: "0.72rem", note: "~11.5px — small metadata" },
  { token: "--font-size-2xs", label: "2xs", defaultValue: "0.72rem", note: "~11px" },
  { token: "--font-size-xs", label: "xs", defaultValue: "0.8rem", note: "~13px" },
  { token: "--font-size-sm", label: "sm", defaultValue: "0.88rem", note: "~14px" },
  { token: "--font-size-base", label: "base", defaultValue: "1rem", note: "16px body" },
  { token: "--font-size-lg", label: "lg", defaultValue: "clamp(1.05rem, 1rem + 0.25vw, 1.2rem)", note: "fluid" },
  { token: "--font-size-xl", label: "xl", defaultValue: "clamp(1.2rem, 1.1rem + 0.35vw, 1.35rem)", note: "fluid" },
  { token: "--font-size-2xl", label: "2xl", defaultValue: "clamp(1.35rem, 1.25rem + 0.5vw, 1.6rem)", note: "fluid" },
  { token: "--font-size-3xl", label: "3xl", defaultValue: "clamp(1.6rem, 1.45rem + 0.75vw, 2rem)", note: "fluid" },
  { token: "--font-size-4xl", label: "4xl", defaultValue: "clamp(2rem, 1.75rem + 1vw, 2.5rem)", note: "fluid" },
  { token: "--font-size-5xl", label: "5xl", defaultValue: "clamp(2.5rem, 2.1rem + 1.25vw, 3.2rem)", note: "fluid" },
  { token: "--font-size-6xl", label: "6xl", defaultValue: "clamp(3.2rem, 2.6rem + 1.5vw, 4rem)", note: "fluid" },
];

interface ShadowToken {
  token: string;
  label: string;
  defaultValue: string;
}

const shadowTokens: ShadowToken[] = [
  { token: "--shadow-card", label: "Card Shadow", defaultValue: "0 8px 30px -10px rgba(0, 0, 0, 0.7)" },
  { token: "--shadow-deep", label: "Deep Shadow", defaultValue: "0 6px 20px rgba(0, 0, 0, 0.9)" },
  { token: "--shadow-accent-glow", label: "Accent Glow", defaultValue: "0 0 20px rgba(133, 29, 239, 0.3)" },
  { token: "--shadow-accent-glow-lg", label: "Accent Glow LG", defaultValue: "0 0 40px rgba(133, 29, 239, 0.4)" },
  { token: "--shadow-cyan-glow", label: "Cyan Glow", defaultValue: "0 0 15px rgba(6, 182, 212, 0.3)" },
  { token: "--shadow-pink-glow", label: "Pink Glow", defaultValue: "0 0 20px rgba(236, 72, 153, 0.3)" },
  { token: "--shadow-nav", label: "Nav Shadow", defaultValue: "0 10px 30px rgba(0, 0, 0, 0.9)" },
];

interface SpacingToken {
  token: string;
  label: string;
  defaultValue: string;
  tw: string;
}

const spacingTokens: SpacingToken[] = [
  { token: "--space-container", label: "Container Padding", defaultValue: "32", tw: "px-8 / site-container" },
  { token: "--nav-height", label: "Nav Height", defaultValue: "88", tw: "--nav-height" },
  { token: "--page-top-offset", label: "Page Top Offset", defaultValue: "120", tw: "--page-top-offset" },
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

/* ─── Helpers ─── */

function rgbaToHex(rgba: string): string {
  if (rgba.startsWith('#')) return rgba;
  const match = rgba.match(/[\d.]+/g);
  if (!match || match.length < 3) return '#000000';
  const r = Math.round(parseFloat(match[0]));
  const g = Math.round(parseFloat(match[1]));
  const b = Math.round(parseFloat(match[2]));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

/* ─── Section Wrapper ─── */
function Section({ title, id, children, badge }: { title: string; id: string; children: React.ReactNode; badge?: string }) {
  return (
    <section id={id} className="py-16 border-b border-white/5">
      <div className="site-container">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h2 className="text-3xl font-black uppercase tracking-wider text-white font-[family-name:var(--font-rockstar)]">
            {title}
          </h2>
          {badge && (
            <span className="text-[9px] font-black uppercase tracking-widest bg-purple-600/20 border border-purple-500/40 text-purple-200 px-2 py-0.5 rounded-md">
              {badge}
            </span>
          )}
        </div>
        <div className="w-16 h-0.5 bg-[var(--color-accent)] mb-10" />
        {children}
      </div>
    </section>
  );
}

/* ─── Token Badge ─── */
function TokenBadge({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <code
      onClick={() => {
        navigator.clipboard.writeText(`var(${token})`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-[var(--font-size-4xs)] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-white/10 hover:text-white/60 transition-colors select-all"
      title="Click to copy"
    >
      {copied ? '✓ Copied!' : token}
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

/* ─── Editable Color Swatch ─── */
function EditableSwatch({
  token,
  label,
  currentHex,
  originalHex,
  onChange,
  onReset,
  isChanged,
}: {
  token: string;
  label: string;
  currentHex: string;
  originalHex: string;
  onChange: (token: string, hex: string) => void;
  onReset: (token: string) => void;
  isChanged: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayHex = currentHex.startsWith('#') ? currentHex : rgbaToHex(currentHex);
  const textDark = isLightColor(displayHex);

  return (
    <div className="flex flex-col gap-1.5 group relative">
      <div
        className={`relative w-full h-20  border flex items-end p-3 cursor-pointer transition-colors hover:scale-[1.02] hover: ${isChanged ? 'border-purple-500/60 ring-2 ring-amber-500/30' : 'border-white/10'
          }`}
        style={{ backgroundColor: displayHex }}
        onClick={() => inputRef.current?.click()}
      >
        <span className={`text-[var(--font-size-4xs)] font-bold uppercase tracking-wider ${textDark ? 'text-black/70' : 'text-white/70'}`}>
          {label}
        </span>
        {isChanged && (
          <span className={`absolute top-2 right-2 text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${textDark ? 'bg-black/20 text-black/60' : 'bg-white/20 text-white/60'}`}>
            Modified
          </span>
        )}
        <input
          ref={inputRef}
          type="color"
          value={displayHex}
          onChange={(e) => onChange(token, e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <TokenBadge token={token} />
          {isChanged && (
            <button
              onClick={() => onReset(token)}
              className="text-[7px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        <span className="text-[var(--font-size-4xs)] text-white/30 font-mono">{displayHex}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function StyleGuidePage() {
  const [activeNav, setActiveNav] = useState("colors");

  // Track all token overrides: { token: newValue }
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({});
  const [typographyOverrides, setTypographyOverrides] = useState<Record<string, string>>({});
  const [shadowOverrides, setShadowOverrides] = useState<Record<string, string>>({});
  const [spacingOverrides, setSpacingOverrides] = useState<Record<string, string>>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  // Count total changes
  const totalChanges = Object.keys(colorOverrides).length + Object.keys(typographyOverrides).length + Object.keys(shadowOverrides).length + Object.keys(spacingOverrides).length;

  // Apply overrides to the document
  const applyOverride = useCallback((token: string, value: string) => {
    document.documentElement.style.setProperty(token, value);
  }, []);

  const removeOverride = useCallback((token: string) => {
    document.documentElement.style.removeProperty(token);
  }, []);

  // Color change handler
  const handleColorChange = useCallback((token: string, hex: string) => {
    setColorOverrides(prev => ({ ...prev, [token]: hex }));
    applyOverride(token, hex);
  }, [applyOverride]);

  const handleColorReset = useCallback((token: string) => {
    setColorOverrides(prev => {
      const next = { ...prev };
      delete next[token];
      return next;
    });
    removeOverride(token);
  }, [removeOverride]);

  // Typography change handler
  const handleTypographyChange = useCallback((token: string, value: string) => {
    setTypographyOverrides(prev => ({ ...prev, [token]: value }));
    applyOverride(token, value);
  }, [applyOverride]);

  const handleTypographyReset = useCallback((token: string) => {
    setTypographyOverrides(prev => {
      const next = { ...prev };
      delete next[token];
      return next;
    });
    removeOverride(token);
  }, [removeOverride]);

  // Shadow change handler
  const handleShadowChange = useCallback((token: string, value: string) => {
    setShadowOverrides(prev => ({ ...prev, [token]: value }));
    applyOverride(token, value);
  }, [applyOverride]);

  const handleShadowReset = useCallback((token: string) => {
    setShadowOverrides(prev => {
      const next = { ...prev };
      delete next[token];
      return next;
    });
    removeOverride(token);
  }, [removeOverride]);

  // Spacing change handler
  const handleSpacingChange = useCallback((token: string, value: string) => {
    setSpacingOverrides(prev => ({ ...prev, [token]: value }));
    applyOverride(token, `${value}px`);
  }, [applyOverride]);

  const handleSpacingReset = useCallback((token: string) => {
    setSpacingOverrides(prev => {
      const next = { ...prev };
      delete next[token];
      return next;
    });
    removeOverride(token);
  }, [removeOverride]);

  // Reset ALL
  const handleResetAll = useCallback(() => {
    Object.keys(colorOverrides).forEach(removeOverride);
    Object.keys(typographyOverrides).forEach(removeOverride);
    Object.keys(shadowOverrides).forEach(removeOverride);
    Object.keys(spacingOverrides).forEach(removeOverride);
    setColorOverrides({});
    setTypographyOverrides({});
    setShadowOverrides({});
    setSpacingOverrides({});
  }, [colorOverrides, typographyOverrides, shadowOverrides, spacingOverrides, removeOverride]);

  // Generate export CSS
  const generateExportCSS = useCallback(() => {
    const lines: string[] = [];
    lines.push('/* ═══ Style Guide Overrides ═══');
    lines.push(`   Generated: ${new Date().toLocaleString()}`);
    lines.push('   Paste into globals.css :root / @theme block */\n');

    const allOverrides = { ...colorOverrides, ...typographyOverrides, ...shadowOverrides };
    Object.keys(spacingOverrides).forEach(k => {
      allOverrides[k] = `${spacingOverrides[k]}px`;
    });

    if (Object.keys(allOverrides).length === 0) {
      lines.push('/* No changes made yet */');
    } else {
      lines.push(':root {');
      Object.entries(allOverrides).forEach(([token, value]) => {
        lines.push(`  ${token}: ${value};`);
      });
      lines.push('}');
    }

    return lines.join('\n');
  }, [colorOverrides, typographyOverrides, shadowOverrides, spacingOverrides]);

  // Group colors by category
  const colorGroups = allColorTokens.reduce((acc, c) => {
    if (!acc[c.group]) acc[c.group] = [];
    acc[c.group].push(c);
    return acc;
  }, {} as Record<string, ColorToken[]>);

  const navItems = [
    { id: "colors", label: "🎨 Colors", count: Object.keys(colorOverrides).length },
    { id: "typography", label: "🔤 Typography", count: Object.keys(typographyOverrides).length },
    { id: "spacing", label: "📐 Spacing", count: Object.keys(spacingOverrides).length },
    { id: "shadows", label: "✨ Shadows", count: Object.keys(shadowOverrides).length },
    { id: "z-index", label: "📚 Z-Index", count: 0 },
    { id: "buttons", label: "🔘 Buttons", count: 0 },
    { id: "forms", label: "📝 Forms", count: 0 },
    { id: "components", label: "🧩 Components", count: 0 },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* ── Sticky Sub-Nav ── */}
      <div className="sticky top-[60px] z-[60] bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="site-container">
          <div className="flex items-center gap-1.5 py-3 overflow-x-auto">
            <h1 className="text-sm font-black uppercase tracking-widest text-white/60 mr-3 shrink-0 font-[family-name:var(--font-rockstar)]">
              Style Guide
            </h1>

            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveNav(item.id)}
                className={`px-3 py-1.5 text-[var(--font-size-3xs)] font-bold uppercase tracking-widest rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${activeNav === item.id
                    ? "bg-[var(--color-accent)] text-white shadow-[0_0_15px_rgba(255,10,61,0.4)]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
              >
                {item.label}
                {item.count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[8px] font-black flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </a>
            ))}

            <div className="ml-auto flex items-center gap-2 shrink-0 pl-4">
              {totalChanges > 0 && (
                <>
                  <span className="text-[9px] font-bold text-purple-200 bg-purple-600/15 border border-purple-500/30 px-2 py-1 rounded-md">
                    {totalChanges} change{totalChanges !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Export CSS
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Reset All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="py-20 bg-gradient-to-b from-[var(--color-accent)]/10 to-transparent">
        <div className="site-container">
          <p className="text-eyebrow mb-4  text-[var(--color-accent)] font-bold">Interactive Design System</p>
          <h1 className="heading-hero text-black mb-4">7th Heaven</h1>
          <p className="text-body max-w-2xl text-black/70">
            Live-edit every color, font, shadow, and spacing token. Click any swatch to open a color picker,
            type new values inline, then export your changes as clean CSS to paste into{" "}
            <code className=" text-[var(--color-accent)] font-mono text-sm">globals.css</code>.
          </p>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <FileBadge path="src/app/globals.css → @theme block" />
            {totalChanges > 0 && (
              <span className="text-[10px] font-bold text-purple-200 bg-purple-600/15 border border-purple-500/30 px-2.5 py-1 rounded-md animate-pulse">
                ⚡ {totalChanges} live override{totalChanges !== 1 ? 's' : ''} active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          COLORS — Live Editable Swatches
          ═══════════════════════════════════════════ */}
      <Section title="Color Palette" id="colors" badge="LIVE EDIT">
        <p className="text-sm text-white/40 mb-8">
          Click any swatch to open the color picker. Changes apply instantly to all components below.
        </p>

        {Object.entries(colorGroups).map(([groupName, tokens]) => (
          <div key={groupName} className="mb-12">
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              {groupName}
              <span className="text-white/30 text-sm font-normal">({tokens.length} tokens)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tokens.map((c) => (
                <EditableSwatch
                  key={c.token}
                  token={c.token}
                  label={c.label}
                  currentHex={colorOverrides[c.token] || c.hex}
                  originalHex={c.hex}
                  onChange={handleColorChange}
                  onReset={handleColorReset}
                  isChanged={!!colorOverrides[c.token]}
                />
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* ═══════════════════════════════════════════
          TYPOGRAPHY — Live Editable Scale
          ═══════════════════════════════════════════ */}
      <Section title="Typography Scale" id="typography" badge="LIVE EDIT">
        <FileBadge path="src/app/globals.css → @theme --font-size-*" />

        <div className="mt-8 space-y-1">
          {typographyTokens.map((f) => {
            const isChanged = !!typographyOverrides[f.token];
            const currentValue = typographyOverrides[f.token] || f.defaultValue;
            return (
              <div
                key={f.token}
                className={`flex items-center gap-4 py-3 border-b group px-4 -mx-4 rounded-lg transition-colors ${isChanged ? 'border-purple-500/30 bg-purple-600/5' : 'border-white/5 hover:bg-white/[0.02]'
                  }`}
              >
                <div className="w-14 shrink-0">
                  <span className="text-[var(--font-size-3xs)] font-bold  text-[var(--color-accent)] uppercase">
                    {f.label}
                  </span>
                </div>

                <span
                  style={{ fontSize: `var(${f.token})` }}
                  className="text-white font-semibold leading-tight flex-1 min-w-0 truncate"
                >
                  The quick brown fox
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleTypographyChange(f.token, e.target.value)}
                    className="w-[110px] px-2 py-1 bg-black/40 border border-white/10 rounded-md text-[10px] font-mono text-white/80 focus:border-[var(--color-accent)] focus:outline-none transition-colors text-center"
                    title={`Edit ${f.token}`}
                  />
                  {isChanged && (
                    <button
                      onClick={() => handleTypographyReset(f.token)}
                      className="text-[7px] font-bold uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                  <span className="text-[var(--font-size-4xs)] text-white/30 w-28 text-right">{f.note}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Heading Hierarchy */}
        <h3 className="text-lg font-bold text-white mb-6 mt-16 uppercase tracking-wider">
          Heading Hierarchy <span className="text-white/40 text-sm">(h1–h6)</span>
        </h3>
        <div className="space-y-6 bg-[var(--color-bg-card)] p-8 border border-white/10 text-black">
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

        {/* Typography Utilities */}
        <h3 className="text-lg font-bold text-white mb-6 mt-16 uppercase tracking-wider">
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
        <h3 className="text-lg font-bold text-white mb-6 mt-16 uppercase tracking-wider">
          Inline Elements
        </h3>
        <div className="bg-[var(--color-bg-card)] p-8 border border-white/10 space-y-4 text-body text-black">
          <p>Regular paragraph with <strong className="text-black font-bold">bold text</strong> and <em className="italic text-black/80">italic text</em>.</p>
          <p>Links look like <a href="#" className=" text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)] font-bold">this hyperlink style</a>.</p>
          <p>Inline <code className=" text-[var(--color-accent)] bg-black/5 px-1.5 py-0.5 rounded-md text-sm font-mono font-bold">code</code> for technical references.</p>
          <blockquote className="border-l-2 border-[var(--color-accent)] pl-4 italic text-black/70">
            &ldquo;Pull quote — The music never stops when you&apos;re on the 7th Heaven cruise.&rdquo;
          </blockquote>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          SPACING — Live Editable
          ═══════════════════════════════════════════ */}
      <Section title="Spacing & Layout" id="spacing" badge="LIVE EDIT">
        <div className="space-y-4">
          {spacingTokens.map((s) => {
            const isChanged = !!spacingOverrides[s.token];
            const currentValue = spacingOverrides[s.token] || s.defaultValue;
            return (
              <div key={s.token} className={`flex items-center gap-4 py-3 px-4 -mx-4 rounded-lg transition-colors border-b ${isChanged ? 'border-purple-500/30 bg-purple-600/5' : 'border-white/5'
                }`}>
                <div className="w-40 text-[var(--font-size-3xs)] text-white/70 font-bold shrink-0">{s.label}</div>
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={currentValue}
                    onChange={(e) => handleSpacingChange(s.token, e.target.value)}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                  />
                  <div className="h-6 bg-[var(--color-accent)]/30 rounded-sm transition-colors" style={{ width: `${currentValue}px` }} />
                </div>
                <input
                  type="number"
                  value={currentValue}
                  onChange={(e) => handleSpacingChange(s.token, e.target.value)}
                  className="w-16 px-2 py-1 bg-black/40 border border-white/10 rounded-md text-[10px] font-mono text-white/80 focus:border-[var(--color-accent)] focus:outline-none text-center"
                />
                <span className="text-[var(--font-size-4xs)] text-white/30 font-mono w-8">px</span>
                {isChanged && (
                  <button
                    onClick={() => handleSpacingReset(s.token)}
                    className="text-[7px] font-bold uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Tailwind Gap Scale */}
        <h3 className="text-lg font-bold text-white mb-4 mt-12 uppercase tracking-wider">
          Tailwind Gap Scale <span className="text-white/40 text-sm">(reference)</span>
        </h3>
        <div className="space-y-3">
          {[
            { label: "gap-1", value: "4px", tw: "gap-1" },
            { label: "gap-2", value: "8px", tw: "gap-2" },
            { label: "gap-3", value: "12px", tw: "gap-3" },
            { label: "gap-4", value: "16px", tw: "gap-4" },
            { label: "gap-6", value: "24px", tw: "gap-6" },
            { label: "gap-8", value: "32px", tw: "gap-8" },
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

      {/* ═══════════════════════════════════════════
          SHADOWS — Live Editable
          ═══════════════════════════════════════════ */}
      <Section title="Shadows & Effects" id="shadows" badge="LIVE EDIT">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shadowTokens.map((s) => {
            const isChanged = !!shadowOverrides[s.token];
            const currentValue = shadowOverrides[s.token] || s.defaultValue;
            return (
              <div key={s.token} className={` border p-6 transition-colors ${isChanged ? 'border-purple-500/40 bg-purple-600/5' : 'border-white/5 bg-[var(--color-bg-surface)]'
                }`}>
                <div
                  className="w-full h-20 bg-[var(--color-bg-card)] mb-4 border border-white/5"
                  style={{ boxShadow: currentValue }}
                />
                <h4 className="text-sm font-bold text-white mb-1">{s.label}</h4>
                <TokenBadge token={s.token} />
                <div className="mt-3">
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleShadowChange(s.token, e.target.value)}
                    className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-md text-[10px] font-mono text-white/70 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                    title="Edit shadow value"
                  />
                </div>
                {isChanged && (
                  <button
                    onClick={() => handleShadowReset(s.token)}
                    className="mt-2 text-[8px] font-bold uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ═══ Z-INDEX (Read Only) ═══ */}
      <Section title="Z-Index Layers" id="z-index">
        <div className="relative h-[400px] bg-[var(--color-bg-surface)] border border-white/5 overflow-hidden">
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
                <span className="text-[var(--font-size-4xs)]  text-[var(--color-accent)] font-mono font-bold">{z.value}</span>
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
          <button className="px-3.5 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors shadow-md">
            SIGN IN
          </button>
          <FileBadge path="src/components/Header.tsx" />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Pill / Book Us</h3>
        <div className="flex flex-wrap items-center gap-4">
          <button className="px-6 py-2 border-2 border-white text-white text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
            BOOK US
          </button>
          <FileBadge path="src/components/Header.tsx" />
        </div>
      </Section>

      {/* ═══ FORMS ═══ */}
      <Section title="Form Inputs" id="forms">
        <div className="max-w-md space-y-4">
          <div>
            <label htmlFor="sg-text-input" className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Text Input</label>
            <input
              id="sg-text-input"
              type="text"
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors placeholder:text-white/20"
            />
          </div>
          <div>
            <label htmlFor="sg-email-input" className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Email</label>
            <input
              id="sg-email-input"
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors placeholder:text-white/20"
            />
          </div>
          <div>
            <label htmlFor="sg-textarea-input" className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Textarea</label>
            <textarea
              id="sg-textarea-input"
              placeholder="Write your message..."
              rows={4}
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors placeholder:text-white/20 resize-none"
            />
          </div>
          <div>
            <label htmlFor="sg-select-input" className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Select</label>
            <select id="sg-select-input" className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors">
              <option>Option One</option>
              <option>Option Two</option>
              <option>Option Three</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          LIVE COMPONENTS
          ═══════════════════════════════════════════ */}
      <Section title="Live Components" id="components">
        <p className="text-body mb-8 text-white/60">
          These are all real production components rendered live. Any token changes above are
          instantly reflected here. Edit a component file and it updates site-wide.
        </p>

        {/* ── 1. GLOBAL LAYOUT & NAVIGATION ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            1. Global Layout & Navigation
          </h2>
        </div>

        {/* Logo */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Logo</span>
          <FileBadge path="src/components/Logo.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-8 border border-white/5 mb-12 flex items-center justify-center">
          <Link href="/">
            <Logo className="h-16 text-white hover: text-[var(--color-accent)] transition-colors cursor-pointer" />
          </Link>
        </div>

        {/* Header Navigation */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Header Navigation</span>
          <FileBadge path="src/components/Header.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] border border-white/5 overflow-hidden mb-12">
          <div className="relative h-[80px]">
            <Header />
          </div>
        </div>

        {/* Footer */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Footer</span>
          <FileBadge path="src/components/Footer.tsx" />
        </h3>
        <div className="border border-white/5 overflow-hidden mb-12">
          <Footer />
        </div>

        {/* Page Navigation & Dev Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Page Navigation</span>
              <FileBadge path="src/components/PageNav.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 flex items-center justify-center">
              <PageNav />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Dev Performance Panel</span>
              <FileBadge path="src/components/DevPerformancePanel.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5">
              <DevPerformancePanel />
            </div>
          </div>
        </div>

        {/* Utility Visual Effects */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Layout & Visual Overlay Helpers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          <div className="bg-[var(--color-bg-surface)] p-4 border border-white/5 text-center">
            <span className="text-xs font-bold text-white block mb-1">ScrollToTop</span>
            <FileBadge path="src/components/ScrollToTop.tsx" />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-4 border border-white/5 text-center">
            <span className="text-xs font-bold text-white block mb-1">GrainOverlay</span>
            <FileBadge path="src/components/GrainOverlay.tsx" />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-4 border border-white/5 text-center">
            <span className="text-xs font-bold text-white block mb-1">CursorFollower</span>
            <FileBadge path="src/components/CursorFollower.tsx" />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-4 border border-white/5 text-center">
            <span className="text-xs font-bold text-white block mb-1">CustomScrollbar</span>
            <FileBadge path="src/components/CustomScrollbar.tsx" />
          </div>
        </div>


        {/* ── 2. NOTIFICATIONS & BANNERS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
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
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12 flex flex-wrap items-center gap-6">
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
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12 flex flex-col md:flex-row items-center justify-around gap-6">
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
            <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5">
              <EmergencyBroadcastCenter />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Cookie Consent Banner</span>
              <FileBadge path="src/components/CookieConsentBanner.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 relative min-h-[160px] overflow-hidden">
              <CookieConsentBanner />
            </div>
          </div>
        </div>


        {/* ── 3. MUSIC & AUDIO PLAYERS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            3. Music & Audio Players
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Featured Track Player</span>
          <FileBadge path="src/components/FeaturedTrack.tsx" />
        </h3>
        <div className="mb-12">
          <FeaturedTrack />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Hero Album Player</span>
          <FileBadge path="src/components/HeroAlbumPlayer.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] border border-white/5 overflow-hidden mb-12">
          <HeroAlbumPlayer />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Vinyl Hero Player</span>
          <FileBadge path="src/components/VinylHeroPlayer.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] border border-white/5 overflow-hidden mb-12 p-6">
          <VinylHeroPlayer />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Full Audio Player Section</span>
          <FileBadge path="src/components/AudioPlayer.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] border border-white/5 overflow-hidden mb-16 p-6">
          <AudioPlayerSection />
        </div>


        {/* ── 4. VIDEO PLAYERS & MEDIA ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            4. Video Players & Media
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Hero Video Player</span>
          <FileBadge path="src/components/HeroVideoPlayer.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] border border-white/5 overflow-hidden mb-12 p-6">
          <HeroVideoPlayer />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Video Section Grid</span>
          <FileBadge path="src/components/VideoSection.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <VideoSection />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Inline YouTube Player</span>
              <FileBadge path="src/components/InlineYTPlayer.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-4 border border-white/5 min-h-[220px]">
              <InlineYTPlayer videoId="BzHUNTZ66zY" title="Ain't That Just Beautiful" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
              <span>Custom YouTube Player</span>
              <FileBadge path="src/components/CustomYTPlayer.tsx" />
            </h3>
            <div className="bg-[var(--color-bg-surface)] p-4 border border-white/5 flex items-center justify-center min-h-[220px]">
              <FileBadge path="src/components/CustomYTPlayer.tsx" />
            </div>
          </div>
        </div>


        {/* ── 5. LIVE STREAMS & FEEDS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            5. Live Streams & Feeds
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Live Status Indicator</span>
          <FileBadge path="src/components/LiveStatusSign.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <LiveStatusSign />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Hero Live Hub</span>
          <FileBadge path="src/components/HeroLiveHub.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <HeroLiveHub />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Hero Live Thumbs</span>
          <FileBadge path="src/components/HeroLiveThumbs.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <HeroLiveThumbs />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Live Show Feed</span>
          <FileBadge path="src/components/LiveShowFeed.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-16">
          <LiveShowFeed />
        </div>


        {/* ── 6. TOUR, SHOWS & MAPS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            6. Tour, Shows & Maps
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Upcoming Shows Hub</span>
          <FileBadge path="src/components/HeroUpcomingShows.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
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

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Calendar Picker</span>
          <FileBadge path="src/components/CalendarPicker.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <CalendarPicker slots={[]} onChangeSlots={() => { }} startTime="7:00 PM" onStartTimeChange={() => { }} endTime="10:00 PM" onEndTimeChange={() => { }} label="Select Dates" />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Interactive Tour Map</span>
          <FileBadge path="src/components/TourMap.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-16 h-[350px]">
          <TourMap shows={[]} />
        </div>


        {/* ── 7. STORE & MERCH ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            7. Store & Merch
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Homepage Merch Grid</span>
          <FileBadge path="src/components/HomeMerch.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-16">
          <HomeMerch />
        </div>


        {/* ── 8. CRUISE EXPERIENCE ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            8. Cruise Experience
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Cruise History Timeline</span>
          <FileBadge path="src/components/CruiseHistoryTimeline.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <CruiseHistoryTimeline history={[]} />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Cruise Video Gallery</span>
          <FileBadge path="src/components/CruiseVideoGallery.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <CruiseVideoGallery />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Cruise Widgets</span>
          <FileBadge path="src/components/CruiseWidgets.tsx" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5">
            <EmbarkationCountdown />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5">
            <DailyPoll />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5">
            <ImportantLinksWidget />
          </div>
          <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5">
            <CaptainsLog />
          </div>
        </div>


        {/* ── 9. BAND, BIO & NEWS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            9. Band, Bio & News
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>News Hero Layouts</span>
          <FileBadge path="src/components/NewsHeroLayouts.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
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

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Accomplishments Showcase</span>
          <FileBadge path="src/components/AccomplishmentsLayouts.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
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

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Bio Parallax Slider</span>
          <FileBadge path="src/components/BioParallaxSlider.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-16">
          <BioParallaxSlider />
        </div>


        {/* ── 10. FAN INTERACTION & AUTH MODALS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            10. Fan Interaction & Auth Modals
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Fan Upload Form</span>
          <FileBadge path="src/components/FanUploadForm.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <FanUploadForm />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Profile Photo Uploader</span>
          <FileBadge path="src/components/ProfilePhotoUploader.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12 flex items-center justify-center">
          <ProfilePhotoUploader />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Direct Message Chat</span>
          <FileBadge path="src/components/DirectMessageChat.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-16">
          <DirectMessageChat />
        </div>


        {/* ── 11. MEMBER & CREW DASHBOARDS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            11. Member & Crew Dashboards
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Member Dashboard</span>
          <FileBadge path="src/components/MemberDashboard.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <MemberDashboard />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Crew HQ Hub</span>
          <FileBadge path="src/components/CrewHQ.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <CrewHQ />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Crew Feed</span>
          <FileBadge path="src/components/CrewFeed.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-16">
          <CrewFeed />
        </div>


        {/* ── 12. ADMIN CONTROL PANELS ── */}
        <div className="border-b border-white/10 pb-4 mb-8">
          <h2 className="text-xl font-black uppercase tracking-wider  text-[var(--color-accent)] font-[family-name:var(--font-rockstar)]">
            12. Admin Control Panels
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Award Picks Panel</span>
          <FileBadge path="src/components/admin/AwardPicksPanel.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <AwardPicksPanel />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Bulk Invite Panel</span>
          <FileBadge path="src/components/admin/BulkInvitePanel.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <BulkInvitePanel />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Referral Program Panel</span>
          <FileBadge path="src/components/admin/ReferralProgramPanel.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-12">
          <ReferralProgramPanel />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
          <span>Role Email Directory</span>
          <FileBadge path="src/components/admin/RoleEmailDirectory.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-6 border border-white/5 mb-16">
          <RoleEmailDirectory />
        </div>

      </Section>

      {/* ═══ Export CSS Modal ═══ */}
      {showExportModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowExportModal(false)}>
          <div
            className="bg-[#111] border border-white/10 w-full max-w-2xl mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-white">Export CSS Overrides</h3>
                <p className="text-[11px] text-white/40 mt-1">Copy this snippet and paste into your globals.css :root block</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-black/60 border border-white/5 p-4 text-[11px] font-mono text-emerald-300 overflow-auto max-h-[400px] leading-relaxed whitespace-pre-wrap">
                {generateExportCSS()}
              </pre>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateExportCSS());
                    setExportCopied(true);
                    setTimeout(() => setExportCopied(false), 2000);
                  }}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  {exportCopied ? '✓ Copied to Clipboard!' : '📋 Copy to Clipboard'}
                </button>
                <span className="text-[10px] text-white/30">
                  {totalChanges} token{totalChanges !== 1 ? 's' : ''} modified
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
