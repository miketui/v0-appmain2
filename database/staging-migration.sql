-- Staging Database Setup for Haus of Basquiat Portal
-- This script sets up staging-specific configurations

-- Create staging-specific roles and permissions
DO $$
BEGIN
  -- Create staging admin user if not exists
  IF NOT EXISTS (SELECT FROM auth.users WHERE email = 'admin@staging.hausofbasquiat.com') THEN
    INSERT INTO auth.users (
      id,
      email,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      'admin@staging.hausofbasquiat.com',
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"display_name": "Staging Admin", "role": "Admin"}',
      FALSE,
      'authenticated'
    );
  END IF;
END
$$;

-- Insert staging test houses
INSERT INTO houses (id, name, description, founded_year, status, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'House of Testing', 'Staging test house for development', 2024, 'active', NOW(), NOW()),
  (gen_random_uuid(), 'House of QA', 'Quality assurance house for staging', 2024, 'active', NOW(), NOW()),
  (gen_random_uuid(), 'House of Staging', 'Main staging house for testing', 2024, 'active', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create staging-specific user profiles
INSERT INTO user_profiles (
  id,
  user_id,
  display_name,
  role,
  status,
  house_id,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  'Staging Admin',
  'Admin',
  'active',
  h.id,
  NOW(),
  NOW()
FROM auth.users u, houses h
WHERE u.email = 'admin@staging.hausofbasquiat.com'
  AND h.name = 'House of Staging'
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = u.id
  );

-- Create staging test content
INSERT INTO posts (
  id,
  title,
  content,
  category,
  author_id,
  house_id,
  status,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  'Welcome to Staging',
  'This is a test post for the staging environment. All features are ready for testing!',
  'Performance',
  up.user_id,
  up.house_id,
  'published',
  NOW(),
  NOW()
FROM user_profiles up
WHERE up.role = 'Admin'
  AND NOT EXISTS (
    SELECT 1 FROM posts p WHERE p.title = 'Welcome to Staging'
  )
LIMIT 1;

-- Enable staging-specific features
UPDATE system_settings 
SET value = 'true' 
WHERE key IN (
  'enable_debug_mode',
  'enable_test_data',
  'enable_beta_features',
  'enable_performance_monitoring'
);

-- Set staging-specific rate limits (more lenient for testing)
UPDATE system_settings 
SET value = CASE 
  WHEN key = 'rate_limit_posts_per_hour' THEN '100'
  WHEN key = 'rate_limit_comments_per_hour' THEN '500'
  WHEN key = 'rate_limit_uploads_per_hour' THEN '50'
  WHEN key = 'rate_limit_api_calls_per_minute' THEN '200'
  ELSE value
END
WHERE key LIKE 'rate_limit_%';

-- Create staging notification for new deployments
CREATE OR REPLACE FUNCTION notify_staging_deployment()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a system notification when staging is updated
  INSERT INTO notifications (
    id,
    user_id,
    title,
    content,
    type,
    created_at
  )
  SELECT 
    gen_random_uuid(),
    up.user_id,
    'Staging Environment Updated',
    'The staging environment has been updated with the latest changes. Please test thoroughly!',
    'system',
    NOW()
  FROM user_profiles up
  WHERE up.role IN ('Admin', 'Leader');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create staging-specific indexes for performance testing
CREATE INDEX IF NOT EXISTS idx_posts_staging_created_at ON posts(created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_users_staging_activity ON user_profiles(last_active_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_messages_staging_thread ON messages(thread_id, created_at DESC);

-- Enable real-time for staging
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- Create staging health check function
CREATE OR REPLACE FUNCTION staging_health_check()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'status', 'healthy',
    'environment', 'staging',
    'timestamp', NOW(),
    'database_version', version(),
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_posts', (SELECT COUNT(*) FROM posts),
    'total_houses', (SELECT COUNT(*) FROM houses),
    'active_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION staging_health_check() TO authenticated;

-- Create staging data cleanup job (runs daily)
CREATE OR REPLACE FUNCTION cleanup_staging_data()
RETURNS void AS $$
BEGIN
  -- Clean up old test data (older than 30 days)
  DELETE FROM posts 
  WHERE created_at < NOW() - INTERVAL '30 days' 
    AND title LIKE '%test%' OR title LIKE '%staging%';
  
  -- Clean up old notifications (older than 7 days)
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Log cleanup
  RAISE NOTICE 'Staging data cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Create staging monitoring views
CREATE OR REPLACE VIEW staging_metrics AS
SELECT 
  'users' as metric,
  COUNT(*) as count,
  'total_users' as description
FROM auth.users
UNION ALL
SELECT 
  'posts' as metric,
  COUNT(*) as count,
  'total_posts' as description  
FROM posts
UNION ALL
SELECT 
  'active_users_today' as metric,
  COUNT(*) as count,
  'users_active_today' as description
FROM user_profiles 
WHERE last_active_at >= CURRENT_DATE
UNION ALL
SELECT 
  'posts_today' as metric,
  COUNT(*) as count,
  'posts_created_today' as description
FROM posts 
WHERE created_at >= CURRENT_DATE;

-- Grant access to staging metrics
GRANT SELECT ON staging_metrics TO authenticated;

COMMIT;