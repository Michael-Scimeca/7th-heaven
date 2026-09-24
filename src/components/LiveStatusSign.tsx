"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";

export default function LiveStatusSign() {
  const [isLive, setIsLive] = useState(false);
  const [liveCount, setLiveCount] = useState(0);

  const checkLiveStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/live-rooms");
      if (res.ok) {
        const data = await res.json();
        const allRooms = data.rooms || [];
        const visibleRooms = allRooms.filter((r: any) => r.showOnHomepage);

        if (visibleRooms.length > 0) {
          setIsLive(true);
          setLiveCount(visibleRooms.length);
        } else {
          setIsLive(false);
          setLiveCount(0);
        }
      }
    } catch {
      // API unavailable — silently stay in "not live" state
      setIsLive(false);
    }
  }, []);

  useEffect(() => {
    checkLiveStatus();
    // Check every 30 seconds
    const interval = setInterval(checkLiveStatus, 30000);
    return () => clearInterval(interval);
  }, [checkLiveStatus]);

  if (!isLive) return null;

  return (
    <div className="fixed top-24 left-1/2 z-[100] -translate-x-1/2 animate-[fade-in-down_0.8s_var(--ease-out-expo)]">
      <Link href="/live" className="group">
        <div className="relative flex items-center gap-4 overflow-hidden rounded-lg border border-white/10 bg-black/60 px-6 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl hover:border-red-500/50">
          {/* Background Glow */}
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:translate-x-[100%]" />

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-lg bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-lg bg-red-500" />
            </span>
            <span>Live Now</span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            <span>
              {liveCount} Active {liveCount === 1 ? "Feed" : "Feeds"}
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[#00000029] group-hover:border-red-500 group-hover:bg-red-500">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
