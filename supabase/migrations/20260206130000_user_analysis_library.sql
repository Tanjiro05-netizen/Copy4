-- User Analysis Library: per-user curation of analysis texts
-- Users save community texts from the Theory page to their personal Analysis workspace

CREATE TABLE IF NOT EXISTS public.user_analysis_library (
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text_id uuid NOT NULL REFERENCES public.analysis_texts(id) ON DELETE CASCADE,
    added_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, text_id)
);

COMMENT ON TABLE public.user_analysis_library IS 'Junction table: users save community texts to their personal Analysis library';

-- Index for fast per-user lookups
CREATE INDEX idx_user_analysis_library_user ON public.user_analysis_library(user_id);

-- Row Level Security
ALTER TABLE public.user_analysis_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own library"
    ON public.user_analysis_library FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own library"
    ON public.user_analysis_library FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own library"
    ON public.user_analysis_library FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Admins can see all (for management)
CREATE POLICY "Admins can view all library entries"
    ON public.user_analysis_library FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Grants
GRANT ALL ON TABLE public.user_analysis_library TO anon;
GRANT ALL ON TABLE public.user_analysis_library TO authenticated;
GRANT ALL ON TABLE public.user_analysis_library TO service_role;
