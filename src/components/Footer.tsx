"use client";
/* oxlint-disable react-doctor/no-prevent-default */
/* eslint-disable react-doctor/no-prevent-default */
import Image from 'next/image';

import Link from "next/link";
import { Smartphone, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMember } from "@/context/MemberContext";
import { useState, useEffect, useCallback } from "react";
import { useTransition } from "@/context/TransitionContext";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
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
        <div className="site-container relative z-10">



        </div>

        {/* SMS Text Alerts */}
        <div className="site-container pt-0 pb-2" suppressHydrationWarning>
          <div className="max-w-2xl" suppressHydrationWarning>
            <div className="flex items-center gap-3 mb-1" suppressHydrationWarning>
              <Smartphone className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="font-[var(--font-heading)] text-lg font-black uppercase tracking-tight text-[var(--text-color)]">Text Alerts</h3>
            </div>
            <p className="text-base text-[var(--muted-text)] mb-5">Get a text when we book a show near you. Local shows only — no spam.</p>
            {smsStatus === 'success' ? (
              <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <Check className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-bold text-emerald-600">You&apos;re subscribed! We&apos;ll text you when we&apos;re in your area.</p>
              </div>
            ) : (
              <form
                suppressHydrationWarning
                onSubmit={async (e) => {
                  e.preventDefault();
                  const digits = smsPhone.replace(/\D/g, '');
                  if (digits.length < 10 || !smsZip || smsZip.length < 5) return;
                  setSmsStatus('sending');
                  try {
                    const res = await fetch('/api/sms/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phone: smsPhone, zipCode: smsZip, distance: smsDistance, name: member?.name || '' }),
                    });
                    if (res.ok) { setSmsStatus('success'); setSmsPhone(''); setSmsZip(''); }
                    else setSmsStatus('error');
                  } catch { setSmsStatus('error'); }
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full"
              >
                <div className="input-glow-border rounded-lg flex-1 min-w-[175px] sm:min-w-[190px]" suppressHydrationWarning>
                  <input aria-label="Input field"
                    type="tel"
                    value={smsPhone}
                    onChange={e => setSmsPhone(formatPhone(e.target.value))}
                    placeholder="(555) 123-4567"
                    required
                    suppressHydrationWarning
                    className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] text-sm text-[var(--text-color)] placeholder:text-[var(--muted-text)] outline-none transition-colors rounded-lg"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0" suppressHydrationWarning>
                  <div className="input-glow-border rounded-lg w-24 sm:w-28" suppressHydrationWarning>
                    <input aria-label="Input field"
                      type="text"
                      value={smsZip}
                      onChange={e => setSmsZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="Zip code"
                      required
                      maxLength={5}
                      suppressHydrationWarning
                      className="w-full px-3 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] text-sm text-[var(--text-color)] placeholder:text-[var(--muted-text)] outline-none transition-colors rounded-lg"
                    />
                  </div>
                  <div className="shrink-0 flex items-center">
                    <GooeyMessagesDropdown
                      placeholder={`${smsDistance} mi`}
                      defaultSelectedId={String(smsDistance)}
                      customers={[
                        { id: "25", name: "25 mi" },
                        { id: "50", name: "50 mi" },
                        { id: "100", name: "100 mi" },
                        { id: "200", name: "200 mi" },
                      ]}
                      onSelect={(opt) => setSmsDistance(opt.id)}
                    />
                  </div>
                </div>
                <button aria-label="Action button"
                  type="submit"
                  disabled={smsStatus === 'sending'}
                  className="w-full sm:w-auto shrink-0 px-6 py-3 bg-linear-to-r from-[#6917BF] via-[#8c0eaf] to-[#6F008E] text-white font-bold text-sm uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(255,10,61,0.2)] whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {smsStatus === 'sending' ? '...' : <><Smartphone className="w-4 h-4" /> Subscribe</>}
                </button>
              </form>
            )}
            {smsStatus === 'error' && <p className="text-xs text-rose-500 mt-2">Something went wrong. Try again.</p>}
            <p className="text-xs text-[var(--muted-text)] mt-3">Msg & data rates may apply. Reply STOP to unsubscribe. <Link href="/privacy" className="underline hover:text-[var(--text-color)] transition-colors">Privacy</Link> & <Link href="/terms" className="underline hover:text-[var(--text-color)] transition-colors">Terms</Link>.</p>
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
