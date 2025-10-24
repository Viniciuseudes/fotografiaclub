-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies to allow public access
CREATE POLICY "Public Access for Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Authenticated users can update photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos');
