-- Add username column to profiles for display across dashboards
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Create a unique index on username (case-insensitive) to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique
  ON public.profiles (LOWER(username))
  WHERE username IS NOT NULL AND username != '';

-- Update the auto-create trigger to include username from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, role, date_of_birth, phone, zip)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'role', 'fan'),
    (new.raw_user_meta_data->>'date_of_birth')::date,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'zip'
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, public.profiles.username);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
