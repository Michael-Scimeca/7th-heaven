"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CATEGORIES = [
  {
    name: "Internal & Dashboards",
    pages: [
      { path: "/admin", label: "🔒 Admin Panel" },
      { path: "/admin/MikeyS", label: "🔒 Admin: MikeyS" },
      { path: "/admin/RichH", label: "🔒 Admin: RichH" },
      { path: "/admin/emails", label: "📧 Email Templates" },
      { path: "/admin/legal", label: "⚖️ Legal Compliance Guide" },
      { path: "/crew-michael", label: "🎸 Crew: Michael" },
      { path: "/crew-ryan", label: "🎸 Crew: Ryan" },
      { path: "/crew-sam", label: "🎸 Crew: Sammy" },
      { path: "/crew-tony", label: "🎸 Crew: Tony" },
      { path: "/fans", label: "⭐ Fan Dashboard" },
      { path: "/fans/demo", label: "⭐ Fan Demo" },
      { path: "/planner", label: "🗓️ Planner Dashboard" },
      { path: "/studio", label: "🎛️ Studio" },
    ]
  },
  {
    name: "Public Site",
    pages: [
      { path: "/", label: "Home" },
      { path: "/bio", label: "Bio" },
      { path: "/#tour", label: "Tour" },
      { path: "/shows", label: "Shows" },
      { path: "/music", label: "Music" },
      { path: "/video", label: "Video" },
      { path: "/news", label: "News" },
      { path: "/members", label: "Members" },
      { path: "/store", label: "Store" },
      { path: "/merch", label: "Merch" },
      { path: "/contact", label: "Contact" },
      { path: "/book", label: "Book" },
      { path: "/faq", label: "FAQ" },
      { path: "/returns", label: "Returns & Refunds" },
    ]
  },
  {
    name: "Live & Interactive",
    pages: [
      { path: "/live", label: "Live Hub" },
      { path: "/live/michael", label: "Live Room (Michael)" },
      { path: "/live/live_michael", label: "Live Room (Demo)" },
      { path: "/fan-photo-wall", label: "📸 Fan Photo Wall" },
      { path: "/demo/proximity", label: "📍 Proximity Demo" },
    ]
  },
  {
    name: "Cruise",
    pages: [
      { path: "/cruise", label: "🚢 Cruise Landing" },
      { path: "/cruise/demo", label: "🚢 Cruise Dashboard" },
    ]
  },
  {
    name: "Utility",
    pages: [
      { path: "/claim", label: "🎁 Claim Prize" },
      { path: "/privacy", label: "📜 Privacy Policy" },
      { path: "/terms", label: "📜 Terms of Service" },
      { path: "/sitemap", label: "Sitemap" },
      { path: "/sitemap/flowchart", label: "🗺️ Flowchart Sitemap" },
    ]
  }
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

  // Only available in development
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-8 left-8 z-[9999] font-sans" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-full mb-4 left-0 w-[300px] bg-[#0a0a0e]/95 backdrop-blur-xl border border-[var(--color-accent)]/40 rounded-2xl shadow-[0_0_50px_rgba(133,29,239,0.3)] animate-[fade-in-up_0.2s_ease-out_both] origin-bottom-left flex flex-col" style={{ maxHeight: 'min(80vh, 600px)' }}>
          {/* Header — fixed, never scrolls */}
          <div className="p-4 border-b border-white/10 bg-[var(--color-accent)]/10 rounded-t-2xl shrink-0">
            <h3 className="text-[var(--color-accent)] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Dev Navigator
            </h3>
            <p className="text-white/60 text-xs mt-1 tracking-wide">Jump to any page instantly</p>
          </div>

          {/* Scrollable list — grows to fill remaining height */}
          <div
            ref={listRef}
            className="p-2 flex flex-col gap-3 overflow-y-scroll rounded-b-2xl"
            style={{ overscrollBehavior: 'contain' }}
          >
            {CATEGORIES.map((category) => (
              <div key={category.name} className="flex flex-col gap-1">
                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-[var(--color-accent)]/80 pl-2 mt-1 mb-1">{category.name}</h4>
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
                      className={`px-3 py-2 rounded-xl transition-all flex items-center justify-between group ${
                        isActive 
                          ? "bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/20" 
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="text-sm font-bold tracking-wide">{page.label}</span>
                      <span className={`font-mono text-xs ${isActive ? 'text-white/80' : 'text-white/30 group-hover:text-white/50'}`}>
                        {page.path}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-6 h-12 rounded-full shadow-2xl transition-all duration-300 font-bold uppercase tracking-widest text-sm ${
          isOpen 
            ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-gray-200" 
            : "bg-[var(--color-accent)] text-white shadow-[0_0_30px_rgba(133,29,239,0.5)] hover:scale-105 hover:bg-[#9d3cff]"
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
