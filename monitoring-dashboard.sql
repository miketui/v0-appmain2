-- =====================================================
-- MONITORING DASHBOARD FOR HAUS OF BASQUIAT PORTAL
-- =====================================================
-- Analytics views and functions for community insights

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Daily active users view
CREATE OR REPLACE VIEW daily_active_users AS
SELECT 
  DATE(last_active_at) as date,
  COUNT(DISTINCT id) as active_users,
  COUNT(DISTINCT CASE WHEN role = 'Member' THEN id END) as active_members,
  COUNT(DISTINCT CASE WHEN role = 'Leader' THEN id END) as active_leaders
FROM user_profiles
WHERE last_active_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(last_active_at)
ORDER BY date DESC;

-- Content engagement view
CREATE OR REPLACE VIEW content_engagement AS
SELECT 
  p.id,
  p.content,
  p.created_at,
  up.display_name as author,
  h.name as house,
  p.likes_count,
  p.comments_count,
  p.visibility,
  (p.likes_count + p.comments_count * 2) as engagement_score
FROM posts p
JOIN user_profiles up ON p.author_id = up.id
LEFT JOIN houses h ON p.house_id = h.id
WHERE p.moderation_status = 'approved'
ORDER BY engagement_score DESC;

-- House performance view
CREATE OR REPLACE VIEW house_performance AS
SELECT 
  h.id,
  h.name,
  h.category,
  h.member_count,
  COUNT(DISTINCT p.id) as posts_last_30_days,
  COUNT(DISTINCT g.id) as gallery_items_last_30_days,
  COUNT(DISTINCT e.id) as events_last_30_days,
  COALESCE(AVG(p.likes_count), 0)::integer as avg_post_likes,
  COALESCE(AVG(g.likes_count), 0)::integer as avg_gallery_likes
FROM houses h
LEFT JOIN posts p ON h.id = p.house_id AND p.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN gallery_items g ON h.id = g.house_id AND g.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN events e ON h.id = e.house_id AND e.created_at > NOW() - INTERVAL '30 days'
WHERE h.category = 'Ballroom'
GROUP BY h.id, h.name, h.category, h.member_count
ORDER BY h.member_count DESC;

-- User engagement metrics
CREATE OR REPLACE VIEW user_engagement_metrics AS
SELECT 
  up.id,
  up.display_name,
  up.role,
  h.name as house,
  up.created_at as joined_at,
  up.last_active_at,
  COUNT(DISTINCT p.id) as posts_count,
  COUNT(DISTINCT c.id) as comments_count,
  COUNT(DISTINCT m.id) as messages_count,
  COUNT(DISTINCT g.id) as gallery_uploads,
  COALESCE(SUM(p.likes_count), 0) as total_post_likes,
  COALESCE(SUM(c.likes_count), 0) as total_comment_likes
FROM user_profiles up
LEFT JOIN houses h ON up.house_id = h.id
LEFT JOIN posts p ON up.id = p.author_id
LEFT JOIN comments c ON up.id = c.author_id
LEFT JOIN messages m ON up.id = m.sender_id
LEFT JOIN gallery_items g ON up.id = g.uploader_id
WHERE up.role IN ('Member', 'Leader', 'Admin')
GROUP BY up.id, up.display_name, up.role, h.name, up.created_at, up.last_active_at
ORDER BY up.last_active_at DESC;

-- Event analytics
CREATE OR REPLACE VIEW event_analytics AS
SELECT 
  e.id,
  e.title,
  e.event_type,
  e.start_time,
  e.status,
  h.name as house,
  e.attendee_count,
  e.max_attendees,
  CASE 
    WHEN e.max_attendees > 0 THEN (e.attendee_count::float / e.max_attendees * 100)::integer
    ELSE 0
  END as capacity_percentage,
  COUNT(DISTINCT er.id) as total_rsvps,
  COUNT(DISTINCT CASE WHEN er.status = 'attending' THEN er.id END) as attending_count,
  COUNT(DISTINCT CASE WHEN er.status = 'maybe' THEN er.id END) as maybe_count,
  COUNT(DISTINCT CASE WHEN er.status = 'not_attending' THEN er.id END) as not_attending_count
FROM events e
LEFT JOIN houses h ON e.house_id = h.id
LEFT JOIN event_rsvps er ON e.id = er.event_id
WHERE e.created_at > NOW() - INTERVAL '90 days'
GROUP BY e.id, e.title, e.event_type, e.start_time, e.status, h.name, e.attendee_count, e.max_attendees
ORDER BY e.start_time DESC;

-- Moderation queue view
CREATE OR REPLACE VIEW moderation_queue AS
SELECT 
  'post' as content_type,
  p.id,
  p.content as text_content,
  p.media_urls,
  p.moderation_status,
  p.created_at,
  up.display_name as author,
  h.name as house
FROM posts p
JOIN user_profiles up ON p.author_id = up.id
LEFT JOIN houses h ON p.house_id = h.id
WHERE p.moderation_status = 'pending'

UNION ALL

SELECT 
  'gallery' as content_type,
  g.id,
  g.description as text_content,
  ARRAY[g.media_url] as media_urls,
  g.moderation_status,
  g.created_at,
  up.display_name as author,
  h.name as house
FROM gallery_items g
JOIN user_profiles up ON g.uploader_id = up.id
LEFT JOIN houses h ON g.house_id = h.id
WHERE g.moderation_status = 'pending'

UNION ALL

SELECT 
  'document' as content_type,
  d.id,
  d.title as text_content,
  ARRAY[d.file_url] as media_urls,
  d.moderation_status,
  d.created_at,
  up.display_name as author,
  NULL as house
FROM documents d
JOIN user_profiles up ON d.uploader_id = up.id
WHERE d.moderation_status = 'pending'

ORDER BY created_at ASC;

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Get growth metrics
CREATE OR REPLACE FUNCTION get_growth_metrics(days_back integer DEFAULT 30)
RETURNS TABLE(
  new_signups bigint,
  new_members bigint,
  new_posts bigint,
  new_gallery_items bigint,
  new_events bigint,
  total_users bigint,
  total_active_users bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_profiles WHERE created_at > NOW() - INTERVAL '1 day' * days_back)::bigint,
    (SELECT COUNT(*) FROM user_profiles WHERE role IN ('Member', 'Leader', 'Admin') AND updated_at > NOW() - INTERVAL '1 day' * days_back)::bigint,
    (SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL '1 day' * days_back)::bigint,
    (SELECT COUNT(*) FROM gallery_items WHERE created_at > NOW() - INTERVAL '1 day' * days_back)::bigint,
    (SELECT COUNT(*) FROM events WHERE created_at > NOW() - INTERVAL '1 day' * days_back)::bigint,
    (SELECT COUNT(*) FROM user_profiles)::bigint,
    (SELECT COUNT(*) FROM user_profiles WHERE last_active_at > NOW() - INTERVAL '1 day' * 7)::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get retention metrics
CREATE OR REPLACE FUNCTION get_retention_metrics()
RETURNS TABLE(
  day_1_retention numeric,
  day_7_retention numeric,
  day_30_retention numeric,
  avg_session_duration_hours numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH cohort_data AS (
    SELECT 
      DATE(created_at) as cohort_date,
      COUNT(*) as cohort_size,
      COUNT(CASE WHEN last_active_at > created_at + INTERVAL '1 day' THEN 1 END) as day_1_active,
      COUNT(CASE WHEN last_active_at > created_at + INTERVAL '7 days' THEN 1 END) as day_7_active,
      COUNT(CASE WHEN last_active_at > created_at + INTERVAL '30 days' THEN 1 END) as day_30_active
    FROM user_profiles
    WHERE created_at > NOW() - INTERVAL '60 days'
    AND role IN ('Member', 'Leader', 'Admin')
    GROUP BY DATE(created_at)
  )
  SELECT 
    ROUND(AVG(day_1_active::numeric / NULLIF(cohort_size, 0)) * 100, 2),
    ROUND(AVG(day_7_active::numeric / NULLIF(cohort_size, 0)) * 100, 2),
    ROUND(AVG(day_30_active::numeric / NULLIF(cohort_size, 0)) * 100, 2),
    24.0 -- Placeholder for actual session tracking
  FROM cohort_data
  WHERE cohort_size > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get top content
CREATE OR REPLACE FUNCTION get_top_content(content_type text DEFAULT 'posts', limit_count integer DEFAULT 10)
RETURNS TABLE(
  id uuid,
  title text,
  author text,
  house text,
  engagement_score integer,
  created_at timestamptz
) AS $$
BEGIN
  IF content_type = 'posts' THEN
    RETURN QUERY
    SELECT 
      p.id,
      LEFT(COALESCE(p.content, ''), 100) as title,
      up.display_name as author,
      h.name as house,
      (p.likes_count + p.comments_count * 2) as engagement_score,
      p.created_at
    FROM posts p
    JOIN user_profiles up ON p.author_id = up.id
    LEFT JOIN houses h ON p.house_id = h.id
    WHERE p.moderation_status = 'approved'
    AND p.created_at > NOW() - INTERVAL '30 days'
    ORDER BY (p.likes_count + p.comments_count * 2) DESC
    LIMIT limit_count;
  ELSIF content_type = 'gallery' THEN
    RETURN QUERY
    SELECT 
      g.id,
      COALESCE(g.title, g.description, 'Untitled') as title,
      up.display_name as author,
      h.name as house,
      g.likes_count as engagement_score,
      g.created_at
    FROM gallery_items g
    JOIN user_profiles up ON g.uploader_id = up.id
    LEFT JOIN houses h ON g.house_id = h.id
    WHERE g.moderation_status = 'approved'
    AND g.created_at > NOW() - INTERVAL '30 days'
    ORDER BY g.likes_count DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get system health metrics
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS TABLE(
  pending_applications bigint,
  pending_moderation bigint,
  unread_notifications bigint,
  active_chat_threads bigint,
  upcoming_events bigint,
  storage_usage_mb numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_applications WHERE status = 'pending')::bigint,
    (SELECT COUNT(*) FROM posts WHERE moderation_status = 'pending') + 
    (SELECT COUNT(*) FROM gallery_items WHERE moderation_status = 'pending') + 
    (SELECT COUNT(*) FROM documents WHERE moderation_status = 'pending'),
    (SELECT COUNT(*) FROM notifications WHERE read_at IS NULL)::bigint,
    (SELECT COUNT(*) FROM chat_threads WHERE last_message_at > NOW() - INTERVAL '24 hours')::bigint,
    (SELECT COUNT(*) FROM events WHERE status = 'published' AND start_time > NOW())::bigint,
    0.0 -- Placeholder for storage usage calculation
  ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUTOMATED REPORTS
-- =====================================================

-- Generate weekly community report
CREATE OR REPLACE FUNCTION generate_weekly_report()
RETURNS TABLE(
  report_date date,
  new_members integer,
  posts_created integer,
  gallery_uploads integer,
  events_held integer,
  most_active_house text,
  top_post_author text,
  engagement_growth_percent numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH weekly_stats AS (
    SELECT 
      CURRENT_DATE as report_date,
      (SELECT COUNT(*) FROM user_profiles WHERE created_at > NOW() - INTERVAL '7 days' AND role IN ('Member', 'Leader', 'Admin'))::integer as new_members,
      (SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL '7 days')::integer as posts_created,
      (SELECT COUNT(*) FROM gallery_items WHERE created_at > NOW() - INTERVAL '7 days')::integer as gallery_uploads,
      (SELECT COUNT(*) FROM events WHERE start_time BETWEEN NOW() - INTERVAL '7 days' AND NOW() AND status = 'completed')::integer as events_held
  ),
  house_activity AS (
    SELECT 
      h.name,
      COUNT(p.id) + COUNT(g.id) * 2 + COUNT(e.id) * 3 as activity_score
    FROM houses h
    LEFT JOIN posts p ON h.id = p.house_id AND p.created_at > NOW() - INTERVAL '7 days'
    LEFT JOIN gallery_items g ON h.id = g.house_id AND g.created_at > NOW() - INTERVAL '7 days'
    LEFT JOIN events e ON h.id = e.house_id AND e.created_at > NOW() - INTERVAL '7 days'
    WHERE h.category = 'Ballroom'
    GROUP BY h.name
    ORDER BY activity_score DESC
    LIMIT 1
  ),
  top_author AS (
    SELECT 
      up.display_name,
      COUNT(p.id) + COALESCE(SUM(p.likes_count), 0) + COALESCE(SUM(p.comments_count), 0) as score
    FROM user_profiles up
    LEFT JOIN posts p ON up.id = p.author_id AND p.created_at > NOW() - INTERVAL '7 days'
    GROUP BY up.display_name
    ORDER BY score DESC
    LIMIT 1
  )
  SELECT 
    ws.report_date,
    ws.new_members,
    ws.posts_created,
    ws.gallery_uploads,
    ws.events_held,
    ha.name as most_active_house,
    ta.display_name as top_post_author,
    10.5 as engagement_growth_percent -- Placeholder calculation
  FROM weekly_stats ws
  CROSS JOIN house_activity ha
  CROSS JOIN top_author ta;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PERFORMANCE MONITORING
-- =====================================================

-- Monitor slow queries (admin only)
CREATE OR REPLACE VIEW slow_query_monitor AS
SELECT 
  'Performance monitoring view created - check pg_stat_statements for actual slow queries' as message,
  'Run: SELECT query, total_time, calls, mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;' as instruction;

-- Database size monitoring
CREATE OR REPLACE FUNCTION get_database_size_info()
RETURNS TABLE(
  table_name text,
  row_count bigint,
  size_mb numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    n_tup_ins - n_tup_del as row_count,
    ROUND((pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0)::numeric, 2) as size_mb
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Monitoring dashboard setup completed!' as message;