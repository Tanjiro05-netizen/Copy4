-- ============================================
-- SERVER-SIDE FORUM RATE LIMITING
-- Enforces posting limits at the database level via RLS.
-- ============================================

-- Rate-limit check function
-- action_type: 'thread' or 'comment'
-- Returns TRUE if the user is within limits, FALSE if rate-limited.
CREATE OR REPLACE FUNCTION public.check_forum_rate_limit(
  p_user_id UUID,
  p_action_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  IF p_action_type = 'thread' THEN
    -- Max 5 threads per 10 minutes
    SELECT COUNT(*) INTO recent_count
    FROM public.forum_threads
    WHERE author_id = p_user_id
      AND created_at > (now() - interval '10 minutes');
    RETURN recent_count < 5;

  ELSIF p_action_type = 'comment' THEN
    -- Max 15 comments per 5 minutes
    SELECT COUNT(*) INTO recent_count
    FROM public.forum_comments
    WHERE author_id = p_user_id
      AND created_at > (now() - interval '5 minutes');
    RETURN recent_count < 15;

  ELSE
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update thread INSERT policy to include rate limit check
DROP POLICY IF EXISTS "Users can create threads" ON public.forum_threads;
CREATE POLICY "Users can create threads"
    ON public.forum_threads FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = author_id
      AND public.check_forum_rate_limit(auth.uid(), 'thread')
    );

-- Update comment INSERT policy to include rate limit check
DROP POLICY IF EXISTS "Users can create comments" ON public.forum_comments;
CREATE POLICY "Users can create comments"
    ON public.forum_comments FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = author_id
      AND public.check_forum_rate_limit(auth.uid(), 'comment')
    );
