# 🔥 Firebase Setup Guide - Quick Migration from Supabase

**Time to Setup**: 15-20 minutes
**Difficulty**: Easy (Google's excellent documentation)
**Cost**: Free tier → Pay as you go (very reasonable)

---

## 🚀 **QUICK SETUP (15 minutes)**

### **Step 1: Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. **Project name**: `haus-of-basquiat-portal`
4. **Enable Google Analytics**: Yes (recommended)
5. Click **"Create project"**

### **Step 2: Add Web App**
1. In your project dashboard, click **"Web"** icon (`</>`)
2. **App nickname**: `ballroom-community-web`
3. **Enable Firebase Hosting**: Yes
4. Click **"Register app"**
5. **Copy the config object** (you'll need this)

### **Step 3: Enable Authentication**
1. **Firebase Console** → **Authentication** → **Get started**
2. **Sign-in method** tab
3. Enable these providers:
   - ✅ **Email/Password** (for basic auth)
   - ✅ **Google** (one-click social login)
   - ✅ **Facebook** (optional, popular in ballroom community)

### **Step 4: Setup Firestore Database**
1. **Firebase Console** → **Firestore Database** → **Create database**
2. **Security rules**: Start in **test mode** (we'll secure later)
3. **Location**: Choose closest to your users (us-central1 recommended)

### **Step 5: Setup Storage**
1. **Firebase Console** → **Storage** → **Get started**
2. **Security rules**: Start in **test mode**
3. **Location**: Same as Firestore

---

## 🔧 **PROJECT CONFIGURATION**

### **Install Dependencies**
```bash
npm install firebase firebase-admin
npm install --save-dev @types/firebase
```

### **Environment Variables**
Add these to your Railway/deployment platform:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=haus-of-basquiat-portal.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=haus-of-basquiat-portal
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=haus-of-basquiat-portal.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin (Server-side)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@haus-of-basquiat-portal.iam.gserviceaccount.com
```

### **Get Admin Credentials**
1. **Firebase Console** → **Project Settings** → **Service accounts**
2. Click **"Generate new private key"**
3. Download JSON file
4. Extract `private_key` and `client_email` for environment variables

---

## 📁 **PROJECT STRUCTURE UPDATE**

Replace your Supabase files with Firebase equivalents:

```bash
# Remove Supabase files
rm lib/supabase.ts
rm lib/supabase-types.ts

# Add Firebase files (already created)
# ✅ lib/firebase-config.ts
# ✅ lib/firebase-services.ts

# Update your imports in components
# Old: import { supabase } from '@/lib/supabase'
# New: import { BallroomServices } from '@/lib/firebase-services'
```

---

## 🔄 **MIGRATION SCRIPT**

### **Data Migration from Supabase to Firebase**
```typescript
// scripts/migrate-supabase-to-firebase.ts
import { createClient } from '@supabase/supabase-js'
import { BallroomServices, FirebaseDB } from '@/lib/firebase-services'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrateData() {
  console.log('🚀 Starting migration from Supabase to Firebase...')

  // Migrate users
  console.log('👥 Migrating users...')
  const { data: profiles } = await supabase.from('profiles').select('*')

  for (const profile of profiles) {
    await FirebaseDB.create('users', {
      email: profile.email,
      displayName: profile.display_name,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      status: profile.status,
      houseId: profile.house_id,
      // Convert Supabase timestamp to Firebase timestamp
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    })
  }

  // Migrate posts
  console.log('📝 Migrating posts...')
  const { data: posts } = await supabase.from('posts').select('*')

  for (const post of posts) {
    await FirebaseDB.create('posts', {
      title: post.title,
      content: post.content,
      imageUrl: post.image_url,
      category: post.category,
      visibility: post.visibility,
      status: post.status,
      authorId: post.author_id,
      houseId: post.house_id,
      createdAt: new Date(post.created_at),
      updatedAt: new Date(post.updated_at)
    })
  }

  // Migrate houses
  console.log('🏠 Migrating houses...')
  const { data: houses } = await supabase.from('houses').select('*')

  for (const house of houses) {
    await FirebaseDB.create('houses', {
      name: house.name,
      description: house.description,
      imageUrl: house.image_url,
      foundedYear: house.founded_year,
      location: house.location,
      createdAt: new Date(house.created_at)
    })
  }

  console.log('✅ Migration completed!')
}

// Run migration
migrateData().catch(console.error)
```

### **Run Migration**
```bash
# Create and run migration script
npx ts-node scripts/migrate-supabase-to-firebase.ts
```

---

## 🔒 **SECURITY RULES**

### **Firestore Security Rules**
Replace the default rules with these secure ones:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null &&
                     resource.data.status == 'approved' &&
                     resource.data.visibility == 'public';
    }

    // Posts - public posts readable by authenticated users
    match /posts/{postId} {
      allow read: if request.auth != null &&
                     (resource.data.visibility == 'public' ||
                      resource.data.authorId == request.auth.uid);
      allow create: if request.auth != null &&
                       request.auth.uid == resource.data.authorId;
      allow update, delete: if request.auth != null &&
                               request.auth.uid == resource.data.authorId;
    }

    // Houses - members can read, leaders can write
    match /houses/{houseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isHouseLeader(houseId, request.auth.uid);
    }

    // House members
    match /houseMembers/{membershipId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null &&
                               (request.auth.uid == resource.data.userId ||
                                isHouseLeader(resource.data.houseId, request.auth.uid));
    }

    // Likes - users can like/unlike
    match /likes/{likeId} {
      allow read, write: if request.auth != null &&
                            request.auth.uid == resource.data.userId;
    }

    // Comments
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.auth.uid == resource.data.authorId;
      allow update, delete: if request.auth != null &&
                               request.auth.uid == resource.data.authorId;
    }

    // Notifications - users can read their own
    match /notifications/{notificationId} {
      allow read, update: if request.auth != null &&
                             request.auth.uid == resource.data.userId;
    }

    // Helper function
    function isHouseLeader(houseId, userId) {
      return exists(/databases/$(database)/documents/houseMembers/$(userId + '_' + houseId)) &&
             get(/databases/$(database)/documents/houseMembers/$(userId + '_' + houseId)).data.role in ['leader', 'founder'];
    }
  }
}
```

### **Storage Security Rules**
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public uploads (with size limits)
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
                      request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }

    // House uploads
    match /houses/{houseId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.resource.size < 20 * 1024 * 1024; // 20MB limit
    }
  }
}
```

---

## 🧪 **TESTING YOUR SETUP**

### **Test Authentication**
```typescript
// pages/test-firebase.tsx
import { useState } from 'react'
import { FirebaseAuth } from '@/lib/firebase-services'

export default function TestFirebase() {
  const [result, setResult] = useState('')

  const testSignUp = async () => {
    const { user, error } = await FirebaseAuth.signUp(
      'test@example.com',
      'password123',
      'Test User'
    )
    setResult(error || 'Sign up successful!')
  }

  const testSignIn = async () => {
    const { user, error } = await FirebaseAuth.signIn(
      'test@example.com',
      'password123'
    )
    setResult(error || 'Sign in successful!')
  }

  return (
    <div className="p-8">
      <h1>Firebase Test Page</h1>
      <div className="space-y-4">
        <button onClick={testSignUp} className="btn">Test Sign Up</button>
        <button onClick={testSignIn} className="btn">Test Sign In</button>
        <button onClick={FirebaseAuth.signOut} className="btn">Sign Out</button>
        <p>Result: {result}</p>
      </div>
    </div>
  )
}
```

### **Test Database Operations**
```typescript
// Test creating and reading posts
import { BallroomServices } from '@/lib/firebase-services'

const testPost = async () => {
  const { postId, error } = await BallroomServices.createPost('userId123', {
    title: 'Test Post',
    content: 'This is a test post for the ballroom community!',
    category: 'general',
    visibility: 'public',
    status: 'published'
  })

  if (postId) {
    console.log('Post created successfully:', postId)
  } else {
    console.error('Error creating post:', error)
  }
}
```

---

## 📊 **FIREBASE VS SUPABASE COMPARISON**

| Feature | Firebase | Supabase | Winner |
|---------|----------|----------|--------|
| **Setup Time** | 15 min | 30 min | 🔥 Firebase |
| **Authentication** | Excellent social login | Good email/password | 🔥 Firebase |
| **Real-time** | Native, excellent | Good with websockets | 🔥 Firebase |
| **File Storage** | Integrated, optimized | Integrated | 🤝 Tie |
| **Pricing** | Pay-as-you-go | Subscription | 🔥 Firebase |
| **Documentation** | Excellent | Good | 🔥 Firebase |
| **SQL Features** | NoSQL only | Full PostgreSQL | 🗄️ Supabase |

---

## 💰 **COST COMPARISON**

### **Firebase Pricing** (Pay-as-you-go)
- **Authentication**: Free up to 50,000 MAU
- **Firestore**: Free 50k reads + 20k writes per day
- **Storage**: Free 5GB, then $0.026/GB/month
- **Hosting**: Free 10GB/month

### **Typical Monthly Cost for Your App**
- **Small community** (< 1000 users): **FREE**
- **Medium community** (1000-5000 users): **$10-25/month**
- **Large community** (5000+ users): **$25-50/month**

**vs Supabase**: $25/month minimum → **Significant savings**

---

## ✅ **DEPLOYMENT WITH FIREBASE**

### **Add to Railway Environment**
```bash
# Your existing Railway deployment works perfectly with Firebase
# Just add the Firebase environment variables above

# Firebase works with:
# ✅ Railway
# ✅ Vercel
# ✅ Netlify
# ✅ Any hosting platform
```

### **Firebase Hosting (Optional)**
```bash
# If you want to use Firebase Hosting instead of Railway
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 🎯 **MIGRATION CHECKLIST**

### **Pre-Migration**
- [ ] Create Firebase project
- [ ] Enable Authentication, Firestore, Storage
- [ ] Get configuration keys
- [ ] Set up security rules

### **Migration**
- [ ] Install Firebase dependencies
- [ ] Add environment variables
- [ ] Run data migration script
- [ ] Update component imports
- [ ] Test authentication flow

### **Post-Migration**
- [ ] Deploy to Railway with Firebase config
- [ ] Test all functionality
- [ ] Monitor Firebase usage dashboard
- [ ] Set up billing alerts

---

## 🚀 **WHY FIREBASE IS GREAT FOR YOUR BALLROOM COMMUNITY**

1. **🌐 Global CDN**: Your media loads fast worldwide
2. **📱 Mobile Ready**: Perfect PWA support
3. **🔄 Real-time**: Live chat and notifications out of the box
4. **🔒 Security**: Google-level security and authentication
5. **📈 Scalable**: Handles viral posts and traffic spikes
6. **💰 Cost-effective**: Pay only for what you use
7. **🛠️ Easy Maintenance**: Less infrastructure to manage

**Firebase is particularly good for communities because it excels at real-time social features, has excellent mobile support, and Google's infrastructure ensures your app stays fast as your ballroom community grows globally.**

Ready to migrate to Firebase? The setup takes about 15 minutes and you'll have a more reliable, feature-rich backend than Supabase!