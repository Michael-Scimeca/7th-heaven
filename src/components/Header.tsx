"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMember } from "@/context/MemberContext";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import CruiseWaveAnimation from "@/components/CruiseWaveAnimation";

const leftNavLinks = [
  { href: "/bio", label: "BIO" },
  { href: "/music", label: "MUSIC" },
  { href: "/store", label: "STORE" },
  { href: "/video", label: "MEDIA" },
  { href: "/fan-photo-wall", label: "FAN WALL" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCrewLive, setIsCrewLive] = useState(false);
  const [hasLiveStreams, setHasLiveStreams] = useState(false);
  const { member, isLoggedIn, openModal, logout } = useMember();

  const isDemoFanPage = pathname === "/fans/demo";
  const isDemoCruisePage = pathname === "/cruise/demo";
  const isDemoPage = isDemoFanPage || isDemoCruisePage;

  // Check live stream status
  useEffect(() => {
    const checkLive = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/live-rooms");
        const data = await res.json();
        const allRooms = data.rooms || [];
        const validRooms = allRooms.filter((r: any) => r.name?.startsWith("live_"));

        if (validRooms.length > 0) {
          setHasLiveStreams(true);
          return;
        }

        const supabase = createClient();
        const { data: dbStreams } = await supabase
          .from("live_streams")
          .select("id")
          .eq("status", "live")
          .limit(1);

        setHasLiveStreams(!!(dbStreams && dbStreams.length > 0));
      } catch (err) {
        console.error("Failed to check live status", err);
      }
    };

    checkLive();
    const interval = setInterval(checkLive, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") checkLive();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const supabase = createClient();
    const channel = supabase
      .channel("header_live_events")
      .on("broadcast", { event: "stream_state" }, () => checkLive())
      .subscribe();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const check = () => setIsCrewLive(localStorage.getItem("crew_is_live") === "true");
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

  const displayRole = isDemoFanPage || isDemoCruisePage ? "fan" : member?.role || "fan";
  const displayName = isDemoFanPage ? "Demo Fan" : isDemoCruisePage ? "Demo Cruiser" : member?.name || "Guest";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const dashboardHref = isDemoFanPage
    ? "/fans/demo"
    : isDemoCruisePage
    ? "/cruise/demo"
    : displayRole === "event_planner"
    ? "/planner"
    : displayRole === "crew"
    ? "/crew"
    : displayRole === "admin"
    ? "/admin"
    : `/fans/${member?.username || "me"}`;

  const isAvatarUrl =
    member?.avatar &&
    (member.avatar.startsWith("http") || member.avatar.startsWith("/") || member.avatar.startsWith("data:"));

  return (
    <header className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full pt-[clamp(16px,4.5vw,80px)] px-[clamp(16px,4.5vw,80px)]">
        <div
          className="w-full h-[84px] flex items-center justify-between relative px-[clamp(20px,4vw,60px)] pt-3 bg-transparent pointer-events-auto"
        >
        
        {/* ── LEFT NAV GROUP ── */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 font-[family-name:var(--font-inter-tight)]">
          {leftNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[clamp(14px,1.4vw,22px)] font-semibold uppercase tracking-wider transition-colors duration-200 ${
                pathname === link.href ? "text-white" : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── CENTER LOGO ── */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center z-10"
          id="header-logo"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <div className="w-[150px] md:w-[180px] h-[26px]">
            <Logo className="w-full h-full text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
          </div>
        </Link>

        {/* ── RIGHT NAV & ACTIONS GROUP ── */}
        <div className="flex items-center gap-2.5 xl:gap-3.5 ml-auto lg:ml-0 font-[family-name:var(--font-inter-tight)] z-10">
          
          {/* Live Stream link */}
          <Link
            href="/live"
            className="hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(14px,1.4vw,22px)] font-semibold uppercase tracking-wider text-white hover:text-purple-300 transition-colors py-1"
          >
            {/* Live / Offline badge */}
            <span className="absolute -top-3.5 right-0 flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-white/90 bg-red-600/90 border border-red-400 px-1.5 py-[1px] rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)] whitespace-nowrap font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {hasLiveStreams ? "LIVE" : "OFFLINE"}
            </span>
            LIVE STREAM
          </Link>

          {/* Cruise link */}
          <Link
            href="/cruise"
            className="hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(14px,1.4vw,22px)] font-semibold uppercase tracking-wider text-white hover:text-purple-300 transition-colors py-1"
          >
            CRUISE
            <CruiseWaveAnimation />
          </Link>

          {/* Book Us pill button with spark accents */}
          <div className="hidden lg:flex flex-col items-center justify-center relative">
            {/* Top dashes \ | / */}
            <div className="flex items-center gap-1 text-white/40 text-[7px] leading-none mb-[2px] pointer-events-none tracking-widest font-mono">
              <span>\</span>
              <span>|</span>
              <span>/</span>
            </div>

            <Link
              href="/book"
              className="px-4 py-1.5 border-2 border-white rounded-[18px] text-white text-[clamp(12px,1.2vw,18px)] font-semibold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_12px_rgba(255,255,255,0.2)]"
            >
              BOOK US
            </Link>

            {/* Bottom dashes / | \ */}
            <div className="flex items-center gap-1 text-white/40 text-[7px] leading-none mt-[2px] pointer-events-none tracking-widest font-mono">
              <span>/</span>
              <span>|</span>
              <span>\</span>
            </div>
          </div>

          {/* Cart Icon */}
          <Link
            href="/store"
            className="text-white/80 hover:text-white transition-colors p-0.5 mx-0.5"
            title="Cart / Store"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </Link>

          {/* User Profile Avatar with FAN Badge */}
          <div className="flex items-center gap-1.5">
            <Link
              href={isLoggedIn || isDemoPage ? dashboardHref : "#"}
              onClick={(e) => {
                if (!isLoggedIn && !isDemoPage) {
                  e.preventDefault();
                  openModal("login");
                }
              }}
              className="relative w-11 h-11 rounded-full bg-[#38bdf8] border-2 border-[#38bdf8] flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md hover:scale-105 transition-transform"
              title={isLoggedIn ? displayName : "Sign In to Fan Account"}
            >
              {isAvatarUrl ? (
                <img src={member?.avatar} alt={displayName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-black text-sm">
                  {initials || "7H"}
                </div>
              )}
              
              {/* Overlapping Purple FAN Badge */}
              <span className="absolute -bottom-1 -right-2 w-6 h-6 bg-[#7c00ff] text-[9px] font-black uppercase text-white rounded-full border-2 border-[#100320] flex items-center justify-center shadow-lg leading-none">
                FAN
              </span>
            </Link>

            {/* Sign Out / Sign In Action Icon */}
            {isLoggedIn || isDemoPage ? (
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
                title="Sign Out"
                id="header-sign-out"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => openModal("login")}
                className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
                title="Sign In"
                id="header-sign-in"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="flex lg:hidden w-8 h-8 items-center justify-center z-50 relative ml-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            id="mobile-menu-toggle"
          >
            <span
              className={`relative w-[22px] h-0.5 transition-all duration-300 ${
                mobileOpen
                  ? "bg-transparent before:top-0 before:rotate-45 after:bottom-0 after:-rotate-45"
                  : "bg-white before:-top-[7px] after:-bottom-[7px]"
              } before:content-[''] before:absolute before:left-0 before:w-full before:h-0.5 before:bg-white before:transition-all before:duration-300 after:content-[''] after:absolute after:left-0 after:w-full after:h-0.5 after:bg-white after:transition-all after:duration-300`}
            />
          </button>
        </div>

        {/* ── MOBILE OVERLAY DRAWER ── */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-[#0c021a]/98 backdrop-blur-3xl z-40 flex flex-col justify-center items-center gap-6 font-[family-name:var(--font-rockstar)]">
            <Link href="/bio" className="text-2xl font-black text-white uppercase">BIO</Link>
            <Link href="/music" className="text-2xl font-black text-white uppercase">MUSIC</Link>
            <Link href="/store" className="text-2xl font-black text-white uppercase">STORE</Link>
            <Link href="/video" className="text-2xl font-black text-white uppercase">MEDIA</Link>
            <Link href="/fan-photo-wall" className="text-2xl font-black text-white uppercase">FAN WALL</Link>
            <Link href="/live" className="text-2xl font-black text-white uppercase">LIVE STREAM</Link>
            <Link href="/cruise" className="text-2xl font-black text-white uppercase">CRUISE</Link>
            <Link href="/book" className="px-6 py-2 border-2 border-white rounded-[20px] text-white text-lg font-black uppercase mt-4">BOOK US</Link>
          </div>
        )}

      </div>
    </div>
  </header>
  );
}
