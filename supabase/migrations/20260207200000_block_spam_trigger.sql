-- Block spam at the database level with a BEFORE INSERT trigger
-- This cannot be bypassed by bots hitting the Supabase REST API directly

CREATE OR REPLACE FUNCTION public.block_forum_spam()
RETURNS TRIGGER AS $$
DECLARE
  combined_text TEXT;
  spam_patterns TEXT[] := ARRAY[
    '764',
    'fashfront',
    'patriotfront',
    'heil hitler',
    'kill nigger',
    'jewish nigger',
    'botted by',
    'foodism hacker'
  ];
  pattern TEXT;
BEGIN
  -- Combine title and content for checking (handle NULLs)
  combined_text := LOWER(COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));

  FOREACH pattern IN ARRAY spam_patterns
  LOOP
    IF combined_text LIKE '%' || pattern || '%' THEN
      RAISE EXCEPTION 'Post rejected: content violates community guidelines.';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to forum_threads
DROP TRIGGER IF EXISTS block_spam_threads_trigger ON public.forum_threads;
CREATE TRIGGER block_spam_threads_trigger
    BEFORE INSERT ON public.forum_threads
    FOR EACH ROW
    EXECUTE FUNCTION public.block_forum_spam();

-- Apply trigger to forum_comments (comments have content but no title)
DROP TRIGGER IF EXISTS block_spam_comments_trigger ON public.forum_comments;
CREATE TRIGGER block_spam_comments_trigger
    BEFORE INSERT ON public.forum_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.block_forum_spam();

-- Also delete existing spam threads and their comments
DELETE FROM public.forum_comments WHERE thread_id IN (
  SELECT id FROM public.forum_threads 
  WHERE LOWER(title) LIKE '%bots by 764%'
     OR LOWER(title) LIKE '%fashfront%'
     OR LOWER(title) LIKE '%patriotfront%'
     OR LOWER(title) LIKE '%heil hitler%'
     OR LOWER(title) LIKE '%kill nigger%'
     OR LOWER(title) LIKE '%jewish nigger%'
     OR LOWER(content) LIKE '%botted by 764%'
     OR LOWER(content) LIKE '%foodism hacker%'
);

DELETE FROM public.forum_threads 
WHERE LOWER(title) LIKE '%bots by 764%'
   OR LOWER(title) LIKE '%fashfront%'
   OR LOWER(title) LIKE '%patriotfront%'
   OR LOWER(title) LIKE '%heil hitler%'
   OR LOWER(title) LIKE '%kill nigger%'
   OR LOWER(title) LIKE '%jewish nigger%'
   OR LOWER(content) LIKE '%botted by 764%'
   OR LOWER(content) LIKE '%foodism hacker%';
