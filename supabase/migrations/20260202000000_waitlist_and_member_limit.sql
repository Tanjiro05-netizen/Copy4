-- Waitlist table for users who want to join when spots open
CREATE TABLE IF NOT EXISTS public.waitlist (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts to waitlist (anyone can join)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
    FOR INSERT WITH CHECK (true);

-- Only admins can view/manage waitlist
CREATE POLICY "Admins can view waitlist" ON public.waitlist
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can delete from waitlist" ON public.waitlist
    FOR DELETE USING (public.is_admin());

-- Function to get current member count
CREATE OR REPLACE FUNCTION public.get_member_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::integer FROM public.profiles;
$$;

-- Grant execute to all
GRANT EXECUTE ON FUNCTION public.get_member_count() TO anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON TABLE public.waitlist TO anon;
GRANT ALL ON TABLE public.waitlist TO authenticated;
GRANT ALL ON TABLE public.waitlist TO service_role;
