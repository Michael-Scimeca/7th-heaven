import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Signed-in Planner Dashboard</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#050508] text-white font-sans p-6 min-h-screen">
      <div class="max-w-4xl mx-auto space-y-6">
        
        {/* Top Navbar Header */}
        <div class="bg-[#0c0c16] border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-purple-600/30 border-2 border-purple-400 flex items-center justify-center font-black text-purple-300 text-lg">
              MR
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl font-black text-white italic">Marcus Rivera</h1>
                <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full">
                  📋 Event Planner
                </span>
              </div>
              <p class="text-xs text-white/50">planner@example.com · Verified 6-Digit PIN Auth</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Session
            </span>
          </div>
        </div>

        {/* Main Dashboard Banner */}
        <div class="bg-gradient-to-r from-purple-900/40 via-[#0f0c20] to-[#050508] border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="flex items-center justify-between relative z-10">
            <div>
              <span class="text-xs font-extrabold uppercase tracking-widest text-purple-400">Planner Coordinator Portal</span>
              <h2 class="text-2xl font-black text-white mt-1">Confirmed Event Bookings</h2>
              <p class="text-xs text-white/60 mt-1">Manage concert schedules, stage riders, and direct band manager communications.</p>
            </div>
            <div class="bg-purple-600/30 border border-purple-400/40 px-4 py-2 rounded-xl text-right">
              <span class="text-[10px] font-mono text-purple-300 uppercase block">Booking Reference</span>
              <span class="text-lg font-black text-white font-mono tracking-wider">7H-BK-4821</span>
            </div>
          </div>
        </div>

        {/* Booking Card Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Active Booking Card */}
          <div class="bg-[#0b0b14] border border-purple-500/30 rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span class="font-bold text-sm text-white">Full Band Concert</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                CONFIRMED
              </span>
            </div>

            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-white/40 uppercase font-semibold">Event Date</span>
                <span class="text-white font-bold">June 14, 2026</span>
              </div>
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-white/40 uppercase font-semibold">Venue</span>
                <span class="text-white font-bold">The Chicago Theatre</span>
              </div>
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-white/40 uppercase font-semibold">Location</span>
                <span class="text-white font-bold">Chicago, IL</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-white/40 uppercase font-semibold">Performance Window</span>
                <span class="text-purple-300 font-bold font-mono">7:00 PM – 10:00 PM</span>
              </div>
            </div>

            <div class="pt-2 flex items-center gap-2">
              <button class="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition">
                Manage Details
              </button>
              <button class="py-2 px-3 bg-white/5 border border-white/10 text-white/70 font-bold text-xs rounded-xl">
                Stage Rider
              </button>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div class="bg-[#0b0b14] border border-white/10 rounded-2xl p-5 space-y-4">
            <div class="pb-3 border-b border-white/10">
              <span class="font-bold text-sm text-white">Planner Coordinator Tools</span>
              <p class="text-[11px] text-white/40 mt-0.5">Quick actions for your upcoming events</p>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <span class="text-white/80 font-medium">📥 Download Official Contract (.pdf)</span>
                <span class="text-purple-400 font-bold text-[10px]">READY</span>
              </div>
              <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <span class="text-white/80 font-medium">📅 Export Schedule (.ics)</span>
                <span class="text-purple-400 font-bold text-[10px]">EXPORT</span>
              </div>
              <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <span class="text-white/80 font-medium">💬 Band Management Direct Chat</span>
                <span class="text-emerald-400 font-bold text-[10px]">ONLINE</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </body>
    </html>
  `;
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
