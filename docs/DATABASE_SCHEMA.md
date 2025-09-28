# 🗄️ Database Schema - Haus of Basquiat Portal

**PostgreSQL Schema Documentation for GitHub Spark**

---

## 📊 Schema Overview

The Haus of Basquiat Portal uses PostgreSQL with Prisma ORM for type-safe database operations. The schema is designed to support a rich ballroom community platform with role-based access, houses, social features, and real-time messaging.

### Core Entities
- **Users & Profiles** - Authentication and user data
- **Houses** - Community organizations with hierarchies
- **Posts & Comments** - Social feed content
- **Gallery** - Media library with categorization
- **Messages & Threads** - Real-time chat system
- **Events** - Community events and RSVPs
- **Applications** - Membership application workflow

---

## 🔐 Authentication & Users

### User Model
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   DateTime?
  hashedPassword  String?   // Optional for magic-link only users
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLoginAt     DateTime?
  
  // Relations
  profile         Profile?
  sessions        Session[]
  refreshTokens   RefreshToken[]
  
  @@map("users")
}
```

### Profile Model
```prisma
model Profile {
  id            String    @id @default(cuid())
  userId        String    @unique
  
  // Basic Info
  displayName   String
  pronouns      String?
  bio           String?
  avatar        String?   // URL to profile image
  coverImage    String?   // URL to cover image
  
  // Ballroom Info
  ballroomName  String?   // Stage/performance name
  role          UserRole  @default(APPLICANT)
  status        UserStatus @default(PENDING)
  houseId       String?
  
  // Social Links
  socialLinks   Json?     // { instagram: "", twitter: "", tiktok: "" }
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  house         House?    @relation(fields: [houseId], references: [id])
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  galleryItems  GalleryItem[]
  applications  Application[]
  
  // Messaging
  sentMessages     Message[] @relation("MessageSender")
  threadMembers    ThreadMember[]
  
  // Events
  eventRSVPs       EventRSVP[]
  organizedEvents  Event[]
  
  @@map("profiles")
}

enum UserRole {
  APPLICANT   // Pending approval
  MEMBER      // Basic member
  LEADER      // House leader
  ADMIN       // Platform admin
}

enum UserStatus {
  PENDING     // Application pending
  ACTIVE      // Active member
  SUSPENDED   // Temporarily suspended
  BANNED      // Permanently banned
}
```

### Session Management
```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("refresh_tokens")
}
```

---

## 🏠 Houses & Community

### House Model
```prisma
model House {
  id            String   @id @default(cuid())
  name          String   @unique
  description   String?
  
  // Visual Identity
  color         String   @default("#8b5cf6") // Hex color
  logo          String?  // URL to logo image
  coverImage    String?  // URL to cover image
  
  // Metadata
  founded       DateTime
  memberCount   Int      @default(0)
  location      String?
  website       String?
  
  // Settings
  isActive      Boolean  @default(true)
  isPublic      Boolean  @default(true)  // Public houses visible to all
  
  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  members       Profile[]
  posts         Post[]
  events        Event[]
  galleryItems  GalleryItem[]
  threads       Thread[] @relation("HouseThreads")
  
  @@map("houses")
}
```

### House Roles & Hierarchy
```prisma
model HouseMember {
  id        String      @id @default(cuid())
  profileId String
  houseId   String
  role      HouseRole   @default(MEMBER)
  title     String?     // Custom title like "First Child", "Mother Supreme"
  joinedAt  DateTime    @default(now())
  
  profile   Profile     @relation(fields: [profileId], references: [id], onDelete: Cascade)
  house     House       @relation(fields: [houseId], references: [id], onDelete: Cascade)
  
  @@unique([profileId, houseId])
  @@map("house_members")
}

enum HouseRole {
  MEMBER      // Regular house member
  CHILD       // House child
  LEADER      // House leader
  MOTHER      // House mother/father
  FOUNDER     // House founder
}
```

---

## 📝 Social Feed System

### Post Model
```prisma
model Post {
  id          String      @id @default(cuid())
  authorId    String
  houseId     String?     // Optional house association
  
  // Content
  content     String
  mediaItems  MediaItem[] // Embedded media
  tags        String[]    // Array of tag strings
  
  // Metadata
  type        PostType    @default(TEXT)
  visibility  Visibility  @default(PUBLIC)
  isPinned    Boolean     @default(false)
  isEdited    Boolean     @default(false)
  
  // Scheduling
  publishedAt DateTime?   // Null for drafts
  scheduledAt DateTime?   // Future publishing
  
  // Statistics
  likesCount    Int       @default(0)
  commentsCount Int       @default(0)
  sharesCount   Int       @default(0)
  
  // Timestamps
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  author      Profile     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  house       House?      @relation(fields: [houseId], references: [id])
  comments    Comment[]
  likes       Like[]
  media       PostMedia[]
  
  @@map("posts")
}

enum PostType {
  TEXT        // Text-only post
  MEDIA       // Post with media
  EVENT       // Event announcement
  POLL        // Poll post
  ARTICLE     // Long-form article
}

enum Visibility {
  PUBLIC      // Visible to everyone
  HOUSE       // Visible to house members only
  FOLLOWERS   // Visible to followers only
  PRIVATE     // Visible to author only (draft)
}
```

### Comments & Interactions
```prisma
model Comment {
  id        String   @id @default(cuid())
  postId    String
  authorId  String
  parentId  String?  // For threaded replies
  
  content   String
  isEdited  Boolean  @default(false)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    Profile  @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  likes     Like[]
  
  @@map("comments")
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  postId    String?  // Like on post
  commentId String?  // Like on comment
  galleryId String?  // Like on gallery item
  
  createdAt DateTime @default(now())
  
  // Relations (one of these will be set)
  user      Profile     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post?       @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment   Comment?    @relation(fields: [commentId], references: [id], onDelete: Cascade)
  gallery   GalleryItem? @relation(fields: [galleryId], references: [id], onDelete: Cascade)
  
  @@unique([userId, postId])
  @@unique([userId, commentId])
  @@unique([userId, galleryId])
  @@map("likes")
}
```

---

## 🖼️ Gallery & Media

### Gallery Model
```prisma
model GalleryItem {
  id          String        @id @default(cuid())
  authorId    String
  houseId     String?
  
  // Content
  title       String
  description String?
  category    MediaCategory
  tags        String[]
  
  // Media Info
  type        MediaType
  url         String        // Primary media URL
  thumbnail   String?       // Thumbnail URL
  
  // File metadata
  filename    String
  mimeType    String
  fileSize    Int           // Size in bytes
  dimensions  Json?         // { width: number, height: number }
  duration    Int?          // For videos, in seconds
  
  // Settings
  visibility  Visibility    @default(PUBLIC)
  isProcessed Boolean       @default(false) // For async processing
  isFeatured  Boolean       @default(false)
  
  // Statistics
  likesCount  Int           @default(0)
  viewsCount  Int           @default(0)
  
  // Timestamps
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // Relations
  author      Profile       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  house       House?        @relation(fields: [houseId], references: [id])
  likes       Like[]
  
  @@map("gallery_items")
}

enum MediaCategory {
  PERFORMANCE   // Performances, battles, walking
  FASHION       // Outfits, looks, styling
  RUNWAY        // Runway presentations
  LIFESTYLE     // Behind the scenes, daily life
  EVENT         // Event photos/videos
  PORTRAITS     // Professional photos
  OTHER         // Miscellaneous
}

enum MediaType {
  IMAGE
  VIDEO
  AUDIO
  DOCUMENT
}
```

---

## 💬 Messaging System

### Thread Model
```prisma
model Thread {
  id          String         @id @default(cuid())
  
  // Thread Info
  type        ThreadType
  name        String?        // Group thread name
  description String?        // Group thread description
  avatar      String?        // Group thread avatar
  
  // Settings
  isArchived  Boolean        @default(false)
  isMuted     Boolean        @default(false)
  
  // House association (for house threads)
  houseId     String?
  
  // Timestamps
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  lastMessageAt DateTime?
  
  // Relations
  house       House?         @relation("HouseThreads", fields: [houseId], references: [id])
  members     ThreadMember[]
  messages    Message[]
  
  @@map("threads")
}

enum ThreadType {
  DIRECT      // 1-on-1 conversation
  GROUP       // Private group chat
  HOUSE       // House-wide chat
  ANNOUNCE    // Announcement channel
}

model ThreadMember {
  id         String    @id @default(cuid())
  threadId   String
  profileId  String
  
  // Member settings
  role       ThreadRole @default(MEMBER)
  nickname   String?    // Custom nickname in this thread
  joinedAt   DateTime   @default(now())
  leftAt     DateTime?  // When they left (null if active)
  
  // Read status
  lastReadAt DateTime?
  lastReadMessageId String?
  
  // Relations
  thread     Thread    @relation(fields: [threadId], references: [id], onDelete: Cascade)
  profile    Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  @@unique([threadId, profileId])
  @@map("thread_members")
}

enum ThreadRole {
  MEMBER      // Regular member
  MODERATOR   // Can moderate messages
  ADMIN       // Can add/remove members, change settings
}
```

### Message Model
```prisma
model Message {
  id          String      @id @default(cuid())
  threadId    String
  senderId    String
  
  // Content
  content     String?     // Text content (null for media-only)
  mediaUrl    String?     // Attached media
  mediaType   MediaType?  // Type of attached media
  
  // Message metadata
  type        MessageType @default(TEXT)
  isEdited    Boolean     @default(false)
  isDeleted   Boolean     @default(false)
  
  // Reply info
  replyToId   String?     // Message this is replying to
  
  // Timestamps
  sentAt      DateTime    @default(now())
  editedAt    DateTime?
  deletedAt   DateTime?
  
  // Relations
  thread      Thread      @relation(fields: [threadId], references: [id], onDelete: Cascade)
  sender      Profile     @relation("MessageSender", fields: [senderId], references: [id], onDelete: Cascade)
  replyTo     Message?    @relation("MessageReplies", fields: [replyToId], references: [id])
  replies     Message[]   @relation("MessageReplies")
  reactions   MessageReaction[]
  
  @@map("messages")
}

enum MessageType {
  TEXT        // Regular text message
  MEDIA       // Image/video/audio
  SYSTEM      // System-generated message
  DELETED     // Deleted message placeholder
}

model MessageReaction {
  id        String   @id @default(cuid())
  messageId String
  userId    String
  emoji     String   // Unicode emoji
  createdAt DateTime @default(now())
  
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user      Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([messageId, userId, emoji])
  @@map("message_reactions")
}
```

---

## 📅 Events System

### Event Model
```prisma
model Event {
  id            String      @id @default(cuid())
  organizerId   String
  houseId       String?
  
  // Event Info
  title         String
  description   String?
  type          EventType
  category      EventCategory
  
  // Schedule
  startDate     DateTime
  endDate       DateTime?
  timezone      String      @default("UTC")
  isAllDay      Boolean     @default(false)
  recurrence    Json?       // Recurrence rules
  
  // Location
  location      Json?       // { name, address, coordinates, virtual }
  isVirtual     Boolean     @default(false)
  virtualUrl    String?     // Stream/meeting URL
  
  // Settings
  visibility    Visibility  @default(PUBLIC)
  maxAttendees  Int?        // Capacity limit
  requiresRSVP  Boolean     @default(true)
  ticketPrice   Decimal?    // Ticket price (null for free)
  
  // Media
  coverImage    String?
  images        String[]    // Additional images
  
  // Statistics
  rsvpCount     Int         @default(0)
  attendeeCount Int         @default(0)
  
  // Status
  status        EventStatus @default(DRAFT)
  isCancelled   Boolean     @default(false)
  isFeatured    Boolean     @default(false)
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  publishedAt   DateTime?
  
  // Relations
  organizer     Profile     @relation(fields: [organizerId], references: [id])
  house         House?      @relation(fields: [houseId], references: [id])
  rsvps         EventRSVP[]
  
  @@map("events")
}

enum EventType {
  BALL          // Ballroom competition
  WORKSHOP      // Educational workshop
  PRACTICE      // Practice session
  SOCIAL        // Social gathering
  PERFORMANCE   // Performance showcase
  FUNDRAISER    // Fundraising event
  OTHER         // Other events
}

enum EventCategory {
  VOGUE         // Vogue categories
  RUNWAY        // Runway categories
  REALNESS      // Realness categories
  FACE          // Face categories
  BODY          // Body categories
  BIZARRE       // Bizarre categories
  PERFORMANCE   // Performance categories
  EDUCATIONAL   // Workshops, classes
  SOCIAL        // Social events
}

enum EventStatus {
  DRAFT         // Not yet published
  PUBLISHED     // Published and accepting RSVPs
  SOLD_OUT      // At capacity
  CANCELLED     // Cancelled
  COMPLETED     // Past event
}

model EventRSVP {
  id          String      @id @default(cuid())
  eventId     String
  profileId   String
  
  // RSVP Details
  status      RSVPStatus  @default(MAYBE)
  notes       String?     // User notes
  guestCount  Int         @default(1) // Including self
  
  // Payment (if ticketed)
  ticketsPurchased Int    @default(0)
  paymentStatus   PaymentStatus?
  paymentId       String? // Stripe payment ID
  
  // Timestamps
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  event       Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)
  profile     Profile     @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, profileId])
  @@map("event_rsvps")
}

enum RSVPStatus {
  YES         // Attending
  NO          // Not attending
  MAYBE       // Maybe attending
}

enum PaymentStatus {
  PENDING     // Payment initiated
  COMPLETED   // Payment successful
  FAILED      // Payment failed
  REFUNDED    // Payment refunded
}
```

---

## 📋 Application System

### Application Model
```prisma
model Application {
  id                String            @id @default(cuid())
  applicantId       String
  reviewerId        String?
  
  // Application Data
  applicationData   Json              // Form responses
  
  // Process
  status           ApplicationStatus  @default(PENDING)
  reviewNotes      String?           // Admin review notes
  rejectionReason  String?           // If rejected
  
  // House assignment
  requestedHouseId String?           // House they want to join
  assignedHouseId  String?           // House they were assigned to
  
  // Timestamps
  submittedAt      DateTime          @default(now())
  reviewedAt       DateTime?
  
  // Relations
  applicant        Profile           @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  reviewer         Profile?          @relation("ApplicationReviewer", fields: [reviewerId], references: [id])
  requestedHouse   House?            @relation("RequestedHouse", fields: [requestedHouseId], references: [id])
  assignedHouse    House?            @relation("AssignedHouse", fields: [assignedHouseId], references: [id])
  
  @@map("applications")
}

enum ApplicationStatus {
  PENDING         // Awaiting review
  UNDER_REVIEW    // Being reviewed
  APPROVED        // Approved for membership
  REJECTED        // Rejected
  WITHDRAWN       // Applicant withdrew
}
```

---

## 🔔 Notifications System

### Notification Model
```prisma
model Notification {
  id          String           @id @default(cuid())
  recipientId String
  
  // Content
  type        NotificationType
  title       String
  message     String
  actionUrl   String?          // URL to navigate to
  
  // Metadata
  data        Json?            // Additional data for the notification
  priority    NotificationPriority @default(NORMAL)
  
  // Status
  isRead      Boolean          @default(false)
  readAt      DateTime?
  
  // Timestamps
  createdAt   DateTime         @default(now())
  expiresAt   DateTime?        // Auto-delete after this date
  
  // Relations
  recipient   Profile          @relation(fields: [recipientId], references: [id], onDelete: Cascade)
  
  @@map("notifications")
}

enum NotificationType {
  // Social
  POST_LIKE           // Someone liked your post
  POST_COMMENT        // Someone commented on your post
  COMMENT_REPLY       // Someone replied to your comment
  POST_MENTION        // You were mentioned in a post
  FOLLOW_REQUEST      // Someone wants to follow you
  
  // Messages
  NEW_MESSAGE         // New message received
  MESSAGE_REACTION    // Someone reacted to your message
  
  // House
  HOUSE_INVITATION    // Invited to join a house
  HOUSE_PROMOTION     // Promoted within house
  HOUSE_EVENT         // House event announcement
  
  // Events
  EVENT_INVITATION    // Invited to an event
  EVENT_REMINDER      // Event reminder
  EVENT_UPDATE        // Event details changed
  EVENT_CANCELLED     // Event cancelled
  
  // Admin
  APPLICATION_STATUS  // Application status changed
  ACCOUNT_WARNING     // Account warning
  CONTENT_MODERATED   // Your content was moderated
  
  // System
  WELCOME             // Welcome message
  SYSTEM_UPDATE       // System maintenance/updates
}

enum NotificationPriority {
  LOW         // Low priority, can be batched
  NORMAL      // Normal priority
  HIGH        // High priority, immediate delivery
  URGENT      // Urgent, push notification required
}
```

---

## ⚙️ System & Configuration

### Settings Model
```prisma
model UserSettings {
  id     String @id @default(cuid())
  userId String @unique
  
  // Notification Preferences
  notifications Json @default("{\"email\": true, \"push\": true, \"sms\": false}")
  
  // Privacy Settings
  privacy Json @default("{\"profile\": \"public\", \"posts\": \"public\", \"messages\": \"friends\"}")
  
  // Display Preferences
  theme          String  @default("system") // light, dark, system
  language       String  @default("en")
  timezone       String  @default("UTC")
  
  // Content Preferences
  contentFilters Json?   // Content filtering preferences
  blockedUsers   String[] // Array of blocked user IDs
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user Profile @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_settings")
}

model SystemSetting {
  id    String @id @default(cuid())
  key   String @unique
  value Json
  
  description String?
  category    String?
  isPublic    Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("system_settings")
}
```

---

## 📊 Analytics & Reporting

### Analytics Model
```prisma
model AnalyticsEvent {
  id         String   @id @default(cuid())
  
  // Event Info
  eventName  String   // e.g., "post_created", "user_login"
  userId     String?  // User who performed the action
  sessionId  String?  // Session identifier
  
  // Context
  properties Json?    // Event-specific properties
  userAgent  String?
  ipAddress  String?
  referrer   String?
  
  // Timestamps
  timestamp  DateTime @default(now())
  
  @@map("analytics_events")
}

model ContentReport {
  id         String      @id @default(cuid())
  reporterId String
  
  // Content being reported
  contentType String     // "post", "comment", "message", "profile"
  contentId   String     // ID of the content
  
  // Report details
  reason      String     // Reason for reporting
  description String?    // Additional details
  status      ReportStatus @default(PENDING)
  
  // Resolution
  reviewerId  String?    // Admin who reviewed
  resolution  String?    // What action was taken
  
  // Timestamps
  createdAt   DateTime   @default(now())
  reviewedAt  DateTime?
  
  // Relations
  reporter    Profile    @relation("ContentReporter", fields: [reporterId], references: [id])
  reviewer    Profile?   @relation("ContentReviewer", fields: [reviewerId], references: [id])
  
  @@map("content_reports")
}

enum ReportStatus {
  PENDING     // Awaiting review
  REVIEWING   // Under review
  RESOLVED    // Resolved (action taken)
  DISMISSED   // Dismissed (no action needed)
}
```

---

## 🔍 Database Indexes

### Performance Indexes
```sql
-- User lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_house_id ON profiles(house_id);

-- Post feed indexes
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_house_created ON posts(house_id, created_at DESC);
CREATE INDEX idx_posts_visibility_created ON posts(visibility, created_at DESC);
CREATE INDEX idx_posts_published_created ON posts(published_at DESC) WHERE published_at IS NOT NULL;

-- Comment indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- Message indexes
CREATE INDEX idx_messages_thread_sent ON messages(thread_id, sent_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- Thread member indexes
CREATE INDEX idx_thread_members_profile ON thread_members(profile_id);
CREATE INDEX idx_thread_members_thread ON thread_members(thread_id);

-- Event indexes
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_house_id ON events(house_id);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);

-- Gallery indexes
CREATE INDEX idx_gallery_author_created ON gallery_items(author_id, created_at DESC);
CREATE INDEX idx_gallery_category ON gallery_items(category);
CREATE INDEX idx_gallery_house_id ON gallery_items(house_id);

-- Notification indexes
CREATE INDEX idx_notifications_recipient_created ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;

-- Analytics indexes
CREATE INDEX idx_analytics_event_timestamp ON analytics_events(event_name, timestamp);
CREATE INDEX idx_analytics_user_timestamp ON analytics_events(user_id, timestamp);
```

---

## 🔄 Database Migrations

### Migration Strategy
1. **Schema Changes**: Use Prisma migrate for schema evolution
2. **Data Migrations**: Custom scripts for data transformations
3. **Rollback Plan**: Always have rollback scripts ready
4. **Testing**: Test migrations on staging data first

### Sample Migration
```sql
-- Migration: Add house colors and branding
-- Up migration
ALTER TABLE houses ADD COLUMN color VARCHAR(7) DEFAULT '#8b5cf6';
ALTER TABLE houses ADD COLUMN logo TEXT;
ALTER TABLE houses ADD COLUMN cover_image TEXT;

-- Update existing houses with default colors
UPDATE houses SET color = '#8b5cf6' WHERE name LIKE '%Eleganza%';
UPDATE houses SET color = '#dc2626' WHERE name LIKE '%Avant-Garde%';
UPDATE houses SET color = '#059669' WHERE name LIKE '%Butch%';

-- Down migration (rollback)
ALTER TABLE houses DROP COLUMN color;
ALTER TABLE houses DROP COLUMN logo;
ALTER TABLE houses DROP COLUMN cover_image;
```

---

## 🛡️ Security Considerations

### Data Protection
- **PII Encryption**: Sensitive data encrypted at rest
- **Access Control**: Row-level security for multi-tenant data
- **Audit Logging**: Track all data modifications
- **Data Retention**: Automatic cleanup of old data

### Database Security
```sql
-- Row Level Security Example
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see posts they have access to
CREATE POLICY posts_select_policy ON posts 
  FOR SELECT 
  USING (
    visibility = 'PUBLIC' OR 
    (visibility = 'HOUSE' AND house_id IN (
      SELECT house_id FROM profiles WHERE user_id = current_user_id()
    )) OR
    author_id = current_user_profile_id()
  );

-- Policy: Users can only update their own posts
CREATE POLICY posts_update_policy ON posts 
  FOR UPDATE 
  USING (author_id = current_user_profile_id());
```

---

## 📈 Scaling Considerations

### Read Replicas
- Use read replicas for heavy read operations
- Route analytics queries to separate replica
- Implement connection pooling

### Partitioning Strategy
```sql
-- Partition large tables by date
CREATE TABLE messages_2024 PARTITION OF messages
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE analytics_events_2024 PARTITION OF analytics_events
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Caching Strategy
- **Redis Cache**: Frequently accessed data
- **Query Cache**: Expensive query results
- **Session Cache**: User session data

---

## 🧪 Test Data & Seeding

### Seed Script Structure
```typescript
// prisma/seed.ts
async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hausofbasquiat.com',
      profile: {
        create: {
          displayName: 'Admin Supreme',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      }
    }
  })

  // Create houses
  const houses = await createHouses()
  
  // Create sample users and profiles
  const users = await createSampleUsers(houses)
  
  // Create sample posts
  await createSamplePosts(users)
  
  // Create sample events
  await createSampleEvents(houses)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

*This database schema provides a robust foundation for the Haus of Basquiat Portal, supporting all community features while maintaining performance, security, and scalability.*