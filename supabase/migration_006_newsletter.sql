-- Newsletter subscribers table
-- Stores both standalone email signups AND tracks which fan accounts opted in

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text DEFAULT '',
  source text NOT NULL DEFAULT 'website' CHECK (source IN ('website', 'signup', 'import')),
  user_id uuid REFERENCES public.profiles ON DELETE SET NULL,
  subscribed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email_unique ON public.newsletter_subscribers (email);

-- RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (public signup)
CREATE POLICY newsletter_insert ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Allow service role full access (for admin blast + unsubscribe)
CREATE POLICY newsletter_service_all ON public.newsletter_subscribers
  FOR ALL USING (true) WITH CHECK (true);
