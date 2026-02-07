-- Forum Tables Migration
-- Run this in your Supabase SQL Editor

-- Forum Threads Table
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    content TEXT NOT NULL CHECK (char_length(content) >= 10),
    category_slug TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    comment_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false
);

-- Forum Comments Table
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    like_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false
);

-- Forum Likes Table
CREATE TABLE IF NOT EXISTS public.forum_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('thread', 'comment')),
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, target_type, target_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON public.forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON public.forum_threads(category_slug);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON public.forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_thread ON public.forum_comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON public.forum_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON public.forum_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_target ON public.forum_likes(target_type, target_id);

-- Triggers for updated_at
CREATE TRIGGER forum_threads_updated_at
    BEFORE UPDATE ON public.forum_threads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER forum_comments_updated_at
    BEFORE UPDATE ON public.forum_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to update thread comment count
CREATE OR REPLACE FUNCTION public.update_thread_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forum_threads 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.thread_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forum_threads 
        SET comment_count = GREATEST(0, comment_count - 1) 
        WHERE id = OLD.thread_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER forum_comment_count_trigger
    AFTER INSERT OR DELETE ON public.forum_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_thread_comment_count();

-- Function to update like counts
CREATE OR REPLACE FUNCTION public.update_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'thread' THEN
            UPDATE public.forum_threads SET like_count = like_count + 1 WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'comment' THEN
            UPDATE public.forum_comments SET like_count = like_count + 1 WHERE id = NEW.target_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'thread' THEN
            UPDATE public.forum_threads SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'comment' THEN
            UPDATE public.forum_comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.target_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER forum_like_count_trigger
    AFTER INSERT OR DELETE ON public.forum_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_like_count();

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- Threads policies
CREATE POLICY "Threads are viewable by authenticated users"
    ON public.forum_threads FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create threads"
    ON public.forum_threads FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own threads"
    ON public.forum_threads FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Users can delete their own threads"
    ON public.forum_threads FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id OR public.is_admin());

-- Comments policies
CREATE POLICY "Comments are viewable by authenticated users"
    ON public.forum_comments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create comments"
    ON public.forum_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
    ON public.forum_comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Users can delete their own comments"
    ON public.forum_comments FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id OR public.is_admin());

-- Likes policies
CREATE POLICY "Likes are viewable by authenticated users"
    ON public.forum_likes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create their own likes"
    ON public.forum_likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
    ON public.forum_likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
