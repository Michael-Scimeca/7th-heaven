"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LiveStatusSign() {
  const [isLive, setIsLive] = useState(false);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const res = await fetch("/api/live-rooms");
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
      } catch (err) {
        console.error("Failed to check live status", err);
        setIsLive(false);
      }
    };

    checkLiveStatus();
    // Check every 30 seconds
    const interval = setInterval(checkLiveStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isLive) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-[fade-in-down_0.8s_var(--ease-out-expo)]">
      <Link href="/live" className="group">
        <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full flex items-center gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-red-500/50 transition-all duration-500 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-white">Live Now</span>
          </div>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] font-bold text-white/60 tracking-wide uppercase">
              {liveCount} Active {liveCount === 1 ? 'Feed' : 'Feeds'}
            </span>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10 group-hover:bg-red-500 group-hover:border-red-500 transition-all duration-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
