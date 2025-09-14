/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/auth-helpers-nextjs', '@supabase/supabase-js']
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Environment variables with NEXT_PUBLIC_ prefix are automatically available
  // No need to explicitly expose them in the env config

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