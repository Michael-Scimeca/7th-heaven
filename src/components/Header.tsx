/* eslint-disable react-doctor/no-giant-component */
"use client";
import Image from 'next/image';
import { createPortal } from "react-dom";

import TransitionLink from "@/components/TransitionLink";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useMember } from "@/context/MemberContext";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import CruiseWaveAnimation from "@/components/CruiseWaveAnimation";
import { useTransition } from "@/context/TransitionContext";

const leftNavLinks = [
  { href: "/merch", label: "MERCH" },
  { href: "/media", label: "MEDIA" },
  { href: "/fan-photo-wall", label: "FAN WALL" },
  { href: "/pagetransition", label: "TRANSITION" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, pendingHref } = useTransition();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasLiveStreams, setHasLiveStreams] = useState(false);
  const { member, isLoggedIn, openModal, logout } = useMember();

  // The mobile overlay is portaled to document.body (see the render below)
  // rather than rendered inline in <header> — <header> has will-change:
  // transform (for the scroll-blur fade), and a `will-change: transform`
  // ancestor becomes the containing block for any descendant
  // `position: fixed` element, instead of the viewport. Found this the
  // hard way: the overlay was rendering fixed-inset-0 relative to
  // <header>'s own ~80px-tall box, not the screen, collapsing it to a
  // sliver instead of a fullscreen panel. `mounted` guards the portal
  // since `document` doesn't exist during SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
        ? "bg-purple-600"
        : (displayRole as string) === "event_planner" || (displayRole as string) === "planner"
          ? "bg-[var(--color-accent)]"
          : displayRole === "cruise"
            ? "bg-sky-500"
            : displayRole === "merch"
              ? "bg-blue-600"
              : "bg-[var(--color-accent)]";

  return (
    <header
      className={`fixed top-0 left-0 right-0 ${mobileOpen ? "z-[9999]" : "z-[1000]"} transition-colors duration-300 pointer-events-none  ${scrolled
        ? "bg-[var(--surface-overlay)] backdrop-blur-xl  text-[var(--text-color)]"
        : "bg-transparent text-white"
        }`}
      style={{
        maskImage: "linear-gradient(to bottom, black 0%, black var(--header-mask-fade-start, 85%), transparent var(--header-mask-fade-end, 100%))",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black var(--header-mask-fade-start, 85%), transparent var(--header-mask-fade-end, 100%))"
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
            {leftNavLinks.map((link) => {
              const active = isNavActive(link.href);
              return (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  className={`text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors duration-200 relative ${active
                    ? "!text-[#6700ff] font-extrabold active drop-shadow-[0_0_12px_rgba(103,0,255,0.8)]"
                    : "text-white/80 hover:text-white"
                    }`}
                >
                  {link.label}
                </TransitionLink>
              );
            })}

            {/* Live Stream link */}
            <TransitionLink
              href="/live"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors py-1 z-50 ${isNavActive("/live")
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
            </TransitionLink>
          </nav>

          {/* ── LOGO (Dead-centered horizontally & vertically) ── */}
          <TransitionLink
            href="/"
            id="header-logo"
            onClick={(e) => {
              setMobileOpen(false);
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={`shrink-0 min-w-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-colors duration-200 flex items-center justify-center m-0 p-0 ${mobileOpen ? "z-[10001]" : "z-50"
              } ${isNavActive("/")
                ? "!text-[#6700ff]"
                : "text-white hover:!text-[#6700ff]"
              }`}
            title="7th Heaven — Go to Home Page"
          >
            <div className="w-[150px] sm:w-[180px] lg:w-[220px] h-[36px] sm:h-[40px] flex items-center justify-center">
              <Logo className="w-full h-full text-current drop-shadow-sm transition-colors duration-200" />
            </div>
          </TransitionLink>

          {/* ── RIGHT NAV & ACTIONS GROUP ── */}
          <div className={`flex items-center justify-end gap-3 lg:gap-4 lg:flex-1 ml-auto font-[family-name:var(--font-barlow)] relative ${mobileOpen ? "z-[10001]" : "z-50"}`}>

            {/* Cruise link */}
            <TransitionLink
              href="/cruise"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors py-1 ${isNavActive("/cruise")
                ? "!text-[#6700ff] font-extrabold active drop-shadow-[0_0_12px_rgba(103,0,255,0.8)]"
                : "text-white/80 hover:text-white"
                }`}
            >
              CRUISE
              {isNavActive("/cruise") && <CruiseWaveAnimation />}
            </TransitionLink>

            {/* Book Us link */}
            <TransitionLink
              href="/book"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors py-1 ${isNavActive("/book")
                ? "!text-[#6700ff] font-extrabold active drop-shadow-[0_0_12px_rgba(103,0,255,0.8)]"
                : "text-white/80 hover:text-white"
                }`}
            >
              BOOK US
            </TransitionLink>

            {/* Contact link */}
            <TransitionLink
              href="/contact"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors py-1 ${isNavActive("/contact")
                ? "!text-[#6700ff] font-extrabold active drop-shadow-[0_0_12px_rgba(103,0,255,0.8)]"
                : "text-white/80 hover:text-white"
                }`}
            >
              CONTACT
            </TransitionLink>

            {/* Cart Icon (only in nav bar when NOT signed in) */}
            {!isLoggedIn && !isDemoPage && (
              <TransitionLink
                href="/merch"
                className="text-black/70 hover:text-black transition-colors p-0.5 mx-0.5"
                title="Cart / Merch"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </TransitionLink>
            )}

            {/* User Profile Avatar with FAN Badge & Sign Out (only when logged in) or SIGN IN button */}
            {isLoggedIn || isDemoPage ? (
              <div className="flex items-center gap-1.5">
                <div className="relative shrink-0 flex items-center justify-center">
                  {/* Cart Icon attached directly to avatar profile circle when signed in */}
                  <TransitionLink
                    href="/merch"
                    className="absolute -top-1 -left-1.5 w-5 h-5 bg-[#851def] hover:bg-[#7415d8] text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 z-20"
                    title="Cart / Merch"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </TransitionLink>
                  <TransitionLink
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
                  </TransitionLink>

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
                  className="px-2.5 py-1 text-xs font-black uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-all cursor-pointer bg-white/5 hover:bg-white/10 rounded-full border border-purple-500/20 ml-3"
                  title="Sign Out of Account"
                  id="header-sign-out"
                >
                  SIGN OUT
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
              className="flex lg:hidden w-10 h-10 items-center justify-end relative cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors p-0"
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

          {/* ── MOBILE OVERLAY DRAWER ──
              Restyled after exoape.com's fullscreen menu: logo top-left +
              "Close ✕" top-right, a portrait media panel on the left, big
              stacked nav links on the right, and a bottom utility row
              (social links + account action) below a hairline divider.
              Layout/structure borrowed from exoape; colors, type (the
              site's own --font-rockstar), links, and the video-as-photo
              panel are all this site's own — see the file header note in
              /app/herointro/page.tsx for the same "structure, not pixels"
              approach used there.
              Portaled to document.body — see the `mounted` note above for
              why this can't just render inline here. */}
          {mobileOpen && mounted && createPortal(
            <div
              className="fixed inset-0 z-[9999] pointer-events-auto flex flex-col overflow-y-auto"
              style={{ backgroundColor: "rgb(13, 14, 19)" }}
            >
              {/* Top bar: logo left, close right — mirrors the main header's
                  row but doesn't reuse it directly since #header-logo is
                  absolutely centered for the regular bar, not left-aligned. */}
              <div className="flex items-center justify-between px-6 sm:px-10 pt-6 pb-2 shrink-0">
                <TransitionLink
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="text-white/90 hover:text-white transition-colors"
                  title="7th Heaven — Go to Home Page"
                >
                  <Logo className="h-6 sm:h-7 w-auto" />
                </TransitionLink>
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Close</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="4" x2="20" y2="20" />
                    <line x1="20" y1="4" x2="4" y2="20" />
                  </svg>
                </button>
              </div>

              {/* Main: portrait media panel + stacked links, side by side
                  from sm up; panel drops out on phones so links get full
                  width rather than getting cramped. */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-14 lg:gap-20 px-6 sm:px-10 py-6 sm:py-8 min-h-0">
                <div className="hidden sm:block w-[180px] md:w-[220px] shrink-0 aspect-[4/5] overflow-hidden bg-white/5">
                  {/* "Photo" panel reuses the hero video rather than a new
                      static asset — no autoplay/loop, so it just settles on
                      whatever frame currentTime lands on (nudged past the
                      first instant so it isn't a black opening frame) and
                      sits still, reading as a poster image, not a video. */}
                  <video
                    src="/movie/be-here-clip.mp4"
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                    onLoadedMetadata={(e) => {
                      try { e.currentTarget.currentTime = 1.5; } catch { /* noop */ }
                    }}
                  />
                </div>

                <nav className="flex flex-col gap-1 font-[family-name:var(--font-rockstar)]">
                  {[
                    { href: "/#band", label: "BAND" },
                    { href: "/#tour", label: "SHOWS" },
                    { href: "/merch", label: "MERCH" },
                    { href: "/media", label: "MEDIA" },
                    { href: "/fan-photo-wall", label: "FAN WALL" },
                    { href: "/pagetransition", label: "TRANSITION" },
                    { href: "/live", label: "LIVE" },
                    { href: "/cruise", label: "CRUISE" },
                    { href: "/book", label: "BOOK US" },
                    { href: "/contact", label: "CONTACT" },
                  ].map((link) => (
                    <TransitionLink
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`text-3xl sm:text-4xl lg:text-5xl font-black uppercase leading-[1.1] transition-colors ${effectivePathname === link.href ? "!text-[#c084fc]" : "!text-[#6700ff] hover:!text-[#c084fc]"
                        }`}
                    >
                      {link.label}
                    </TransitionLink>
                  ))}
                </nav>
              </div>

              {/* Bottom utility row: social links + account action, below a
                  hairline divider — same structural beat as exoape's
                  Play Reel / Our Story / Now Hiring! row, filled in with
                  this site's own links rather than copying its wording. */}
              <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-10 py-5 border-t border-white/10">
                <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-white/50">
                  <a href="https://www.instagram.com/7thheavenband" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                  <a href="https://www.facebook.com/7thheavenband" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
                  <a href="https://twitter.com/7thheavenband" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
                  <a href="https://www.youtube.com/user/7thheavenband" target="_blank" rel="noopener noreferrer" className="hidden sm:inline hover:text-white transition-colors">YouTube</a>
                </div>

                {isLoggedIn ? (
                  <button
                    aria-label="Sign out of account"
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
                    className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    aria-label="Sign in to account"
                    onClick={() => {
                      setMobileOpen(false);
                      openModal("login");
                    }}
                    className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-[#c084fc] hover:text-white transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>,
            document.body
          )}

        </div>
      </div>
    </header>
  );
}
