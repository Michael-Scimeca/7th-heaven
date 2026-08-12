-- ==============================================================
-- Migration 020: North (EPX) Payment Results for /payment-test shop
-- ==============================================================
-- North's Browser Post API redirects the customer's browser to our
-- REDIRECT_URL with the transaction result as a POST body. We persist
-- the raw result here (keyed by a UUID we hand back in the redirect)
-- instead of holding it in an in-memory server variable, since
-- serverless functions don't reliably share memory across invocations.

CREATE TABLE IF NOT EXISTS public.north_payment_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT,
  auth_resp TEXT,
  auth_resp_text TEXT,
  amount TEXT,
  masked_account_nbr TEXT,
  raw JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_north_payment_results_created_at
  ON public.north_payment_results (created_at DESC);

-- Locked down: only the service role (used server-side by our API routes)
-- can read or write this table. No anon/public access.
ALTER TABLE public.north_payment_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only" ON public.north_payment_results;
