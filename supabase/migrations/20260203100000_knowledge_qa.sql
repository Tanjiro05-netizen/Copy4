-- Knowledge Q&A Section Migration
-- Zhihu-style Q&A with admin moderation

-- ============================================
-- TOPICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.knowledge_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    question_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_knowledge_topics_slug ON public.knowledge_topics(slug);

-- ============================================
-- QUESTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.knowledge_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) >= 10 AND char_length(title) <= 300),
    content TEXT NOT NULL CHECK (char_length(content) >= 20),
    topic_id UUID REFERENCES public.knowledge_topics(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    view_count INTEGER DEFAULT 0,
    answer_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    is_answered BOOLEAN DEFAULT false,
    accepted_answer_id UUID,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_questions_author ON public.knowledge_questions(author_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_questions_topic ON public.knowledge_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_questions_status ON public.knowledge_questions(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_questions_created ON public.knowledge_questions(created_at DESC);

-- ============================================
-- ANSWERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.knowledge_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.knowledge_questions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) >= 50),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT false,
    is_expert_answer BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_answers_question ON public.knowledge_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_answers_author ON public.knowledge_answers(author_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_answers_status ON public.knowledge_answers(status);

-- ============================================
-- VOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.knowledge_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
    target_id UUID NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_votes_user ON public.knowledge_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_votes_target ON public.knowledge_votes(target_type, target_id);

-- ============================================
-- TOPIC FOLLOWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.knowledge_topic_follows (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.knowledge_topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, topic_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.knowledge_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_topic_follows ENABLE ROW LEVEL SECURITY;

-- Topics: Anyone authenticated can view
CREATE POLICY "Topics are viewable by authenticated users"
    ON public.knowledge_topics FOR SELECT
    TO authenticated
    USING (true);

-- Questions: Only approved questions visible to non-admins, authors can see their own
CREATE POLICY "Questions viewable if approved or own"
    ON public.knowledge_questions FOR SELECT
    TO authenticated
    USING (
        status = 'approved' 
        OR author_id = auth.uid() 
        OR public.is_admin()
    );

CREATE POLICY "Users can create questions"
    ON public.knowledge_questions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own questions or admin"
    ON public.knowledge_questions FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Admins can delete questions"
    ON public.knowledge_questions FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Answers: Only approved answers visible (or own), only certified users can answer
CREATE POLICY "Answers viewable if approved or own"
    ON public.knowledge_answers FOR SELECT
    TO authenticated
    USING (
        status = 'approved' 
        OR author_id = auth.uid() 
        OR public.is_admin()
    );

CREATE POLICY "Certified users can create answers"
    ON public.knowledge_answers FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = author_id 
        AND (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_certified = true)
            OR public.is_admin()
        )
    );

CREATE POLICY "Users can update own answers or admin"
    ON public.knowledge_answers FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Admins can delete answers"
    ON public.knowledge_answers FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Votes: Users can manage their own votes
CREATE POLICY "Votes are viewable by authenticated users"
    ON public.knowledge_votes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create their own votes"
    ON public.knowledge_votes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
    ON public.knowledge_votes FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
    ON public.knowledge_votes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Topic follows
CREATE POLICY "Topic follows are viewable"
    ON public.knowledge_topic_follows FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can follow topics"
    ON public.knowledge_topic_follows FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow topics"
    ON public.knowledge_topic_follows FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update question answer count
CREATE OR REPLACE FUNCTION public.update_question_answer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE public.knowledge_questions 
        SET answer_count = answer_count + 1,
            is_answered = true
        WHERE id = NEW.question_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
        UPDATE public.knowledge_questions 
        SET answer_count = answer_count + 1,
            is_answered = true
        WHERE id = NEW.question_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE public.knowledge_questions 
        SET answer_count = GREATEST(0, answer_count - 1)
        WHERE id = OLD.question_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS knowledge_answer_count_trigger ON public.knowledge_answers;
CREATE TRIGGER knowledge_answer_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.knowledge_answers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_question_answer_count();

-- Update vote counts
CREATE OR REPLACE FUNCTION public.update_knowledge_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'question' THEN
            IF NEW.vote_type = 'up' THEN
                UPDATE public.knowledge_questions SET upvote_count = upvote_count + 1 WHERE id = NEW.target_id;
            END IF;
        ELSIF NEW.target_type = 'answer' THEN
            IF NEW.vote_type = 'up' THEN
                UPDATE public.knowledge_answers SET upvote_count = upvote_count + 1 WHERE id = NEW.target_id;
            ELSE
                UPDATE public.knowledge_answers SET downvote_count = downvote_count + 1 WHERE id = NEW.target_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'question' THEN
            IF OLD.vote_type = 'up' THEN
                UPDATE public.knowledge_questions SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = OLD.target_id;
            END IF;
        ELSIF OLD.target_type = 'answer' THEN
            IF OLD.vote_type = 'up' THEN
                UPDATE public.knowledge_answers SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = OLD.target_id;
            ELSE
                UPDATE public.knowledge_answers SET downvote_count = GREATEST(0, downvote_count - 1) WHERE id = OLD.target_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'UPDATE' AND OLD.vote_type != NEW.vote_type THEN
        -- Vote changed from up to down or vice versa
        IF NEW.target_type = 'answer' THEN
            IF NEW.vote_type = 'up' THEN
                UPDATE public.knowledge_answers 
                SET upvote_count = upvote_count + 1, downvote_count = GREATEST(0, downvote_count - 1) 
                WHERE id = NEW.target_id;
            ELSE
                UPDATE public.knowledge_answers 
                SET downvote_count = downvote_count + 1, upvote_count = GREATEST(0, upvote_count - 1) 
                WHERE id = NEW.target_id;
            END IF;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS knowledge_vote_count_trigger ON public.knowledge_votes;
CREATE TRIGGER knowledge_vote_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.knowledge_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_knowledge_vote_count();

-- Update topic question count
CREATE OR REPLACE FUNCTION public.update_topic_question_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' AND NEW.topic_id IS NOT NULL THEN
        UPDATE public.knowledge_topics SET question_count = question_count + 1 WHERE id = NEW.topic_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'approved' AND NEW.status = 'approved' AND NEW.topic_id IS NOT NULL THEN
            UPDATE public.knowledge_topics SET question_count = question_count + 1 WHERE id = NEW.topic_id;
        ELSIF OLD.status = 'approved' AND NEW.status != 'approved' AND OLD.topic_id IS NOT NULL THEN
            UPDATE public.knowledge_topics SET question_count = GREATEST(0, question_count - 1) WHERE id = OLD.topic_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' AND OLD.topic_id IS NOT NULL THEN
        UPDATE public.knowledge_topics SET question_count = GREATEST(0, question_count - 1) WHERE id = OLD.topic_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS knowledge_topic_count_trigger ON public.knowledge_questions;
CREATE TRIGGER knowledge_topic_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.knowledge_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_topic_question_count();

-- Mark answer as expert if author is certified
CREATE OR REPLACE FUNCTION public.mark_expert_answer()
RETURNS TRIGGER AS $$
BEGIN
    SELECT is_certified INTO NEW.is_expert_answer
    FROM public.profiles
    WHERE id = NEW.author_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS knowledge_expert_answer_trigger ON public.knowledge_answers;
CREATE TRIGGER knowledge_expert_answer_trigger
    BEFORE INSERT ON public.knowledge_answers
    FOR EACH ROW
    EXECUTE FUNCTION public.mark_expert_answer();

-- ============================================
-- SEED DATA: Initial Topics
-- ============================================

INSERT INTO public.knowledge_topics (name, slug, description) VALUES
    ('Marxist Theory', 'marxist-theory', 'Questions about Marxism, dialectical materialism, and revolutionary theory'),
    ('History', 'history', 'Questions about historical events, movements, and analysis'),
    ('Philosophy', 'philosophy', 'Questions about philosophical concepts, ethics, and logic'),
    ('Economics', 'economics', 'Questions about economic systems, markets, and political economy'),
    ('Physics', 'physics', 'Questions about physical sciences, mechanics, and the universe'),
    ('Medicine', 'medicine', 'Questions about health, medicine, and biology'),
    ('Science', 'science', 'General scientific questions, research methods, and discoveries'),
    ('Technology', 'technology', 'Questions about computing, engineering, and tech developments'),
    ('Politics', 'politics', 'Questions about political systems, governance, and current events'),
    ('General', 'general', 'General knowledge questions that don''t fit other categories')
ON CONFLICT (slug) DO NOTHING;
