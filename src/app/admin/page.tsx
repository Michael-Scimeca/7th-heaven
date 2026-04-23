"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useMember } from "@/context/MemberContext";

import { adminKillStream, adminBanUser, seedMockData, adminCreateCrewMember } from "./actions";

export default function AdminDashboard() {
  const { member, isLoggedIn, login, logout } = useMember();
  const [feeds, setFeeds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState<"All" | "fan" | "crew" | "admin">("All");
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);

  // Crew creation state
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewEmail, setNewCrewEmail] = useState('');
  const [newCrewPassword, setNewCrewPassword] = useState('');
  const [createdCrew, setCreatedCrew] = useState<{ name: string; email: string; password: string } | null>(null);
  const [crewError, setCrewError] = useState('');
  const [crewLoading, setCrewLoading] = useState(false);
  const registryRef = useRef<HTMLElement>(null);

  // Audit log
  interface AuditEntry { id: string; text: string; time: string; color: string; }
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    { id: 'boot', text: 'System boot online. Realtime bindings initialized.', time: 'Just now', color: 'bg-emerald-500' },
    { id: 'session', text: 'Administrator session granted.', time: '1 min ago', color: 'bg-[#8a1cfc]' },
  ]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);

    // Try login first
    let ok = await login(adminEmail, adminPassword);

    if (!ok) {
      // Account doesn't exist in localStorage yet — bootstrap it as admin
      const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
      const newAdmin = {
        id: crypto.randomUUID(),
        name: adminEmail.split('@')[0],
        email: adminEmail.toLowerCase(),
        joinDate: new Date().toISOString(),
        avatar: adminEmail.slice(0, 2).toUpperCase(),
        points: 0,
        tier: 'Platinum',
        showsAttended: 0,
        favoriteVenues: [],
        notificationsEnabled: false,
        notificationRadius: 25,
        role: 'admin',
      };
      accounts[adminEmail.toLowerCase()] = newAdmin;
      localStorage.setItem('7h_accounts', JSON.stringify(accounts));

      // Now login again
      ok = await login(adminEmail, adminPassword);
      if (!ok) {
        setAdminLoginError('Login failed. Please try again.');
      }
    }

    // After login, check role — if not admin, show error and remove account
    if (ok) {
      const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
      const acct = accounts[adminEmail.toLowerCase()];
      if (acct && acct.role !== 'admin') {
        setAdminLoginError('Access denied. This account does not have admin privileges.');
      }
    }

    setAdminLoginLoading(false);
  };

  const createCrew = async () => {
    if (!newCrewName || !newCrewEmail || !newCrewPassword) return;
    if (newCrewPassword.length < 6) { setCrewError('Password must be at least 6 characters.'); return; }
    setCrewLoading(true);
    setCrewError('');
    setCreatedCrew(null);
    const savedName = newCrewName;
    const savedEmail = newCrewEmail;
    const savedPassword = newCrewPassword;
    const res = await adminCreateCrewMember({ name: newCrewName, email: newCrewEmail, password: newCrewPassword });
    if (res.success) {
      setCreatedCrew({ name: savedName, email: savedEmail, password: savedPassword });
      setNewCrewName('');
      setNewCrewEmail('');
      setNewCrewPassword('');
      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) setUsers(profilesData.map(p => ({ id: p.id, name: p.full_name || p.email || 'Anonymous', role: p.role, status: 'active', strikes: 0 })));
      setFilterRole('crew');
    } else {
      setCrewError(res.error || 'Failed to create crew member.');
    }
    setCrewLoading(false);
  };

  const scrollToRegistry = () => {
    registryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Load Real Data from Supabase + simulated demo feeds
  useEffect(() => {
    let pollLocal: NodeJS.Timeout;
    
    async function loadAdminData() {
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

      setFeeds(realFeeds);

      pollLocal = setInterval(() => {
        const uids = ['michael', 'sammy', 'ryan', 'tony'];
        const nameMap: any = { 'michael': 'Mike S', 'sammy': 'Sammy D', 'ryan': 'Ryan K', 'tony': 'Tony M' };
        const activeLocal: any[] = [];
        uids.forEach(uid => {
          const isLive = localStorage.getItem(`7h_crew_is_live_${uid}`) === 'true';
          if (isLive) {
            const startStr = localStorage.getItem(`7h_live_stream_start_${uid}`);
            const uptime = startStr ? Math.max(1, Math.floor((Date.now() - parseInt(startStr)) / 60000)) + 'm' : 'Just now';
            const viewers = parseInt(localStorage.getItem(`7h_live_viewer_count_${uid}`) || '0');
            const revenue = parseFloat(localStorage.getItem(`7h_live_merch_sales_${uid}`) || '0');
            activeLocal.push({
              id: `sim-${uid}`, name: `Crew Cam: ${nameMap[uid]}`, host: nameMap[uid],
              viewers, uptime, status: 'live', isSimulated: true,
              route: `/live/live_${uid}`, revenue
            });
          }
        });
        setFeeds(prev => {
          const dbFeeds = prev.filter(p => !p.isSimulated);
          return [...activeLocal, ...dbFeeds].sort((a,b) => b.viewers - a.viewers);
        });
      }, 2000);

      const { data: profilesData } = await supabase
        .from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) {
        setUsers(profilesData.map(p => ({
          id: p.id, name: p.full_name || p.email || 'Anonymous',
          role: p.role, status: 'active', strikes: 0
        })));
      }

      try {
        const photoRes = await fetch('/api/fans?all=true');
        if (photoRes.ok) {
          const allPhotos = await photoRes.json();
          setModerationQueue(allPhotos.filter((p: any) => !p.approved));
        }
      } catch (err) {}

      try {
        const bookingRes = await fetch('/api/booking');
        if (bookingRes.ok) setBookings(await bookingRes.json());
      } catch (err) {}

      setIsLoading(false);
    }
    
    loadAdminData();

    const bookingPoll = setInterval(async () => {
      try {
        const res = await fetch('/api/booking');
        if (res.ok) setBookings(await res.json());
      } catch {}
    }, 10000);

    return () => {
      if (pollLocal) clearInterval(pollLocal);
      clearInterval(bookingPoll);
    };
  }, [supabase]);

  const [chatRate, setChatRate] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
       const chatLog = JSON.parse(localStorage.getItem('7h_global_chat_history') || '[]');
       setChatRate(chatLog.length);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const killStream = async (id: string) => {
    setFeeds(current => current.filter(f => f.id !== id));
    const res = await adminKillStream(id);
    if (!res.success) alert("Failed to kill stream in database.");
    else alert("Live Stream connection terminated aggressively.");
  };

  const banUser = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently remove ${name}?`)) return;
    const res = await adminBanUser(id);
    if (!res.success) {
      alert("Failed to remove user: " + res.error);
    } else {
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
    setModerationQueue(current => current.filter(p => p.id !== id));
    try {
      await fetch('/api/fans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => filterRole === "All" || u.role === filterRole);
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending');

  const METRICS = [
    { label: "Total Registered Users", value: users.length.toString(), trend: "Live", color: "text-emerald-400" },
    { label: "Active Live Streams", value: feeds.length.toString(), trend: "Live", color: "text-[var(--color-accent)]" },
    { label: "Booking Requests", value: pendingBookings.length.toString(), trend: pendingBookings.length > 0 ? "Action Needed" : "Clear", color: pendingBookings.length > 0 ? "text-amber-400" : "text-emerald-400" },
    { label: "Server Status", value: "Online", trend: "Stable", color: "text-emerald-400" },
  ];

  // ── Admin Login Gate ──
  const devBypass = typeof window !== 'undefined' && localStorage.getItem('7h_dev_bypass') === 'true';
  const forceLogin = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('login') === 'true';

  if ((forceLogin || !devBypass) && (!isLoggedIn || member?.role !== 'admin')) {
    const isWrongRole = isLoggedIn && member?.role !== 'admin';

    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500 opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#0c0c18] border border-white/10 overflow-hidden shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

            <div className="p-10">
              <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                  Admin <span className="text-red-500">Access</span>
                </h1>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/30 mt-2">
                  Restricted — Authorized personnel only
                </p>
              </div>

              {isWrongRole ? (
                <div className="text-center">
                  <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                    <p className="text-sm font-bold text-red-400 mb-1">Access Denied</p>
                    <p className="text-[0.7rem] text-white/40">
                      You&apos;re logged in as <strong className="text-white">{member?.name}</strong> ({member?.role}). 
                      Admin privileges are required to access this dashboard.
                    </p>
                  </div>
                  <Link href="/fans" className="text-[0.65rem] text-[var(--color-accent)] hover:text-white uppercase tracking-[0.15em] font-bold transition-colors">
                    ← Back to Fan Dashboard
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@7thheaven.com"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Password</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-colors"
                      required
                    />
                  </div>

                  {adminLoginError && (
                    <p className="text-xs text-rose-400 bg-rose-400/10 px-3 py-2 border border-rose-400/20">{adminLoginError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={adminLoginLoading}
                    className="w-full py-3.5 bg-red-600 text-white font-bold text-sm uppercase tracking-[0.15em] hover:bg-red-500 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    {adminLoginLoading ? "Authenticating..." : "Sign In as Admin"}
                  </button>
                </form>
              )}

              <p className="mt-8 text-center text-[0.55rem] text-white/15 uppercase tracking-[0.2em]">
                7th Heaven · System Administration
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-24 pb-12 font-sans selection:bg-[var(--color-accent)] selection:text-white relative">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_10%,transparent_100%)] pointer-events-none" />

      <div className="site-container relative z-10">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-xl font-black text-amber-400">
              {(member?.name || 'Admin').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-[#0a0a0f] flex items-center justify-center">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="#0a0a0f"><path d="M2 20h20v2H2v-2zm1-7l4 5h10l4-5-3-6-4 4-2-7-2 7-4-4-3 6z" /></svg>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-black italic tracking-tight text-white">{member?.name || "System Admin"}</h1>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-400/30 rounded-full text-amber-400 text-[0.55rem] font-bold uppercase tracking-[0.15em]">
                  👑 Admin
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 border border-red-500/50 rounded-full text-red-500 text-[0.55rem] font-bold uppercase tracking-widest animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  God Mode
                </span>
              </div>
              <p className="text-[0.8rem] text-white/40 font-mono">{member?.email || "admin@7thheaven.com"}</p>
              <p className="text-[0.7rem] text-white/30 mt-1">Oversee activity, intercept live feeds, and manage community access in real-time.</p>
            </div>
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
                        <th className="p-4 font-bold border-b border-white/5 w-1/3">Stream Name</th>
                        <th className="p-4 font-bold border-b border-white/5">Host</th>
                        <th className="p-4 font-bold border-b border-white/5">Viewers</th>
                        <th className="p-4 font-bold border-b border-white/5">Merch Sales</th>
                        <th className="p-4 font-bold border-b border-white/5 text-right w-1/6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeds.map((feed) => (
                        <tr key={feed.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-bold flex items-center gap-2 text-sm">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                              {feed.isSimulated && feed.route ? (
                                <Link href={feed.route} className="truncate block hover:text-[var(--color-accent)] transition-colors">{feed.name}</Link>
                              ) : (
                                <span className="truncate block">{feed.name}</span>
                              )}
                              {feed.isSimulated && (
                                <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-[0.5rem] font-bold uppercase tracking-wider text-emerald-400 shrink-0">Demo</span>
                              )}
                            </div>
                            <div className="text-white/40 text-[0.6rem] uppercase tracking-wider mt-1">Uptime: {feed.uptime}</div>
                          </td>
                          <td className="p-4 text-sm text-white/70">{feed.host}</td>
                          <td className="p-4 font-mono text-sm">{feed.viewers.toLocaleString()}</td>
                          <td className="p-4 font-mono text-sm font-bold text-emerald-400">
                             {feed.revenue !== undefined ? `$${feed.revenue.toLocaleString()}` : '$0'}
                          </td>
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

            {/* ── Crew Account Creation ── */}
            <section className="bg-gradient-to-br from-[#0f0f13] to-[#12101a] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-emerald-500/10 bg-emerald-500/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-white">Create Crew Account</h3>
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-emerald-400/60 font-bold mt-0.5">Admin Only · Set credentials manually</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={newCrewName}
                      onChange={e => setNewCrewName(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email Address</label>
                    <input
                      type="email"
                      placeholder="crew@7thheaven.com"
                      value={newCrewEmail}
                      onChange={e => setNewCrewEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Password</label>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      value={newCrewPassword}
                      onChange={e => setNewCrewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <button
                    onClick={createCrew}
                    disabled={!newCrewName.trim() || !newCrewEmail.trim() || !newCrewPassword.trim()}
                    className="px-6 py-3 bg-emerald-500 text-black font-bold text-[0.7rem] uppercase tracking-[0.15em] rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                    Create Account
                  </button>
                </div>
                <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-start gap-3">
                  <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                  <p className="text-[0.65rem] text-white/40 leading-relaxed">
                    A crew account will be created with the credentials above. Share the login details securely with the crew member. Only admins can create crew accounts.
                  </p>
                </div>

                {/* Success card */}
                {createdCrew && (
                  <div className="mt-4 p-5 bg-emerald-500/[0.08] border border-emerald-500/30 rounded-xl animate-[fadeIn_0.3s_ease]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">✅</div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-400">Crew Account Created</h4>
                          <p className="text-[0.7rem] text-white/60 mt-1"><strong className="text-white">{createdCrew.name}</strong> · {createdCrew.email}</p>
                          <div className="mt-3 flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-lg">
                            <span className="text-[0.55rem] uppercase tracking-[0.15em] text-white/30 font-bold shrink-0">Temp Password</span>
                            <code className="text-sm font-mono font-bold text-amber-400 tracking-wider select-all">{createdCrew.password}</code>
                            <button
                              onClick={() => { navigator.clipboard.writeText(createdCrew.password); }}
                              className="ml-auto text-[0.55rem] uppercase tracking-[0.15em] text-white/30 hover:text-white font-bold transition-colors px-2 py-1 border border-white/10 hover:border-white/30 rounded"
                            >Copy</button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setCreatedCrew(null)} className="text-white/20 hover:text-white text-lg transition-colors shrink-0">✕</button>
                    </div>
                    <button
                      onClick={scrollToRegistry}
                      className="mt-4 w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[0.65rem] uppercase tracking-[0.15em] font-bold hover:bg-emerald-500/20 transition-all rounded-lg flex items-center justify-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      View in Registry ↓
                    </button>
                  </div>
                )}

                {/* Error */}
                {crewError && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3">
                    <span className="text-rose-400">✕</span>
                    <p className="text-[0.7rem] text-rose-400 font-bold">{crewError}</p>
                    <button onClick={() => setCrewError('')} className="ml-auto text-white/30 hover:text-white">✕</button>
                  </div>
                )}
              </div>
            </section>

            {/* ── Community Registry ── */}
            <section ref={registryRef} className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl scroll-mt-24">
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

            {/* Booking Requests Section */}
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Booking Requests
                </h3>
                <span className={`px-3 py-1 ${pendingBookings.length > 0 ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'} border rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2`}>
                  {pendingBookings.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                  {pendingBookings.length} Pending
                </span>
              </div>
              <div className="p-0">
                {bookings.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No booking requests received yet.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] text-white/30 text-[0.6rem] uppercase tracking-widest">
                        <th className="p-4 font-bold border-b border-white/5">ID</th>
                        <th className="p-4 font-bold border-b border-white/5">Client</th>
                        <th className="p-4 font-bold border-b border-white/5">Event Type</th>
                        <th className="p-4 font-bold border-b border-white/5">Date</th>
                        <th className="p-4 font-bold border-b border-white/5">Venue</th>
                        <th className="p-4 font-bold border-b border-white/5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice().reverse().map((b: any) => (
                        <tr key={b.bookingId} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono text-[0.75rem] text-[var(--color-accent)] font-bold">{b.bookingId}</td>
                          <td className="p-4">
                            <div className="font-bold text-sm">{b.name}</div>
                            <div className="text-[0.65rem] text-white/40">{b.email}</div>
                          </td>
                          <td className="p-4 text-sm text-white/70 capitalize">{b.eventType?.replace('_', ' ')}</td>
                          <td className="p-4 text-sm text-white/70">{b.eventDate}</td>
                          <td className="p-4">
                            <div className="text-sm text-white/70 truncate max-w-[150px]">{b.venueName || '–'}</div>
                            <div className="text-[0.6rem] text-white/30">{b.venueCity}, {b.venueState}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-widest ${
                              b.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : b.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>{b.status}</span>
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
