"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

interface CrewSetPasswordModalProps {
  email: string;
  onComplete: () => void;
}

/**
 * Shown to new crew members on their first login.
 * Admin creates their account with a temp password; this modal lets them
 * set their own permanent password before accessing the dashboard.
 */
export function CrewSetPasswordModal({ email, onComplete }: CrewSetPasswordModalProps) {
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);

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
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        padding: "16px",
      }}
    >
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
      <div 
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      {/* Glass Card */}
      <div
        style={{
          background: "var(--color-bg-glass)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid var(--color-border-main)",
          borderRadius: "24px",
          padding: "36px 32px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 30px 90px rgba(0, 0, 0, 0.6)",
          position: "relative",
          zIndex: 10,
          overflow: "hidden",
        }}
      >

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--color-purple-primary), var(--color-purple-hover))",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 26,
          boxShadow: "0 0 24px var(--color-purple-glow)",
        }}>
          🔐
        </div>

        {/* Title */}
        <h2 style={{
          color: "var(--color-text-main)", fontWeight: 900, fontSize: "var(--font-size-lg)",
          textAlign: "center", margin: "0 0 6px",
          letterSpacing: "-0.02em"
        }}>
          Set Your Password
        </h2>
        <p style={{
          color: "var(--color-text-subtle)", fontSize: "var(--font-size-md)",
          textAlign: "center", margin: "0 0 8px", lineHeight: 1.5,
        }}>
          Welcome to the crew! Your account has been created at:
        </p>
        <p style={{
          color: "var(--color-purple-light)", fontSize: "var(--font-size-md)", fontWeight: 700,
          textAlign: "center", margin: "0 0 24px",
          background: "rgba(147, 51, 234, 0.12)",
          border: "1px solid var(--color-border-purple)",
          borderRadius: 8, padding: "6px 12px",
        }}>
          {email}
        </p>
        <p style={{
          color: "var(--color-text-subtle)", fontSize: "var(--font-size-sm)",
          textAlign: "center", margin: "-12px 0 24px",
          lineHeight: 1.5,
        }}>
          Create your own password to continue.
        </p>

        {success ? (
          <div style={{
            textAlign: "center", padding: "20px 0",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ color: "var(--color-success-light)", fontWeight: 700, fontSize: "var(--font-size-base)" }}>
              Password set! Loading your dashboard…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <label style={{ display: "block", color: "var(--color-text-subtle)", fontSize: "var(--font-size-xs)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-border-main)",
                borderRadius: 10, padding: "12px 14px",
                color: "var(--color-text-main)", fontSize: "var(--font-size-md)",
                outline: "none", marginBottom: 16,
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--color-purple-primary)")}
              onBlur={e => (e.target.style.borderColor = "var(--color-border-main)")}
            />

            {/* Confirm Password */}
            <label style={{ display: "block", color: "var(--color-text-subtle)", fontSize: "var(--font-size-xs)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              required
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-border-main)",
                borderRadius: 10, padding: "12px 14px",
                color: "var(--color-text-main)", fontSize: "var(--font-size-md)",
                outline: "none", marginBottom: 20,
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--color-purple-primary)")}
              onBlur={e => (e.target.style.borderColor = "var(--color-border-main)")}
            />

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8, padding: "10px 14px", color: "var(--color-error-light)",
                fontSize: "var(--font-size-md)", marginBottom: 16, textAlign: "center",
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading
                  ? "rgba(147, 51, 234, 0.3)"
                  : "linear-gradient(135deg, var(--color-purple-primary), var(--color-purple-hover))",
                border: "none", borderRadius: 12, padding: "14px",
                color: "var(--color-text-main)", fontWeight: 800, fontSize: "var(--font-size-md)",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s, box-shadow 0.2s",
                boxShadow: loading ? "none" : "0 0 20px var(--color-purple-glow)",
                letterSpacing: 1,
              }}
            >
              {loading ? "Setting Password…" : "Set My Password →"}
            </button>
          </form>
        )}

        {/* Bottom note */}
        <p style={{
          color: "rgba(255,255,255,0.25)", fontSize: 11,
          textAlign: "center", marginTop: 20,
        }}>
          🔒 This step is required before accessing your crew dashboard
        </p>
      </div>
    </div>
  );
}
