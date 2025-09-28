# 🔌 API Reference - Haus of Basquiat Portal

**Version:** 1.0.0  
**Base URL:** `https://your-app.railway.app/api`  
**Authentication:** Bearer JWT Token

---

## 🔐 Authentication

### POST /api/auth/signin
Sign in with email and password or magic link.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",  // Optional for magic link
  "magicLink": true           // Optional, defaults to false
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "profile": {
      "displayName": "Jordan Smith",
      "role": "MEMBER",
      "houseId": "house_456"
    }
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "displayName": "Jordan Smith",
  "pronouns": "they/them",
  "bio": "Passionate about ballroom culture..."
}
```

### POST /api/auth/refresh
Refresh JWT token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST /api/auth/signout
Sign out and invalidate tokens.

---

## 👥 Users & Profiles

### GET /api/users/profile
Get current user's profile.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "profile": {
    "id": "profile_123",
    "displayName": "Jordan Smith",
    "pronouns": "they/them",
    "bio": "Passionate about ballroom culture...",
    "role": "MEMBER",
    "status": "ACTIVE",
    "houseId": "house_456",
    "house": {
      "name": "House of Eleganza",
      "color": "#8b5cf6"
    },
    "joinedAt": "2024-01-15T10:30:00Z",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### PUT /api/users/profile
Update current user's profile.

**Request Body:**
```json
{
  "displayName": "Jordan Fierce",
  "pronouns": "they/them",
  "bio": "Updated bio...",
  "socialLinks": {
    "instagram": "https://instagram.com/username",
    "twitter": "https://twitter.com/username"
  }
}
```

### GET /api/users
Get list of users (admin/leader only).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `role` (string): Filter by role
- `house` (string): Filter by house ID
- `search` (string): Search by name or email

**Response:**
```json
{
  "data": [
    {
      "id": "user_123",
      "profile": {
        "displayName": "Jordan Smith",
        "role": "MEMBER",
        "house": { "name": "House of Eleganza" }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## 📝 Posts & Feed

### GET /api/posts
Get posts for feed.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `scope` (string): `all`, `house`, `following` (default: `all`)
- `houseId` (string): Filter by house ID

**Response:**
```json
{
  "data": [
    {
      "id": "post_123",
      "content": "Amazing performance tonight! 🔥",
      "mediaItems": [
        {
          "id": "media_456",
          "type": "IMAGE",
          "url": "https://example.com/image.jpg",
          "thumbnail": "https://example.com/thumb.jpg",
          "alt": "Performance photo"
        }
      ],
      "author": {
        "id": "user_123",
        "displayName": "Jordan Smith",
        "avatar": "https://example.com/avatar.jpg",
        "house": { "name": "House of Eleganza", "color": "#8b5cf6" }
      },
      "visibility": "PUBLIC",
      "likes": 24,
      "comments": 8,
      "isLiked": false,
      "createdAt": "2024-12-15T20:30:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

### POST /api/posts
Create a new post.

**Request Body:**
```json
{
  "content": "Check out this amazing performance! 🌟",
  "mediaUrls": ["https://example.com/video.mp4"],
  "visibility": "PUBLIC",  // PUBLIC, HOUSE, PRIVATE
  "tags": ["performance", "vogue"],
  "scheduledFor": "2024-12-16T18:00:00Z"  // Optional
}
```

### POST /api/posts/[postId]/like
Like or unlike a post.

**Response:**
```json
{
  "liked": true,
  "likesCount": 25
}
```

### GET /api/posts/[postId]/comments
Get comments for a post.

**Response:**
```json
{
  "data": [
    {
      "id": "comment_123",
      "content": "Absolutely stunning! 💯",
      "author": {
        "displayName": "Alex Rivera",
        "avatar": "https://example.com/avatar2.jpg"
      },
      "createdAt": "2024-12-15T21:00:00Z"
    }
  ]
}
```

### POST /api/posts/[postId]/comments
Add a comment to a post.

**Request Body:**
```json
{
  "content": "Amazing work! Keep slaying! 👑"
}
```

---

## 💬 Messaging & Chat

### GET /api/chat/threads
Get user's chat threads.

**Response:**
```json
{
  "data": [
    {
      "id": "thread_123",
      "type": "DIRECT",  // DIRECT, GROUP, HOUSE
      "name": "Jordan & Alex",  // For group chats
      "participants": [
        {
          "user": {
            "id": "user_456",
            "displayName": "Alex Rivera",
            "avatar": "https://example.com/avatar.jpg"
          },
          "role": "MEMBER"  // For group chats
        }
      ],
      "lastMessage": {
        "content": "See you at practice tonight!",
        "sentAt": "2024-12-15T19:30:00Z"
      },
      "unreadCount": 2,
      "updatedAt": "2024-12-15T19:30:00Z"
    }
  ]
}
```

### POST /api/chat/threads
Create a new chat thread.

**Request Body:**
```json
{
  "type": "DIRECT",
  "participantIds": ["user_456"]
}
```

### GET /api/chat/threads/[threadId]/messages
Get messages in a thread.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)

**Response:**
```json
{
  "data": [
    {
      "id": "message_123",
      "content": "Hey! How's rehearsal going?",
      "sender": {
        "id": "user_123",
        "displayName": "Jordan Smith",
        "avatar": "https://example.com/avatar.jpg"
      },
      "mediaUrl": null,
      "sentAt": "2024-12-15T18:45:00Z",
      "readBy": [
        {
          "userId": "user_456",
          "readAt": "2024-12-15T18:46:00Z"
        }
      ]
    }
  ]
}
```

### POST /api/chat/threads/[threadId]/messages
Send a message to a thread.

**Request Body:**
```json
{
  "content": "Looking forward to the show tonight! 🎭",
  "mediaUrl": "https://example.com/image.jpg"  // Optional
}
```

### PUT /api/chat/messages/[messageId]/read
Mark message as read.

---

## 🖼️ Gallery & Media

### GET /api/gallery
Get gallery items.

**Query Parameters:**
- `category` (string): `PERFORMANCE`, `FASHION`, `RUNWAY`, `EVENT`
- `tags` (string[]): Filter by tags
- `author` (string): Filter by author ID
- `house` (string): Filter by house ID
- `page`, `limit`: Pagination

**Response:**
```json
{
  "data": [
    {
      "id": "media_123",
      "title": "Vogue Performance - Ball 2024",
      "description": "Amazing performance from last weekend's ball",
      "type": "VIDEO",  // IMAGE, VIDEO
      "url": "https://example.com/video.mp4",
      "thumbnail": "https://example.com/thumb.jpg",
      "category": "PERFORMANCE",
      "tags": ["vogue", "battle", "performance"],
      "author": {
        "displayName": "Jordan Smith",
        "house": { "name": "House of Eleganza" }
      },
      "likes": 45,
      "isLiked": false,
      "visibility": "PUBLIC",
      "uploadedAt": "2024-12-15T16:00:00Z"
    }
  ]
}
```

### POST /api/gallery/upload
Upload media to gallery.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Media file
- `title`: Media title
- `description`: Media description
- `category`: Category enum
- `tags`: JSON array of tags
- `visibility`: Visibility level

**Response:**
```json
{
  "id": "media_123",
  "url": "https://example.com/uploaded-file.jpg",
  "thumbnail": "https://example.com/thumbnail.jpg"
}
```

### POST /api/gallery/[mediaId]/like
Like or unlike gallery item.

---

## 🏠 Houses & Communities

### GET /api/houses
Get list of houses.

**Response:**
```json
{
  "data": [
    {
      "id": "house_123",
      "name": "House of Eleganza",
      "description": "Bringing elegance and grace to the ballroom",
      "color": "#8b5cf6",
      "logo": "https://example.com/logo.jpg",
      "founded": "2020-01-15",
      "memberCount": 24,
      "leaders": [
        {
          "user": {
            "id": "user_456",
            "displayName": "Mother Supreme",
            "avatar": "https://example.com/avatar.jpg"
          },
          "role": "MOTHER"
        }
      ]
    }
  ]
}
```

### GET /api/houses/[houseId]
Get house details.

### GET /api/houses/[houseId]/members
Get house members.

### POST /api/houses/[houseId]/join
Request to join a house.

---

## 📅 Events

### GET /api/events
Get upcoming events.

**Query Parameters:**
- `type` (string): `BALL`, `WORKSHOP`, `PRACTICE`, `SOCIAL`
- `house` (string): Filter by house ID
- `upcoming` (boolean): Only upcoming events

**Response:**
```json
{
  "data": [
    {
      "id": "event_123",
      "title": "Monthly Vogue Ball",
      "description": "Join us for an amazing night of competition!",
      "type": "BALL",
      "startDate": "2024-12-20T20:00:00Z",
      "endDate": "2024-12-21T02:00:00Z",
      "location": {
        "name": "Community Center",
        "address": "123 Main St, City, State",
        "coordinates": { "lat": 40.7128, "lng": -74.0060 }
      },
      "organizer": {
        "type": "HOUSE",
        "house": { "name": "House of Eleganza" }
      },
      "categories": ["Vogue Fem", "Runway", "Face"],
      "rsvpCount": 156,
      "isRsvped": false,
      "ticketPrice": 25.00,
      "coverImage": "https://example.com/event-cover.jpg"
    }
  ]
}
```

### POST /api/events/[eventId]/rsvp
RSVP to an event.

**Request Body:**
```json
{
  "attending": true,
  "notes": "Can't wait for this event!"
}
```

---

## 👑 Admin API

### GET /api/admin/stats
Get admin dashboard statistics (admin only).

**Response:**
```json
{
  "users": {
    "total": 1250,
    "newThisMonth": 45,
    "byRole": {
      "ADMIN": 3,
      "LEADER": 12,
      "MEMBER": 1180,
      "APPLICANT": 55
    }
  },
  "content": {
    "posts": 3456,
    "comments": 12890,
    "galleryItems": 890
  },
  "houses": {
    "total": 15,
    "averageMembers": 78
  },
  "activity": {
    "dailyActiveUsers": 234,
    "monthlyActiveUsers": 892
  }
}
```

### GET /api/admin/applications
Get pending membership applications (admin only).

**Response:**
```json
{
  "data": [
    {
      "id": "app_123",
      "user": {
        "email": "newmember@example.com",
        "displayName": "Casey Johnson"
      },
      "applicationData": {
        "pronouns": "she/her",
        "bio": "New to ballroom but passionate to learn",
        "experience": "beginner",
        "interestedHouse": "house_456"
      },
      "submittedAt": "2024-12-15T14:30:00Z",
      "status": "PENDING"
    }
  ]
}
```

### POST /api/admin/applications/[applicationId]/review
Review a membership application (admin only).

**Request Body:**
```json
{
  "decision": "APPROVED",  // APPROVED, REJECTED
  "notes": "Welcome to the community!",
  "assignedHouse": "house_456"  // Optional
}
```

### GET /api/admin/moderation
Get content moderation queue (admin only).

### POST /api/admin/moderation/[itemId]
Moderate content item (admin only).

---

## 🔌 WebSocket Events

The app uses Socket.IO for real-time features. Connect to `/socket.io` endpoint.

### Authentication
```javascript
socket.emit('authenticate', { token: 'jwt_token_here' })
```

### Chat Events
```javascript
// Join a chat thread
socket.emit('join_thread', { threadId: 'thread_123' })

// Send a message
socket.emit('send_message', {
  threadId: 'thread_123',
  content: 'Hello everyone!'
})

// Typing indicator
socket.emit('typing', { threadId: 'thread_123', isTyping: true })

// Listen for new messages
socket.on('new_message', (message) => {
  // Handle new message
})

// Listen for typing indicators
socket.on('user_typing', ({ userId, isTyping }) => {
  // Show/hide typing indicator
})
```

### Live Updates
```javascript
// Listen for post likes
socket.on('post_liked', ({ postId, likesCount }) => {
  // Update UI
})

// Listen for new comments
socket.on('new_comment', ({ postId, comment }) => {
  // Add comment to UI
})
```

---

## 🚨 Error Handling

All API endpoints return errors in this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific error details"
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

### Error Codes
- `INVALID_TOKEN` - JWT token is invalid
- `TOKEN_EXPIRED` - JWT token has expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_ERROR` - Request validation failed
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 📊 Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication**: 5 requests per minute
- **Posts**: 10 posts per hour
- **Messages**: 60 messages per minute
- **General API**: 100 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔐 Security

### Authentication
- JWT tokens expire after 24 hours
- Refresh tokens expire after 30 days
- All passwords are hashed with bcrypt
- Magic links expire after 15 minutes

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- House-based content filtering

### Data Protection
- All API requests must use HTTPS in production
- Sensitive data is never logged
- File uploads are scanned and validated
- CORS is configured for known origins only

---

*For questions about the API, please check the [GitHub Issues](https://github.com/miketui/v0-appmain2/issues) or refer to the [SDD Documentation](./SDD_GITHUB_SPARK_KIT.md).*