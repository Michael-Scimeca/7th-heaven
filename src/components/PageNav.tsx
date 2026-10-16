"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMember } from "@/context/MemberContext";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  {
    name: "Public Core Pages",
    pages: [
      { path: "/", label: "Home" },
      { path: "/shows/past", label: "Past Shows Archive" },
      { path: "/shows/34f3a136-3220-4355-b396-74a46d244640", label: "Show Detail (Live Sample)" },
      { path: "/merch", label: "Merchandise Store" },
      { path: "/media", label: "Media Archive" },
      { path: "/rock-and-roll-kids", label: "Rock & Roll Kids Charity" },
      { path: "/live", label: "Live Streaming Hub" },
      { path: "/cruise", label: "Annual Fan Cruise" },
      { path: "/book", label: "Book the Band" },
      { path: "/contact", label: "Contact Management" },
      { path: "/faq", label: "FAQ" },
      { path: "/sitemap", label: "Visual HTML Sitemap" },
    ],
  },
  {
    name: "Fan Club & Community",
    pages: [
      { path: "/fans", label: "Fan Club Dashboard" },
      { path: "/fans/complete-profile", label: "Complete Fan Profile" },
      { path: "/fan-media-wall", label: "Fan Media Wall" },
      { path: "/claim/123456", label: "Raffle Ticket Claim (Sample)" },
    ],
  },
  {
    name: "Booking & Cruise Flows",
    pages: [
      { path: "/book", label: "Booking Inquiry Form" },
      { path: "/book/success", label: "Booking Success Screen" },
      { path: "/book/cancel", label: "Booking Cancel Screen" },
      { path: "/cruise", label: "Cruise Overview" },
      { path: "/cruise/dashboard", label: "Cruise Dashboard" },
      { path: "/cruise/verify", label: "Cruise Code Verify" },
      { path: "/cruise/cancel", label: "Cruise Cancel Screen" },
      { path: "/cruise/preview", label: "Cruise Hero Preview" },
      { path: "/planner", label: "Event Planner Portal" },
      { path: "/planner/verify", label: "Planner Verify Code" },
    ],
  },
  {
    name: "Crew Portals & Live Cams",
    pages: [
      { path: "/crew", label: "Crew Main Dashboard" },
      { path: "/crew/verify", label: "Crew Verify Access" },
      { path: "/crew/tony", label: "Crew: Tony Cavazos" },
      { path: "/crew/michael", label: "Crew: Michael" },
      { path: "/crew/ryan", label: "Crew: Ryan" },
      { path: "/crew/sam", label: "Crew: Sam" },
      { path: "/crew/abbie", label: "Crew: Abbie" },
      { path: "/live", label: "Live Stream Hub" },
      { path: "/live/stage", label: "Live: Stage Main Feed" },
      { path: "/live/michael", label: "Live: Michael Stage Cam" },
      { path: "/live/ryan", label: "Live: Ryan Stage Cam" },
      { path: "/live/sammy", label: "Live: Sammy Stage Cam" },
      { path: "/live/tony", label: "Live: Tony Stage Cam" },
    ],
  },
  {
    name: "UI Demos & Sandboxes",
    pages: [
      { path: "/masonry-demo", label: "Parallax Masonry Gallery" },
      { path: "/dropdown-preview", label: "5 Gooey Dropdown Styles" },
      { path: "/tabs-preview", label: "Segmented Tabs Preview" },
      { path: "/threeslider", label: "Three.js 3D Image Slider" },
      { path: "/transition-test", label: "WebGL Page Transitions" },
      { path: "/media-v2", label: "Media V2 (House of Yellow)" },
      { path: "/band-preview", label: "Band Stage Hero Preview" },
      { path: "/firecanvas", label: "Canvas Fire Effects" },
      { path: "/hambuger", label: "Hamburger Morph Animation" },
      { path: "/preloaders", label: "Preloader Variants" },
      { path: "/slideup", label: "Mobile Bottom Sheet Slide-Up" },
      { path: "/textcolor", label: "Text Color Shifts" },
      { path: "/style-guide", label: "Design System Style Guide" },
      { path: "/work/studio-d", label: "Studio D Agency Showcase" },
    ],
  },
  {
    name: "Admin & Operations",
    pages: [
      { path: "/admin", label: "Admin Main Console" },
      { path: "/admin/MikeyS", label: "MikeyS Admin Profile" },
      { path: "/admin/RichH", label: "RichH Admin Profile" },
      { path: "/admin/shop-inventory", label: "Shop Inventory Control" },
      { path: "/admin/emails", label: "Email Template Previews" },
      { path: "/admin/email-map", label: "Email Flow Architecture" },
      { path: "/admin/legal", label: "Legal & Compliance Audit" },
      { path: "/studio", label: "Sanity Studio CMS" },
      { path: "/sitemap/flows", label: "Site Architecture Flows" },
    ],
  },
  {
    name: "Checkout, QR & Utilities",
    pages: [
      { path: "/payment", label: "Payment Processing State" },
      { path: "/payment-test", label: "EPX/North Sandbox Shop" },
      { path: "/payment-test/checkout", label: "EPX Checkout Screen" },
      { path: "/payment-test/result", label: "EPX Payment Result" },
      { path: "/qr/merch", label: "Concert Table QR Checkout" },
      { path: "/notifications", label: "Push Notification Tester" },
      { path: "/offline", label: "Offline Service Worker Screen" },
    ],
  },
  {
    name: "Legal & Policies",
    pages: [
      { path: "/privacy", label: "Privacy Policy" },
      { path: "/terms", label: "Terms of Service" },
      { path: "/returns", label: "Returns & Refund Policy" },
    ],
  },
];

export function PageNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, member, hydrated } = useMember();
  const auth = useAuth();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Native (non-passive) wheel handler — prevents the page from scrolling
  // when the user scrolls inside the list.
  useEffect(() => {
    const el = listRef.current;
    if (!el || !isOpen) return;

    const handler = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      e.stopPropagation();
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [isOpen]);

  if (pathname?.startsWith("/studio")) {
    return null;
  }

  // Only available in development mode or when explicitly enabled
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.NEXT_PUBLIC_SHOW_DEV_NAV !== "true"
  ) {
    return null;
  }

  // Hide on all pages if not signed in
  const isUserSignedIn =
    isLoggedIn || !!member || auth?.isAuthenticated || !!auth?.user;
  if (!hydrated || !isUserSignedIn) {
    return null;
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCategories = CATEGORIES.map((category) => ({
    ...category,
    pages: category.pages.filter(
      (p) =>
        p.label.toLowerCase().includes(normalizedSearch) ||
        p.path.toLowerCase().includes(normalizedSearch)
    ),
  })).filter((category) => category.pages.length > 0);

  const totalRoutes = CATEGORIES.reduce((acc, cat) => acc + cat.pages.length, 0);

  return (
    <div
      className="pointer-events-auto fixed bottom-8 left-8 z-[999999] select-none"
      ref={menuRef}
    >
      {isOpen && (
        <div
          className="pointer-events-auto absolute bottom-full left-0 mb-6 flex max-h-[min(82vh,640px)] w-[330px] origin-bottom-left animate-[fade-in-up_0.2s_ease-out_both] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0518]/90 backdrop-blur-2xl shadow-2xl sm:w-[360px]"
        >
          {/* Header — fixed, translucent blur */}
          <div className="shrink-0 border-b border-white/10 bg-white/[0.04] p-3 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-400"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Dev Navigator
              </h3>
              <span className="text-[10px] font-mono text-purple-300/70 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                {totalRoutes} routes
              </span>
            </div>
            <input
              type="text"
              placeholder="Search routes or paths..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Scrollable list */}
          <div
            ref={listRef}
            className="custom-scrollbar flex flex-col gap-3 overflow-y-auto p-3 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(168,85,247,0.6)_rgba(255,255,255,0.05)]"
          >
            {filteredCategories.length === 0 ? (
              <div className="py-8 text-center text-xs text-white/40">
                No matching pages found for &ldquo;{search}&rdquo;
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.name} className="flex flex-col gap-1">
                  <h4 className="mt-2 mb-1 border-b border-white/10 pb-1 pl-2 text-[10px] font-bold uppercase tracking-wider text-purple-400/90">
                    {category.name}
                  </h4>
                  {category.pages.map((page) => {
                    const isActive = pathname === page.path;
                    return (
                      <Link
                        key={page.path}
                        href={page.path}
                        onClick={() => {
                          setIsOpen(false);
                          // Bypasses login for restricted dev routes
                          if (
                            page.path.startsWith("/crew") ||
                            page.path.startsWith("/admin") ||
                            page.path.startsWith("/fans") ||
                            page.path.startsWith("/planner")
                          ) {
                            localStorage.setItem("7h_dev_bypass", "true");
                          }
                        }}
                        className={`group flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                          isActive
                            ? "bg-purple-600 text-white shadow-purple-600/30"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{page.label}</span>
                        <span className="text-[10px] font-mono opacity-40 group-hover:opacity-80 ml-2 truncate max-w-[120px]">
                          {page.path}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`pointer-events-auto flex h-12 cursor-pointer items-center gap-2 px-6 rounded-full font-medium text-xs tracking-wider uppercase select-none transition-all shadow-lg ${
          isOpen
            ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-gray-200"
            : "bg-[var(--color-accent)] text-white shadow-[0_0_30px_rgba(255,10,61,0.5)] hover:bg-[var(--color-accent-hover)]"
        }`}
        title="Page Navigator"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
        {isOpen ? "Close" : "Pages"}
      </button>
    </div>
  );
}

