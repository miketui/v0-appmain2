# 🎯 GitHub Spark Development Prompts

**Interactive prompts and templates to guide GitHub Spark in building the Haus of Basquiat Portal correctly**

---

## 🚀 Quick Start Prompts

### 1. Initial Setup Prompt
```
I need to create a premium ballroom community social platform called "Haus of Basquiat Portal". 

Key requirements:
- Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- PostgreSQL database with Prisma ORM
- Supabase for auth and storage
- Socket.IO for real-time messaging
- Role-based access (APPLICANT/MEMBER/LEADER/ADMIN)
- House-based community structure
- Social feed with posts, comments, likes
- Real-time direct messaging
- Media gallery with categories
- PWA support with offline functionality

The app should have elegant gradients (purple/gold/red/blue), be fully responsive, and follow WCAG accessibility standards. 

Please create the initial project structure with all necessary configuration files, and implement the landing page with magic-link authentication.
```

### 2. Authentication System Prompt
```
Build a comprehensive authentication system for the ballroom community platform:

Features needed:
- Magic link authentication (passwordless)
- JWT token management with refresh tokens
- Role-based access control (4 roles: APPLICANT, MEMBER, LEADER, ADMIN)
- Multi-step application process for new members
- Profile management with ballroom-specific fields
- Social links and house affiliation

UI Requirements:
- Elegant gradient design (red/blue/yellow for public, purple/gold for authenticated)
- 3-step application wizard with progress indicator
- Mobile-first responsive design
- Accessibility compliant

Database schema should include Users, Profiles, Sessions, RefreshTokens, and Applications tables with proper relationships.
```

### 3. Social Feed System Prompt
```
Create a rich social media feed system for the ballroom community:

Core Features:
- Post creation with rich text, media uploads, visibility settings
- Comments system with threading
- Like/reaction system
- Feed filtering (All, House, Following)
- Real-time updates via Socket.IO
- Post scheduling and drafts

Content Types:
- Text posts with rich formatting
- Image/video galleries (performance, fashion, runway categories)
- Event announcements
- House updates and achievements

UI Components needed:
- PostComposer with drag-and-drop media upload
- PostCard with elegant house badges and gradient elements
- FeedFilters with pill-style navigation
- InfiniteScroll for performance

Database tables: Posts, Comments, Likes, MediaItems with proper indexing for performance.
```

### 4. Real-time Messaging Prompt
```
Build a comprehensive real-time messaging system:

Features:
- Direct messages between users
- Group chats and house-wide channels
- Real-time delivery with Socket.IO
- Typing indicators and read receipts
- File/media sharing in messages
- Message reactions with emojis
- Thread-based conversations

UI Components:
- Chat sidebar with conversation list
- Message thread view with bubbles
- Message composer with file upload
- User status indicators
- Mobile-optimized interface

Technical requirements:
- WebSocket connection management
- Message queuing for offline users
- Efficient message pagination
- Push notifications integration

Database: Threads, Messages, ThreadMembers, MessageReactions with optimized queries.
```

### 5. Media Gallery Prompt
```
Create a sophisticated media gallery system for ballroom performances:

Categories:
- Performance (voguing, battles, walking)
- Fashion (outfits, looks, styling)
- Runway (presentations, poses)
- Events (competitions, workshops)

Features:
- Drag-and-drop multi-file upload
- Image/video optimization and thumbnails
- Tagging and categorization system
- Advanced filtering and search
- Lightbox viewer with social actions
- Privacy controls (public/house/private)

UI Design:
- Masonry grid layout
- Category filter pills
- Upload progress indicators
- Media metadata display
- Mobile-optimized touch gestures

Integration with Supabase Storage or Cloudinary for CDN delivery.
```

---

## 🏗️ Feature-Specific Prompts

### House Management System
```
Build a house management system for ballroom houses:

House Structure:
- House profiles with branding (colors, logos)
- Member hierarchies (Mother/Father, Leaders, Children, Members)
- House-specific channels and content
- Event organization and management
- Member recruitment and applications

Features needed:
- House dashboard for leaders
- Member roster with role management
- House-specific feed and announcements
- Event calendar and RSVP system
- House statistics and achievements

UI should reflect house colors and branding throughout the interface.
```

### Event Management System
```
Create a comprehensive event management system:

Event Types:
- Balls (ballroom competitions)
- Workshops and classes
- Practice sessions
- Social gatherings
- Performance showcases

Features:
- Event creation with rich details
- RSVP system with capacity limits
- Ticketing integration (Stripe)
- Location mapping
- Live streaming integration
- Category-based competition tracking

Calendar integration with ICS export and Google Calendar sync.
```

### Admin Dashboard
```
Build a powerful admin dashboard for community management:

Statistics & Analytics:
- User growth and engagement metrics
- Content creation and interaction stats
- House membership and activity
- Event attendance and revenue

Management Tools:
- User management (roles, status, moderation)
- Content moderation queue
- Application review system
- System settings and configuration
- Bulk operations and exports

Dashboard should have charts, graphs, and real-time data visualization.
```

---

## 🎨 Design System Prompts

### Component Library Setup
```
Create a comprehensive design system and component library:

Base Components (shadcn/ui):
- Buttons with gradient variants
- Cards with glassmorphism effects
- Forms with floating labels
- Navigation with active states
- Modals and dialogs

Custom Components:
- User avatars with house badges
- Post cards with media grids
- Message bubbles with reactions
- Gallery items with metadata
- Progress indicators and loading states

Color System:
- Primary gradients: purple/gray/gold for authenticated areas
- Accent gradients: red/blue/yellow for public areas
- House-specific color schemes
- Semantic colors (success, warning, error, info)

Typography scale from 12px labels to 48px hero titles.
```

### Mobile & PWA Optimization
```
Optimize the app for mobile devices and PWA functionality:

PWA Features:
- Service worker for offline caching
- App installation prompts
- Push notifications
- Background sync for messages
- Offline page with retry functionality

Mobile Optimizations:
- Touch-friendly interface (44px minimum touch targets)
- Swipe gestures for gallery navigation
- Pull-to-refresh on feeds
- Bottom navigation for primary actions
- Responsive typography and spacing

Performance optimizations with image lazy loading and code splitting.
```

---

## 🔧 Technical Integration Prompts

### Database Integration
```
Set up PostgreSQL database with Prisma ORM:

Required Models:
- Users, Profiles, Sessions (authentication)
- Houses, HouseMembers (community structure)  
- Posts, Comments, Likes (social features)
- Threads, Messages, ThreadMembers (messaging)
- Events, EventRSVPs (event management)
- GalleryItems, MediaItems (media library)
- Applications, Notifications (workflows)

Include proper relationships, indexes, and constraints.
Set up migrations and seed scripts with sample ballroom community data.
```

### API Development
```
Create a comprehensive REST API with tRPC or Next.js API routes:

Authentication endpoints:
- POST /api/auth/signin (magic link)
- POST /api/auth/signup (user registration)
- POST /api/auth/refresh (token refresh)

Social endpoints:
- GET/POST /api/posts (feed management)
- GET/POST /api/posts/[id]/comments
- POST /api/posts/[id]/like

Messaging endpoints:
- GET/POST /api/chat/threads
- GET/POST /api/chat/threads/[id]/messages

Include proper error handling, validation, rate limiting, and API documentation.
```

### Real-time Features
```
Implement WebSocket functionality with Socket.IO:

Real-time Events:
- Live chat messages
- Post likes and comments
- User online status
- Typing indicators
- Notification delivery

Connection Management:
- Authentication via JWT
- Room-based subscriptions
- Graceful disconnection handling
- Reconnection logic
- Message queuing for offline users

Integrate with React components using custom hooks for WebSocket state management.
```

---

## 🧪 Testing & Quality Prompts

### Testing Setup
```
Create comprehensive testing infrastructure:

Unit Tests (Vitest):
- Component rendering tests
- Hook behavior tests
- Utility function tests
- API endpoint tests

Integration Tests:
- Authentication flows
- Database operations
- Real-time messaging
- File upload processes

E2E Tests (Playwright):
- User onboarding journey
- Post creation and interaction
- Direct messaging flows
- Gallery upload and browsing
- Admin operations

Include test utilities, mocks, and fixtures for ballroom community data.
```

### Performance & Security
```
Implement performance optimizations and security measures:

Performance:
- Image optimization and lazy loading
- Code splitting and route-based loading
- Database query optimization
- CDN integration for static assets
- Bundle analysis and optimization

Security:
- Input validation and sanitization
- SQL injection prevention
- CSRF protection
- Rate limiting
- Content Security Policy
- XSS protection

Include security audit tools and performance monitoring.
```

---

## 🚀 Deployment Prompts

### Railway Deployment
```
Set up deployment to Railway with PostgreSQL:

Infrastructure:
- Railway service configuration
- PostgreSQL database setup
- Environment variable management
- Domain and SSL configuration

CI/CD Pipeline:
- GitHub Actions workflow
- Automated testing before deployment
- Database migration handling
- Build optimization
- Health checks and monitoring

Include deployment scripts and rollback procedures.
```

### Multi-platform Deployment
```
Configure deployment options for multiple platforms:

Primary: Railway (recommended)
- PostgreSQL database
- Automatic deployments
- Environment management

Alternatives:
- Vercel (frontend + serverless functions)
- Docker (containerized deployment)
- Render (full-stack deployment)
- Fly.io (global deployment)

Include platform-specific configuration files and deployment guides.
```

---

## 🎭 Ballroom Community Specific Prompts

### Community Guidelines Integration
```
Implement community-specific features for ballroom culture:

Cultural Elements:
- House system with proper hierarchies
- Ballroom terminology and categories
- Performance categories (Vogue, Runway, Realness, etc.)
- Community safety and inclusion features

Content Moderation:
- AI-powered content screening
- Community reporting system
- Harassment prevention tools
- Inclusive language promotion

Educational Resources:
- Ballroom history and culture guides
- Newcomer onboarding resources
- House etiquette and traditions
- Safety guidelines and support resources
```

### Accessibility & Inclusion
```
Ensure the platform is fully accessible and inclusive:

WCAG 2.1 AA Compliance:
- Screen reader compatibility
- Keyboard navigation support
- Color contrast requirements
- Focus management
- Alternative text for images

Inclusive Design:
- Pronouns display and respect
- Multiple language support
- Various identity expressions
- Cultural sensitivity
- Accessibility preferences

Include accessibility testing tools and compliance checking.
```

---

## 📚 Documentation Prompts

### API Documentation
```
Generate comprehensive API documentation:

Include:
- Endpoint descriptions and examples
- Request/response schemas
- Authentication requirements
- Rate limiting information
- Error code explanations
- WebSocket event documentation

Format as OpenAPI/Swagger specification with interactive documentation.
```

### User Documentation
```
Create user-facing documentation:

Guides needed:
- Getting started guide
- How to join a house
- Creating and sharing content
- Using the messaging system
- Event participation
- Privacy and safety settings

Include screenshots, video tutorials, and FAQ sections.
```

---

*These prompts are designed to guide GitHub Spark in building a comprehensive, culturally-appropriate, and technically robust ballroom community platform. Each prompt provides specific requirements, technical details, and design guidance to ensure consistent implementation.*