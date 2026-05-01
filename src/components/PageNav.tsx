"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
  { path: "/admin", label: "🔒 Admin Panel" },
  { path: "/admin/emails", label: "📧 Email Templates" },
  { path: "/crew", label: "🎸 Crew Dashboard" },
  { path: "/fans", label: "⭐ Fan Dashboard" },
  { path: "/planner", label: "🗓️ Planner Dashboard" },
  { path: "/", label: "Home" },
  { path: "/bio", label: "Bio" },
  { path: "/tour", label: "Tour" },
  { path: "/video", label: "Video" },
  { path: "/news", label: "News" },
  { path: "/live", label: "Live Hub" },
  { path: "/live/live_michael", label: "Live Room (Demo)" },
  { path: "/store", label: "Store" },
  { path: "/cruise", label: "🚢 Cruise Landing" },
  { path: "/cruise/dashboard", label: "🚢 Cruise Dashboard" },
  { path: "/contact", label: "Contact" },
  { path: "/book", label: "Book" },
  { path: "/privacy", label: "📜 Privacy Policy" },
  { path: "/terms", label: "📜 Terms of Service" },
  { path: "/sitemap", label: "Sitemap" },
];

export function PageNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Only available in development
  if (process.env.NODE_ENV !== 'development') return null;

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

  return (
    <div className="fixed bottom-8 left-8 z-[9999] font-sans" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-full mb-4 left-0 w-[300px] bg-[#0a0a0e]/95 backdrop-blur-xl border border-[var(--color-accent)]/40 rounded-2xl shadow-[0_0_50px_rgba(133,29,239,0.3)] overflow-hidden animate-[fade-in-up_0.2s_ease-out_both] origin-bottom-left">
          <div className="p-4 border-b border-white/10 bg-[var(--color-accent)]/10">
            <h3 className="text-[var(--color-accent)] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Dev Navigator
            </h3>
            <p className="text-white/60 text-[0.65rem] mt-1 tracking-wide">Jump to any page instantly</p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
            {PAGES.map((page) => {
              const isActive = pathname === page.path;
              return (
                <Link
                  key={page.path}
                  href={page.path}
                  onClick={() => {
                    setIsOpen(false);
                    // Bypasses login for Restricted pages in dev mode
                    if (['/crew', '/admin', '/admin/emails', '/fans', '/planner'].includes(page.path)) {
                      localStorage.setItem('7h_dev_bypass', 'true');
                    }
                  }}
                  className={`px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                    isActive 
                      ? "bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/20" 
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-[0.8rem] font-bold tracking-wide">{page.label}</span>
                  <span className={`font-mono text-[0.6rem] ${isActive ? 'text-white/80' : 'text-white/30 group-hover:text-white/50'}`}>
                    {page.path}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-6 h-12 rounded-full shadow-2xl transition-all duration-300 font-bold uppercase tracking-widest text-[0.7rem] ${
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
