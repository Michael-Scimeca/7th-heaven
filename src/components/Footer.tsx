"use client";
/* oxlint-disable react-doctor/no-prevent-default */
/* eslint-disable react-doctor/no-prevent-default */
import Image from 'next/image';

import TransitionLink from "@/components/TransitionLink";
import { Smartphone, Check, Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useMember } from "@/context/MemberContext";
import { useState, useEffect } from "react";
import { useSettings } from "@/lib/useSettings";
import { useTransition } from "@/context/TransitionContext";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import dynamic from "next/dynamic";
import FooterProximityAlerts from "@/components/FooterProximityAlerts";



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
  const pathname = usePathname();
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

  // Shared with HomeDataLoader (and any other consumer) via useSettings --
  // one deduplicated /api/settings fetch instead of each component running
  // its own. See src/lib/useSettings.ts for why this exists.
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;
    const data = settings as {
      endorsements?: typeof FALLBACK_ENDORSEMENTS;
      socialLinks?: typeof FALLBACK_SOCIAL_LINKS;
      bookingPhone?: string;
      bookingEmail?: string;
    };
    if (data.endorsements?.length) setEndorsements(data.endorsements);
    if (data.socialLinks?.length) setSocialLinks(data.socialLinks);
    if (data.bookingPhone) setBookingPhone(data.bookingPhone);
    if (data.bookingEmail) setBookingEmail(data.bookingEmail);
  }, [settings]);

  // Hide footer when the overlay is at full coverage (isCovered=true).
  // This is driven by the overlay animation event — not the route change —
  // so it stays perfectly in sync with the transition reveal.
  const { isCovered } = useTransition();

  if (pathname?.startsWith("/studio")) return null;

  return (

    <footer
      className={`relative pb-8 overflow-hidden ${isCovered ? "hidden opacity-0 pointer-events-none" : "block opacity-100"
        }`}
      id="footer"
      suppressHydrationWarning>

      <div className="relative z-10 site-container">
        {/* Proximity Distance & Free Push Alerts Section */}
        <div id="push-alerts-footer" className="py-6">
          <FooterProximityAlerts />
        </div>

        {/* Endorsements */}
        <div className="py-8 text-left">
          <p className="uppercase tracking-[0.3em] mb-6 sm:mb-8">Official Gear Endorsements</p>
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
        <div className="pt-2 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Nav Links */}
            <div className="flex flex-wrap items-center gap-1">
              {footerLinks.map((link, i) => (
                <span key={link.href} className="flex items-center">
                  <TransitionLink href={link.href} className="text-[13px] font-semibold text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </TransitionLink>
                  {i < footerLinks.length - 1 && (
                    <span className="text-[var(--color-accent)] mx-2 text-[13px]">/</span>
                  )}
                </span>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-1">
              {socialLinks.map((link, i) => (
                <span key={link.name} className="flex items-center">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold !text-white hover:!text-white/80 transition-colors" style={{ color: '#ffffff' }}>
                    {link.name}
                  </a>
                  {i < socialLinks.length - 1 && (
                    <span className="text-[var(--color-accent)] mx-2 text-[13px]">/</span>
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
            className="tracking-wide !text-white hover:text-white transition-colors">
            Hey Mom Look I Built This Thing
          </a>
        </div>
      </div>
    </footer>
  );
}
