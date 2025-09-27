# GitHub Spark Build Brief: Haus of Basquiat Portal

This document provides a natural-language brief that you can paste into GitHub Spark so it can finish building and deploying the Haus of Basquiat ballroom community platform. It summarizes the existing codebase, UX, data model, and expected behaviors per page/component so Spark can extend or complete the app accurately.

## 1. Brand & Experience Goals
- Build a premium, members-only social hub for the ballroom and voguing community with inclusive copy and celebratory tone.
- Visual language: rich jewel-toned gradients (purple/black/gold for authenticated areas, red/blue/yellow pastel gradients for public/auth flows), high-contrast typography, rounded cards, subtle glassmorphism, and glowing accent borders.
- Maintain accessibility: semantic headings, keyboard-focusable controls, readable contrast, descriptive labels.
- Support responsive layouts that adapt down to mobile while preserving immersive visuals.

## 2. Tech Stack Expectations
- **Frontend:** Next.js 14 App Router with React 18 and TypeScript, Tailwind CSS, shadcn/ui, Radix primitives, lucide-react icons.【F:app/layout.tsx†L1-L65】【F:components/ui/button.tsx†L1-L120】
- **State & Auth:** Supabase authentication wrapped by a custom hook/context (`useAuth`, `AuthProvider`) with JWT + magic-link options, plus Socket.IO hooks for real-time chat.【F:hooks/use-auth.tsx†L1-L86】【F:hooks/use-socket.ts†L1-L112】
- **Backend:** Express API (`backend/index.js`) securing Supabase access, Redis caching, Stripe-ready payments, media uploads, and admin routes. Spark should preserve route structure, middleware, and security patterns when extending APIs.【F:backend/index.js†L1-L160】
- **Database:** PostgreSQL schema (Prisma + Supabase) with houses, user profiles, applications, posts, chat threads, events, gallery assets, notifications, etc. Spark must keep enums/models aligned with `prisma/schema.prisma` when adding tables or relations.【F:prisma/schema.prisma†L1-L120】
- **PWA:** Service worker registration, offline screen, install prompts, and analytics are already wired via `PWAInitializer` and `lib/sw-register`. Maintain these when introducing new routes or assets.【F:components/pwa-initializer.tsx†L1-L10】【F:lib/sw-register.ts†L1-L120】【F:app/offline/page.tsx†L1-L44】

## 3. Global Shell & Navigation
- `app/layout.tsx` applies global fonts (Geist Sans/Mono), viewport meta, favicon set, and wraps pages with `Providers` + PWA initializer. Spark should keep this head setup and gradient theming consistent.【F:app/layout.tsx†L1-L76】
- Authenticated sections share gradient backgrounds, centered max-width containers, and card-based surfaces. Use shadcn/ui components for consistency.
- Implement a top-level navigation/drawer (if missing) that links Feed, Messages, Gallery, Profile, Settings, Admin (role-gated), and Sign Out.

## 4. Authentication & Onboarding Flows
- **Landing Page (`app/page.tsx`):** Magic-link email capture, branching into a 3-step application wizard (personal info, community details, socials) with progress indicator, form inputs, and success confirmation card.【F:app/page.tsx†L27-L207】
- **Sign In (`app/auth/signin/page.tsx`):** Password + magic link options, social proof copy, gradient hero card, error handling, and CTA links to sign-up/reset flows.【F:app/auth/signin/page.tsx†L1-L143】
- **Sign Up, Pending, Callback:** Mirror styling from sign-in; ensure Supabase callbacks drop the user into `/feed` once authenticated or show “pending approval” messaging until admin approval.
- Spark should ensure auth hook updates Supabase session tokens and respects role-based redirects (e.g., applicants hitting member-only pages see guidance).

## 5. Feed Experience
- **Route:** `app/feed/page.tsx` loads posts via Supabase with fallback demo data, toggles for feed scope (“all/house/following”), and toggles composer visibility.【F:app/feed/page.tsx†L1-L120】
- **Components:**
  - `PostComposer` for rich text, attachments, visibility picker, scheduling/drafts (stubbed – needs final wiring).
  - `FeedFilters` for pill filters and search.
  - `PostCard` for avatar, house badge, media grid, like/comment counts, visibility icons, and actions.【F:components/feed/post-card.tsx†L1-L120】
- Spark should finish wiring composer to Supabase/Express endpoints, handle optimistic likes, threaded comments drawer, and maybe infinite scroll.

## 6. Direct Messaging & Chat
- **Messages Page (`app/messages/page.tsx`):** Split layout with left conversation list (filters, unread badges, participant avatars/status) and main thread view powered by `MessageThread`. Needs real data hooking and empty states.【F:app/messages/page.tsx†L1-L160】【F:components/messaging/message-thread.tsx†L1-L112】
- **Real-time Chat (`app/chat/page.tsx`):** Full-height workspace with `ChatSidebar`, `ChatWindow`, `NewChatModal`; loads threads/messages from API client, handles message sends, thread creation, and uses gradients consistent with feed.【F:app/chat/page.tsx†L1-L160】
- Socket hook manages typing indicators, read receipts, status changes. Spark should ensure backend Socket.IO server matches these events and that optimistic UI updates remain in sync.【F:hooks/use-socket.ts†L1-L112】

## 7. Gallery & Media Library
- **Upload Route (`app/gallery/upload/page.tsx`):** Drag-and-drop multi-file uploader with previews, metadata extraction, category/tagging, privacy toggles, progress bars, validation for file types/size, and success toast. Spark should finish connecting uploads to storage (Supabase buckets/S3), persist metadata, and surface error states nicely.【F:app/gallery/upload/page.tsx†L1-L160】
- Create a gallery index route (not yet implemented) showing filterable masonry grid by category/tag, spotlight carousels, and detail modals. Include moderation controls for admins (approve/flag media).

## 8. Member Profile & Settings
- **Profile (`app/profile/page.tsx`):** Editable card with avatar fallback, role badge colors, house affiliation, bio, pronouns, and member-since metadata fetched from Supabase. Editing toggles inputs/buttons with gradient CTAs.【F:app/profile/page.tsx†L1-L160】 Spark should add avatar upload, social links, ballroom stats, and highlight badges/achievements.
- **Settings (`app/settings/page.tsx`):** Sections for account email/password, notification toggles, privacy level, theme, language, and sign-out button. Data is upserted into `user_settings`; implement toasts and disable states when saving.【F:app/settings/page.tsx†L1-L160】 Spark should extend with 2FA, connected services, session management, and billing preferences when Stripe is enabled.

## 9. Admin Dashboard
- **Route (`app/admin/page.tsx`):** Role-gated view showing `AdminStats`, `UserManagement`, `ApplicationReview`, `ContentModeration`, and `SystemSettings` inside tabbed interface. Mock stats exist; Spark must wire to backend metrics, implement moderation workflows, and build analytics tab charts.【F:app/admin/page.tsx†L1-L120】
- **User Management Component:** Filters by role/status, inline actions to promote/ban, displays activity counts and house badges. Spark should hook to `/users` API, add pagination/export, and include bulk actions with confirmation modals.【F:components/admin/user-management.tsx†L1-L160】
- **Application Review:** Provide queue for new member applications, decision notes, and house assignments synced to Supabase.
- **Content Moderation/System Settings:** Manage flagged posts/media, AI moderation toggles, role permissions, feature flags, and integration keys.

## 10. Offline & PWA Considerations
- Dedicated offline fallback screen with retry/home buttons (`app/offline/page.tsx`). Ensure routes gracefully detect offline via `monitorNetworkStatus` and queue actions (e.g., unsent posts/messages) for background sync once online.【F:app/offline/page.tsx†L1-L44】【F:lib/sw-register.ts†L1-L120】
- Maintain manifest icons (`public/icons`), service worker messaging, and analytics instrumentation.

## 11. API Client Contracts
- `lib/api.ts` centralizes REST calls for auth, posts, chat, admin, and document management. Spark must keep these endpoints in sync with Express backend and add new methods here when expanding features.【F:lib/api.ts†L1-L120】
- Ensure token handling via `authService` is respected; update API client when sessions refresh.【F:lib/auth.ts†L1-L120】

## 12. Database & Data Integrity
- Follow Prisma models for houses, user profiles, applications, posts, comments, gallery items, chat threads/messages, events, documents, notifications, and subscriptions. When introducing new relations (e.g., trophies, leaderboards), update both Prisma and Supabase migrations consistently.【F:prisma/schema.prisma†L1-L120】
- Enforce role-based access (APPLICANT/MEMBER/LEADER/ADMIN) and statuses across UI and backend, aligning with enums.

## 13. Testing & Tooling Expectations
- Vitest/Playwright suites exist under `tests/`; expand coverage for new components, add integration tests for chat/galleries, and run `npm run lint`, `type-check`, `test`, and `e2e` before deployment.【F:README.md†L61-L93】
- Keep ESLint/Tailwind formatting, avoid try/catch around imports, and respect shadcn/ui patterns.

## 14. Deployment & DevOps Notes
- Primary deployment: Railway with Postgres, plus Docker, Render, Fly.io configs. When Spark automates deployments, ensure environment variables from README remain accurate and that Supabase URL/keys are injected securely.【F:README.md†L15-L57】【F:README.md†L95-L119】
- Include health checks for Express server (`/health`), background workers, and websockets when scaling.

## 15. Stretch Enhancements for Spark
- Event calendar with RSVP, ICS downloads, and map embeds.
- House pages with rosters, leader tools, and highlight reels.
- AI-assisted moderation and caption generation using Anthropic/OpenAI keys (optional but scaffolding is present in backend env vars).【F:backend/index.js†L1-L40】
- Monetization via Stripe (premium subscriptions, donations, merch storefront). Ensure PCI compliance in UI flows.

Provide this brief to GitHub Spark so it can confidently finish wiring the experience, polish UI, and prepare deployment scripts without losing the app’s existing architecture or aesthetic.
