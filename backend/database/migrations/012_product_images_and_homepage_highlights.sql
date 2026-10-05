CREATE TABLE homepage_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120),
  description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 1000),
  image_path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX homepage_highlights_active_order_idx ON homepage_highlights (is_active, display_order, created_at);
CREATE TRIGGER homepage_highlights_set_updated_at
BEFORE UPDATE ON homepage_highlights
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE homepage_highlights ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE homepage_highlights FROM anon, authenticated, PUBLIC;

CREATE OR REPLACE FUNCTION public.is_active_berry_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active)
$$;
REVOKE ALL ON FUNCTION public.is_active_berry_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_berry_admin() TO authenticated;

-- These buckets contain only intentionally public catalog and homepage imagery.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('homepage-highlights', 'homepage-highlights', TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT TO public
USING (bucket_id IN ('product-images', 'homepage-highlights'));

DROP POLICY IF EXISTS "Active admins can manage BERRY images" ON storage.objects;
CREATE POLICY "Active admins can manage BERRY images" ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id IN ('product-images', 'homepage-highlights')
  AND public.is_active_berry_admin()
)
WITH CHECK (
  bucket_id IN ('product-images', 'homepage-highlights')
  AND public.is_active_berry_admin()
);
