"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMember } from "@/context/MemberContext";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
 { href: "/", label: "Home" },
 { href: "/tour", label: "Tour" },
 { href: "/bio", label: "Bio" },
 { href: "/video", label: "Video" },
 { href: "/live", label: "Live" },
 { href: "/cruise", label: "Cruise" },
 { href: "/fan-photo-wall", label: "Fan Wall" },
 { href: "/book", label: "Book" },
];

export function Header() {
 const pathname = usePathname();
 const router = useRouter();
 const [scrolled, setScrolled] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const [isCrewLive, setIsCrewLive] = useState(false);
 const [hasLiveStreams, setHasLiveStreams] = useState(false);
 const { member, isLoggedIn, openModal, logout } = useMember();

 // Check for active live streams
 useEffect(() => {
  const checkLive = async () => {
   try {
    // 1. Check LiveKit API
    const res = await fetch("/api/live-rooms");
    const data = await res.json();
    const allRooms = data.rooms || [];
    
    // Count any room that starts with 'live_' as a valid stream
    const validRooms = allRooms.filter((r: any) => r.name?.startsWith('live_'));
    
    if (validRooms.length > 0) {
      setHasLiveStreams(true);
      return;
    }
    
    // 3. Fallback: check Supabase directly for live status
    const supabase = createClient();
    const { data: dbStreams } = await supabase
      .from('live_streams')
      .select('id')
      .eq('status', 'live')
      .limit(1);
      
    setHasLiveStreams(!!(dbStreams && dbStreams.length > 0));
    
   } catch (err) {
    console.error("Failed to check live status", err);
   }
  };
  checkLive();
  const interval = setInterval(checkLive, 5000); // Check every 5s for faster toggling
  
  // Real-time listener for instant updates
  const supabase = createClient();
  const channel = supabase.channel('header_live_events')
    .on('broadcast', { event: 'stream_state' }, (payload) => {
      if (payload.payload?.isLive !== undefined) {
        checkLive(); // Re-evaluate when any stream state changes
      }
    })
    .subscribe();
    
  return () => {
    clearInterval(interval);
    supabase.removeChannel(channel);
  };
 }, []);

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
  <Link 
    href="/" 
    className="z-10 relative" 
    id="header-logo"
    onClick={(e) => {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }}
  >
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
  {navLinks
    .filter(link => link.label !== "Live" || hasLiveStreams)
    .map((link) => (
   <Link
    key={link.href}
    href={link.href}
    onClick={(e) => {
      if (pathname === link.href) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMobileOpen(false);
      }
    }}
    className={`relative px-4 py-2 text-[0.85rem] font-medium tracking-wide transition-colors duration-150 max-md:text-xl max-md:px-6 max-md:py-3 flex items-center gap-2 ${
    pathname === link.href
    ? "text-[var(--color-text-primary)]"
    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
    }`}
    id={`nav-${link.label.toLowerCase()}`}
   >
    {link.label === "Live" && hasLiveStreams && (
     <span 
      className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" 
      title="Live streams are currently active!"
     />
    )}
    {link.label}
    {pathname === link.href && (
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 accent-gradient-bg " />
    )}
   </Link>
  ))}



 {isCrewLive && (
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
 <div className="flex items-center gap-2">
 <Link
  href={member?.role === 'event_planner' ? '/planner' : member?.role === 'crew' ? '/crew' : member?.role === 'admin' ? '/admin' : '/fans'}
  className="relative w-9 h-9 flex items-center justify-center bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)] text-xs font-bold hover:bg-[var(--color-accent)]/30 transition-all"
  title={member?.role === 'event_planner' ? 'Planner Dashboard' : member?.role === 'crew' ? 'Crew Dashboard' : member?.role === 'admin' ? 'Admin Dashboard' : 'Fan Dashboard'}
 >
  {member!.name ? member!.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : member!.avatar}
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
   if (role === 'event_planner') return (
    <span className="absolute -bottom-[3px] -right-[3px] w-[14px] h-[14px] rounded-full bg-fuchsia-500 border-2 border-[rgb(10,10,15)] flex items-center justify-center">
     <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="rgb(10,10,15)" strokeWidth="3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
    </span>
   );
   return (
    <span className="absolute -bottom-[3px] -right-[3px] w-[12px] h-[12px] rounded-full bg-white/50 border-2 border-[rgb(10,10,15)] flex items-center justify-center">
     <svg width="6" height="6" viewBox="0 0 24 24" fill="rgb(10,10,15)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
    </span>
   );
  })()}
 </Link>
 <button
  onClick={() => { logout(); window.location.href = '/'; }}
  className="h-9 px-3 flex items-center justify-center gap-2 border border-white/10 text-white/30 hover:border-rose-500/40 hover:text-rose-400 transition-all cursor-pointer bg-white/[0.02]"
  title="Sign Out"
  id="header-sign-out"
 >
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  <span className="text-[0.6rem] font-bold uppercase tracking-widest hidden sm:block">Sign Out</span>
 </button>
 </div>
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
