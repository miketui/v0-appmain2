-- Create your first admin account
-- Replace YOUR_EMAIL and YOUR_PASSWORD with actual values

DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Create auth user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'YOUR_EMAIL@example.com', -- CHANGE THIS
        crypt('YOUR_PASSWORD', gen_salt('bf')), -- CHANGE THIS
        now(),
        null,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user_id;

    -- Create user profile with admin role
    INSERT INTO user_profiles (
        id,
        email,
        role,
        status,
        display_name,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'YOUR_EMAIL@example.com', -- CHANGE THIS
        'Admin',
        'active',
        'Admin User', -- CHANGE THIS
        now(),
        now()
    );

    RAISE NOTICE 'Admin user created with ID: %', user_id;
END $$;