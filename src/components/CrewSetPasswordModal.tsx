"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { GlowInput } from "@/components/GlowInput";

interface CrewSetPasswordModalProps {
  email: string;
  onComplete: () => void;
}

/**
 * Shown to new crew members on their first login.
 * Admin creates their account with a temp password; this modal lets them
 * set their own permanent password before accessing the dashboard.
 */
export function CrewSetPasswordModal({
  email,
  onComplete,
}: CrewSetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Update the Supabase auth password
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;

      // Clear the needs_password_reset flag from user metadata
      await supabase.auth.updateUser({
        data: { needs_password_reset: false },
      });

      setSuccess(true);
      setTimeout(() => onComplete(), 1800);
    } catch (err: any) {
      setError(err?.message || "Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Blurred Hero Background Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 scale-[1.08] bg-[url('/images/hero/hero-band-bg.png')] bg-cover bg-center brightness-35 blur-[10px]"
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/55 backdrop-blur-md" />

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black/60 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-2xl shadow-[0_0_24px_rgba(168,85,247,0.5)]">
          🔐
        </div>

        {/* Title */}
        <h2 className="mb-1.5 text-center text-white">
          Set Your Password
        </h2>
        <p className="mb-2 text-center text-sm text-white/60">
          Welcome to the crew! Your account has been created at:
        </p>
        <p className="mb-6 rounded-[var(--radius-box)] border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-center text-sm font-bold text-purple-400">
          {email}
        </p>
        <p className="-mt-3 mb-6 text-center text-xs text-white/40">
          Create your own password to continue.
        </p>

        {success ? (
          <div className="py-5 text-center">
            <div className="mb-3 text-4xl">✅</div>
            <p className="text-base font-bold text-emerald-400">
              Password set! Loading your dashboard…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="crew-set-new-password"
                className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-white/60"
              >
                New Password
              </label>
              <GlowInput
                id="crew-set-new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
                wrapperClassName="w-full"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="crew-set-confirm-password"
                className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-white/60"
              >
                Confirm Password
              </label>
              <GlowInput
                id="crew-set-confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
                wrapperClassName="w-full"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-[var(--radius-box)] border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-center text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full cursor-pointer rounded-[var(--radius-box)] py-3.5 text-sm font-extrabold uppercase tracking-wider text-white transition-[background-color,box-shadow] ${
                loading
                  ? "cursor-not-allowed bg-purple-500/30 shadow-none"
                  : "bg-gradient-to-r from-purple-600 to-purple-700 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:from-purple-500 hover:to-purple-600"
              }`}
            >
              {loading ? "Setting Password…" : "Set My Password →"}
            </button>
          </form>
        )}

        {/* Bottom note */}
        <p className="mt-5 text-center text-[11px] text-white/25">
          🔒 This step is required before accessing your crew dashboard
        </p>
      </div>
    </div>
  );
}
