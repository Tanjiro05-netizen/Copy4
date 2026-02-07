-- Forum Reposts Migration
-- Adds repost functionality with quote-repost support

-- ============================================
-- REPOSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.forum_reposts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    quote_content TEXT,  -- Optional quote/comment when reposting
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, thread_id)
);

CREATE INDEX IF NOT EXISTS idx_forum_reposts_user ON public.forum_reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reposts_thread ON public.forum_reposts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_reposts_created ON public.forum_reposts(created_at DESC);

-- ============================================
-- ADD REPOST COUNT TO THREADS
-- ============================================

ALTER TABLE public.forum_threads 
ADD COLUMN IF NOT EXISTS repost_count INTEGER DEFAULT 0;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.forum_reposts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view reposts (they appear in feed)
CREATE POLICY "Reposts are viewable by authenticated users"
    ON public.forum_reposts FOR SELECT
    TO authenticated
    USING (true);

-- Users can create their own reposts
CREATE POLICY "Users can create their own reposts"
    ON public.forum_reposts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reposts
CREATE POLICY "Users can delete their own reposts"
    ON public.forum_reposts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can update their own reposts (edit quote)
CREATE POLICY "Users can update their own reposts"
    ON public.forum_reposts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- REPOST COUNT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.update_repost_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forum_threads 
        SET repost_count = repost_count + 1 
        WHERE id = NEW.thread_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forum_threads 
        SET repost_count = GREATEST(0, repost_count - 1) 
        WHERE id = OLD.thread_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS forum_repost_count_trigger ON public.forum_reposts;
CREATE TRIGGER forum_repost_count_trigger
    AFTER INSERT OR DELETE ON public.forum_reposts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_repost_count();

-- ============================================
-- REPOST NOTIFICATION TRIGGER
-- ============================================

-- First, update the notification type constraint to include 'repost'
ALTER TABLE public.forum_notifications 
DROP CONSTRAINT IF EXISTS forum_notifications_type_check;

ALTER TABLE public.forum_notifications 
ADD CONSTRAINT forum_notifications_type_check 
CHECK (type IN ('reply', 'mention', 'like', 'quote', 'repost'));

CREATE OR REPLACE FUNCTION public.create_repost_notification()
RETURNS TRIGGER AS $$
DECLARE
    thread_author_id UUID;
    thread_title TEXT;
    reposter_username TEXT;
BEGIN
    -- Get thread author and title
    SELECT author_id, title INTO thread_author_id, thread_title
    FROM public.forum_threads
    WHERE id = NEW.thread_id;
    
    -- Get reposter username
    SELECT username INTO reposter_username
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Don't notify if user is reposting their own thread
    IF NEW.user_id != thread_author_id AND thread_author_id IS NOT NULL THEN
        INSERT INTO public.forum_notifications (
            user_id,
            type,
            source_user_id,
            thread_id,
            content_preview
        ) VALUES (
            thread_author_id,
            'repost',
            NEW.user_id,
            NEW.thread_id,
            COALESCE(LEFT(NEW.quote_content, 100), LEFT(thread_title, 100))
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS forum_repost_notification_trigger ON public.forum_reposts;
CREATE TRIGGER forum_repost_notification_trigger
    AFTER INSERT ON public.forum_reposts
    FOR EACH ROW
    EXECUTE FUNCTION public.create_repost_notification();
