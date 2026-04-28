"use client";

import { useState, useRef } from "react";
import { signupSchema } from "@/lib/validation";

export default function ProximityNotify() {
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [phone, setPhone] = useState("");
 const [zip, setZip] = useState("");
 const [radius, setRadius] = useState("50");
 const [profilePic, setProfilePic] = useState<string | null>(null);
 const [agreeNotify, setAgreeNotify] = useState(false);
 const [agreeTerms, setAgreeTerms] = useState(false);
 const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
 const [errorMsg, setErrorMsg] = useState("");
 const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
 const fileRef = useRef<HTMLInputElement>(null);

 const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
   // Limit file size to 5MB
   if (file.size > 5 * 1024 * 1024) {
    setErrorMsg("Profile photo must be under 5MB");
    return;
   }
   const reader = new FileReader();
   reader.onloadend = () => setProfilePic(reader.result as string);
   reader.readAsDataURL(file);
  }
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFieldErrors({});
  setErrorMsg("");

  if (!agreeTerms || !agreeNotify) return;

  // Client-side validation with Zod
  const validation = signupSchema.safeParse({ name, email, phone, zip, radius });
  if (!validation.success) {
   setFieldErrors(validation.error.flatten().fieldErrors as Record<string, string[]>);
   return;
  }

  setStatus("loading");
  try {
   const res = await fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, zip, radius }),
   });

   if (res.ok) {
    setStatus("success");
    setName(""); setEmail(""); setPhone(""); setZip(""); setProfilePic(null);
   } else if (res.status === 429) {
    setStatus("error");
    setErrorMsg("Too many attempts. Please wait a moment and try again.");
   } else if (res.status === 409) {
    setStatus("error");
    setErrorMsg("An account with this email already exists. Please sign in.");
   } else {
    const data = await res.json().catch(() => ({}));
    setStatus("error");
    setErrorMsg(data.error || "Something went wrong. Try again.");
   }
  } catch {
   setStatus("error");
   setErrorMsg("Network error. Check your connection and try again.");
  }
 };

 return (
  <section className="relative py-24 sm:py-32 bg-[#050508] overflow-hidden" id="proximity-notify">

   {/* ═══ Full Background — Dark Map ═══ */}
   <div className="absolute inset-0 pointer-events-none select-none">
    {/* Google Maps-style background image */}
    <div
     className="absolute inset-0 bg-cover bg-center opacity-[0.35]"
     style={{ backgroundImage: "url('/map-bg.png')" }}
    />

    {/* Radial gradient overlay — soft vignette, lets more map through */}
    <div className="absolute inset-0" style={{
     background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 0%, rgba(5,5,8,0.7) 60%, #050508 100%)'
    }} />

    {/* Top/bottom fade for seamless section blending */}
    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050508] to-transparent" />
    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050508] to-transparent" />

    {/* Accent glow behind content area */}
    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[var(--color-accent)]/[0.05] rounded-full blur-[120px]" />
   </div>

   {/* ═══ Content — Two Column ═══ */}
   <div className="relative z-10 site-container">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center max-w-[1100px] mx-auto">

    {/* ── LEFT: Phone Mockup ── */}
    <div className="w-[390px] sm:w-[450px] mx-auto animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.2s_both]">
     <div className="relative bg-[#111120] rounded-[2.8rem] p-[7px] shadow-[0_25px_80px_-15px_rgba(133,29,239,0.2)] border border-white/[0.08]">
      {/* Dynamic Island */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[24px] bg-black rounded-full z-20" />

      {/* Screen */}
      <div className="relative rounded-[2.4rem] overflow-hidden aspect-[9/15.5]">

       {/* Lock Screen Layer */}
       <div className="absolute inset-0 z-[2] animate-[lockFade_10s_ease-in-out_infinite]">
        {/* Wallpaper */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d1b69] via-[#1e3a5f] to-[#0d7377]">
         <div className="absolute top-[10%] left-[-30%] w-[160%] h-[60%] bg-gradient-to-r from-purple-600/30 via-blue-500/25 to-cyan-400/20 rounded-full blur-3xl rotate-[-12deg]" />
         <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#0d7377]/60 to-transparent" />
        </div>

        {/* Time & Date */}
        <div className="relative z-10 pt-16 px-6 text-center">
         <div className="text-[4rem] font-extralight text-white leading-none tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
          11:56
         </div>
         <div className="text-white/50 text-[0.85rem] mt-1.5 font-light tracking-wide">
          July 6, Wednesday
         </div>
        </div>

        {/* Push Notification */}
        <div className="relative z-10 mx-4 mt-8 animate-[notifyPop_10s_ease-in-out_infinite]">
         <div className="bg-white/15 backdrop-blur-2xl rounded-2xl p-3.5 border border-white/[0.08] shadow-lg">
          <div className="flex items-start gap-3">
           <div className="w-10 h-10 rounded-[12px] bg-[var(--color-accent)] flex items-center justify-center shrink-0 shadow-md shadow-purple-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
             <circle cx="12" cy="10" r="3" />
            </svg>
           </div>
           <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
             <span className="text-[0.85rem] font-bold text-white">7th Heaven</span>
             <span className="text-[0.65rem] text-white/40">1m ago</span>
            </div>
            <p className="text-[0.75rem] text-white/70 leading-snug">
             Playing @ Joe&apos;s Bar in your area tonight. Tap for directions!
            </p>
           </div>
          </div>
         </div>
        </div>

         {/* Group Chat Message Notification */}
         <div className="relative z-10 mx-4 mt-2 animate-[chatNotify_10s_ease-in-out_infinite]">
          <div className="bg-white/15 backdrop-blur-2xl rounded-2xl p-3 border border-white/[0.08] shadow-lg">
           <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-emerald-500/80 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
             </svg>
            </div>
            <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between mb-0.5">
              <span className="text-[0.8rem] font-bold text-white">7th Heaven @ Joe&apos;s</span>
              <span className="text-[0.6rem] text-white/40">now</span>
             </div>
             <p className="text-[0.7rem] text-white/65 leading-snug">
              <span className="font-semibold text-white/80">Mike:</span> Front rows open! 🎸
             </p>
            </div>
           </div>
          </div>
         </div>
        </div>

       {/* Show Page Layer */}
       <div className="absolute inset-0 z-[1] bg-[#08080f]">
         {/* Status bar */}
         <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6 pt-4">
           <div className="text-[0.75rem] text-white/50 font-medium">11:56</div>
           <div className="flex gap-1.5 items-center">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="white" fillOpacity="0.35"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4l2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
             <div className="w-[18px] h-[10px] border border-white/30 rounded-[2px] relative"><div className="absolute inset-[1px] right-[4px] bg-white/30 rounded-[1px]" /></div>
           </div>
         </div>

         {/* Show hero card */}
         <div className="absolute inset-x-0 top-10 bottom-0 overflow-y-auto animate-[mapFadeIn_10s_ease-in-out_infinite]">
           {/* Band / venue header */}
           <div className="px-4 pt-6 pb-3 border-b border-white/[0.06]">
             <div className="flex items-center gap-2 mb-1">
               <span className="text-[0.45rem] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">📍 0.8 mi away</span>
             </div>
             <h3 className="text-white font-black text-[1.1rem] leading-tight">7th Heaven</h3>
             <p className="text-white/40 text-[0.65rem] mt-0.5">Joe's Bar · 940 W Weed St, Chicago</p>
             <p className="text-white/25 text-[0.55rem] mt-0.5">Tonight · Doors 7PM · Show 8PM</p>
           </div>

           {/* RSVP buttons */}
           <div className="px-4 pt-3 pb-2 animate-[cardUp_10s_ease-in-out_infinite]">
             <div className="flex gap-2">
               <div className="flex-1 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 rounded-lg py-2 flex items-center justify-center gap-1">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                 <span className="text-[0.65rem] font-bold text-purple-300">Going</span>
               </div>
               <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2 flex items-center justify-center">
                 <span className="text-[0.65rem] font-bold text-emerald-400">✓ Here Now</span>
               </div>
               <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg py-2 flex items-center justify-center">
                 <span className="text-[0.65rem] font-bold text-white/30">Directions</span>
               </div>
             </div>
           </div>

           {/* Invite Challenge card */}
           <div className="mx-4 mt-2 p-3 border border-purple-500/20 bg-purple-500/[0.05] rounded-lg animate-[msg1_10s_ease-out_infinite]">
             <div className="flex items-start gap-2">
               <span className="text-base shrink-0">🎁</span>
               <div className="flex-1 min-w-0">
                 <p className="text-white text-[0.6rem] font-bold leading-tight">Invite <span className="text-purple-300">20 fans</span> → free Band Tee</p>
                 <div className="mt-1.5 h-1 bg-white/[0.05] rounded-full w-full">
                   <div className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full w-[30%]" />
                 </div>
                 <p className="text-[0.45rem] text-white/20 mt-0.5 font-bold">6 / 20 fans invited</p>
               </div>
             </div>
           </div>

           {/* Attendee list */}
           <div className="mx-4 mt-3 animate-[msg2_10s_ease-out_infinite]">
             <p className="text-[0.5rem] uppercase tracking-widest text-white/25 font-bold mb-2">Who's Going</p>
             <div className="grid grid-cols-2 gap-1">
               {[
                 { initials: "AJ", name: "Alex J.", status: "there", color: "from-amber-400 to-orange-500" },
                 { initials: "SR", name: "Sarah R.", status: "going", color: "from-purple-400 to-purple-600" },
                 { initials: "TK", name: "Tyler K.", status: "going", color: "from-pink-400 to-rose-500" },
                 { initials: "??", name: "Anonymous", status: "going", color: "from-white/10 to-white/5" },
               ].map((fan, i) => (
                 <div key={i} className={`flex items-center gap-1.5 p-1.5 border ${fan.status === "there" ? "border-emerald-500/20 bg-emerald-500/[0.03]" : "border-white/[0.04]"} rounded`}>
                   <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${fan.color} flex items-center justify-center shrink-0`}>
                     <span className="text-[0.4rem] font-black text-white">{fan.initials}</span>
                   </div>
                    <div>
                      <p className="text-[0.5rem] font-bold text-white/60 leading-none">{fan.name}</p>
                      <p className={`text-[0.4rem] font-bold mt-0.5 ${fan.status === "there" ? "text-emerald-400" : "text-white/25"}`}>{fan.status === "there" ? "✓ Here" : "Going"}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-1.5 py-1.5 border border-dashed border-white/[0.06] text-[0.45rem] text-white/20 font-bold uppercase tracking-widest">+ 8 more fans going ↓</button>
            </div>
          </div>

        </div>

       </div>
      </div>

      {/* Phone glow */}
      <div className="absolute -inset-12 bg-[var(--color-accent)]/[0.04] rounded-full blur-[80px] -z-10" />
     </div>

     {/* ── RIGHT: Heading + Form ── */}
     <div className="text-center lg:text-center">
      <h2 className="font-[var(--font-heading)] text-[clamp(2.8rem,6vw,4.5rem)] font-extrabold italic text-white leading-[0.9] tracking-tight mb-4 animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.4s_both]">
       Never Miss a Show
      </h2>
      <p className="text-[0.95rem] text-white/35 max-w-[480px] mb-2 leading-relaxed animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.5s_both] mx-auto">
       Get exclusives. Stay connected to the 7th Heaven community.
      </p>
      <p className="text-[0.95rem] text-white/50 max-w-[480px] mb-10 leading-relaxed animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.55s_both] mx-auto">
       Join <span className="text-white/70 font-semibold">1,000s</span>{' '}of fans getting proximity alerts &amp; show updates.
      </p>

     {/* Glass Form Card */}
     <div className="w-full max-w-[520px] mx-auto animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.6s_both]">
      {status === "success" ? (
       <div className="bg-[var(--color-accent)]/10 backdrop-blur-xl border border-[var(--color-accent)]/20 rounded-2xl p-10 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-3">
         <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
         </div>
         <span className="text-white font-bold text-[1.1rem]">Check your email!</span>
        </div>
        <p className="text-white/35 text-[0.85rem] mb-1">We&apos;ve sent a confirmation link to your inbox.</p>
        <p className="text-white/25 text-[0.75rem]">Click the link to confirm your account and start getting show alerts.</p>
       </div>
      ) : (
       <form onSubmit={handleSubmit} className="bg-black/60 backdrop-blur-md border border-white/[0.05] rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
        <div className="space-y-3">
         {/* Profile Picture */}
         <div className="flex items-center gap-5 mb-4 pb-4 border-b border-white/[0.05]">
          <button
           type="button"
           onClick={() => fileRef.current?.click()}
           className={`relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 overflow-hidden group ${
            profilePic
             ? 'border-2 border-[var(--color-accent)]/30'
             : name.trim()
              ? 'bg-gradient-to-br from-[var(--color-accent)] to-[#6b21a8] border-2 border-white/[0.1] shadow-lg shadow-purple-500/20'
              : 'bg-white/[0.06] border-2 border-dashed border-white/[0.15] hover:border-[var(--color-accent)]/50 hover:bg-white/[0.08]'
           }`}
          >
           {profilePic ? (
            <img src={profilePic} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
           ) : name.trim() ? (
            <span className="text-[1.4rem] font-bold text-white leading-none">{name.trim()[0].toUpperCase()}</span>
           ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
             <circle cx="12" cy="7" r="4" />
            </svg>
           )}
           {/* Hover overlay */}
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
             <circle cx="12" cy="13" r="4" />
            </svg>
           </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleProfilePic} className="hidden" />
          <div>
           <p className="text-[0.8rem] text-white/50">{profilePic ? 'Change Photo' : 'Add a Profile Photo'}</p>
           <p className="text-[0.6rem] text-white/20 mt-0.5">Visible to other members at shows</p>
          </div>
         </div>

         {/* Name */}
         <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Full name"
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-5 py-4 text-[0.9rem] text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-all duration-200"
         />
         {/* Email */}
         <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-5 py-4 text-[0.9rem] text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-all duration-200"
         />
         {/* Phone */}
         <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d\-()+ ]/g, "").slice(0, 16))}
          placeholder="Phone number"
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-5 py-4 text-[0.9rem] text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-all duration-200"
         />
         {/* Zip + Radius */}
         <div className="flex gap-3">
          <input
           type="text"
           value={zip}
           onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
           required
           placeholder="Zip code"
           maxLength={5}
           pattern="\d{5}"
           className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-5 py-4 text-[0.9rem] text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-all duration-200"
          />
          <select
           value={radius}
           onChange={(e) => setRadius(e.target.value)}
           className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-4 text-[0.85rem] text-white/40 focus:border-[var(--color-accent)]/50 focus:outline-none transition-all duration-200 appearance-none cursor-pointer text-center w-[110px]"
          >
           <option value="25" className="bg-[#0a0a12]">25 mi</option>
           <option value="50" className="bg-[#0a0a12]">50 mi</option>
           <option value="100" className="bg-[#0a0a12]">100 mi</option>
           <option value="200" className="bg-[#0a0a12]">200 mi</option>
          </select>
         </div>

          {/* Notification Agreement */}
         <label className="flex items-start gap-3 cursor-pointer pt-1">
          <button
           type="button"
           onClick={() => setAgreeNotify(!agreeNotify)}
           className={`relative w-[42px] h-[24px] rounded-full transition-all duration-300 shrink-0 mt-0.5 ${
            agreeNotify
             ? "bg-[var(--color-accent)] shadow-[0_0_12px_rgba(133,29,239,0.3)]"
             : "bg-white/[0.1]"
           }`}
          >
           <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-300 ${
            agreeNotify ? "left-[21px]" : "left-[3px]"
           }`} />
          </button>
          <span className="text-[0.75rem] text-white/40 leading-snug">Enable proximity notifications &amp; SMS alerts for nearby shows. You can manage this anytime in your profile settings.</span>
         </label>

         {/* Terms & Privacy Agreement */}
         <label className="flex items-start gap-3 cursor-pointer pt-1">
          <div
           onClick={() => setAgreeTerms(!agreeTerms)}
           className={`w-[18px] h-[18px] rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 cursor-pointer ${
            agreeTerms
             ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
             : 'border-white/20 hover:border-white/30'
           }`}
          >
           {agreeTerms && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
           )}
          </div>
          <span className="text-[0.7rem] text-white/35 leading-snug">
           I am 18 years of age or older and agree to the{' '}
           <a href="/terms" className="text-white/50 underline hover:text-white/70 transition-colors">Terms of Service</a>{' '}and{' '}
           <a href="/privacy" className="text-white/50 underline hover:text-white/70 transition-colors">Privacy Policy</a>.
          </span>
         </label>

         {/* Submit */}
         <button
          type="submit"
          disabled={status === "loading" || !agreeNotify || !agreeTerms}
          className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 hover:shadow-[0_8px_30px_-5px_rgba(133,29,239,0.4)] text-white font-bold text-[0.85rem] uppercase tracking-[0.15em] py-4 rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 mt-1"
         >
          {status === "loading" ? "Creating account..." : "Create Account"}
         </button>
        </div>

        {/* Data usage notice */}
        <p className="text-[0.6rem] text-white/[0.12] mt-5 leading-relaxed text-center">
         Your data is encrypted and stored securely. We will never sell your personal information. You may request data deletion at any time. By creating an account you consent to receive transactional emails related to your account.
        </p>

        {/* Field validation errors */}
        {Object.keys(fieldErrors).length > 0 && (
         <div className="mt-4 space-y-1">
          {Object.entries(fieldErrors).map(([field, errors]) => (
           <p key={field} className="text-red-400 text-[0.7rem]">
            <span className="capitalize">{field}</span>: {errors.join(", ")}
           </p>
          ))}
         </div>
        )}

        {status === "error" && (
         <p className="text-red-400 text-[0.75rem] mt-4 text-center">{errorMsg || "Something went wrong. Try again."}</p>
        )}
       </form>
      )}
      <p className="text-[0.6rem] text-white/[0.12] mt-5 tracking-wide text-center">Already a fan? <span className="text-white/20 underline cursor-pointer">Sign in</span> to enable notifications in your profile settings.</p>
     </div>
    </div>

    </div>{/* close grid */}
   </div>

   {/* ═══ Animations ═══ */}
   <style jsx>{`
    @keyframes lockFade {
     0% { opacity: 1; }
     25% { opacity: 1; }
     35% { opacity: 0; }
     82% { opacity: 0; }
     92% { opacity: 1; }
     100% { opacity: 1; }
    }

    @keyframes notifyPop {
     0% { opacity: 0; transform: translateY(-16px) scale(0.96); }
     6% { opacity: 1; transform: translateY(0) scale(1); }
     25% { opacity: 1; transform: translateY(0) scale(1); }
     32% { opacity: 0; transform: translateY(0) scale(1); }
     100% { opacity: 0; transform: translateY(-16px) scale(0.96); }
    }

    @keyframes chatNotify {
     0%, 8% { opacity: 0; transform: translateY(-12px) scale(0.96); }
     14% { opacity: 1; transform: translateY(0) scale(1); }
     25% { opacity: 1; transform: translateY(0) scale(1); }
     32% { opacity: 0; transform: translateY(0) scale(1); }
     100% { opacity: 0; transform: translateY(-12px) scale(0.96); }
    }

    @keyframes cardUp {
     0% { opacity: 0; transform: translateY(100%); }
     35% { opacity: 0; transform: translateY(100%); }
     45% { opacity: 1; transform: translateY(0); }
     82% { opacity: 1; transform: translateY(0); }
     90% { opacity: 0; transform: translateY(100%); }
     100% { opacity: 0; transform: translateY(100%); }
    }

    @keyframes mapFadeIn {
     0% { opacity: 0; }
     35% { opacity: 0; }
     42% { opacity: 1; }
     82% { opacity: 1; }
     90% { opacity: 0; }
     100% { opacity: 0; }
    }

    @keyframes membersAppear {
     0% { opacity: 0; transform: scale(0.5); }
     35% { opacity: 0; transform: scale(0.5); }
     45% { opacity: 1; transform: scale(1); }
     82% { opacity: 1; transform: scale(1); }
     90% { opacity: 0; transform: scale(0.5); }
     100% { opacity: 0; transform: scale(0.5); }
    }

    @keyframes pinFloat {
     0%, 100% { transform: translate(-50%, -100%) translateY(0); }
     50% { transform: translate(-50%, -100%) translateY(-4px); }
    }

    @keyframes rPulse {
     0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
     50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.06); }
    }

    @keyframes goingTap {
     0%, 54% { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); transform: scale(1); }
     55% { transform: scale(0.93); }
     57% { background: rgba(52,211,153,0.2); border-color: rgba(52,211,153,0.4); color: #34d399; transform: scale(1.02); }
     59% { transform: scale(1); }
     60%, 82% { background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.3); color: #34d399; transform: scale(1); }
     90%, 100% { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); transform: scale(1); }
    }

    @keyframes goingCheck {
     0%, 55% { opacity: 0; width: 0; }
     58%, 82% { opacity: 1; width: 12px; }
     90%, 100% { opacity: 0; width: 0; }
    }

    @keyframes msg1 {
     0%, 33% { opacity: 0; transform: translateY(10px); }
     38% { opacity: 1; transform: translateY(0); }
     85% { opacity: 1; transform: translateY(0); }
     92%, 100% { opacity: 0; transform: translateY(-5px); }
    }

    @keyframes msg2 {
     0%, 38% { opacity: 0; transform: translateY(10px); }
     43% { opacity: 1; transform: translateY(0); }
     85% { opacity: 1; transform: translateY(0); }
     92%, 100% { opacity: 0; transform: translateY(-5px); }
    }

    @keyframes msg3 {
     0%, 43% { opacity: 0; transform: translateY(10px); }
     48% { opacity: 1; transform: translateY(0); }
     85% { opacity: 1; transform: translateY(0); }
     92%, 100% { opacity: 0; transform: translateY(-5px); }
    }

    @keyframes msg4 {
     0%, 48% { opacity: 0; transform: translateY(10px); }
     53% { opacity: 1; transform: translateY(0); }
     85% { opacity: 1; transform: translateY(0); }
     92%, 100% { opacity: 0; transform: translateY(-5px); }
    }

    @keyframes msg5 {
     0%, 56% { opacity: 0; transform: translateY(10px) scale(0.95); }
     62% { opacity: 1; transform: translateY(-2px) scale(1.02); }
     64%, 85% { opacity: 1; transform: translateY(0) scale(1); }
     92%, 100% { opacity: 0; transform: translateY(-5px); }
    }

    @keyframes msg6 {
     0%, 66% { opacity: 0; transform: translateY(8px); }
     72%, 85% { opacity: 1; transform: translateY(0); }
     92%, 100% { opacity: 0; transform: translateY(-5px); }
    }
   `}</style>
  </section>
 );
}
