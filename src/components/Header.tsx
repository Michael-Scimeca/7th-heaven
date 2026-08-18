/* eslint-disable react-doctor/no-giant-component */
"use client";
import Image from 'next/image';
import { createPortal } from "react-dom";

import TransitionLink from "@/components/TransitionLink";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { useMember } from "@/context/MemberContext";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import CruiseWaveAnimation from "@/components/CruiseWaveAnimation";
import { useTransition } from "@/context/TransitionContext";

const emptySubscribe = () => () => { };

const leftNavLinks = [
  { href: "/merch", label: "MERCH" },
  { href: "/media", label: "MEDIA" },
  { href: "/fan-photo-wall", label: "FAN WALL" },
];

// Lifted directly from exoape.com's own hamburger-menu open animation.
// Went to the live site, scrolled to the state where its full nav collapses
// to a "menu-button", opened it, and diffed the DOM: the panel itself
// (their $refs.menu) doesn't fade — it's revealed with a clip-path wipe
// from a flat line down to a polygon whose right-bottom corner overshoots
// to 110% of viewport height (so the wipe edge reads as a slight diagonal
// that self-levels, same family of effect as /herointro's curtain).
// Simultaneously a "wrapper" group holding the actual content tweens in
// from `scale:1.3 rotate:-7deg y:-50vh opacity:.3` to identity, and the nav
// links stagger in individually with their own rotate/translate/opacity.
// Both eases turned out to be bespoke GSAP ease functions (this.$root.
// easeInOut / this.$root.easeOut), not any named curve — Vue 2 exposes the
// live root instance via `__vue__`, so rather than guess a cubic-bezier we
// called the real functions at 41 points each and baked the samples into a
// CSS linear() timing function, which reproduces the exact curve shape
// without needing GSAP at all.
const EASE_IN_OUT_LINEAR =
  "linear(0, 0.0012, 0.0044, 0.01, 0.0186, 0.0312, 0.0489, 0.0735, 0.1081, 0.1586, 0.233, 0.3386, 0.4534, 0.5526, 0.6269, 0.6845, 0.7309, 0.7689, 0.8008, 0.8282, 0.8516, 0.872, 0.89, 0.9057, 0.9195, 0.9316, 0.9423, 0.9518, 0.9601, 0.9675, 0.9738, 0.9793, 0.984, 0.9881, 0.9913, 0.9941, 0.9963, 0.9978, 0.9991, 0.9996, 1)";
const EASE_OUT_LINEAR =
  "linear(0, 0.1709, 0.2591, 0.33, 0.3902, 0.4437, 0.4913, 0.5343, 0.5735, 0.6094, 0.6426, 0.6732, 0.7016, 0.7279, 0.7525, 0.7753, 0.7964, 0.8161, 0.8344, 0.8514, 0.8673, 0.8819, 0.8955, 0.9081, 0.9196, 0.9302, 0.94, 0.9489, 0.957, 0.9643, 0.9708, 0.9765, 0.9817, 0.9862, 0.9899, 0.993, 0.9955, 0.9975, 0.9988, 0.9996, 1)";

// exoape doesn't just animate the menu's own content in — the underlying
// PAGE recedes at the same moment. This got second-guessed and briefly
// removed earlier after eyeballing a screen recording frame by frame and
// seeing no movement — that eyeballing was wrong. Re-checked properly with
// OpenCV template matching (tracking one letterform's exact pixel position
// across every frame of TWO separate recordings) and the page is rock
// solid for the first ~0.8s, then accelerates hard — 13px of shift at
// +100ms, 183px by +160ms — right before the wipe covers it. Fast and easy
// to miss by eye at normal screenshot intervals; unmissable once measured.
// Matches the original finding almost exactly: a `.page` ref — the routed
// page's own root wrapper, a sibling of their <nav> header, not a
// descendant of it — with:
//   leave (runs when the menu opens): {scale:1,rotate:0,y:0} -> {scale:1.3,
//     rotate:7deg,y:+50vh}
//   enter (runs when the menu closes): the reverse
// Confirmed live (separately, on their actual DOM): with their menu open,
// `.page` measured `translate3d(0,519.6px,0) rotate(6.69deg) scale(1.2868)`
// — matches the leave target almost exactly (windowSize.height/2 ≈ 519.6 at
// that viewport). It's the opposite rotation/slide direction from the
// menu's own wrapper (which goes -7deg / -50vh), so the two counter-rotate
// past each other — the departing page and the arriving menu content spin
// opposite ways, which is what gives it that "swap" feel. Its ease is a
// GSAP CustomEase built from an SVG-path bezier "M0,0 C0.496,0.004 0,1 1,1"
// — that decodes directly to a plain CSS cubic-bezier (start/end pinned at
// (0,0)/(1,1), the two control points are the C command's first pair and
// third pair), no linear()-sampling needed like the eases above.
//
// 7th Heaven's equivalent of their `.page` is `.content-area` in
// src/app/layout.tsx — the actual routed page content, deliberately NOT
// `#page-content-wrapper` (which also contains <Header/>): exoape's own
// nav is a sibling of `.page`, outside what gets transformed, for a
// concrete reason — <Header> here is `position: fixed`, and transforming
// an ANCESTOR of a fixed element makes that ancestor the fixed element's
// containing block instead of the viewport (the exact bug this file's
// `mounted`/portal comment above already ran into once) — transforming
// `#page-content-wrapper` would drag the fixed header along with the page
// instead of leaving it pinned. `.content-area` sits below <Header/> as a
// sibling, so it can safely recede without taking the header with it.
// Applied imperatively (not React state/JSX) since `.content-area` is a
// sibling of this component in the tree, not a descendant of it.
const PAGE_RECEDE_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";

// Distance from `el`'s top edge to the top of the viewport, using ONLY
// layout-based offsets (walking `offsetTop` up the `offsetParent` chain) —
// never getBoundingClientRect(), which reports the element's rendered,
// TRANSFORMED box. An earlier version measured by temporarily setting
// `transform: none`, reading getBoundingClientRect(), then restoring the
// old value — that forced a synchronous layout flush WHILE transform was
// "none", and the browser used that flushed "none" as the transition's
// actual starting point instead of the real previous value. Identity
// ("none") happens to equal this effect's CLOSED state, so opening
// (identity is the origin) looked fine by coincidence while closing
// (identity is the destination) silently had zero visible distance left
// to animate — exactly the "goes down fine, doesn't come back up" bug.
// offsetTop is defined purely from layout and is unaffected by an
// element's own CSS transform, so it can be read without touching (and
// corrupting) the transform this effect is about to animate.
function getUntransformedViewportTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top - window.scrollY;
}

// The hamburger icon itself isn't a rotate-lines-into-an-X morph on exoape —
// dug into their menu-button component (also in d5d162b.js) and it's two
// entirely separate SVG icons (a 3-line burger, a 2-line X) that cross-fade,
// with each icon's strokes drawn on/off via GSAP's drawSVG plugin (animates
// stroke-dasharray/dashoffset, i.e. the line visibly retracts/extends, not
// just fades) rather than plain opacity. Their onToggle() builds a timeline:
//   t=0:   iconBurger.children draw off (100% -> 0% stroke length) + fade
//          out, staggered 0.1s apart, over 0.5s.
//   t=0.5: iconClose.children draw on (0% -> 100%) + fade in, staggered
//          0.1s, over another 0.5s — starting right as the burger finishes
//          retracting, so the two never fully overlap.
// Timeline default ease is the exact same custom bezier as PAGE_RECEDE_EASE
// above (cubic-bezier(0.496,0.004,0,1)) — they reuse one signature "swoosh"
// curve across both the page-recede tween and this icon timeline.
// drawSVG is a paid GSAP Club plugin; reproduced here with plain CSS
// stroke-dasharray/stroke-dashoffset transitions, no library needed.
// (Their button also has a "Menu"/"Close" text label that cross-fades with
// its own rotate/translateY, using two more bespoke eases — M0,0 C0.198,0
// 1,0.1 1,1 for the outgoing label and M0,0 C0,0.202 0.204,1 1,1 for the
// incoming one — and a scroll-triggered show/hide + hover-rotate on the
// button itself. Left those out: both are gated behind
// `!this.$device.isMobile` in their source, so neither one ever runs on
// their own mobile hamburger — nothing to match there. The text label is a
// structural addition, not a transition, so it's skipped too; this button
// stays icon-only like it already was.)
const ICON_LINE_LEN = 21; // stroke length in this SVG's own units (x: 1.5 -> 22.5)
const ICON_X_LINE_LEN = 20; // diagonal stroke length (x/y: 5 -> 19)

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
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Open/close animation for the mobile overlay. Two states instead of one
  // because a plain `{mobileOpen && ...}` conditional mount/unmounts the
  // portal instantly — there's no DOM node present during the transition
  // for the browser to animate, so it just pops in/out with no animation
  // at all. `overlayMounted` keeps it in the DOM for the exit transition;
  // `overlayVisible` is flipped a frame after mount so the browser sees a
  // real 0 -> 1 style change to animate (flipping both on the same frame
  // the node mounts collapses the transition to nothing, same bug as above).
  const [overlayMounted, setOverlayMounted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  // 1000ms to match exoape's own GSAP tweens (duration:1) exactly.
  const OVERLAY_TRANSITION_MS = 1000;

  useEffect(() => {
    if (mobileOpen) {
      setOverlayMounted(true);
      // A rAF-only "flip to visible next frame" is the more common pattern
      // for this, but requestAnimationFrame callbacks are fully suspended
      // (not just throttled) on a backgrounded/non-visible tab in Chrome —
      // so if someone opens this in a background tab, or a test/automation
      // tool drives it without focusing the tab, the menu would mount and
      // then just sit at opacity 0 forever, since the frame that flips it
      // visible never comes. A short setTimeout still gets clamped in a
      // background tab (~1s floor) rather than fully paused, so it reliably
      // fires either way — 20ms is imperceptible in a focused tab.
      const t0 = setTimeout(() => setOverlayVisible(true), 20);
      return () => clearTimeout(t0);
    }
    setOverlayVisible(false);
    const t = setTimeout(() => setOverlayMounted(false), OVERLAY_TRANSITION_MS);
    return () => clearTimeout(t);
  }, [mobileOpen]);

  // Auto-close mobile overlay menu when window resizes back to desktop breakpoint (>= 1024px)
  useEffect(() => {
    if (!mobileOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  // Drives the page-recede effect described in the PAGE_RECEDE_EASE comment
  // above — `.content-area` (the actual routed page, not this header) grows,
  // rotates, and slides down while the menu wipes open over it, then reverses
  // on close. Tied to `overlayVisible` (not `mobileOpen`) so it's on the exact
  // same clock as the clip-path wipe and the menu's own content settle —
  // exoape runs both tweens together, not one after the other. Imperative
  // rather than JSX/React state because `.content-area` lives in
  // src/app/layout.tsx, a sibling of <Header>, not something this
  // component renders — there's no element here to attach this style to.
  useEffect(() => {
    const content = document.querySelector<HTMLElement>(".content-area");
    if (!content) return;

    // exoape's recede pivots around the middle of what's currently ON
    // SCREEN — not the middle of the full page. `.content-area` spans the
    // ENTIRE scrollable page (Lenis does real document-flow scrolling, so
    // on a long page like the homepage this div is genuinely ~25,000px
    // tall), so a plain "50% 50%" transform-origin was pivoting ~12,000px
    // down the document — scaling/rotating from a point nowhere near the
    // viewport. That's what was causing the brief flash of an unrelated
    // section (the Shows/tour listing) partway through the transition.
    // Fix: compute the origin in `.content-area`'s own local coordinate
    // space so it lands on wherever the viewport's vertical center
    // currently is, instead of the element's own vertical center. See
    // getUntransformedViewportTop's comment for why this reads offsetTop
    // rather than clearing/restoring the transform to measure it.
    const originY = window.innerHeight / 2 - getUntransformedViewportTop(content);

    if (overlayVisible) {
      content.style.transition = `transform ${OVERLAY_TRANSITION_MS}ms ${PAGE_RECEDE_EASE}`;
      content.style.transformOrigin = `50% ${originY}px`;
      content.style.transform = "scale(1.3) rotate(7deg) translateY(50vh)";
    } else {
      content.style.transition = `transform ${OVERLAY_TRANSITION_MS}ms ${PAGE_RECEDE_EASE}`;
      content.style.transform = "scale(1) rotate(0deg) translateY(0)";
      const timer = setTimeout(() => {
        content.style.transform = "";
        content.style.transition = "";
        content.style.transformOrigin = "";
      }, OVERLAY_TRANSITION_MS);
      return () => clearTimeout(timer);
    }
    // No cleanup here on purpose — this effect re-runs every time
    // `overlayVisible` flips, and React always runs a hook's cleanup
    // BEFORE re-running its body on a dependency change. A `return () =>
    // { content.style.transform = "" }` here used to fire right before
    // every new transform was applied, resetting the page to identity a
    // tick before the transition to the target value started. Identity
    // happens to equal this effect's CLOSED state, so opening (identity
    // is the origin anyway) looked fine, while closing (identity is the
    // destination) collapsed to "before === after" — zero visible
    // distance, no animation, exactly the "opens fine, doesn't reverse on
    // close" bug. The true "don't leave a stray transform behind on
    // unmount" cleanup now lives in its own effect below, which only
    // fires once, on unmount, not on every toggle.
  }, [overlayVisible]);

  useEffect(() => {
    return () => {
      const content = document.querySelector<HTMLElement>(".content-area");
      if (!content) return;
      content.style.transform = "";
      content.style.transition = "";
      content.style.transformOrigin = "";
    };
  }, []);

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

  const isAdminRoute = pathname?.startsWith("/admin");
  const isCrewRoute = pathname?.startsWith("/crew");
  const isDemoFanPage = pathname === "/fans/demo";
  const isDemoCruisePage = pathname === "/cruise/demo";
  const isDemoPage = isDemoFanPage || isDemoCruisePage || isAdminRoute || isCrewRoute;

  const showUserAuth = isLoggedIn || !!member || isDemoPage;

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

  const displayRole = isAdminRoute
    ? "admin"
    : isCrewRoute
      ? "crew"
      : isDemoFanPage || isDemoCruisePage
        ? "fan"
        : member?.role || "fan";

  const displayName = isAdminRoute
    ? (member?.name || "Admin User")
    : isCrewRoute
      ? (member?.name || "Crew Member")
      : isDemoFanPage
        ? "Demo Fan"
        : isDemoCruisePage
          ? "Demo Cruiser"
          : member?.name || "Member";
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
        ? "bg-[var(--color-accent)] "
        : (displayRole as string) === "event_planner" || (displayRole as string) === "planner"
          ? "bg-[var(--color-accent)]"
          : displayRole === "cruise"
            ? "bg-sky-500"
            : displayRole === "merch"
              ? "bg-blue-600"
              : "bg-[var(--color-accent)]";

  return (
    <header
      className={`fixed top-0 left-0 right-0 ${overlayMounted ? "z-[10005]" : "z-[1000]"} transition-colors duration-300 pointer-events-none  ${scrolled
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
          className="w-full h-[80px] flex items-center justify-between relative pointer-events-auto gap-4 z-[30000]"
        >

          {/* ── LOGO (Left-aligned on mobile; dead-centered on desktop >= 1024px) ── */}
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
            className={`shrink-0 min-w-0 flex items-center justify-center cursor-pointer group transition-all duration-300 pt-2 select-none pointer-events-auto relative z-50 ${effectivePathname === "/"
              ? "!text-[#9333ea]"
              : ""
              }`}
            title="7th Heaven — Go to Home Page"
          >
            <div className="w-[180px] sm:w-[200px] h-[36px] sm:h-[40px] flex items-center justify-center pointer-events-auto select-none">
              <Logo className="w-full h-full text-current transition-colors duration-200 pointer-events-auto" />
            </div>
          </TransitionLink>

          {/* ── LEFT NAV GROUP (Desktop >= 1024px) ── */}
          <nav className="hidden lg:flex lg:flex-1 lg:justify-start items-center gap-5 xl:gap-8 font-[family-name:var(--font-barlow)] relative z-50">
            {leftNavLinks.map((link) => {
              const active = isNavActive(link.href);
              return (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  className={`text-[clamp(13px,0.95vw,17px)] whitespace-nowrap font-bold uppercase tracking-wider transition-colors duration-200 relative ${active
                    ? "!text-[#9333ea]"
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
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(13px,0.95vw,17px)] whitespace-nowrap font-bold uppercase tracking-wider transition-colors py-1 z-50 ${isNavActive("/live")
                ? "!text-[#9333ea]"
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

          {/* ── RIGHT NAV & ACTIONS GROUP ── */}
          <div className={`flex items-center justify-end gap-2 sm:gap-3 lg:gap-4 lg:flex-1 ml-auto shrink-0 font-[family-name:var(--font-barlow)] relative ${mobileOpen ? "z-[10001]" : "z-50"}`}>
            {/* Cruise link */}
            <TransitionLink
              href="/cruise"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(13px,0.95vw,17px)] whitespace-nowrap font-bold uppercase tracking-wider transition-colors py-1 ${isNavActive("/cruise")
                ? "!text-[#9333ea] font-extrabold active"
                : "text-white/80 hover:text-white"
                }`}
            >
              CRUISE
              {isNavActive("/cruise") && <CruiseWaveAnimation />}
            </TransitionLink>

            {/* Book Us link */}
            <TransitionLink
              href="/book"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(13px,0.95vw,17px)] whitespace-nowrap font-bold uppercase tracking-wider transition-colors py-1 ${isNavActive("/book")
                ? "!text-[#9333ea] font-extrabold active"
                : "text-white/80 hover:text-white"
                }`}
            >
              BOOK US
            </TransitionLink>

            {/* Contact link */}
            <TransitionLink
              href="/contact"
              className={`hidden lg:inline-flex relative flex-col items-center justify-center text-[clamp(13px,0.95vw,17px)] whitespace-nowrap font-bold uppercase tracking-wider transition-colors py-1 ${isNavActive("/contact")
                ? "!text-[#9333ea] font-extrabold active"
                : "text-white/80 hover:text-white"
                }`}
            >
              CONTACT
            </TransitionLink>

            {/* Cart Icon (only in nav bar when NOT signed in) */}
            {!showUserAuth && (
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
            {showUserAuth ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="relative shrink-0 flex items-center justify-center">
                  {/* Cart Icon attached directly to avatar profile circle when signed in */}
                  <TransitionLink
                    href="/merch"
                    className="absolute -top-0.5 -left-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#851def] hover:bg-[#7415d8] text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 z-20"
                    title="Cart / Merch"
                  >
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </TransitionLink>
                  <TransitionLink
                    href={dashboardHref}
                    className="relative flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md hover:scale-105 transition-transform w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11"
                    style={{ borderRadius: "50%", overflow: "hidden", clipPath: "circle(50% at 50% 50%)" }}
                    title={displayName}
                  >
                    {isAvatarUrl ? (
                      <Image width={200} height={200} unoptimized src={member?.avatar} alt={displayName} className="w-full h-full object-cover" style={{ width: "100%", height: "100%", borderRadius: "50%", clipPath: "circle(50% at 50% 50%)" }} />
                    ) : (
                      <div className="w-full h-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white font-black text-[clamp(10px,1.2vw,14px)] shadow-inner" style={{ width: "100%", height: "100%", borderRadius: "50%", clipPath: "circle(50% at 50% 50%)" }}>
                        {initials}
                      </div>
                    )}
                  </TransitionLink>

                  {/* Overlapping Role Badge Circle with Full Role Name */}
                  <span
                    className={`absolute -bottom-0.5 -right-2 sm:-right-3 px-1 sm:px-1.5 py-0.5 h-4 sm:h-5 text-[8px] sm:text-[9.5px] font-black uppercase text-white flex items-center justify-center leading-none shadow-sm ${badgeBg}`}
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
                  className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-all cursor-pointer ml-3"
                  title="Sign Out of Account"
                  id="header-sign-out"
                >
                  SIGN OUT
                </button>
              </div>
            ) : (
              <button aria-label="Action button"
                onClick={() => openModal("login")}
                className="px-3.5 py-1.5 bg-linear-to-r from-[#6917BF] via-[#8c0eaf] to-[#6F008E] hover:brightness-110 text-white text-xs font-black tracking-wider rounded-lg transition-all shadow-md cursor-pointer shrink-0"
                id="header-sign-in"
              >
                SIGN IN
              </button>
            )}

            {/* Mobile Menu Toggle Button — Wider & Bolder Hamburger */}
            <button
              className="flex lg:hidden w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 items-center justify-center relative cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors p-0 shrink-0"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              id="mobile-menu-toggle"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="w-full h-full overflow-visible"
              >
                {/* Burger — 3 lines, draw themselves off + fade out on open.
                    Staggered 0.1s apart on open (matches exoape); collapsed
                    to no stagger on close, same convention already used for
                    the nav-link stagger above (transitionDelay -> 0ms). */}
                {[6, 12, 18].map((y, i) => (
                  <line
                    key={`burger-${y}`}
                    x1="1.5"
                    y1={y}
                    x2="22.5"
                    y2={y}
                    style={{
                      strokeDasharray: ICON_LINE_LEN,
                      strokeDashoffset: mobileOpen ? ICON_LINE_LEN : 0,
                      opacity: mobileOpen ? 0 : 1,
                      transition: `stroke-dashoffset 500ms ${PAGE_RECEDE_EASE}, opacity 500ms ${PAGE_RECEDE_EASE}`,
                      transitionDelay: mobileOpen ? `${i * 100}ms` : "0ms",
                    }}
                  />
                ))}
                {/* Close (X) — 2 diagonal lines, draw themselves on + fade in,
                    starting half a second after the burger begins retracting
                    (0.5s duration each, offset by 0.5s = 1s total, matching
                    exoape's own timeline). */}
                <line
                  x1="5"
                  y1="5"
                  x2="19"
                  y2="19"
                  style={{
                    strokeDasharray: ICON_X_LINE_LEN,
                    strokeDashoffset: mobileOpen ? 0 : ICON_X_LINE_LEN,
                    opacity: mobileOpen ? 1 : 0,
                    transition: `stroke-dashoffset 500ms ${PAGE_RECEDE_EASE}, opacity 500ms ${PAGE_RECEDE_EASE}`,
                    transitionDelay: mobileOpen ? "500ms" : "0ms",
                  }}
                />
                <line
                  x1="19"
                  y1="5"
                  x2="5"
                  y2="19"
                  style={{
                    strokeDasharray: ICON_X_LINE_LEN,
                    strokeDashoffset: mobileOpen ? 0 : ICON_X_LINE_LEN,
                    opacity: mobileOpen ? 1 : 0,
                    transition: `stroke-dashoffset 500ms ${PAGE_RECEDE_EASE}, opacity 500ms ${PAGE_RECEDE_EASE}`,
                    transitionDelay: mobileOpen ? "600ms" : "0ms",
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
          {overlayMounted && mounted && createPortal(
            <div
              // The panel itself is revealed by wiping clip-path open, not by
              // fading opacity — this sidesteps the globals.css PageSpeed hack
              // (`html body > *{ opacity:1 !important }`, meant to force
              // above-the-fold content visible on first paint) that used to
              // flatten any opacity transition on a direct child of <body>
              // to a permanent 1 no matter what we set — clip-path isn't
              // touched by that rule at all, so there was nothing left to
              // fight. Closed = a flat line at the top; open = the full
              // panel, with the bottom-right corner pushed to 110% height —
              // that's exoape's own shape, not a guess (see the const
              // comment above): it makes the wipe edge read as a slight
              // diagonal that self-levels as it finishes, rather than a
              // flat curtain.
              className="fixed inset-0 z-[9999] pointer-events-auto flex flex-col overflow-y-auto bg-black/30 backdrop-blur-[21px]"
              style={{
                backdropFilter: "blur(21px)",
                WebkitBackdropFilter: "blur(21px)",
                clipPath: overlayVisible
                  ? "polygon(0% 0%, 100% 0%, 100% 110%, 0% 100%)"
                  : "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                transition: `clip-path ${OVERLAY_TRANSITION_MS}ms ${EASE_IN_OUT_LINEAR}`,
              }}
            >
              {/* exoape's second half of the "enter" tween: a wrapper around
                  the actual content settles in from scale:1.3 rotate:-7deg
                  translateY(-50vh) opacity:.3 down to identity, at the same
                  time and with the same ease as the clip-path wipe above —
                  the wipe reveals the panel while its contents are visibly
                  still "falling into place" underneath it. */}
              <div
                className="flex-1 flex flex-col min-h-0"
                style={{
                  transform: overlayVisible
                    ? "scale(1) rotate(0deg) translateY(0)"
                    : "scale(1.3) rotate(-7deg) translateY(-12%)",
                  opacity: overlayVisible ? 1 : 0.3,
                  transition: `transform ${OVERLAY_TRANSITION_MS}ms ${EASE_IN_OUT_LINEAR}, opacity ${OVERLAY_TRANSITION_MS}ms ${EASE_IN_OUT_LINEAR}`,
                }}
              >
                <div className="pt-[87px]" />

                {/* Main: portrait media panel + stacked links, side by side
                  from sm up; panel drops out on phones so links get full
                  width rather than getting cramped. */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-14 lg:gap-20 px-6 sm:px-10 py-6 sm:py-8 min-h-0">
                  <div className="hidden sm:block w-[180px] md:w-[220px] lg:w-[260px] shrink-0 aspect-[4/5] overflow-hidden rounded-lg  relative  group">
                    <video
                      src="/movie/fest1-clip.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                      <span>7H FESTIVAL STAGE</span>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-1.5 items-start w-fit max-w-full font-[family-name:var(--font-barlow-condensed)]">
                    {[
                      { href: "/merch", label: "MERCH" },
                      { href: "/media", label: "MEDIA" },
                      { href: "/fan-photo-wall", label: "FAN WALL" },
                      { href: "/live", label: "LIVE" },
                      { href: "/cruise", label: "CRUISE" },
                      { href: "/book", label: "BOOK US" },
                      { href: "/contact", label: "CONTACT" },
                    ].map((link, i) => (
                      <TransitionLink
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`inline-flex w-fit max-w-full self-start items-start text-[clamp(2.375rem,10vw,6.25rem)] sm:text-5xl lg:text-6xl xl:text-7xl font-black uppercase leading-[1.02] transition-colors duration-300 ${effectivePathname === link.href ? "!text-[#c084fc]" : "!text-white hover:!text-[#c084fc]"
                          }`}
                        style={{
                          // exoape's own per-link reveal: rotate:7deg -> 0 and
                          // yPercent:100 -> 0 (a full line-height slide, not a
                          // token nudge) with their easeOut curve, staggered
                          // 0.1s apart starting half a second into the wipe.
                          // Their site has ~4 links so the full 0.1s/1s combo
                          // reads great; ours has 10, so the stagger/duration
                          // are trimmed a bit to keep the last link's reveal
                          // from lagging the wipe by seconds — same shape,
                          // tuned for length.
                          opacity: overlayVisible ? 1 : 0,
                          transform: overlayVisible ? "translateY(0) rotate(0deg)" : "translateY(100%) rotate(7deg)",
                          transformOrigin: "0% 100%",
                          transition: `transform 650ms ${EASE_OUT_LINEAR}, opacity 650ms ${EASE_OUT_LINEAR}`,
                          transitionDelay: overlayVisible ? `${450 + i * 70}ms` : "0ms",
                        }}
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
                  <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-white">
                    <a href="https://www.instagram.com/7thheavenband" target="_blank" rel="noopener noreferrer" className="!text-white hover:!text-[#c084fc] transition-colors">Instagram</a>
                    <a href="https://www.facebook.com/7thheavenband" target="_blank" rel="noopener noreferrer" className="!text-white hover:!text-[#c084fc] transition-colors">Facebook</a>
                    <a href="https://twitter.com/7thheavenband" target="_blank" rel="noopener noreferrer" className="!text-white hover:!text-[#c084fc] transition-colors">Twitter</a>
                    <a href="https://www.youtube.com/user/7thheavenband" target="_blank" rel="noopener noreferrer" className="hidden sm:inline !text-white hover:!text-[#c084fc] transition-colors">YouTube</a>
                  </div>

                  {showUserAuth ? (
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
                      className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
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
                      className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-white hover:text-[#c084fc] transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}

        </div>
      </div>
    </header>
  );
}
