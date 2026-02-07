-- Knowledge Features: Favorites table and additional indexes

-- ============================================
-- FAVORITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.knowledge_favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.knowledge_questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_favorites_user ON public.knowledge_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_favorites_question ON public.knowledge_favorites(question_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.knowledge_favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.knowledge_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.knowledge_favorites;
DROP POLICY IF EXISTS "Users can remove favorites" ON public.knowledge_favorites;

CREATE POLICY "Users can view their own favorites"
    ON public.knowledge_favorites FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
    ON public.knowledge_favorites FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
    ON public.knowledge_favorites FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- TRENDING QUESTIONS VIEW (for performance)
-- ============================================

-- Create a view for trending questions with calculated score
CREATE OR REPLACE VIEW public.knowledge_trending_questions AS
SELECT 
    q.id,
    q.title,
    q.view_count,
    q.upvote_count,
    q.answer_count,
    q.created_at,
    t.name as topic_name,
    t.slug as topic_slug,
    -- Trending score: views + (upvotes * 5) + (answers * 10) - time decay
    (COALESCE(q.view_count, 0) * 1 
     + COALESCE(q.upvote_count, 0) * 5 
     + COALESCE(q.answer_count, 0) * 10
     - EXTRACT(EPOCH FROM (now() - q.created_at)) / 3600 * 0.5
    ) as trending_score
FROM public.knowledge_questions q
LEFT JOIN public.knowledge_topics t ON q.topic_id = t.id
WHERE q.status = 'approved'
  AND q.created_at > now() - interval '7 days'
ORDER BY trending_score DESC
LIMIT 10;

-- Grant access to the view
GRANT SELECT ON public.knowledge_trending_questions TO authenticated;
