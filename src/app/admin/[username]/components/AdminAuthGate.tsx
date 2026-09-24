import React from "react";

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
    <main
      id="admin-auth-gate-page"
      className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] p-4"
    >
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[var(--color-bg-surface)] p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-purple-500/10 text-2xl">
          🔒
        </div>
        <h1 className="mb-2">
          {isWrongRole ? "Access Restricted" : "Admin Authorization"}
        </h1>
        <p className="mb-6">
          {isWrongRole
            ? "Your current account does not have Admin privileges."
            : "Sign in with an administrative account to view management console."}
        </p>

        <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="admin-gate-email" className="text-4xs mb-1.5 block">
              Email
            </label>
            <input
              id="admin-gate-email"
              type="email"
              value={adminLoginEmail}
              onChange={(e) => setAdminLoginEmail(e.target.value)}
              placeholder="admin@7thheaven.com"
              autoComplete="email"
              className="w-full rounded-lg border border-white/10 bg-black/60 px-4 py-2.5 placeholder-white/30 transition-colors outline-none focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="admin-gate-password"
              className="text-4xs mb-1.5 block"
            >
              Password
            </label>
            <input
              id="admin-gate-password"
              type="password"
              value={adminLoginPassword}
              onChange={(e) => setAdminLoginPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-lg border border-white/10 bg-black/60 px-4 py-2.5 placeholder-white/30 transition-colors outline-none focus:border-purple-500"
              required
            />
          </div>

          {adminLoginError && (
            <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-center text-rose-400">
              {adminLoginError}
            </p>
          )}

          <button
            type="submit"
            disabled={adminLoginLoading}
            className="btn-primary w-full cursor-pointer rounded-lg py-3 disabled:opacity-50"
          >
            {adminLoginLoading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-white/40">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="cursor-pointer border-none p-0 text-white/40 transition-colors hover:text-white"
          >
            ← Back to Home
          </button>
          <button
            type="button"
            onClick={() => openModal("login")}
            className="cursor-pointer border-none p-0 text-purple-400 transition-colors hover:text-purple-300"
          >
            Switch Account
          </button>
        </div>
      </div>
    </main>
  );
}
