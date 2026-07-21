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
    className={`relative px-2.5 py-1.5 uppercase font-bold tracking-wider transition-all duration-200 max-lg:text-lg max-lg:px-6 max-lg:py-3 inline-flex items-center justify-center gap-1.5 leading-none group/navlink font-[family-name:var(--font-rockstar)] ${
    link.isCta
     ? "text-white bg-[var(--color-accent)] hover:bg-[#9d3cff] rounded-full px-4.5 py-2 font-black tracking-widest shadow-[0_0_12px_rgba(133,29,239,0.35)] hover:shadow-[0_0_20px_rgba(133,29,239,0.5)] hover:scale-105 max-lg:mt-2 text-[clamp(11px,1.1vw,18px)]"
     : `text-[clamp(12px,1.35vw,22px)] ${
        pathname === link.href
         ? "text-[var(--color-text-primary)]"
         : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
       }`
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
        className="absolute -top-2.5 left-0 text-[7px] font-black uppercase tracking-widest text-white/40 px-1 py-0 rounded border border-white/10 bg-white/[0.04] pointer-events-none whitespace-nowrap"
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
  <div className="flex items-center gap-2.5">
   {/* Logged in User Avatar Box + Overlapping Badge */}
   {(() => {
    const displayRole = isDemoFanPage || isDemoCruisePage ? 'fan' : (member?.role || 'fan');
    const displayName = isDemoFanPage ? 'Demo Fan' : (isDemoCruisePage ? 'Demo Cruiser' : member?.name || 'Guest');
    const displayInitials = displayName ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : 'G';
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

    const roleBadgeText = displayRole === 'admin' ? 'ADMIN'
     : displayRole === 'crew' ? 'CREW'
     : displayRole === 'event_planner' ? 'PLANNER'
     : 'FAN';

    const badgeColors = displayRole === 'admin' ? 'bg-[#291705] border-amber-500/60 text-amber-400'
     : displayRole === 'crew' ? 'bg-[#052912] border-emerald-500/60 text-emerald-400'
     : displayRole === 'event_planner' ? 'bg-[#280529] border-fuchsia-500/60 text-fuchsia-400'
     : 'bg-[#14121a] border-white/20 text-white/70';

    const isAvatarUrl = member?.avatar && (member.avatar.startsWith('http') || member.avatar.startsWith('/') || member.avatar.startsWith('data:'));

    return (
     <Link
      href={dashboardHref}
      className="relative w-10 h-10 flex items-center justify-center bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)]/70 text-purple-300 text-sm font-black hover:bg-[var(--color-accent)]/35 hover:border-[var(--color-accent)] transition-all rounded-sm"
      title={dashboardTitle}
     >
      {isAvatarUrl ? (
       <img src={member.avatar} alt={displayName} className="w-full h-full object-cover rounded-sm" />
      ) : (
       displayInitials
      )}
      {/* Overlapping Pill Badge */}
      <span className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-[1px] rounded-full text-[9px] font-black tracking-widest border uppercase whitespace-nowrap shadow-lg ${badgeColors}`}>
       <span className="w-1.5 h-1.5 rounded-full bg-current" />
       {roleBadgeText}
      </span>
     </Link>
    );
   })()}

   {/* Square Sign Out Button */}
   <button
    onClick={() => { logout(); window.location.href = '/'; }}
    className="w-10 h-10 flex items-center justify-center border border-white/15 text-white/50 hover:border-white/40 hover:text-white transition-all cursor-pointer bg-white/[0.04] hover:bg-white/[0.08] rounded-sm"
    title="Sign Out"
    id="header-sign-out"
   >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
     <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
     <polyline points="16 17 21 12 16 7"/>
     <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
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
