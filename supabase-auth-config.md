# 🔐 Authentication Configuration for Haus of Basquiat Portal

## Step 1: Basic Authentication Settings

In your Supabase dashboard, go to **Authentication > Settings**:

### General Settings
- **Site URL**: `https://your-domain.com` (production) or `http://localhost:3000` (development)
- **Additional Redirect URLs**:
  ```
  http://localhost:3000/auth/callback
  https://your-staging-domain.com/auth/callback
  https://your-production-domain.com/auth/callback
  ```

### Email Auth Configuration
- ✅ **Enable email confirmations**
- ✅ **Secure email change** 
- ✅ **Double confirm email change**
- **Minimum password length**: 8 characters (though we primarily use magic links)

### Rate Limiting
- **Email rate limit**: 60 per hour per IP
- **SMS rate limit**: 60 per hour per IP  
- **Password rate limit**: 30 per hour per IP

## Step 2: Email Templates

### Magic Link Template
**Subject**: `Welcome to Haus of Basquiat! Your magic link ✨`

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
    .magic-link-btn {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
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
    
    <div>
      <h2>Hey gorgeous! 💫</h2>
      
      <p>Welcome to the most fabulous corner of the internet! You're just one click away from joining our amazing ballroom community.</p>
      
      <p>Click the magical button below to sign in to your account:</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="magic-link-btn">
          ✨ Enter the Haus ✨
        </a>
      </div>
      
      <p><strong>This link expires in 1 hour</strong> for your security.</p>
      
      <p>Ready to serve looks, share performances, and connect with family? Let's go!</p>
      
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

### Email Confirmation Template  
**Subject**: `Confirm your email for Haus of Basquiat ✨`

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
    .confirm-btn {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
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
    
    <div>
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
    </div>
  </div>
</body>
</html>
```

## Step 3: Social Provider Setup (Optional)

### Google OAuth
1. Go to **Authentication > Providers**
2. Enable **Google**
3. Add credentials from Google Cloud Console
4. Set redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

### Discord OAuth (Popular in LGBTQ+ communities)
1. Enable **Discord**
2. Add Discord application credentials
3. Set redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

## Step 4: Custom SMTP (Production)

For reliable email delivery:

1. **Settings > Authentication > SMTP Settings**
2. **Enable custom SMTP**: ✅
3. **SMTP Host**: `smtp.sendgrid.net` (if using SendGrid)
4. **SMTP Port**: `587`
5. **SMTP Username**: `apikey`
6. **SMTP Password**: Your SendGrid API key
7. **SMTP Sender Name**: `Haus of Basquiat`
8. **SMTP Sender Email**: `noreply@yourdomain.com`

## Step 5: JWT Configuration

In **Settings > API**:
- **JWT expiry**: 3600 seconds (1 hour)
- **Refresh token expiry**: 604800 seconds (7 days)

## Step 6: Test Authentication

1. Test magic link signup with a real email
2. Verify email templates display correctly
3. Test social login flows if configured
4. Confirm user profiles are auto-created
5. Verify rate limiting works

Authentication setup complete! ✨