-- Delete bot spam posts by "764 x foodism hackers"
-- First delete comments on bot threads, then delete the threads themselves
DELETE FROM public.forum_comments WHERE thread_id IN (SELECT id FROM public.forum_threads WHERE title = 'bots by 764');
DELETE FROM public.forum_threads WHERE title = 'bots by 764';
