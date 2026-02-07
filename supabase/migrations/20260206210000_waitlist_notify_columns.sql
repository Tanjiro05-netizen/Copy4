-- Add notification preference columns to waitlist
ALTER TABLE public.waitlist
ADD COLUMN IF NOT EXISTS notify_invite_codes boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_public_beta boolean DEFAULT true;
