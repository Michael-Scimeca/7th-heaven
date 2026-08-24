"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNorthCart } from "@/context/NorthCartContext";

type ResultData = {
  authResp: string | null;
  authRespText: string | null;
  amount: string | null;
  maskedAccountNbr: string | null;
};

function NorthResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const hadError = searchParams.get("error");
  const cart = useNorthCart();

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [fetchError, setFetchError] = useState("");

  // eslint-disable-next-line react-doctor/nextjs-no-client-fetch-for-server-data, react-doctor/no-fetch-in-effect
  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/payment-test/north/result?id=${encodeURIComponent(id)}`);
        if (!active) return;
        if (!res.ok) {
          setFetchError(`Server returned status ${res.status}`);
          return;
        }
        const data = await res.json();
        if (!active) return;
        if (data.error) {
          setFetchError(data.error);
        } else {
          setResult(data);
        }
      } catch (err: any) {
        if (active) setFetchError(err.message || "Failed to load result.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // On a confirmed success, clear the cart and the pending-checkout keys.
  useEffect(() => {
    if (result?.authResp === "00") {
      cart.clearCart();
      localStorage.removeItem("7h_north_tac_v1");
      localStorage.removeItem("7h_north_amount_v1");
      localStorage.removeItem("7h_north_tran_nbr_v1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.authResp]);

  const succeeded = result?.authResp === "00";

  return (
    <div className="min-h-screen bg-transparent text-white pt-32 pb-24 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-white/[0.04]backdrop-blur-[18px]  border border-white/[0.12]  rounded-lg p-8 text-center shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
          {loading && <p className="text-white/50 text-sm">Loading payment result…</p>}

          {!loading && (hadError || fetchError || !id) && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-rose-500/10 border-2 border-rose-500/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h1 className="text-xl  font-bold  uppercase text-white mb-2">
                Couldn&apos;t Load Result
              </h1>
              <p className="text-white/50 text-sm leading-relaxed">
                {fetchError ||
                  "We couldn't find a record of this transaction. If a charge went through, check your bank statement and contact us."}
              </p>
            </>
          )}

          {!loading && result && (
            <>
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-2 ${succeeded
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
                  }`}
              >
                <span className="text-2xl">{succeeded ? "✅" : "❌"}</span>
              </div>
              <h1 className="text-xl  font-bold  uppercase text-white mb-2">
                {succeeded ? "Payment Succeeded" : "Payment Failed"}
              </h1>
              {succeeded ? (
                <div className=" text-white  text-sm space-y-1">
                  <p>Amount paid: ${result.amount}</p>
                  {result.maskedAccountNbr && <p>Account: {result.maskedAccountNbr}</p>}
                </div>
              ) : (
                <p className=" text-white  text-sm">
                  Reason: {result.authRespText || "Unknown error"}
                </p>
              )}
            </>
          )}

          <Link
            href="/payment-test"
            className="inline-block mt-6 px-5 py-2.5 bg-[var(--color-accent)] text-white font-bold text-xs uppercase tracking-wider rounded-lg"
          >
            {succeeded ? "Back to Shop" : "Try Again"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NorthResultPage() {
  return (
    <Suspense fallback={null}>
      <NorthResultContent />
    </Suspense>
  );
}
