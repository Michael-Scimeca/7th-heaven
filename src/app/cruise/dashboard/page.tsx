"use client";

import { useMember } from "@/context/MemberContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import CruiseChat from "@/components/CruiseChat";
import { EmbarkationCountdown, ImportantLinksWidget, BookingManager } from "@/components/CruiseWidgets";

function PassengersWidget() {
  const avatars = ['JD', 'SL', 'MT', 'AB', 'RC', 'KW'];
  const totalFans = 412;
  
  return (
    <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-6 mb-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-accent)]/20 transition-all duration-500 pointer-events-none" />
      
      <div className="flex justify-between items-end mb-5 relative z-10">
        <div>
          <h2 className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">Community</h2>
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-2xl italic tracking-wide">{totalFans}</span>
            <span className="text-[var(--color-accent)] font-bold uppercase tracking-widest text-[0.65rem]">Fans Onboard</span>
          </div>
        </div>
      </div>

      <div className="flex items-center relative z-10 mb-4">
        <div className="flex -space-x-3">
          {avatars.map((initials, i) => {
            const colors = ['bg-rose-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-pink-500'];
            return (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#0b0b12] ${colors[i % colors.length]} flex items-center justify-center overflow-hidden shadow-lg hover:-translate-y-1 transition-transform cursor-pointer relative z-[${10-i}]`}>
                <span className="text-[0.55rem] font-black text-white/90 tracking-widest">{initials}</span>
              </div>
            );
          })}
          <div className="w-10 h-10 rounded-full border-2 border-[#0b0b12] bg-[var(--color-accent)]/20 flex items-center justify-center shadow-lg text-[var(--color-accent)] font-bold text-[0.65rem] relative z-0">
            +{totalFans - avatars.length}
          </div>
        </div>
      </div>
      
      <p className="text-white/30 text-[0.65rem] leading-relaxed relative z-10 border-t border-white/5 pt-4">
        Join the official 7th Heaven cruise community. See who else is sailing, coordinate shore excursions, and make new friends!
      </p>
    </div>
  );
}

export default function CruiseDashboard() {
  const { isLoggedIn, member } = useMember();
  const router = useRouter();

  const [announcement, setAnnouncement] = useState<string | null>(null);

  type ItineraryEvent = { id: string; time: string; title: string; subtitle: string; };
  type ItineraryDay = { id: string; dayLabel: string; location: string; theme: string; events: ItineraryEvent[]; colorTheme: string; };
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  useEffect(() => {
    // Basic redirect if not logged in (bypassed in dev if desired)
    if (isLoggedIn === false && !localStorage.getItem('7h_dev_bypass')) {
      router.push("/cruise");
    }

    // Load Cruise Itinerary
    fetch(`/api/cruise/itinerary?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        let actualData = data;
        let attempts = 0;
        while (typeof actualData === 'string' && attempts < 3) {
          try { actualData = JSON.parse(actualData); } catch(e) { break; }
          attempts++;
        }
        if (Array.isArray(actualData) && actualData.length > 0) {
          setItinerary(actualData);
        }
      })
      .catch(() => {});

    fetch(`/api/cruise/announcement?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        let actualData = data;
        let attempts = 0;
        while (typeof actualData === 'string' && attempts < 3) {
          try { actualData = JSON.parse(actualData); } catch(e) { break; }
          attempts++;
        }
        
        if (actualData?.message) {
          setAnnouncement(actualData.message);
        } else {
          setAnnouncement(null); // Ensure it clears if empty
        }
      })
      .catch(() => {});
  }, [isLoggedIn, router]);

  if (isLoggedIn === undefined) return <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-32 pb-20 px-6">
      <div className="site-container">
        <header className="mb-8 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">🚢</span>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-widest text-white">Cruise Hub</h1>
                <p className="text-[var(--color-accent)] font-bold text-[0.75rem] tracking-widest uppercase mt-1">Passenger Area</p>
              </div>
            </div>
            <p className="text-white/60 text-lg max-w-xl">Welcome aboard, <strong className="text-white">{member?.name || 'Guest'}</strong>. Here is your official cruise status and early access portal.</p>
          </div>

          <div className="shrink-0">
            <EmbarkationCountdown />
          </div>
        </header>

        {announcement && (
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-950/40 to-[#0a0a0f] border border-cyan-500/30 rounded-2xl mb-8 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />
            
            <div className="p-6 md:p-8 relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <span className="animate-pulse">🔔</span>
                </div>
                <h3 className="text-lg font-black italic tracking-wider text-white uppercase">Captain's Log</h3>
                <span className="ml-auto text-[0.6rem] font-bold tracking-[0.2em] uppercase text-cyan-500/60 border border-cyan-500/20 px-2 py-1 rounded">Priority Update</span>
              </div>
              <div 
                className="text-white/80 text-sm leading-relaxed space-y-4 [&_a]:text-cyan-400 [&_a]:underline [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_strong]:text-white [&_strong]:font-bold [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white"
                dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(announcement) : announcement }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <BookingManager email={member?.email} />
              <ImportantLinksWidget />
            </div>

            {itinerary.length > 0 && (
              <div>
                <h2 className="text-xl font-black italic tracking-wide text-white uppercase mb-6 flex items-center gap-3">
                  <span className="text-[var(--color-accent)]">⚓</span> Official Itinerary <span className="text-[0.65rem] font-bold text-white/30 tracking-widest not-italic ml-2 uppercase">Subject to Change</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itinerary.map(day => (
                    <div key={day.id} className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300" style={{ '--tw-border-opacity': '0.4', borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)` } as React.CSSProperties}>
                      <div 
                        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 transition-all duration-500 pointer-events-none opacity-10 group-hover:opacity-20" 
                        style={{ backgroundColor: day.colorTheme }} 
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-5">
                          <span 
                            className="text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded border" 
                            style={{ color: day.colorTheme, backgroundColor: `color-mix(in srgb, ${day.colorTheme} 10%, transparent)`, borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)` }}
                          >{day.dayLabel}</span>
                          <span className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">{day.location}</span>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">{day.theme}</h3>
                        <ul className="space-y-4 mt-5 border-t border-white/5 pt-5">
                          {day.events.map(ev => (
                            <li key={ev.id} className="flex items-start gap-4">
                              <span className="font-mono text-xs font-bold tracking-wider mt-0.5" style={{ color: day.colorTheme }}>{ev.time}</span>
                              <div>
                                <strong className="block text-white text-sm tracking-wide">{ev.title}</strong>
                                <span className="text-white/40 text-xs">{ev.subtitle}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 flex flex-col gap-6">
              <PassengersWidget />
              <CruiseChat />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
