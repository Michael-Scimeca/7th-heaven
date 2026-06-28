"use client";

import { useState, useEffect } from "react";
import { useMember } from "@/context/MemberContext";
import { isValidEmail } from "@/lib/validation";

/** Convert a display name to a username suggestion: "Jane Doe" → "jane_doe" */
function nameToUsername(n: string): string {
  return n
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')  // strip special chars
    .replace(/\s+/g, '_')           // spaces → underscores
    .replace(/_+/g, '_')            // collapse multiple underscores
    .slice(0, 24);                  // max length
}

export default function LoginModal() {
 const { isModalOpen, closeModal, modalMode, setModalMode, login, signup, openModal } = useMember();
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

 // PIN Verification States
 const [pinSent, setPinSent] = useState(false);
 const [pinCode, setPinCode] = useState("");
 const [signUpPayload, setSignUpPayload] = useState<any>(null);

 // Track if this is an invitation flow
 const [isInviteFlow, setIsInviteFlow] = useState(false);

 useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const inviteEmail = params.get("inviteEmail");
      const invitePin = params.get("invitePin");
      const inviteName = params.get("inviteName");
      if (inviteEmail) {
        setEmail(inviteEmail);
        setIsInviteFlow(true);
        if (inviteName) {
          setName(inviteName);
          // Auto-generate username from name
          setUsernameField(nameToUsername(inviteName));
        }
        setModalMode("signup");
        openModal("signup");
        if (invitePin) {
          setPinCode(invitePin);
        }
      }
    }
  }, [setModalMode, openModal]);

 if (!isModalOpen) return null;

 const handleVerifyPin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (!pinCode || pinCode.length !== 6) {
   setError("Please enter a valid 6-digit verification code.");
   setLoading(false);
   return;
  }

  try {
   const res = await fetch("/api/auth/verify-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     pin: pinCode,
     ...signUpPayload
    }),
   });
   const data = await res.json();
   if (!res.ok || data.error) {
    setError(data.error || "Verification failed.");
   } else {
    // Verification succeeded! Now log the user in to establish the session
    const loginOk = await login(signUpPayload.email, signUpPayload.password);
    if (loginOk) {
     window.location.href = `/fans/${signUpPayload.username || 'me'}`;
    } else {
     setError("Account created, but automatic login failed. Please sign in manually.");
    }
   }
  } catch (err) {
   setError("Failed to verify code. Please try again.");
  }
  setLoading(false);
 };

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
    const stored = JSON.parse(localStorage.getItem("7h_member") || "{}");
    const acctRole = stored.role;
    const acctUsername = stored.username || 'me';
    if (acctRole === 'crew') {
     window.location.href = '/crew';
    } else if (acctRole === 'event_planner') {
     window.location.href = '/planner';
    } else if (acctRole === 'admin') {
     window.location.href = '/admin';
    } else {
     window.location.href = `/fans/${acctUsername}`;
    }
   }
  } else {
   if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
    if (!isValidEmail(email)) { setError("Please enter a valid email address"); setLoading(false); return; }
   if (password.length < 4) { setError("Password must be 4+ characters"); setLoading(false); return; }
   if (wantNotifications && !zipCode.trim()) { setError("Enter your zip code to receive local show alerts"); setLoading(false); return; }
   
   if (website) {
     // Honeypot triggered
     console.warn("Honeypot triggered");
     setLoading(false);
     return;
   }

   // ── Invite flow: skip PIN verification (clicking the email link already proves ownership) ──
   if (isInviteFlow && pinCode && pinCode.length === 6) {
     try {
       const payload = {
         name,
         email,
         password,
         username: usernameField.trim() || nameToUsername(name),
         zip: zipCode,
         wantNotifications,
         wantNewsletter
       };
       const res = await fetch("/api/auth/verify-pin", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           pin: pinCode,
           inviteBypass: true,
           ...payload
         }),
       });
       const data = await res.json();
       if (!res.ok || data.error) {
         setError(data.error || "Account creation failed.");
       } else {
         const loginOk = await login(email, password);
         if (loginOk) {
           window.location.href = `/fans/${payload.username || 'me'}`;
         } else {
           setError("Account created, but automatic login failed. Please sign in manually.");
         }
       }
     } catch (err) {
       setError("Failed to create account. Please try again.");
     }
     setLoading(false);
     return;
   }

   // ── Normal flow: verify existing PIN if user already has one ──
   if (pinCode && pinCode.length === 6) {
     try {
       const payload = {
         name,
         email,
         password,
         username: usernameField.trim(),
         zip: zipCode,
         wantNotifications,
         wantNewsletter
       };
       const res = await fetch("/api/auth/verify-pin", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           pin: pinCode,
           ...payload
         }),
       });
       const data = await res.json();
       if (!res.ok || data.error) {
         setError(data.error || "Verification failed.");
       } else {
         // Verification succeeded! Now log the user in to establish the session
         const loginOk = await login(email, password);
         if (loginOk) {
           window.location.href = `/fans/${payload.username || 'me'}`;
         } else {
           setError("Account created, but automatic login failed. Please sign in manually.");
         }
       }
     } catch (err) {
       setError("Failed to verify code. Please try again.");
     }
     setLoading(false);
     return;
   }

   try {
    const res = await fetch("/api/auth/send-pin", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
     setError(data.error || "Failed to send verification code.");
    } else {
     setSignUpPayload({
      name,
      email,
      password,
      username: usernameField.trim(),
      zip: zipCode,
      wantNotifications,
      wantNewsletter
     });
     setPinSent(true);
    }
   } catch (err) {
    setError("Failed to send verification code. Please try again.");
   }
  }
  setLoading(false);
 };

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple') => {
   setError("");
   setLoading(true);
   try {
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
     provider,
     options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
     },
    });
    if (error) {
     setError(error.message);
     setLoading(false);
    }
   } catch (err) {
    setError("An unexpected error occurred during social login.");
    setLoading(false);
   }
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
       <p className="text-xs uppercase tracking-[0.2em] text-white/30 mt-2">
        {modalMode === "login" ? "Login as Fan or Crew" : isInviteFlow ? "Complete Your Profile" : "Join the Family"}
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
      <div className="mb-6">
       <div className="flex items-center justify-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg p-1">
        <button
         type="button"
         onClick={() => setLoginRole('fan')}
         className={`flex-1 py-2 text-xs font-bold uppercase tracking-[0.12em] rounded-md transition-all cursor-pointer ${
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
         className={`flex-1 py-2 text-xs font-bold uppercase tracking-[0.12em] rounded-md transition-all cursor-pointer ${
          loginRole === 'crew'
           ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
           : 'text-white/30 hover:text-white/50'
         }`}
        >
         🛡️ Crew
        </button>
       </div>
       <div className="text-center mt-3">
        <a
         href="/admin"
         onClick={closeModal}
         className="text-[10px] uppercase tracking-widest font-black text-white/35 hover:text-[var(--color-accent)] hover:brightness-110 transition-colors"
        >
         🔐 Sign In as Admin
        </a>
       </div>
      </div>
     )}

      {pinSent ? (
       <form onSubmit={handleVerifyPin} className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease]" autoComplete="off">
        <div className="text-center mb-4">
         <div className="w-12 h-12 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 rounded-full flex items-center justify-center mx-auto mb-3 text-lg">
          🔑
         </div>
         <h3 className="text-lg font-bold">Verify Your Email</h3>
         <p className="text-white/40 text-xs mt-1 leading-relaxed">
          We sent a 6-digit confirmation code to <br />
          <strong className="text-white">{signUpPayload?.email}</strong>.
         </p>
        </div>

        <div>
         <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1 block text-center">Verification Code</label>
         <input
          type="text"
          value={pinCode}
          onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-lg tracking-[0.4em] font-mono text-center text-white placeholder:text-white/10 outline-none focus:border-[var(--color-accent)] transition-colors"
          maxLength={6}
          required
         />
        </div>

        {error && (
         <p className="text-xs text-rose-400 bg-rose-400/10 px-3 py-2 border border-rose-400/20 text-center">{error}</p>
        )}

        <button
         type="submit"
         disabled={loading}
         className="w-full py-3.5 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-[0.15em] hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(133,29,239,0.3)]"
        >
         {loading ? "..." : "Verify Code"}
        </button>

        <div className="flex justify-between items-center mt-2 text-2xs">
         <button
          type="button"
          onClick={async () => {
            setError("");
            setLoading(true);
            try {
              const res = await fetch("/api/auth/send-pin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: signUpPayload.email }),
              });
              if (res.ok) {
                setError("A new code has been sent!");
              } else {
                setError("Failed to resend code.");
              }
            } catch {
              setError("Failed to resend code.");
            }
            setLoading(false);
          }}
          className="text-white/40 hover:text-white underline cursor-pointer"
         >
          Resend Code
         </button>

         <button
          type="button"
          onClick={() => {
            setPinSent(false);
            setPinCode("");
            setError("");
          }}
          className="text-white/40 hover:text-white underline cursor-pointer"
         >
          Back to Sign Up
         </button>
        </div>
       </form>
      ) : confirmationRequired ? (
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
         className="w-full py-3 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer"
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
          <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1 block">Full Name {isInviteFlow && <span className="text-[var(--color-accent)]/60">✓ on file</span>}</label>
          <input
           type="text"
           value={name}
           onChange={(e) => setName(e.target.value)}
           placeholder="Your name"
           readOnly={isInviteFlow && !!name}
           className={`w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors ${isInviteFlow && name ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
         </div>

        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1 block">Username <span className="text-white/20 normal-case tracking-normal">(optional)</span></label>
          <input
           type="text"
           value={usernameField}
           onChange={(e) => setUsernameField(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
           placeholder={name ? nameToUsername(name) : 'e.g. rocknroller_7h'}
           maxLength={24}
           className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors"
          />
          <p className="text-2xs text-white/20 mt-1">Letters, numbers &amp; underscores only. {isInviteFlow && usernameField ? 'Change it or keep the suggestion.' : 'This is your display handle.'}</p>
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
           <span className="text-sm text-white/70 leading-tight text-left">
            📍 Notify me when 7th Heaven books a show near me
           </span>
          </button>

          {/* Zip code — only if opted in */}
          {wantNotifications && (
           <div>
            <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1 block">Zip Code</label>
            <input
             type="text"
             value={zipCode}
             onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
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
           <span className="text-sm text-white/70 leading-tight text-left">
            📧 Send me news, show updates & exclusive drops
           </span>
          </button>
         </div>
        )}
       </>
      )}

      <div>
       <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1 block">Email {isInviteFlow && <span className="text-[var(--color-accent)]/60">✓ on file</span>}</label>
       <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        autoComplete="off"
        readOnly={isInviteFlow}
        data-lpignore="true"
        data-form-type="other"
        className={`w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors ${isInviteFlow ? 'opacity-60 cursor-not-allowed' : ''}`}
       />
      </div>

      <div>
       <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1 block">Password</label>
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

      {modalMode === "signup" && !isInviteFlow && (
       <div>
        <label className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1 block">
         Invitation PIN <span className="text-white/20">(Optional)</span>
        </label>
        <input
         type="text"
         value={pinCode}
         onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
         placeholder="6-digit PIN from email"
         maxLength={6}
         className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors font-mono tracking-[0.15em]"
        />
        <p className="text-2xs text-white/20 mt-1">If you received an invitation email, enter your 6-digit PIN here.</p>
       </div>
      )}

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
       <p className="text-xs text-white/25 text-center mt-3 leading-relaxed">
        By creating an account, you confirm you are 13 years of age or older and agree to our <a href="/privacy" className="underline hover:text-white/40 transition-colors">Privacy Policy</a> and <a href="/terms" className="underline hover:text-white/40 transition-colors">Terms of Service</a>.
       </p>
      )}
     </form>
     )}

     {/* OAuth Social Login for Fans */}
     {loginRole === 'fan' && (
      <>
       <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs uppercase tracking-widest text-white/30 font-bold">Or continue with</span>
        <div className="flex-1 h-px bg-white/10" />
       </div>
       
       <div className="grid grid-cols-3 gap-3">
        <button 
         type="button"
         onClick={() => handleOAuthLogin('google')}
         className="flex items-center justify-center gap-2 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-colors cursor-pointer"
        >
         <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.409 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.108c1.96 3.96 6.047 6.632 10.763 6.632 3.211 0 6.081-1.12 8.08-3.231l-4.04-2.764Z"/><path fill="#4A90E2" d="M23.606 12.276c0-.82-.07-1.536-.25-2.228H12v4.61h6.58c-.315 1.554-1.145 2.71-2.26 3.518l4.04 2.764c2.464-2.366 3.246-6.062 3.246-8.664Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.905 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
        </button>
        <button 
         type="button"
         onClick={() => handleOAuthLogin('facebook')}
         className="flex items-center justify-center gap-2 py-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 rounded-lg transition-colors cursor-pointer"
        >
         <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </button>
        <button 
         type="button"
         onClick={() => handleOAuthLogin('apple')}
         className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-200 border border-transparent rounded-lg transition-colors cursor-pointer"
        >
         <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.246-3.83-1.207.052-2.662.805-3.532 1.818-.688.792-1.35 2.233-1.168 3.61 1.343.104 2.61-.69 3.454-1.598z"/></svg>
        </button>
       </div>
      </>
     )}

     {modalMode === "login" && (
      <p className="text-center text-xs text-white/30 mt-6">
       Don&apos;t have an account?{" "}
       <button onClick={() => setModalMode("signup")} className="text-[var(--color-accent)] hover:text-white transition-colors cursor-pointer">
        Sign up free
       </button>
      </p>
     )}

      {/* Dev Quick Logins */}
      {process.env.NODE_ENV === 'development' && modalMode === 'login' && (
        <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-extrabold text-center">🛠️ Dev Quick Logins</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setEmail("admin@7thheaven.com"); setPassword("password123"); }}
              className="py-2 px-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-purple-300 hover:text-white transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <span>🔑 Admin</span>
              <span className="opacity-40 text-[9px] font-mono">admin</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail("crew@7thheaven.com"); setPassword("password123"); }}
              className="py-2 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-emerald-300 hover:text-white transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <span>🔑 Crew</span>
              <span className="opacity-40 text-[9px] font-mono">crew</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail("planner@7thheaven.com"); setPassword("password123"); }}
              className="py-2 px-2.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-fuchsia-300 hover:text-white transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <span>🔑 Planner</span>
              <span className="opacity-40 text-[9px] font-mono">planner</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail("fan@7thheaven.com"); setPassword("password123"); }}
              className="py-2 px-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-blue-300 hover:text-white transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <span>🔑 Fan</span>
              <span className="opacity-40 text-[9px] font-mono">fan</span>
            </button>
          </div>
        </div>
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
