-- Audit log for profile role changes
-- Records who changed what privileged fields on which profile

CREATE TABLE IF NOT EXISTS public.profile_role_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID,
    changed_fields JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_role_audit_log_target
    ON public.profile_role_audit_log (target_profile_id);

CREATE INDEX IF NOT EXISTS idx_profile_role_audit_log_created
    ON public.profile_role_audit_log (created_at DESC);

-- Trigger function: fires AFTER UPDATE on profiles, logs changes to privileged fields only.
CREATE OR REPLACE FUNCTION public.log_profile_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    changes JSONB := '{}';
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        changes := changes || jsonb_build_object('role', jsonb_build_object('old', OLD.role, 'new', NEW.role));
    END IF;

    IF OLD.is_certified IS DISTINCT FROM NEW.is_certified THEN
        changes := changes || jsonb_build_object('is_certified', jsonb_build_object('old', OLD.is_certified, 'new', NEW.is_certified));
    END IF;

    IF OLD.editorial_roles IS DISTINCT FROM NEW.editorial_roles THEN
        changes := changes || jsonb_build_object('editorial_roles', jsonb_build_object('old', OLD.editorial_roles, 'new', NEW.editorial_roles));
    END IF;

    IF OLD.expertise_roles IS DISTINCT FROM NEW.expertise_roles THEN
        changes := changes || jsonb_build_object('expertise_roles', jsonb_build_object('old', OLD.expertise_roles, 'new', NEW.expertise_roles));
    END IF;

    -- Only log if at least one privileged field actually changed.
    IF changes = '{}' THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.profile_role_audit_log (target_profile_id, actor_id, changed_fields)
    VALUES (NEW.id, auth.uid(), changes);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_profile_role_changes ON public.profiles;
CREATE TRIGGER log_profile_role_changes
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_profile_role_changes();

-- RLS: only admins can read audit log entries
ALTER TABLE public.profile_role_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view role audit log" ON public.profile_role_audit_log;
CREATE POLICY "Admins can view role audit log"
    ON public.profile_role_audit_log FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Service role has full access for system operations
GRANT ALL ON TABLE public.profile_role_audit_log TO service_role;
GRANT SELECT ON TABLE public.profile_role_audit_log TO authenticated;
