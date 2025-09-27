# 🎭 Haus of Basquiat - Ballroom Community Platform

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)](https://github.com/miketui/v0-appmain2)
[![Deployed on Railway](https://img.shields.io/badge/Deployed%20on-Railway-purple?style=for-the-badge&logo=railway)](https://railway.app)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

A sophisticated social platform designed for the ballroom and voguing community, featuring elegant design, real-time interactions, and comprehensive community management tools.

---

## 🚀 Quick Deployment (5 Minutes)

### **Railway PostgreSQL (Recommended)**
1. **Fork this repository**
2. **Go to [railway.app](https://railway.app)** → New Project → Deploy from GitHub
3. **Select your repository**
4. **Add PostgreSQL service** in Railway dashboard
5. **Add environment variables** (see below)
6. **Deploy automatically** → Your app is live!

**Total Cost**: $5/month (app + database included)

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git

### 1. Clone & Install
```bash
git clone https://github.com/miketui/v0-appmain2.git
cd v0-appmain2
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

**Required Variables:**
```bash
# Database (Railway PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-minimum-32-characters"
JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Optional API Keys** (for enhanced features):
```bash
# AI Content Moderation
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
OPENAI_API_KEY="sk-your-openai-key"

# Email Service
SENDGRID_API_KEY="SG.your-sendgrid-key"

# Analytics
GOOGLE_ANALYTICS_ID="G-your-ga4-measurement-id"

# Payment Processing (for premium features)
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
```

### 3. Database Setup
```bash
# Setup database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed with sample data (optional)
npx prisma db seed
```

### 4. Start Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture

**Tech Stack:**
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, shadcn/ui
- **Database**: PostgreSQL (Railway)
- **ORM**: Prisma
- **Authentication**: JWT with custom implementation
- **Testing**: Vitest, Playwright
- **Deployment**: Railway (recommended), Render, Fly.io alternatives available

**Key Features:**
- 🔐 Secure authentication system
- 💬 Real-time messaging with Socket.IO
- 🖼️ Media gallery with categories
- 🏠 House/committee management
- 📱 Progressive Web App (PWA)
- 🎪 Event management and calendar
- 👥 Role-based access control (ADMIN/LEADER/MEMBER/APPLICANT)
- 🎭 Ballroom community-specific features

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run e2e

# Test with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication flows
│   ├── api/               # API routes
│   ├── feed/              # Social feed
│   ├── gallery/           # Media gallery
│   ├── messages/          # Real-time messaging
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                   # Utilities and configuration
│   ├── railway-db.ts     # Database service layer
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── tests/                # Test suites
```

---

## 🚀 Deployment Options

### 🥇 Railway (Recommended - $5/month)
- Zero configuration setup
- PostgreSQL included
- Automatic deployments from GitHub
- Built-in monitoring and logs

### 🥈 Render ($7/month, free tier available)
- Docker-based deployment
- PostgreSQL included
- Good free tier for development

### 🥉 Fly.io ($3-5/month)
- Global edge deployment
- Dockerfile-based
- Great for cost optimization

**Complete setup guides available in `DEPLOYMENT_RUNBOOK.md`**

---

## 🔧 Environment Variables Reference

### **Required (Core Functionality)**
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-super-secure-jwt-secret-here` |
| `JWT_REFRESH_SECRET` | JWT refresh secret | `your-refresh-secret-here` |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `https://your-app.railway.app` |

### **Optional (Enhanced Features)**
| Variable | Description | Provider |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | AI content moderation | [Anthropic](https://console.anthropic.com) |
| `OPENAI_API_KEY` | AI features | [OpenAI](https://platform.openai.com) |
| `SENDGRID_API_KEY` | Email service | [SendGrid](https://sendgrid.com) |
| `STRIPE_SECRET_KEY` | Payment processing | [Stripe](https://stripe.com) |
| `GOOGLE_ANALYTICS_ID` | Analytics | [Google Analytics](https://analytics.google.com) |

**Complete list available in `.env.example`**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test && npm run e2e`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🆘 Support & Documentation

- **Deployment Guide**: [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md)
- **Database Alternatives**: [DATABASE_ALTERNATIVES.md](./DATABASE_ALTERNATIVES.md)
- **Database Comparison**: [DATABASE_COMPARISON.md](./DATABASE_COMPARISON.md)
- **Issues**: [GitHub Issues](https://github.com/miketui/v0-appmain2/issues)

---

*Built with ❤️ for the ballroom and voguing community*

**Ready to deploy?** Follow the Railway setup guide in `DEPLOYMENT_RUNBOOK.md` and have your community platform live in 5 minutes!