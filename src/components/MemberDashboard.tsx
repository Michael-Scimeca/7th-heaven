"use client";

import { useMember, tierColors } from "@/context/MemberContext";
import { useEffect, useState, useMemo } from "react";
import FanUploadForm from "./FanUploadForm";

// Venue data for proximity check
const showVenues = [
 { name: "Station 34", city: "Mt. Prospect, IL", lat: 42.0640, lng: -87.9370, date: "January 2", time: "8:30pm", type: "Unplugged" },
 { name: "Old Republic", city: "Elgin, IL", lat: 42.0354, lng: -88.2826, date: "January 3", time: "8:30pm", type: "Full Band" },
 { name: "Rookies", city: "Hoffman Est., IL", lat: 42.0680, lng: -88.1200, date: "January 9", time: "8:00pm", type: "Unplugged" },
 { name: "Sundance Saloon", city: "Mundelein, IL", lat: 42.2631, lng: -88.0037, date: "January 11", time: "2:00pm", type: "Unplugged" },
 { name: "WGN TV", city: "Chicago, IL", lat: 41.8905, lng: -87.6358, date: "January 28", time: "10:00am", type: "TV" },
 { name: "Des Plaines Theater", city: "Des Plaines, IL", lat: 42.0334, lng: -87.8834, date: "January 31", time: "9:00pm", type: "Full Band" },
 { name: "Hard Rock Casino", city: "Rockford, IL", lat: 42.2711, lng: -89.0940, date: "February 7", time: "8:00pm", type: "Casino" },
 { name: "Durty Nellies", city: "Palatine, IL", lat: 42.1103, lng: -88.0340, date: "February 14", time: "9:30pm", type: "Full Band" },
 { name: "Stage 119", city: "Mt. Prospect, IL", lat: 42.0663, lng: -87.9375, date: "February 15", time: "", type: "Full Band" },
 { name: "Jamo's Live", city: "Rosemont, IL", lat: 41.9786, lng: -87.8706, date: "February 21", time: "", type: "Full Band" },
 { name: "Evenflow", city: "Geneva, IL", lat: 41.8842, lng: -88.3059, date: "February 27", time: "", type: "Full Band" },
 { name: "Broken Oar", city: "Mokena, IL", lat: 41.5267, lng: -87.8829, date: "March 7", time: "", type: "Full Band" },
 { name: "Bannerman's", city: "Chicago, IL", lat: 41.9466, lng: -87.6756, date: "March 8", time: "", type: "Full Band" },
 { name: "Sundance Saloon", city: "Mundelein, IL", lat: 42.2636, lng: -88.0040, date: "March 22", time: "", type: "Full Band" },
 { name: "Tailgaters", city: "Bolingbrook, IL", lat: 41.6986, lng: -88.0684, date: "March 27", time: "", type: "Full Band" },
 { name: "Station 34", city: "Mt. Prospect, IL", lat: 42.0645, lng: -87.9375, date: "May 1", time: "", type: "Full Band" },
 { name: "Deer Park Fest", city: "Deer Park, IL", lat: 42.1600, lng: -88.0810, date: "May 2", time: "", type: "Outdoor" },
 { name: "Joe's Live", city: "Rosemont, IL", lat: 41.9795, lng: -87.8695, date: "April 11", time: "", type: "Full Band" },
 { name: "Rochaus", city: "W. Dundee, IL", lat: 42.0989, lng: -88.2768, date: "April 26", time: "", type: "Full Band" },
];

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
 const R = 3959; // Earth radius in miles
 const dLat = ((lat2 - lat1) * Math.PI) / 180;
 const dLng = ((lng2 - lng1) * Math.PI) / 180;
 const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
 return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const rewards = [
 { name: "Free Sticker Pack", points: 200, icon: "🎨" },
 { name: "Early Access Tickets", points: 500, icon: "🎟️" },
 { name: "Signed Setlist", points: 750, icon: "✍️" },
 { name: "Backstage Meet & Greet", points: 1500, icon: "🤝" },
 { name: "VIP Concert Package", points: 3000, icon: "👑" },
 { name: "Private Acoustic Session", points: 5000, icon: "🎸" },
];

const tierThresholds = [
 { tier: "Bronze", min: 0, max: 499 },
 { tier: "Silver", min: 500, max: 1999 },
 { tier: "Gold", min: 2000, max: 4999 },
 { tier: "Platinum", min: 5000, max: Infinity },
];

export default function MemberDashboard() {
 const { member, logout, isLoggedIn, openModal, updateLocation, toggleNotifications, setNotificationRadius: setRadius } = useMember();
 const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");

 // SMS Alert form state
 const [smsName, setSmsName] = useState("");
 const [smsZip, setSmsZip] = useState("");
 const [smsPhone, setSmsPhone] = useState("");
 const [smsConsent, setSmsConsent] = useState(false);
 const [smsStatus, setSmsStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
 const [smsMessage, setSmsMessage] = useState("");
 const [unsubPhone, setUnsubPhone] = useState("");
 const [unsubStatus, setUnsubStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
 const [unsubMessage, setUnsubMessage] = useState("");

 // Fan Authored Photos State
 const [myPhotos, setMyPhotos] = useState<any[]>([]);

 useEffect(() => {
  if (!member?.name) return;
  fetch("/api/fans")
    .then(r => r.json())
    .then(data => setMyPhotos(data.filter((p: any) => p.name === member.name)))
    .catch(() => {});
 }, [member?.name]);

 // Pre-fill name from member
 useEffect(() => {
  if (member?.name && !smsName) setSmsName(member.name);
 }, [member?.name, smsName]);

 const handleSubscribe = async () => {
  if (!smsConsent) { setSmsStatus("error"); setSmsMessage("You must agree to the terms first."); return; }
  if (!smsPhone || !smsZip) { setSmsStatus("error"); setSmsMessage("Phone and zip code are required."); return; }
  setSmsStatus("sending");
  try {
   const res = await fetch("/api/sms/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: smsName, zip: smsZip, phone: smsPhone }),
   });
   const data = await res.json();
   if (res.ok) { setSmsStatus("success"); setSmsMessage(data.message); }
   else { setSmsStatus("error"); setSmsMessage(data.error || "Failed to subscribe."); }
  } catch { setSmsStatus("error"); setSmsMessage("Network error. Try again."); }
 };

 const handleUnsubscribe = async () => {
  if (!unsubPhone) { setUnsubStatus("error"); setUnsubMessage("Enter your phone number."); return; }
  setUnsubStatus("sending");
  try {
   const res = await fetch("/api/sms/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: unsubPhone }),
   });
   const data = await res.json();
   if (res.ok) { setUnsubStatus("success"); setUnsubMessage(data.message); }
   else { setUnsubStatus("error"); setUnsubMessage(data.error || "Failed to unsubscribe."); }
  } catch { setUnsubStatus("error"); setUnsubMessage("Network error. Try again."); }
 };

 useEffect(() => {
  if (!isLoggedIn) return;
  if (member?.location) { setGeoStatus("granted"); return; }
 }, [isLoggedIn, member?.location]);

 const requestLocation = () => {
  setGeoStatus("loading");
  navigator.geolocation.getCurrentPosition(
   (pos) => {
    updateLocation(pos.coords.latitude, pos.coords.longitude);
    setGeoStatus("granted");
   },
   () => setGeoStatus("denied"),
   { enableHighAccuracy: true }
  );
 };

 const nearbyShows = useMemo(() => {
  if (!member?.location) return [];
  return showVenues
   .map((v) => ({ ...v, distance: getDistance(member.location!.lat, member.location!.lng, v.lat, v.lng) }))
   .filter((v) => v.distance <= member.notificationRadius)
   .sort((a, b) => a.distance - b.distance);
 }, [member?.location, member?.notificationRadius]);

 // Not logged in
 if (!isLoggedIn) {
  const isSignup = geoStatus === "idle" || geoStatus === "loading" || geoStatus === "denied" || geoStatus === "granted"; // Just a hack to force a state or we can use a local state
  // We need a proper local state for this form.
  return (
   <section className="py-20 bg-[var(--color-bg-primary)] min-h-[calc(100vh-72px)] flex items-center justify-center">
    <div className="site-container max-w-xl w-full">
     <div className="bg-[#0c0c18] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent)] via-[#c026d3] to-[var(--color-accent)]" />
      <div className="p-10">
       <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3">
         Join the <span className="text-[var(--color-accent)]">Family</span>
        </h1>
        <p className="text-white/40 text-sm">
         Create a Fan Account to access exclusive rewards, secure priority merchandise, and get proximity text alerts when we play in your city.
        </p>
       </div>

       <div className="flex flex-col gap-4">
        <button onClick={() => openModal("signup")} className="w-full py-4 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-[0.15em] rounded hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(236,72,153,0.3)]">
         Create Fan Account
        </button>
        
        <div className="relative py-4 flex items-center justify-center">
         <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
         <span className="relative bg-[#0c0c18] px-4 text-xs font-bold text-white/30 uppercase tracking-widest">Already a member?</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
         <button onClick={() => openModal("login")} className="flex-1 py-4 border border-white/20 text-white flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-[0.15em] rounded hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all cursor-pointer bg-white/[0.02]">
          Sign In As Fan
         </button>
         <button onClick={() => openModal("login")} className="flex-1 py-4 border border-emerald-500/20 text-emerald-400 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-[0.15em] rounded hover:bg-emerald-500/10 hover:border-emerald-500 transition-all cursor-pointer bg-emerald-500/5">
          Crew Portal
         </button>
        </div>
       </div>

       <div className="mt-8 pt-8 border-t border-white/10 text-center text-[0.65rem] text-white/30">
        <p>By creating an account, you agree to receive SMS proximity notifications. You can turn these off at any time using the dashboard.</p>
       </div>
      </div>
     </div>
    </div>
   </section>
  );
 }

 const currentTierData = tierThresholds.find(t => t.tier === member!.tier)!;
 const nextTier = tierThresholds[tierThresholds.indexOf(currentTierData) + 1];
 const progress = nextTier ? ((member!.points - currentTierData.min) / (nextTier.min - currentTierData.min)) * 100 : 100;

 return (
  <section className="py-12 bg-[var(--color-bg-primary)] min-h-screen">
   <div className="site-container">

    {/* Header */}
    <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
     <div className="flex items-center gap-5">
      <div className="relative w-16 h-16 flex items-center justify-center text-xl font-black bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] text-[var(--color-accent)]">
       {member!.avatar}
       {/* Role dot */}
       {(() => {
        const role = member?.role;
        if (role === 'admin') return (
         <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-[var(--color-bg-primary)] flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-bg-primary)"><path d="M2 20h20v2H2v-2zm1-7l4 5h10l4-5-3-6-4 4-2-7-2 7-4-4-3 6z" /></svg>
         </span>
        );
        if (role === 'crew') return (
         <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[var(--color-bg-primary)] flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg-primary)" strokeWidth="3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
         </span>
        );
        return (
         <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white/50 border-2 border-[var(--color-bg-primary)] flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--color-bg-primary)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
         </span>
        );
       })()}
      </div>
      <div>
       <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{member!.name}</h1>
        {/* Role label */}
        {(() => {
         const role = member?.role ?? 'fan';
         const cfg = { fan: { label: 'FAN', icon: '⭐', cls: 'text-white/50 bg-white/[0.06] border-white/[0.08]' }, crew: { label: 'CREW', icon: '🛡️', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }, admin: { label: 'ADMIN', icon: '👑', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' } }[role as 'fan' | 'crew' | 'admin'] ?? { label: 'FAN', icon: '⭐', cls: 'text-white/50 bg-white/[0.06] border-white/[0.08]' };
         return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.15em] border rounded-full ${cfg.cls}`}>
           <span className="text-[0.5rem]">{cfg.icon}</span>{cfg.label}
          </span>
         );
        })()}
       </div>
       <p className="text-[0.7rem] text-white/40">{member!.email}</p>
      </div>
     </div>
     <div className="flex items-center gap-2">
      {(member?.role === 'crew' || member?.role === 'admin') && (
       <a href="/crew" className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-emerald-400 hover:text-white bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer inline-flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
        Crew Dashboard
       </a>
      )}
      <button onClick={logout} className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-white/30 hover:text-white border border-white/10 hover:border-white/30 transition-all cursor-pointer">
       Sign Out
      </button>
     </div>
    </div>

    {/* Digital Tickets / Inbox moved to top */}
    <div className="mb-10 p-6 bg-[url('/images/card-glow.jpg')] bg-cover bg-center border border-[var(--color-accent)]/30 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.15)] group">
     <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-[#0a0a14]/90 to-black/80" />
     <div className="absolute top-0 right-0 p-4 opacity-30 blur-[2px] transition-all duration-500 group-hover:blur-0 group-hover:opacity-40 translate-x-4 -translate-y-4">
      <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22h20L12 2z"/></svg>
     </div>
     
     <div className="relative z-10 flex items-center justify-between mb-4 pb-4 border-b border-white/10">
      <div className="flex items-center gap-3">
       <span className="text-2xl">🎟️</span>
       <h2 className="text-xl font-black italic tracking-tight">
        Prize <span className="gradient-text">Wallet</span>
       </h2>
      </div>
      <span className="text-[0.55rem] uppercase tracking-[0.2em] font-bold text-[var(--color-accent)]/80 bg-[var(--color-accent)]/10 px-3 py-1 rounded-full border border-[var(--color-accent)]/20">Claim PINs</span>
     </div>

     <div className="relative z-10">
      {(() => {
       const stored = typeof window !== "undefined" ? localStorage.getItem("vip_inbox_messages") : null;
       const messages = stored ? JSON.parse(stored) : [];

       if (messages.length === 0) {
        return (
         <div className="py-6 flex flex-col items-center border border-white/5 bg-white/5 rounded-xl border-dashed">
          <p className="text-sm text-white/50 font-bold">Your wallet is currently empty.</p>
          <p className="text-[0.6rem] text-white/30 mt-1 uppercase tracking-widest font-bold">Keep participating in live streams for a chance to win</p>
         </div>
        );
       }

       return (
        <div className="flex flex-col gap-3">
         {messages.map((msg: any) => {
          const pinMatch = msg.desc.match(/PIN:\s*(\d+)/i);
          const pin = pinMatch ? pinMatch[1] : null;

          return (
           <div key={msg.id} className={`p-4 rounded-xl border bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md ${msg.color === 'yellow' ? 'border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.1)]' : 'border-white/10'}`}>
            <div className="flex items-center gap-4 w-full">
             <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg text-xl shadow-inner ${msg.color === 'yellow' ? 'bg-gradient-to-br from-yellow-400/20 to-amber-500/10 text-yellow-500 border border-yellow-400/30' : 'bg-white/5 border border-white/10'}`}>{msg.icon}</div>
             <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
               <h4 className="font-bold text-[0.85rem] text-white tracking-wide">{msg.title}</h4>
               {msg.isNew && <span className="text-[0.45rem] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-yellow-500 text-black rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]">New</span>}
              </div>
              <p className="text-[0.65rem] text-white/60 max-w-sm">{msg.desc.replace(/Your PIN: \d+\.\s*/, '')}</p>
              <p className="text-[0.5rem] uppercase tracking-widest font-bold text-white/20 mt-1">{msg.time}</p>
             </div>
            </div>
            
            {pin && (
             <div className="flex flex-col sm:flex-row items-center gap-3 px-5 py-2 border border-dashed border-yellow-400/50 rounded-xl bg-yellow-400/5 w-full sm:w-auto mt-2 sm:mt-0">
              <span className="text-[0.45rem] uppercase tracking-[0.2em] text-yellow-500/80 font-bold whitespace-nowrap">Show this PIN</span>
              <span className="font-mono text-2xl font-black text-yellow-400 tracking-[0.25em] drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">{pin}</span>
             </div>
            )}
           </div>
          );
         })}
        </div>
       );
      })()}
     </div>
    </div>

    {/* Photo Upload System */}
    <div className="mb-10">
      <FanUploadForm />
    </div>

    {/* Stats Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
     {[
      { label: "Shows Attended", value: member!.showsAttended.toString(), accent: true },
      { label: "Member Since", value: new Date(member!.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
     ].map((s) => (
      <div key={s.label} className="p-5 bg-white/[0.02] border border-white/10">
       <p className="text-[0.55rem] uppercase tracking-[0.2em] text-white/25 mb-1">{s.label}</p>
       <p className={`text-2xl font-bold ${s.accent ? "text-[var(--color-accent)]" : ""}`} style={s.color ? { color: s.color } : undefined}>
        {s.value}
       </p>
      </div>
     ))}
    </div>



    {/* Pick Awards — Collector Section */}
    <div className="mb-6 p-6 bg-white/[0.02] border border-white/10">
     <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-bold">
       Pick <span className="gradient-text">Awards</span>
      </h2>
      <span className="text-[0.55rem] uppercase tracking-[0.15em] text-white/25">Collect Picks · Enter Lotteries</span>
     </div>

     {(() => {
      const pickTypes = [
       { id: "purple", name: "Classic Purple", rarity: "Common", img: "/images/picks/purple.png", color: "#a855f7", owned: 3 },
       { id: "red", name: "Crimson Fire", rarity: "Uncommon", img: "/images/picks/red.png", color: "#ef4444", owned: 2 },
       { id: "black", name: "Stealth Black", rarity: "Uncommon", img: "/images/picks/black.png", color: "#6b7280", owned: 1 },
       { id: "silver", name: "Chrome Silver", rarity: "Rare", img: "/images/picks/silver.png", color: "#c0c0c0", owned: 1 },
       { id: "gold", name: "24K Gold", rarity: "Epic", img: "/images/picks/gold.png", color: "#fbbf24", owned: 0 },
       { id: "holographic", name: "Holographic", rarity: "Legendary", img: "/images/picks/holographic.png", color: "#ec4899", owned: 0 },
      ];

      const totalOwned = pickTypes.reduce((s, p) => s + p.owned, 0);

      const lotteries = [
       { name: "Signed Guitar Raffle", requirement: "Collect 5+ picks", minPicks: 5, prize: "Signed Electric Guitar", entries: 142, endsIn: "3 days" },
       { name: "VIP Season Pass", requirement: "Collect 1 of each rarity", minPicks: 6, prize: "Free entry to every 2026 show", entries: 38, endsIn: "12 days" },
       { name: "Backstage Birthday Party", requirement: "Collect 10+ picks", minPicks: 10, prize: "Private backstage party for you + 5 friends", entries: 17, endsIn: "28 days" },
      ];

      const rarityColors: Record<string, string> = {
       Common: "text-white/40",
       Uncommon: "text-green-400",
       Rare: "text-blue-400",
       Epic: "text-yellow-400",
       Legendary: "text-pink-400",
      };

      return (
       <>
        {/* Pick Collection Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
         {pickTypes.map((pick) => (
          <div
           key={pick.id}
           className={`relative p-3 border text-center transition-all ${pick.owned > 0 ? "border-white/10 bg-white/[0.02]" : "border-white/5 opacity-30 grayscale"}`}
          >
           <div className="relative mx-auto w-16 h-16 mb-2">
            <img src={pick.img} alt={pick.name} className="w-full h-full object-contain" />
            {pick.owned > 1 && (
             <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[0.55rem] font-bold bg-[var(--color-accent)] text-white">
              ×{pick.owned}
             </span>
            )}
           </div>
           <p className="text-[0.6rem] font-bold text-white/70 truncate">{pick.name}</p>
           <p className={`text-[0.5rem] font-bold uppercase tracking-[0.1em] ${rarityColors[pick.rarity]}`}>{pick.rarity}</p>
           {pick.owned === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-[0.6rem] font-bold text-white/30 uppercase tracking-[0.15em] bg-black/60 px-2 py-1">Locked</span>
            </div>
           )}
          </div>
         ))}
        </div>

        {/* Collection Stats */}
        <div className="flex items-center gap-6 mb-6 p-3 bg-white/[0.03] border border-white/5">
         <div>
          <p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/25">Total Picks</p>
          <p className="text-xl font-bold text-[var(--color-accent)]">{totalOwned}</p>
         </div>
         <div>
          <p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/25">Unique Types</p>
          <p className="text-xl font-bold text-white">{pickTypes.filter(p => p.owned > 0).length}/{pickTypes.length}</p>
         </div>
         <div className="ml-auto text-right">
          <p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/25">How to earn</p>
          <p className="text-[0.6rem] text-white/40">Attend shows · Merch purchases · Social shares · Referrals</p>
         </div>
        </div>


       </>
      );
     })()}
    </div>



    {/* Get Show Alerts — Full-width proximity section */}
    <div className="mt-6 p-0 bg-white/[0.02] border border-white/10 overflow-hidden">
     <div className="grid md:grid-cols-2">
      {/* Left — Form */}
      <div className="p-8 md:p-10">
       <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">📱</span>
        <h2 className="text-lg font-bold">Get Show <span className="gradient-text">Alerts</span></h2>
       </div>
       <p className="text-sm text-white/40 mb-8">Never miss a show near you — get text alerts when we announce new dates in your area.</p>

       <div className="bg-white/[0.04] border border-white/10 p-5 flex items-center justify-between mt-8">
        <div>
         <p className="text-sm font-bold text-white">SMS Notifications</p>
         <p className="text-[0.65rem] text-white/40 mt-1">Receive texts for exclusive drops and nearby shows.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input type="checkbox" className="sr-only peer" defaultChecked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} />
         <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
        </label>
       </div>

       <div className="mt-6 p-5 bg-white/[0.01] border border-white/5">
        <div className="flex items-center justify-between mb-3">
         <p className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 font-bold">Current Settings</p>
         <button className="text-[0.6rem] text-[var(--color-accent)] hover:text-white uppercase tracking-[0.1em] font-bold transition-colors cursor-pointer">Edit Profile</button>
        </div>
        <div className="flex flex-col gap-2 text-[0.7rem] text-white/60">
         <span className="flex items-center gap-2"><span className="text-white/30 text-xs">📍</span> <strong className="text-white">{member?.location ? "Location tracked" : "60601"}</strong></span>
         <span className="flex items-center gap-2"><span className="text-white/30 text-xs">📱</span> <strong className="text-white">{(member as any)?.phone || "(555) 123-4567"}</strong></span>
        </div>
       </div>

       <p className="text-[0.55rem] text-white/20 mt-8">Msg & data rates may apply. Reply STOP to instantly unsubscribe.</p>
      </div>

      {/* Right — Phone Mockup with notification */}
      <div className="relative flex items-center justify-center bg-gradient-to-br from-[#1a0a2e] to-[#0a0a14] min-h-[500px] overflow-hidden">
       {/* Map grid background */}
       <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
         linear-gradient(rgba(168,85,247,0.15) 1px, transparent 1px),
         linear-gradient(90deg, rgba(168,85,247,0.15) 1px, transparent 1px),
         linear-gradient(rgba(168,85,247,0.08) 1px, transparent 1px),
         linear-gradient(90deg, rgba(168,85,247,0.08) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px'
       }} />

       {/* Radial purple glow */}
       <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--color-accent)]/20 rounded-full blur-[80px]" />

       {/* Phone frame */}
       <div className="relative z-10 w-[260px] rounded-[32px] border-[3px] border-white/10 bg-[#0c0c18] shadow-[0_0_60px_rgba(168,85,247,0.2)] overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
         <span className="text-[0.55rem] font-bold text-white/50">9:41</span>
         <div className="w-20 h-5 bg-black rounded-full" />
         <div className="flex gap-1">
          <div className="w-3.5 h-2 border border-white/30 rounded-sm"><div className="w-2 h-full bg-white/50 rounded-sm" /></div>
         </div>
        </div>

        {/* Notification banner */}
        <div className="mx-3 mt-2 p-3 bg-gradient-to-r from-[var(--color-accent)] to-[#ec4899] rounded-xl">
         <p className="text-[0.65rem] font-extrabold text-white leading-tight">7th Heaven is playing in your area!</p>
         <p className="text-[0.55rem] font-bold text-white/80 mt-0.5">
          {nearbyShows.length > 0 ? `${nearbyShows[0].name} @ ${nearbyShows[0].time || "TBD"}` : "Station 34 @ 9pm"}
         </p>
        </div>

        {/* Map area */}
        <div className="mx-3 mt-2 h-[220px] rounded-lg overflow-hidden border border-white/5 relative" style={{
         background: 'linear-gradient(135deg, #1a0533 0%, #0d0d1a 50%, #1a0533 100%)'
        }}>
         {/* Map roads */}
         <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 260 220">
          <line x1="0" y1="80" x2="260" y2="80" stroke="#a855f7" strokeWidth="0.5" />
          <line x1="0" y1="140" x2="260" y2="140" stroke="#a855f7" strokeWidth="0.5" />
          <line x1="80" y1="0" x2="80" y2="220" stroke="#a855f7" strokeWidth="0.5" />
          <line x1="180" y1="0" x2="180" y2="220" stroke="#a855f7" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="260" y2="50" stroke="#a855f7" strokeWidth="0.3" opacity="0.5" />
          <line x1="0" y1="170" x2="260" y2="170" stroke="#a855f7" strokeWidth="0.3" opacity="0.5" />
          <line x1="40" y1="0" x2="40" y2="220" stroke="#a855f7" strokeWidth="0.3" opacity="0.5" />
          <line x1="130" y1="0" x2="130" y2="220" stroke="#a855f7" strokeWidth="0.3" opacity="0.5" />
          <line x1="220" y1="0" x2="220" y2="220" stroke="#a855f7" strokeWidth="0.3" opacity="0.5" />
          {/* Diagonal road */}
          <line x1="0" y1="200" x2="180" y2="20" stroke="#a855f7" strokeWidth="0.8" opacity="0.6" />
         </svg>
         {/* Venue pick marker */}
         <div className="absolute top-[45%] left-[55%] -translate-x-1/2 -translate-y-1/2">
          <svg width="28" height="36" viewBox="0 0 24 32" className="drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">
           <path d="M12 0C5.4 0 0 4.2 0 9.4c0 3.2 1.6 6 4 8.2L12 32l8-14.4c2.4-2.2 4-5 4-8.2C24 4.2 18.6 0 12 0Z" fill="#a855f7" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
          </svg>
          {/* Pulse ring */}
          <div className="absolute top-[10px] left-[6px] w-4 h-4 rounded-full border border-[var(--color-accent)]/50 animate-ping" />
         </div>
         {/* Location labels */}
         <span className="absolute top-3 right-3 text-[0.45rem] text-white/20 font-bold uppercase tracking-wider">Chicago</span>
         <span className="absolute bottom-3 left-3 text-[0.45rem] text-white/20 font-bold uppercase tracking-wider">Suburbs</span>
        </div>

        {/* Bottom card — nearest show info */}
        <div className="mx-3 mt-2 mb-4 p-3 bg-white/[0.04] border border-white/5 rounded-lg">
         <p className="text-[0.6rem] font-bold text-[var(--color-accent)] uppercase tracking-[0.1em]">
          {nearbyShows.length > 0 ? `${nearbyShows[0].distance.toFixed(1)} mi away` : "Nearby show found"}
         </p>
         <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2">
           <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[#ec4899] flex items-center justify-center">
            <span className="text-[0.5rem] font-extrabold text-white">7H</span>
           </div>
           <div>
            <p className="text-[0.6rem] font-bold text-white">{nearbyShows.length > 0 ? nearbyShows[0].name : "Station 34"}</p>
            <p className="text-[0.5rem] text-white/40">{nearbyShows.length > 0 ? nearbyShows[0].city : "Mt. Prospect, IL"}</p>
           </div>
          </div>
          <div className="flex gap-1">
           <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[0.5rem]">📍</div>
          </div>
         </div>
        </div>
       </div>
      </div>
     </div>
    </div>

    {/* Removed Digital Tickets / Inbox from here as it was moved to the very top */}

    {/* My Purchases */}
    <div className="mt-6 p-6 bg-white/[0.02] border border-white/10">
     <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold">
       My <span className="gradient-text">Purchases</span>
      </h2>
      <span className="text-[0.55rem] uppercase tracking-[0.15em] text-white/25">Order History</span>
     </div>

     {(() => {
      // Demo purchases — in production these come from an API
      const purchases = [
       { id: "7H-2026-0412", date: "Apr 12, 2026", items: [{ name: "7th Heaven Logo Tee", type: "Merch", price: "$29.99", img: "/images/merch/logo-tee.png" }], status: "Delivered", statusColor: "text-emerald-400" },
       { id: "7H-2026-0401", date: "Apr 1, 2026", items: [{ name: "VIP Ticket — Durty Nellies", type: "Ticket", price: "$75.00", img: "/images/merch/ticket-vip.png" }, { name: "Meet & Greet Add-On", type: "Upgrade", price: "$25.00", img: "/images/merch/ticket-vip.png" }], status: "Completed", statusColor: "text-emerald-400" },
       { id: "7H-2026-0315", date: "Mar 15, 2026", items: [{ name: "Signed Vinyl — Greatest Hits", type: "Merch", price: "$44.99", img: "/images/merch/vinyl.png" }], status: "Shipped", statusColor: "text-amber-400" },
       { id: "7H-2026-0228", date: "Feb 28, 2026", items: [{ name: "7th Heaven Hoodie (Black)", type: "Merch", price: "$54.99", img: "/images/merch/hoodie.png" }], status: "Delivered", statusColor: "text-emerald-400" },
       { id: "7H-2026-0210", date: "Feb 10, 2026", items: [{ name: "GA Ticket — Des Plaines Theater", type: "Ticket", price: "$35.00", img: "/images/merch/ticket-ga.png" }], status: "Used", statusColor: "text-white/40" },
      ];

      return (
       <div className="flex flex-col gap-3">
        {purchases.map((order) => (
         <div key={order.id} className="border border-white/5 bg-white/[0.01] overflow-hidden">
          {/* Order header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
           <div className="flex items-center gap-4">
            <span className="text-[0.55rem] font-mono text-white/30">{order.id}</span>
            <span className="text-[0.55rem] text-white/20">{order.date}</span>
           </div>
           <span className={`text-[0.55rem] uppercase tracking-[0.15em] font-bold ${order.statusColor}`}>
            {order.status}
           </span>
          </div>
          {/* Items */}
          <div className="px-4 py-3 flex flex-col gap-2">
           {order.items.map((item, j) => (
            <div key={j} className="flex items-center justify-between">
             <div className="flex items-center gap-3">
              <img src={item.img} alt={item.name} className="w-12 h-12 object-cover border border-white/10" />
              <div>
               <p className="text-sm font-semibold text-white/80">{item.name}</p>
               <p className="text-[0.6rem] text-white/25 uppercase tracking-[0.1em]">{item.type}</p>
              </div>
             </div>
             <span className="text-sm font-bold text-white/50">{item.price}</span>
            </div>
           ))}
          </div>
         </div>
        ))}
       </div>
      );
     })()}
    </div>


   </div>
  </section>
 );
}
