"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMember } from "@/context/MemberContext";
import Logo from "@/components/Logo";

const navLinks = [
 { href: "/", label: "Home" },
 { href: "/tour", label: "Tour" },
 { href: "/bio", label: "Bio" },
 { href: "/video", label: "Video" },
 { href: "/shows", label: "Past Shows" },
 { href: "/live/test-room", label: "Live" },
 { href: "/fan-photo-wall", label: "Fan Wall" },
 { href: "/book", label: "Book" },
];

export function Header() {
 const pathname = usePathname();
 const router = useRouter();
 const isShowPlaying = false; // MOCK STATE: True when show is active
 const [scrolled, setScrolled] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const [isCrewLive, setIsCrewLive] = useState(false);
 const { member, isLoggedIn, openModal } = useMember();

 // Poll localStorage every second to detect if this crew member is live
 useEffect(() => {
  const check = () => setIsCrewLive(localStorage.getItem('crew_is_live') === 'true');
  check();
  const interval = setInterval(check, 1000);
  return () => clearInterval(interval);
 }, []);

 useEffect(() => {
 const handler = () => setScrolled(window.scrollY > 40);
 window.addEventListener("scroll", handler, { passive: true });
 return () => window.removeEventListener("scroll", handler);
 }, []);

 useEffect(() => {
 setMobileOpen(false);
 }, [pathname]);

 return (
 <header
 className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
 scrolled
 ? "bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-[var(--color-border)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
 : "bg-transparent"
 }`}
 >
 <div className="site-container flex items-center justify-between h-[72px]">
 {/* Logo */}
  <Link href="/" className="z-10" id="header-logo">
   <div className="w-[160px] h-[32px] md:w-[180px] md:h-[36px]">
    <Logo className="w-full h-full text-white" />
   </div>
  </Link>

 {/* Desktop Nav */}
 <nav
 className={`flex items-center gap-1 max-md:fixed max-md:inset-0 max-md:flex-col max-md:justify-center max-md:items-center max-md:gap-6 max-md:bg-[rgba(10,10,15,0.95)] max-md:backdrop-blur-3xl max-md:transition-opacity max-md:duration-300 ${
 mobileOpen ? "max-md:opacity-100 max-md:pointer-events-auto" : "max-md:opacity-0 max-md:pointer-events-none"
 }`}
 id="main-nav"
 >
 {navLinks.map((link) => (
  <Link
   key={link.href}
   href={link.href}
   className={`relative px-4 py-2 text-[0.85rem] font-medium tracking-wide transition-colors duration-150 max-md:text-xl max-md:px-6 max-md:py-3 ${
   pathname === link.href
   ? "text-[var(--color-text-primary)]"
   : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
   }`}
   id={`nav-${link.label.toLowerCase()}`}
  >
   {link.label === "Live" && isShowPlaying && (
    <span 
     className="inline-block w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full animate-pulse z-10" 
     style={{ boxShadow: "0 0 8px 1px rgba(16, 185, 129, 0.8)" }}
     title="Live streams are currently active!"
    />
   )}
   {link.label}
   {pathname === link.href && (
   <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 accent-gradient-bg " />
   )}
  </Link>
 ))}

 {/* ── Crew/Admin-only links — hidden from public ── */}
 {isLoggedIn && (member?.role === 'crew' || member?.role === 'admin' || member?.role === 'merch') && (
  <>
   <span className="w-px h-4 bg-white/10 mx-1" />
   <Link
    href="/crew"
    className={`relative px-3 py-1.5 text-[0.75rem] font-bold uppercase tracking-widest transition-colors duration-150 flex items-center gap-1.5 ${
     pathname === '/crew'
      ? 'text-emerald-400'
      : 'text-emerald-400/60 hover:text-emerald-400'
    }`}
    id="nav-crew-dashboard"
   >
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
    Crew
    {pathname === '/crew' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-emerald-400" />}
   </Link>
   {/* Fan-facing live page — only visible when actively broadcasting */}
   {isCrewLive && (() => {
    const firstName = (member?.name || 'michael').split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const fanRoom = `/live/live_${firstName}`;
    return (
     <Link
      href={fanRoom}
      className={`relative px-3 py-1.5 text-[0.75rem] font-bold uppercase tracking-widest transition-colors duration-150 flex items-center gap-1.5 ${
       pathname === fanRoom ? 'text-red-400' : 'text-red-400/50 hover:text-red-400'
      }`}
      id="nav-fan-view"
      title={`Fan page: ${fanRoom}`}
     >
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      Fan View
      {pathname === fanRoom && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-red-400" />}
     </Link>
    );
   })()}
   {member?.role === 'admin' && (
    <Link
     href="/sitemap"
     className={`relative px-3 py-1.5 text-[0.75rem] font-bold uppercase tracking-widest transition-colors duration-150 ${
      pathname === '/sitemap'
       ? 'text-amber-400'
       : 'text-amber-400/50 hover:text-amber-400'
     }`}
     id="nav-sitemap"
    >
     Sitemap
     {pathname === '/sitemap' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-amber-400" />}
    </Link>
    )}
    {/* Merch dashboard — merch/crew/admin */}
    <Link
     href="/merch"
     className={`relative px-3 py-1.5 text-[0.75rem] font-bold uppercase tracking-widest transition-colors duration-150 flex items-center gap-1.5 ${
      pathname === '/merch'
       ? 'text-yellow-400'
       : 'text-yellow-400/60 hover:text-yellow-400'
     }`}
     id="nav-merch-dashboard"
    >
     <span className="text-xs">🛍️</span>
     Merch
     {pathname === '/merch' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-yellow-400" />}
    </Link>
   </>
 )}

 {isShowPlaying && (
  <button
   onClick={() => isLoggedIn ? router.push("/crew") : openModal("login")}
   className="relative flex items-center gap-2 px-4 py-1.5 ml-4 mr-2 text-[0.75rem] font-extrabold tracking-widest text-white uppercase bg-red-600 rounded-full hover:bg-red-500 hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all animate-pulse border border-red-400"
   id="nav-go-live"
  >
   <span className="w-2 h-2 bg-white rounded-full drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]"></span>
   Go Live
  </button>
 )}
 </nav>

 {/* Actions */}
 <div className="flex items-center gap-4 z-10">

 {isLoggedIn ? (
 <Link
  href="/members"
  className="relative w-9 h-9 flex items-center justify-center bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)] text-xs font-bold hover:bg-[var(--color-accent)]/30 transition-all"
  title="Member Dashboard"
 >
  {member!.avatar}
  {/* Role indicator */}
  {(() => {
   const role = member?.role;
   if (role === 'admin') return (
    <span className="absolute -bottom-[3px] -right-[3px] w-[14px] h-[14px] rounded-full bg-amber-400 border-2 border-[rgb(10,10,15)] flex items-center justify-center">
     <svg width="7" height="7" viewBox="0 0 24 24" fill="rgb(10,10,15)"><path d="M2 20h20v2H2v-2zm1-7l4 5h10l4-5-3-6-4 4-2-7-2 7-4-4-3 6z" /></svg>
    </span>
   );
   if (role === 'crew') return (
    <span className="absolute -bottom-[3px] -right-[3px] w-[14px] h-[14px] rounded-full bg-emerald-400 border-2 border-[rgb(10,10,15)] flex items-center justify-center">
     <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="rgb(10,10,15)" strokeWidth="4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    </span>
   );
   return (
    <span className="absolute -bottom-[3px] -right-[3px] w-[12px] h-[12px] rounded-full bg-white/50 border-2 border-[rgb(10,10,15)] flex items-center justify-center">
     <svg width="6" height="6" viewBox="0 0 24 24" fill="rgb(10,10,15)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
    </span>
   );
  })()}
 </Link>
 ) : (
 <button
  onClick={() => openModal("login")}
  className="h-9 px-3 flex items-center justify-center gap-2 border border-white/15 text-white/40 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all cursor-pointer bg-white/[0.02]"
  title="Sign In or Sign Up"
 >
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  <span className="text-[0.65rem] font-bold uppercase tracking-widest hidden sm:block">Sign In / Sign Up</span>
 </button>
 )}
 <button
 className="hidden max-md:flex w-8 h-8 items-center justify-center"
 onClick={() => setMobileOpen(!mobileOpen)}
 aria-label="Toggle navigation"
 id="mobile-menu-toggle"
 >
 <span
 className={`relative w-[22px] h-0.5 transition-all duration-300 ${
 mobileOpen
 ? "bg-transparent before:top-0 before:rotate-45 after:bottom-0 after:-rotate-45"
 : "bg-[var(--color-text-primary)] before:-top-[7px] after:-bottom-[7px]"
 } before:content-[''] before:absolute before:left-0 before:w-full before:h-0.5 before:bg-[var(--color-text-primary)] before: before:transition-all before:duration-300 after:content-[''] after:absolute after:left-0 after:w-full after:h-0.5 after:bg-[var(--color-text-primary)] after: after:transition-all after:duration-300`}
 />
 </button>
 </div>
 </div>
 </header>
 );
}
