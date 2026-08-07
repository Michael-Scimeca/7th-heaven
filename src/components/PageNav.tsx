"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CATEGORIES = [
  {
    name: "Header Nav Pages",
    pages: [
      { path: "/", label: "Home" },
      { path: "/merch", label: "Merch" },
      { path: "/media", label: "Media" },
      { path: "/music", label: "Music" },
      { path: "/live", label: "Live Hub" },
      { path: "/cruise", label: "Cruise" },
      { path: "/book", label: "Book Band" },
      { path: "/contact", label: "Contact" },
    ]
  },
  {
    name: "Footer Nav Pages",
    pages: [
      { path: "/faq", label: "FAQ" },
      { path: "/news", label: "News" },
      { path: "/shows/past", label: "Past Shows Archive" },
      { path: "/privacy", label: "Privacy Policy" },
      { path: "/terms", label: "Terms of Service" },
      { path: "/returns", label: "Returns & Refunds" },
    ]
  },
  {
    name: "Fan Pages",
    pages: [
      { path: "/fans", label: "Fan Dashboard" },
      { path: "/fan-photo-wall", label: "Fan Photo Wall" },
    ]
  },
  {
    name: "Crew Pages",
    pages: [
      { path: "/crew", label: "Crew Dashboard" },
      { path: "/crew/verify", label: "Crew Verify" },
      { path: "/crew-michael", label: "Michael" },
      { path: "/crew-abbie", label: "Abbie" },
      { path: "/crew-ryan", label: "Ryan" },
      { path: "/crew-sam", label: "Sam" },
      { path: "/crew-tony", label: "Tony" },
      { path: "/crew-setup-preview", label: "Crew Setup Preview" },
    ]
  },
  {
    name: "Planner Pages",
    pages: [
      { path: "/planner", label: "Planner Dashboard" },
      { path: "/planner/verify", label: "Planner Verify" },
    ]
  },
  {
    name: "Admin Pages",
    pages: [
      { path: "/admin", label: "Admin Panel" },
      { path: "/admin/emails", label: "Email Templates" },
      { path: "/admin/email-map", label: "Email Map" },
      { path: "/admin/legal", label: "Legal Guide" },
      { path: "/admin/checklist", label: "Ops Checklist" },
      { path: "/admin/features", label: "Admin Features" },
      { path: "/admin/feed", label: "Admin Feed" },
      { path: "/studio", label: "Sanity Studio" },
    ]
  },
  {
    name: "Misc",
    pages: [
      { path: "/cruise/dashboard", label: "Passenger Hub" },
      { path: "/cruise/form-a", label: "Form A" },
      { path: "/cruise/form-b", label: "Form B" },
      { path: "/cruise/form-c", label: "Form C" },
      { path: "/cruise/layout-a", label: "Layout A" },
      { path: "/cruise/layout-b", label: "Layout B" },
      { path: "/cruise/layout-c", label: "Layout C" },
      { path: "/cruise/payment", label: "Payment" },
      { path: "/cruise/preview", label: "Preview" },
      { path: "/cruise/hero-demo", label: "Hero Demo" },
      { path: "/cruise/email-preview", label: "Email Preview" },
      { path: "/cruise/verify", label: "Verify" },
      { path: "/cruise/cancel", label: "Cancel" },
      { path: "/live", label: "Live Hub" },
      { path: "/live/live_michael", label: "Michael Live" },
      { path: "/live/live_ryan", label: "Ryan Live" },
      { path: "/live/live_sammy", label: "Sammy Live" },
      { path: "/live/live_tony", label: "Tony Live" },
      { path: "/features", label: "Features" },
      { path: "/media/layout-demo", label: "Media Layout Demo" },
      { path: "/demo", label: "Demo Index" },
      { path: "/demo/proximity", label: "Proximity Demo" },
      { path: "/demo/cursor", label: "Cursor Demo" },
      { path: "/demo/loading", label: "Loading Demo" },
      { path: "/demo/preloader", label: "Preloader Demo" },
      { path: "/demo/circle-carousel", label: "Circle Carousel Demo" },
      { path: "/demo/yt-carousel", label: "YT Carousel Demo" },
      { path: "/style-guide", label: "Style Guide" },
      { path: "/sitemap", label: "Sitemap" },
      { path: "/sitemap/visual", label: "Visual Map" },
      { path: "/sitemap/flowchart", label: "Flowchart" },
      { path: "/qr/merch", label: "QR Merch" },
    ]
  },
];


export function PageNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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
  // when the user scrolls inside the list. This is the only reliable way
  // because browsers register passive wheel listeners on the window by default.
  useEffect(() => {
    const el = listRef.current;
    if (!el || !isOpen) return;

    const handler = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // Always stop propagation so the event never reaches the page
      e.stopPropagation();
      // Only prevent default at the scroll boundaries (prevents over-scroll chaining)
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [isOpen]);

  // Only available in development mode or when explicitly enabled
  if (process.env.NODE_ENV !== "development" && process.env.NEXT_PUBLIC_SHOW_DEV_NAV !== "true") return null;

  return (
    <div className="fixed bottom-8 left-8 z-[9999] font-sans" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-full mb-4 left-0 w-[300px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-[0_10px_40px_rgba(0,0,0,0.25)] animate-[fade-in-up_0.2s_ease-out_both] origin-bottom-left flex flex-col overflow-hidden" style={{ maxHeight: 'min(80vh, 600px)' }}>
          {/* Header — fixed, never scrolls */}
          <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-color)] shrink-0">
            <h3 className="text-[var(--text-color)] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Dev Navigator
            </h3>
            <p className="text-[var(--muted-text)] text-xs mt-1 font-semibold tracking-wide">Jump to any page instantly</p>
          </div>

          {/* Scrollable list — grows to fill remaining height */}
          <div
            ref={listRef}
            className="p-2 flex flex-col gap-3 overflow-y-scroll rounded-b-2xl bg-[var(--card-bg)] text-[var(--text-color)]"
            style={{ overscrollBehavior: 'contain' }}
          >
            {CATEGORIES.map((category) => (
              <div key={category.name} className="flex flex-col gap-1">
                <h4 className="text-xs font-black uppercase tracking-[0.15em]  text-[var(--color-accent)] pl-2 mt-2 mb-1 border-b border-[var(--border-color)] pb-1">{category.name}</h4>
                {category.pages.map((page) => {
                  const isActive = pathname === page.path;
                  return (
                    <Link
                      key={page.path}
                      href={page.path}
                      onClick={() => {
                        setIsOpen(false);
                        // Bypasses login for Restricted pages in dev mode
                        if (['/crew', '/admin', '/admin/MikeyS', '/admin/RichH', '/admin/emails', '/admin/legal', '/fans', '/planner'].includes(page.path)) {
                          localStorage.setItem('7h_dev_bypass', 'true');
                        }
                      }}
                      className={`px-3 py-2  transition-colors flex items-center justify-between group ${isActive
                          ? "bg-[var(--color-accent)] text-white font-black shadow-md"
                          : "text-[var(--text-color)] font-extrabold hover:bg-[var(--color-accent)]/10 hover: text-[var(--color-accent)]"
                        }`}
                    >
                      <span className="text-sm font-bold tracking-wide">{page.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <button aria-label="Action button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-6 h-12 rounded-full  transition-colors duration-300 font-bold uppercase tracking-widest text-sm ${isOpen
            ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-gray-200"
            : "bg-[var(--color-accent)] text-white shadow-[0_0_30px_rgba(255,10,61,0.5)] hover:scale-105 hover:bg-[var(--color-accent-hover)]"
          }`}
        title="Page Navigator"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300">
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
        {isOpen ? 'Close' : 'Pages'}
      </button>
    </div>
  );
}
