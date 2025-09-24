# 🚀 Haus of Basquiat - Production Setup Guide

## Immediate Steps to Enable Member Signups

### 1. Update Environment Variables (CRITICAL)

Replace these in your `.env.local` or deployment platform:

```env
# Replace with YOUR actual Supabase project details
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-ID.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get these from your Supabase dashboard → Settings → API
```

### 2. Configure Supabase Authentication

In your Supabase dashboard:

1. **Go to Authentication → Settings**
2. **Add your site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. **Add redirect URLs**:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback`

### 3. Enable Email Templates

1. **Go to Authentication → Email Templates**
2. **Customize the "Magic Link" template**:
   - Subject: "Welcome to Haus of Basquiat! 👑"
   - Add ballroom community branding

### 4. Test Member Signup Flow

1. **Visit your app** (local or deployed)
2. **Enter email address** on landing page
3. **Check email** for magic link
4. **Complete application form**
5. **Admin approval process** begins

### 5. Create Admin User

1. **Visit**: `https://yourdomain.com/admin/setup?key=your-super-admin-setup-key`
2. **Complete admin setup**
3. **Access admin dashboard**: `/admin/dashboard`
4. **Approve member applications**

## Member Journey Flow

### 1. Landing Page (`/`)
- Email signup with magic link
- Basquiat-inspired design
- Community introduction

### 2. Application Process
- Multi-step form
- House preferences
- Ballroom experience
- Social links

### 3. Admin Review
- Applications queue
- Member approval/rejection
- Role assignment (Member/Leader/Admin)

### 4. Member Dashboard (`/feed`)
- Community posts
- House activities
- Real-time chat
- Media gallery

## Quick Verification Checklist

- [ ] Supabase project created and SQL executed
- [ ] Environment variables configured
- [ ] Site URLs added to Supabase auth
- [ ] App deployed and accessible
- [ ] Email signup working
- [ ] Magic link authentication functional
- [ ] Application form submitting
- [ ] Admin dashboard accessible

## Support Resources

- **Database Schema**: `supabase-complete-setup.sql`
- **Deployment Guide**: `DEPLOYMENT.md`
- **API Documentation**: `/docs`

## Success Indicators

✅ **Members can sign up with email**
✅ **Magic link authentication works**
✅ **Application forms submit successfully**
✅ **Admin can approve/reject applications**
✅ **Approved members can access community features**

Your ballroom community platform is now ready to welcome members! 🌈✨

---
*Built with ❤️ for the ballroom and voguing community*