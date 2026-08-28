import React from 'react';

interface AdminAuthGateProps {
  isWrongRole: boolean;
  adminLoginEmail: string;
  setAdminLoginEmail: (val: string) => void;
  adminLoginPassword: string;
  setAdminLoginPassword: (val: string) => void;
  adminLoginError: string;
  adminLoginLoading: boolean;
  handleAdminLoginSubmit: (e: React.FormEvent) => void;
  openModal: (mode?: any, role?: any) => void;
  router: any;
}

export function AdminAuthGate({
  isWrongRole,
  adminLoginEmail,
  setAdminLoginEmail,
  adminLoginPassword,
  setAdminLoginPassword,
  adminLoginError,
  adminLoginLoading,
  handleAdminLoginSubmit,
  openModal,
  router,
}: AdminAuthGateProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--color-bg-surface)] border border-white/10 p-8 rounded-lg shadow-2xl text-center">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-6 text-2xl">
          🔒
        </div>
        <h1 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
          {isWrongRole ? "Access Restricted" : "Admin Authorization"}
        </h1>
        <p className="mb-6">
          {isWrongRole
            ? "Your current account does not have Admin privileges."
            : "Sign in with an administrative account to view management console."}
        </p>

        <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="admin-gate-email" className="text-4xs uppercase tracking-widest font-bold text-white mb-1.5 block">Email</label>
            <input
              id="admin-gate-email"
              type="email"
              value={adminLoginEmail}
              onChange={(e) => setAdminLoginEmail(e.target.value)}
              placeholder="admin@7thheaven.com"
              className="w-full px-4 py-2.5 bg-black/60 border border-white/10 text-white placeholder-white/30 rounded-lg outline-none focus:border-purple-500 transition-colors font-bold"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-gate-password" className="text-4xs uppercase tracking-widest font-bold text-white mb-1.5 block">Password</label>
            <input
              id="admin-gate-password"
              type="password"
              value={adminLoginPassword}
              onChange={(e) => setAdminLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-black/60 border border-white/10 text-white placeholder-white/30 rounded-lg outline-none focus:border-purple-500 transition-colors font-bold"
              required
            />
          </div>

          {adminLoginError && (
            <p className="text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-center">
              {adminLoginError}
            </p>
          )}

          <button
            type="submit"
            disabled={adminLoginLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {adminLoginLoading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-white/40">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-white/40"
          >
            ← Back to Home
          </button>
          <button
            type="button"
            onClick={() => openModal('login')}
            className="hover:text-purple-300 transition-colors cursor-pointer bg-transparent border-none p-0 text-purple-400 font-bold"
          >
            Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
