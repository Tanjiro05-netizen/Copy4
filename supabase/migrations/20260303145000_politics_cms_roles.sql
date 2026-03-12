-- Politics CMS + role-based editor permissions

-- 1) Extend profiles with role arrays for editorial and expertise tags
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS editorial_roles text[] DEFAULT '{}'::text[] NOT NULL,
ADD COLUMN IF NOT EXISTS expertise_roles text[] DEFAULT '{}'::text[] NOT NULL;

COMMENT ON COLUMN public.profiles.editorial_roles IS 'Assignable editorial roles (News, Safety, Ideologue, Writer)';
COMMENT ON COLUMN public.profiles.expertise_roles IS 'Assignable profession/study tags (preset + custom)';

-- 2) Ensure politics_articles table exists with CMS fields
CREATE TABLE IF NOT EXISTS public.politics_articles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    excerpt text,
    content text,
    category text DEFAULT 'analysis',
    digest_type text DEFAULT 'world',
    source text DEFAULT 'Editorial Desk',
    image_url text,
    placement text DEFAULT 'side',
    edition_date date DEFAULT CURRENT_DATE,
    status text DEFAULT 'draft' NOT NULL,
    published_at timestamptz,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT politics_articles_status_check CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT politics_articles_placement_check CHECK (placement IN ('lead', 'side', 'bulletin', 'late_edition'))
);

ALTER TABLE public.politics_articles
    ADD COLUMN IF NOT EXISTS slug text,
    ADD COLUMN IF NOT EXISTS title text,
    ADD COLUMN IF NOT EXISTS excerpt text,
    ADD COLUMN IF NOT EXISTS content text,
    ADD COLUMN IF NOT EXISTS category text DEFAULT 'analysis',
    ADD COLUMN IF NOT EXISTS digest_type text DEFAULT 'world',
    ADD COLUMN IF NOT EXISTS source text DEFAULT 'Editorial Desk',
    ADD COLUMN IF NOT EXISTS image_url text,
    ADD COLUMN IF NOT EXISTS placement text DEFAULT 'side',
    ADD COLUMN IF NOT EXISTS edition_date date DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS published_at timestamptz,
    ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'politics_articles_status_check'
    ) THEN
        ALTER TABLE public.politics_articles
        ADD CONSTRAINT politics_articles_status_check CHECK (status IN ('draft', 'published', 'archived'));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'politics_articles_placement_check'
    ) THEN
        ALTER TABLE public.politics_articles
        ADD CONSTRAINT politics_articles_placement_check CHECK (placement IN ('lead', 'side', 'bulletin', 'late_edition'));
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_politics_articles_slug ON public.politics_articles(slug);
CREATE INDEX IF NOT EXISTS idx_politics_articles_created_at ON public.politics_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_politics_articles_status ON public.politics_articles(status);
CREATE INDEX IF NOT EXISTS idx_politics_articles_edition_date ON public.politics_articles(edition_date DESC);
CREATE INDEX IF NOT EXISTS idx_politics_articles_placement ON public.politics_articles(placement);

DROP TRIGGER IF EXISTS set_politics_articles_updated_at ON public.politics_articles;
CREATE TRIGGER set_politics_articles_updated_at
BEFORE UPDATE ON public.politics_articles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 3) Role helper functions for frontend + policies
CREATE OR REPLACE FUNCTION public.has_editorial_role(role_name text, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO public
AS $$
    SELECT COALESCE(
        EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = user_id
              AND EXISTS (
                  SELECT 1
                  FROM unnest(COALESCE(p.editorial_roles, '{}'::text[])) AS role_value
                  WHERE lower(role_value) = lower(role_name)
              )
        )
        OR EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = user_id
              AND lower(COALESCE(p.role, '')) = lower(role_name)
        ),
        false
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_politics(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO public
AS $$
    SELECT COALESCE(
        public.is_admin(user_id) OR public.has_editorial_role('News', user_id),
        false
    );
$$;

GRANT EXECUTE ON FUNCTION public.has_editorial_role(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_politics(uuid) TO authenticated;

-- 4) RLS for politics_articles
ALTER TABLE public.politics_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published politics articles are visible" ON public.politics_articles;
DROP POLICY IF EXISTS "Editors can insert politics articles" ON public.politics_articles;
DROP POLICY IF EXISTS "Editors can update politics articles" ON public.politics_articles;
DROP POLICY IF EXISTS "Editors can delete politics articles" ON public.politics_articles;

CREATE POLICY "Published politics articles are visible"
    ON public.politics_articles FOR SELECT
    TO public
    USING (status = 'published' OR status IS NULL);

CREATE POLICY "Editors can insert politics articles"
    ON public.politics_articles FOR INSERT
    TO authenticated
    WITH CHECK (public.can_manage_politics());

CREATE POLICY "Editors can update politics articles"
    ON public.politics_articles FOR UPDATE
    TO authenticated
    USING (public.can_manage_politics())
    WITH CHECK (public.can_manage_politics());

CREATE POLICY "Editors can delete politics articles"
    ON public.politics_articles FOR DELETE
    TO authenticated
    USING (public.can_manage_politics());

GRANT SELECT ON public.politics_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.politics_articles TO authenticated;
GRANT ALL ON public.politics_articles TO service_role;

-- 5) Dedicated public bucket for politics images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'politics-images',
    'politics-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Politics images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Editors can upload politics images" ON storage.objects;
DROP POLICY IF EXISTS "Editors can update politics images" ON storage.objects;
DROP POLICY IF EXISTS "Editors can delete politics images" ON storage.objects;

CREATE POLICY "Politics images are publicly viewable"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'politics-images');

CREATE POLICY "Editors can upload politics images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'politics-images'
        AND public.can_manage_politics()
    );

CREATE POLICY "Editors can update politics images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'politics-images'
        AND public.can_manage_politics()
    )
    WITH CHECK (
        bucket_id = 'politics-images'
        AND public.can_manage_politics()
    );

CREATE POLICY "Editors can delete politics images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'politics-images'
        AND public.can_manage_politics()
    );
