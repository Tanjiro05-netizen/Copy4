-- Add admin policies for digital_library_books table

-- Allow admins to insert books
CREATE POLICY "Admins can insert books"
    ON public.digital_library_books FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Allow admins to update books
CREATE POLICY "Admins can update books"
    ON public.digital_library_books FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Allow admins to delete books
CREATE POLICY "Admins can delete books"
    ON public.digital_library_books FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Storage bucket policies for library (PDFs)
CREATE POLICY "Admins can upload PDFs to library"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'library' AND public.is_admin());

CREATE POLICY "Anyone can read library PDFs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'library');

CREATE POLICY "Admins can delete library PDFs"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'library' AND public.is_admin());

-- Storage bucket policies for covers (images)
CREATE POLICY "Admins can upload covers"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'covers' AND public.is_admin());

CREATE POLICY "Anyone can read covers"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'covers');

CREATE POLICY "Admins can delete covers"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'covers' AND public.is_admin());
