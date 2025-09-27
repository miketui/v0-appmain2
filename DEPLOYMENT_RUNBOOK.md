# 🚀 Complete Deployment Runbook - Haus of Basquiat Portal

**From Repository to Production in 30 Minutes**

This runbook provides copy-paste commands to deploy your ballroom community platform to production using Railway (recommended), Render, or Fly.io.

---

## 📋 Pre-Flight Checklist

**Before starting deployment, ensure you have:**

- [ ] ✅ **GitHub Repository**: Code pushed to `main` branch
- [ ] ✅ **Supabase Account**: Database and auth configured
- [ ] ✅ **Environment Variables**: From `.env.example`
- [ ] ✅ **Domain Ready**: (optional) Custom domain configured
- [ ] ✅ **Build Tested**: `npm run build` succeeds locally

**Time Estimate**: 30 minutes to production-ready deployment

---

## 🥇 Option 1: Railway (RECOMMENDED)

**Best for**: Next.js apps with databases, excellent DX, $5/month

### Step 1: Railway Account Setup
```bash
# Visit railway.app and sign in with GitHub
# No CLI installation needed - web-based deployment
```

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **"Deploy from GitHub repo"**
3. Choose your `v0-appmain2` repository
4. Railway auto-detects Next.js and configures build

### Step 3: Environment Variables
**Copy these into Railway dashboard:**

```bash
# Required - Database & Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.host:5432/database

# Required - Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters

# Required - App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Step 4: Deploy & Verify
```bash
# Railway deploys automatically after environment setup
# Monitor deployment at: https://railway.app/project/your-project

# Once deployed, test your app:
curl https://your-app.railway.app/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Step 5: Custom Domain (Optional)
1. **Railway Dashboard** → **Settings** → **Domains**
2. Add custom domain: `hausofbasquiat.com`
3. **Update DNS** with provided CNAME record
4. **Update environment**: `NEXT_PUBLIC_APP_URL=https://hausofbasquiat.com`

**🎉 Deployment Complete!** Your app is live at: `https://your-app.railway.app`

---

## 🥈 Option 2: Render

**Best for**: Free tier option, Docker support, $7/month

### Step 1: Render Account Setup
```bash
# Visit render.com and sign in with GitHub
```

### Step 2: Deploy with render.yaml
```bash
# Your repo already includes render.yaml configuration
# Render will automatically use this configuration
```

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository: `v0-appmain2`
3. Render detects `render.yaml` and configures automatically
4. **Plan**: Select **"Free"** or **"Starter ($7/month)"**

### Step 3: Environment Variables
**Set in Render dashboard:**

```bash
# Required variables (same as Railway)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-jwt-secret-32-chars-minimum
JWT_REFRESH_SECRET=your-refresh-secret-32-chars
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
```

### Step 4: Deploy & Monitor
```bash
# Render deploys automatically
# Monitor at: https://dashboard.render.com

# Test deployment:
curl https://your-app.onrender.com/api/health
```

**🎉 Deployment Complete!** Your app is live at: `https://your-app.onrender.com`

---

## 🥉 Option 3: Fly.io

**Best for**: Global edge deployment, cost-effective, $3-5/month

### Step 1: Install Fly CLI
```bash
# macOS
brew install flyctl

# Linux/WSL
curl -L https://fly.io/install.sh | sh

# Windows
iwr https://fly.io/install.ps1 -useb | iex
```

### Step 2: Login & Setup
```bash
# Login to Fly.io
fly auth login

# Initialize app (in your project directory)
cd /path/to/your/v0-appmain2
fly apps create haus-of-basquiat-portal
```

### Step 3: Configure Environment
```bash
# Set environment variables
fly secrets set NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
fly secrets set DATABASE_URL="postgresql://username:password@host:port/database"
fly secrets set JWT_SECRET="your-jwt-secret-32-chars"
fly secrets set JWT_REFRESH_SECRET="your-refresh-secret-32-chars"
fly secrets set NEXT_PUBLIC_APP_URL="https://haus-of-basquiat-portal.fly.dev"
```

### Step 4: Deploy
```bash
# Deploy to Fly.io
fly deploy

# Monitor deployment
fly logs

# Check app status
fly status
```

### Step 5: Custom Domain (Optional)
```bash
# Add custom domain
fly certs add hausofbasquiat.com

# Check certificate status
fly certs show hausofbasquiat.com
```

**🎉 Deployment Complete!** Your app is live at: `https://haus-of-basquiat-portal.fly.dev`

---

## 🔧 Local Testing Commands

**Before deploying, verify everything works locally:**

```bash
# Install dependencies
npm ci

# Environment setup
cp .env.example .env.local
# Edit .env.local with your values

# Database setup (if using local Supabase)
npx supabase start
npx supabase db reset

# Build application
npm run build

# Start production server
npm start

# Verify health endpoint
curl http://localhost:3000/api/health

# Run tests
npm test
npm run e2e

# Type checking
npm run type-check

# Security audit
npm run security:audit
```

---

## 📊 Post-Deployment Verification

**After deployment, verify your application:**

### Health Checks
```bash
# Check API health
curl https://your-app-url.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-XX...","environment":"production"}
```

### Page Accessibility
```bash
# Test key pages (replace with your domain)
curl -I https://your-app-url.com/
curl -I https://your-app-url.com/feed
curl -I https://your-app-url.com/gallery
curl -I https://your-app-url.com/auth/signin

# All should return: HTTP/2 200
```

### Database Connection
```bash
# Test database connectivity through API
curl https://your-app-url.com/api/posts
# Should return posts array or authentication prompt
```

---

## 🔍 Troubleshooting Guide

### Build Failures
```bash
# Common issues and solutions:

# 1. Missing environment variables
# Solution: Verify all required env vars are set in platform dashboard

# 2. Type errors
npm run type-check
# Fix TypeScript errors before deploying

# 3. Dependency issues
npm ci --force
# Clear node_modules and reinstall

# 4. Memory issues during build
# Railway: Upgrade to Pro plan
# Render: Use Starter plan ($7/month)
# Fly.io: Increase memory in fly.toml
```

### Runtime Errors
```bash
# 1. Database connection issues
# Check DATABASE_URL format and credentials

# 2. Supabase authentication errors
# Verify NEXT_PUBLIC_SUPABASE_URL and keys

# 3. JWT secret issues
# Ensure JWT_SECRET is 32+ characters

# 4. CORS issues
# Update NEXT_PUBLIC_APP_URL to match deployed domain
```

### Performance Issues
```bash
# 1. Slow initial load
# Enable compression in next.config.js (already configured)

# 2. Large bundle size
npm run build:analyze
# Review bundle analyzer output

# 3. Database query performance
# Check Supabase dashboard for slow queries
```

---

## 🎯 Production Optimization

### Security Headers
```bash
# Already configured in next.config.js:
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
# - Referrer-Policy: origin-when-cross-origin
# - Permissions-Policy for camera/microphone
```

### Performance Monitoring
```bash
# Built-in monitoring:
# - Railway: Built-in metrics dashboard
# - Render: Performance graphs in dashboard
# - Fly.io: fly logs --follow for real-time monitoring

# Optional: Add external monitoring
# - Sentry for error tracking
# - Uptime Robot for availability monitoring
```

### Database Backup
```bash
# Supabase: Automatic backups included
# Railway PostgreSQL: Automatic backups on paid plans
# Render PostgreSQL: Automatic backups included

# Manual backup command (if needed):
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## 💰 Cost Comparison Summary

| Platform | Free Tier | Paid Plan | Best For |
|----------|-----------|-----------|----------|
| **Railway** | Limited | $5/month | Next.js + PostgreSQL |
| **Render** | Yes (limited) | $7/month | Docker deployments |
| **Fly.io** | $5 credit | $3-5/month | Global edge, cost-effective |

**Recommendation**: Start with **Railway** for best Next.js experience and scaling.

---

## 📞 Support & Next Steps

### Getting Help
- **Railway**: [railway.app/help](https://railway.app/help)
- **Render**: [render.com/docs](https://render.com/docs)
- **Fly.io**: [fly.io/docs](https://fly.io/docs)

### Monitoring Your App
1. **Set up uptime monitoring** (UptimeRobot, Pingdom)
2. **Configure error tracking** (Sentry)
3. **Monitor performance** (platform dashboards)
4. **Set up backup strategies** (database dumps)

### Scaling Considerations
- **Traffic growth**: All platforms auto-scale
- **Database performance**: Monitor query times in Supabase
- **CDN optimization**: Consider Cloudflare for global users
- **Caching strategy**: Redis for session storage (optional)

---

## ✅ Deployment Checklist

**After successful deployment:**

- [ ] ✅ **Health check** passes: `/api/health` returns 200
- [ ] ✅ **Pages load** correctly: Home, feed, gallery, auth
- [ ] ✅ **Authentication** works: Sign up/sign in flow
- [ ] ✅ **Database** connected: Posts and users load
- [ ] ✅ **Environment** configured: All required env vars set
- [ ] ✅ **Custom domain** setup (if applicable)
- [ ] ✅ **SSL certificate** active and valid
- [ ] ✅ **Monitoring** configured: Uptime and error tracking
- [ ] ✅ **Backup strategy** confirmed: Database backups enabled

**🎉 Congratulations!**

Your Haus of Basquiat ballroom community platform is now live and ready for your community to use!

---

*Need help? Create an issue in the repository or contact the development team.*