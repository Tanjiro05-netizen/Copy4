-- Fix infinite recursion in analysis_texts RLS policies
-- The issue: analysis_texts policy references analysis_text_collaborators, 
-- which references analysis_texts, causing infinite recursion

-- ============================================
-- DROP PROBLEMATIC POLICIES
-- ============================================

DROP POLICY IF EXISTS "Published texts are viewable by everyone" ON public.analysis_texts;
DROP POLICY IF EXISTS "Unpublished texts viewable by owner or collaborators" ON public.analysis_texts;
DROP POLICY IF EXISTS "Collaborators can view their collaborations" ON public.analysis_text_collaborators;
DROP POLICY IF EXISTS "Text owners and admins can manage collaborators" ON public.analysis_text_collaborators;
DROP POLICY IF EXISTS "Text owners and admins can update collaborators" ON public.analysis_text_collaborators;
DROP POLICY IF EXISTS "Text owners and admins can remove collaborators" ON public.analysis_text_collaborators;

-- ============================================
-- CREATE HELPER FUNCTION (SECURITY DEFINER breaks recursion)
-- ============================================

CREATE OR REPLACE FUNCTION public.is_analysis_text_collaborator(p_text_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.analysis_text_collaborators 
        WHERE text_id = p_text_id AND user_id = p_user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.is_analysis_text_owner(p_text_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.analysis_texts 
        WHERE id = p_text_id AND uploaded_by = p_user_id
    );
$$;

-- ============================================
-- RECREATE POLICIES WITHOUT RECURSION
-- ============================================

-- Single combined SELECT policy for analysis_texts
CREATE POLICY "Users can view published texts or texts they own/collaborate on"
    ON public.analysis_texts FOR SELECT
    USING (
        is_published = true
        OR uploaded_by = auth.uid()
        OR public.is_analysis_text_collaborator(id, auth.uid())
        OR public.is_admin()
    );

-- Collaborators policies (use helper function to avoid recursion)
CREATE POLICY "Collaborators can view their collaborations"
    ON public.analysis_text_collaborators FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.is_analysis_text_owner(text_id, auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Text owners and admins can manage collaborators"
    ON public.analysis_text_collaborators FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_analysis_text_owner(text_id, auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Text owners and admins can update collaborators"
    ON public.analysis_text_collaborators FOR UPDATE
    TO authenticated
    USING (
        public.is_analysis_text_owner(text_id, auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Text owners and admins can remove collaborators"
    ON public.analysis_text_collaborators FOR DELETE
    TO authenticated
    USING (
        public.is_analysis_text_owner(text_id, auth.uid())
        OR public.is_admin()
    );

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION public.is_analysis_text_collaborator TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_analysis_text_owner TO anon, authenticated, service_role;
