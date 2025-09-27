// lib/railway-db.ts - Railway PostgreSQL Configuration
// Alternative to Supabase - Simple and reliable database setup

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Global Prisma instance for Railway PostgreSQL
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Railway automatically provides this
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Simple authentication helpers (replacing Supabase Auth)
export class RailwayAuth {
  private static JWT_SECRET = process.env.JWT_SECRET!
  private static JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // Generate JWT token
  static generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, iat: Date.now() },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    )
  }

  // Generate refresh token
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    )
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any
      return { userId: decoded.userId, email: decoded.email }
    } catch (error) {
      return null
    }
  }

  // Sign up user
  static async signUp(email: string, password: string, displayName: string) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        throw new Error('User already exists')
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user with profile
      const user = await prisma.user.create({
        data: {
          email,
          hashedPassword,
          profile: {
            create: {
              displayName,
              status: 'pending', // Requires approval for ballroom community
            }
          }
        },
        include: {
          profile: true
        }
      })

      // Generate tokens
      const token = this.generateToken(user.id, user.email)
      const refreshToken = this.generateRefreshToken(user.id)

      return {
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile
        },
        token,
        refreshToken
      }
    } catch (error) {
      throw error
    }
  }

  // Sign in user
  static async signIn(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true }
      })

      if (!user || !user.hashedPassword) {
        throw new Error('Invalid credentials')
      }

      const isPasswordValid = await this.verifyPassword(password, user.hashedPassword)
      if (!isPasswordValid) {
        throw new Error('Invalid credentials')
      }

      // Generate new tokens
      const token = this.generateToken(user.id, user.email)
      const refreshToken = this.generateRefreshToken(user.id)

      return {
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile
        },
        token,
        refreshToken
      }
    } catch (error) {
      throw error
    }
  }

  // Get user from token
  static async getUserFromToken(token: string) {
    try {
      const decoded = this.verifyToken(token)
      if (!decoded) return null

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { profile: true }
      })

      return user
    } catch (error) {
      return null
    }
  }
}

// Database query helpers
export class RailwayQueries {
  // Get feed posts with pagination
  static async getFeedPosts(page: number = 0, limit: number = 20, userId?: string) {
    const posts = await prisma.post.findMany({
      skip: page * limit,
      take: limit,
      where: {
        visibility: 'public',
        status: 'published'
      },
      include: {
        author: {
          include: { profile: true }
        },
        house: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        },
        ...(userId && {
          likes: {
            where: { userId },
            select: { id: true }
          }
        })
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const totalCount = await prisma.post.count({
      where: {
        visibility: 'public',
        status: 'published'
      }
    })

    return {
      posts: posts.map(post => ({
        ...post,
        isLiked: userId ? post.likes?.length > 0 : false,
        likesCount: post._count.likes,
        commentsCount: post._count.comments
      })),
      hasMore: (page + 1) * limit < totalCount,
      totalCount
    }
  }

  // Get user profile with stats
  static async getUserProfile(userId: string, viewerId?: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        house: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            media: true
          }
        },
        ...(viewerId && viewerId !== userId && {
          followers: {
            where: { followerId: viewerId },
            select: { id: true }
          }
        })
      }
    })

    if (!profile) return null

    return {
      ...profile,
      isFollowing: viewerId ? profile.followers?.length > 0 : false,
      stats: {
        postsCount: profile._count.posts,
        followersCount: profile._count.followers,
        followingCount: profile._count.following,
        mediaCount: profile._count.media
      }
    }
  }

  // Get house details with members
  static async getHouseDetails(houseId: string, userId?: string) {
    const house = await prisma.house.findUnique({
      where: { id: houseId },
      include: {
        members: {
          include: {
            profile: true
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        posts: {
          where: {
            visibility: 'public',
            status: 'published'
          },
          include: {
            author: {
              include: { profile: true }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        events: {
          where: {
            status: 'published',
            startDate: {
              gte: new Date()
            }
          },
          orderBy: {
            startDate: 'asc'
          },
          take: 3
        },
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      }
    })

    if (!house) return null

    const isMember = userId ?
      house.members.some(member => member.userId === userId) :
      false

    const memberRole = userId ?
      house.members.find(member => member.userId === userId)?.role :
      null

    return {
      ...house,
      isMember,
      memberRole,
      stats: {
        membersCount: house._count.members,
        postsCount: house._count.posts
      }
    }
  }

  // Search functionality
  static async searchContent(query: string, type: 'posts' | 'users' | 'houses' | 'all' = 'all') {
    const results: any = {}

    if (type === 'posts' || type === 'all') {
      results.posts = await prisma.post.findMany({
        where: {
          AND: [
            { visibility: 'public' },
            { status: 'published' },
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        include: {
          author: { include: { profile: true } },
          house: true
        },
        take: 10
      })
    }

    if (type === 'users' || type === 'all') {
      results.users = await prisma.profile.findMany({
        where: {
          AND: [
            { status: 'approved' },
            {
              OR: [
                { displayName: { contains: query, mode: 'insensitive' } },
                { bio: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        include: {
          house: true
        },
        take: 10
      })
    }

    if (type === 'houses' || type === 'all') {
      results.houses = await prisma.house.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          _count: {
            select: { members: true }
          }
        },
        take: 10
      })
    }

    return results
  }
}

// File upload helpers (replacing Supabase Storage)
export class RailwayStorage {
  // In a real implementation, you'd use Railway's volume storage or external service like Cloudinary

  static async uploadFile(file: File, path: string, userId: string) {
    // This would integrate with your chosen file storage solution
    // For Railway, you might use:
    // - Railway volumes for persistent storage
    // - Cloudinary for image optimization
    // - AWS S3 for general file storage

    // Example implementation placeholder:
    const uploadUrl = `https://your-app.railway.app/uploads/${path}`

    // Return standardized response similar to Supabase
    return {
      data: {
        path,
        fullPath: `uploads/${path}`,
        publicUrl: uploadUrl
      },
      error: null
    }
  }

  static getPublicUrl(path: string) {
    return `https://your-app.railway.app/uploads/${path}`
  }
}

// Real-time functionality (replacing Supabase Realtime)
export class RailwayRealtime {
  // This would use Socket.IO or WebSockets
  // Railway supports WebSocket connections

  static async broadcastToHouse(houseId: string, event: string, data: any) {
    // Implementation would use your WebSocket setup
    // See your existing Socket.IO configuration
    console.log(`Broadcasting to house ${houseId}:`, event, data)
  }

  static async notifyUser(userId: string, notification: any) {
    // Send real-time notification to specific user
    console.log(`Notifying user ${userId}:`, notification)
  }
}

export default prisma