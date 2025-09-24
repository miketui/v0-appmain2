import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/components/providers/auth-provider"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import { PWAInitializer } from "@/components/pwa-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Ballroom Community Portal",
    template: "%s | Community Portal"
  },
  description: "Members-only social platform for the ballroom and voguing community featuring role-based access control, real-time messaging, media galleries, event management, and community features.",
  generator: "Next.js",
  applicationName: "Ballroom Community Portal",
  authors: [{ name: "Community" }],
  creator: "Community",
  publisher: "Ballroom Community",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Ballroom Community Portal',
    title: 'Ballroom Community Portal',
    description: 'Members-only social platform for the ballroom and voguing community',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ballroom Community Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Haus of Basquiat Portal',
    description: 'Members-only social platform for the ballroom and voguing community',
    images: ['/og-image.png'],
    creator: '@ballroom-community',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Haus of Basquiat',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Haus of Basquiat" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#dc2626" />
      </head>
      <body className={`${inter.className} font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <PWAInitializer />
        <Suspense fallback={<div>Loading...</div>}>
          <Providers>{children}</Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
