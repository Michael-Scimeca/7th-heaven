"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, redirect } from "next/navigation";
import { useMember } from "@/context/MemberContext";

const MODAL_GLASS_STYLE: React.CSSProperties = {
  background: "var(--color-bg-glass)",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  border: "1px solid var(--color-border-main)",
};

export default function AdminGatewayPage() {
  const router = useRouter();
  const { member, isLoggedIn, login, logout, hydrated } = useMember();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Disable page scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Handle redirect if logged in as admin
  if (hydrated && isLoggedIn && member?.role === 'admin' && member.username) {
    redirect(`/admin/${member.username}`);
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);

    try {
      const ok = await login(adminEmail, adminPassword);
      if (!ok) {
        setAdminLoginError('Invalid credentials. Please check your email and password.');
      }
    } finally {
      setAdminLoginLoading(false);
    }
  };

  // Support local storage dev bypass
  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') {
      const devBypass = localStorage.getItem('7h_dev_bypass') === 'true';
      if (devBypass) {
        window.location.replace('/admin/admin');
      }
    }
  }, [hydrated]);

  if (!hydrated) {
    return <div className="min-h-screen bg-[var(--color-bg-deep)]" />;
  }

  // If logged in as admin, show loading while redirect takes place
  if (isLoggedIn && member?.role === 'admin') {
    return (
      <div className="fixed inset-0 h-screen w-screen bg-[#030305] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const isWrongRole = isLoggedIn && member?.role !== 'admin';

  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#030305] text-white flex items-center justify-center px-6 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          height: 100vh !important;
          max-height: 100vh !important;
          touch-action: none !important;
        }
      `}</style>

      {/* Blurred Hero Background Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('/images/hero-band-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.35) blur(10px)",
          transform: "scale(1.08)",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />
      <div className="fixed inset-0 bg-black/55 backdrop-blur-md z-0 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div
          className="rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out"
          style={MODAL_GLASS_STYLE}
        >
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 bg-purple-600/10 border border-purple-500/30 flex items-center justify-center  text-[var(--color-accent)] shadow-[0_0_24px_rgba(147,51,234,0.4)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase italic">
                Admin <span className=" text-[var(--color-accent)] not-italic">Access</span>
              </h1>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40 font-black mt-2">
                Restricted — Authorized personnel only
              </p>
            </div>

            {isWrongRole ? (
              <div className="text-center">
                <div className="p-5 bg-purple-600/10 border border-purple-500/30 mb-6">
                  <p className="text-sm font-bold  text-[var(--color-accent)] mb-1">Access Denied</p>
                  <p className="text-[0.7rem] text-white/70 font-semibold">
                    You&apos;re logged in as <strong className="text-white font-extrabold">{member?.name}</strong> ({member?.role}).
                    Admin privileges are required to access this dashboard.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/fans" className="text-[0.65rem]  text-[var(--color-accent)] hover:text-purple-300 uppercase tracking-[0.15em] font-black transition-colors">
                    ← Back to Fan Dashboard
                  </Link>
                  <button aria-label="Action button"
                    onClick={() => logout()}
                    className="text-[0.65rem] text-rose-400 hover:text-rose-300 uppercase tracking-[0.15em] font-black transition-colors cursor-pointer"
                  >
                    Sign Out & Switch Account
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="flex flex-col gap-4" autoComplete="off" data-form-type="other">
                <div>
                  <label htmlFor="root-admin-login-email" className="text-[0.65rem] uppercase tracking-[0.15em] text-white/50 mb-1.5 block font-bold">Email</label>
                  <input aria-label="Input field"
                    id="root-admin-login-email"
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@7thheaven.com"
                    autoComplete="off"
                    data-lpignore="true"
                    className="w-full px-4 py-3 bg-black/50 border border-white/15 text-sm font-semibold text-white placeholder:text-white/30 outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(147,51,234,0.3)] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="root-admin-login-password" className="text-[0.65rem] uppercase tracking-[0.15em] text-white/50 mb-1.5 block font-bold">Password</label>
                  <input aria-label="Input field"
                    id="root-admin-login-password"
                    type="password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    data-lpignore="true"
                    className="w-full px-4 py-3 bg-black/50 border border-white/15 text-sm font-semibold text-white placeholder:text-white/30 outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(147,51,234,0.3)] transition-colors"
                    required
                  />
                </div>

                {adminLoginError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 border border-rose-500/20 font-bold rounded-lg text-center">{adminLoginError}</p>
                )}

                <button aria-label="Action button"
                  type="submit"
                  disabled={adminLoginLoading}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)]"
                >
                  {adminLoginLoading ? "Authenticating..." : "Sign In as Admin"}
                </button>

                {process.env.NODE_ENV === "development" && (
                  <button aria-label="Action button"
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("7h_dev_bypass", "true");
                        router.replace("/admin/admin");
                      }
                    }}
                    className="w-full py-3 border border-purple-500/30 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-black text-xs uppercase tracking-[0.15em] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>⚡</span> Instant Dev Access (Bypass Login)
                  </button>
                )}
              </form>
            )}

            <p className="mt-8 text-center text-[0.6rem] text-white/20 font-bold uppercase tracking-[0.2em]">
              7th Heaven · System Administration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
