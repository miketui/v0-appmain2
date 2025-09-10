-- =====================================================
-- COMPLETE SUPABASE SETUP FOR HAUS OF BASQUIAT PORTAL
-- =====================================================
-- Execute this entire script in Supabase SQL Editor
-- This creates the complete backend infrastructure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom enum types
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
-- CORE TABLES
-- =====================================================

-- Houses/committees table
CREATE TABLE houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  leader_id uuid,
  member_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles (extends auth.users)
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

-- Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL,
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
  attendee_count integer DEFAULT 0,
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

-- Gallery items
CREATE TABLE gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  category text NOT NULL,
  media_type text NOT NULL,
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

-- Chat threads
CREATE TABLE chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  thread_type thread_type NOT NULL,
  participants uuid[],
  created_by uuid REFERENCES user_profiles(id),
  last_message_at timestamptz DEFAULT now(),
  message_count integer DEFAULT 0,
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

-- Documents
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

-- Subscriptions
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

-- Add foreign key constraint
ALTER TABLE houses ADD CONSTRAINT fk_houses_leader 
  FOREIGN KEY (leader_id) REFERENCES user_profiles(id);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_house ON user_profiles(house_id);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_active ON user_profiles(last_active_at DESC);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_house ON posts(house_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_moderation ON posts(moderation_status);

CREATE INDEX idx_gallery_category ON gallery_items(category);
CREATE INDEX idx_gallery_uploader ON gallery_items(uploader_id);
CREATE INDEX idx_gallery_featured ON gallery_items(featured);
CREATE INDEX idx_gallery_moderation ON gallery_items(moderation_status);

CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_house ON events(house_id);
CREATE INDEX idx_events_status ON events(status);

CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gallery_items_updated_at BEFORE UPDATE ON gallery_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chat_threads_updated_at BEFORE UPDATE ON chat_threads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_event_rsvps_updated_at BEFORE UPDATE ON event_rsvps FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update post likes count
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

-- Update comments count
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

-- Update gallery likes count
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

-- Update house member count
CREATE OR REPLACE FUNCTION update_house_member_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT (user joins house)
  IF TG_OP = 'INSERT' AND NEW.house_id IS NOT NULL THEN
    UPDATE houses SET member_count = member_count + 1 WHERE id = NEW.house_id;
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE (user changes house)
  IF TG_OP = 'UPDATE' THEN
    -- Decrement old house
    IF OLD.house_id IS NOT NULL AND OLD.house_id != NEW.house_id THEN
      UPDATE houses SET member_count = member_count - 1 WHERE id = OLD.house_id;
    END IF;
    -- Increment new house
    IF NEW.house_id IS NOT NULL AND OLD.house_id != NEW.house_id THEN
      UPDATE houses SET member_count = member_count + 1 WHERE id = NEW.house_id;
    END IF;
    RETURN NEW;
  END IF;
  
  -- Handle DELETE (user leaves house)
  IF TG_OP = 'DELETE' AND OLD.house_id IS NOT NULL THEN
    UPDATE houses SET member_count = member_count - 1 WHERE id = OLD.house_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER house_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_house_member_count();

-- Notification functions
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id != (SELECT author_id FROM posts WHERE id = NEW.post_id) THEN
    INSERT INTO notifications (user_id, type, title, content, related_id)
    SELECT 
      p.author_id,
      'like',
      up.display_name || ' liked your post! 💖',
      'Your fabulous content is getting the love it deserves!',
      NEW.post_id
    FROM posts p
    JOIN user_profiles up ON up.id = NEW.user_id
    WHERE p.id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_post_like
  AFTER INSERT ON post_likes
  FOR EACH ROW EXECUTE FUNCTION notify_post_like();

-- Community stats function
CREATE OR REPLACE FUNCTION get_community_stats()
RETURNS TABLE(
  total_users bigint,
  active_members bigint,
  pending_applications bigint,
  total_posts bigint,
  total_events bigint,
  total_houses bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_profiles)::bigint,
    (SELECT COUNT(*) FROM user_profiles WHERE role IN ('Member', 'Leader', 'Admin'))::bigint,
    (SELECT COUNT(*) FROM user_applications WHERE status = 'pending')::bigint,
    (SELECT COUNT(*) FROM posts)::bigint,
    (SELECT COUNT(*) FROM events WHERE status = 'published')::bigint,
    (SELECT COUNT(*) FROM houses)::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view published events" ON events FOR SELECT USING (
  status = 'published' OR
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);

CREATE POLICY "Leaders can create events" ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);

CREATE POLICY "Users can view approved gallery items" ON gallery_items FOR SELECT USING (
  moderation_status = 'approved' OR
  uploader_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
);

CREATE POLICY "Members can upload gallery items" ON gallery_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin'))
);

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

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- SEED DATA
-- =====================================================

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

SELECT 'Database schema setup completed successfully!' as message;