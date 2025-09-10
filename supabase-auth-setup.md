# Supabase Authentication Setup for Haus of Basquiat Portal

## Step 1: Configure Authentication Settings

### 1.1 Basic Auth Settings
Go to **Authentication > Settings** in your Supabase dashboard:

1. **Site URL**: Set to your production domain (e.g., `https://hausofbasquiat.com`)
2. **Additional Redirect URLs**: Add these URLs (one per line):
   ```
   http://localhost:3000/auth/callback
   https://your-staging-domain.com/auth/callback
   https://your-production-domain.com/auth/callback
   ```

### 1.2 Email Auth Configuration
1. **Enable email authentication**: ✅ Checked
2. **Confirm email**: ✅ Checked (users must verify email)
3. **Secure email change**: ✅ Checked
4. **Double confirm email change**: ✅ Checked

### 1.3 Password Requirements (Optional - we use passwordless)
- **Minimum password length**: 8
- **Require uppercase**: ❌ (we use magic links)
- **Require lowercase**: ❌ (we use magic links)
- **Require numbers**: ❌ (we use magic links)
- **Require special characters**: ❌ (we use magic links)

### 1.4 Rate Limiting
1. **Email rate limit**: 60 per hour per IP
2. **SMS rate limit**: 60 per hour per IP
3. **Password rate limit**: 30 per hour per IP

## Step 2: Configure Social Providers (Optional)

### 2.1 Google OAuth (Recommended)
1. Go to **Authentication > Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
   - **Redirect URL**: `https://your-project-id.supabase.co/auth/v1/callback`

### 2.2 Apple OAuth (Optional)
1. Enable **Apple**
2. Add Apple OAuth credentials from Apple Developer

### 2.3 Discord OAuth (Optional - popular in LGBTQ+ communities)
1. Enable **Discord** 
2. Add Discord OAuth credentials

## Step 3: Email Templates

### 3.1 Magic Link Email Template
Go to **Authentication > Email Templates > Magic Link**:

**Subject**: `Welcome to Haus of Basquiat! Your magic link ✨`

**Template**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .content {
      margin-bottom: 30px;
    }
    .magic-link-btn {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .magic-link-btn:hover {
      transform: translateY(-2px);
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    .rainbow {
      background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff);
      height: 4px;
      border-radius: 2px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✨ Haus of Basquiat ✨</div>
      <div class="rainbow"></div>
    </div>
    
    <div class="content">
      <h2>Hey gorgeous! 💫</h2>
      
      <p>Welcome to the most fabulous corner of the internet! You're just one click away from joining our amazing ballroom community.</p>
      
      <p>Click the magical button below to sign in to your account:</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="magic-link-btn">
          ✨ Enter the Haus ✨
        </a>
      </div>
      
      <p><strong>This link expires in 1 hour</strong> for your security.</p>
      
      <p>If you didn't request this email, you can safely ignore it. No account will be created.</p>
      
      <p>Ready to serve looks, share performances, and connect with family? Let's go!</p>
      
      <p>With love and light,<br>
      <strong>The Haus of Basquiat Team</strong> 🌈</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Haus of Basquiat Portal<br>
      A safe space for ballroom culture and voguing community</p>
      
      <p>Need help? Reply to this email or contact us through the app.</p>
    </div>
  </div>
</body>
</html>
```

### 3.2 Email Confirmation Template
Go to **Authentication > Email Templates > Confirm Signup**:

**Subject**: `Confirm your email for Haus of Basquiat ✨`

**Template**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .content {
      margin-bottom: 30px;
    }
    .confirm-btn {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .confirm-btn:hover {
      transform: translateY(-2px);
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    .rainbow {
      background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff);
      height: 4px;
      border-radius: 2px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✨ Haus of Basquiat ✨</div>
      <div class="rainbow"></div>
    </div>
    
    <div class="content">
      <h2>Almost there, beautiful! 💫</h2>
      
      <p>Thank you for joining the Haus of Basquiat community! We're so excited to have you.</p>
      
      <p>Please confirm your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="confirm-btn">
          ✨ Confirm My Email ✨
        </a>
      </div>
      
      <p><strong>This link expires in 24 hours</strong> for your security.</p>
      
      <p>Once confirmed, you'll be able to:</p>
      <ul>
        <li>🎭 Share your performances in our gallery</li>
        <li>💬 Connect with community members</li>
        <li>📅 RSVP to ballroom events and workshops</li>
        <li>🏠 Join a house and find your chosen family</li>
        <li>✨ Access exclusive content and resources</li>
      </ul>
      
      <p>Can't wait to see you serving looks and living your truth!</p>
      
      <p>With love and light,<br>
      <strong>The Haus of Basquiat Team</strong> 🌈</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Haus of Basquiat Portal<br>
      A safe space for ballroom culture and voguing community</p>
      
      <p>If you didn't create this account, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
```

### 3.3 Password Reset Template (Backup)
Go to **Authentication > Email Templates > Reset Password**:

**Subject**: `Reset your Haus of Basquiat password 🔐`

**Template**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .content {
      margin-bottom: 30px;
    }
    .reset-btn {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .reset-btn:hover {
      transform: translateY(-2px);
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    .rainbow {
      background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff);
      height: 4px;
      border-radius: 2px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✨ Haus of Basquiat ✨</div>
      <div class="rainbow"></div>
    </div>
    
    <div class="content">
      <h2>Reset your password 🔐</h2>
      
      <p>Someone (hopefully you!) requested a password reset for your Haus of Basquiat account.</p>
      
      <p>Click the button below to reset your password:</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="reset-btn">
          🔐 Reset Password
        </a>
      </div>
      
      <p><strong>This link expires in 1 hour</strong> for your security.</p>
      
      <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      
      <p>Stay safe and fabulous!</p>
      
      <p>With love and light,<br>
      <strong>The Haus of Basquiat Team</strong> 🌈</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Haus of Basquiat Portal<br>
      A safe space for ballroom culture and voguing community</p>
    </div>
  </div>
</body>
</html>
```

## Step 4: Custom SMTP Configuration (Production Recommended)

For production, configure custom SMTP to ensure email deliverability:

### 4.1 SMTP Settings
Go to **Authentication > Settings > SMTP Settings**:

1. **Enable custom SMTP**: ✅ Checked
2. **SMTP Host**: Your email service provider (e.g., SendGrid, Mailgun)
3. **SMTP Port**: 587 (TLS) or 465 (SSL)
4. **SMTP Username**: Your SMTP username
5. **SMTP Password**: Your SMTP password
6. **SMTP Sender Name**: `Haus of Basquiat`
7. **SMTP Sender Email**: `noreply@hausofbasquiat.com`

### 4.2 SendGrid Configuration Example
If using SendGrid:
- **Host**: `smtp.sendgrid.net`
- **Port**: `587`
- **Username**: `apikey`
- **Password**: Your SendGrid API key
- **Sender**: `noreply@hausofbasquiat.com`

## Step 5: Security Settings

### 5.1 JWT Settings
Go to **Settings > API**:
- **JWT expiry**: 3600 seconds (1 hour)
- **Refresh token expiry**: 604800 seconds (7 days)

### 5.2 Password Policy
- **Minimum length**: 8 characters
- **Require uppercase**: No (magic links preferred)
- **Require lowercase**: No
- **Require numbers**: No
- **Require symbols**: No

## Step 6: Webhooks Configuration

### 6.1 Database Webhooks
Go to **Database > Webhooks**:

1. **User Profile Creation Webhook**:
   - **Table**: `auth.users`
   - **Events**: `INSERT`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://your-domain.com/api/webhooks/user-created`

2. **Real-time Updates Webhook**:
   - **Table**: `messages`
   - **Events**: `INSERT`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://your-domain.com/api/webhooks/new-message`

### 6.2 Auth Webhooks
In **Authentication > Hooks**:

1. **Send welcome email hook**:
   ```sql
   CREATE OR REPLACE FUNCTION send_welcome_notification()
   RETURNS TRIGGER AS $$
   BEGIN
     -- Trigger welcome notification logic
     INSERT INTO notifications (user_id, type, title, content)
     VALUES (
       NEW.id,
       'system',
       'Welcome to Haus of Basquiat! ✨',
       'Your journey in our ballroom community begins now. Explore, connect, and serve!'
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER on_user_welcome
     AFTER UPDATE ON user_profiles
     FOR EACH ROW
     WHEN (OLD.status = 'pending' AND NEW.status = 'active')
     EXECUTE FUNCTION send_welcome_notification();
   ```

## Step 7: Test Authentication Flow

1. **Test magic link login** with a test email
2. **Verify email templates** render correctly
3. **Test social provider login** if configured
4. **Check user profile creation** after signup
5. **Verify rate limiting** works as expected

## Completion Checklist

- [ ] Basic auth settings configured
- [ ] Email templates customized
- [ ] Social providers configured (optional)
- [ ] SMTP configured for production
- [ ] JWT settings optimized
- [ ] Webhooks configured
- [ ] Authentication flow tested
- [ ] Rate limiting verified
- [ ] Security settings reviewed

Once complete, users will have a smooth, branded authentication experience that reflects the vibrant ballroom community culture! ✨