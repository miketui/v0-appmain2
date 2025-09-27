// lib/firebase-services.ts - Firebase Services for Ballroom Community
// Complete replacement for Supabase functionality

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  runTransaction,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore'

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth'

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage'

import { db, auth, storage } from './firebase-config'

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

export class FirebaseAuth {
  // Sign up with email and password
  static async signUp(email: string, password: string, displayName: string) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      await updateProfile(user, { displayName })

      // Create user profile document
      await this.createUserProfile(user.uid, {
        email,
        displayName,
        status: 'pending', // Requires approval for ballroom community
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return { user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      return { user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Sign in with Google
  static async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('profile')
      provider.addScope('email')

      const { user } = await signInWithPopup(auth, provider)

      // Check if user profile exists, create if not
      const profileExists = await this.getUserProfile(user.uid)
      if (!profileExists) {
        await this.createUserProfile(user.uid, {
          email: user.email!,
          displayName: user.displayName!,
          avatarUrl: user.photoURL,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }

      return { user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Sign out
  static async signOut() {
    try {
      await signOut(auth)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  // Create user profile document
  static async createUserProfile(userId: string, profileData: any) {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, profileData)
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null
  }
}

// ============================================================================
// DATABASE SERVICES
// ============================================================================

export class FirebaseDB {
  // Generic CRUD operations
  static async create(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { id: docRef.id, error: null }
    } catch (error: any) {
      return { id: null, error: error.message }
    }
  }

  static async read(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null }
      } else {
        return { data: null, error: 'Document not found' }
      }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  static async update(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  static async delete(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId)
      await deleteDoc(docRef)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Query with filters
  static async query(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    limitCount?: number
  ) {
    try {
      let q = query(collection(db, collectionName), ...constraints)

      if (limitCount) {
        q = query(q, limit(limitCount))
      }

      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { data, error: null }
    } catch (error: any) {
      return { data: [], error: error.message }
    }
  }

  // Real-time listener
  static onDocumentChange(
    collectionName: string,
    docId: string,
    callback: (data: any) => void
  ) {
    const docRef = doc(db, collectionName, docId)
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() })
      } else {
        callback(null)
      }
    })
  }

  static onCollectionChange(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    callback: (data: any[]) => void
  ) {
    const q = query(collection(db, collectionName), ...constraints)
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(data)
    })
  }
}

// ============================================================================
// BALLROOM COMMUNITY SPECIFIC SERVICES
// ============================================================================

export class BallroomServices {
  // Get feed posts with pagination
  static async getFeedPosts(pageSize: number = 20, lastDoc?: DocumentSnapshot) {
    try {
      let constraints: QueryConstraint[] = [
        where('visibility', '==', 'public'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      ]

      if (lastDoc) {
        constraints.push(startAfter(lastDoc))
      }

      const { data, error } = await FirebaseDB.query('posts', constraints)

      if (error) return { posts: [], error, hasMore: false }

      return {
        posts: data,
        error: null,
        hasMore: data.length === pageSize
      }
    } catch (error: any) {
      return { posts: [], error: error.message, hasMore: false }
    }
  }

  // Create a new post
  static async createPost(authorId: string, postData: any) {
    try {
      const { id, error } = await FirebaseDB.create('posts', {
        ...postData,
        authorId,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp()
      })

      if (error) return { postId: null, error }

      // Update user's post count
      await this.incrementUserPostCount(authorId)

      return { postId: id, error: null }
    } catch (error: any) {
      return { postId: null, error: error.message }
    }
  }

  // Like a post
  static async likePost(userId: string, postId: string) {
    try {
      return await runTransaction(db, async (transaction) => {
        const postRef = doc(db, 'posts', postId)
        const likeRef = doc(db, 'likes', `${userId}_${postId}`)

        const likeDoc = await transaction.get(likeRef)

        if (likeDoc.exists()) {
          // Remove like
          transaction.delete(likeRef)
          transaction.update(postRef, {
            likesCount: increment(-1)
          })
          return { isLiked: false, error: null }
        } else {
          // Add like
          transaction.set(likeRef, {
            userId,
            postId,
            createdAt: serverTimestamp()
          })
          transaction.update(postRef, {
            likesCount: increment(1)
          })
          return { isLiked: true, error: null }
        }
      })
    } catch (error: any) {
      return { isLiked: false, error: error.message }
    }
  }

  // Follow a user
  static async followUser(followerId: string, followingId: string) {
    try {
      return await runTransaction(db, async (transaction) => {
        const followRef = doc(db, 'follows', `${followerId}_${followingId}`)
        const followerRef = doc(db, 'users', followerId)
        const followingRef = doc(db, 'users', followingId)

        const followDoc = await transaction.get(followRef)

        if (followDoc.exists()) {
          // Unfollow
          transaction.delete(followRef)
          transaction.update(followerRef, {
            followingCount: increment(-1)
          })
          transaction.update(followingRef, {
            followersCount: increment(-1)
          })
          return { isFollowing: false, error: null }
        } else {
          // Follow
          transaction.set(followRef, {
            followerId,
            followingId,
            createdAt: serverTimestamp()
          })
          transaction.update(followerRef, {
            followingCount: increment(1)
          })
          transaction.update(followingRef, {
            followersCount: increment(1)
          })

          // Create notification
          transaction.set(doc(collection(db, 'notifications')), {
            userId: followingId,
            type: 'follow',
            title: 'New Follower',
            message: 'Someone started following you',
            data: { followerId },
            read: false,
            createdAt: serverTimestamp()
          })

          return { isFollowing: true, error: null }
        }
      })
    } catch (error: any) {
      return { isFollowing: false, error: error.message }
    }
  }

  // Join a house
  static async joinHouse(userId: string, houseId: string) {
    try {
      return await runTransaction(db, async (transaction) => {
        const memberRef = doc(db, 'houseMembers', `${userId}_${houseId}`)
        const userRef = doc(db, 'users', userId)
        const houseRef = doc(db, 'houses', houseId)

        transaction.set(memberRef, {
          userId,
          houseId,
          role: 'member',
          status: 'pending', // Requires approval
          joinedAt: serverTimestamp()
        })

        transaction.update(userRef, {
          houseId: houseId
        })

        transaction.update(houseRef, {
          membersCount: increment(1)
        })

        return { success: true, error: null }
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get house details
  static async getHouseDetails(houseId: string, userId?: string) {
    try {
      const { data: house, error } = await FirebaseDB.read('houses', houseId)
      if (error || !house) return { house: null, error: error || 'House not found' }

      // Get house members
      const { data: members } = await FirebaseDB.query('houseMembers', [
        where('houseId', '==', houseId),
        where('status', '==', 'approved')
      ])

      // Get recent posts
      const { data: posts } = await FirebaseDB.query('posts', [
        where('houseId', '==', houseId),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(5)
      ])

      // Check if user is a member
      let isMember = false
      let memberRole = null
      if (userId) {
        const membershipId = `${userId}_${houseId}`
        const { data: membership } = await FirebaseDB.read('houseMembers', membershipId)
        isMember = !!membership
        memberRole = membership?.role || null
      }

      return {
        house: {
          ...house,
          members,
          recentPosts: posts,
          isMember,
          memberRole
        },
        error: null
      }
    } catch (error: any) {
      return { house: null, error: error.message }
    }
  }

  // Search functionality
  static async searchContent(searchTerm: string, type: 'posts' | 'users' | 'houses' | 'all' = 'all') {
    try {
      const results: any = {}

      if (type === 'posts' || type === 'all') {
        // Firebase doesn't support full-text search natively
        // You would typically use Algolia or Elasticsearch for this
        // For now, we'll do a simple search on titles
        const { data: posts } = await FirebaseDB.query('posts', [
          where('visibility', '==', 'public'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(20)
        ])

        // Filter posts that contain the search term (client-side filtering)
        results.posts = posts.filter((post: any) =>
          post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (type === 'users' || type === 'all') {
        const { data: users } = await FirebaseDB.query('users', [
          where('status', '==', 'approved'),
          limit(20)
        ])

        results.users = users.filter((user: any) =>
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (type === 'houses' || type === 'all') {
        const { data: houses } = await FirebaseDB.query('houses', [
          limit(20)
        ])

        results.houses = houses.filter((house: any) =>
          house.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          house.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      return { results, error: null }
    } catch (error: any) {
      return { results: {}, error: error.message }
    }
  }

  // Helper: Increment user post count
  private static async incrementUserPostCount(userId: string) {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      postsCount: increment(1)
    })
  }
}

// ============================================================================
// STORAGE SERVICES
// ============================================================================

export class FirebaseFileStorage {
  // Upload file with progress tracking
  static async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ) {
    try {
      const storageRef = ref(storage, path)

      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file)

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              onProgress(progress)
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              resolve({ url: downloadURL, error: null })
            }
          )
        })
      } else {
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        return { url: downloadURL, error: null }
      }
    } catch (error: any) {
      return { url: null, error: error.message }
    }
  }

  // Delete file
  static async deleteFile(path: string) {
    try {
      const fileRef = ref(storage, path)
      await deleteObject(fileRef)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // List files in a directory
  static async listFiles(path: string) {
    try {
      const listRef = ref(storage, path)
      const result = await listAll(listRef)

      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef)
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url
          }
        })
      )

      return { files, error: null }
    } catch (error: any) {
      return { files: [], error: error.message }
    }
  }
}

// ============================================================================
// REAL-TIME SERVICES
// ============================================================================

export class FirebaseRealtime {
  // Listen to feed updates
  static listenToFeedUpdates(callback: (posts: any[]) => void) {
    return FirebaseDB.onCollectionChange(
      'posts',
      [
        where('visibility', '==', 'public'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(20)
      ],
      callback
    )
  }

  // Listen to user notifications
  static listenToUserNotifications(userId: string, callback: (notifications: any[]) => void) {
    return FirebaseDB.onCollectionChange(
      'notifications',
      [
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(50)
      ],
      callback
    )
  }

  // Listen to house chat messages
  static listenToHouseMessages(houseId: string, callback: (messages: any[]) => void) {
    return FirebaseDB.onCollectionChange(
      'messages',
      [
        where('houseId', '==', houseId),
        orderBy('createdAt', 'desc'),
        limit(100)
      ],
      callback
    )
  }
}

// Export all services
export { FirebaseAuth, FirebaseDB, BallroomServices, FirebaseFileStorage, FirebaseRealtime }