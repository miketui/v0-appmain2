# 🎭 Ballroom Community Portal

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

A sophisticated social platform designed for the ballroom and voguing community, featuring elegant design, real-time interactions, and comprehensive community management tools.

> **Note**: This is an open-source template for building ballroom community platforms. You can customize it for your own community or contribute to make it better for everyone.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Git
- Supabase account (free tier available)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/ballroom-community-portal.git
cd ballroom-community-portal
npm install
# or
pnpm install
```

### 2. Environment Configuration

Create `.env.local` file in the root directory with the following variables:

#### 🔴 **REQUIRED** - Core Application
```bash
# Database & Authentication
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
DIRECT_URL="postgresql://username:password@localhost:5432/your_database_name"

# Supabase (Required for auth, database, storage)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Security (Generate strong secrets)
JWT_SECRET="your-super-secure-jwt-secret-minimum-32-characters"
JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

#### 🟡 **RECOMMENDED** - Enhanced Features
```bash
# Email Service (for notifications)
SENDGRID_API_KEY="SG.your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Redis (for sessions, caching, rate limiting)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# AI Moderation (content safety)
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
OPENAI_API_KEY="sk-your-openai-key"
COPYLEAKS_API_KEY="your-copyleaks-key"

# Analytics
GOOGLE_ANALYTICS_ID="G-YOUR-GA-ID"
```

#### 🟢 **OPTIONAL** - Advanced Features
```bash
# Payment Processing
STRIPE_SECRET_KEY="sk_test_your-stripe-secret"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-publishable-key"

# Live Streaming
LIVEPEER_API_KEY="your-livepeer-api-key"

# Search
BRAVE_SEARCH_API_KEY="your-brave-search-key"

# Real-time Communication
SOCKET_IO_SECRET="your-socket-io-secret"
```

### 3. Database Setup

#### Option 1: Supabase (Recommended)
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Run the database schema:
   - Go to SQL Editor in Supabase dashboard
   - Copy and run the schema from `database/schema.sql` (if available)
   - Enable Row Level Security on all tables

#### Option 2: Local PostgreSQL
```bash
# Install PostgreSQL locally
createdb your_database_name
psql your_database_name < database/schema.sql
```

### 4. Development Server
```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000` 🎉

---

## 📋 Complete Environment Variables Reference

### Missing from Current .env.example:
```bash
# Authentication refresh tokens
JWT_REFRESH_SECRET="generate-a-different-32-char-secret"

# File upload limits
MAX_FILE_SIZE="10485760"  # 10MB in bytes
ALLOWED_FILE_TYPES="jpg,jpeg,png,gif,pdf,doc,docx"

# Rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE="100"
RATE_LIMIT_BURST="200"

# Admin configuration
ADMIN_EMAILS="admin@yourdomain.com,founder@example.com"
SUPER_ADMIN_KEY="your-super-admin-setup-key"

# Community settings
DEFAULT_USER_ROLE="APPLICANT"
AUTO_APPROVE_MEMBERS="false"
COMMUNITY_NAME="Haus of Basquiat"

# Security headers
ENABLE_CSP="true"
ENABLE_HSTS="true"
COOKIE_DOMAIN=".yourdomain.com"  # for production

# Logging and monitoring
LOG_LEVEL="info"
SENTRY_DSN="your-sentry-dsn"  # Optional error tracking
```

---

## 🛠️ Deployment Guide

### Option 1: Vercel (Recommended)

#### Step 1: Prepare Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "feat: prepare for deployment"
git push origin main
```

#### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project" → Import your GitHub repository
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist` or `.next`
   - **Install Command**: `npm ci`

#### Step 3: Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```bash
# Add ALL the required variables from your .env.local
# Make sure to use production values for:
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NODE_ENV="production"
```

#### Step 4: Custom Domain (Optional)
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain: `yourdomain.com`
3. Update DNS records as instructed
4. Update environment variables:
   ```bash
   NEXT_PUBLIC_APP_URL="https://hausofbasquiat.com"
   COOKIE_DOMAIN=".hausofbasquiat.com"
   ```

### Option 2: Railway

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Deploy
```bash
railway init
railway up
```

#### Step 3: Add Environment Variables
```bash
# Add variables one by one
railway variables set DATABASE_URL="your-production-db-url"
railway variables set NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
# ... add all other variables
```

### Option 3: Docker Deployment

#### Step 1: Build Docker Image
```bash
# Use the provided staging Dockerfile
docker build -f Dockerfile.staging -t hausofbasquiat-app .
```

#### Step 2: Run Container
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your-url" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-key" \
  hausofbasquiat-app
```

#### Step 3: Production with Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.staging
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_KEY}
    restart: unless-stopped
```

---

## 👑 Admin Section Setup

### Step 1: Create First Admin User

#### Method 1: Super Admin Key (Recommended)
1. Add to your environment variables:
   ```bash
   SUPER_ADMIN_KEY="your-secret-setup-key-123"
   ADMIN_EMAILS="your-email@example.com,admin@hausofbasquiat.com"
   ```

2. Navigate to `/admin/setup?key=your-secret-setup-key-123`

3. This will automatically promote the first registered user to admin

#### Method 2: Database Direct
```sql
-- Connect to your database and run:
UPDATE users 
SET role = 'ADMIN', 
    email_verified = true,
    approved_at = NOW()
WHERE email = 'your-admin-email@example.com';
```

#### Method 3: Supabase Dashboard
1. Go to Supabase → Authentication → Users
2. Find your user and edit
3. In user metadata, add: `{"role": "ADMIN"}`

### Step 2: Admin Dashboard Access

Once admin user is created:
1. Visit `/admin/dashboard` 
2. Login with admin credentials
3. You'll see:
   - **User Management**: Approve/reject members
   - **Content Moderation**: Review posts and messages  
   - **Analytics**: Community engagement metrics
   - **Settings**: Platform configuration
   - **House Management**: Create and manage ballroom houses

### Step 3: Admin Features Available

#### User Management
- View all pending applications
- Approve/reject new members
- Promote users to Leader or Admin
- Suspend or ban problematic users
- View user activity and engagement

#### Content Moderation  
- AI-powered content flagging
- Manual review queue for posts
- Message monitoring and filtering
- File upload validation and scanning

#### Community Management
- Create and manage houses
- Set up events and competitions
- Configure community guidelines
- Monitor community health metrics

#### Analytics Dashboard
- User registration trends
- Engagement metrics
- Content performance
- Revenue tracking (if payments enabled)

---

## 🌐 Custom Domain Setup

### Step 1: Domain Registration
1. Purchase domain from registrar (Namecheap, GoDaddy, etc.)
2. Recommended: `hausofbasquiat.com` or similar

### Step 2: DNS Configuration

#### For Vercel:
1. In Vercel dashboard → Settings → Domains
2. Add your domain: `hausofbasquiat.com`
3. Add these DNS records at your registrar:

```dns
Type: A      Name: @           Value: 76.76.19.61
Type: CNAME  Name: www         Value: cname.vercel-dns.com
Type: CNAME  Name: *           Value: cname.vercel-dns.com
```

#### For Railway:
```dns
Type: CNAME  Name: @           Value: your-app.railway.app
Type: CNAME  Name: www         Value: your-app.railway.app
```

### Step 3: SSL Certificate
- Vercel: Automatic SSL (Let's Encrypt)
- Railway: Automatic SSL 
- Custom: Use Cloudflare for free SSL

### Step 4: Update Environment Variables
```bash
# Production environment
NEXT_PUBLIC_APP_URL="https://hausofbasquiat.com"
COOKIE_DOMAIN=".hausofbasquiat.com"
ALLOWED_ORIGINS="https://hausofbasquiat.com,https://www.hausofbasquiat.com"
```

### Step 5: Test Domain
1. Wait for DNS propagation (up to 48 hours)
2. Test: `https://hausofbasquiat.com`
3. Verify SSL certificate is valid
4. Test all major features work

---

## 👤 Member Signup Process

### Step 1: User Registration Flow

#### New User Journey:
1. **Landing Page** → Click "Join Community"
2. **Sign Up Form**:
   - Email address (required)
   - Display name (required) 
   - Real name (optional)
   - Phone number (optional)
   - Ballroom house affiliation (dropdown)
   - Brief introduction (textarea)

3. **Email Verification**:
   - Passwordless magic link sent to email
   - User clicks link to verify account
   - Redirected to application form

### Step 2: Application Process

#### Application Form Fields:
```javascript
// Required fields
- Full Name
- Email (verified)
- Display Name / Stage Name
- Date of Birth
- Location (City, State)

// Ballroom Community Questions
- House Affiliation (if any)
- Years in ballroom community
- Categories you compete in
- Notable achievements
- Why do you want to join this platform?

// Optional Media
- Profile photo upload
- Portfolio/performance videos
- Social media links

// Agreements
- Community guidelines acceptance
- Terms of service
- Privacy policy acknowledgment
```

#### Application Review:
1. **Auto-validation**: Email, basic info checks
2. **AI Screening**: Content appropriateness check
3. **Manual Review**: Admin/Leader approval queue
4. **Reference Check**: Existing member endorsement (optional)

### Step 3: Application States

```javascript
const APPLICATION_STATUS = {
  PENDING: 'Under review by community leaders',
  APPROVED: 'Welcome! Account activated',
  REJECTED: 'Application declined',  
  NEEDS_INFO: 'Additional information required'
}
```

### Step 4: Member Onboarding

#### Once Approved:
1. **Welcome Email**: Account activation notification
2. **Profile Setup**: Complete profile with photos
3. **Community Guidelines**: Interactive tutorial
4. **House Assignment**: Join selected house or remain independent
5. **First Post**: Encouraged to introduce themselves

#### Role Progression:
```
APPLICANT → MEMBER → LEADER → ADMIN
    ↓         ↓        ↓       ↓
 Applying   Active   House   Platform
           Member   Leader  Administrator
```

### Step 5: Automated Workflows

#### Email Notifications:
```bash
# Configure email templates
WELCOME_EMAIL_TEMPLATE="welcome-ballroom-community"
APPROVAL_EMAIL_TEMPLATE="membership-approved"
REJECTION_EMAIL_TEMPLATE="application-status"
```

#### Integration Setup:
1. **Supabase Auth**: Handles magic link authentication
2. **Database Triggers**: Auto-create user profiles
3. **Email Service**: SendGrid for notifications
4. **File Storage**: Supabase Storage for uploads

---

## 🔧 Development & Customization

### Project Structure
```
haus-of-basquiat/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication flows
│   ├── admin/             # Admin dashboard
│   ├── api/               # API endpoints
│   ├── dashboard/         # Member dashboard  
│   ├── feed/              # Social feed
│   └── profile/           # User profiles
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── auth/             # Auth components
│   ├── ui/               # Base UI components
│   └── forms/            # Form components
├── lib/                  # Utilities
├── database/             # SQL schemas
├── public/               # Static assets
└── styles/              # CSS/styling
```

### Key Configuration Files

#### Authentication Config
```typescript
// lib/auth.ts
export const authConfig = {
  providers: ['email', 'magic_link'],
  redirectUrls: {
    signIn: '/dashboard',
    signUp: '/welcome',
    signOut: '/'
  },
  roles: ['APPLICANT', 'MEMBER', 'LEADER', 'ADMIN']
}
```

#### Database Schema
```sql
-- User roles and permissions
CREATE TYPE user_role AS ENUM ('APPLICANT', 'MEMBER', 'LEADER', 'ADMIN');
CREATE TYPE application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_INFO');

-- Core tables
CREATE TABLE users (...);
CREATE TABLE applications (...);
CREATE TABLE houses (...);
CREATE TABLE posts (...);
CREATE TABLE messages (...);
```

### Customization Options

#### Branding
- Update `tailwind.config.js` for colors
- Replace logo in `public/`
- Modify meta tags in `app/layout.tsx`

#### Community Rules
- Edit `lib/community-guidelines.ts`
- Update moderation settings
- Configure auto-approval rules

#### Payment Integration
- Add Stripe configuration
- Set up subscription tiers
- Configure payment webhooks

---

## 📊 Analytics & Monitoring

### Built-in Analytics
- User registration trends
- Post engagement metrics
- Message activity
- File upload statistics
- Community growth tracking

### Optional Integrations
```bash
# Google Analytics
GOOGLE_ANALYTICS_ID="G-YOUR-GA-ID"

# Mixpanel (advanced events)
MIXPANEL_TOKEN="your-mixpanel-token"

# Sentry (error tracking)  
SENTRY_DSN="your-sentry-dsn"

# PostHog (product analytics)
POSTHOG_KEY="your-posthog-key"
```

---

## 🛡️ Security Checklist

### Production Security
- [ ] Strong JWT secrets (32+ characters)
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] File upload validation
- [ ] SQL injection protection
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Content Security Policy
- [ ] Environment variables secured

### Privacy & Compliance
- [ ] Privacy policy updated
- [ ] Cookie consent implemented
- [ ] Data retention policies
- [ ] User data export/deletion
- [ ] GDPR compliance (if EU users)
- [ ] Content moderation active

---

## 🚨 Troubleshooting

### Common Issues

#### "Supabase connection failed"
1. Check `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify anon key has proper permissions
3. Ensure database is running

#### "Authentication not working"
1. Check email provider settings in Supabase
2. Verify redirect URLs are configured
3. Check JWT secret is set

#### "File uploads failing"
1. Check Supabase Storage bucket permissions
2. Verify file size limits
3. Check allowed file types

#### "Admin dashboard not accessible"
1. Verify admin user role in database
2. Check admin routes are protected
3. Ensure proper permissions are set

### Getting Help
1. Check the [Issues](https://github.com/miketui/v0-appmain2/issues) for known problems
2. Review deployment logs for errors
3. Test with development environment first
4. Create detailed issue reports with error messages

---

## 📞 Support & Community

### Documentation
- [API Documentation](docs/api.md) - API endpoints and usage
- [Component Library](docs/components.md) - UI component guide  
- [Database Schema](docs/database.md) - Data structure reference
- [Deployment Guide](docs/deployment.md) - Detailed deployment steps

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### License
This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

**🎭 Built with ❤️ for the ballroom and voguing community**

*A platform where every member can shine, every house can flourish, and the culture can thrive.*

---

## 🎯 Next Steps After Setup

1. **Test the full user journey** from signup to admin approval
2. **Configure your first ballroom houses** in admin panel
3. **Set up email templates** for community communication
4. **Customize community guidelines** for your specific culture
5. **Enable optional features** like payments or AI moderation
6. **Launch with a small beta group** before full community rollout

Welcome to your ballroom community platform! 🌟

---

## 🤝 Contributing

We welcome contributions from the community! This project is built for and by the ballroom and voguing community.

### How to Contribute
- 🐛 **Report bugs** by opening an issue
- 💡 **Suggest features** that would benefit the community
- 🔧 **Submit pull requests** with improvements
- 📖 **Improve documentation** to help others
- 🎨 **Enhance design** with accessibility in mind
- 🌍 **Add translations** for global communities

### Getting Started
1. Read our [Contributing Guidelines](CONTRIBUTING.md)
2. Check out [open issues](../../issues) 
3. Fork the repository and make your changes
4. Submit a pull request with a clear description

### Community Guidelines
- **Inclusive**: Welcome contributors of all backgrounds and skill levels
- **Respectful**: Honor the culture and history of ballroom and voguing
- **Collaborative**: Work together to build something amazing
- **Safe**: Prioritize the safety of LGBTQ+ community members

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Open Source Notice
This platform is open source to benefit the entire ballroom community. You can:
- ✅ Use it for your own community
- ✅ Modify it to fit your needs  
- ✅ Contribute improvements back
- ✅ Learn from the codebase
- ❌ Use it for commercial purposes without attribution

---

## 📋 Additional Notes

**Environment Validation**: The app validates environment variables via `lib/env.ts`. Use `.env.local` for local development and your platform's secret manager in production.

**Database Setup**: Follow the Supabase setup steps above, then run the SQL files in order:
- `supabase-setup.sql` (core schema, RLS)
- `supabase-storage-setup.sql` (buckets, policies)
- Additional setup files as needed

**Security Reminder**: Never commit real environment variables. Store secrets only in your deployment platform's secret manager. If any secret was shared in chat or logs, rotate it immediately.

For detailed technical documentation and advanced setup options, see the additional documentation files in the repository.
