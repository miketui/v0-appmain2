# 🎭 Haus of Basquiat - Ballroom Community Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nns-projects-a973bdbb/v0-appmain2)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/i6d51JDopAO)

A sophisticated social platform designed for the ballroom and voguing community, featuring elegant design, real-time interactions, and comprehensive community management tools.

## ✨ Features & Beautiful Pages

### 🎨 **Stunning Visual Design**
All pages feature a cohesive **purple-to-gold gradient aesthetic** that captures the elegance and boldness of ballroom culture:

- **Landing Page** - Elegant hero section with community showcase
- **Authentication Flow** - Sophisticated sign-in/sign-up with magic link support
- **Social Feed** - Dynamic post creation with house affiliations and role badges
- **Real-time Chat** - Sleek messaging interface with file sharing
- **User Profiles** - Detailed profiles showcasing house membership and achievements
- **Admin Dashboard** - Comprehensive management interface with analytics
- **Settings Pages** - Intuitive account and privacy controls

### 🏛️ **Core Functionality**
- **Multi-tier Authentication** - Role-based access (Applicant → Member → Leader → Admin)
- **House System** - Community organization with house affiliations
- **Social Feed** - Posts, likes, comments, and engagement tracking
- **Real-time Messaging** - Direct messages and group conversations
- **Document Management** - Secure file sharing with role-based access
- **Admin Tools** - User management, content moderation, and analytics
- **Notification System** - Real-time updates and community alerts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### 1. Clone & Install
\`\`\`bash
git clone https://github.com/your-username/v0-appmain2.git
cd v0-appmain2
npm install
\`\`\`

### 2. Environment Setup

Create `.env` file in the root directory:
\`\`\`bash
# 🔑 REQUIRED - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 🌐 REQUIRED - App Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback

# 🔐 REQUIRED - Security
JWT_SECRET=your-super-secure-jwt-secret-here

# 📧 OPTIONAL - Enhanced Features
UPSTASH_REDIS_URL=your-redis-url
CLAUDE_API_KEY=your-claude-key
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key
\`\`\`

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
3. Enable Row Level Security on all tables
4. Configure authentication settings

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your beautiful ballroom community platform!

## 🎯 API Keys & Integrations

### 🔴 **Critical (Required for Basic Functionality)**
| Service | Purpose | Required |
|---------|---------|----------|
| **Supabase** | Database, Auth, Storage | ✅ Yes |
| **JWT Secret** | Authentication security | ✅ Yes |

### 🟡 **Enhanced Features (Optional)**
| Service | Purpose | Required |
|---------|---------|----------|
| **Upstash Redis** | Caching & sessions | 🔶 Optional |
| **Claude API** | AI content moderation | 🔶 Optional |
| **OpenAI API** | AI features | 🔶 Optional |
| **Stripe** | Payment processing | 🔶 Optional |
| **Copyleaks** | Content verification | 🔶 Optional |

## 🏗️ Project Structure

\`\`\`
haus-of-basquiat/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── feed/              # Social feed
│   ├── chat/              # Messaging system
│   ├── admin/             # Admin dashboard
│   ├── profile/           # User profiles
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── admin/            # Admin-specific components
│   ├── chat/             # Chat components
│   ├── feed/             # Feed components
│   └── ui/               # Base UI components
├── lib/                  # Utilities & configurations
├── database/             # SQL schema & migrations
└── backend/              # Express.js backend (optional)
\`\`\`

## 🎨 Design System

### Color Palette
- **Primary**: Purple to Gold gradient (`from-purple-600 to-amber-500`)
- **Backgrounds**: Dark theme with subtle gradients
- **Accents**: Gold highlights for premium features
- **Text**: High contrast for accessibility

### Typography
- **Headings**: Bold, elegant fonts with proper hierarchy
- **Body**: Clean, readable typography with optimal line spacing
- **Special**: Ballroom-inspired styling for community elements

## 🚀 Deployment Guide

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Option 2: Railway
1. Connect GitHub repository
2. Configure environment variables
3. Deploy with automatic builds

### Option 3: Docker
\`\`\`bash
# Build and run with Docker
docker build -t haus-of-basquiat .
docker run -p 3000:3000 haus-of-basquiat
\`\`\`

## 📋 Production Checklist

### ✅ **Ready for Production**
- [x] All pages designed and fully functional
- [x] Authentication system with role-based access
- [x] Real-time chat and messaging
- [x] Social feed with interactions
- [x] Admin dashboard with analytics
- [x] Responsive design across all devices
- [x] Security measures implemented
- [x] API integration layer complete

### 🔧 **Pre-Deployment Steps**
- [ ] Set up Supabase project and run schema
- [ ] Configure all required environment variables
- [ ] Test authentication flow
- [ ] Verify file upload functionality
- [ ] Enable HTTPS in production
- [ ] Set up monitoring and error tracking

## 🛠️ Development

### Available Scripts
\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
\`\`\`

### Key Technologies
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with RLS
- **Real-time**: Supabase Realtime
- **Styling**: Tailwind CSS with custom design system

## 🎭 Community Features

### House System
- **House Affiliations**: Users can join ballroom houses
- **Role Hierarchy**: Applicant → Member → Leader → Admin
- **House Competitions**: Leaderboards and achievements
- **Community Events**: Event management and participation

### Social Features
- **Feed Posts**: Share updates, photos, and achievements
- **Real-time Chat**: Direct messages and group conversations
- **Engagement**: Likes, comments, and social interactions
- **File Sharing**: Secure document and media sharing

## 📞 Support & Contributing

### Getting Help
- Check the [Deployment Guide](DEPLOYMENT.md) for detailed setup instructions
- Review the [Implementation Summary](IMPLEMENTATION_SUMMARY.md) for technical details
- Open an issue for bugs or feature requests

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the ballroom community**

*Continue building and customizing on [v0.app](https://v0.app/chat/projects/i6d51JDopAO)*
