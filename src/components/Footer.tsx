"use client";
/* oxlint-disable react-doctor/no-prevent-default */
/* eslint-disable react-doctor/no-prevent-default */
import Image from 'next/image';

import Link from "next/link";
import { Smartphone, Check, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMember } from "@/context/MemberContext";
import { useState, useEffect, useCallback } from "react";
import { useTransition } from "@/context/TransitionContext";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import dynamic from "next/dynamic";

// Decorative physics scene (matter-js) — not needed for SSR/SEO, and it
// renders on every page via the global Footer, so keep it out of the
// shared initial bundle.
const FooterPicks = dynamic(() => import("@/components/FooterPicks"), { ssr: false });

const FALLBACK_PLATFORM_LINKS = [
  { name: "Apple Music", url: "https://music.apple.com", label: " Music" },
  { name: "Amazon", url: "https://music.amazon.com", label: "Amazon" },
  { name: "YouTube", url: "https://www.youtube.com", label: "YouTube" },
  { name: "Facebook", url: "https://www.facebook.com/7thheavenband", label: "Facebook" },
  { name: "Instagram", url: "https://www.instagram.com", label: "Instagram" },
  { name: "X", url: "https://x.com", label: "X / Twitter" },
  { name: "Myspace", url: "https://myspace.com", label: "Myspace" },
  { name: "ReverbNation", url: "https://www.reverbnation.com", label: "ReverbNation" },
  { name: "Spotify", url: "https://open.spotify.com/artist/7thheavenband", label: "Spotify" },
  { name: "Shazam", url: "https://www.shazam.com", label: "Shazam" },
  { name: "SoundCloud", url: "https://soundcloud.com", label: "SoundCloud" },
];

const FALLBACK_ENDORSEMENTS = [
  { name: "Shure", logoPath: "/images/sponsor-logos/SHURE.svg" },
  { name: "Dunlop", logoPath: "/images/sponsor-logos/DUNLOP.svg" },
  { name: "Mesa/Boogie", logoPath: "/images/sponsor-logos/Mesa_Boogie_Engineering_Logo.svg.svg" },
  { name: "Paiste", logoPath: "/images/sponsor-logos/PRASISTE.svg" },
  { name: "Ernie Ball", logoPath: "/images/sponsor-logos/ERNIEBALL.svg" },
  { name: "Dean Markley", logoPath: "/images/sponsor-logos/Dean-Markley-logo.svg" },
  { name: "Vic Firth", logoPath: "/images/sponsor-logos/VIC.svg" },
  { name: "Parker", logoPath: "/images/sponsor-logos/Parker_guitars_logo.svg" },
  { name: "Grundorf", logoPath: "/images/sponsor-logos/groundorf.svg" },
  { name: "Toontrack", logoPath: "/images/sponsor-logos/TOON.svg" },
];

const footerLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/notifications", label: "Push Alerts" },
  { href: "/shows/past", label: "Past Shows Archive" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/returns", label: "Returns & Refunds" },
  { href: "/sitemap", label: "Sitemap" },
];

const FALLBACK_SOCIAL_LINKS = [
  { name: "Spotify", url: "https://open.spotify.com/artist/7thheavenband" },
  { name: "Apple Music", url: "https://music.apple.com" },
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "Facebook", url: "https://www.facebook.com/7thheavenband" },
  { name: "Instagram", url: "https://www.instagram.com" },
];

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export function Footer() {
  const { member, openModal } = useMember();
  const router = useRouter();
  const isPlanner = member?.role === 'event_planner';

  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // SMS Text Alerts
  const [smsPhone, setSmsPhone] = useState('');
  const [smsZip, setSmsZip] = useState('');
  const [smsDistance, setSmsDistance] = useState('50');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');



  const [endorsements, setEndorsements] = useState(FALLBACK_ENDORSEMENTS);
  const [socialLinks, setSocialLinks] = useState(FALLBACK_SOCIAL_LINKS);
  const [bookingPhone, setBookingPhone] = useState('847-551-5363');
  const [bookingEmail, setBookingEmail] = useState('Rich@7thheaven.com');

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;
      if (data.endorsements?.length) setEndorsements(data.endorsements);
      if (data.socialLinks?.length) setSocialLinks(data.socialLinks);
      if (data.bookingPhone) setBookingPhone(data.bookingPhone);
      if (data.bookingEmail) setBookingEmail(data.bookingEmail);
    } catch { }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Scroll-driven reveal via mask-image (not opacity).
  // Tracks content-area's bottom edge so the mask opens exactly when page
  // content lifts off the footer — 1:1 pixel-perfect sync.
  const [revealPct, setRevealPct] = useState(0); // 0 = hidden, 1 = fully visible

  useEffect(() => {
    let ticking = false;
    let cachedFooterHeight = 420;
    const footerEl = document.getElementById('footer');
    const contentArea = document.querySelector<HTMLElement>('#page-content-wrapper > .content-area');

    const updateFooterHeight = () => {
      if (footerEl) {
        cachedFooterHeight = footerEl.offsetHeight || 420;
        document.documentElement.style.setProperty('--footer-reveal-height', `${cachedFooterHeight}px`);
      }
    };

    updateFooterHeight();

    const updateReveal = () => {
      // Fast path: skip DOM layout reads if scroll position is far above footer reveal zone
      const winH = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const docH = document.documentElement.scrollHeight;
      if (docH - (scrollY + winH) > cachedFooterHeight * 2.5) {
        setRevealPct((prev) => (prev !== 0 ? 0 : prev));
        return;
      }

      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const contentBottom = contentArea?.getBoundingClientRect().bottom ?? winH;
        const pct = Math.max(0, Math.min(1, (winH - contentBottom) / cachedFooterHeight));
        setRevealPct((prev) => (Math.abs(prev - pct) > 0.001 ? pct : prev));
      });
    };

    const lenis = (window as any).__lenis;
    if (lenis) lenis.on('scroll', updateReveal);
    window.addEventListener('scroll', updateReveal, { passive: true });
    window.addEventListener('resize', updateFooterHeight, { passive: true });
    updateReveal();

    return () => {
      const l = (window as any).__lenis;
      if (l) l.off('scroll', updateReveal);
      window.removeEventListener('scroll', updateReveal);
      window.removeEventListener('resize', updateFooterHeight);
    };
  }, []);

  // Hide footer when the overlay is at full coverage (isCovered=true).
  // This is driven by the overlay animation event — not the route change —
  // so it stays perfectly in sync with the transition reveal.
  const { isCovered } = useTransition();

  return (
    <footer
      className="relative text-[var(--text-color)] pt-8 pb-6 overflow-hidden"
      id="footer"
      suppressHydrationWarning
      style={(() => {
        // Mask opens bottom-to-top: as page content lifts off the footer, the
        // BOTTOM portion of the footer is uncovered first (content edge moves up).
        // revealPct=0 → fully clipped; revealPct=1 → fully visible.
        const p = revealPct * 100;             // 0–100
        const visibleStart = 100 - p;          // top of the visible portion (%)
        const fadeZone = 12;                   // gradient fade width (% of footer)
        const fadeStart = Math.min(100, visibleStart + fadeZone); // where solid begins

        const mask = p <= 0
          ? 'linear-gradient(to bottom, transparent 0%, transparent 100%)'   // all hidden
          : p >= 100
            ? 'linear-gradient(to bottom, black 0%, black 100%)'             // all visible
            : `linear-gradient(to bottom, transparent 0%, transparent ${visibleStart.toFixed(1)}%, black ${fadeStart.toFixed(1)}%, black 100%)`;

        const isHidden = isCovered || revealPct < 0.02;
        return {
          opacity: isHidden ? 0 : Math.min(1, revealPct * 4),
          visibility: isHidden ? 'hidden' : 'visible',
          pointerEvents: isHidden ? 'none' : 'auto',
          zIndex: isHidden ? -1 : 1,
          maskImage: mask,
          WebkitMaskImage: mask,
        };
      })()}
    >
      <FooterPicks />

      <div className="relative z-10">
        {/* Free Push Alerts (ntfy) Banner */}
        <div id="push-alerts-footer" className="site-container pt-0 pb-6">
          <div className="max-w-2xl bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-black/50 p-6 rounded-2xl border border-purple-500/30 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                <Bell className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-[var(--font-heading)] text-lg font-black uppercase tracking-tight text-white">Instant Free Push Alerts</h3>
                <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">No phone number &middot; No carrier text fees</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Get instant push notifications straight to your phone or browser the moment 7th Heaven drops new shows, ticket links, or merch restocks.
            </p>
            <Link
              href="/notifications"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              <Bell className="w-4 h-4" /> Enable Free Push Alerts &rarr;
            </Link>
          </div>
        </div>

        {/* Endorsements */}
        <div className="site-container py-8 text-left">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted-text)] mb-6 sm:mb-8">Official Gear Endorsements</p>
          <div className="flex flex-wrap justify-start items-center gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {endorsements.map((brand) => (
              <Image width={200} height={200} unoptimized
                key={brand.name}
                src={`${brand.logoPath}?v=3`}
                alt={brand.name}
                className="h-[clamp(16px,4.5vw,28px)] md:h-7 max-w-[28vw] sm:max-w-none w-auto object-contain opacity-100 shrink-0"
                loading="lazy"
              />
            ))}
          </div>
        </div>

        {/* Inline Links Row — MOVED TO BOTTOM */}
        <div className="site-container pt-2 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Nav Links */}
            <div className="flex flex-wrap items-center gap-1">
              {footerLinks.map((link, i) => (
                <span key={link.href} className="flex items-center">
                  <Link href={link.href} className="text-[13px] font-semibold tracking-wide text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                  {i < footerLinks.length - 1 && (
                    <span className="text-[var(--color-accent)] mx-2 text-[13px] font-bold">/</span>
                  )}
                </span>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-1">
              {socialLinks.map((link, i) => (
                <span key={link.name} className="flex items-center">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold tracking-wide !text-white hover:!text-white/80 transition-colors" style={{ color: '#ffffff' }}>
                    {link.name}
                  </a>
                  {i < socialLinks.length - 1 && (
                    <span className="text-[var(--color-accent)] mx-2 text-[13px] font-bold">/</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Credit Line */}
        <div className="site-container pt-1 pb-4 flex items-center justify-end">
          <a
            href="https://michaelscimeca.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-wide !text-white  hover:text-white transition-colors"
          >
            Hey Mom Look I Built This Thing
          </a>
        </div>
      </div>
    </footer>
  );
}
