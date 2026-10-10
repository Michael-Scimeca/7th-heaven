-- ============================================================================
-- Migration 022: Notifications Engine & PWA Subsystem
-- Adds tables and columns for zero-cost multi-audience alert distribution
-- (Web Push, Email Quota Tracker & Queue, Broadcast Logs, Band Profile Flags)
-- ============================================================================

-- 1. Ensure push_subscribers table exists with full multi-audience support
CREATE TABLE IF NOT EXISTS public.push_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    email TEXT,
    zip TEXT,
    radius TEXT DEFAULT '50',
    selected_types TEXT[] DEFAULT ARRAY['all'],
    audience TEXT DEFAULT 'fan',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quiet_hours_start TEXT,
    quiet_hours_end TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add any missing columns to push_subscribers if table already existed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='push_subscribers' AND column_name='audience') THEN
        ALTER TABLE public.push_subscribers ADD COLUMN audience TEXT DEFAULT 'fan';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='push_subscribers' AND column_name='user_id') THEN
        ALTER TABLE public.push_subscribers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='push_subscribers' AND column_name='quiet_hours_start') THEN
        ALTER TABLE public.push_subscribers ADD COLUMN quiet_hours_start TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='push_subscribers' AND column_name='quiet_hours_end') THEN
        ALTER TABLE public.push_subscribers ADD COLUMN quiet_hours_end TEXT;
    END IF;
END $$;

-- Enable RLS on push_subscribers
ALTER TABLE public.push_subscribers ENABLE ROW LEVEL SECURITY;

-- All access goes through server API routes using the service-role key.
-- Never expose subscriber emails/zips or endpoints to the public anon key.
CREATE POLICY "Service role manages push subscriptions"
    ON public.push_subscribers FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 2. Email Quota Tracker (Daily 100 / Monthly 3,000 for Resend Free Tier)
CREATE TABLE IF NOT EXISTS public.email_quota_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sent_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    recipient_count INTEGER NOT NULL DEFAULT 1,
    audience TEXT NOT NULL DEFAULT 'fan',
    category TEXT,
    status TEXT NOT NULL DEFAULT 'sent'
);

ALTER TABLE public.email_quota_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role or admin to manage email quota logs"
    ON public.email_quota_logs FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 3. Email Queue (Overflow emails queued for daily batch drain)
CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    scheduled_for TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    reply_to TEXT,
    category TEXT DEFAULT 'newsletter',
    audience TEXT DEFAULT 'fan',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled ON public.email_queue(status, scheduled_for);

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role or admin to manage email queue"
    ON public.email_queue FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 4. Notification Broadcast Logs (Audit log of all broadcasts across channels)
CREATE TABLE IF NOT EXISTS public.notification_broadcast_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    sender_id TEXT,
    sender_email TEXT,
    audience TEXT NOT NULL,
    category TEXT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    url TEXT,
    urgent BOOLEAN DEFAULT false,
    channels JSONB NOT NULL DEFAULT '[]'::jsonb,
    counts JSONB NOT NULL DEFAULT '{"web_push":0,"ntfy":0,"email":0,"sms":0}'::jsonb,
    status TEXT DEFAULT 'completed'
);

ALTER TABLE public.notification_broadcast_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role or admin to manage broadcast logs"
    ON public.notification_broadcast_logs FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 5. Profiles table enhancement: is_band flag
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_band') THEN
            ALTER TABLE public.profiles ADD COLUMN is_band BOOLEAN DEFAULT false;
        END IF;
    END IF;
END $$;
