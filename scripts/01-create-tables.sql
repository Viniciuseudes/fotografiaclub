-- Create submissions table to store user photo upload requests
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link para o usuário autenticado
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  specialty TEXT NOT NULL,
  user_specialty TEXT NOT NULL,
  desired_elements TEXT NOT NULL,
  phone TEXT,
 status TEXT DEFAULT 'awaiting_photo' CHECK (status IN ('awaiting_photo', 'pending', 'processing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table to store both original and processed photos
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('original', 'processed')),
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_submission_id ON photos(submission_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id); -- Novo índice

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Apaga políticas antigas (se existirem) para evitar conflitos
DROP POLICY IF EXISTS "Allow all operations on submissions" ON submissions;
DROP POLICY IF EXISTS "Allow all operations on photos" ON photos;

-- Create policies (Restritas para usuários logados)
-- Usuários podem criar submissões para si mesmos
CREATE POLICY "Allow authenticated users to create submissions"
ON submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem ler suas próprias submissões
CREATE POLICY "Allow authenticated users to read their own submissions"
ON submissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem criar fotos para suas próprias submissões
CREATE POLICY "Allow authenticated users to create photos for their submissions"
ON photos FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = (SELECT user_id FROM submissions WHERE id = submission_id)
);

-- Usuários podem ler fotos de suas próprias submissões
CREATE POLICY "Allow authenticated users to read photos from their submissions"
ON photos FOR SELECT
TO authenticated
USING (
  auth.uid() = (SELECT user_id FROM submissions WHERE id = submission_id)
);

-- Admin (service_role) bypassa RLS. O painel de admin continuará funcionando.