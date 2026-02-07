-- Fix is_admin() to safely check role = 'admin' with COALESCE
CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id_to_check" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM profiles WHERE id = user_id_to_check),
    false
  );
$$;

-- Ensure forum threads/comments are viewable by everyone (including guests)
DROP POLICY IF EXISTS "Threads are viewable by authenticated users" ON public.forum_threads;
DROP POLICY IF EXISTS "Threads are viewable by everyone" ON public.forum_threads;
CREATE POLICY "Threads are viewable by everyone"
    ON public.forum_threads FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Comments are viewable by authenticated users" ON public.forum_comments;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.forum_comments;
CREATE POLICY "Comments are viewable by everyone"
    ON public.forum_comments FOR SELECT
    TO public
    USING (true);

-- Admin delete policies for forum
DROP POLICY IF EXISTS "Delete threads policy" ON public.forum_threads;
DROP POLICY IF EXISTS "Users can delete their own threads" ON public.forum_threads;
CREATE POLICY "Users can delete their own threads"
    ON public.forum_threads FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Delete comments policy" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.forum_comments;
CREATE POLICY "Users can delete their own comments"
    ON public.forum_comments FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id OR public.is_admin());
