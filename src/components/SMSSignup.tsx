"use client";

import { useState } from "react";

export default function SMSSignup() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/sms/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, zipCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setPhone("");
        setName("");
        setZipCode("");
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">You&apos;re In!</h3>
        <p className="text-sm text-white/60">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name */}
        <div>
          <label htmlFor="sms-name" className="block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5">
            Name
          </label>
          <input
            id="sms-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-white/20"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="sms-phone" className="block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5">
            Phone Number <span className="text-[var(--color-accent)]">*</span>
          </label>
          <input
            id="sms-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(555) 123-4567"
            required
            className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Zip Code */}
      <div>
        <label htmlFor="sms-zip" className="block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-1.5">
          Zip Code <span className="text-[var(--color-accent)]">*</span>
        </label>
        <input
          id="sms-zip"
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
          placeholder="60601"
          required
          maxLength={5}
          className="w-full sm:w-1/2 bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-white/20"
        />
      </div>

      {status === "error" && (
        <p className="text-red-400 text-sm">{message}</p>
      )}

      <div className="flex items-start gap-3 pt-1">
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary btn-primary-hover text-[0.75rem] py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Subscribing..." : "Get Text Alerts"}
        </button>
      </div>

      <p className="text-[0.6rem] text-white/30 leading-relaxed">
        By subscribing, you agree to receive text messages from 7th Heaven about upcoming shows in your area.
        Msg & data rates may apply. Reply STOP to unsubscribe anytime.
      </p>
    </form>
  );
}
