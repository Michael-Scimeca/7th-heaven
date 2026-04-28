-- Enforce unique emails on profiles table
-- Supabase Auth already prevents duplicate emails at the auth layer,
-- but this adds a database-level safety net.

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON public.profiles (email);