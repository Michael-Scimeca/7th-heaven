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
      { path: "/fan-photo-wall", label: "Fan Wall" },
      { path: "/live", label: "Live" },
      { path: "/cruise", label: "Cruise" },
      { path: "/book", label: "Book Band" },
      { path: "/contact", label: "Contact" },
    ]
  },
  {
    name: "Footer Nav Pages",
    pages: [
      { path: "/faq", label: "FAQ" },
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
    ]
  },
  {
    name: "Planner Pages",
    pages: [
      { path: "/planner", label: "Planner Dashboard" },
    ]
  },
  {
    name: "Cruise Pages",
    pages: [
      { path: "/cruise/dashboard", label: "Cruise Dashboard" },
    ]
  },
  {
    name: "Verification Pages",
    pages: [
      { path: "/crew/verify", label: "Crew Verify" },
      { path: "/planner/verify", label: "Planner Verify" },
      { path: "/cruise/verify", label: "Cruise Verify" },
      { path: "/claim/123456", label: "Raffle Claim Verify" },
    ]
  },
  {
    name: "Admin Pages",
    pages: [
      { path: "/admin", label: "Admin Dashboard" },
      { path: "/admin/shop-inventory", label: "Shop Inventory" },
      { path: "/studio", label: "Sanity Studio" },
    ]
  },
  {
    name: "Email Pages",
    pages: [
      { path: "/admin/emails", label: "Email Templates" },
      { path: "/admin/email-map", label: "Email Map" },
      { path: "/cruise/email-preview", label: "Email Preview" },
    ]
  },
  {
    name: "Merch Pages",
    pages: [
      { path: "/merch", label: "Merch Store" },
      { path: "/qr/merch", label: "QR Merch" },
      { path: "/payment-test", label: "Test Shop (North/EPX)" },
    ]
  },
  {
    name: "Misc",
    pages: [
      { path: "/admin/legal", label: "Legal & Compliance Verify" },
      { path: "/features", label: "Features" },
      { path: "/style-guide", label: "Style Guide" },
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
    <div className="fixed bottom-8 left-8 z-[999999] font-sans pointer-events-auto select-none" ref={menuRef}>
      {isOpen && (
        <div
          className="absolute bottom-full mb-4 left-0 w-[320px] sm:w-[340px] bg-[#0c0817]/85 backdrop-blur-2xl border border-purple-500/30 rounded-lg  shadow-[0_25px_70px_rgba(0,0,0,0.85)] animate-[fade-in-up_0.2s_ease-out_both] origin-bottom-left flex flex-col overflow-hidden pointer-events-auto"
          style={{ maxHeight: 'min(80vh, 600px)' }}
        >
          {/* Header — fixed, translucent blur */}
          <div className="py-4 border-b border-white/10 bg-white/[0.04] backdrop-blur-md shrink-0">
            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Dev Navigator
            </h3>
            <p className="text-white/50 text-xs mt-1 font-semibold tracking-wide">Jump to any page instantly</p>
          </div>

          {/* Scrollable list — grows to fill remaining height with visible custom scrollbar */}
          <div
            ref={listRef}
            className="p-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar rounded-b-2xl bg-transparent text-white"
            style={{
              overscrollBehavior: 'contain',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(168, 85, 247, 0.6) rgba(255, 255, 255, 0.05)'
            }}
          >
            {CATEGORIES.map((category) => (
              <div key={category.name} className="flex flex-col gap-1">
                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-purple-400 pl-2 mt-2 mb-1 border-b border-white/10 pb-1">{category.name}</h4>
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
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-between group ${isActive
                        ? "bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
                        : "text-white/80 font-bold hover:bg-white/10 hover:text-white"
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

      <button
        type="button"
        aria-label="Action button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center gap-2 px-6 h-12 rounded-full transition-colors duration-300 font-bold uppercase tracking-widest text-sm cursor-pointer pointer-events-auto select-none ${isOpen
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
