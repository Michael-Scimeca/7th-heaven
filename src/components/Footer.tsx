"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMember } from "@/context/MemberContext";
import { useState, useEffect } from "react";

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
  { href: "/news", label: "News" },
  { href: "/bio", label: "Bio" },
  { href: "/tour", label: "Tour" },
  { href: "/#music-player-section", label: "Music" },
  { href: "/video", label: "Video" },
  { href: "/contact", label: "Contact" },
];

const FALLBACK_SOCIAL_LINKS = [
  { name: "Spotify", url: "https://open.spotify.com/artist/7thheavenband" },
  { name: "Apple Music", url: "https://music.apple.com" },
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "Facebook", url: "https://www.facebook.com/7thheavenband" },
  { name: "Instagram", url: "https://www.instagram.com" },
];

export function Footer() {
  const { member, openModal } = useMember();
  const router = useRouter();
  const isPlanner = member?.role === 'event_planner';

  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // SMS Text Alerts
  const [smsPhone, setSmsPhone] = useState('');
  const [smsZip, setSmsZip] = useState('');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const [endorsements, setEndorsements] = useState(FALLBACK_ENDORSEMENTS);
  const [socialLinks, setSocialLinks] = useState(FALLBACK_SOCIAL_LINKS);
  const [bookingPhone, setBookingPhone] = useState('847-551-5363');
  const [bookingEmail, setBookingEmail] = useState('Rich@7thheaven.com');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (!data) return;
        if (data.endorsements?.length) setEndorsements(data.endorsements);
        if (data.socialLinks?.length) setSocialLinks(data.socialLinks);
        if (data.bookingPhone) setBookingPhone(data.bookingPhone);
        if (data.bookingEmail) setBookingEmail(data.bookingEmail);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="relative bg-black pt-24 pb-12 overflow-hidden border-t border-white/5" id="footer">
      <div className="site-container relative z-10">

        {/* Book The Band — Bold CTA (Planner only) */}
        {isPlanner && (
        <div className="mb-10">
          <h2 className="font-[var(--font-heading)] text-[clamp(1.5rem,3vw,2.2rem)] font-black uppercase tracking-tight text-white mb-1">
            Book The Band
          </h2>
          <div className="w-20 h-[3px] bg-[var(--color-accent)] mb-8" />

          <a href={`tel:${bookingPhone.replace(/-/g, '')}`} className="block font-[var(--font-heading)] text-[clamp(2.2rem,6vw,4rem)] font-extrabold italic text-white/90 hover:text-white transition-colors leading-[1.1] tracking-tight">
            {bookingPhone}
          </a>
          <a href={`mailto:${bookingEmail}`} className="block font-[var(--font-heading)] text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold italic text-[var(--color-accent)] hover:text-white transition-colors leading-[1.1] tracking-tight">
            {bookingEmail}
          </a>
        </div>
        )}

        {/* Inline Links — Single Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-white/10">
          {/* Nav Links */}
          <div className="flex flex-wrap items-center gap-6">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                if (member?.role === 'crew') {
                  router.push('/crew');
                } else {
                  openModal('login');
                }
              }}
              className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            >
              Crew Login
            </button>
            <Link href="/planner?login=true" className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors">
              Planner Login
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-1">
            {socialLinks.map((link, i) => (
              <span key={link.name} className="flex items-center">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors">
                  {link.name}
                </a>
                {i < socialLinks.length - 1 && (
                  <span className="text-[var(--color-accent)] mx-3 text-[0.7rem] font-bold">/</span>
                )}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* SMS Text Alerts */}
      <div className="site-container py-12 border-t border-white/5">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-lg">📱</span>
            <h3 className="font-[var(--font-heading)] text-lg font-black uppercase tracking-tight text-white">Text Alerts</h3>
          </div>
          <p className="text-[0.7rem] text-white/40 mb-5">Get a text when we book a show near you. Local shows only — no spam.</p>
          {smsStatus === 'success' ? (
            <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <span className="text-emerald-400 text-lg">✓</span>
              <p className="text-sm font-bold text-emerald-400">You&apos;re subscribed! We&apos;ll text you when we&apos;re in your area.</p>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const digits = smsPhone.replace(/\D/g, '');
                if (digits.length < 10 || !smsZip || smsZip.length < 5) return;
                setSmsStatus('sending');
                try {
                  const res = await fetch('/api/sms/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: smsPhone, zipCode: smsZip, name: member?.name || '' }),
                  });
                  if (res.ok) { setSmsStatus('success'); setSmsPhone(''); setSmsZip(''); }
                  else setSmsStatus('error');
                } catch { setSmsStatus('error'); }
              }}
              className="flex flex-wrap gap-2"
            >
              <input
                type="tel"
                value={smsPhone}
                onChange={e => setSmsPhone(formatPhone(e.target.value))}
                placeholder="(555) 123-4567"
                required
                className="flex-1 min-w-[140px] px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors rounded-lg"
              />
              <input
                type="text"
                value={smsZip}
                onChange={e => setSmsZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Zip code"
                required
                maxLength={5}
                className="w-24 px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors rounded-lg"
              />
              <button
                type="submit"
                disabled={smsStatus === 'sending'}
                className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.7rem] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(133,29,239,0.2)] whitespace-nowrap"
              >
                {smsStatus === 'sending' ? '...' : '📱 Subscribe'}
              </button>
            </form>
          )}
          {smsStatus === 'error' && <p className="text-xs text-rose-400 mt-2">Something went wrong. Try again.</p>}
          <p className="text-[0.55rem] text-white/20 mt-3">Msg & data rates may apply. Reply STOP to unsubscribe. <a href="/privacy" className="underline hover:text-white/40 transition-colors">Privacy</a> & <a href="/terms" className="underline hover:text-white/40 transition-colors">Terms</a>.</p>
        </div>
      </div>

      {/* Massive Typographic Footer Logo */}
      <div className="relative mt-12 select-none pointer-events-none overflow-hidden max-h-[20vw]">
        <h1 className="text-[18vw] leading-[0.8] font-black text-[#0d0d0d] uppercase tracking-[-0.02em] text-center whitespace-nowrap px-4 italic">
          7th Heaven
        </h1>
      </div>

      {/* Endorsements */}
      <div className="site-container border-t border-white/5 py-16 text-center">
        <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/20 mb-12">Official Gear Endorsements</p>
        <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-10 px-4">
          {endorsements.map((brand) => (
            <img
              key={brand.name}
              src={brand.logoPath}
              alt={brand.name}
              className="h-6 md:h-8 w-auto transition-all duration-300 hover:brightness-100"
              style={{ filter: 'invert(1) brightness(0.4)' }}
              loading="lazy"
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'invert(1) brightness(0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'invert(1) brightness(0.4)'; }}
            />
          ))}
        </div>
      </div>

      {/* Legal Bottom */}
      <div className="site-container border-t border-white/5 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8 text-[0.65rem] font-black uppercase tracking-widest text-white/30 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/sitemap" className="hover:text-[var(--color-accent)] transition-colors">Sitemap</Link>
          <Link href="/admin?login=true" className="hover:text-[var(--color-accent)] transition-colors">Admin</Link>
          <Link href="/planner?login=true" className="hover:text-[var(--color-accent)] transition-colors">Planner</Link>
        </div>
        <p className="text-[0.65rem] font-black uppercase tracking-widest text-white/20">
          Designed & Developed by NTD Records © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
