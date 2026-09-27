"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "7h_scroll_pos_v1";

export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Tell the browser we'll handle scroll restoration ourselves
    if (typeof window !== "undefined") {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // When pathname changes (client-side navigation), save the PREVIOUS
    // page's scroll position and scroll the new page to top.
    if (prevPathname.current !== pathname) {
      try {
        const stored = JSON.parse(
          sessionStorage.getItem(STORAGE_KEY) || "{}",
        );
        stored[prevPathname.current] = window.scrollY;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch {}
      prevPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    // On popstate (back/forward button) restore saved scroll position
    const handlePopState = () => {
      try {
        const stored = JSON.parse(
          sessionStorage.getItem(STORAGE_KEY) || "{}",
        );
        const saved = stored[window.location.pathname];
        if (typeof saved === "number") {
          // Restore after paint so layout is stable
          requestAnimationFrame(() => {
            window.scrollTo({ top: saved, behavior: "instant" });
          });
        }
      } catch {}
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return <>{children}</>;
}

