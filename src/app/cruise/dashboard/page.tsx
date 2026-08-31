"use client";
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import { useMember } from "@/context/MemberContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPhoneDisplay } from "@/lib/validation";

export default function CruiseDashboardGate() {
  const { isLoggedIn, member, login, signup } = useMember();
  const router = useRouter();
  const supabase = createClient();

  // Auth panel states
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // If already logged in, redirect immediately to the username dashboard
  useEffect(() => {
    if (isLoggedIn && member?.username) {
      router.replace(`/cruise/${member.username}`);
    } else if (isLoggedIn && member) {
      const fallbackUsername = member.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'cruiser';
      router.replace(`/cruise/${fallbackUsername}`);
    }
  }, [isLoggedIn, member, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('bypass') === 'true' || urlParams.get('demo') === 'true') {
        window.location.replace('/cruise/demo?bypass=true');
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Email and Password are required.');
      return;
    }
    setSubmitting(true);
    setAuthError('');
    try {
      const success = await login(email, password);
      if (!success) {
        setAuthError('Invalid email or password.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during log in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setAuthError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    setAuthError('');
    try {
      const res = await fetch('/api/cruise/register-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          name,
          email,
          phone,
          password
        })
      });

      if (res.ok) {
        const data = await res.json();
        setVerifyingPin(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || 'Failed to submit registration request.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput) {
      setAuthError('PIN code is required.');
      return;
    }
    setSubmitting(true);
    setAuthError('');
    try {
      const res = await fetch('/api/cruise/register-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          email,
          pin: pinInput
        })
      });

      if (res.ok) {
        const data = await res.json();
        const success = await login(email, password);
        if (success) {
          setVerifyingPin(false);
          setPinInput('');
        } else {
          setAuthError('Verification successful, but automatic log in failed. Please sign in via the Log In tab.');
          setVerifyingPin(false);
          setAuthTab('login');
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || 'Verification failed.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during verification.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2  border-white/10  border-t-cyan-400 rounded-lg animate-spin mx-auto mb-4" />
          <p className="font-bold uppercase   ">Redirecting to Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--color-accent)]/5 rounded-lg blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-lg blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-[fadeIn_0.3s_ease-out]">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4 animate-[bounce_2s_infinite]">🚢</span>
          <h1 className="text-2xl font-bold uppercase    text-white">Cruise Hub</h1>
          <p className="text-purple-400font-bold uppercase    mt-1">Exclusive Passenger Community</p>
        </div>

        <div className="bg-[var(--color-bg-surface)]/80 backdrop-blur-xl border  border-white/10  overflow-hidden">
          {verifyingPin ? (
            <div className="p-8 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-center mb-6">
                <span className="text-4xl block mb-3 animate-[pulse_1.5s_infinite]">🔑</span>
                <h3 className="font-bold text-white uppercase  mb-2">Verify Your Email</h3>
                <p className="leading-relaxed">
                  We've sent a 6-digit verification PIN to <strong className="text-cyan-400">{email}</strong>. Enter it below to activate your account.
                </p>
              </div>

              <form onSubmit={handleVerifyPinSubmit} className="space-y-4">
                <div>
                  <label htmlFor="cruise-pin-input" className="block   font-bold text-white/40 uppercase    mb-1.5">6-Digit Verification PIN</label>
                  <input aria-label="Input field"
                    id="cruise-pin-input"
                    type="text"
                    required
                    placeholder="123456"
                    maxLength={6}
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[var(--color-bg-card)] border  border-white/10  px-4 py-3 text-center text-lg font-bold tracking-[0.3em] text-white focus:border-cyan-400/50 outline-none transition-colors"
                  />
                </div>

                {authError && <p className="text-rose-400 mt-2 text-center">{authError}</p>}

                <button aria-label="Action button" type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase    transition-colors shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  {submitting ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-lg animate-spin" /> : "Verify PIN & Access Hub →"}
                </button>

                <div className="text-center mt-4">
                  <button aria-label="Action button" type="button" onClick={() => { setVerifyingPin(false); setAuthError(''); }} className="text-white/40 hover: text-white text-[var(--font-size-2xs)] font-bold uppercase    transition-colors cursor-pointer">
                    ← Cancel and Back
                  </button>
                </div>
              </form>
            </div>
          ) : regSuccess ? (
            <div className="p-8 text-center animate-[fadeIn_0.3s_ease-out]">
              <span className="text-4xl block mb-4">📧</span>
              <h3 className="font-bold text-white uppercase  mb-2">Check Your Email</h3>
              <p className="leading-relaxed mb-6">
                We've sent a verification link to <strong className="text-white">{email}</strong>. Please check your inbox and click the link to activate your Cruise Hub account.
              </p>
              <button aria-label="Action button" onClick={() => { setRegSuccess(false); setAuthTab('login'); }} className="w-full py-2.5 bg-[#00000029] border  border-white/10  text-white/80 hover:bg-white/10 hover:text-white font-bold uppercase    transition-colors cursor-pointer">
                Go to Log In
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button aria-label="Action button" onClick={() => { setAuthTab('login'); setAuthError(''); }} className={`flex-1 py-4 font-bold uppercase    transition-colors cursor-pointer ${authTab === 'login' ? 'border-b-2 border-cyan-400 text-white bg-white/[0.02]' : 'text-white/40 hover:text-white/70'}`}>
                  Log In
                </button>
                <button aria-label="Action button" onClick={() => { setAuthTab('register'); setAuthError(''); }} className={`flex-1 py-4 font-bold uppercase    transition-colors cursor-pointer ${authTab === 'register' ? 'border-b-2 border-cyan-400 text-white bg-white/[0.02]' : 'text-white/40 hover:text-white/70'}`}>
                  Register
                </button>
              </div>

              <div className="p-6 md:p-8">
                {authTab === 'login' ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <p className="mb-4">Sign in using your Cruise Hub credentials to access your booking, lounge chat, and itinerary.</p>
                    <div>
                      <label htmlFor="cruise-login-email" className="block   font-bold text-white/40 uppercase    mb-1.5">Email Address</label>
                      <input aria-label="Input field" id="cruise-login-email" type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[var(--color-bg-card)] border  border-white/10  px-4 py-3 text-white focus:border-cyan-400/50 outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="cruise-login-password" className="block   font-bold text-white/40 uppercase    mb-1.5">Password</label>
                      <input aria-label="Input field" id="cruise-login-password" type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[var(--color-bg-card)] border  border-white/10  px-4 py-3 text-white focus:border-cyan-400/50 outline-none transition-colors" />
                    </div>

                    {authError && <p className="text-rose-400 mt-2">{authError}</p>}

                    <button aria-label="Action button" type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase    transition-colors shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                      {submitting ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-lg animate-spin" /> : "Access Cruise Hub →"}
                    </button>

                    <div className="pt-3 border-t  border-white/10  mt-4">
                      <button
                        type="button"
                        onClick={() => router.replace('/cruise/demo')}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer rounded-lg"
                      >
                        ⚡ Instant Demo Access
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <p className="mb-4">Sign up as a Cruise Member to register for the priority booking list and unlock access to the hub.</p>
                    <div>
                      <label htmlFor="cruise-reg-name" className="block   font-bold text-white/40 uppercase    mb-1.5">Full Legal Name *</label>
                      <input aria-label="Input field" id="cruise-reg-name" type="text" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[var(--color-bg-card)] border  border-white/10  px-4 py-3 text-white focus:border-cyan-400/50 outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="cruise-reg-email" className="block   font-bold text-white/40 uppercase    mb-1.5">Email Address *</label>
                      <input aria-label="Input field" id="cruise-reg-email" type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[var(--color-bg-card)] border  border-white/10  px-4 py-3 text-white focus:border-cyan-400/50 outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="cruise-reg-phone" className="block   font-bold text-white/40 uppercase    mb-1.5">Phone Number *</label>
                      <input aria-label="Input field" id="cruise-reg-phone" type="tel" required placeholder="(555) 123-4567" value={phone} onChange={e => setPhone(formatPhoneDisplay(e.target.value))} className="w-full bg-[var(--color-bg-card)] border  border-white/10  px-4 py-3 text-white focus:border-cyan-400/50 outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="cruise-reg-password" className="block   font-bold text-white/40 uppercase    mb-1.5">Choose Password *</label>
                      <input aria-label="Input field" id="cruise-reg-password" type="password" required placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[var(--color-bg-card)] border  border-white/10  px-4 py-3 text-white focus:border-cyan-400/50 outline-none transition-colors" />
                    </div>

                    {authError && <p className="text-rose-400 mt-2">{authError}</p>}

                    <button aria-label="Action button" type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-[var(--color-accent)] hover:brightness-110 text-white font-bold uppercase    transition-colors shadow-[var(--color-accent)]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                      {submitting ? <span className="w-4 h-4 border-2  border-white/10  border-t-white rounded-lg animate-spin" /> : "Register & Access Hub →"}
                    </button>

                    <div className="pt-3 border-t  border-white/10  mt-4">
                      <button
                        type="button"
                        onClick={() => router.replace('/cruise/demo')}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer rounded-lg"
                      >
                        ⚡ Instant Demo Access →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/cruise" className="text-white/40 hover: text-white font-bold uppercase    transition-colors">
            ← Back to Cruise Information
          </Link>
        </div>
      </div>
    </div>
  );
}
