"use client";

import { useState, useEffect } from "react";

// --- COUNTDOWN TICKER ---
export function EmbarkationCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Mock target date: 6 months from now
    const target = new Date();
    target.setMonth(target.getMonth() + 6);
    target.setHours(15, 0, 0, 0);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-[var(--color-accent)]/20 to-[#0a0a0f] border border-[var(--color-accent)]/30 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)]/10 blur-[60px] rounded-full mix-blend-screen pointer-events-none" />
      
      <div className="flex items-center gap-4 border-r border-white/10 pr-6 shrink-0 z-10">
        <span className="text-4xl animate-bounce">🛳️</span>
        <div>
          <h2 className="text-white font-black italic tracking-wide text-lg">Embarkation</h2>
          <p className="text-[var(--color-accent)] font-bold uppercase tracking-widest text-[0.6rem]">Port of Miami</p>
        </div>
      </div>

      <div className="flex items-center gap-4 z-10">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center">
            <div className="bg-black/40 border border-white/10 rounded-lg w-12 h-14 flex items-center justify-center text-white font-mono font-bold text-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              {value.toString().padStart(2, '0')}
            </div>
            <span className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest mt-2">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


// --- DAILY POLL ---
export function DailyPoll() {
  const [voted, setVoted] = useState<number | null>(null);
  
  const options = [
    { id: 1, text: "7th Heaven's Greatest Hits", votes: 45 },
    { id: 2, text: "80s Rock Anthems Cover Set", votes: 82 },
    { id: 3, text: "Acoustic Sunset Session", votes: 28 },
  ];

  const totalVotes = options.reduce((acc, opt) => acc + opt.votes, 0) + (voted !== null ? 1 : 0);

  return (
    <div className="bg-[#0b0b12] border border-emerald-500/20 rounded-2xl p-8 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <span className="text-8xl">🗳️</span>
      </div>
      
      <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-400 mb-2">Community Poll</h2>
      <p className="text-white font-bold text-lg mb-6 relative z-10">What should the theme be for the Lido Deck Sailaway Party?</p>

      <div className="space-y-3 relative z-10">
        {options.map((opt) => {
          const optVotes = opt.votes + (voted === opt.id ? 1 : 0);
          const percent = Math.round((optVotes / totalVotes) * 100);
          const isWinner = percent === Math.max(...options.map(o => Math.round(((o.votes + (voted === o.id ? 1 : 0)) / totalVotes) * 100)));

          return (
            <button
              key={opt.id}
              onClick={() => !voted && setVoted(opt.id)}
              disabled={voted !== null}
              className={`w-full relative overflow-hidden rounded-xl border text-left transition-all ${
                voted === opt.id 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : voted !== null 
                    ? 'border-white/5 bg-white/5 cursor-default'
                    : 'border-white/10 bg-black/40 hover:border-emerald-500/40 hover:bg-white/5 cursor-pointer'
              }`}
            >
              {/* Progress bar background (only shows after voting) */}
              {voted !== null && (
                <div 
                  className={`absolute top-0 left-0 bottom-0 transition-all duration-1000 ease-out ${isWinner ? 'bg-emerald-500/20' : 'bg-white/5'}`} 
                  style={{ width: `${percent}%` }}
                />
              )}
              
              <div className="relative z-10 flex items-center justify-between p-4">
                <span className={`text-sm font-medium ${voted === opt.id ? 'text-emerald-400' : 'text-white/80'}`}>
                  {opt.text}
                </span>
                {voted !== null && (
                  <span className={`text-xs font-bold ${isWinner ? 'text-emerald-400' : 'text-white/40'}`}>
                    {percent}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-[0.6rem] text-white/30 uppercase tracking-widest mt-5 font-bold">
        {totalVotes} Total Votes • Poll closes in 24h
      </p>
    </div>
  );
}

// --- ORIGINS MAP WIDGET ---
export function OriginStats() {
  const stats = [
    { location: 'Illinois', count: 145 },
    { location: 'Florida', count: 42 },
    { location: 'Texas', count: 28 },
    { location: 'Canada', count: 12 },
    { location: 'Other', count: 185 },
  ];
  
  const maxCount = Math.max(...stats.map(s => s.count));

  return (
    <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
      <h2 className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-white/40 mb-5">Where Fans Are Sailing From</h2>
      
      <div className="space-y-4">
        {stats.map((stat, i) => (
          <div key={i}>
            <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider mb-1.5">
              <span className="text-white/70">{stat.location}</span>
              <span className="text-[var(--color-accent)]">{stat.count} fans</span>
            </div>
            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-[var(--color-accent)] to-cyan-500 rounded-full opacity-80 group-hover:opacity-100 transition-all duration-1000 delay-100"
                style={{ width: `${(stat.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- PHOTO WALL ---
export function PhotoWall() {
  const mockPhotos = [
    '/images/galleries/live_show_1.jpg',
    '/images/galleries/live_show_2.jpg',
    '/images/galleries/live_show_3.jpg',
    '/images/galleries/live_show_4.jpg',
    '/images/galleries/live_show_5.jpg',
    '/images/galleries/live_show_6.jpg',
  ];

  return (
    <div className="mt-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-xl font-black italic tracking-wide text-white uppercase mb-1">Fan Pre-Cruise Photo Wall</h2>
          <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Share your prep and packing photos!</p>
        </div>
        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all uppercase tracking-widest">
          + Upload
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {mockPhotos.map((src, i) => (
          <div 
            key={i} 
            className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden group cursor-pointer relative"
          >
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all z-10 flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white text-2xl">📸</span>
            </div>
            <div 
              className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
              style={{ backgroundImage: `url(${src})` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- BOOKING MANAGER ---
export function BookingManager({ email }: { email?: string }) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ guest_count: 1, phone: '', anonymous: false, guests: [] as any[] });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (!email) return;
    fetch(`/api/cruise/booking?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBooking(data.booking);
          setFormData({
            guest_count: data.booking.guest_count || 1,
            phone: data.booking.phone || '',
            anonymous: data.booking.anonymous || false,
            guests: data.booking.guests || []
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [email]);

  const handleSave = async () => {
    setSaveStatus('Saving...');
    try {
      const res = await fetch('/api/cruise/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...formData })
      });
      const data = await res.json();
      if (data.success) {
        setBooking(data.booking);
        setIsEditing(false);
        setSaveStatus('');
      } else {
        setSaveStatus('Error saving');
      }
    } catch {
      setSaveStatus('Error saving');
    }
  };

  if (loading) return (
    <div className="bg-[#0b0b12] border border-[var(--color-accent)]/20 p-8 rounded-2xl animate-pulse h-64" />
  );

  if (!booking) return (
    <div className="bg-[#0b0b12] border border-[var(--color-accent)]/20 p-8 rounded-2xl">
       <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Booking Status</h2>
       <p className="text-white/60 text-sm">You haven't signed up for the cruise priority list yet.</p>
    </div>
  );

  return (
    <div className="bg-[#0b0b12] border border-[var(--color-accent)]/20 p-8 rounded-2xl shadow-[0_0_30px_rgba(133,29,239,0.1)] relative overflow-hidden flex flex-col justify-between">
       <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <span className="text-8xl">🎫</span>
       </div>
       
       <div>
         <div className="flex justify-between items-center mb-6 relative z-10">
           <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Priority Status</h2>
           {!isEditing && (
             <button onClick={() => setIsEditing(true)} className="text-[var(--color-accent)] text-[0.65rem] font-bold uppercase tracking-widest hover:text-white transition-colors">
               Edit Info
             </button>
           )}
         </div>
         
         <div className="flex items-center gap-4 mb-6 relative z-10">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs">Registered</span>
         </div>
       </div>

       {isEditing ? (
         <div className="space-y-4 relative z-10 bg-black/40 p-4 rounded-xl border border-white/5">
           <div>
             <label className="block text-[0.6rem] font-bold text-white/40 uppercase tracking-widest mb-1">Party Size</label>
             <input 
               type="number" min="1" max="10"
               value={formData.guest_count} 
               onChange={e => setFormData({...formData, guest_count: parseInt(e.target.value) || 1})}
               className="w-full bg-[#0b0b12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]" 
             />
           </div>
           <div>
             <label className="block text-[0.6rem] font-bold text-white/40 uppercase tracking-widest mb-1">Phone Number</label>
             <input 
               type="text" 
               value={formData.phone} 
               onChange={e => setFormData({...formData, phone: e.target.value})}
               className="w-full bg-[#0b0b12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]" 
             />
           </div>
           <div className="flex items-center gap-2">
             <input 
               type="checkbox" 
               id="anon-check"
               checked={formData.anonymous}
               onChange={e => setFormData({...formData, anonymous: e.target.checked})}
               className="accent-[var(--color-accent)]"
             />
             <label htmlFor="anon-check" className="text-[0.65rem] font-bold text-white/60 uppercase tracking-widest cursor-pointer">Hide my name from passenger list</label>
           </div>
           
           <div className="pt-2 border-t border-white/5">
             <div className="flex justify-between items-center mb-2">
               <label className="block text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">Additional Guests</label>
               <button onClick={() => setFormData({...formData, guests: [...formData.guests, {name: '', type: 'adult'}]})} className="text-[0.6rem] font-bold text-[var(--color-accent)] hover:text-white uppercase tracking-widest">+ Add Guest</button>
             </div>
             <div className="space-y-2">
               {formData.guests.map((g: any, i: number) => (
                 <div key={i} className="flex gap-2">
                   <input 
                     type="text" placeholder="Name" value={g.name || ''} 
                     onChange={e => {
                       const newGuests = [...formData.guests];
                       newGuests[i].name = e.target.value;
                       setFormData({...formData, guests: newGuests});
                     }}
                     className="flex-1 bg-[#0b0b12] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--color-accent)]" 
                   />
                   <select 
                     value={g.type || 'adult'} 
                     onChange={e => {
                       const newGuests = [...formData.guests];
                       newGuests[i].type = e.target.value;
                       setFormData({...formData, guests: newGuests});
                     }}
                     className="bg-[#0b0b12] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                   >
                     <option value="adult">Adult</option>
                     <option value="child">Child</option>
                   </select>
                   <button 
                     onClick={() => {
                       const newGuests = formData.guests.filter((_, idx) => idx !== i);
                       setFormData({...formData, guests: newGuests});
                     }}
                     className="text-white/40 hover:text-red-400 px-1"
                   >
                     ✕
                   </button>
                 </div>
               ))}
             </div>
           </div>
           <div className="flex gap-2 mt-4 pt-2 border-t border-white/5">
             <button onClick={handleSave} className="flex-1 py-2 bg-[var(--color-accent)] text-white rounded-lg text-[0.65rem] font-bold uppercase tracking-widest hover:bg-[var(--color-accent)]/80 transition-all">
               {saveStatus || 'Save'}
             </button>
             <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white/5 text-white/60 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
               Cancel
             </button>
           </div>
         </div>
       ) : (
         <div className="relative z-10 space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
           <div className="flex justify-between items-center border-b border-white/5 pb-2">
             <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Name</span>
             <span className="text-sm font-medium text-white">{booking.name}</span>
           </div>
           <div className="flex justify-between items-center border-b border-white/5 pb-2">
             <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Party Size</span>
             <span className="text-sm font-black text-[var(--color-accent)]">{booking.guest_count} <span className="text-[0.65rem] font-normal text-white/40 ml-1">Guests</span></span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Phone</span>
             <span className="text-sm font-medium text-white">{booking.phone || '—'}</span>
           </div>
           
           {booking.guests && booking.guests.length > 0 && (
             <div className="mt-4 border-t border-white/5 pt-4">
               <h3 className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest mb-3">Guest List</h3>
               <div className="space-y-2">
                 {booking.guests.map((g: any, i: number) => (
                   <div key={i} className="flex justify-between items-center text-xs">
                     <span className="text-white font-medium">{g.name || `Guest ${i+2}`}</span>
                     <span className="text-white/40">{g.type === 'child' ? `Child ${g.age ? `(Age ${g.age})` : ''}` : 'Adult'}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>
       )}
    </div>
  );
}

// --- IMPORTANT LINKS WIDGET ---
export function ImportantLinksWidget() {
  const [links, setLinks] = useState<{title: string, url: string, icon: string}[]>([]);

  useEffect(() => {
    fetch(`/api/cruise/important-links?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.links && Array.isArray(data.links)) {
          setLinks(data.links);
        }
      })
      .catch(() => {});
  }, []);

  if (links.length === 0) return null;

  return (
    <div className="bg-[#0b0b12] border border-fuchsia-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(217,70,239,0.05)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <span className="text-8xl">🔗</span>
      </div>
      
      <div className="flex justify-between items-end mb-6 relative z-10">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-fuchsia-400 mb-1">Quick Access</h2>
          <p className="text-white font-bold text-lg">Important Links</p>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 hover:border-fuchsia-500/30 transition-all text-left group/item"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{link.icon || '🔗'}</span>
              <span className="text-sm font-medium text-white/90 group-hover/item:text-white transition-colors">
                {link.title}
              </span>
            </div>
            <span className="text-fuchsia-400 opacity-0 group-hover/item:opacity-100 transition-opacity -translate-x-2 group-hover/item:translate-x-0 duration-300">
              →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// --- SONG REQUEST LEADERBOARD ---
export function SongRequestLeaderboard() {
  const [songs, setSongs] = useState([
    { id: 1, title: "Sing", votes: 412 },
    { id: 2, title: "Beautiful Life", votes: 385 },
    { id: 3, title: "Stoplight", votes: 290 },
    { id: 4, title: "Time of Our Lives", votes: 215 },
  ]);

  const handleVote = (id: number) => {
    setSongs(songs.map(song => song.id === id ? { ...song, votes: song.votes + 1 } : song).sort((a, b) => b.votes - a.votes));
  };

  return (
    <div className="bg-[#0b0b12] border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-sm">🎸</div>
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400">Setlist Requests</h2>
          <p className="text-white/40 text-[0.65rem] uppercase tracking-widest mt-0.5">Top 3 get played on Lido Deck</p>
        </div>
      </div>

      <div className="space-y-4">
        {songs.map((song, i) => (
          <div key={song.id} className="flex items-center gap-4 group">
            <span className={`text-sm font-black w-4 text-center ${i < 3 ? 'text-amber-500' : 'text-white/20'}`}>
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="text-white/90 font-medium text-sm">{song.title}</div>
              <div className="text-white/30 text-xs">{song.votes} votes</div>
            </div>
            <button 
              onClick={() => handleVote(song.id)}
              className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-400 transition-all text-white/40"
            >
              ▲
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- CAPTAIN's LOG (AUDIO NOTES) ---
export function CaptainsLog() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setIsPlaying(false); return 0; }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(t);
  }, [isPlaying]);

  return (
    <div className="bg-gradient-to-br from-[#0b0b12] to-[#120b18] border border-purple-500/20 rounded-2xl p-6 shadow-xl relative">
      <h2 className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-purple-400 mb-4">Captain's Log</h2>
      
      <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 hover:bg-purple-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-white truncate">Rehearsal Update!</span>
            <span className="text-[0.65rem] text-purple-400/80 font-mono">0:42</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <p className="text-[0.65rem] text-white/40 mt-3 italic text-center">
        "Hey everyone, Richard here! We are running through the 80s set right now..."
      </p>
    </div>
  );
}



// --- EXCURSION TEASERS ---
export function ExcursionTeasers() {
  const excursions = [
    { title: "Cozumel Snorkel & Sail", bandMember: "Richard", spots: 12 },
    { title: "Mayan Ruins Exploration", bandMember: "Michael", spots: 4 },
  ];

  return (
    <div className="bg-[#0b0b12] border border-cyan-500/20 rounded-2xl p-6">
      <h2 className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-cyan-400 mb-5">Band Excursions</h2>
      
      <div className="space-y-3">
        {excursions.map((ex, i) => (
          <div key={i} className="p-3 rounded-xl bg-cyan-900/10 border border-cyan-500/10 hover:border-cyan-500/30 transition-colors flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white mb-0.5">{ex.title}</div>
              <div className="text-[0.65rem] text-cyan-400/80 uppercase tracking-wider">Join {ex.bandMember}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-white">{ex.spots}</div>
              <div className="text-[0.55rem] text-white/40 uppercase tracking-widest">Spots Left</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

