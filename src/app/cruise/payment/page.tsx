"use client";

import React, { useState } from "react";
import { formatPhoneDisplay } from "@/lib/validation";
import Link from "next/link";

export default function CruisePaymentPage() {
  const [formData, setFormData] = useState({
    bookingNumber: "",
    email: "",
    phone: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardZip: "",
    amount: ""
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/cruise/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to process payment. Please check your inputs.");
      }

      const data = await res.json();

      setStatus("success");
      setMessage(data.message);

      // Reset form on success
      setFormData({
        bookingNumber: "",
        email: "",
        phone: "",
        cardName: "",
        cardNumber: "",
        cardExpiry: "",
        cardCvv: "",
        cardZip: "",
        amount: ""
      });
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="site-container max-w-xl mx-auto px-6">
        {/* Banner Link Back */}
        <div className="mb-8 text-left">
          <Link href="/cruise" className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-white transition-colors flex items-center gap-2">
            ← Back to Cruise Page
          </Link>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-8 shadow-[0_8px_64px_rgba(0,0,0,0.4)] text-left">
          <div className="mb-6">
            <span className="inline-block text-[var(--font-size-3xs)] font-black uppercase tracking-[0.25em]  text-[var(--color-accent)] mb-1">
              Secure Additional Payment
            </span>
            <h1 className="text-2xl font-black uppercase text-white tracking-wide">
              Cruise Payment Form
            </h1>
            <p className="text-[var(--font-size-2xs)] text-white/40 mt-1 leading-relaxed">
              Make payments towards your existing booking. Group cabin deposits are $250.00/person. Mock-processed for staging.
            </p>
          </div>

          {status === "success" && (
            <div className="mb-6 p-4 border  border-[var(--color-accent)]/30 bg-emerald-500/10 text-[var(--color-accent)] text-xs font-bold leading-normal">
              🎉 {message}
            </div>
          )}

          {status === "error" && (
            <div className="mb-6 p-4 border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-bold leading-normal">
              ⚠️ {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="cruise-pay-booking-number" className="block text-[var(--font-size-2xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                Booking Number: *
              </label>
              <input aria-label="Input field"
                id="cruise-pay-booking-number"
                type="text"
                required
                placeholder="Enter Booking ID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
                value={formData.bookingNumber}
                onChange={e => setFormData({ ...formData, bookingNumber: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/15 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="cruise-pay-email" className="block text-[var(--font-size-2xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                Email: *
              </label>
              <input aria-label="Input field"
                id="cruise-pay-email"
                type="email"
                required
                placeholder="Enter Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/15 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="cruise-pay-phone" className="block text-[var(--font-size-2xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                Cell Phone:
              </label>
              <input aria-label="Input field"
                id="cruise-pay-phone"
                type="tel"
                placeholder="Enter Cell Phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: formatPhoneDisplay(e.target.value) })}
                className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/15 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="cruise-pay-card-name" className="block text-[var(--font-size-2xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                Your Name on Credit Card: *
              </label>
              <input aria-label="Input field"
                id="cruise-pay-card-name"
                type="text"
                required
                placeholder="Enter Name on Card"
                value={formData.cardName}
                onChange={e => setFormData({ ...formData, cardName: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/15 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="cruise-pay-card-number" className="block text-[var(--font-size-2xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                Credit Card Number: *
              </label>
              <input aria-label="Input field"
                id="cruise-pay-card-number"
                type="text"
                required
                placeholder="Enter Card Number"
                value={formData.cardNumber}
                onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/15 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label htmlFor="cruise-pay-card-expiry" className="block text-[var(--font-size-2xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                  Exp. Date: *
                </label>
                <input aria-label="Input field"
                  id="cruise-pay-card-expiry"
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={formData.cardExpiry}
                  onChange={e => setFormData({ ...formData, cardExpiry: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white text-center placeholder:text-white/15 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="cruise-pay-card-cvv" className="block text-[var(--font-size-2xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                  CVC/CVV: *
                </label>
                <input aria-label="Input field"
                  id="cruise-pay-card-cvv"
                  type="text"
                  required
                  placeholder="3-4 Digit"
                  value={formData.cardCvv}
                  onChange={e => setFormData({ ...formData, cardCvv: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white text-center placeholder:text-white/15 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="cruise-pay-card-zip" className="block text-[var(--font-size-2xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                  Zip Code: *
                </label>
                <input aria-label="Input field"
                  id="cruise-pay-card-zip"
                  type="text"
                  required
                  placeholder="Zip"
                  value={formData.cardZip}
                  onChange={e => setFormData({ ...formData, cardZip: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white text-center placeholder:text-white/15 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cruise-pay-amount" className="block text-[var(--font-size-2xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                Amount to Charge: *
              </label>
              <input aria-label="Input field"
                id="cruise-pay-amount"
                type="text"
                required
                placeholder="Enter Amount (e.g. 250.00)"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/15 focus:border-[var(--color-accent)] focus:outline-none transition-colors font-black text-cyan-400"
              />
            </div>

            {/* Premium red oval submit button from legacy site */}
            <div className="pt-4">
              <button aria-label="Action button"
                type="submit"
                disabled={loading}
                className="bg-[#ff0000] hover:bg-[#cc0000] text-white text-sm font-black px-12 py-3.5 uppercase tracking-widest rounded-full transition-colors shadow-[0_0_20px_rgba(255,0,0,0.3)] disabled:opacity-50 cursor-pointer text-center block mx-auto"
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
