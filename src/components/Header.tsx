/* eslint-disable react-doctor/no-giant-component */
"use client";
import Image from 'next/image';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useMember } from "@/context/MemberContext";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import CruiseWaveAnimation from "@/components/CruiseWaveAnimation";
import { useTransition } from "@/context/TransitionContext";
import GooeyDropdown from "@/components/GooeyDropdown";

const leftNavLinks = [
  { href: "/media", label: "MEDIA" },
  { href: "/shows/past", label: "PAST SHOWS" },
  { href: "/fan-photo-wall", label: "FAN WALL" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, pendingHref } = useTransition();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasLiveStreams, setHasLiveStreams] = useState(false);
  const { member, isLoggedIn, openModal, logout } = useMember();

  // During a transition the pathname hasn't changed yet (we delay navigation).
  // Use the pending destination so the correct nav link highlights immediately.
  const effectivePathname =
    (mode === "covering" || mode === "covered") && pendingHref
      ? pendingHref
      : pathname;

  const isNavActive = useCallback((targetHref: string) => {
    if (!effectivePathname) return false;
    if (targetHref === "/") return effectivePathname === "/";
    return (
      effectivePathname === targetHref ||
      effectivePathname.startsWith(targetHref + "/") ||
      effectivePathname.startsWith(targetHref + "?")
    );
  }, [effectivePathname]);

  const isDemoFanPage = pathname === "/fans/demo";
  const isDemoCruisePage = pathname === "/cruise/demo";
  const isDemoPage = isDemoFanPage || isDemoCruisePage;

  const checkLive = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    try {
      const res = await fetch("/api/live-rooms");
      if (!res.ok) return;
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
    } catch {
      // Silent catch for background live check to prevent dev overlay popups when offline/restarting
    }
  }, []);

  useEffect(() => {
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
  }, [checkLive]);



  const isScrolledRef = useRef(false);

  useEffect(() => {
    let rafId: number | null = null;

    const checkScroll = () => {
      rafId = null;
      const isPastThreshold = window.scrollY > 40;
      if (isScrolledRef.current !== isPastThreshold) {
        isScrolledRef.current = isPastThreshold;
        setScrolled(isPastThreshold);
      }
    };

    const handler = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(checkScroll);
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    checkScroll();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handler);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (mobileOpen) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if ((window as any).__lenis) {
        try { (window as any).__lenis.stop(); } catch { }
      }
    } else {
      html.style.overflow = "";
      body.style.overflow = "";
      if ((window as any).__lenis) {
        try { (window as any).__lenis.start(); } catch { }
      }
    }
    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
    };
  }, [mobileOpen]);

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
      : displayRole === "admin"
        ? "/admin"
        : displayRole === "crew"
          ? "/crew"
          : (displayRole as string) === "event_planner" || (displayRole as string) === "planner"
            ? "/planner"
            : displayRole === "cruise"
              ? `/cruise/${member?.username || "dashboard"}`
              : `/fans/${member?.username || "me"}`;

  const isAvatarUrl =
    member?.avatar &&
    (member.avatar.startsWith("http") || member.avatar.startsWith("/") || member.avatar.startsWith("data:"));

  const badgeText =
    displayRole === "admin"
      ? "ADMIN"
      : displayRole === "crew"
        ? "CREW"
        : (displayRole as string) === "event_planner" || (displayRole as string) === "planner"
          ? "PLANNER"
          : displayRole === "cruise"
            ? "CRUISE"
            : displayRole === "merch"
              ? "MERCH"
              : "FAN";

  const badgeBg =
    displayRole === "admin"
      ? "bg-[var(--color-purple-primary)]"
      : displayRole === "crew"
        ? "bg-emerald-600"
        : (displayRole as string) === "event_planner" || (displayRole as string) === "planner"
          ? "bg-[var(--color-accent)]"
          : displayRole === "cruise"
            ? "bg-sky-500"
            : displayRole === "merch"
              ? "bg-blue-600"
              : "bg-[var(--color-accent)]";

  return (
    <header
      className={`fixed top-0 left-0 right-0 ${mobileOpen ? "z-[9999]" : "z-50"} transition-colors duration-300 pointer-events-none pt-2 ${scrolled
        ? "bg-[var(--surface-overlay)] backdrop-blur-xl  text-[var(--text-color)]"
        : "bg-transparent text-white"
        }`}
      style={{
        maskImage: "linear-gradient(to bottom, black 0%, black var(--header-mask-fade-start, 70%), transparent var(--header-mask-fade-end, 100%))",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black var(--header-mask-fade-start, 70%), transparent var(--header-mask-fade-end, 100%))"
      }}
      suppressHydrationWarning
    >
      <div className="w-full max-w-full site-container">
        <div
          id="nav-inner-card"
          suppressHydrationWarning
          className="w-full h-[80px] flex items-center justify-between relative pointer-events-auto gap-4 z-50"
        >

          {/* ── LEFT NAV GROUP (Desktop >= 1024px) ── */}
          <nav className="hidden lg:flex lg:flex-1 lg:justify-start items-center gap-6 xl:gap-8 font-[family-name:var(--font-barlow)] relative z-50">
            {/* Gooey dropdown — replaces the plain "MERCH" link with a
                gooey-morph menu (Shop All / Returns & Exchanges). */}
            <GooeyDropdown
              label="MERCH"
              accentColor="#9333ea"
              textColor="rgba(255,255,255,0.8)"
              panelTextColor="#ffffff"
              items={[
                { label: "Shop All", href: "/merch" },
                { label: "Returns & Exchanges", href: "/returns" },
              ]}
            />

            {leftNavLinks.map((link) => {
              const active = isNavActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors duration-200 relative ${
                    active
                      ? "!text-[#6700ff] font-extrabold active drop-shadow-[0_0_12px_rgba(103,0,255,0.8)]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Live Stream link */}
            <Link
              href="/live"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors py-1 z-50 ${
                isNavActive("/live")
                  ? "!text-[#6700ff] font-extrabold active drop-shadow-[0_0_12px_rgba(103,0,255,0.8)]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {hasLiveStreams && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[7px] font-black uppercase tracking-wider text-white bg-red-600/80 border border-red-400/50 px-1.5 py-[0.5px] rounded-full whitespace-nowrap font-sans scale-90">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              )}
              LIVE
            </Link>
          </nav>

          {/* ── LOGO (Dead-centered horizontally & vertically) ── */}
          <Link
            href="/"
            id="header-logo"
            onClick={(e) => {
              setMobileOpen(false);
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={`shrink-0 min-w-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-colors duration-200 flex items-center justify-center m-0 p-0 ${
              mobileOpen ? "z-[10001]" : "z-50"
            } ${
              isNavActive("/")
                ? "!text-[#6700ff]"
                : "text-white hover:!text-[#6700ff]"
            }`}
            title="7th Heaven — Go to Home Page"
          >
            <div className="w-[150px] sm:w-[180px] lg:w-[220px] h-[36px] sm:h-[40px] flex items-center justify-center">
              <Logo className="w-full h-full text-current drop-shadow-sm transition-colors duration-200" />
            </div>
          </Link>

          {/* ── RIGHT NAV & ACTIONS GROUP ── */}
          <div className={`flex items-center justify-end gap-3 lg:gap-4 lg:flex-1 ml-auto font-[family-name:var(--font-barlow)] relative ${mobileOpen ? "z-[10001]" : "z-50"}`}>

            {/* Cruise link */}
            <Link
              href="/cruise"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors py-1 ${
                isNavActive("/cruise")
                  ? "!text-[#6700ff] font-extrabold active drop-shadow-[0_0_12px_rgba(103,0,255,0.8)]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              CRUISE
              {isNavActive("/cruise") && <CruiseWaveAnimation />}
            </Link>

            {/* Book Us link */}
            <Link
              href="/book"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors py-1 ${
                isNavActive("/book")
                  ? "!text-[#6700ff] font-extrabold active drop-shadow-[0_0_12px_rgba(103,0,255,0.8)]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              BOOK US
            </Link>

            {/* Contact link */}
            <Link
              href="/contact"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors py-1 ${
                isNavActive("/contact")
                  ? "!text-[#6700ff] font-extrabold active drop-shadow-[0_0_12px_rgba(103,0,255,0.8)]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              CONTACT
            </Link>

            {/* Cart Icon (only in nav bar when NOT signed in) */}
            {!isLoggedIn && !isDemoPage && (
              <Link
                href="/merch"
                className="text-black/70 hover:text-black transition-colors p-0.5 mx-0.5"
                title="Cart / Merch"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </Link>
            )}

            {/* User Profile Avatar with FAN Badge & Sign Out (only when logged in) or SIGN IN button */}
            {isLoggedIn || isDemoPage ? (
              <div className="flex items-center gap-1.5">
                <div className="relative shrink-0 flex items-center justify-center">
                  {/* Cart Icon attached directly to avatar profile circle when signed in */}
                  <Link
                    href="/merch"
                    className="absolute -top-1 -left-1.5 w-5 h-5 bg-[#851def] hover:bg-[#7415d8] text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 z-20"
                    title="Cart / Merch"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </Link>
                  <Link
                    href={dashboardHref}
                    className="relative flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md hover:scale-105 transition-transform"
                    style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", clipPath: "circle(50% at 50% 50%)" }}
                    title={displayName}
                  >
                    {isAvatarUrl ? (
                      <Image width={200} height={200} unoptimized src={member?.avatar} alt={displayName} className="w-full h-full object-cover" style={{ width: "100%", height: "100%", borderRadius: "50%", clipPath: "circle(50% at 50% 50%)" }} />
                    ) : (
                      <div className="w-full h-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white font-black text-sm shadow-inner" style={{ width: "100%", height: "100%", borderRadius: "50%", clipPath: "circle(50% at 50% 50%)" }}>
                        {initials}
                      </div>
                    )}
                  </Link>

                  {/* Overlapping Role Badge Circle with Full Role Name */}
                  <span
                    className={`absolute -bottom-1 -right-3.5 px-1.5 py-0.5 min-w-[26px] h-6 text-[9.5px] font-black uppercase text-white flex items-center justify-center leading-none ${badgeBg}`}
                    style={{ borderRadius: "9999px" }}
                  >
                    {badgeText}
                  </span>
                </div>

                {/* Exit button */}
                <button aria-label="Sign Out of Account"
                  onClick={async () => {
                    await logout();
                    router.push("/");
                    router.refresh();
                  }}
                  className="p-1.5 text-purple-400 hover:text-purple-300 hover:scale-110 transition-all cursor-pointer bg-transparent border-0 ml-1"
                  title="Sign Out of Account"
                  id="header-sign-out"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button aria-label="Action button"
                onClick={() => openModal("login")}
                className="px-3.5 py-1.5 bg-[var(--color-accent)] hover:bg-[#851de7] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors shadow-md cursor-pointer shrink-0"
                id="header-sign-in"
              >
                SIGN IN
              </button>
            )}

            {/* Mobile Menu Toggle Button — Wider & Bolder Hamburger */}
            <button
              className="flex lg:hidden w-10 h-10 items-center justify-end -mr-1 relative cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors p-0"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              id="mobile-menu-toggle"
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8.5 h-8.5 overflow-visible"
              >
                <line
                  x1="1.5"
                  y1="6"
                  x2="22.5"
                  y2="6"
                  className="transition-colors duration-300 ease-in-out origin-[12px_12px]"
                  style={{
                    transform: mobileOpen ? "translateY(6px) rotate(45deg)" : "translateY(0px) rotate(0deg)",
                  }}
                />
                <line
                  x1="1.5"
                  y1="12"
                  x2="22.5"
                  y2="12"
                  className="transition-colors duration-300 ease-in-out origin-[12px_12px]"
                  style={{
                    opacity: mobileOpen ? 0 : 1,
                    transform: mobileOpen ? "scaleX(0)" : "scaleX(1)",
                  }}
                />
                <line
                  x1="1.5"
                  y1="18"
                  x2="22.5"
                  y2="18"
                  className="transition-colors duration-300 ease-in-out origin-[12px_12px]"
                  style={{
                    transform: mobileOpen ? "translateY(-6px) rotate(-45deg)" : "translateY(0px) rotate(0deg)",
                  }}
                />
              </svg>
            </button>
          </div>

          {/* ── MOBILE OVERLAY DRAWER ── */}
          {mobileOpen && (
            <div className="fixed inset-0 bg-[#0c021a] z-[9999] pointer-events-auto flex flex-col justify-start items-start pl-8 pt-28 pb-12 gap-3 font-[family-name:var(--font-rockstar)] overflow-y-auto">

              <Link href="/#band" onClick={() => setMobileOpen(false)} className={`text-4xl font-black uppercase transition-colors ${effectivePathname === "/#band" ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"}`}>BAND</Link>
              <Link href="/#tour" onClick={() => setMobileOpen(false)} className={`text-4xl font-black uppercase transition-colors ${effectivePathname === "/#tour" ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"}`}>SHOWS</Link>
              <Link href="/shows/past" onClick={() => setMobileOpen(false)} className={`text-4xl font-black uppercase transition-colors ${effectivePathname === "/shows/past" ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"}`}>PAST SHOWS</Link>
              <Link href="/merch" onClick={() => setMobileOpen(false)} className={`text-4xl font-black uppercase transition-colors ${effectivePathname === "/merch" ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"}`}>MERCH</Link>
              <Link href="/media" onClick={() => setMobileOpen(false)} className={`text-4xl font-black uppercase transition-colors ${effectivePathname === "/media" ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"}`}>MEDIA</Link>
              <Link href="/fan-photo-wall" onClick={() => setMobileOpen(false)} className={`text-4xl font-black uppercase transition-colors ${effectivePathname === "/fan-photo-wall" ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"}`}>FAN WALL</Link>
              <Link href="/live" onClick={() => setMobileOpen(false)} className={`text-4xl font-black uppercase transition-colors ${effectivePathname === "/live" ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"}`}>LIVE</Link>
              <Link href="/cruise" onClick={() => setMobileOpen(false)} className={`text-4xl font-black uppercase transition-colors ${effectivePathname === "/cruise" ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"}`}>CRUISE</Link>
              <Link href="/book" onClick={() => setMobileOpen(false)} className={`text-4xl font-black uppercase transition-colors ${effectivePathname === "/book" ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"}`}>BOOK US</Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className={`text-4xl font-black uppercase transition-colors ${effectivePathname === "/contact" ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"}`}>CONTACT</Link>
              {isLoggedIn ? (
                <button aria-label="Action button"
                  onClick={async () => {
                    await logout();
                    setMobileOpen(false);
                    const isRestricted =
                      pathname.startsWith("/admin") ||
                      pathname.startsWith("/crew") ||
                      pathname.startsWith("/fans") ||
                      pathname.startsWith("/planner") ||
                      pathname.startsWith("/cruise/dashboard");
                    if (isRestricted) {
                      router.push("/");
                    }
                  }}
                  className="text-2xl font-black text-rose-400 uppercase mt-2"
                >
                  SIGN OUT
                </button>
              ) : (
                <button aria-label="Action button"
                  onClick={() => {
                    setMobileOpen(false);
                    openModal("login");
                  }}
                  className="text-2xl font-black text-[#7c00ff] uppercase mt-2"
                >
                  SIGN IN
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
