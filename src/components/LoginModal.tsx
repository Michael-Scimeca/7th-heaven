"use client";

import { useState } from "react";
import { useMember } from "@/context/MemberContext";

export default function LoginModal() {
 const { isModalOpen, closeModal, modalMode, setModalMode, login, signup } = useMember();
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [zipCode, setZipCode] = useState("");
 const [wantNotifications, setWantNotifications] = useState(false);
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const [loginRole, setLoginRole] = useState<'fan' | 'crew'>('fan');

 if (!isModalOpen) return null;

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (modalMode === "login") {
   const ok = await login(email, password);
    if (!ok) {
     setError("Invalid email or password. Try again or sign up.");
    } else {
    // Redirect based on logged-in user's role
    const accounts = JSON.parse(localStorage.getItem("7h_accounts") || "{}");
    const acct = accounts[email.toLowerCase()];
    if (acct?.role === 'crew') {
     window.location.href = '/crew';
    } else if (acct?.role === 'event_planner') {
     window.location.href = '/planner';
    } else if (acct?.role === 'admin') {
     window.location.href = '/admin';
    } else {
     window.location.href = '/fans';
    }
   }
  } else {
   if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
   if (!email.includes("@")) { setError("Valid email required"); setLoading(false); return; }
   if (password.length < 4) { setError("Password must be 4+ characters"); setLoading(false); return; }
   if (wantNotifications && !zipCode.trim()) { setError("Enter your zip code to receive local show alerts"); setLoading(false); return; }
   const ok = await signup(name, email, password);
   if (!ok) {
    setError("An account with this email already exists.");
   } else {
    window.location.href = '/fans';
   }
  }
  setLoading(false);
 };

 return (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">
   {/* Backdrop */}
   <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

   {/* Modal */}
   <div className="relative w-full max-w-md mx-4 bg-[#0c0c18] border border-white/10 overflow-hidden animate-[fadeIn_0.3s_ease]">
    {/* Accent bar */}
    <div className="h-1 bg-gradient-to-r from-[var(--color-accent)] via-[#c026d3] to-[var(--color-accent)]" />

    {/* Close */}
    <button
     onClick={closeModal}
     className="absolute top-4 right-4 text-white/30 hover:text-white text-xl transition-colors cursor-pointer"
    >
     ✕
    </button>

    <div className="p-8">
     {/* Logo */}
     <div className="text-center mb-8">
      <h2 className="text-2xl font-bold tracking-tight">
       <span className="text-[var(--color-accent)]">7</span>th <em className="text-[var(--color-accent)]">heaven</em>
      </h2>
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/30 mt-2">
       {modalMode === "login" ? "Login as Fan or Crew" : "Join the Family"}
      </p>
     </div>

     {/* Tabs */}
     <div className="flex mb-6 border-b border-white/10">
      <button
       onClick={() => { setModalMode("login"); setError(""); }}
       className={`flex-1 pb-3 text-xs font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer ${modalMode === "login" ? "text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]" : "text-white/30 hover:text-white/50"}`}
      >
       Login
      </button>
      <button
       onClick={() => { setModalMode("signup"); setError(""); }}
       className={`flex-1 pb-3 text-xs font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer ${modalMode === "signup" ? "text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]" : "text-white/30 hover:text-white/50"}`}
      >
       Sign Up
      </button>
     </div>

     {/* Fan / Crew Toggle — Login only (crew accounts are admin-created) */}
     {modalMode === 'login' && (
     <div className="flex items-center justify-center gap-1 mb-6 bg-white/[0.03] border border-white/10 rounded-lg p-1">
      <button
       type="button"
       onClick={() => setLoginRole('fan')}
       className={`flex-1 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] rounded-md transition-all cursor-pointer ${
        loginRole === 'fan'
         ? 'bg-[var(--color-accent)] text-white shadow-[0_0_12px_rgba(133,29,239,0.3)]'
         : 'text-white/30 hover:text-white/50'
       }`}
      >
       🎸 Fan
      </button>
      <button
       type="button"
       onClick={() => setLoginRole('crew')}
       className={`flex-1 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] rounded-md transition-all cursor-pointer ${
        loginRole === 'crew'
         ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
         : 'text-white/30 hover:text-white/50'
       }`}
      >
       🛡️ Crew
      </button>
     </div>
     )}

     <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off" data-form-type="other">
      {modalMode === "signup" && (
       <>
        <div>
         <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block">Full Name</label>
         <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors"
         />
        </div>
        
        {loginRole === 'fan' && (
        <div className="flex flex-col gap-3">
         {/* Notification opt-in toggle */}
         <button
          type="button"
          onClick={() => setWantNotifications(!wantNotifications)}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-all cursor-pointer ${
           wantNotifications
            ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40'
            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
          }`}
         >
          <span className={`w-9 h-5 rounded-full relative transition-all flex-shrink-0 ${
           wantNotifications ? 'bg-[var(--color-accent)]' : 'bg-white/10'
          }`}>
           <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            wantNotifications ? 'left-[18px]' : 'left-0.5'
           }`} />
          </span>
          <span className="text-[0.7rem] text-white/70 leading-tight text-left">
           📍 Notify me when 7th Heaven books a show near me
          </span>
         </button>

         {/* Zip code — only if opted in */}
         {wantNotifications && (
         <div>
          <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block">Zip Code</label>
          <input
           type="text"
           value={zipCode}
           onChange={(e) => setZipCode(e.target.value)}
           placeholder="e.g. 60601"
           className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors"
          />
         </div>
         )}
        </div>
        )}
        </>
       )}

      <div>
       <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block">Email</label>
       <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        autoComplete="off"
        data-lpignore="true"
        data-form-type="other"
        className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors"
       />
      </div>

      <div>
       <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block">Password</label>
       <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="new-password"
        data-lpignore="true"
        data-form-type="other"
        className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors"
       />
      </div>

      {error && (
       <p className="text-xs text-rose-400 bg-rose-400/10 px-3 py-2 border border-rose-400/20">{error}</p>
      )}

      <button
       type="submit"
       disabled={loading}
       className="w-full py-3.5 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-[0.15em] hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
      >
       {loading ? "..." : modalMode === "login" ? "Sign In" : "Create Account"}
      </button>
     </form>



     {modalMode === "login" && (
      <p className="text-center text-[0.65rem] text-white/30 mt-6">
       Don&apos;t have an account?{" "}
       <button onClick={() => setModalMode("signup")} className="text-[var(--color-accent)] hover:text-white transition-colors cursor-pointer">
        Sign up free
       </button>
      </p>
     )}
    </div>
   </div>

   <style jsx>{`
    @keyframes fadeIn {
     from { opacity: 0; transform: scale(0.95) translateY(10px); }
     to { opacity: 1; transform: scale(1) translateY(0); }
    }
   `}</style>
  </div>
 );
}
