# 🏠 Haus of Basquiat Portal - Complete Supabase Backend Setup Guide

This guide will take you from zero to a fully functional backend for the Haus of Basquiat ballroom community portal.

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Supabase account (free tier available)
- [ ] Deployment platform account (Railway, Vercel, or similar)
- [ ] Custom domain (optional but recommended)

## 🚀 Step 1: Create Supabase Project

### 1.1 Create New Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. **Organization**: Select or create organization
4. **Project Name**: `haus-of-basquiat-portal`
5. **Database Password**: Generate a strong password (save it!)
6. **Region**: Choose closest to your users (US East for North America)
7. Click **"Create new project"**

⏱️ *Project creation takes ~2 minutes*

### 1.2 Get Project Credentials
Once your project is ready:

1. Go to **Settings > API**
2. Copy and save these values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)
   - **Service role key** (starts with `eyJ` - keep this secret!)

## 🗄️ Step 2: Set Up Database Schema

### 2.1 Run Main Schema Setup
1. In your Supabase dashboard, go to **Database > SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `/root/repo/supabase-setup.sql`
4. Paste into the SQL editor
5. Click **"Run"** (this may take 30-60 seconds)

✅ You should see: "Database schema setup completed successfully!"

### 2.2 Set Up Storage Buckets
1. Create another **"New Query"** in SQL Editor
2. Copy the contents of `/root/repo/supabase-storage.sql`
3. Paste and click **"Run"**

✅ You should see: "Storage buckets setup completed successfully!"

### 2.3 Verify Setup
Go to **Table Editor** and verify you see these tables:
- `user_profiles`
- `houses` 
- `posts`
- `messages`
- `gallery_items`
- `events`
- `notifications`
- And 12+ others

Go to **Storage** and verify these buckets exist:
- `documents`
- `chat-files`
- `posts-media`
- `gallery`
- `avatars`
- `event-media`

## 🔐 Step 3: Configure Authentication

### 3.1 Basic Auth Settings
1. Go to **Authentication > Settings**
2. Set **Site URL**: `https://your-domain.com` (or temp domain)
3. Add **Redirect URLs** (one per line):
   ```
   http://localhost:3000/auth/callback
   https://your-staging-domain.com/auth/callback
   https://your-production-domain.com/auth/callback
   ```
4. **Enable email confirmations**: ✅
5. **Secure email change**: ✅

### 3.2 Email Templates
1. Go to **Authentication > Email Templates**
2. For each template (Magic Link, Confirm Signup, Reset Password):
   - Copy the HTML from `/root/repo/supabase-auth-setup.md`
   - Customize colors/branding as needed
   - Save each template

### 3.3 Optional: Social Providers
Follow the guide in `supabase-auth-setup.md` to enable:
- Google OAuth (recommended)
- Discord OAuth (popular in community)
- Apple OAuth

## 🌐 Step 4: Deploy to Production

### 4.1 Railway Deployment (Recommended)

1. **Connect GitHub**:
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your `haus-of-basquiat-portal` repo

2. **Configure Environment Variables**:
   - In Railway dashboard, go to **Variables**
   - Add all variables from `/root/repo/.env.production`
   - Replace placeholder values with your actual Supabase credentials

3. **Set Custom Domain**:
   - Go to **Settings > Domains**
   - Add your custom domain
   - Update DNS records as instructed

4. **Deploy**:
   - Railway will automatically deploy when you push to main branch
   - First deployment takes 5-10 minutes

### 4.2 Vercel Deployment (Alternative)

1. **Connect GitHub**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo

2. **Configure Environment Variables**:
   - Add all variables from `.env.production`
   - Make sure to prefix client-side vars with `NEXT_PUBLIC_`

3. **Deploy**:
   - Vercel automatically deploys
   - Set up custom domain in Vercel settings

## 🧪 Step 5: Test Everything

### 5.1 Authentication Test
1. Go to your deployed app
2. Try signing up with a test email
3. Check email for magic link
4. Verify you can log in
5. Check that user profile was created in Supabase

### 5.2 Database Test
1. Try creating a post
2. Upload an image to gallery
3. Send a message
4. Check that data appears in Supabase tables

### 5.3 Storage Test
1. Upload a profile picture
2. Share a file in chat
3. Post media to feed
4. Verify files appear in Supabase Storage

## 📧 Step 6: Email Configuration (Production)

### 6.1 Custom SMTP Setup
For reliable email delivery in production:

1. **Sign up for SendGrid** (recommended)
2. Get API key and verify domain
3. In Supabase, go to **Authentication > Settings > SMTP Settings**
4. Configure:
   - **Host**: `smtp.sendgrid.net`
   - **Port**: `587`
   - **Username**: `apikey`
   - **Password**: Your SendGrid API key
   - **Sender**: `noreply@your-domain.com`

### 6.2 Test Email Delivery
1. Send test magic link
2. Verify email arrives in inbox (not spam)
3. Test email templates render correctly
4. Check email deliverability rates

## 🔍 Step 7: Monitoring & Analytics

### 7.1 Set Up Error Tracking
1. **Create Sentry account** (recommended)
2. Add Sentry DSN to environment variables
3. Test error reporting

### 7.2 Set Up Analytics
1. **Google Analytics 4**:
   - Create GA4 property
   - Add measurement ID to environment variables
2. **Supabase Analytics**:
   - Monitor database performance in Supabase dashboard
   - Set up alerts for high usage

## 🎯 Step 8: Performance Optimization

### 8.1 Database Optimization
1. **Monitor slow queries** in Supabase dashboard
2. **Add indexes** for frequently queried columns
3. **Enable database replication** if needed

### 8.2 Storage Optimization
1. **Configure CDN** for faster image delivery
2. **Set up image optimization** (WebP conversion)
3. **Implement lazy loading** for gallery

## 🔒 Step 9: Security Hardening

### 9.1 Review RLS Policies
1. **Test all database policies** with different user roles
2. **Ensure sensitive data protection**
3. **Verify API access controls**

### 9.2 Security Checklist
- [ ] All connections use HTTPS
- [ ] JWT secrets are secure (32+ characters)
- [ ] Database credentials are protected
- [ ] API keys are production-ready
- [ ] Rate limiting is configured
- [ ] CORS is properly set up
- [ ] File upload validation is working
- [ ] No sensitive data in client-side code

## 📈 Step 10: Launch Preparation

### 10.1 Pre-Launch Checklist
- [ ] Authentication flow tested
- [ ] All main features work
- [ ] Email delivery tested
- [ ] Mobile responsiveness verified
- [ ] Performance tested under load
- [ ] Error handling works properly
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured

### 10.2 Launch Day
1. **Announce to community** on social media
2. **Monitor error rates** and performance
3. **Be ready to respond** to user feedback
4. **Have rollback plan** ready if needed

## 🎉 Step 11: Post-Launch

### 11.1 Community Building
1. **Create initial content** (sample posts, events)
2. **Invite community leaders** first
3. **Set up moderation team**
4. **Create onboarding resources**

### 11.2 Ongoing Maintenance
1. **Monitor database growth** and upgrade plan if needed
2. **Regular security updates**
3. **Performance monitoring**
4. **Feature updates based on community feedback**

## 🆘 Troubleshooting

### Common Issues

**Authentication not working:**
- Check redirect URLs in Supabase settings
- Verify environment variables are correct
- Check email delivery settings

**Database connection errors:**
- Verify DATABASE_URL format
- Check Supabase project status
- Review RLS policies

**File upload issues:**
- Check storage bucket policies
- Verify file size limits
- Review CORS settings

**Performance issues:**
- Check for missing indexes
- Monitor database usage
- Optimize queries

## 📞 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Community Issues**: Create GitHub issue in your repo

## 🎊 Congratulations!

You now have a fully functional, production-ready backend for the Haus of Basquiat Portal! The ballroom community now has a beautiful, safe space to connect, share, and celebrate their culture.

**Key Features Now Live:**
- ✨ Passwordless authentication with magic links
- 🏠 House management and membership
- 📱 Real-time messaging and chat
- 🖼️ Media gallery for performances and fashion
- 📅 Event management with RSVP system
- 👤 Rich user profiles and applications
- 🔐 Role-based access control
- 📧 Beautiful branded email templates
- 🔄 Real-time updates and notifications
- 💳 Payment processing ready (Stripe)
- 📊 Analytics and monitoring
- 🛡️ Security and content moderation

*The stage is set, the lights are on, and your community is ready to serve! Welcome to the Haus of Basquiat! ✨🌈*