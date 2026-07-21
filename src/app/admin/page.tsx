"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMember } from "@/context/MemberContext";

export default function AdminGatewayPage() {
  const router = useRouter();
  const { member, isLoggedIn, login, logout, hydrated } = useMember();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Handle redirect if logged in as admin
  useEffect(() => {
    if (hydrated && isLoggedIn && member?.role === 'admin' && member.username) {
      router.replace(`/admin/${member.username}`);
    }
  }, [hydrated, isLoggedIn, member, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);

    const ok = await login(adminEmail, adminPassword);
    if (!ok) {
      setAdminLoginError('Invalid credentials. Please check your email and password.');
      setAdminLoginLoading(false);
      return;
    }
    setAdminLoginLoading(false);
  };

  // Support local storage dev bypass
  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') {
      const devBypass = localStorage.getItem('7h_dev_bypass') === 'true';
      if (devBypass) {
        router.replace(`/admin/admin`);
      }
    }
  }, [hydrated, router]);

  if (!hydrated) {
    return <div className="min-h-screen bg-[#050508]" />;
  }

  // If logged in as admin, show loading while redirect takes place
  if (isLoggedIn && member?.role === 'admin') {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--color-accent)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

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
                <div className="flex flex-col gap-3">
                  <Link href="/fans" className="text-[0.65rem] text-[var(--color-accent)] hover:text-white uppercase tracking-[0.15em] font-bold transition-colors">
                    ← Back to Fan Dashboard
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-[0.65rem] text-red-400 hover:text-red-300 uppercase tracking-[0.15em] font-bold transition-colors cursor-pointer"
                  >
                    Sign Out & Switch Account
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="flex flex-col gap-4" autoComplete="off" data-form-type="other">
                <div>
                  <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@7thheaven.com"
                    autoComplete="off"
                    data-lpignore="true"
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
                    autoComplete="new-password"
                    data-lpignore="true"
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
