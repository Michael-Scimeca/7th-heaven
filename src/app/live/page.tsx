"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

interface LiveRoom {
  name: string;
  title: string;
  numParticipants: number;
  creationTime: number;
  source: "livekit" | "supabase" | "local";
}

export default function LiveHubPage() {

  const [activeRooms, setActiveRooms] = useState<LiveRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use pre-configured supabase client
    // const supabase is imported above
    if (!supabase) {
      console.error("Supabase client not configured – check env vars");
      setLoading(false);
      return;
    }

    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/live-rooms");
        const data = await res.json();
        const rooms = (data.rooms || []).filter((r: any) => r.name?.startsWith('live_'));
        
        setActiveRooms(rooms.map((r: any) => ({
          name: r.name,
          title: r.title,
          numParticipants: r.numParticipants,
          creationTime: r.creationTime,
          source: "livekit"
        })));
      } catch (e) {
        console.error("Aggregation failed", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  

const getElapsed = (creationTime: number) => {
    const seconds = Math.floor(Date.now() / 1000 - creationTime);
    if (seconds < 60) return "Just started";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };
  
  const copyLink = (roomName: string) => {
    const slug = roomName.replace(/^live_/, '');
    const url = `${window.location.origin}/live/${slug}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <section className="py-24 min-h-screen bg-[var(--color-bg-primary)]">
      <div className="w-full px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight">
            Live <span className="gradient-text">Stream Hub</span>
          </h1>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-lg hover:text-white/60 transition-colors cursor-default">
            {loading
              ? "Checking for active crew feeds..."
              : activeRooms.length > 0
              ? `${activeRooms.length} active crew stream${activeRooms.length > 1 ? "s" : ""} happening now. Dive in!`
              : "The crew is currently offline. Check back during soundcheck or the show for backstage access!"}
          </p>
        </div>

        {/* Rooms */}
        {loading ? (
          <div className="max-w-2xl mx-auto py-20 text-center">
            <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/30 text-sm uppercase tracking-widest font-bold">
              Scanning feeds
            </p>
          </div>
        ) : activeRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 max-w-[1440px] mx-auto">
            {activeRooms.map((room) => {
              const prettyName = room.name.replace("live_", "").substring(0, 12).toUpperCase();
              const displayTitle = room.title || `Crew Cam: ${prettyName}`;
              return (
                <div
                  key={room.name}
                  className="group block bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-[#8a1cfc]/40 hover:bg-white/[0.04] transition-all duration-300 shadow-xl"
                >
                  <Link href={`/live/${room.name.replace(/^live_/, '')}`}>
                  {/* Thumbnail */}
                  <div className="aspect-video bg-[#0a0a0e] relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-tr from-[#8a1cfc] to-transparent pointer-events-none" />
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500/90 rounded-md z-10 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-white text-[0.6rem] font-bold uppercase tracking-widest">
                        LIVE NOW
                      </span>
                    </div>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-white/20 group-hover:text-white/40 transition-colors group-hover:scale-110 duration-500"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>

                    {/* Stats */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <div className="px-2 py-1 bg-black/60 rounded flex items-center gap-2 backdrop-blur-sm border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-white/80 text-[0.65rem] font-bold tracking-widest uppercase">
                          {room.numParticipants || 0} Viewers
                        </span>
                      </div>
                      <div className="px-2 py-1 bg-black/60 rounded backdrop-blur-sm border border-white/10">
                        <span className="text-white/60 text-[0.6rem] font-bold tracking-widest uppercase">
                          {getElapsed(room.creationTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  </Link>

                  {/* Meta */}
                  <div className="p-6 relative flex justify-between items-center">
                    <div>
                      <div className="w-12 h-12 rounded-full bg-[#181824] absolute -top-6 right-6 border-4 border-[#0a0a0e] flex items-center justify-center text-white/50 text-xs font-black tracking-widest">
                        {prettyName.slice(0, 2)}
                      </div>
                      <h3 className="text-xl font-bold text-white/90 mb-1">
                        {displayTitle}
                      </h3>
                      <p className="text-sm text-white/40 flex items-center gap-2">
                        {room.source === "livekit"
                          ? "LiveKit Stream"
                          : room.source === "supabase"
                          ? "Supabase Stream"
                          : "Local Broadcast"} · Started {getElapsed(room.creationTime)}
                      </p>
                    </div>
                    <button 
                      onClick={() => copyLink(room.name)}
                      className="ml-4 px-3 py-1 text-[0.7rem] bg-white/10 hover:bg-white/20 text-white rounded transition"
                    >
                      COPY LINK
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-16 h-16 mb-6 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1"/></svg>
            <span className="text-2xl font-black italic tracking-tight text-white/50 mb-8">No live feed available</span>
            
            <div className="max-w-2xl w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#c084fc] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c084fc] animate-pulse" />
                What to expect when we go live
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: "🎬", text: "Behind-the-scenes stories" },
                  { icon: "🎵", text: "Live song requests" },
                  { icon: "💬", text: "Interactive live Q&As" },
                  { icon: "🎧", text: "Exclusive studio snippets" },
                  { icon: "⭐", text: "Band member spotlights" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#8a1cfc]/30 hover:bg-white/10 transition-colors">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-bold text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
