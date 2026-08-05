"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AnnouncementBannerProps {
  text: string;
  link?: string;
  linkText?: string;
  inline?: boolean;
}

export default function AnnouncementBanner({ text, link, linkText, inline }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isClosed = sessionStorage.getItem("announcement_banner_closed");
    if (isClosed === "true") {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("announcement_banner_closed", "true");
  };

  if (!isVisible) return null;

  if (inline) {
    return (
      <div className="site-container my-6 animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.2s_both]">
        <div className="relative overflow-hidden bg-gradient-to-r from-[var(--color-purple-primary)] to-[var(--color-purple-hover)] p-4 sm:p-5 shadow-[0_8px_30px_var(--color-purple-glow)] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg animate-pulse shrink-0">⚠️</span>
            <div 
              className="text-xs sm:text-sm font-black italic text-white uppercase tracking-widest leading-snug [&_p]:m-0 [&_p]:inline" 
              dangerouslySetInnerHTML={{ __html: text }} 
            />
          </div>
          {link && (
            <Link href={link} className="shrink-0 px-5 py-2 bg-black/30 hover:bg-black/50 text-white text-[var(--font-size-xs)] font-black uppercase tracking-widest rounded-lg transition-colors border border-white/20">
              {linkText || "Read More"}
            </Link>
          )}
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer flex items-center justify-center sm:relative sm:right-0 sm:top-0"
            aria-label="Close Announcement"
            title="Close Banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-[72px] left-0 w-screen z-[49] bg-gradient-to-r from-[var(--color-accent)] to-[#6b1dcf] animate-[fade-in-down_0.5s_var(--ease-out-expo)_0.2s_both] shadow-[0_4px_25px_rgba(255,10,61,0.4)] border-b border-white/20">
      <div className="site-container py-3 flex flex-col sm:flex-row items-center justify-center gap-4 relative pr-10">
        <div className="flex items-center gap-3">
          <span className="text-lg animate-pulse shrink-0">⚠️</span>
          <div 
            className="text-xs sm:text-sm font-black italic text-white uppercase tracking-widest leading-snug [&_p]:m-0 [&_p]:inline" 
            dangerouslySetInnerHTML={{ __html: text }} 
          />
        </div>
        {link && (
          <Link href={link} className="shrink-0 px-5 py-2 bg-black/30 hover:bg-black/50 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors border border-white/20">
            {linkText || "Read More"}
          </Link>
        )}
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer flex items-center justify-center"
          aria-label="Close Announcement"
          title="Close Banner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
