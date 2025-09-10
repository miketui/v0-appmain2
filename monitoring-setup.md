# 🔍 Monitoring & Analytics Setup for Haus of Basquiat Portal

This guide covers setting up comprehensive monitoring, analytics, and alerting for your production deployment.

## 📊 1. Supabase Analytics & Monitoring

### 1.1 Database Performance Monitoring

**In Supabase Dashboard:**
1. Go to **Settings > General**
2. Enable **Database observability** (Pro plan feature)
3. Go to **Database > Logs** to monitor:
   - Slow queries (queries taking >500ms)
   - Connection count
   - Database CPU usage
   - Memory usage

**Set up alerts for:**
- Database CPU > 80% for 5 minutes
- Connection count > 80% of limit
- Slow query count > 10 per minute
- Storage usage > 80% of quota

### 1.2 API Performance Monitoring

Monitor these metrics in **Reports > API**:
- Request count and patterns
- Response times (p50, p95, p99)
- Error rates
- Most popular endpoints
- Geographic distribution

### 1.3 Storage Monitoring

Track in **Storage > Usage**:
- Storage usage by bucket
- Bandwidth usage
- Upload success/failure rates
- Large file uploads (>10MB)

## 🔍 2. Application Performance Monitoring (APM)

### 2.1 Sentry Setup (Error Tracking)

**Install Sentry:**
```bash
npm install @sentry/nextjs @sentry/profiling-node
```

**Create `sentry.client.config.ts`:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException
      if (error && error.message && error.message.includes('ResizeObserver loop limit exceeded')) {
        return null // Don't send this benign error
      }
    }
    return event
  },
  
  integrations: [
    new Sentry.BrowserTracing({
      // Performance monitoring for page loads and navigation
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/hausofbasquiat\.com/,
        /^https:\/\/.*\.supabase\.co/
      ]
    })
  ]
})
```

**Create `sentry.server.config.ts`:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})
```

**Sentry Alerts to Configure:**
- Error rate > 1% for 5 minutes
- New error introduced
- Performance regression (page load > 3 seconds)
- Memory usage > 500MB

### 2.2 Vercel Analytics (if using Vercel)

```bash
npm install @vercel/analytics
```

**Add to `app/layout.tsx`:**
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2.3 Railway Metrics (if using Railway)

Railway provides built-in monitoring:
- CPU usage and memory consumption
- Network I/O and bandwidth
- Application logs and metrics
- Deployment history and rollbacks

**Set up Railway alerts:**
- Memory usage > 80%
- CPU usage > 80% for 5 minutes
- Application restarts > 3 per hour

## 📈 3. User Analytics

### 3.1 Google Analytics 4 Setup

**Install GA4:**
```bash
npm install gtag
```

**Create `lib/gtag.ts`:**
```typescript
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    })
  }
}

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track ballroom community specific events
export const trackCommunityEvent = (eventName: string, properties: Record<string, any>) => {
  event({
    action: eventName,
    category: 'Community',
    label: properties.house || properties.category || 'general',
    value: properties.value
  })
}
```

**Add to `app/layout.tsx`:**
```typescript
import Script from 'next/script'
import { GA_TRACKING_ID } from '@/lib/gtag'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_location: window.location.href,
                page_title: document.title,
              });
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 3.2 Custom Analytics Events to Track

**Community Engagement:**
- Post creation and interactions (likes, comments)
- Gallery uploads and views
- Message sending and thread creation
- Event RSVPs and attendance
- House joining and switching

**User Journey:**
- Registration funnel completion
- Application submission and approval
- First post creation
- First message sent
- Profile completion rate

**Performance Metrics:**
- Page load times by route
- Image loading times in gallery
- Real-time message delivery latency
- Search query response times

### 3.3 Privacy-First Analytics

Implement GDPR-compliant analytics:

**Create `components/CookieConsent.tsx`:**
```typescript
'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])
  
  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
    // Enable analytics
    enableAnalytics()
  }
  
  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setShowBanner(false)
    // Disable analytics
    disableAnalytics()
  }
  
  if (!showBanner) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          We use cookies to improve your experience and analyze usage. 
          Your privacy is important to us. 🍪✨
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={declineCookies}>
            Decline
          </Button>
          <Button onClick={acceptCookies}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
```

## 🚨 4. Alerting & Incident Response

### 4.1 Critical Alerts

**Set up alerts for:**

**Database Issues:**
- Connection pool exhausted
- Query timeout > 30 seconds
- Database disk space > 90%
- Replication lag > 10 seconds

**Application Errors:**
- Error rate > 5% for 3 minutes
- Authentication failure rate > 10%
- File upload failure rate > 20%
- Real-time messaging connection drops > 50%

**Performance Issues:**
- Page load time p95 > 5 seconds
- API response time p95 > 2 seconds
- Memory usage > 90% for 5 minutes
- CPU usage > 85% for 10 minutes

### 4.2 Alert Channels

**Configure alerts to send to:**
- Slack/Discord webhook for immediate notifications
- Email for non-critical issues
- PagerDuty/OpsGenie for critical production issues
- SMS for severe incidents

### 4.3 Incident Response Playbook

**Create runbook for common issues:**

**Database Connection Issues:**
1. Check connection pool usage in Supabase dashboard
2. Verify database status and recent deployments
3. Scale up database resources if needed
4. Check for long-running queries and kill if necessary

**High Error Rates:**
1. Check Sentry for error details and affected users
2. Review recent deployments and rollback if needed
3. Check external service dependencies (Stripe, email)
4. Scale application resources if traffic-related

**Authentication Problems:**
1. Verify Supabase auth service status
2. Check email delivery for magic links
3. Verify JWT configuration and expiration
4. Test social provider connections

## 📊 5. Business Intelligence & Community Analytics

### 5.1 Community Health Dashboard

Create a dashboard tracking:

**Growth Metrics:**
- New user registrations per day/week/month
- Application approval rate
- User retention (Day 1, Day 7, Day 30)
- House membership growth

**Engagement Metrics:**
- Daily/Monthly active users
- Posts per user per month
- Messages sent per day
- Event attendance rates
- Gallery uploads and interactions

**Content Moderation:**
- Posts requiring moderation
- Average moderation response time
- Content removal rates
- Community guideline violations

### 5.2 Custom Supabase Views for Analytics

**Create analytics views in Supabase:**

```sql
-- Daily active users view
CREATE VIEW daily_active_users AS
SELECT 
  DATE(last_active_at) as date,
  COUNT(DISTINCT id) as active_users
FROM user_profiles
WHERE last_active_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(last_active_at)
ORDER BY date DESC;

-- Content engagement view  
CREATE VIEW content_engagement AS
SELECT 
  p.id,
  p.content,
  p.created_at,
  up.display_name as author,
  h.name as house,
  p.likes_count,
  p.comments_count,
  (p.likes_count + p.comments_count * 2) as engagement_score
FROM posts p
JOIN user_profiles up ON p.author_id = up.id
LEFT JOIN houses h ON p.house_id = h.id
WHERE p.moderation_status = 'approved'
ORDER BY engagement_score DESC;

-- House activity view
CREATE VIEW house_activity AS
SELECT 
  h.name,
  h.category,
  COUNT(DISTINCT up.id) as member_count,
  COUNT(DISTINCT p.id) as posts_count,
  COUNT(DISTINCT e.id) as events_count,
  AVG(p.likes_count) as avg_post_likes
FROM houses h
LEFT JOIN user_profiles up ON h.id = up.house_id
LEFT JOIN posts p ON h.id = p.house_id
LEFT JOIN events e ON h.id = e.house_id
GROUP BY h.id, h.name, h.category
ORDER BY member_count DESC;
```

### 5.3 Weekly Community Reports

**Automate weekly reports that include:**
- New member highlights
- Top performing content
- Upcoming events
- Community growth metrics
- House activity summaries

## 🔧 6. Performance Optimization Monitoring

### 6.1 Core Web Vitals Tracking

Monitor these key metrics:
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds  
- **Cumulative Layout Shift (CLS)**: < 0.1

### 6.2 API Performance Monitoring

Track API endpoints:
- Response times by endpoint
- Request volume patterns
- Error rates by endpoint
- Database query performance

### 6.3 Real-time Feature Monitoring

Monitor real-time features:
- WebSocket connection success rate
- Message delivery latency
- Notification delivery rate
- Live update propagation time

## 🎯 7. Deployment Monitoring

### 7.1 Deployment Health Checks

**Post-deployment verification:**
- Health check endpoints return 200
- Database migrations completed successfully
- Static assets loading correctly
- Authentication flow working
- Real-time features connected

### 7.2 Rollback Triggers

**Automatically rollback if:**
- Error rate increases by >300% post-deployment
- Health check endpoint fails for >2 minutes
- Database migration fails
- Critical feature unavailable

## 📋 8. Monitoring Checklist

**Pre-Production:**
- [ ] Sentry error tracking configured
- [ ] Google Analytics 4 installed
- [ ] Database monitoring enabled
- [ ] Storage usage tracking active
- [ ] Performance monitoring setup
- [ ] Alert channels configured
- [ ] Incident response playbook created

**Post-Launch:**
- [ ] Monitor user registration flow
- [ ] Track community engagement metrics
- [ ] Watch for content moderation queues
- [ ] Monitor house formation and activity
- [ ] Track event creation and attendance
- [ ] Analyze gallery usage patterns
- [ ] Review messaging system performance

**Ongoing:**
- [ ] Weekly community health reports
- [ ] Monthly performance reviews
- [ ] Quarterly cost optimization
- [ ] User feedback analysis
- [ ] Feature usage analytics
- [ ] Security audit reviews

## 🎊 Success Metrics

**Technical Success:**
- 99.9% uptime
- Page load times < 2 seconds p95
- Error rate < 0.1%
- Zero data breaches

**Community Success:**
- >80% user retention at 30 days
- >5 posts per active user per month
- >75% event attendance rate
- <24 hour application approval time

Your monitoring setup is now complete! You'll have full visibility into both technical performance and community health. 📊✨

*The stage is lit, the audience is watching, and your community is ready to shine! 🌟*