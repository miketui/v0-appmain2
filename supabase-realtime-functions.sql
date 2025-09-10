-- =====================================================
-- REAL-TIME WEBHOOK FUNCTIONS FOR HAUS OF BASQUIAT
-- =====================================================
-- Run this after main schema setup for real-time features

-- =====================================================
-- NOTIFICATION TRIGGER FUNCTIONS
-- =====================================================

-- Function to create notification for new comments
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify post author (if not commenting on own post)
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
  
  -- If reply, notify parent comment author  
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
    AND c.author_id != NEW.author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify about new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  participant_id uuid;
BEGIN
  -- Update thread's last_message_at and message_count
  UPDATE chat_threads 
  SET 
    last_message_at = NEW.created_at,
    message_count = message_count + 1
  WHERE id = NEW.thread_id;
  
  -- Notify all participants except sender
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
          WHEN NEW.message_type = 'text' THEN LEFT(COALESCE(NEW.content, ''), 100)
          WHEN NEW.message_type = 'image' THEN '📷 Sent an image'
          ELSE '📎 Sent a file'
        END,
        NEW.thread_id
      FROM user_profiles up
      JOIN chat_threads ct ON ct.id = NEW.thread_id
      WHERE up.id = NEW.sender_id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle application status changes
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
    
    -- Auto-promote to Member if approved
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
    -- Update event attendee count (initialize to 0)
    UPDATE events SET attendee_count = 0 WHERE id = NEW.id;
    
    -- Notify relevant users
    IF NEW.house_id IS NOT NULL THEN
      -- House-specific event
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
      AND up.id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000'::uuid);
    ELSE
      -- Community-wide event
      INSERT INTO notifications (user_id, type, title, content, related_id)
      SELECT 
        up.id,
        'system',
        'New community event! 🌈',
        NEW.title || ' - ' || to_char(NEW.start_time, 'Mon DD at HH12:MI AM'),
        NEW.id
      FROM user_profiles up
      WHERE up.role IN ('Member', 'Leader', 'Admin')
      AND up.id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000'::uuid);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'attending' THEN
      UPDATE events SET attendee_count = attendee_count + 1 WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != NEW.status THEN
      IF OLD.status = 'attending' THEN
        UPDATE events SET attendee_count = attendee_count - 1 WHERE id = NEW.event_id;
      END IF;
      IF NEW.status = 'attending' THEN
        UPDATE events SET attendee_count = attendee_count + 1 WHERE id = NEW.event_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'attending' THEN
      UPDATE events SET attendee_count = attendee_count - 1 WHERE id = OLD.event_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update user activity
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles 
  SET last_active_at = now() 
  WHERE id = auth.uid();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle gallery item views
CREATE OR REPLACE FUNCTION increment_gallery_views()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called from application code when someone views a gallery item
  UPDATE gallery_items 
  SET views_count = views_count + 1 
  WHERE id = NEW.gallery_item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

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

-- Event attendee count updates
CREATE TRIGGER trigger_update_event_attendee_count
  AFTER INSERT OR UPDATE OR DELETE ON event_rsvps
  FOR EACH ROW EXECUTE FUNCTION update_event_attendee_count();

-- User activity tracking
CREATE TRIGGER trigger_update_activity_posts
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER trigger_update_activity_messages
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER trigger_update_activity_comments
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER trigger_update_activity_gallery
  AFTER INSERT ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

-- =====================================================
-- ANALYTICS AND REPORTING FUNCTIONS
-- =====================================================

-- Get daily active users
CREATE OR REPLACE FUNCTION get_daily_active_users(date_param date DEFAULT CURRENT_DATE)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT id)::integer
    FROM user_profiles
    WHERE DATE(last_active_at) = date_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get community engagement stats
CREATE OR REPLACE FUNCTION get_engagement_stats(days_back integer DEFAULT 7)
RETURNS TABLE(
  posts_count bigint,
  comments_count bigint,
  messages_count bigint,
  gallery_uploads bigint,
  events_created bigint,
  active_users bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL '1 day' * days_back),
    (SELECT COUNT(*) FROM comments WHERE created_at > NOW() - INTERVAL '1 day' * days_back),
    (SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '1 day' * days_back),
    (SELECT COUNT(*) FROM gallery_items WHERE created_at > NOW() - INTERVAL '1 day' * days_back),
    (SELECT COUNT(*) FROM events WHERE created_at > NOW() - INTERVAL '1 day' * days_back AND status = 'published'),
    (SELECT COUNT(DISTINCT id) FROM user_profiles WHERE last_active_at > NOW() - INTERVAL '1 day' * days_back);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get house leaderboard
CREATE OR REPLACE FUNCTION get_house_leaderboard()
RETURNS TABLE(
  house_name text,
  member_count bigint,
  posts_count bigint,
  gallery_items_count bigint,
  events_count bigint,
  engagement_score bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.name,
    COUNT(DISTINCT up.id) as member_count,
    COUNT(DISTINCT p.id) as posts_count,
    COUNT(DISTINCT g.id) as gallery_items_count,
    COUNT(DISTINCT e.id) as events_count,
    (COUNT(DISTINCT p.id) * 2 + COUNT(DISTINCT g.id) * 3 + COUNT(DISTINCT e.id) * 5) as engagement_score
  FROM houses h
  LEFT JOIN user_profiles up ON h.id = up.house_id AND up.role IN ('Member', 'Leader', 'Admin')
  LEFT JOIN posts p ON h.id = p.house_id AND p.created_at > NOW() - INTERVAL '30 days'
  LEFT JOIN gallery_items g ON h.id = g.house_id AND g.created_at > NOW() - INTERVAL '30 days'
  LEFT JOIN events e ON h.id = e.house_id AND e.created_at > NOW() - INTERVAL '30 days'
  WHERE h.category = 'Ballroom'
  GROUP BY h.id, h.name
  ORDER BY engagement_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLEANUP FUNCTIONS
-- =====================================================

-- Clean up old notifications
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

-- Clean up expired login codes
CREATE OR REPLACE FUNCTION cleanup_expired_login_codes()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET login_code = NULL 
  WHERE login_code IS NOT NULL 
  AND updated_at < (now() - INTERVAL '1 hour');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REAL-TIME SUBSCRIPTION HELPERS
-- =====================================================

-- Check if user can access chat thread
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

-- Check if user can see post
CREATE OR REPLACE FUNCTION user_can_see_post(post_id uuid)
RETURNS boolean AS $$
DECLARE
  post_record posts%rowtype;
  user_record user_profiles%rowtype;
BEGIN
  SELECT * INTO post_record FROM posts WHERE id = post_id;
  SELECT * INTO user_record FROM user_profiles WHERE id = auth.uid();
  
  -- Public posts visible to all
  IF post_record.visibility = 'public' THEN
    RETURN true;
  END IF;
  
  -- Author can see own posts
  IF post_record.author_id = auth.uid() THEN
    RETURN true;
  END IF;
  
  -- Members-only posts
  IF post_record.visibility = 'members_only' AND user_record.role IN ('Member', 'Leader', 'Admin') THEN
    RETURN true;
  END IF;
  
  -- House-only posts
  IF post_record.visibility = 'house_only' AND user_record.house_id = post_record.house_id THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Real-time webhook functions setup completed!' as message;