"use client";

import { useState } from "react";
import { useMember } from "@/context/MemberContext";

export default function LoginModal() {
 const { isModalOpen, closeModal, modalMode, setModalMode, login, signup } = useMember();
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [zipCode, setZipCode] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 if (!isModalOpen) return null;

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (modalMode === "login") {
   const ok = await login(email, password);
   if (!ok) setError("Account not found. Sign up first!");
  } else {
   if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
   if (!email.includes("@")) { setError("Valid email required"); setLoading(false); return; }
   if (password.length < 4) { setError("Password must be 4+ characters"); setLoading(false); return; }
   if (!zipCode.trim()) { setError("Zip code required for show radius alerts"); setLoading(false); return; }
   await signup(name, email, password);
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

     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
         <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 flex justify-between items-baseline">
          <span>Zip Code <span className="text-[var(--color-accent)]">*</span></span>
          <span className="text-[0.5rem] tracking-normal normal-case opacity-50">Required for local show alerts</span>
         </label>
         <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="e.g. 60601"
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors"
         />
        </div>
        </>
       )}

      <div>
       <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block">Email</label>
       <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
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

     {modalMode === "signup" && (
      <div className="mt-6 p-4 bg-[rgba(133,29,239,0.06)] border border-[var(--color-accent)]/20">
       <p className="text-[0.65rem] text-white/50 leading-relaxed">
        <span className="text-[var(--color-accent)] font-bold">📍 Proximity Radius:</span> We use your zip code to notify you when we book shows in your area. Never miss a local show again!
       </p>
      </div>
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
