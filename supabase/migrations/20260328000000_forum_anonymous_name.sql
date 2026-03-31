-- ============================================
-- ADD anonymous_name TO forum_threads AND forum_comments
-- Allows users to post under a display name without being tied to their profile.
-- ============================================

ALTER TABLE public.forum_threads
ADD COLUMN IF NOT EXISTS anonymous_name TEXT;

ALTER TABLE public.forum_comments
ADD COLUMN IF NOT EXISTS anonymous_name TEXT;
