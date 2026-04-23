"use client";

import Link from "next/link";

const platformLinks = [
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

const endorsements = [
  { name: "Shure", path: "/images/sponsor-logos/SHURE.svg" },
  { name: "Dunlop", path: "/images/sponsor-logos/DUNLOP.svg" },
  { name: "Mesa/Boogie", path: "/images/sponsor-logos/Mesa_Boogie_Engineering_Logo.svg.svg" },
  { name: "Paiste", path: "/images/sponsor-logos/PRASISTE.svg" },
  { name: "Ernie Ball", path: "/images/sponsor-logos/ERNIEBALL.svg" },
  { name: "Dean Markley", path: "/images/sponsor-logos/Dean-Markley-logo.svg" },
  { name: "Vic Firth", path: "/images/sponsor-logos/VIC.svg" },
  { name: "Parker", path: "/images/sponsor-logos/Parker_guitars_logo.svg" },
  { name: "Grundorf", path: "/images/sponsor-logos/groundorf.svg" },
  { name: "Toontrack", path: "/images/sponsor-logos/TOON.svg" },
];

const footerLinks = [
  { href: "/news", label: "News" },
  { href: "/bio", label: "Bio" },
  { href: "/tour", label: "Tour" },
  { href: "/#music-player-section", label: "Music" },
  { href: "/video", label: "Video" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  { name: "Spotify", url: "https://open.spotify.com/artist/7thheavenband" },
  { name: "Apple Music", url: "https://music.apple.com" },
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "Facebook", url: "https://www.facebook.com/7thheavenband" },
  { name: "Instagram", url: "https://www.instagram.com" },
];

export function Footer() {
  return (
    <footer className="relative bg-black pt-24 pb-12 overflow-hidden border-t border-white/5" id="footer">
      <div className="site-container relative z-10">

        {/* Book The Band — Bold CTA */}
        <div className="mb-10">
          <h2 className="font-[var(--font-heading)] text-[clamp(1.5rem,3vw,2.2rem)] font-black uppercase tracking-tight text-white mb-1">
            Book The Band
          </h2>
          <div className="w-20 h-[3px] bg-[var(--color-accent)] mb-8" />

          <a href="tel:8475515363" className="block font-[var(--font-heading)] text-[clamp(2.2rem,6vw,4rem)] font-extrabold italic text-white/90 hover:text-white transition-colors leading-[1.1] tracking-tight">
            847-551-5363
          </a>
          <a href="mailto:Rich@7thheaven.com" className="block font-[var(--font-heading)] text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold italic text-[var(--color-accent)] hover:text-white transition-colors leading-[1.1] tracking-tight">
            Rich@7thheaven.com
          </a>
        </div>

        {/* Inline Links — Stacked Rows */}
        <div className="flex flex-col gap-4 py-6 border-t border-white/10">
          {/* Nav Links — spaced */}
          <div className="flex flex-wrap items-center gap-6">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Links — purple slash separators */}
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
              src={brand.path}
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
