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
 const [wantNewsletter, setWantNewsletter] = useState(true);
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const [loginRole, setLoginRole] = useState<'fan' | 'crew'>('fan');
 const [confirmationRequired, setConfirmationRequired] = useState(false);
 const [website, setWebsite] = useState(""); // Honeypot
 const [usernameField, setUsernameField] = useState("");

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
   
   if (website) {
     // Honeypot triggered
     console.warn("Honeypot triggered");
     setLoading(false);
     return;
   }

   const result = await signup(name, email, password, undefined, usernameField.trim() || undefined);
   if (!result.success) {
     setError(result.error || "An account with this email already exists.");
   } else if (result.confirmationRequired) {
     setConfirmationRequired(true);
   } else {
     // Subscribe to newsletter if opted in
     if (wantNewsletter) {
      fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'signup', website }),
      }).catch(() => {});
     }
     // Save proximity settings if opted in
     if (wantNotifications && zipCode.trim()) {
      fetch('/api/proximity/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip: zipCode.trim(), notificationRadius: 50, notificationsEnabled: true, website }),
      }).catch(() => {});
     }
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

     {confirmationRequired ? (
      <div className="text-center py-10 animate-[fadeIn_0.3s_ease]">
       <div className="w-16 h-16 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
        📧
       </div>
       <h3 className="text-xl font-bold mb-4">Check Your Email</h3>
       <p className="text-white/40 text-sm leading-relaxed mb-8">
        We&apos;ve sent a verification link to <strong className="text-white">{email}</strong>.<br/>
        Please click the link to confirm your account and join the 7th Heaven family.
       </p>
       <button 
        onClick={closeModal}
        className="w-full py-3 border border-white/10 text-white font-bold text-[0.7rem] uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer"
       >
        Got it, thanks
       </button>
      </div>
     ) : (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off" data-form-type="other">
       {/* Honeypot field (hidden) */}
       <div className="hidden" aria-hidden="true">
        <input 
         type="text" 
         name="website" 
         value={website} 
         onChange={(e) => setWebsite(e.target.value)} 
         tabIndex={-1} 
         autoComplete="off" 
        />
       </div>

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

        <div>
         <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block">Username</label>
         <input
          type="text"
          value={usernameField}
          onChange={(e) => setUsernameField(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
          placeholder="e.g. rocknroller_7h"
          maxLength={24}
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors"
         />
         <p className="text-[0.5rem] text-white/20 mt-1">Letters, numbers & underscores only. This is your display handle.</p>
        </div>

        {loginRole === 'fan' && (
         <div className="flex flex-col gap-3">
          {/* Show notification toggle */}
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

          {/* Newsletter opt-in */}
          <button
           type="button"
           onClick={() => setWantNewsletter(!wantNewsletter)}
           className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-all cursor-pointer ${
            wantNewsletter
             ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40'
             : 'bg-white/[0.02] border-white/10 hover:border-white/20'
           }`}
          >
           <span className={`w-9 h-5 rounded-full relative transition-all flex-shrink-0 ${
            wantNewsletter ? 'bg-[var(--color-accent)]' : 'bg-white/10'
           }`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
             wantNewsletter ? 'left-[18px]' : 'left-0.5'
            }`} />
           </span>
           <span className="text-[0.7rem] text-white/70 leading-tight text-left">
            📧 Send me news, show updates & exclusive drops
           </span>
          </button>
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
       className="w-full py-3.5 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-[0.15em] hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(133,29,239,0.3)]"
      >
       {loading ? "..." : modalMode === "login" ? "Sign In" : "Create Account"}
      </button>
      {modalMode === "signup" && (
       <p className="text-[0.55rem] text-white/25 text-center mt-3 leading-relaxed">
        By creating an account you agree to our <a href="/privacy" className="underline hover:text-white/40 transition-colors">Privacy Policy</a> and <a href="/terms" className="underline hover:text-white/40 transition-colors">Terms of Service</a>.
       </p>
      )}
     </form>
     )}

     {/* OAuth Social Login for Fans */}
     {loginRole === 'fan' && (
      <>
       <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[0.55rem] uppercase tracking-widest text-white/30 font-bold">Or continue with</span>
        <div className="flex-1 h-px bg-white/10" />
       </div>
       
       <div className="grid grid-cols-3 gap-3">
        <button 
         type="button"
         onClick={() => { setLoading(true); setTimeout(() => { signup('Google Fan', 'google@example.com', 'pass123').then(() => window.location.href = '/fans'); }, 600); }}
         className="flex items-center justify-center gap-2 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-colors cursor-pointer"
        >
         <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.409 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.108c1.96 3.96 6.047 6.632 10.763 6.632 3.211 0 6.081-1.12 8.08-3.231l-4.04-2.764Z"/><path fill="#4A90E2" d="M23.606 12.276c0-.82-.07-1.536-.25-2.228H12v4.61h6.58c-.315 1.554-1.145 2.71-2.26 3.518l4.04 2.764c2.464-2.366 3.246-6.062 3.246-8.664Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.905 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
        </button>
        <button 
         type="button"
         onClick={() => { setLoading(true); setTimeout(() => { signup('Facebook Fan', 'facebook@example.com', 'pass123').then(() => window.location.href = '/fans'); }, 600); }}
         className="flex items-center justify-center gap-2 py-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 rounded-lg transition-colors cursor-pointer"
        >
         <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </button>
        <button 
         type="button"
         onClick={() => { setLoading(true); setTimeout(() => { signup('Apple Fan', 'apple@example.com', 'pass123').then(() => window.location.href = '/fans'); }, 600); }}
         className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-200 border border-transparent rounded-lg transition-colors cursor-pointer"
        >
         <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.246-3.83-1.207.052-2.662.805-3.532 1.818-.688.792-1.35 2.233-1.168 3.61 1.343.104 2.61-.69 3.454-1.598z"/></svg>
        </button>
       </div>
      </>
     )}

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
