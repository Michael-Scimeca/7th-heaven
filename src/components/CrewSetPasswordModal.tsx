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
          background: "rgba(18, 18, 24, 0.45)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
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
          background: "linear-gradient(135deg, #9333ea, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 26,
          boxShadow: "0 0 24px rgba(147, 51, 234, 0.5)",
        }}>
          🔐
        </div>

        {/* Title */}
        <h2 style={{
          color: "#fff", fontWeight: 900, fontSize: 22,
          textAlign: "center", margin: "0 0 6px",
          letterSpacing: "-0.02em"
        }}>
          Set Your Password
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.45)", fontSize: 13,
          textAlign: "center", margin: "0 0 8px", lineHeight: 1.5,
        }}>
          Welcome to the crew! Your account has been created at:
        </p>
        <p style={{
          color: "#c084fc", fontSize: 13, fontWeight: 700,
          textAlign: "center", margin: "0 0 24px",
          background: "rgba(147, 51, 234, 0.12)",
          border: "1px solid rgba(147, 51, 234, 0.3)",
          borderRadius: 8, padding: "6px 12px",
        }}>
          {email}
        </p>
        <p style={{
          color: "rgba(255,255,255,0.4)", fontSize: 12,
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
            <p style={{ color: "#34d399", fontWeight: 700, fontSize: 16 }}>
              Password set! Loading your dashboard…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
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
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "12px 14px",
                color: "#fff", fontSize: 14,
                outline: "none", marginBottom: 16,
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#9333ea")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />

            {/* Confirm Password */}
            <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
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
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "12px 14px",
                color: "#fff", fontSize: 14,
                outline: "none", marginBottom: 20,
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#9333ea")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8, padding: "10px 14px", color: "#f87171",
                fontSize: 13, marginBottom: 16, textAlign: "center",
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
                  : "linear-gradient(135deg, #9333ea, #7c3aed)",
                border: "none", borderRadius: 12, padding: "14px",
                color: "#fff", fontWeight: 800, fontSize: 14,
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: loading ? "none" : "0 0 20px rgba(147, 51, 234, 0.4)",
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
