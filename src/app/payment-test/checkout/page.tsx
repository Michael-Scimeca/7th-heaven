/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import { useEffect, useState } from "react";
import { useTransition } from "@/context/TransitionContext";
import Image from "next/image";
import Link from "next/link";
import { useNorthCart } from "@/context/NorthCartContext";

const BROWSER_POST_URL = "https://services.epxuap.com/browserpost/";

export default function NorthCheckoutPage() {
  const { requestTransition } = useTransition();
  const cart = useNorthCart();
  const [tac, setTac] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [tranNbr, setTranNbr] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [ready, setReady] = useState(false);
  const [simulating, setSimulating] = useState<"approved" | "declined" | null>(
    null,
  );

  // North sandbox test card defaults (see the tutorial's Payment.jsx) —
  // safe to prefill since this only works against North's test environment.
  const [accountNbr, setAccountNbr] = useState("4000000000000002");
  const [expDate, setExpDate] = useState("2512"); // YYMM
  const [cvv2, setCvv2] = useState("123");

  // Deferred to an effect (not a lazy useState initializer) to avoid an
  // SSR/client hydration mismatch — see the same note in NorthCartContext.
  // eslint-disable-next-line react-doctor/no-initialize-state, react-hooks/set-state-in-effect
  useEffect(() => {
    setTac(localStorage.getItem("7h_north_tac_v1"));
    setAmount(localStorage.getItem("7h_north_amount_v1"));
    setTranNbr(localStorage.getItem("7h_north_tran_nbr_v1"));
    setMockMode(localStorage.getItem("7h_north_mock_v1") === "1");
    // eslint-disable-next-line react-doctor/no-initialize-state
    setReady(true);
  }, []);

  const handleSimulate = async (outcome: "approved" | "declined") => {
    setSimulating(outcome);
    try {
      const maskedAccount = "XXXXXXXXXXXX" + accountNbr.slice(-4);
      const body = new URLSearchParams({
        TRAN_NBR: tranNbr || "",
        AUTH_RESP: outcome === "approved" ? "00" : "05",
        AUTH_RESP_TEXT:
          outcome === "approved" ? "APPROVAL" : "DECLINED — simulated decline",
        AUTH_AMOUNT_REQUESTED: amount || "0.00",
        AUTH_MASKED_ACCOUNT_NBR: maskedAccount,
      });

      // Hits the exact same endpoint EPX would call in production, so the
      // Supabase persistence + redirect path gets real coverage here too.
      const res = await fetch("/api/payment-test/north/result", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      // res.url is the final URL after following the 303 redirect.
      requestTransition(res.url.replace(window.location.origin, ""));
    } catch {
      setSimulating(null);
    }
  };

  if (ready && (!tac || !amount)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06060b] pt-32 pb-24">
        <div className="max-w-md px-6 text-center">
          <p className="mb-6">
            No active checkout found. Head back to the shop and add something to
            your cart first.
          </p>
          <Link
            href="/payment-test"
            className="inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2.5"
          >
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="site-container mx-auto max-w-xl px-6">
        <Link
          href="/payment-test"
          className="mb-6 flex items-center gap-2 text-purple-400 hover:text-white"
        >
          ← Back to Shop
        </Link>

        <div className="bg-white/[0.04]backdrop-blur-xl rounded-lg border border-white/[0.12] p-8 shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
          <div className="mb-6">
            <span className="mb-1 inline-block text-[10px]">
              North (EPX) Browser Post
            </span>
            <h1>Card Payment</h1>
            {mockMode ? (
              <p className="text-yellow-300">
                🧪 Test mode: no real North credentials are configured, so this
                won&apos;t contact EPX. Use the simulate buttons below instead
                of a real submit.
              </p>
            ) : (
              <p>
                Submitting this form sends your card details directly to
                North&apos;s servers — they never pass through this site. This
                uses North&apos;s sandbox test card by default.
              </p>
            )}
          </div>

          {/* Order summary */}
          {cart.items.length > 0 && (
            <div className="mb-6 space-y-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-black/40">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="36px"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <span className="flex-1">
                    {item.title} ({item.variantLabel}) × {item.quantity}
                  </span>
                  <span className="text-white/50">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="r text-white/50">Amount Due</span>
            <span className="text-2xl text-[var(--color-accent)]">
              ${amount}
            </span>
          </div>

          {/* Card fields — shown either way so the UI looks/feels the same,
              but in mock mode they're purely cosmetic (only the last 4 of
              the account number get used, for the fake masked receipt). */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] text-white/40">
                Account Number
              </label>
              <input
                type="text"
                required
                value={accountNbr}
                onChange={(e) => setAccountNbr(e.target.value)}
                className="focus-ring w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[10px] text-white/40">
                  Expiry (YYMM)
                </label>
                <input
                  type="text"
                  required
                  placeholder="YYMM"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="focus-ring w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-3"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-white/40">
                  CVV
                </label>
                <input
                  type="text"
                  required
                  placeholder="123"
                  value={cvv2}
                  onChange={(e) => setCvv2(e.target.value)}
                  className="focus-ring w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-3"
                />
              </div>
            </div>
          </div>

          {mockMode ? (
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={simulating !== null}
                onClick={() => handleSimulate("approved")}
                className="flex-1 rounded-lg bg-emerald-500 py-3.5 hover:bg-emerald-400 disabled:opacity-50"
              >
                {simulating === "approved"
                  ? "Simulating…"
                  : `✅ Simulate Approved — $${amount}`}
              </button>
              <button
                type="button"
                disabled={simulating !== null}
                onClick={() => handleSimulate("declined")}
                className="flex-1 rounded-lg border border-rose-500/40 bg-rose-500/20 py-3.5 text-rose-300 hover:bg-rose-500/30 disabled:opacity-50"
              >
                {simulating === "declined"
                  ? "Simulating…"
                  : "❌ Simulate Declined"}
              </button>
            </div>
          ) : (
            // Real, uncontrolled-submit form. On submit the browser navigates
            // away to EPX entirely — no fetch/JS interception, so card data
            // genuinely never touches our server.
            <form action={BROWSER_POST_URL} method="post" className="mt-6">
              <input type="hidden" name="ACCOUNT_NBR" value={accountNbr} />
              <input type="hidden" name="EXP_DATE" value={expDate} />
              <input type="hidden" name="CVV2" value={cvv2} />
              <input
                type="hidden"
                name="TRAN_CODE"
                value={process.env.NEXT_PUBLIC_NORTH_TRAN_CODE || "SALE"}
              />
              <input
                type="hidden"
                name="CUST_NBR"
                value={process.env.NEXT_PUBLIC_NORTH_CUST_NBR || ""}
              />
              <input
                type="hidden"
                name="MERCH_NBR"
                value={process.env.NEXT_PUBLIC_NORTH_MERCH_NBR || ""}
              />
              <input
                type="hidden"
                name="DBA_NBR"
                value={process.env.NEXT_PUBLIC_NORTH_DBA_NBR || ""}
              />
              <input
                type="hidden"
                name="TERMINAL_NBR"
                value={process.env.NEXT_PUBLIC_NORTH_TERMINAL_NBR || ""}
              />
              <input
                type="hidden"
                name="INDUSTRY_TYPE"
                value={process.env.NEXT_PUBLIC_NORTH_INDUSTRY_TYPE || "E"}
              />
              <input type="hidden" name="TAC" value={tac || ""} />
              <input type="hidden" name="AMOUNT" value={amount || ""} />

              <button
                type="submit"
                className="w-full rounded-lg bg-[var(--color-accent)] py-3.5 hover:bg-[var(--color-accent)]/80"
              >
                Submit Payment — ${amount}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
