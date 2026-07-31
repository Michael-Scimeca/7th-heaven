// TODO: Replace with real Stripe SDK integration before go-live
// Install: npm install stripe
// Then configure STRIPE_SECRET_KEY in .env.local

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" as any });
  }
  return _stripe;
}

/** Convert Stripe amount (cents) to a human-readable dollar string */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
