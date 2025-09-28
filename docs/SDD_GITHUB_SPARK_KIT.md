# 🎭 Haus of Basquiat Portal - SDD GitHub Spark Development Kit

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Project Type:** Members-only Ballroom Community Social Platform  
**Framework:** Next.js 14 + TypeScript + Supabase + Railway

---

## 🎯 Overview

This SDD (Spark Development Kit) provides GitHub Spark with comprehensive specifications, templates, and automation scripts to correctly build, extend, and deploy the Haus of Basquiat Portal - a premium social platform for the ballroom and voguing community.

## 📋 Project Summary

### Core Features
- **Authentication**: Passwordless magic-link + JWT with role-based access (APPLICANT/MEMBER/LEADER/ADMIN)
- **Social Feed**: Real-time posts with rich media, comments, likes, house filtering
- **Real-time Messaging**: Direct messages + group chats with Socket.IO
- **Media Gallery**: Drag-and-drop uploads with categorization (Performance/Fashion/Runway)
- **House Management**: Committee hierarchies, member rosters, event coordination
- **Admin Dashboard**: User management, content moderation, analytics
- **PWA Support**: Offline functionality, push notifications, mobile app experience

### Tech Stack
```
Frontend:  Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + shadcn/ui
Backend:   Next.js API Routes + Express.js + Socket.IO + Prisma ORM
Database:  PostgreSQL (Railway/Supabase)
Auth:      Supabase Auth + JWT
Storage:   Supabase Storage / Cloudinary / AWS S3
Deploy:    Railway (Primary) + Vercel + Docker + Render + Fly.io
Testing:   Vitest + Playwright + Testing Library
```

---

## 🏗️ Architecture Overview

### Directory Structure
```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication flows
│   ├── api/               # API routes & webhooks
│   ├── feed/              # Social feed
│   ├── gallery/           # Media gallery
│   ├── messages/          # Real-time messaging
│   ├── admin/             # Admin dashboard
│   └── [other routes]
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── layout/           # Layout components
│   ├── feed/             # Social feed components
│   ├── admin/            # Admin panel components
│   └── [feature dirs]
├── lib/                   # Utilities and configuration
│   ├── auth.ts           # Authentication utilities
│   ├── api.ts            # API client
│   ├── railway-db.ts     # Database service layer
│   └── [other utils]
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── prisma/               # Database schema and migrations
├── tests/                # Test suites
└── docs/                 # Documentation
```

### Data Model (Prisma Schema)
Key entities and relationships:
- **Users** → **Profiles** (1:1)
- **Houses** → **Members** (1:Many)
- **Posts** → **Comments** (1:Many)
- **ChatThreads** → **Messages** (1:Many)
- **Gallery** → **MediaItems** (1:Many)
- **Events** → **RSVPs** (1:Many)

---

## 🎨 Design System

### Brand Colors & Gradients
```css
/* Primary Gradients (Authenticated Areas) */
--gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #1f2937 50%, #fbbf24 100%);
--gradient-hero: linear-gradient(135deg, #dc2626 0%, #2563eb 50%, #fbbf24 100%);

/* Accent Colors */
--gold: #fbbf24;
--purple: #8b5cf6;
--red: #dc2626;
--blue: #2563eb;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography Scale
```css
/* Headings */
--text-5xl: 3rem;     /* Hero titles */
--text-4xl: 2.25rem;  /* Page titles */
--text-3xl: 1.875rem; /* Section headers */
--text-2xl: 1.5rem;   /* Card titles */
--text-xl: 1.25rem;   /* Component titles */

/* Body Text */
--text-base: 1rem;    /* Default */
--text-sm: 0.875rem;  /* Secondary */
--text-xs: 0.75rem;   /* Labels */
```

### Component Standards
- **Cards**: Rounded corners, subtle shadows, glassmorphism effects
- **Buttons**: Gradient backgrounds, hover effects, loading states
- **Forms**: Bordered inputs, floating labels, validation states
- **Navigation**: Floating action buttons, breadcrumbs, active states

---

## 🔧 Development Environment Setup

### Prerequisites
```bash
Node.js >= 18.17.0
npm >= 9.0.0
PostgreSQL >= 14
Git
```

### Quick Start
```bash
# Clone repository
git clone https://github.com/miketui/v0-appmain2.git
cd v0-appmain2

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Configure DATABASE_URL, JWT_SECRET, etc.

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables
Critical configuration (see `.env.example` for full list):
```env
# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db

# Authentication
JWT_SECRET=your-super-secure-32-char-secret
JWT_REFRESH_SECRET=your-refresh-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional APIs (add as needed)
ANTHROPIC_API_KEY=sk-ant-...  # AI moderation
SENDGRID_API_KEY=SG....       # Emails
STRIPE_SECRET_KEY=sk_...      # Payments
CLOUDINARY_URL=cloudinary://  # Media storage
```

---

## 📱 Feature Specifications

### 1. Authentication System

#### Magic Link Authentication
**Route:** `app/auth/signin/page.tsx`
**Components:** `EmailLoginForm`, `MagicLinkSent`
**Behavior:**
- Email input with validation
- Sends magic link via Supabase Auth
- Handles sign-in and sign-up flows
- Redirects to `/feed` on success

#### Application Workflow
**Route:** `app/page.tsx` (Landing Page)
**Components:** `ApplicationWizard`, `ProgressSteps`
**Steps:**
1. Personal info (name, pronouns, bio)
2. Community details (experience, house preference)
3. Social links (optional)
4. Review and submit

#### Role-Based Access Control
```typescript
enum UserRole {
  APPLICANT = 'APPLICANT',    // Pending approval
  MEMBER = 'MEMBER',          // Basic access
  LEADER = 'LEADER',          // House leadership
  ADMIN = 'ADMIN'             // Full admin access
}
```

### 2. Social Feed System

#### Feed Page
**Route:** `app/feed/page.tsx`
**Components:** `PostComposer`, `FeedFilters`, `PostCard`, `PostActions`

**Feed Filters:**
- All posts
- House-specific
- Following only
- Recent activity

**Post Types:**
- Text posts with rich formatting
- Image/video uploads
- Event announcements
- House updates

#### Post Composer
**Features:**
- Rich text editor
- Media attachment (drag & drop)
- Visibility settings (public/house/private)
- Post scheduling
- Draft saving

#### Post Card
**Elements:**
- User avatar with house badge
- Post content with media grid
- Action buttons (like, comment, share)
- Timestamp and visibility indicator
- Comments preview

### 3. Real-Time Messaging

#### Direct Messages
**Route:** `app/messages/page.tsx`
**Components:** `ConversationList`, `MessageThread`, `MessageComposer`

**Features:**
- Thread-based conversations
- Real-time message delivery via Socket.IO
- Typing indicators
- Read receipts
- File attachments
- Emoji reactions

#### Group Chat
**Route:** `app/chat/page.tsx`
**Components:** `ChatSidebar`, `ChatWindow`, `NewChatModal`

**Features:**
- House-based group chats
- Private group creation
- Member mentions (@username)
- Message search
- Thread replies

### 4. Media Gallery

#### Upload System
**Route:** `app/gallery/upload/page.tsx`
**Components:** `FileUploader`, `MediaPreview`, `MetadataForm`

**Categories:**
- Performance (voguing, walking, battles)
- Fashion (looks, outfits, styling)
- Runway (presentations, poses)
- Events (competitions, workshops)

**Features:**
- Drag & drop multi-file upload
- Image/video optimization
- Metadata extraction (EXIF)
- Tagging system
- Privacy controls

#### Gallery Browser
**Route:** `app/gallery/page.tsx` (to be created)
**Components:** `GalleryGrid`, `MediaModal`, `FilterControls`

**Features:**
- Masonry grid layout
- Category/tag filtering
- Lightbox viewer
- Social actions (like, comment)
- Download controls

### 5. House Management

#### House Pages
**Route:** `app/houses/[houseId]/page.tsx` (to be created)
**Components:** `HouseHeader`, `MemberRoster`, `HouseEvents`, `HouseGallery`

**Features:**
- House profile and history
- Member directory with roles
- Event calendar
- Photo/video highlights
- Leadership tools

### 6. Admin Dashboard

#### Admin Overview
**Route:** `app/admin/page.tsx`
**Components:** `AdminStats`, `UserManagement`, `ApplicationReview`, `ContentModeration`

**Sections:**
- User statistics and growth metrics
- Pending application review
- Content moderation queue
- System settings and configuration

#### User Management
**Features:**
- User search and filtering
- Role assignment
- Account suspension/activation
- Activity monitoring
- Bulk operations

#### Application Review
**Workflow:**
1. View pending applications
2. Review profile and submission
3. Approve/reject with optional notes
4. Assign to house (if approved)
5. Send notification email

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```bash
npm run test              # Run all unit tests
npm run test:coverage     # Generate coverage report
npm run test:watch        # Watch mode
```

**Test Categories:**
- Component rendering
- Hook behavior
- Utility functions
- API client methods

### Integration Tests
```bash
npm run test:integration  # API endpoint tests
```

**Coverage:**
- Authentication flows
- Database operations
- Real-time messaging
- File upload processes

### End-to-End Tests (Playwright)
```bash
npm run e2e              # Run E2E tests
npm run e2e:ui           # Interactive mode
npm run e2e:headed       # Headed browser
```

**User Journeys:**
- Member onboarding flow
- Post creation and interaction
- Direct messaging
- Gallery upload and browsing
- Admin operations

### Testing Commands
```bash
# Quality checks
npm run lint             # ESLint
npm run lint:fix         # Auto-fix issues
npm run type-check       # TypeScript validation

# Security
npm run security:audit   # Dependency vulnerabilities
npm run security:fix     # Auto-fix vulnerabilities
```

---

## 🚀 Deployment Guide

### Railway Deployment (Recommended)

#### 1. Prepare Repository
```bash
git add .
git commit -m "feat: prepare for Railway deployment"
git push origin main
```

#### 2. Railway Setup
1. Go to [railway.app](https://railway.app)
2. Connect GitHub account
3. Import `v0-appmain2` repository
4. Add PostgreSQL service
5. Configure environment variables

#### 3. Environment Configuration
**Required Variables:**
```env
DATABASE_URL              # Auto-generated by Railway
JWT_SECRET               # Generate secure 32+ char string
JWT_REFRESH_SECRET       # Generate secure 32+ char string
NEXT_PUBLIC_APP_URL      # https://your-app.railway.app
```

**Optional APIs:**
```env
SENDGRID_API_KEY         # Email notifications
ANTHROPIC_API_KEY        # AI content moderation
STRIPE_SECRET_KEY        # Payment processing
CLOUDINARY_URL           # Media storage & optimization
```

#### 4. Deploy
Railway automatically deploys on push to main branch.

### Alternative Deployments

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Docker
```bash
docker build -t haus-of-basquiat .
docker run -p 3000:3000 haus-of-basquiat
```

#### Render
Connect GitHub repo at [render.com](https://render.com)

---

## 🛠️ GitHub Spark Integration Instructions

### For GitHub Spark: How to Use This SDD

When extending or completing the Haus of Basquiat Portal:

#### 1. Maintain Design Consistency
- Use existing gradient patterns (`from-red-600 via-blue-600 to-yellow-600`)
- Follow shadcn/ui component patterns
- Preserve accessibility standards (WCAG 2.1 AA)
- Keep mobile-first responsive design

#### 2. Database Schema Alignment
- Reference `prisma/schema.prisma` for all data models
- Maintain foreign key relationships
- Use existing enums (UserRole, PostType, etc.)
- Follow naming conventions

#### 3. API Pattern Consistency
- Use `lib/api.ts` client for all HTTP requests
- Maintain JWT authentication headers
- Follow REST conventions for new endpoints
- Implement proper error handling

#### 4. Component Architecture
- Place reusable UI in `components/ui/`
- Feature-specific components in `components/[feature]/`
- Use TypeScript interfaces from `types/`
- Follow React best practices (hooks, state management)

#### 5. Testing Requirements
- Add unit tests for new components
- Include integration tests for API endpoints
- Update E2E tests for new user flows
- Maintain >80% test coverage

#### 6. Authentication & Security
- Respect role-based access controls
- Validate user permissions on both client and server
- Sanitize user inputs
- Follow security middleware patterns

#### 7. Real-time Features
- Use existing Socket.IO infrastructure
- Maintain event naming conventions
- Implement graceful offline handling
- Provide loading and error states

### Key Files to Reference
- `app/layout.tsx` - Global styles and metadata
- `components/ui/` - Base component library
- `lib/api.ts` - API client patterns
- `hooks/use-auth.tsx` - Authentication patterns
- `prisma/schema.prisma` - Database schema
- `tailwind.config.js` - Design tokens
- `types/` - TypeScript interfaces

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] TypeScript compilation successful
- [ ] Tests passing
- [ ] Security audit clean
- [ ] Performance optimization complete
- [ ] PWA features working
- [ ] Analytics integrated

---

## 📚 Additional Resources

### Documentation
- [API Reference](./API_REFERENCE.md)
- [Component Storybook](./COMPONENT_GUIDE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md)

### Community & Support
- [GitHub Issues](https://github.com/miketui/v0-appmain2/issues)
- [Community Guidelines](./COMMUNITY_GUIDELINES.md)
- [Contributing Guide](./CONTRIBUTING.md)

### Ballroom Community Resources
- [Ballroom Culture Overview](https://en.wikipedia.org/wiki/Ball_culture)
- [LGBTQ+ Safety Guidelines](./SAFETY_GUIDELINES.md)
- [House System Explanation](./HOUSE_SYSTEM.md)

---

## 🎯 Success Metrics

### User Engagement
- Daily active users
- Post creation rate
- Message volume
- Gallery uploads
- Event participation

### Community Health
- Member retention rate
- House participation
- Content moderation efficiency
- Safety incident reports

### Technical Performance
- Page load times (< 3s)
- API response times (< 500ms)
- Uptime (> 99.5%)
- Error rates (< 1%)

---

**Built with ❤️ for the ballroom and voguing community**

*This SDD ensures GitHub Spark can confidently extend and deploy the Haus of Basquiat Portal while maintaining the app's premium experience, community focus, and technical standards.*