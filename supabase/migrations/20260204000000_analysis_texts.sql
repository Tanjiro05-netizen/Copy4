-- Analysis Texts Schema Migration
-- Professional text analysis platform with multilingual support, collaboration, and annotations

-- ============================================
-- TABLES
-- ============================================

-- Main analysis texts table with multilingual support
CREATE TABLE IF NOT EXISTS public.analysis_texts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text UNIQUE NOT NULL,
    primary_language text NOT NULL DEFAULT 'en',
    available_languages text[] NOT NULL DEFAULT ARRAY['en'],
    metadata jsonb NOT NULL DEFAULT '{}',
    table_of_contents jsonb NOT NULL DEFAULT '[]',
    sections jsonb NOT NULL DEFAULT '[]',
    category text,
    tags text[] DEFAULT ARRAY[]::text[],
    is_published boolean DEFAULT false,
    uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.analysis_texts IS 'Structured analysis texts with multilingual support';
COMMENT ON COLUMN public.analysis_texts.metadata IS 'Per-language metadata: {en: {title, authors[], year, ...}, de: {...}}';
COMMENT ON COLUMN public.analysis_texts.table_of_contents IS 'TOC structure: [{id, title: {en, de}, level, children?}]';
COMMENT ON COLUMN public.analysis_texts.sections IS 'Section content: [{id, title: {en, de}, level, content: {en, de}}]';

-- Section-level comments with nested replies
CREATE TABLE IF NOT EXISTS public.analysis_text_comments (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    text_id uuid NOT NULL REFERENCES public.analysis_texts(id) ON DELETE CASCADE,
    section_id text,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (char_length(content) > 0),
    parent_comment_id bigint REFERENCES public.analysis_text_comments(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.analysis_text_comments IS 'Section-level comments with nested replies';

-- Section bookmarks with optional notes
CREATE TABLE IF NOT EXISTS public.analysis_text_bookmarks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text_id uuid NOT NULL REFERENCES public.analysis_texts(id) ON DELETE CASCADE,
    section_id text NOT NULL,
    note text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, text_id, section_id)
);

COMMENT ON TABLE public.analysis_text_bookmarks IS 'User bookmarks for specific sections';

-- Text highlights with annotations
CREATE TABLE IF NOT EXISTS public.analysis_text_highlights (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text_id uuid NOT NULL REFERENCES public.analysis_texts(id) ON DELETE CASCADE,
    section_id text NOT NULL,
    selected_text text NOT NULL,
    serialized_range text,
    note text,
    color text DEFAULT 'yellow',
    created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.analysis_text_highlights IS 'User text highlights with color-coded annotations';

-- Collaboration access control
CREATE TABLE IF NOT EXISTS public.analysis_text_collaborators (
    text_id uuid NOT NULL REFERENCES public.analysis_texts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'commenter', 'editor')),
    invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (text_id, user_id)
);

COMMENT ON TABLE public.analysis_text_collaborators IS 'Collaboration access: viewer, commenter, or editor';

-- Cross-references between texts
CREATE TABLE IF NOT EXISTS public.analysis_cross_references (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    source_text_id uuid NOT NULL REFERENCES public.analysis_texts(id) ON DELETE CASCADE,
    source_section_id text NOT NULL,
    target_text_id uuid NOT NULL REFERENCES public.analysis_texts(id) ON DELETE CASCADE,
    target_section_id text,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    note text,
    created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.analysis_cross_references IS 'User-created links between texts/sections';

-- Real-time presence tracking
CREATE TABLE IF NOT EXISTS public.analysis_text_presence (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    text_id uuid NOT NULL REFERENCES public.analysis_texts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    section_id text,
    cursor_position jsonb,
    last_seen timestamptz DEFAULT now(),
    UNIQUE(text_id, user_id)
);

COMMENT ON TABLE public.analysis_text_presence IS 'Real-time user presence for collaboration';

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_analysis_texts_slug ON public.analysis_texts(slug);
CREATE INDEX idx_analysis_texts_category ON public.analysis_texts(category);
CREATE INDEX idx_analysis_texts_published ON public.analysis_texts(is_published);
CREATE INDEX idx_analysis_texts_tags ON public.analysis_texts USING GIN(tags);

CREATE INDEX idx_analysis_text_comments_text_id ON public.analysis_text_comments(text_id);
CREATE INDEX idx_analysis_text_comments_section_id ON public.analysis_text_comments(text_id, section_id);
CREATE INDEX idx_analysis_text_comments_user_id ON public.analysis_text_comments(user_id);

CREATE INDEX idx_analysis_text_bookmarks_user_text ON public.analysis_text_bookmarks(user_id, text_id);
CREATE INDEX idx_analysis_text_highlights_user_text ON public.analysis_text_highlights(user_id, text_id);

CREATE INDEX idx_analysis_cross_references_source ON public.analysis_cross_references(source_text_id);
CREATE INDEX idx_analysis_cross_references_target ON public.analysis_cross_references(target_text_id);

CREATE INDEX idx_analysis_text_presence_text ON public.analysis_text_presence(text_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_analysis_text_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_analysis_text_update
    BEFORE UPDATE ON public.analysis_texts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_analysis_text_updated_at();

CREATE TRIGGER on_analysis_comment_update
    BEFORE UPDATE ON public.analysis_text_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_analysis_text_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.analysis_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_text_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_text_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_text_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_text_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_text_presence ENABLE ROW LEVEL SECURITY;

-- analysis_texts policies
CREATE POLICY "Published texts are viewable by everyone"
    ON public.analysis_texts FOR SELECT
    USING (is_published = true);

CREATE POLICY "Unpublished texts viewable by owner or collaborators"
    ON public.analysis_texts FOR SELECT
    TO authenticated
    USING (
        uploaded_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.analysis_text_collaborators 
            WHERE text_id = id AND user_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "Admins can insert texts"
    ON public.analysis_texts FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins and owners can update texts"
    ON public.analysis_texts FOR UPDATE
    TO authenticated
    USING (uploaded_by = auth.uid() OR public.is_admin())
    WITH CHECK (uploaded_by = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can delete texts"
    ON public.analysis_texts FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- analysis_text_comments policies
CREATE POLICY "Comments on published texts are viewable by everyone"
    ON public.analysis_text_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.analysis_texts 
            WHERE id = text_id AND is_published = true
        )
    );

CREATE POLICY "Authenticated users can comment on published texts"
    ON public.analysis_text_comments FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.analysis_texts 
            WHERE id = text_id AND is_published = true
        )
    );

CREATE POLICY "Users can update their own comments"
    ON public.analysis_text_comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments, admins can delete any"
    ON public.analysis_text_comments FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- analysis_text_bookmarks policies
CREATE POLICY "Users can view their own bookmarks"
    ON public.analysis_text_bookmarks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
    ON public.analysis_text_bookmarks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
    ON public.analysis_text_bookmarks FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
    ON public.analysis_text_bookmarks FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- analysis_text_highlights policies
CREATE POLICY "Users can view their own highlights"
    ON public.analysis_text_highlights FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own highlights"
    ON public.analysis_text_highlights FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights"
    ON public.analysis_text_highlights FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights"
    ON public.analysis_text_highlights FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- analysis_text_collaborators policies
CREATE POLICY "Collaborators can view their collaborations"
    ON public.analysis_text_collaborators FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.analysis_texts 
            WHERE id = text_id AND uploaded_by = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "Text owners and admins can manage collaborators"
    ON public.analysis_text_collaborators FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.analysis_texts 
            WHERE id = text_id AND uploaded_by = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "Text owners and admins can update collaborators"
    ON public.analysis_text_collaborators FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.analysis_texts 
            WHERE id = text_id AND uploaded_by = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "Text owners and admins can remove collaborators"
    ON public.analysis_text_collaborators FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.analysis_texts 
            WHERE id = text_id AND uploaded_by = auth.uid()
        )
        OR public.is_admin()
    );

-- analysis_cross_references policies
CREATE POLICY "Cross-references are publicly viewable"
    ON public.analysis_cross_references FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create cross-references"
    ON public.analysis_cross_references FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own cross-references"
    ON public.analysis_cross_references FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own cross-references, admins any"
    ON public.analysis_cross_references FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by OR public.is_admin());

-- analysis_text_presence policies
CREATE POLICY "Presence is viewable by authenticated users"
    ON public.analysis_text_presence FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage their own presence"
    ON public.analysis_text_presence FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence"
    ON public.analysis_text_presence FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presence"
    ON public.analysis_text_presence FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.analysis_text_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analysis_text_presence;

-- ============================================
-- GRANTS
-- ============================================

GRANT ALL ON TABLE public.analysis_texts TO anon;
GRANT ALL ON TABLE public.analysis_texts TO authenticated;
GRANT ALL ON TABLE public.analysis_texts TO service_role;

GRANT ALL ON TABLE public.analysis_text_comments TO anon;
GRANT ALL ON TABLE public.analysis_text_comments TO authenticated;
GRANT ALL ON TABLE public.analysis_text_comments TO service_role;

GRANT ALL ON TABLE public.analysis_text_bookmarks TO anon;
GRANT ALL ON TABLE public.analysis_text_bookmarks TO authenticated;
GRANT ALL ON TABLE public.analysis_text_bookmarks TO service_role;

GRANT ALL ON TABLE public.analysis_text_highlights TO anon;
GRANT ALL ON TABLE public.analysis_text_highlights TO authenticated;
GRANT ALL ON TABLE public.analysis_text_highlights TO service_role;

GRANT ALL ON TABLE public.analysis_text_collaborators TO anon;
GRANT ALL ON TABLE public.analysis_text_collaborators TO authenticated;
GRANT ALL ON TABLE public.analysis_text_collaborators TO service_role;

GRANT ALL ON TABLE public.analysis_cross_references TO anon;
GRANT ALL ON TABLE public.analysis_cross_references TO authenticated;
GRANT ALL ON TABLE public.analysis_cross_references TO service_role;

GRANT ALL ON TABLE public.analysis_text_presence TO anon;
GRANT ALL ON TABLE public.analysis_text_presence TO authenticated;
GRANT ALL ON TABLE public.analysis_text_presence TO service_role;
