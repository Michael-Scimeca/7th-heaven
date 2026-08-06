-- SMS subscribers table
-- Stores phone numbers for text alert subscribers

CREATE TABLE IF NOT EXISTS public.sms_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  name text DEFAULT '',
  zip_code text NOT NULL DEFAULT '',
  opted_in boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  opted_out_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_phone_unique ON public.sms_subscribers (phone);

-- Setlist requests table
CREATE TABLE IF NOT EXISTS public.setlist_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_email text NOT NULL,
  booking_name text DEFAULT '',
  songs text[] DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS enabled. Server-side actions use service_role which bypasses RLS automatically.
ALTER TABLE public.sms_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlist_requests ENABLE ROW LEVEL SECURITY;
