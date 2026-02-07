-- Forum Bookmarks and Notifications Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- BOOKMARKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.forum_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, thread_id)
);

CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_user ON public.forum_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_thread ON public.forum_bookmarks(thread_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.forum_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('reply', 'mention', 'like', 'quote')),
    source_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    content_preview TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_notifications_user ON public.forum_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_unread ON public.forum_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_forum_notifications_created ON public.forum_notifications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.forum_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks"
    ON public.forum_bookmarks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
    ON public.forum_bookmarks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
    ON public.forum_bookmarks FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON public.forum_notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.forum_notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications"
    ON public.forum_notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
    ON public.forum_notifications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATION TRIGGER FUNCTION
-- Creates notification when someone replies to a thread
-- ============================================

CREATE OR REPLACE FUNCTION public.create_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
    thread_author_id UUID;
    thread_title TEXT;
    commenter_username TEXT;
BEGIN
    -- Get thread author and title
    SELECT author_id, title INTO thread_author_id, thread_title
    FROM public.forum_threads
    WHERE id = NEW.thread_id;
    
    -- Get commenter username
    SELECT username INTO commenter_username
    FROM public.profiles
    WHERE id = NEW.author_id;
    
    -- Don't notify if user is replying to their own thread
    IF NEW.author_id != thread_author_id THEN
        INSERT INTO public.forum_notifications (
            user_id,
            type,
            source_user_id,
            thread_id,
            comment_id,
            content_preview
        ) VALUES (
            thread_author_id,
            'reply',
            NEW.author_id,
            NEW.thread_id,
            NEW.id,
            LEFT(NEW.content, 100)
        );
    END IF;
    
    -- If this is a reply to another comment, notify that comment's author
    IF NEW.parent_id IS NOT NULL THEN
        DECLARE
            parent_author_id UUID;
        BEGIN
            SELECT author_id INTO parent_author_id
            FROM public.forum_comments
            WHERE id = NEW.parent_id;
            
            -- Don't notify if replying to own comment or already notified as thread author
            IF NEW.author_id != parent_author_id AND parent_author_id != thread_author_id THEN
                INSERT INTO public.forum_notifications (
                    user_id,
                    type,
                    source_user_id,
                    thread_id,
                    comment_id,
                    content_preview
                ) VALUES (
                    parent_author_id,
                    'reply',
                    NEW.author_id,
                    NEW.thread_id,
                    NEW.id,
                    LEFT(NEW.content, 100)
                );
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for reply notifications
DROP TRIGGER IF EXISTS forum_reply_notification_trigger ON public.forum_comments;
CREATE TRIGGER forum_reply_notification_trigger
    AFTER INSERT ON public.forum_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.create_reply_notification();

-- ============================================
-- LIKE NOTIFICATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_author_id UUID;
    content_preview TEXT;
BEGIN
    IF NEW.target_type = 'thread' THEN
        SELECT author_id, LEFT(title, 100) INTO target_author_id, content_preview
        FROM public.forum_threads
        WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
        SELECT author_id, LEFT(content, 100) INTO target_author_id, content_preview
        FROM public.forum_comments
        WHERE id = NEW.target_id;
    END IF;
    
    -- Don't notify if liking own content
    IF NEW.user_id != target_author_id THEN
        INSERT INTO public.forum_notifications (
            user_id,
            type,
            source_user_id,
            thread_id,
            comment_id,
            content_preview
        ) VALUES (
            target_author_id,
            'like',
            NEW.user_id,
            CASE WHEN NEW.target_type = 'thread' THEN NEW.target_id ELSE NULL END,
            CASE WHEN NEW.target_type = 'comment' THEN NEW.target_id ELSE NULL END,
            content_preview
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS forum_like_notification_trigger ON public.forum_likes;
CREATE TRIGGER forum_like_notification_trigger
    AFTER INSERT ON public.forum_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.create_like_notification();
