-- Migration 014: Memories Require Admin Approval
-- Change default approved from true to false so fan memory submissions require review

ALTER TABLE public.show_memories ALTER COLUMN approved SET DEFAULT false;

-- Update RLS: allow service role to read all (including unapproved) for admin moderation
-- The existing "public_read_approved" policy already restricts public reads to approved=true
-- The existing "service_role_all" policy already grants full access
