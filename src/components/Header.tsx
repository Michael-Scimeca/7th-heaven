"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMember } from "@/context/MemberContext";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import CruiseWaveAnimation from "@/components/CruiseWaveAnimation";
import { useTransition } from "@/context/TransitionContext";

const leftNavLinks = [
  { href: "/news", label: "NEWS" },
  { href: "/band", label: "BAND" },
  { href: "/music", label: "MUSIC" },
  { href: "/store", label: "STORE" },
  { href: "/media", label: "MEDIA" },
  { href: "/fan-photo-wall", label: "FAN WALL" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, pendingHref } = useTransition();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCrewLive, setIsCrewLive] = useState(false);
  const [hasLiveStreams, setHasLiveStreams] = useState(false);
  const { member, isLoggedIn, openModal, logout } = useMember();

  // During a transition the pathname hasn't changed yet (we delay navigation).
  // Use the pending destination so the correct nav link highlights immediately.
  const effectivePathname =
    (mode === "covering" || mode === "covered") && pendingHref
      ? pendingHref
      : pathname;

  const isDemoFanPage = pathname === "/fans/demo";
  const isDemoCruisePage = pathname === "/cruise/demo";
  const isDemoPage = isDemoFanPage || isDemoCruisePage;

  // Check live stream status
  useEffect(() => {
    const checkLive = async () => {
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

  // Lock scroll when mobile menu is open
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (mobileOpen) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if ((window as any).__lenis) {
        try { (window as any).__lenis.stop(); } catch {}
      }
    } else {
      html.style.overflow = "";
      body.style.overflow = "";
      if ((window as any).__lenis) {
        try { (window as any).__lenis.start(); } catch {}
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
      ? "ADM"
      : displayRole === "crew"
        ? "CRW"
        : (displayRole as string) === "event_planner" || (displayRole as string) === "planner"
          ? "PLN"
          : displayRole === "cruise"
            ? "CRS"
            : displayRole === "merch"
              ? "MRC"
              : "FAN";

  const badgeBg =
    displayRole === "admin"
      ? "bg-amber-500"
      : displayRole === "crew"
        ? "bg-emerald-600"
        : (displayRole as string) === "event_planner" || (displayRole as string) === "planner"
          ? "bg-fuchsia-600"
          : displayRole === "cruise"
            ? "bg-sky-500"
            : displayRole === "merch"
              ? "bg-blue-600"
              : "bg-[var(--color-accent)]";

  return (
    <header
      className={`fixed top-0 left-0 right-0 ${mobileOpen ? "z-[9999]" : "z-50"} transition-all duration-300 pointer-events-none pt-2 ${scrolled
          ? "bg-white/95 backdrop-blur-2xl shadow-md border-b border-black/10 text-black"
          : "bg-white/90 backdrop-blur-xl border-b border-black/5 text-black"
        }`}
      suppressHydrationWarning
    >
      <div className="w-full max-w-full px-8">
        <div
          id="nav-inner-card"
          suppressHydrationWarning
          className="w-full h-[80px] flex items-center justify-between relative pointer-events-auto gap-4"
        >

          {/* ── LEFT NAV GROUP (Desktop > 1400px) ── */}
          <nav className="hidden min-[1401px]:flex items-center gap-6 xl:gap-8 font-[family-name:var(--font-barlow)]">
            {leftNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider transition-colors duration-200 ${
                  effectivePathname === link.href ? "text-[var(--color-accent)] font-extrabold" : "text-black hover:text-[var(--color-accent)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── LOGO (32px left aligned on tablet/mobile, centered in-line on desktop) ── */}
          <Link
            href="/"
            id="header-logo"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={`shrink-0 min-w-0 max-[1400px]:-ml-1.5 min-[1401px]:mx-4 relative ${mobileOpen ? "z-[10001]" : ""}`}
          >
            <div className="w-[150px] sm:w-[180px] min-[1401px]:w-[220px] h-[36px] sm:h-[40px] overflow-hidden">
              <Logo className="w-full h-full text-black drop-shadow-sm" />
            </div>
          </Link>

          {/* ── RIGHT NAV & ACTIONS GROUP ── */}
          <div className={`flex items-center gap-3 min-[1401px]:gap-4 ml-auto font-[family-name:var(--font-barlow)] relative ${mobileOpen ? "z-[10001]" : "z-10"}`}>

            {/* Live Stream link */}
            <Link
              href="/live"
              className="hidden min-[1401px]:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider text-black hover:text-[var(--color-accent)] transition-colors py-1"
            >
              {/* Live / Offline badge — absolute above the text */}
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[7px] font-black uppercase tracking-wider text-white bg-red-600/80 border border-red-400/50 px-1.5 py-[0.5px] rounded-full shadow-[0_0_4px_rgba(239,68,68,0.4)] whitespace-nowrap font-sans scale-90">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                {hasLiveStreams ? "LIVE" : "OFFLINE"}
              </span>
              LIVE
            </Link>

            {/* Cruise link */}
            <Link
              href="/cruise"
              className="hidden min-[1401px]:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider text-black hover:text-[var(--color-accent)] transition-colors py-1"
            >
              CRUISE
              <CruiseWaveAnimation />
            </Link>

            {/* Book Us link */}
            <Link
              href="/book"
              className="hidden min-[1401px]:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider text-black hover:text-[var(--color-accent)] transition-colors py-1"
            >
              BOOK US
            </Link>

            {/* Contact link */}
            <Link
              href="/contact"
              className="hidden min-[1401px]:inline-flex relative flex-col items-center justify-center text-[clamp(11px,1.1vw,19px)] font-bold uppercase tracking-wider text-black hover:text-[var(--color-accent)] transition-colors py-1"
            >
              CONTACT
            </Link>

            {/* Cart Icon */}
            <Link
              href="/store"
              className="text-black/70 hover:text-black transition-colors p-0.5 mx-0.5"
              title="Cart / Store"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>

            {/* User Profile Avatar with FAN Badge & Sign Out (only when logged in) or SIGN IN button */}
            {isLoggedIn || isDemoPage ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={dashboardHref}
                  className="relative w-11 h-11 rounded-full bg-[#38bdf8] border-2 border-[#38bdf8] flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md hover:scale-105 transition-transform"
                  title={displayName}
                >
                  {isAvatarUrl ? (
                    <img src={member?.avatar} alt={displayName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-black text-sm rounded-full">
                      {initials}
                    </div>
                  )}

                  {/* Overlapping Role Badge */}
                  <span className={`absolute -bottom-1 -right-2 w-6 h-6 text-[var(--font-size-4xs)] font-black uppercase text-white rounded-full border-2 border-white flex items-center justify-center shadow-lg leading-none ${badgeBg}`}>
                    {badgeText}
                  </span>
                </Link>

                {/* Exit button */}
                <button
                  onClick={async () => {
                    await logout();
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
                  className="text-black/70 hover:text-black transition-colors cursor-pointer p-1"
                  title="Sign Out"
                  id="header-sign-out"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => openModal("login")}
                className="px-3.5 py-1.5 bg-[var(--color-accent)] hover:bg-[#851de7] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer shrink-0"
                id="header-sign-in"
              >
                SIGN IN
              </button>
            )}

            {/* Mobile Menu Toggle Button — ONLY visible at <= 1400px (mutually exclusive with desktop nav) */}
            <button
              className="flex min-[1401px]:hidden w-10 h-10 items-center justify-center relative cursor-pointer text-black hover:text-[var(--color-accent)] transition-colors p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              id="mobile-menu-toggle"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7 overflow-visible"
              >
                <line
                  x1="4"
                  y1="6"
                  x2="20"
                  y2="6"
                  className="transition-all duration-300 ease-in-out origin-[12px_12px]"
                  style={{
                    transform: mobileOpen ? "translateY(6px) rotate(45deg)" : "translateY(0px) rotate(0deg)",
                  }}
                />
                <line
                  x1="4"
                  y1="12"
                  x2="20"
                  y2="12"
                  className="transition-all duration-300 ease-in-out origin-[12px_12px]"
                  style={{
                    opacity: mobileOpen ? 0 : 1,
                    transform: mobileOpen ? "scaleX(0)" : "scaleX(1)",
                  }}
                />
                <line
                  x1="4"
                  y1="18"
                  x2="20"
                  y2="18"
                  className="transition-all duration-300 ease-in-out origin-[12px_12px]"
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

              <Link href="/news" onClick={() => setMobileOpen(false)} className="text-4xl font-black text-white uppercase">NEWS</Link>
              <Link href="/bio" onClick={() => setMobileOpen(false)} className="text-4xl font-black text-white uppercase">BAND</Link>
              <Link href="/music" onClick={() => setMobileOpen(false)} className="text-4xl font-black text-white uppercase">MUSIC</Link>
              <Link href="/store" onClick={() => setMobileOpen(false)} className="text-4xl font-black text-white uppercase">STORE</Link>
              <Link href="/media" onClick={() => setMobileOpen(false)} className="text-4xl font-black text-white uppercase">MEDIA</Link>
              <Link href="/fan-photo-wall" onClick={() => setMobileOpen(false)} className="text-4xl font-black text-white uppercase">FAN WALL</Link>
              <Link href="/live" onClick={() => setMobileOpen(false)} className="text-4xl font-black text-white uppercase">LIVE</Link>
              <Link href="/cruise" onClick={() => setMobileOpen(false)} className="text-4xl font-black text-white uppercase">CRUISE</Link>
              <Link href="/book" onClick={() => setMobileOpen(false)} className="text-4xl font-black text-white uppercase">BOOK US</Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="text-4xl font-black text-white uppercase">CONTACT</Link>
              {isLoggedIn ? (
                <button
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
                <button
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
