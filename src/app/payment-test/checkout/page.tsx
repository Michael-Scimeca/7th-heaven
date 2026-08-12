"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNorthCart } from "@/context/NorthCartContext";

const BROWSER_POST_URL = "https://services.epxuap.com/browserpost/";

export default function NorthCheckoutPage() {
  const cart = useNorthCart();
  const [tac, setTac] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // North sandbox test card defaults (see the tutorial's Payment.jsx) —
  // safe to prefill since this only works against North's test environment.
  const [accountNbr, setAccountNbr] = useState("4000000000000002");
  const [expDate, setExpDate] = useState("2512"); // YYMM
  const [cvv2, setCvv2] = useState("123");

  useEffect(() => {
    setTac(localStorage.getItem("7h_north_tac_v1"));
    setAmount(localStorage.getItem("7h_north_amount_v1"));
    setReady(true);
  }, []);

  if (ready && (!tac || !amount)) {
    return (
      <div className="min-h-screen bg-[#06060b] text-white pt-32 pb-24 flex items-center justify-center">
        <div className="max-w-md text-center px-6">
          <p className="text-white/60 text-sm mb-4">
            No active checkout found. Head back to the shop and add something to your cart first.
          </p>
          <Link
            href="/payment-test"
            className="inline-block px-5 py-2.5 bg-[var(--color-accent)] text-white font-bold text-xs uppercase tracking-wider rounded-lg"
          >
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060b] text-white pt-32 pb-24">
      <div className="site-container max-w-xl mx-auto px-6">
        <Link
          href="/payment-test"
          className="text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-white transition-colors flex items-center gap-2 mb-6"
        >
          ← Back to Shop
        </Link>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-8 shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
          <div className="mb-6">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-accent)] mb-1">
              North (EPX) Browser Post
            </span>
            <h1 className="text-2xl font-black uppercase text-white tracking-wide">
              Card Payment
            </h1>
            <p className="text-white/40 text-xs mt-1 leading-relaxed">
              Submitting this form sends your card details directly to North&apos;s servers —
              they never pass through this site. This uses North&apos;s sandbox test card by
              default.
            </p>
          </div>

          {/* Order summary */}
          {cart.items.length > 0 && (
            <div className="mb-6 space-y-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <div className="relative w-9 h-9 shrink-0 rounded-md overflow-hidden bg-black/40">
                    <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-cover" />
                  </div>
                  <span className="text-white/70 flex-1 truncate">
                    {item.title} ({item.variantLabel}) × {item.quantity}
                  </span>
                  <span className="text-white/50">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-6 pt-4 border-t border-white/10">
            <span className="text-white/50 text-sm font-bold uppercase tracking-wider">
              Amount Due
            </span>
            <span className="text-2xl font-black text-[var(--color-accent)]">${amount}</span>
          </div>

          {/* This is a real, uncontrolled-submit form. On submit the browser
              navigates away to EPX entirely — no fetch/JS interception, so
              card data genuinely never touches our server. */}
          <form action={BROWSER_POST_URL} method="post" className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="ACCOUNT_NBR"
                required
                value={accountNbr}
                onChange={(e) => setAccountNbr(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.12] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                  Expiry (YYMM)
                </label>
                <input
                  type="text"
                  name="EXP_DATE"
                  required
                  placeholder="YYMM"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.12] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="CVV2"
                  required
                  placeholder="123"
                  value={cvv2}
                  onChange={(e) => setCvv2(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.12] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
            </div>

            {/* Hidden merchant + transaction fields required by North */}
            <input type="hidden" name="TRAN_CODE" value={process.env.NEXT_PUBLIC_NORTH_TRAN_CODE || "SALE"} />
            <input type="hidden" name="CUST_NBR" value={process.env.NEXT_PUBLIC_NORTH_CUST_NBR || ""} />
            <input type="hidden" name="MERCH_NBR" value={process.env.NEXT_PUBLIC_NORTH_MERCH_NBR || ""} />
            <input type="hidden" name="DBA_NBR" value={process.env.NEXT_PUBLIC_NORTH_DBA_NBR || ""} />
            <input type="hidden" name="TERMINAL_NBR" value={process.env.NEXT_PUBLIC_NORTH_TERMINAL_NBR || ""} />
            <input type="hidden" name="INDUSTRY_TYPE" value={process.env.NEXT_PUBLIC_NORTH_INDUSTRY_TYPE || "E"} />
            <input type="hidden" name="TAC" value={tac || ""} />
            <input type="hidden" name="AMOUNT" value={amount || ""} />

            <button
              type="submit"
              className="w-full py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-black uppercase tracking-widest text-sm rounded-lg transition-colors"
            >
              Submit Payment — ${amount}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
