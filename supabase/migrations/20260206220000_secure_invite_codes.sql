-- Remove the public SELECT policy that exposes all invite codes
DROP POLICY IF EXISTS "Anyone can validate codes" ON public.invite_codes;

-- Add a secure validation function that only returns whether a code is valid (no data leakage)
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.invite_codes
        WHERE code = UPPER(p_code)
          AND is_active = true
          AND used_by IS NULL
    ) THEN
        RETURN json_build_object('valid', true);
    ELSE
        RETURN json_build_object('valid', false);
    END IF;
END;
$$;
