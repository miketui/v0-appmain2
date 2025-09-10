# 🚀 Complete Deployment Guide - Haus of Basquiat Portal

This guide will take you from zero to a fully deployed, production-ready ballroom community platform.

## 📋 Prerequisites Checklist

- [ ] GitHub account with your repository
- [ ] Supabase account (free tier available)
- [ ] Deployment platform account (Railway, Vercel, or Netlify)
- [ ] Domain name (optional but recommended)
- [ ] Email service (SendGrid recommended)

## 🗄️ Step 1: Set Up Supabase Backend

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. **Project Name**: `haus-of-basquiat-portal`
4. **Database Password**: Generate strong password (save it!)
5. **Region**: Choose closest to your users
6. Click **"Create new project"** (takes ~2 minutes)

### 1.2 Execute Database Setup

1. Go to **Database > SQL Editor**
2. Click **"New Query"**
3. Copy entire contents of `supabase-complete-setup.sql`
4. **Run** the query (may take 30-60 seconds)
5. Verify success message: "Database schema setup completed successfully!"

### 1.3 Set Up Storage

1. Create **another new query**
2. Copy contents of `supabase-storage-setup.sql`  
3. **Run** the query
4. Verify message: "Storage buckets and policies setup completed!"

### 1.4 Add Real-time Functions

1. Create **another new query**
2. Copy contents of `supabase-realtime-functions.sql`
3. **Run** the query
4. Verify message: "Real-time webhook functions setup completed!"

### 1.5 Configure Authentication

Follow the instructions in `supabase-auth-config.md`:

1. **Authentication > Settings**:
   - Set Site URL to your domain
   - Add redirect URLs
   - Enable email confirmations

2. **Authentication > Email Templates**:
   - Copy the beautiful email templates provided
   - Customize with your branding

3. **Optional**: Set up social providers (Google, Discord)

### 1.6 Get Supabase Credentials

From **Settings > API**, copy:
- **Project URL** (starts with `https://`)
- **Anon public key** (starts with `eyJ`)
- **Service role key** (starts with `eyJ` - keep secret!)

## 🚀 Step 2: Deploy to Production

### Option A: Railway Deployment (Recommended)

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - **New Project > Deploy from GitHub repo**
   - Select your repository

2. **Configure Environment Variables**:
   - Go to **Variables** tab
   - Copy all variables from `.env.production.example`
   - Replace placeholders with your actual values:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-key
     DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
     NEXT_PUBLIC_APP_URL=https://your-domain.com
     ```

3. **Deploy**:
   - Railway automatically deploys on push to main
   - First deployment takes 5-10 minutes
   - Monitor logs for any issues

4. **Set Custom Domain**:
   - Go to **Settings > Networking**
   - Add your custom domain
   - Update DNS records as instructed

### Option B: Vercel Deployment

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - **New Project > Import Git Repository**
   - Select your repository

2. **Configure Environment Variables**:
   - Add all variables from `.env.production.example`
   - Make sure client-side variables start with `NEXT_PUBLIC_`

3. **Deploy**:
   - Vercel automatically deploys
   - Set custom domain in settings

### Option C: Netlify Deployment

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - **New site from Git**
   - Connect your repository

2. **Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `out` (for static export) or `.next` (for server)

3. **Environment Variables**:
   - Add all variables from `.env.production.example`

## 📧 Step 3: Configure Email Service

### 3.1 Set Up SendGrid (Recommended)

1. **Create SendGrid Account**:
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up for free account (100 emails/day free)

2. **Create API Key**:
   - Go to **Settings > API Keys**
   - Create new API key with "Full Access"
   - Copy the key (starts with `SG.`)

3. **Verify Domain**:
   - Go to **Settings > Sender Authentication**
   - Verify your domain (`hausofbasquiat.com`)
   - Add DNS records as instructed

4. **Configure Supabase SMTP**:
   - In Supabase: **Authentication > Settings > SMTP Settings**
   - **Enable custom SMTP**: ✅
   - **Host**: `smtp.sendgrid.net`
   - **Port**: `587`
   - **Username**: `apikey`
   - **Password**: Your SendGrid API key
   - **Sender**: `noreply@hausofbasquiat.com`

5. **Test Email Delivery**:
   - Try signing up with a test email
   - Verify magic link email arrives
   - Check spam folder if needed

## 🔒 Step 4: Security & Performance

### 4.1 Security Checklist

- [ ] All environment variables are secure (32+ character secrets)
- [ ] Database passwords are strong
- [ ] API keys are from production accounts
- [ ] HTTPS is enabled everywhere
- [ ] CORS is properly configured
- [ ] RLS policies are active and tested

### 4.2 Performance Optimization

- [ ] Images are optimized (WebP format)
- [ ] CDN is configured for static assets
- [ ] Database indexes are in place
- [ ] Caching is enabled (Redis/Upstash)

## 📊 Step 5: Monitoring & Analytics

### 5.1 Error Tracking (Sentry)

1. **Create Sentry Account**:
   - Go to [sentry.io](https://sentry.io)
   - Create new project for Next.js

2. **Get DSN**:
   - Copy your project DSN
   - Add to environment variables

3. **Install Sentry**:
   ```bash
   npm install @sentry/nextjs
   ```

### 5.2 Analytics (Google Analytics 4)

1. **Create GA4 Property**:
   - Go to [analytics.google.com](https://analytics.google.com)
   - Create new GA4 property

2. **Get Measurement ID**:
   - Copy your G-XXXXXXXXXX measurement ID
   - Add to environment variables

## 🧪 Step 6: Testing & Validation

### 6.1 Run Automated Tests

```bash
# Install dependencies
npm install tsx

# Run the test suite
npx tsx test-supabase-setup.ts
```

### 6.2 Manual Testing Checklist

**Authentication:**
- [ ] Sign up with email works
- [ ] Magic link login works  
- [ ] Email templates display correctly
- [ ] User profile is auto-created

**Core Features:**
- [ ] Create and view posts
- [ ] Upload images to gallery
- [ ] Send messages in chat
- [ ] RSVP to events
- [ ] Join houses

**Admin Features:**
- [ ] Review applications
- [ ] Moderate content
- [ ] Create events
- [ ] Manage users

## 🎊 Step 7: Launch Preparation

### 7.1 Content Preparation

- [ ] Seed initial houses and events
- [ ] Create welcome posts and gallery content
- [ ] Set up community guidelines
- [ ] Prepare onboarding materials

### 7.2 Community Setup

- [ ] Invite founding members
- [ ] Designate house leaders
- [ ] Set up moderation team
- [ ] Plan launch events

### 7.3 Marketing Assets

- [ ] Social media accounts
- [ ] Launch announcement content
- [ ] Press kit materials
- [ ] Community partnerships

## 🚨 Step 8: Go Live!

### 8.1 Launch Day Checklist

- [ ] Final backup of database
- [ ] Monitor error rates and performance
- [ ] Have rollback plan ready
- [ ] Monitor community feedback
- [ ] Respond to user questions

### 8.2 Post-Launch Monitoring

**First 24 Hours:**
- Monitor registration rates
- Check email delivery
- Watch for error spikes
- Respond to user feedback

**First Week:**
- Analyze user behavior
- Monitor community engagement
- Adjust moderation settings
- Plan first events

**First Month:**
- Review growth metrics
- Optimize based on usage patterns
- Plan new features
- Build community partnerships

## 🎯 Success Metrics

**Technical Metrics:**
- 99.9% uptime
- <2 second page load times
- <0.1% error rate
- 100% email deliverability

**Community Metrics:**
- User registration growth
- Daily active users
- Content creation rates
- Event attendance
- House participation

## 🆘 Troubleshooting Common Issues

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check Supabase project status
- Ensure RLS policies allow access

### Authentication Issues
- Check redirect URLs match exactly
- Verify email service is working
- Test magic link expiration times

### File Upload Problems
- Check storage bucket policies
- Verify file size limits
- Test different file types

### Performance Issues
- Monitor database query performance
- Check for missing indexes
- Optimize image loading

## 🎊 Congratulations!

You now have a fully functional, production-ready ballroom community platform! 

**Key Features Now Live:**
- ✨ Beautiful passwordless authentication
- 🏠 House management system
- 💬 Real-time messaging
- 🖼️ Performance gallery
- 📅 Event management
- 👤 Rich user profiles
- 🔐 Role-based permissions
- 📧 Branded email templates
- 📊 Analytics and monitoring
- 🛡️ Security and moderation

The stage is set, the lights are on, and your ballroom community is ready to serve! Welcome to the Haus of Basquiat! ✨🌈

*May your community thrive with authenticity, creativity, and fierce love!*