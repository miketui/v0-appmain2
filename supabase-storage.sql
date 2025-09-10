-- =====================================================
-- SUPABASE STORAGE SETUP FOR HAUS OF BASQUIAT PORTAL
-- =====================================================
-- Run this after the main schema setup
-- Execute in Supabase SQL Editor (Database > SQL Editor)

-- =====================================================
-- SECTION 1: CREATE STORAGE BUCKETS
-- =====================================================

-- Documents bucket (for community documents, guidelines, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'documents', 
  'documents', 
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Chat files bucket (for file sharing in messages)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'chat-files', 
  'chat-files', 
  true,
  26214400, -- 25MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Posts media bucket (for social feed posts)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'posts-media', 
  'posts-media', 
  true,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Gallery bucket (for ballroom performances, fashion, portraits)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'gallery', 
  'gallery', 
  true,
  209715200, -- 200MB limit for high-quality media
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Avatars bucket (for user profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Event media bucket (for event photos, streaming thumbnails)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'event-media', 
  'event-media', 
  true,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']::text[]
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SECTION 2: STORAGE POLICIES
-- =====================================================

-- =====================================================
-- DOCUMENTS BUCKET POLICIES
-- =====================================================

CREATE POLICY "Authenticated users can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "Admins can update documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "Admins can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- =====================================================
-- CHAT FILES BUCKET POLICIES
-- =====================================================

CREATE POLICY "Users can view chat files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-files' AND
    auth.role() = 'authenticated' AND
    owner = auth.uid()
  );

CREATE POLICY "Users can update their chat files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'chat-files' AND
    owner = auth.uid()
  );

CREATE POLICY "Users can delete their chat files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-files' AND
    owner = auth.uid()
  );

-- =====================================================
-- POSTS MEDIA BUCKET POLICIES
-- =====================================================

CREATE POLICY "All users can view post media" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts-media');

CREATE POLICY "Members can upload post media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts-media' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin')) AND
    owner = auth.uid()
  );

CREATE POLICY "Users can update their own post media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'posts-media' AND
    owner = auth.uid()
  );

CREATE POLICY "Users can delete their own post media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts-media' AND
    owner = auth.uid()
  );

-- =====================================================
-- GALLERY BUCKET POLICIES
-- =====================================================

CREATE POLICY "All users can view gallery media" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Members can upload gallery media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin')) AND
    owner = auth.uid()
  );

CREATE POLICY "Users can update their own gallery media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gallery' AND
    owner = auth.uid()
  );

CREATE POLICY "Users can delete their own gallery media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery' AND
    owner = auth.uid()
  );

-- =====================================================
-- AVATARS BUCKET POLICIES
-- =====================================================

CREATE POLICY "All users can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    owner = auth.uid()
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    owner = auth.uid()
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    owner = auth.uid()
  );

-- =====================================================
-- EVENT MEDIA BUCKET POLICIES
-- =====================================================

CREATE POLICY "All users can view event media" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-media');

CREATE POLICY "Leaders can upload event media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-media' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Leader', 'Admin')) AND
    owner = auth.uid()
  );

CREATE POLICY "Event creators can update their media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-media' AND
    owner = auth.uid()
  );

CREATE POLICY "Event creators can delete their media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-media' AND
    owner = auth.uid()
  );

-- =====================================================
-- SECTION 3: HELPER FUNCTIONS
-- =====================================================

-- Function to generate unique filename for uploads
CREATE OR REPLACE FUNCTION generate_upload_filename(bucket_name text, original_filename text)
RETURNS text AS $$
DECLARE
  extension text;
  base_name text;
  timestamp_str text;
BEGIN
  -- Extract file extension
  extension := regexp_replace(original_filename, '.*\.([^.]+)$', '\1', 'i');
  
  -- Generate timestamp
  timestamp_str := to_char(now(), 'YYYY-MM-DD_HH24-MI-SS');
  
  -- Generate unique filename
  base_name := gen_random_uuid()::text;
  
  RETURN bucket_name || '/' || auth.uid()::text || '/' || timestamp_str || '_' || base_name || '.' || extension;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned storage objects
CREATE OR REPLACE FUNCTION cleanup_orphaned_storage()
RETURNS void AS $$
BEGIN
  -- This function can be called periodically to clean up files
  -- that are no longer referenced in the database
  
  -- Clean up gallery items media that don't exist in gallery_items table
  DELETE FROM storage.objects 
  WHERE bucket_id = 'gallery' 
  AND NOT EXISTS (
    SELECT 1 FROM gallery_items 
    WHERE media_url LIKE '%' || name || '%'
  );
  
  -- Clean up post media that don't exist in posts table
  DELETE FROM storage.objects 
  WHERE bucket_id = 'posts-media' 
  AND NOT EXISTS (
    SELECT 1 FROM posts 
    WHERE media_urls::text LIKE '%' || name || '%'
  );
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMPLETION CHECK
-- =====================================================

-- Create a view to verify storage setup
CREATE OR REPLACE VIEW storage_setup_completion AS
SELECT 
  'Storage buckets setup completed successfully!' as message,
  (SELECT COUNT(*) FROM storage.buckets WHERE name IN ('documents', 'chat-files', 'posts-media', 'gallery', 'avatars', 'event-media')) as buckets_created,
  'Next: Configure authentication settings' as next_step;

SELECT * FROM storage_setup_completion;