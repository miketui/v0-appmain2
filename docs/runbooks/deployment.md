# Deployment Runbook

## Overview
This runbook covers deployment procedures for the Haus of Basquiat Portal application.

## Pre-Deployment Checklist

### Required Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `DATABASE_URL` - Database connection string
- [ ] `JWT_SECRET` - JWT signing secret
- [ ] `JWT_REFRESH_SECRET` - JWT refresh token secret

### Optional Environment Variables
- [ ] `SENTRY_DSN` - Error tracking
- [ ] `SLACK_WEBHOOK_URL` - Monitoring alerts
- [ ] `SENDGRID_API_KEY` - Email notifications
- [ ] `STRIPE_SECRET_KEY` - Payment processing
- [ ] `UPSTASH_REDIS_REST_URL` - Redis cache

### Pre-Deployment Tests
- [ ] All tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript check passes (`npm run type-check`)
- [ ] Security audit passes (`npm run security:audit`)
- [ ] E2E tests pass (`npm run e2e`)

## Deployment Procedures

### 1. Staging Deployment

#### Via Railway
```bash
# Deploy to staging
railway login
railway environment staging
railway up

# Verify deployment
curl -f https://hausofbasquiat-staging.railway.app/api/health
```

#### Via Docker
```bash
# Build image
docker build -t haus-of-basquiat:staging .

# Run container
docker run -d \
  --name haus-of-basquiat-staging \
  -p 3000:3000 \
  --env-file .env.staging \
  haus-of-basquiat:staging

# Health check
curl -f http://localhost:3000/api/health
```

### 2. Production Deployment

#### Pre-Production Checklist
- [ ] Staging deployment tested and verified
- [ ] Database migrations reviewed and tested
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment window

#### Production Deploy Steps
```bash
# 1. Backup production database
pg_dump $PRODUCTION_DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Deploy application
railway environment production
railway up

# 3. Run database migrations (if needed)
railway run "npx prisma migrate deploy"

# 4. Verify deployment
curl -f https://hausofbasquiat.com/api/health
curl -f https://hausofbasquiat.com/

# 5. Check application logs
railway logs --service production

# 6. Monitor metrics for 10 minutes
curl -s https://hausofbasquiat.com/api/monitoring?type=health | jq '.status'
```

## Post-Deployment Verification

### Health Checks (Run these in order)
1. **Application Health**
   ```bash
   curl -f https://hausofbasquiat.com/api/health
   ```

2. **Database Connectivity**
   ```bash
   curl -s https://hausofbasquiat.com/api/monitoring?type=health | jq '.metrics'
   ```

3. **Authentication Flow**
   - Visit `/auth/signin`
   - Test magic link flow
   - Verify user can access protected routes

4. **Core Functionality**
   - Create a test post
   - Send a test message
   - Upload test media to gallery
   - Test admin functions (if admin user)

5. **Performance Metrics**
   ```bash
   # Check response times
   curl -w "@curl-format.txt" -o /dev/null -s https://hausofbasquiat.com/

   # Monitor for 5 minutes
   for i in {1..10}; do
     curl -s https://hausofbasquiat.com/api/monitoring?type=metrics | jq '.summary'
     sleep 30
   done
   ```

### curl-format.txt
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

## Rollback Procedures

### Immediate Rollback (< 5 minutes)
```bash
# 1. Rollback to previous deployment
railway rollback

# 2. Verify rollback
curl -f https://hausofbasquiat.com/api/health

# 3. Check application logs
railway logs --service production --tail 100
```

### Database Rollback (if needed)
```bash
# 1. Stop application
railway service stop

# 2. Restore database backup
psql $PRODUCTION_DATABASE_URL < backup-YYYYMMDD-HHMMSS.sql

# 3. Restart application
railway service start

# 4. Verify functionality
curl -f https://hausofbasquiat.com/api/health
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
**Symptoms:** 503 errors, health check fails
**Investigation:**
```bash
# Check logs
railway logs --service production --tail 50

# Check environment variables
railway variables

# Check build logs
railway logs --deployment DEPLOYMENT_ID
```

**Solutions:**
- Verify all required environment variables are set
- Check for TypeScript build errors
- Verify database connectivity

#### 2. Database Connection Issues
**Symptoms:** API errors, authentication fails
**Investigation:**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool
curl -s https://hausofbasquiat.com/api/monitoring?type=health
```

**Solutions:**
- Verify DATABASE_URL is correct
- Check database server status
- Restart application to reset connection pool

#### 3. Authentication Issues
**Symptoms:** Users can't log in, 401 errors
**Investigation:**
```bash
# Check JWT secrets
railway variables | grep JWT

# Check Supabase configuration
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

**Solutions:**
- Verify JWT secrets match
- Check Supabase project configuration
- Verify callback URLs are correct

#### 4. High Error Rate
**Symptoms:** Multiple 500 errors, poor performance
**Investigation:**
```bash
# Check error logs
railway logs --service production | grep ERROR

# Check monitoring metrics
curl -s https://hausofbasquiat.com/api/monitoring?type=errors
```

**Solutions:**
- Scale up resources if needed
- Check for memory leaks
- Review recent code changes

## Monitoring During Deployment

### Key Metrics to Watch
1. **Response Time** - Should stay < 2 seconds
2. **Error Rate** - Should stay < 1%
3. **Memory Usage** - Should stay < 80%
4. **Database Connections** - Monitor pool usage

### Monitoring Commands
```bash
# Watch health status
watch -n 30 'curl -s https://hausofbasquiat.com/api/monitoring?type=health | jq ".status"'

# Monitor error rate
watch -n 60 'curl -s https://hausofbasquiat.com/api/monitoring?type=errors | jq ".summary.total"'

# Check resource usage
railway metrics --service production
```

## Emergency Contacts

### On-Call Schedule
- **Primary:** Development Team Lead
- **Secondary:** DevOps Engineer
- **Escalation:** CTO

### Communication Channels
- **Slack:** #haus-of-basquiat-alerts
- **Email:** alerts@hausofbasquiat.com
- **Phone:** Emergency contact list in team directory

## Documentation Updates

After each deployment, update:
- [ ] This runbook if procedures changed
- [ ] Architecture diagrams if infrastructure changed
- [ ] API documentation if endpoints changed
- [ ] User documentation if features changed

## Deployment Log Template

```
Deployment Date: YYYY-MM-DD
Deployment Time: HH:MM UTC
Deployed By: [Name]
Git Commit: [hash]
Environment: [staging/production]

Pre-Deployment Checklist: ✓
Deployment Steps: ✓
Health Checks: ✓
Performance Verification: ✓

Issues Encountered: [None/Description]
Rollback Required: [Yes/No]
Post-Deployment Notes: [Notes]
```