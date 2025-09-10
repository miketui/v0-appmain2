-- =====================================================
-- SUPABASE WEBHOOKS FOR REAL-TIME FEATURES
-- =====================================================
-- Run this after main schema setup
-- These webhooks enable real-time notifications and features

-- =====================================================
-- SECTION 1: NOTIFICATION FUNCTIONS
-- =====================================================

-- Function to create notification when user gets a like
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if someone else liked the post (not self-like)
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

-- Function to create notification for new comments
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify post author (if not commenting on their own post)
  IF NEW.author_id != (SELECT author_id FROM posts WHERE id = NEW.post_id) THEN
    INSERT INTO notifications (user_id, type, title, content, related_id)
    SELECT 
      p.author_id,
      'comment',
      up.display_name || ' commented on your post! 💬',
      LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
      NEW.post_id
    FROM posts p
    JOIN user_profiles up ON up.id = NEW.author_id
    WHERE p.id = NEW.post_id;
  END IF;
  
  -- If this is a reply, also notify the parent comment author
  IF NEW.reply_to IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, content, related_id)
    SELECT 
      c.author_id,
      'comment',
      up.display_name || ' replied to your comment! 💬',
      LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
      NEW.post_id
    FROM comments c
    JOIN user_profiles up ON up.id = NEW.author_id
    WHERE c.id = NEW.reply_to 
    AND c.author_id != NEW.author_id; -- Don't notify if replying to self
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  participant_id uuid;
BEGIN
  -- Notify all participants in the thread (except the sender)
  FOR participant_id IN 
    SELECT unnest(participants) 
    FROM chat_threads 
    WHERE id = NEW.thread_id
  LOOP
    IF participant_id != NEW.sender_id THEN
      INSERT INTO notifications (user_id, type, title, content, related_id)
      SELECT 
        participant_id,
        'message',
        CASE 
          WHEN ct.thread_type = 'direct' THEN up.display_name || ' sent you a message! 📩'
          ELSE up.display_name || ' sent a message in ' || COALESCE(ct.name, 'group chat') || ' 💬'
        END,
        CASE 
          WHEN NEW.message_type = 'text' THEN LEFT(NEW.content, 100)
          WHEN NEW.message_type = 'image' THEN '📷 Sent an image'
          ELSE '📎 Sent a file'
        END,
        NEW.thread_id
      FROM user_profiles up
      JOIN chat_threads ct ON ct.id = NEW.thread_id
      WHERE up.id = NEW.sender_id;
    END IF;
  END LOOP;
  
  -- Update thread's last_message_at
  UPDATE chat_threads 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify when application status changes
CREATE OR REPLACE FUNCTION notify_application_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO notifications (user_id, type, title, content, related_id)
    VALUES (
      NEW.user_id,
      'application',
      CASE 
        WHEN NEW.status = 'approved' THEN 'Welcome to the Haus! 🎉'
        WHEN NEW.status = 'rejected' THEN 'Application Update 📋'
        ELSE 'Application Status Changed 📋'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Your application has been approved! Welcome to the Haus of Basquiat family! ✨'
        WHEN NEW.status = 'rejected' THEN 'Your application needs some updates. Check your application for feedback.'
        ELSE 'Your application status has been updated.'
      END,
      NEW.id
    );
    
    -- If approved, update user role to Member
    IF NEW.status = 'approved' THEN
      UPDATE user_profiles 
      SET role = 'Member', status = 'active' 
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify about new events
CREATE OR REPLACE FUNCTION notify_new_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify when event becomes published
  IF OLD.status != 'published' AND NEW.status = 'published' THEN
    -- Notify all house members if it's a house event
    IF NEW.house_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, content, related_id)
      SELECT 
        up.id,
        'system',
        'New ' || NEW.event_type || ' event! 🎭',
        NEW.title || ' - ' || to_char(NEW.start_time, 'Mon DD at HH12:MI AM'),
        NEW.id
      FROM user_profiles up
      WHERE up.house_id = NEW.house_id
      AND up.role IN ('Member', 'Leader', 'Admin')
      AND up.id != NEW.created_by; -- Don't notify the creator
    ELSE
      -- Notify all members for community-wide events
      INSERT INTO notifications (user_id, type, title, content, related_id)
      SELECT 
        up.id,
        'system',
        'New community event! 🌈',
        NEW.title || ' - ' || to_char(NEW.start_time, 'Mon DD at HH12:MI AM'),
        NEW.id
      FROM user_profiles up
      WHERE up.role IN ('Member', 'Leader', 'Admin')
      AND up.id != NEW.created_by; -- Don't notify the creator
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user last_active_at
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles 
  SET last_active_at = now() 
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 2: CREATE TRIGGERS
-- =====================================================

-- Post likes notifications
CREATE TRIGGER trigger_notify_post_like
  AFTER INSERT ON post_likes
  FOR EACH ROW EXECUTE FUNCTION notify_post_like();

-- Comment notifications
CREATE TRIGGER trigger_notify_new_comment
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_new_comment();

-- Message notifications
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- Application status notifications
CREATE TRIGGER trigger_notify_application_status
  AFTER UPDATE ON user_applications
  FOR EACH ROW EXECUTE FUNCTION notify_application_status();

-- Event notifications
CREATE TRIGGER trigger_notify_new_event
  AFTER UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION notify_new_event();

-- User activity tracking (update last_active_at on various actions)
CREATE TRIGGER trigger_update_activity_posts
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER trigger_update_activity_messages
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER trigger_update_activity_comments
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

-- =====================================================
-- SECTION 3: REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Function to check if user can access thread (for real-time subscriptions)
CREATE OR REPLACE FUNCTION user_can_access_thread(thread_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chat_threads 
    WHERE id = thread_id 
    AND auth.uid() = ANY(participants)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can see post (for real-time subscriptions)
CREATE OR REPLACE FUNCTION user_can_see_post(post_id uuid)
RETURNS boolean AS $$
DECLARE
  post_record posts%rowtype;
  user_record user_profiles%rowtype;
BEGIN
  SELECT * INTO post_record FROM posts WHERE id = post_id;
  SELECT * INTO user_record FROM user_profiles WHERE id = auth.uid();
  
  -- Public posts are visible to all
  IF post_record.visibility = 'public' THEN
    RETURN true;
  END IF;
  
  -- Author can always see their own posts
  IF post_record.author_id = auth.uid() THEN
    RETURN true;
  END IF;
  
  -- Members-only posts require member status
  IF post_record.visibility = 'members_only' AND user_record.role IN ('Member', 'Leader', 'Admin') THEN
    RETURN true;
  END IF;
  
  -- House-only posts require same house membership
  IF post_record.visibility = 'house_only' AND user_record.house_id = post_record.house_id THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 4: CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean up old notifications (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Delete read notifications older than 30 days
  DELETE FROM notifications 
  WHERE read_at IS NOT NULL 
  AND read_at < (now() - INTERVAL '30 days');
  
  -- Delete unread notifications older than 90 days
  DELETE FROM notifications 
  WHERE read_at IS NULL 
  AND created_at < (now() - INTERVAL '90 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old login codes
CREATE OR REPLACE FUNCTION cleanup_old_login_codes()
RETURNS void AS $$
BEGIN
  -- Clear login codes older than 1 hour
  UPDATE user_profiles 
  SET login_code = NULL 
  WHERE login_code IS NOT NULL 
  AND updated_at < (now() - INTERVAL '1 hour');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 5: ANALYTICS FUNCTIONS
-- =====================================================

-- Function to track daily active users
CREATE OR REPLACE FUNCTION get_daily_active_users(date_param date DEFAULT CURRENT_DATE)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT id)
    FROM user_profiles
    WHERE last_active_at::date = date_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get community stats
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
    (SELECT COUNT(*) FROM user_profiles) as total_users,
    (SELECT COUNT(*) FROM user_profiles WHERE role IN ('Member', 'Leader', 'Admin')) as active_members,
    (SELECT COUNT(*) FROM user_applications WHERE status = 'pending') as pending_applications,
    (SELECT COUNT(*) FROM posts) as total_posts,
    (SELECT COUNT(*) FROM events WHERE status = 'published') as total_events,
    (SELECT COUNT(*) FROM houses) as total_houses;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 6: WEBHOOK ENDPOINTS
-- =====================================================

-- Create a table to track webhook deliveries (optional)
CREATE TABLE webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  payload jsonb,
  delivered_at timestamptz,
  status text, -- 'pending', 'delivered', 'failed'
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Function to log webhook events
CREATE OR REPLACE FUNCTION log_webhook_event(
  event_type text,
  table_name text,
  record_id uuid,
  payload jsonb
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO webhook_logs (event_type, table_name, record_id, payload, status)
  VALUES (event_type, table_name, record_id, payload, 'pending')
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMPLETION CHECK
-- =====================================================

-- Create a view to verify webhook setup
CREATE OR REPLACE VIEW webhooks_setup_completion AS
SELECT 
  'Webhooks and real-time features setup completed!' as message,
  'Real-time notifications, activity tracking, and analytics ready' as features,
  'Backend setup is now complete! 🎉' as next_step;

SELECT * FROM webhooks_setup_completion;