-- P0 hardening for politics CMS visibility + profile privilege protections

-- 1) Let politics editors/admins read all politics rows (including drafts/archived)
DROP POLICY IF EXISTS "Editors can view all politics articles" ON public.politics_articles;
CREATE POLICY "Editors can view all politics articles"
    ON public.politics_articles FOR SELECT
    TO authenticated
    USING (public.can_manage_politics());

-- Keep public visibility constrained to already-published dispatches.
DROP POLICY IF EXISTS "Published politics articles are visible" ON public.politics_articles;
CREATE POLICY "Published politics articles are visible"
    ON public.politics_articles FOR SELECT
    TO public
    USING (
        (status = 'published' AND (published_at IS NULL OR published_at <= now()))
        OR status IS NULL
    );

-- 2) Tighten broad table grants on profiles
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.profiles FROM authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- 3) Prevent non-admin users from modifying privileged profile fields
--    (role / certification / editorial and expertise role arrays)
CREATE OR REPLACE FUNCTION public.enforce_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
    -- System/service writes without an authenticated user context should pass through.
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    -- Admins are allowed to manage privileged fields.
    IF public.is_admin(auth.uid()) THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        NEW.role := 'user';
        NEW.is_certified := false;
        NEW.editorial_roles := '{}'::text[];
        NEW.expertise_roles := '{}'::text[];
        RETURN NEW;
    END IF;

    NEW.role := OLD.role;
    NEW.is_certified := OLD.is_certified;
    NEW.editorial_roles := COALESCE(OLD.editorial_roles, '{}'::text[]);
    NEW.expertise_roles := COALESCE(OLD.expertise_roles, '{}'::text[]);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_privileged_fields ON public.profiles;
CREATE TRIGGER enforce_profile_privileged_fields
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_privileged_fields();
