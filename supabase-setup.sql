-- =====================================================
-- SUPABASE SETUP FOR HAUS OF BASQUIAT PORTAL
-- =====================================================
-- Run this script in your Supabase SQL Editor (Database > SQL Editor)
-- Execute sections in order for proper setup

-- =====================================================
-- SECTION 1: EXTENSIONS AND TYPES
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('Applicant', 'Member', 'Leader', 'Admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'banned');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'flagged');
CREATE TYPE thread_type AS ENUM ('direct', 'group');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file');
CREATE TYPE post_visibility AS ENUM ('public', 'house_only', 'members_only');
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'message', 'application', 'system');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE rsvp_status AS ENUM ('attending', 'not_attending', 'maybe');

-- =====================================================
-- SECTION 2: CORE TABLES
-- =====================================================

-- Houses/committees table
CREATE TABLE houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  leader_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Extended users table (extends auth.users)
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role user_role DEFAULT 'Applicant',
  house_id uuid REFERENCES houses(id),
  status user_status DEFAULT 'pending',
  display_name text,
  bio text,
  avatar_url text,
  phone text,
  date_of_birth date,
  pronouns text,
  ballroom_experience text,
  social_links jsonb DEFAULT '{}',
  profile_data jsonb DEFAULT '{}',
  login_code text UNIQUE,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User applications
CREATE TABLE user_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  applicant_data jsonb NOT NULL,
  status application_status DEFAULT 'pending',
  review_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES user_profiles(id)
);

-- Events table (new for ballroom events)
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL, -- 'battle', 'workshop', 'social', 'meeting'
  location text,
  virtual_link text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  max_attendees integer,
  registration_required boolean DEFAULT false,
  status event_status DEFAULT 'draft',
  house_id uuid REFERENCES houses(id),
  created_by uuid REFERENCES user_profiles(id),
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event RSVPs
CREATE TABLE event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  status rsvp_status NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Gallery items (media gallery)
CREATE TABLE gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  category text NOT NULL, -- 'performance', 'fashion', 'runway', 'portrait'
  media_type text NOT NULL, -- 'image', 'video'
  media_url text NOT NULL,
  thumbnail_url text,
  uploader_id uuid REFERENCES user_profiles(id) NOT NULL,
  house_id uuid REFERENCES houses(id),
  tags text[],
  likes_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  moderation_status moderation_status DEFAULT 'pending',
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gallery likes
CREATE TABLE gallery_likes (
  gallery_item_id uuid REFERENCES gallery_items(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (gallery_item_id, user_id)
);

-- Documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  uploader_id uuid REFERENCES user_profiles(id) NOT NULL,
  access_level user_role DEFAULT 'Member',
  download_count integer DEFAULT 0,
  moderation_status moderation_status DEFAULT 'pending',
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document downloads tracking
CREATE TABLE document_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  downloaded_at timestamptz DEFAULT now()
);

-- Chat threads
CREATE TABLE chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  thread_type thread_type NOT NULL,
  participants uuid[],
  created_by uuid REFERENCES user_profiles(id),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text,
  message_type message_type DEFAULT 'text',
  file_url text,
  reply_to uuid REFERENCES messages(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Message read receipts
CREATE TABLE message_reads (
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  thread_id uuid REFERENCES chat_threads(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, thread_id)
);

-- Posts
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text,
  media_urls text[],
  ai_caption text,
  moderation_status moderation_status DEFAULT 'pending',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  house_id uuid REFERENCES houses(id),
  visibility post_visibility DEFAULT 'public',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post likes
CREATE TABLE post_likes (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Comments
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  reply_to uuid REFERENCES comments(id),
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comment likes
CREATE TABLE comment_likes (
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

-- Notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  content text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Subscriptions and payments
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL,
  price_id text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- SECTION 3: FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key constraint for house leader
ALTER TABLE houses ADD CONSTRAINT fk_houses_leader 
  FOREIGN KEY (leader_id) REFERENCES user_profiles(id);

-- =====================================================
-- SECTION 4: INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_house ON user_profiles(house_id);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- Documents indexes
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploader ON documents(uploader_id);

-- Messages indexes
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Posts indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_house ON posts(house_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- Gallery indexes
CREATE INDEX idx_gallery_category ON gallery_items(category);
CREATE INDEX idx_gallery_uploader ON gallery_items(uploader_id);
CREATE INDEX idx_gallery_featured ON gallery_items(featured);

-- Events indexes
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_house ON events(house_id);
CREATE INDEX idx_events_status ON events(status);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read_at);

-- =====================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECTION 6: RLS POLICIES
-- =====================================================

-- User profiles policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User applications policies
CREATE POLICY "Users can view own applications" ON user_applications FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Users can create applications" ON user_applications FOR INSERT WITH CHECK (user_id = auth.uid());

-- Events policies
CREATE POLICY "Users can view published events" ON events FOR SELECT USING (
  status = 'published' OR
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);
CREATE POLICY "Leaders can create events" ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);
CREATE POLICY "Creators can update their events" ON events FOR UPDATE USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Gallery policies
CREATE POLICY "Users can view approved gallery items" ON gallery_items FOR SELECT USING (
  moderation_status = 'approved' OR
  uploader_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);
CREATE POLICY "Members can upload gallery items" ON gallery_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin'))
);
CREATE POLICY "Users can update own gallery items" ON gallery_items FOR UPDATE USING (uploader_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can view documents based on access level" ON documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (
      CASE 
        WHEN documents.access_level = 'Admin' THEN role = 'Admin'
        WHEN documents.access_level = 'Leader' THEN role IN ('Admin', 'Leader')
        ELSE role IN ('Admin', 'Leader', 'Member')
      END
    )
  )
);
CREATE POLICY "Admins can upload documents" ON documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Posts policies
CREATE POLICY "Users can view posts" ON posts FOR SELECT USING (
  visibility = 'public' OR
  (visibility = 'members_only' AND EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin')
  )) OR
  (visibility = 'house_only' AND EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND house_id = posts.house_id
  )) OR
  author_id = auth.uid()
);
CREATE POLICY "Members can create posts" ON posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin'))
);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (author_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their threads" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_threads 
    WHERE id = thread_id AND auth.uid() = ANY(participants)
  )
);
CREATE POLICY "Users can send messages to their threads" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_threads 
    WHERE id = thread_id AND auth.uid() = ANY(participants)
  )
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- SECTION 7: FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gallery_items_updated_at BEFORE UPDATE ON gallery_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chat_threads_updated_at BEFORE UPDATE ON chat_threads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_event_rsvps_updated_at BEFORE UPDATE ON event_rsvps FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function to update post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Function to update gallery likes count
CREATE OR REPLACE FUNCTION update_gallery_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_items SET likes_count = likes_count + 1 WHERE id = NEW.gallery_item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_items SET likes_count = likes_count - 1 WHERE id = OLD.gallery_item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gallery_likes_count_trigger
  AFTER INSERT OR DELETE ON gallery_likes
  FOR EACH ROW EXECUTE FUNCTION update_gallery_likes_count();

-- =====================================================
-- SECTION 8: SEED DATA
-- =====================================================

-- Insert default houses
INSERT INTO houses (name, category, description) VALUES
('House of Eleganza', 'Ballroom', 'Celebrating grace, poise, and sophisticated performance'),
('House of Avant-Garde', 'Ballroom', 'Pushing boundaries with innovative and artistic expression'),
('House of Butch Realness', 'Ballroom', 'Authentic masculine presentation and energy'),
('House of Femme', 'Ballroom', 'Celebrating feminine beauty and presentation'),
('House of Bizarre', 'Ballroom', 'Unique, unconventional, and extraordinary performances'),
('House of Face', 'Ballroom', 'Beauty, makeup artistry, and flawless presentation'),
('House of Body', 'Ballroom', 'Celebrating physical form and athletic performance'),
('House of Runway', 'Ballroom', 'High fashion presentation and catwalk excellence'),
('Leadership Committee', 'Administrative', 'Community leaders and organizers'),
('Events Committee', 'Administrative', 'Event planning and coordination'),
('Mentorship Committee', 'Administrative', 'New member guidance and support'),
('Safety Committee', 'Administrative', 'Community safety and conflict resolution');

-- Create sample categories for organization
INSERT INTO gallery_items (title, description, category, media_type, media_url, uploader_id, tags, moderation_status) 
SELECT 
  'Sample Gallery Item',
  'This is a placeholder item for the gallery',
  'performance',
  'image',
  'https://via.placeholder.com/800x600',
  '00000000-0000-0000-0000-000000000000',
  ARRAY['sample', 'placeholder'],
  'approved'
WHERE FALSE; -- This won't insert anything, just creates the structure

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Create a view to check setup completion
CREATE OR REPLACE VIEW setup_completion AS
SELECT 
  'Database schema setup completed successfully!' as message,
  (SELECT COUNT(*) FROM houses) as houses_count,
  'Next: Set up storage buckets and authentication' as next_step;

SELECT * FROM setup_completion;