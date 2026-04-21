import React from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function LiveHubPage() {
 console.log("🔥 Rebuilding Hub Server Component Interface!");
 
 // Fetch active LiveKit rooms directly from the streaming server natively
 let activeRooms: any[] = [];

 // --- FAKE INJECTION FOR VISUAL TESTING ---
 activeRooms = [
  { name: 'live_michael', numParticipants: 245, creationTime: Date.now() / 1000 - 1200, bg: '/images/mockups/thumb_clean.png' },
  { name: 'live_sammy', numParticipants: 84, creationTime: Date.now() / 1000 - 350, bg: '/images/mockups/thumb_clean.png' },
  { name: 'live_ryan', numParticipants: 412, creationTime: Date.now() / 1000 - 980, bg: '/images/mockups/thumb_clean.png' },
  { name: 'live_tony', numParticipants: 18, creationTime: Date.now() / 1000 - 60, bg: '/images/mockups/thumb_clean.png' },
 ];
 // -----------------------------------------

 // If we want to show crew member names instead of just their ID, we can fetch their profiles from Supabase.
 // Alternatively, we can just extract the name from the LiveKit room if we formatted it, but let's just show the clean room cards.

 return (
  <section className="py-24 min-h-screen bg-[var(--color-bg-primary)]">
   <div className="w-full px-4 md:px-8">
    {/* Header */}
    <div className="text-center mb-16">
     <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight">
      Live <span className="gradient-text">Stream Hub</span>
     </h1>
     <p className="text-white/40 mt-4 max-w-lg mx-auto text-lg hover:text-white/60 transition-colors cursor-default">
      {activeRooms.length > 0 
       ? `There are currently ${activeRooms.length} active crew streams happening right now. Jump into one!` 
       : 'The crew is currently offline. Check back during soundcheck or the actual show for backstage access!'}
     </p>
    </div>

    {/* Rooms Grid */}
    {activeRooms.length > 0 ? (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-[1440px] mx-auto">
      {activeRooms.map((room, index) => {
       // Optional: Prettify the "live_" prefix
       const prettyName = room.name.replace('live_', '').substring(0, 8).toUpperCase();
       
       return (
        <Link 
         href={`/live/${room.name}`} 
         key={room.name}
         className="group block bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-[#8a1cfc]/40 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-[0_10px_40px_rgba(138,28,252,0.15)]"
        >
         {/* Thumbnail Placeholder */}
         <div 
          className="aspect-video bg-[#0a0a0e] relative flex items-center justify-center border-b border-white/5 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url('${room.bg}')` }}
         >
          {/* Faux active visualizer */}
          <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-tr from-[#8a1cfc] to-transparent pointer-events-none" />
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500/90 rounded-md z-10 shadow-lg">
           <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
           <span className="text-white text-[0.6rem] font-bold uppercase tracking-widest text-shadow-sm">
            LIVE NOW
           </span>
          </div>
          
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20 group-hover:text-white/40 transition-colors group-hover:scale-110 duration-500">
           <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>

          {/* Active stats */}
          <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 rounded flex items-center gap-2 backdrop-blur-sm border border-white/10">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
           <span className="text-white/80 text-[0.65rem] font-bold tracking-widest uppercase">{room.numParticipants || 0} Viewers</span>
          </div>
         </div>

         {/* Meta */}
         <div className="p-6 relative">
          <div className="w-12 h-12 rounded-full bg-[#181824] absolute -top-6 right-6 border-4 border-[#0a0a0e] flex items-center justify-center text-white/50 text-xs font-black tracking-widest">
           {prettyName.slice(0, 2)}
          </div>
          <h3 className="text-xl font-bold text-white/90 mb-1">Crew Cam: {prettyName}</h3>
          <p className="text-sm text-white/40 flex items-center gap-2">
           Broadcast started recently
          </p>
         </div>
        </Link>
       );
      })}

      {/* DEV TEST ROOM */}
      <Link 
       href={`/live/demo-feed`} 
       className="group block bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-[#8a1cfc]/40 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-[0_10px_40px_rgba(138,28,252,0.15)]"
      >
       <div 
        className="aspect-video bg-[#0a0a0e] relative flex items-center justify-center border-b border-white/5 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('/images/mockups/thumb_clean.png')` }}
       >
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#8a1cfc]/40 to-transparent pointer-events-none" />
        <div className="w-12 h-12 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center z-10 shadow-xl">
         <span className="text-2xl">🧪</span>
        </div>
       </div>
       <div className="p-6 relative">
        <h3 className="text-xl font-bold text-white/90 mb-1">Testing & Demo Feed</h3>
        <p className="text-sm text-white/40">Click to preview the isolated chat layout</p>
       </div>
      </Link>
     </div>
    ) : (
     /* Offline Empty State */
     <div className="max-w-2xl mx-auto py-20 text-center bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-sm">
      <div className="w-20 h-20 mx-auto bg-white/[0.02] rounded-full flex items-center justify-center mb-6">
       <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
        <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
       </svg>
      </div>
      <h3 className="text-2xl font-bold text-white/80 mb-2">Backstage is Quiet</h3>
      <p className="text-white/40 mb-8">The crew hasn't fired up any cameras yet. Stand by!</p>

      {/* DEV TEST ROOM FOR EMPTY STATE */}
      <Link 
       href={`/live/7h-live-show`} 
       className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/80 transition-colors font-medium text-sm"
      >
       <span className="text-lg">🧪</span> Enter Development Sandbox Room
      </Link>
     </div>
    )}
   </div>
  </section>
 );
}
