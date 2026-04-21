"use client";

import { useMember } from "@/context/MemberContext";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FanUploadForm from "@/components/FanUploadForm";
import Link from "next/link";

export default function FanAccountPage() {
  const { member, isLoggedIn, openModal } = useMember();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'winner';
  const [myPhotos, setMyPhotos] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);

  // Demo member for testing
  const demoMember = {
    name: 'ChicagoLou',
    email: 'chicagolou@gmail.com',
    role: 'fan',
  };
  const activeMember = isDemo ? demoMember : member;
  const activeLoggedIn = isDemo ? true : isLoggedIn;

  useEffect(() => {
    if (isDemo) {
      // Pre-populate inbox with raffle win for demo
      setInboxMessages([
        { id: 1, icon: '🏆', title: 'You Won the Raffle!', desc: 'Congratulations! You won: Signed Drumsticks. Your PIN: 847392. Check your email for claim instructions.', time: 'Just now', isNew: true, color: 'yellow' },
        { id: 2, icon: '🎰', title: 'Raffle Entry Confirmed', desc: "You've entered the live raffle. Stay tuned!", time: '2 min ago', isNew: false, color: 'blue' },
        { id: 3, icon: '⚡', title: 'Flash Drop Alert', desc: 'Merch drop starting now! Limited stock.', time: '15 min ago', isNew: false, color: 'blue' },
      ]);
      return;
    }
    if (!activeMember?.name) return;
    fetch("/api/fans")
      .then(r => r.json())
      .then(data => setMyPhotos(data.filter((p: any) => p.name === activeMember.name)))
      .catch(() => {});
    try {
      const stored = localStorage.getItem('vip_inbox_messages');
      if (stored) setInboxMessages(JSON.parse(stored));
    } catch (e) {}
  }, [activeMember?.name, isDemo]);


  if (!activeLoggedIn) {
    return (
      <section className="py-48 min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black italic tracking-tight mb-4">Fan <span className="gradient-text">Account</span></h1>
          <p className="text-white/40 mb-8 max-w-sm">Access your VIP dashboard, exclusive deals, and photo submission tools.</p>
          <button onClick={() => openModal('login')} className="px-8 py-3 bg-[var(--color-accent)] text-white text-sm font-bold uppercase tracking-widest hover:brightness-110 shadow-[0_0_15px_rgba(133,29,239,0.3)]">
            Login to Access
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 min-h-screen bg-[#050505] border-t border-white/5">
      <div className="site-container">
        
        {/* Account Identity Header */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center text-xl font-black text-[var(--color-accent)]">
              {activeMember?.name?.split(' ').map((n: string)=>n[0]).join('').substring(0,2).toUpperCase() || '?'}
              <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${activeMember?.role === 'admin' ? 'bg-amber-400' : activeMember?.role === 'crew' ? 'bg-emerald-400' : 'bg-[var(--color-accent)]'} border-2 border-[var(--color-bg-primary)] flex items-center justify-center`}>
                <span className="text-[10px]">
                  {activeMember?.role === 'admin' ? '🛡️' : activeMember?.role === 'crew' ? '🛡️' : '★'}
                </span>
              </span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black italic tracking-tight">{activeMember?.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.15em] border rounded-full ${
                  activeMember?.role === 'admin' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' :
                  activeMember?.role === 'crew' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' :
                  'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30'
                }`}>
                  {activeMember?.role === 'admin' ? '🛡️ ADMIN' : activeMember?.role === 'crew' ? '🛡️ CREW' : '★ VIP FAN'}
                </span>
              </div>
              <p className="text-[0.85rem] text-white/40 font-mono mt-1">{activeMember?.email}</p>
            </div>
          </div>
          <Link href="/fan-photo-wall" className="hidden md:flex flex-col items-end px-6 py-3 bg-white/[0.02] hover:bg-white/5 border border-white/10 transition-colors">
            <span className="text-white text-[0.7rem] font-bold uppercase tracking-widest leading-none">View Public Gallery</span>
            <span className="text-[var(--color-accent)] text-[0.55rem] uppercase tracking-widest mt-1">Global Fan Wall →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Fan Status & Exclusives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-[var(--color-accent)]/10 to-black/40 border border-[var(--color-accent)]/30 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[var(--color-accent)]/60 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 blur-[2px] transition-all duration-500 group-hover:blur-0 group-hover:opacity-20 translate-x-4 -translate-y-4">
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M12 2v20"/><path d="m4.9 4.9 14.2 14.2"/><path d="m4.9 19.1 14.2-14.2"/></svg>
                </div>
                <div className="relative z-10">
                  <span className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
                    VIP Exclusive
                  </span>
                  <p className="text-xl font-bold text-white leading-tight mb-1">Vintage 7H Tour Tee<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[#eb31b5]">20% Off Drop</span></p>
                </div>
                <div className="relative z-10 mt-8 flex items-center justify-between">
                  <button className="text-[0.65rem] bg-[var(--color-accent)] hover:bg-white hover:text-black text-white px-4 py-2 font-black uppercase tracking-[0.15em] shadow-[0_0_15px_rgba(133,29,239,0.3)] transition-all">Claim Offer</button>
                  <span className="text-[0.6rem] text-white/40 uppercase tracking-widest font-bold">Ends in 24h</span>
                </div>
              </div>

              <div className="bg-[#0a0a0f]/80 border border-white/5 p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-[#a855f7] mb-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Recent Purchase
                  </span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                  <img src="/images/merch/logo-tee.png" className="w-12 h-12 object-cover bg-black rounded border border-white/10" />
                  <div>
                    <p className="text-[0.8rem] text-white font-bold">7H Classic Logo Tee</p>
                    <p className="text-[0.65rem] text-emerald-400 mt-0.5 font-bold uppercase tracking-widest">Delivered</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                   <span className="text-[0.55rem] text-white/30 uppercase tracking-widest">Order #7H-2026-0412</span>
                   <Link href="/members" className="text-[0.65rem] text-white/40 font-bold uppercase hover:text-[var(--color-accent)] tracking-widest">Full History →</Link>
                </div>
              </div>
            </div>

            {/* Loyalty Rewards Tracker */}
            <div className="bg-gradient-to-r from-black/80 to-[#110f17] border border-emerald-500/20 p-6 flex flex-col relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="absolute -right-4 -top-8 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full group-hover:bg-emerald-500/10 transition-all"></div>
              
              <div className="flex items-center justify-between mb-5 relative z-10">
                <span className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-emerald-400">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   Loyalty Rewards
                </span>
              </div>
              <div className="flex flex-col relative overflow-hidden z-10 w-full mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.65rem] text-white/50 font-bold uppercase tracking-widest">Total Spent</span>
                  <span className="text-[0.6rem] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 py-1 px-3 rounded-full">$85 / $120</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden shadow-inner">
                  <div className="bg-emerald-500 w-[70%] h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000"></div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 w-full border-t border-white/5 pt-4">
                <p className="text-[0.8rem] text-white/80 leading-relaxed max-w-sm">
                  Spend <strong className="text-emerald-400">$35 more</strong> across the shop to instantly unlock a permanent <strong className="text-white">30% OFF PROMO CODE</strong> for your next global order!
                </p>
                <Link href="/store" className="shrink-0 text-[0.65rem] border border-emerald-500/30 hover:bg-emerald-500 hover:text-black text-emerald-400 px-5 py-2.5 font-black uppercase tracking-widest transition-all text-center">
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Upload Module */}
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold italic tracking-tight">Photo Submissions</h3>
              </div>
              <FanUploadForm />
            </div>

          </div>

          {/* Right Column / Sidebar */}
          <div className="space-y-8">
            
            {/* VIP Inbox */}
            <div className="bg-[#0a0a0f]/80 border border-white/5 p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-[#3b82f6]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    VIP Inbox
                  </span>
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[0.6rem] uppercase tracking-widest font-bold rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.2)]">1 New</span>
                </div>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {inboxMessages.map((msg, i) => (
                  <div key={msg.id || i} className={`group cursor-pointer p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 ${msg.isNew ? 'bg-white/[0.02]' : 'opacity-60'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${msg.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-emerald-500/20 border-emerald-500/30'} flex items-center justify-center shrink-0`}>
                        <span className="text-[10px]">{msg.icon}</span>
                      </div>
                      <div>
                        <p className={`text-[0.75rem] font-bold text-white transition-colors ${msg.color === 'yellow' ? 'group-hover:text-yellow-400' : 'group-hover:text-blue-400'}`}>{msg.title}</p>
                        <p className="text-[0.7rem] text-white/50 leading-relaxed mt-1">{msg.desc}</p>
                        <p className={`text-[0.6rem] font-bold tracking-widest uppercase mt-2 ${msg.isNew ? 'text-[var(--color-accent)]' : 'text-white/30'}`}>{msg.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Fallback mock messages if empty */}
                {inboxMessages.length === 0 && (
                  <>
                    <div className="group cursor-pointer p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 bg-white/[0.02]">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <span className="text-[10px]">🎙️</span>
                        </div>
                        <div>
                          <p className="text-[0.75rem] font-bold text-white group-hover:text-blue-400 transition-colors">Crew Camera is LIVE</p>
                          <p className="text-[0.7rem] text-white/50 leading-relaxed mt-1">Soundcheck just started! Jump into the live feed before venue doors open.</p>
                          <p className="text-[0.6rem] text-[var(--color-accent)] font-bold tracking-widest uppercase mt-2">Just now</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group cursor-pointer p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 opacity-60">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-bg-primary)] border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px]">📸</span>
                        </div>
                        <div>
                          <p className="text-[0.75rem] font-bold text-white transition-colors">Photo Approved</p>
                          <p className="text-[0.7rem] text-white/50 leading-relaxed mt-1">Your photo has been approved by the Admin and is now live!</p>
                          <p className="text-[0.6rem] text-white/30 tracking-widest uppercase mt-2">2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* My Submissions Track */}
            <div className="bg-[#0a0a0f]/80 border border-white/5 p-6 hover:border-white/10 transition-colors overflow-hidden">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <span className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-emerald-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  My Submissions
                </span>
                <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 leading-none">{myPhotos.length} <span className="text-[0.65rem] text-white/40 font-bold uppercase">Total</span></p>
              </div>
              
              <div className="space-y-3">
                {myPhotos.slice(0, 4).map(photo => (
                  <div key={photo.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-white/10 rounded overflow-hidden shrink-0 border border-white/5 group-hover:border-[var(--color-accent)]/50">
                        <img src={photo.src} alt="thumb" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p className="text-[0.75rem] font-bold text-white truncate max-w-[150px]">{photo.venue || 'Live Event'}</p>
                        <p className={`text-[0.6rem] font-bold uppercase tracking-widest mt-0.5 ${photo.approved ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {photo.approved ? 'Live on wall' : 'In Review'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {myPhotos.length === 0 && (
                  <div className="py-6 flex flex-col items-center">
                    <span className="text-2xl opacity-20 mb-2">📸</span>
                    <p className="text-white/30 text-[0.75rem]">No submissions yet.</p>
                  </div>
                )}
              </div>
              {myPhotos.length > 4 && (
                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                   <Link href="/fan-photo-wall" className="text-[0.65rem] text-white/40 font-bold uppercase hover:text-[var(--color-accent)] tracking-widest">See on Fan Wall →</Link>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
