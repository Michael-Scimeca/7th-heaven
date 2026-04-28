-- Add cancel_token column for unauthenticated booking cancellation
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_token TEXT;
