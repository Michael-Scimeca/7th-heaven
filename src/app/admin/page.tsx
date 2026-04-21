"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useMember } from "@/context/MemberContext";

import { adminKillStream, adminBanUser, seedMockData } from "./actions";

export default function AdminDashboard() {
  const { member } = useMember();
  const [feeds, setFeeds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState<"All" | "fan" | "crew" | "admin">("All");
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Audit log
  interface AuditEntry { id: string; text: string; time: string; color: string; }
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    { id: 'boot', text: 'System boot online. Realtime bindings initialized.', time: 'Just now', color: 'bg-emerald-500' },
    { id: 'session', text: 'Administrator session granted.', time: '1 min ago', color: 'bg-[#8a1cfc]' },
  ]);

  // Simulated audit events
  const AUDIT_EVENTS = [
    { text: 'Mike S started broadcasting on Crew Cam.', color: 'bg-red-500' },
    { text: 'Sammy D started broadcasting on Crew Cam.', color: 'bg-red-500' },
    { text: 'Ryan K viewer count passed 400.', color: 'bg-blue-400' },
    { text: 'Fan "rockerdan92" joined Mike S stream.', color: 'bg-emerald-500' },
    { text: 'Hype meter hit 100% on Sammy D stream.', color: 'bg-orange-500' },
    { text: 'Chat moderation filter triggered (1 message).', color: 'bg-yellow-500' },
    { text: 'Tony M stream went live with 18 viewers.', color: 'bg-red-500' },
    { text: 'Fan "Jess_M" sent 5 reactions in 10s.', color: 'bg-pink-500' },
    { text: 'New fan "MaxRock" registered during stream.', color: 'bg-emerald-500' },
    { text: 'Mike S pinned a new message in chat.', color: 'bg-[#8a1cfc]' },
    { text: 'Ryan K viewer count passed 425.', color: 'bg-blue-400' },
    { text: 'CDN latency spike detected (resolved).', color: 'bg-yellow-500' },
    { text: 'Fan "ChicagoLou" tipped during encore.', color: 'bg-emerald-500' },
    { text: 'Sammy D stream reached 30 min uptime.', color: 'bg-blue-400' },
    { text: 'Fan "ashley_xo" shared stream link externally.', color: 'bg-pink-500' },
    { text: 'Concurrent viewers across all feeds: 1,761.', color: 'bg-emerald-500' },
  ];

  // Load Real Data from Supabase + simulated demo feeds
  useEffect(() => {
    async function loadAdminData() {
      // Fetch Active Streams from DB
      const { data: streamsData } = await supabase
        .from('live_streams')
        .select(`*, profiles(full_name, role)`)
        .eq('status', 'live');
        
      const realFeeds = (streamsData || []).map(st => ({
        id: st.id,
        name: st.title || 'Untitled Stream',
        host: st.guest_name || st.profiles?.full_name || 'Unknown',
        viewers: st.viewer_count || 0,
        uptime: st.started_at ? Math.max(1, Math.floor((new Date().getTime() - new Date(st.started_at).getTime()) / 60000)) + "m" : "Just now",
        status: st.status,
        isSimulated: false,
        route: '',
      }));

      // Simulated demo feeds (always show as active)
      const simulatedFeeds = [
        { id: 'sim-mike',  name: 'Crew Cam: Mike S',  host: 'Mike S',  viewers: 1247, uptime: '32m', status: 'live', isSimulated: true, route: '/live/live_michael' },
        { id: 'sim-sammy', name: 'Crew Cam: Sammy D', host: 'Sammy D', viewers: 84,   uptime: '28m', status: 'live', isSimulated: true, route: '/live/live_sammy' },
        { id: 'sim-ryan',  name: 'Crew Cam: Ryan K',  host: 'Ryan K',  viewers: 412,  uptime: '30m', status: 'live', isSimulated: true, route: '/live/live_ryan' },
        { id: 'sim-tony',  name: 'Crew Cam: Tony M',  host: 'Tony M',  viewers: 18,   uptime: '15m', status: 'live', isSimulated: true, route: '/live/live_tony' },
      ];

      setFeeds([...simulatedFeeds, ...realFeeds]);

      // Fetch Profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesData) {
        setUsers(profilesData.map(p => ({
          id: p.id,
          name: p.full_name || p.email || 'Anonymous',
          role: p.role,
          status: 'active',
          strikes: 0
        })));
      }

      // Simulated demo profiles (show alongside real ones)
      const simulatedUsers = [
        { id: 'sim-u-mike',    name: 'Mike S',       role: 'crew',  status: 'streaming', strikes: 0 },
        { id: 'sim-u-sammy',   name: 'Sammy D',      role: 'crew',  status: 'streaming', strikes: 0 },
        { id: 'sim-u-ryan',    name: 'Ryan K',       role: 'crew',  status: 'streaming', strikes: 0 },
        { id: 'sim-u-tony',    name: 'Tony M',       role: 'crew',  status: 'streaming', strikes: 0 },
        { id: 'sim-u-admin',   name: 'Admin',        role: 'admin', status: 'active',    strikes: 0 },
        { id: 'sim-u-1',       name: 'ChicagoLou',   role: 'fan',   status: 'watching',  strikes: 0 },
        { id: 'sim-u-2',       name: 'superfan99',   role: 'fan',   status: 'watching',  strikes: 0 },
        { id: 'sim-u-3',       name: 'TommyGuitar',  role: 'fan',   status: 'watching',  strikes: 0 },
        { id: 'sim-u-4',       name: 'mike_fan_01',  role: 'fan',   status: 'watching',  strikes: 0 },
        { id: 'sim-u-5',       name: 'drummer_kid',  role: 'fan',   status: 'active',    strikes: 0 },
        { id: 'sim-u-6',       name: 'StaceyB',      role: 'fan',   status: 'watching',  strikes: 0 },
        { id: 'sim-u-7',       name: 'Jess_M',       role: 'fan',   status: 'watching',  strikes: 0 },
        { id: 'sim-u-8',       name: 'rockerdan92',  role: 'fan',   status: 'active',    strikes: 0 },
        { id: 'sim-u-9',       name: 'LaurenLive',   role: 'fan',   status: 'watching',  strikes: 0 },
        { id: 'sim-u-10',      name: 'MelM',         role: 'fan',   status: 'active',    strikes: 0 },
        { id: 'sim-u-11',      name: 'ashley_xo',    role: 'fan',   status: 'watching',  strikes: 0 },
        { id: 'sim-u-12',      name: 'MidwestMama',  role: 'fan',   status: 'watching',  strikes: 0 },
        { id: 'sim-u-13',      name: 'tay_rocks',    role: 'fan',   status: 'active',    strikes: 0 },
        { id: 'sim-u-14',      name: 'MaxRock',      role: 'fan',   status: 'active',    strikes: 1 },
        { id: 'sim-u-15',      name: 'BandNerd2k',   role: 'fan',   status: 'active',    strikes: 0 },
      ];

      setUsers(prev => [...simulatedUsers, ...prev]);

      try {
        const photoRes = await fetch('/api/fans?all=true');
        if (photoRes.ok) {
          const allPhotos = await photoRes.json();
          setModerationQueue(allPhotos.filter((p: any) => !p.approved));
        }
      } catch (err) {}

      setIsLoading(false);
    }
    loadAdminData();
  }, [supabase]);

  // Auto-generate audit events
  useEffect(() => {
    let eventIdx = 0;
    const t = setInterval(() => {
      const event = AUDIT_EVENTS[eventIdx % AUDIT_EVENTS.length];
      const secsAgo = Math.floor(Math.random() * 30) + 1;
      setAuditLog(prev => [
        { id: `evt-${Date.now()}`, text: event.text, time: `${secsAgo}s ago`, color: event.color },
        ...prev,
      ].slice(0, 20)); // Keep max 20 entries
      eventIdx++;
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live chat msgs/min counter
  const [chatRate, setChatRate] = useState(348);
  useEffect(() => {
    const t = setInterval(() => {
      setChatRate(prev => {
        const delta = Math.floor(Math.random() * 30) - 12; // drift -12 to +17
        return Math.max(180, Math.min(520, prev + delta));
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const killStream = async (id: string) => {
    // Optimistic UI Update
    setFeeds(current => current.filter(f => f.id !== id));
    
    // Server Action bypasses RLS
    const res = await adminKillStream(id);
      
    if (!res.success) alert("Failed to kill stream in database.");
    else alert("Live Stream connection terminated aggressively.");
  };

  const banUser = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently remove ${name}?`)) return;
    
    // Server Action bypasses RLS using service_role key
    const res = await adminBanUser(id);
      
    if (!res.success) {
      alert("Failed to remove user: " + res.error);
    } else {
      // Optimistic UI update only if successful
      setUsers(current => current.filter(u => u.id !== id));
      alert(`User ${name} has been banned and securely removed from the platform.`);
    }
  };

  const seedData = async () => {
    setIsLoading(true);
    await seedMockData();
    window.location.reload();
  };

  const moderatePhoto = async (id: string, action: 'approve' | 'reject') => {
    // Optimistic remove from queue
    setModerationQueue(current => current.filter(p => p.id !== id));
    
    try {
      await fetch('/api/fans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      // Optionally fire audit log event here
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => filterRole === "All" || u.role === filterRole);

  const METRICS = [
    { label: "Total Registered Users", value: users.length.toString(), trend: "Live", color: "text-emerald-400" },
    { label: "Active Live Streams", value: feeds.length.toString(), trend: "Live", color: "text-[var(--color-accent)]" },
    { label: "Chat Msgs / Min", value: chatRate.toString(), trend: chatRate > 400 ? "Surging" : chatRate > 300 ? "High Volume" : "Steady", color: chatRate > 400 ? "text-orange-400" : "text-blue-400" },
    { label: "Server Status", value: "Online", trend: "Stable", color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-24 pb-12 font-sans selection:bg-[var(--color-accent)] selection:text-white relative">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_10%,transparent_100%)] pointer-events-none" />

      <div className="site-container relative z-10">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-500 text-[0.6rem] font-bold uppercase tracking-widest animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                God Mode Enabled
              </span>
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/70 text-[0.6rem] font-bold uppercase tracking-widest">
                {member?.name || "Admin"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
              System Admin
            </h1>
            <p className="text-white/40 mt-2">Oversee activity, intercept live feeds, and manage community access in real-time.</p>
          </div>
          
          <Link href="/" className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">
            Exit to Site →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {METRICS.map((metric, i) => (
            <div key={i} className="bg-[#0f0f13] border border-white/5 p-6 rounded-xl flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/40 mb-2">{metric.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black">{metric.value}</span>
                <span className={`text-[0.6rem] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 rounded ${metric.color}`}>
                  {metric.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 flex flex-col gap-8">
            
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  Active Live Streams
                </h3>
                <span className="text-[0.65rem] text-white/40 uppercase tracking-widest">{feeds.length} Online</span>
              </div>
              <div className="p-0">
                {isLoading ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs animate-pulse">Scanning network...</div>
                ) : feeds.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No active streams detected across infrastructure.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] text-white/30 text-[0.6rem] uppercase tracking-widest">
                        <th className="p-4 font-bold border-b border-white/5">Stream Name</th>
                        <th className="p-4 font-bold border-b border-white/5">Host</th>
                        <th className="p-4 font-bold border-b border-white/5">Viewers</th>
                        <th className="p-4 font-bold border-b border-white/5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeds.map((feed) => (
                        <tr key={feed.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-bold flex items-center gap-2 text-sm">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                              {feed.isSimulated && feed.route ? (
                                <Link href={feed.route} className="truncate max-w-[200px] block hover:text-[var(--color-accent)] transition-colors">{feed.name}</Link>
                              ) : (
                                <span className="truncate max-w-[200px] block">{feed.name}</span>
                              )}
                              {feed.isSimulated && (
                                <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-[0.5rem] font-bold uppercase tracking-wider text-emerald-400 shrink-0">Demo</span>
                              )}
                            </div>
                            <div className="text-white/40 text-[0.6rem] uppercase tracking-wider mt-1">Uptime: {feed.uptime}</div>
                          </td>
                          <td className="p-4 text-sm text-white/70">{feed.host}</td>
                          <td className="p-4 font-mono text-sm">{feed.viewers.toLocaleString()}</td>
                          <td className="p-4 text-right">
                            {feed.isSimulated ? (
                              <Link 
                                href={feed.route}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all inline-block"
                              >
                                View Feed
                              </Link>
                            ) : (
                              <button 
                                onClick={() => killStream(feed.id)}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all"
                              >
                                Shut Down
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Community Registry
                </h3>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {users.length === 0 && (
                    <button onClick={seedData} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[0.6rem] uppercase font-bold tracking-widest hover:bg-emerald-500 transition-colors hover:text-white shrink-0">
                      Generate Mock Profiles
                    </button>
                  )}
                  <div className="flex bg-black rounded p-1 border border-white/10 overflow-x-auto shrink-0 w-full sm:w-auto">
                  {['All', 'fan', 'crew', 'admin'].map(role => (
                    <button 
                      key={role}
                      onClick={() => setFilterRole(role as any)}
                      className={`px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors whitespace-nowrap ${filterRole === role ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
               </div>
              </div>
              

              <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs animate-pulse">Pulling registry data...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No users found matching this filter.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] text-white/30 text-[0.6rem] uppercase tracking-widest">
                        <th className="p-4 font-bold border-b border-white/5">User</th>
                        <th className="p-4 font-bold border-b border-white/5">Role</th>
                        <th className="p-4 font-bold border-b border-white/5">Status</th>
                        <th className="p-4 font-bold border-b border-white/5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-bold text-sm truncate max-w-[150px]">{user.name}</td>
                          <td className="p-4 text-sm">
                            <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-widest ${user.role === 'crew' || user.role === 'admin' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                user.status === 'streaming' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                : user.status === 'watching' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                              }`} />
                              <span className="text-[0.6rem] uppercase tracking-wider text-white/50">{user.status}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {user.role !== 'admin' ? (
                              <button 
                                onClick={() => banUser(user.id, user.name)}
                                className="px-4 py-2 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-500 hover:border-red-500 hover:text-white text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all"
                              >
                                Remove
                              </button>
                            ) : (
                              <span className="px-4 py-2 inline-block text-[0.55rem] uppercase font-bold tracking-widest text-white/20">
                                Protected
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Fan Photo Moderation Queue
                </h3>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {moderationQueue.length} Pending
                </span>
              </div>
              <div className="p-0">
                {moderationQueue.length === 0 ? (
                  <div className="p-16 text-center text-white/30 text-sm">
                     <span className="text-4xl opacity-20 block mb-4">🏆</span>
                     Queue is entirely empty. All fan content is categorized.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {moderationQueue.map((photo) => (
                      <div key={photo.id} className="group relative bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden shadow-xl hover:border-[var(--color-accent)]/50 transition-colors">
                        <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
                          <img src={photo.src} alt="Fan Upload" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-0 right-0 m-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded border border-white/10 text-white font-mono text-[0.6rem] uppercase tracking-widest shadow-xl">
                            {new Date(photo.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm font-bold truncate">
                            <span className="text-[var(--color-accent)]">@</span>
                            {photo.name}
                          </div>
                          {photo.venue && <p className="text-[0.65rem] font-bold tracking-widest uppercase text-white/40 truncate">📍 {photo.venue}</p>}
                          {photo.caption && <p className="text-sm text-white/70 italic border-l-2 border-[var(--color-accent)]/30 pl-3 mt-2">"{photo.caption}"</p>}
                        </div>
                        <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10">
                          <button onClick={() => moderatePhoto(photo.id, 'reject')} className="py-3 text-[0.6rem] font-black uppercase tracking-widest text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            Reject & Delete
                          </button>
                          <button onClick={() => moderatePhoto(photo.id, 'approve')} className="py-3 text-[0.6rem] font-black uppercase tracking-widest text-[#050505] bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                            Safe & Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </div>

          <div className="xl:col-span-1 flex flex-col gap-8">
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  Audit Log
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <span className="text-[0.6rem] text-white/30 uppercase tracking-widest">{auditLog.length} Events</span>
              </div>
              <div className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                {auditLog.map((entry, i) => (
                  <div key={entry.id} className="flex gap-4 relative" style={{ animation: i === 0 ? 'slideIn 0.4s ease-out' : 'none' }}>
                    {i < auditLog.length - 1 && (
                      <div className="absolute top-6 bottom-[-20px] left-[7px] w-[2px] bg-white/5" />
                    )}
                    <div className="shrink-0 mt-1">
                      <div className={`w-4 h-4 rounded-full border-2 border-[#0f0f13] ${entry.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-white/80 leading-relaxed mb-1">{entry.text}</p>
                      <p className="text-[0.65rem] uppercase tracking-widest text-white/30">{entry.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
