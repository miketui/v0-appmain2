/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs', 'jsonwebtoken']
  },

  // Enable strict TypeScript checking for production
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization - Railway PostgreSQL with Cloudinary/external storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.railway.app',
        port: '',
        pathname: '/uploads/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          }
        ],
      },
    ]
  },

  // PWA Support
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/api/sw',
      },
      {
        source: '/manifest.json',
        destination: '/api/manifest',
      }
    ]
  },

  // Webpack configuration for better performance
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Bundle analyzer (development only)
    if (process.env.ANALYZE === 'true') {
      const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: process.env.ANALYZE === 'true',
      })
      return withBundleAnalyzer(config)
    }
    return config
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/feed',
        permanent: false,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      }
    ]
  },

  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Standalone output for Docker deployments
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

module.exports = nextConfig