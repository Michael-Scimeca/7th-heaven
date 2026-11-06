"use client";
/* oxlint-disable react-doctor/no-prevent-default */
/* eslint-disable react-doctor/no-prevent-default */
import Image from "next/image";

import { Smartphone, Check, Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useMember } from "@/context/MemberContext";
import { useState, useEffect, type CSSProperties } from "react";
import { useSettings } from "@/lib/useSettings";
import { useTransition } from "@/context/TransitionContext";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import SeventhButton from "@/components/SeventhButton";
import dynamic from "next/dynamic";
import {
  FALLBACK_SOCIAL_LINKS,
  normalizeSocialLinks,
  SocialPlatformIcon,
} from "@/components/SocialPlatformIcon";

const FALLBACK_PLATFORM_LINKS = [
  {
    name: "Apple Music",
    url: "https://music.apple.com/us/artist/7th-heaven/711717089",
    label: "Apple Music",
  },
  { name: "Amazon", url: "https://music.amazon.com", label: "Amazon" },
  { name: "YouTube", url: "https://www.youtube.com", label: "YouTube" },
  {
    name: "Facebook",
    url: "https://www.facebook.com/7thheavenband",
    label: "Facebook",
  },
  { name: "Instagram", url: "https://www.instagram.com", label: "Instagram" },
  { name: "X", url: "https://x.com", label: "X / Twitter" },
  { name: "Myspace", url: "https://myspace.com", label: "Myspace" },
  {
    name: "ReverbNation",
    url: "https://www.reverbnation.com",
    label: "ReverbNation",
  },
  {
    name: "Spotify",
    url: "https://open.spotify.com/artist/7thheavenband",
    label: "Spotify",
  },
  { name: "Shazam", url: "https://www.shazam.com", label: "Shazam" },
  { name: "SoundCloud", url: "https://soundcloud.com", label: "SoundCloud" },
];

const FALLBACK_ENDORSEMENTS = [
  { name: "Shure", logoPath: "/images/sponsor-logos/shure.svg" },
  { name: "Dunlop", logoPath: "/images/sponsor-logos/dunlop.svg" },
  {
    name: "Mesa/Boogie",
    logoPath: "/images/sponsor-logos/mesa-boogie-engineering-logo.svg.svg",
  },
  { name: "Paiste", logoPath: "/images/sponsor-logos/prasiste.svg" },
  { name: "Ernie Ball", logoPath: "/images/sponsor-logos/ernieball.svg" },
  {
    name: "Dean Markley",
    logoPath: "/images/sponsor-logos/dean-markley-logo.svg",
  },
  { name: "Vic Firth", logoPath: "/images/sponsor-logos/vic.svg" },
  { name: "Parker", logoPath: "/images/sponsor-logos/parker-guitars-logo.svg" },
  { name: "Grundorf", logoPath: "/images/sponsor-logos/groundorf.svg" },
  { name: "Toontrack", logoPath: "/images/sponsor-logos/toon.svg" },
];

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export function Footer() {
  const { member, openModal } = useMember();
  const router = useRouter();
  const pathname = usePathname();
  const isPlanner = member?.role === "event_planner";

  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  // SMS Text Alerts
  const [smsPhone, setSmsPhone] = useState("");
  const [smsZip, setSmsZip] = useState("");
  const [smsDistance, setSmsDistance] = useState("50");
  const [smsStatus, setSmsStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const [endorsements, setEndorsements] = useState(FALLBACK_ENDORSEMENTS);
  const [socialLinks, setSocialLinks] = useState(FALLBACK_SOCIAL_LINKS);
  const [bookingPhone, setBookingPhone] = useState("847-551-5363");
  const [bookingEmail, setBookingEmail] = useState("Rich@7thheaven.com");

  // Shared with HomeDataLoader (and any other consumer) via useSettings --
  // one deduplicated /api/settings fetch instead of each component running
  // its own. See src/lib/useSettings.ts for why this exists.
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;
    const data = settings as {
      endorsements?: typeof FALLBACK_ENDORSEMENTS;
      socialLinks?: unknown;
      bookingPhone?: string;
      bookingEmail?: string;
    };
    if (data.endorsements?.length) setEndorsements(data.endorsements);
    if (data.socialLinks) setSocialLinks(normalizeSocialLinks(data.socialLinks));
    if (data.bookingPhone) setBookingPhone(data.bookingPhone);
    if (data.bookingEmail) setBookingEmail(data.bookingEmail);
  }, [settings]);

  // Hide footer when the overlay is at full coverage (isCovered=true).
  // This is driven by the overlay animation event — not the route change —
  // so it stays perfectly in sync with the transition reveal.
  const { isCovered } = useTransition();

  if (
    pathname?.startsWith("/studio") ||
    pathname?.startsWith("/transition-test")
  )
    return null;

  const isCrewOrAdminRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/crew");

  return (
    <footer
      className={`relative z-20 overflow-hidden ${isCovered ? "pointer-events-none hidden opacity-0" : "block opacity-100"}`}
      id="footer"
      suppressHydrationWarning
    >
      <div className="site-container relative z-10">
        {/* Endorsements & Social Links — share one row until their intrinsic widths no longer fit */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4 pb-6 md:justify-between">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-4 sm:gap-x-6 sm:gap-y-6 md:justify-start">
            {endorsements.map((brand) => {
              const logoSrc = brand.logoPath.includes("?")
                ? `${brand.logoPath}&v=3`
                : `${brand.logoPath}?v=3`;
              return (
                <span
                  key={brand.name}
                  title={brand.name}
                  style={
                    {
                      "--sponsor-logo-url": `url("${logoSrc}")`,
                    } as CSSProperties
                  }
                  className="footer-sponsor-logo shrink-0"
                >
                  <Image
                    width={200}
                    height={200}
                    unoptimized
                    src={logoSrc}
                    alt={brand.name}
                    className="footer-sponsor-logo-img pointer-events-none block object-contain opacity-0"
                    loading="lazy"
                  />
                </span>
              );
            })}
          </div>

          <div className="flex min-w-0 grow flex-wrap items-center justify-center gap-2 md:justify-end">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                title={link.name}
                className="footer-social-link"
              >
                <SocialPlatformIcon name={link.name} url={link.url} />
              </a>
            ))}
          </div>
        </div>

        {/* Credit Line */}
        <div className="site-container absolute inset-x-0 bottom-0 flex items-center justify-center text-[10px] md:justify-end">
          <a
            href="https://michaelscimeca.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Hey Mom Look I Built This Thing
          </a>
        </div>
      </div>
    </footer>
  );
}
