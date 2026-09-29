"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { sanitizeBannerHtml } from "@/lib/sanitize-html";

interface AnnouncementBannerProps {
  text: string;
  link?: string;
  linkText?: string;
  inline?: boolean;
  className?: string;
}

const noopSubscribe = () => () => {};
const getDismissedSnapshot = () => {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem("announcement_banner_closed_text") || "";
  } catch {
    return "";
  }
};
const getServerSnapshot = () => "";

export default function AnnouncementBanner({
  text,
  link,
  linkText,
  inline,
  className,
}: AnnouncementBannerProps) {
  const [localDismissed, setLocalDismissed] = useState<string | null>(null);
  const sessionDismissed = useSyncExternalStore(
    noopSubscribe,
    getDismissedSnapshot,
    getServerSnapshot,
  );

  const isDismissed = localDismissed === text || sessionDismissed === text;

  const handleClose = () => {
    setLocalDismissed(text);
    try {
      sessionStorage.setItem("announcement_banner_closed_text", text);
    } catch {}
  };

  if (isDismissed) return null;

  if (inline) {
    return (
      <div
        role="region"
        aria-label="Announcement"
        className={className || "site-container my-6 animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.2s_both]"}
      >
        <div className="relative flex flex-col items-center justify-between gap-4 overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-gradient-to-r from-[var(--color-purple-primary)] to-[var(--color-purple-hover)] p-4 shadow-[0_8px_30px_var(--color-purple-glow)] sm:flex-row sm:p-5">
          <div className="flex w-full min-w-0 items-center gap-3 pr-8 sm:w-auto sm:pr-0">
            <span className="shrink-0 animate-pulse">⚠️</span>
            <div
              className="min-w-0 break-words [&_p]:m-0 [&_p]:inline"
              dangerouslySetInnerHTML={{ __html: sanitizeBannerHtml(text) }}
            />
          </div>
          {link && (
            <Link
              href={link}
              className="shrink-0 rounded-[var(--radius-box)] border border-white/10 bg-black/30 px-5 py-2 text-[var(--font-size-xs)] hover:bg-black/50"
            >
              {linkText || "Read More"}
            </Link>
          )}

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#00000029] p-1 text-white/50 hover:bg-white/10 hover:text-white sm:relative sm:top-0 sm:right-0"
            aria-label="Close Announcement"
            title="Close Banner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-[72px] left-0 z-[49] w-full animate-[fade-in-down_0.5s_var(--ease-out-expo)_0.2s_both] border-b border-white/10 bg-gradient-to-r from-[var(--color-accent)] to-[#6b1dcf] shadow-[0_4px_25px_rgba(255,10,61,0.4)]">
      <div className="site-container relative flex flex-col items-center justify-center gap-4 py-3 pr-10 sm:flex-row">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 animate-pulse">⚠️</span>
          <div
            className="min-w-0 break-words [&_p]:m-0 [&_p]:inline"
            dangerouslySetInnerHTML={{ __html: sanitizeBannerHtml(text) }}
          />
        </div>
        {link && (
          <Link
            href={link}
            className="shrink-0  border border-white/10 bg-black/30 px-5 py-2 hover:bg-black/50"
          >
            {linkText || "Read More"}
          </Link>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-1/2 right-4 flex -translate-y-1/2 cursor-pointer items-center justify-center  bg-[#00000029] p-1 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Close Announcement"
          title="Close Banner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
