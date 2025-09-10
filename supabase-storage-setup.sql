-- =====================================================
-- SUPABASE STORAGE SETUP FOR HAUS OF BASQUIAT PORTAL
-- =====================================================
-- Run this after the main schema setup

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
('documents', 'documents', true, 52428800, 
 ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain']::text[]),
('chat-files', 'chat-files', true, 26214400,
 ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'audio/mpeg', 'application/pdf']::text[]),
('posts-media', 'posts-media', true, 104857600,
 ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']::text[]),
('gallery', 'gallery', true, 209715200,
 ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']::text[]),
('avatars', 'avatars', true, 5242880,
 ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
('event-media', 'event-media', true, 104857600,
 ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']::text[])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Authenticated users can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Storage policies for chat-files bucket
CREATE POLICY "Users can view chat files" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-files' AND 
    auth.role() = 'authenticated' AND 
    owner = auth.uid()
  );

CREATE POLICY "Users can update their chat files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'chat-files' AND owner = auth.uid());

CREATE POLICY "Users can delete their chat files" ON storage.objects
  FOR DELETE USING (bucket_id = 'chat-files' AND owner = auth.uid());

-- Storage policies for posts-media bucket
CREATE POLICY "All users can view post media" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts-media');

CREATE POLICY "Members can upload post media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts-media' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin')) AND
    owner = auth.uid()
  );

CREATE POLICY "Users can update their post media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'posts-media' AND owner = auth.uid());

CREATE POLICY "Users can delete their post media" ON storage.objects
  FOR DELETE USING (bucket_id = 'posts-media' AND owner = auth.uid());

-- Storage policies for gallery bucket
CREATE POLICY "All users can view gallery media" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Members can upload gallery media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin')) AND
    owner = auth.uid()
  );

CREATE POLICY "Users can update their gallery media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'gallery' AND owner = auth.uid());

CREATE POLICY "Users can delete their gallery media" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery' AND owner = auth.uid());

-- Storage policies for avatars bucket  
CREATE POLICY "All users can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND 
    owner = auth.uid()
  );

CREATE POLICY "Users can update their avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Users can delete their avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND owner = auth.uid());

-- Storage policies for event-media bucket
CREATE POLICY "All users can view event media" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-media');

CREATE POLICY "Leaders can upload event media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-media' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Leader', 'Admin')) AND
    owner = auth.uid()
  );

CREATE POLICY "Event creators can update their media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'event-media' AND owner = auth.uid());

CREATE POLICY "Event creators can delete their media" ON storage.objects
  FOR DELETE USING (bucket_id = 'event-media' AND owner = auth.uid());

SELECT 'Storage buckets and policies setup completed!' as message;