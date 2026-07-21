"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMember } from "@/context/MemberContext";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

const navLinks: { href: string; label: string; isCta?: boolean }[] = [
 { href: "/bio", label: "Bio" },
 { href: "/music", label: "Music" },
 { href: "/store", label: "Store" },
 { href: "/video", label: "Video" },
 { href: "/live", label: "Live" },
 { href: "/cruise", label: "Cruise" },
 { href: "/fan-photo-wall", label: "Fan Wall" },
 { href: "/book", label: "Book Us", isCta: true },
];

export function Header() {
 const pathname = usePathname();
 const router = useRouter();
 const [scrolled, setScrolled] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const [isCrewLive, setIsCrewLive] = useState(false);
 const [hasLiveStreams, setHasLiveStreams] = useState(false);
 const { member, isLoggedIn, openModal, logout } = useMember();

 const isDemoFanPage = pathname === '/fans/demo';
 const isDemoCruisePage = pathname === '/cruise/demo';
 const isDemoPage = isDemoFanPage || isDemoCruisePage;

 // Check for active live streams
 useEffect(() => {
  const checkLive = async () => {
   if (document.visibilityState !== 'visible') return;
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
  const interval = setInterval(checkLive, 60000); // Backed off to 60s, relies on realtime channel below
  
  // Handle visibility changes to trigger an immediate check when user returns
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') checkLive();
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Real-time listener for instant updates
  const supabase = createClient();
  const channel = supabase.channel('header_live_events')
    .on('broadcast', { event: 'stream_state' }, (payload: any) => {
      if (payload.payload?.isLive !== undefined) {
        checkLive(); // Re-evaluate when any stream state changes
      }
    })
    .subscribe();
    
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
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
 className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
 scrolled
 ? "bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-[var(--color-border)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
 : "bg-transparent border-white/0"
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
   <div className="w-[106px] h-[20px] md:w-[120px] md:h-[22px]">
    <Logo className="w-full h-full text-white" />
   </div>
  </Link>

 {/* Desktop Nav */}
 <nav
 className={`flex items-center gap-1 max-lg:fixed max-lg:inset-0 max-lg:flex-col max-lg:justify-center max-lg:items-center max-lg:gap-6 max-lg:bg-[rgba(10,10,15,0.95)] max-lg:backdrop-blur-3xl ${
 mobileOpen ? "max-lg:opacity-100 max-lg:pointer-events-auto max-lg:visible" : "max-lg:opacity-0 max-lg:pointer-events-none max-lg:invisible"
 }`}
 id="main-nav"
 >
  {navLinks
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
    className={`relative px-2.5 py-1 text-[0.7rem] uppercase font-bold tracking-wider transition-all duration-200 max-lg:text-lg max-lg:px-6 max-lg:py-3 flex items-center gap-1.5 group/navlink ${
    link.isCta
     ? "text-white bg-[var(--color-accent)] hover:bg-[#9d3cff] rounded-full px-4 py-1 font-black tracking-widest shadow-[0_0_12px_rgba(133,29,239,0.35)] hover:shadow-[0_0_20px_rgba(133,29,239,0.5)] hover:scale-105 max-lg:mt-2 text-[0.65rem]"
     : pathname === link.href
      ? "text-[var(--color-text-primary)]"
      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
    }`}
    id={`nav-${link.label.toLowerCase()}`}
   >
    {link.label === "Live" && hasLiveStreams && (
     <span 
      className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" 
      title="Live streams are currently active!"
     />
    )}
    {link.label}
    {link.label === "Live" && !hasLiveStreams && (
      <span 
       className="text-[7px] font-black uppercase tracking-widest text-white/30 px-1 py-0 rounded border border-white/10 bg-white/[0.02] ml-1"
      >
       offline
      </span>
     )}
    {link.label === "Live" && !isLoggedIn && (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover/navlink:block pointer-events-none z-[100]">
        <div className="bg-black/95 text-[9px] text-white/80 border border-white/10 rounded px-2.5 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.8)] whitespace-nowrap">
          <span className="text-[var(--color-accent)] font-bold">Note:</span> Sign in to chat & join raffles during live streams
        </div>
        {/* Tooltip arrow */}
        <div className="w-1.5 h-1.5 bg-black border-l border-t border-white/10 absolute -top-1 left-1/2 -translate-x-1/2 rotate-45" />
      </div>
     )}
    {pathname === link.href && (
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 accent-gradient-bg " />
    )}
   </Link>
  ))}



 {isCrewLive && (
  <button
   onClick={() => isLoggedIn ? router.push("/crew") : openModal("login")}
   className="relative flex items-center gap-2 px-4 py-1.5 ml-4 mr-2 text-sm font-extrabold tracking-widest text-white uppercase bg-red-600 rounded-full hover:bg-red-500 hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all animate-pulse border border-red-400"
   id="nav-go-live"
  >
   <span className="w-2 h-2 bg-white rounded-full drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]"></span>
   Go Live
  </button>
 )}
 </nav>

 {/* Actions */}
 <div className="flex items-center gap-4 z-10">

 {(isLoggedIn || isDemoPage) ? (
 <div className="flex items-center gap-2">
  {/* Role label badge */}
  {(() => {
    const role = isDemoFanPage || isDemoCruisePage ? 'fan' : member?.role;
    const isCruiseSignup = !!member?.cruise_signup_id;
    const isCruiseOnly = member?.signup_source === 'cruise_member_signup' || isDemoCruisePage;
    const showCruise = isCruiseSignup || isDemoCruisePage || (pathname ? pathname.startsWith('/cruise') : false);

    if (role === 'admin') {
     return (
      <div className="flex items-center gap-1.5">
       <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-2xs font-black uppercase tracking-[0.15em] border bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.15)]">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h20v2H2v-2zm1-7l4 5h10l4-5-3-6-4 4-2-7-2 7-4-4-3 6z" /></svg>
        ADMIN
       </span>
       {showCruise && (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-2xs font-black uppercase tracking-[0.15em] border bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]">
         🚢 CRUISE
        </span>
       )}
      </div>
     );
    }

    if (role === 'crew') {
     return (
      <div className="flex items-center gap-1.5">
       <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-2xs font-black uppercase tracking-[0.15em] border bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.15)]">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        CREW
       </span>
       {showCruise && (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-2xs font-black uppercase tracking-[0.15em] border bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]">
         🚢 CRUISE
        </span>
       )}
      </div>
     );
    }

    if (role === 'event_planner') {
     return (
      <div className="flex items-center gap-1.5">
       <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-2xs font-black uppercase tracking-[0.15em] border bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400 shadow-[0_0_6px_rgba(217,70,239,0.15)]">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
        PLANNER
       </span>
       {showCruise && (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-2xs font-black uppercase tracking-[0.15em] border bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]">
         🚢 CRUISE
        </span>
       )}
      </div>
     );
    }

    if (showCruise) {
     if (isCruiseOnly) {
      return (
       <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-2xs font-black uppercase tracking-[0.15em] border bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]">
        🚢 CRUISE MEMBER
       </span>
      );
     }

     if (showCruise) {
       return (
        <div className="flex items-center gap-1.5">
         <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-2xs font-black uppercase tracking-[0.15em] border bg-white/[0.06] border-white/[0.12] text-white/50">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          FAN
         </span>
         <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-2xs font-black uppercase tracking-[0.15em] border bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]">
          🚢 CRUISE MEMBER
         </span>
        </div>
       );
     }
    }

    return (
     <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-2xs font-black uppercase tracking-[0.15em] border bg-white/[0.06] border-white/[0.12] text-white/50">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
      FAN
     </span>
    );
   })()}
 {(() => {
   const displayRole = isDemoFanPage || isDemoCruisePage ? 'fan' : member?.role;
   const displayName = isDemoFanPage ? 'Demo Fan' : (isDemoCruisePage ? 'Demo Cruiser' : member?.name || 'Guest');
   const displayInitials = displayName ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : (member?.avatar || 'G');
   const dashboardHref = isDemoFanPage ? '/fans/demo'
    : isDemoCruisePage ? '/cruise/demo'
    : displayRole === 'event_planner' ? '/planner'
    : displayRole === 'crew' ? '/crew'
    : displayRole === 'admin' ? '/admin'
    : `/fans/${member?.username || 'me'}`;
   const dashboardTitle = isDemoFanPage ? 'Fan Dashboard (Demo)'
    : isDemoCruisePage ? 'Cruise Dashboard (Demo)'
    : displayRole === 'event_planner' ? 'Planner Dashboard'
    : displayRole === 'crew' ? 'Crew Dashboard'
    : displayRole === 'admin' ? 'Admin Dashboard'
    : 'Fan Dashboard';
  return (
  <Link
   href={dashboardHref}
   className="relative w-9 h-9 flex items-center justify-center bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)] text-xs font-bold hover:bg-[var(--color-accent)]/30 transition-all"
   title={dashboardTitle}
  >
   {displayInitials}
   {/* Role indicator dot */}
   {(() => {
    if (displayRole === 'admin') return (
     <span className="absolute -bottom-[3px] -right-[3px] w-[14px] h-[14px] rounded-full bg-amber-400 border-2 border-[rgb(10,10,15)] flex items-center justify-center">
      <svg width="7" height="7" viewBox="0 0 24 24" fill="rgb(10,10,15)"><path d="M2 20h20v2H2v-2zm1-7l4 5h10l4-5-3-6-4 4-2-7-2 7-4-4-3 6z" /></svg>
     </span>
    );
    if (displayRole === 'crew') return (
     <span className="absolute -bottom-[3px] -right-[3px] w-[14px] h-[14px] rounded-full bg-emerald-400 border-2 border-[rgb(10,10,15)] flex items-center justify-center">
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="rgb(10,10,15)" strokeWidth="4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
     </span>
    );
    if (displayRole === 'event_planner') return (
     <span className="absolute -bottom-[3px] -right-[3px] w-[14px] h-[14px] rounded-full bg-fuchsia-500 border-2 border-[rgb(10,10,15)] flex items-center justify-center">
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="rgb(10,10,15)" strokeWidth="3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
     </span>
    );
    const isCruiseSignup = !!member?.cruise_signup_id;
    const isCruiseOnly = member?.signup_source === 'cruise_member_signup';
    const showCruise = isCruiseSignup || isCruiseOnly || (pathname ? pathname.startsWith('/cruise') : false);
    if (showCruise) {
      return (
       <span className="absolute -bottom-[3px] -right-[3px] w-[14px] h-[14px] rounded-full bg-cyan-400 border-2 border-[rgb(10,10,15)] flex items-center justify-center text-[8px] leading-none">
        🚢
       </span>
      );
     }
    return (
     <span className="absolute -bottom-[3px] -right-[3px] w-[12px] h-[12px] rounded-full bg-white/50 border-2 border-[rgb(10,10,15)] flex items-center justify-center">
      <svg width="6" height="6" viewBox="0 0 24 24" fill="rgb(10,10,15)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
     </span>
    );
   })()}
  </Link>
  );
 })()}
 <button
  onClick={() => { logout(); window.location.href = '/'; }}
  className="h-9 px-3 flex items-center justify-center gap-2 border border-white/10 text-white/30 hover:border-rose-500/40 hover:text-rose-400 transition-all cursor-pointer bg-white/[0.02]"
  title="Sign Out"
  id="header-sign-out"
 >
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Sign Out</span>
 </button>
 </div>
  ) : (
   <div className="flex items-center gap-1.5">
      <button
        onClick={() => openModal("login")}
        className="h-7 px-2.5 flex items-center justify-center gap-1.5 border border-white/15 text-white/40 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all cursor-pointer bg-white/[0.02] rounded-md"
        title="Sign In"
       >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span className="text-[0.65rem] font-bold uppercase tracking-wider hidden sm:block">Sign In</span>
       </button>
      <button
       onClick={() => openModal("signup")}
       className="h-7 px-2.5 flex items-center justify-center gap-1.5 border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all cursor-pointer bg-[rgba(133,29,239,0.08)] rounded-md shadow-[0_0_10px_rgba(133,29,239,0.15)]"
       title="Sign Up"
      >
       <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
       <span className="text-[0.65rem] font-bold uppercase tracking-wider hidden sm:block">Sign Up</span>
      </button>
   </div>
  )}
 <button
 className="hidden max-lg:flex w-8 h-8 items-center justify-center z-50 relative"
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
