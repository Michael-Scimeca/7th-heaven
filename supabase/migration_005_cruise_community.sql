
-- Add cruise_signup_id to profiles to link community members to their cruise interests
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cruise_signup_id UUID REFERENCES cruise_signups(id);

-- Add source tracking for marketing attribution
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_source TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_cruise_signup_id ON profiles(cruise_signup_id);
