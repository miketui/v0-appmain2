# 🚀 Staging Environment Deployment Guide

This guide provides comprehensive instructions for deploying the Haus of Basquiat Portal to staging environments.

## 📋 Quick Start

```bash
# Option 1: Automated deployment script
./scripts/deploy-staging.sh railway

# Option 2: Manual deployment
npm run build:staging
npm run deploy:staging
```

## 🏗️ Deployment Options

### 1. Railway (Recommended)

**Best for:** Quick deployments with database integration

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Deploy to staging
./scripts/deploy-staging.sh railway
```

**Configuration:**
- Uses `railway.staging.json`
- Automatic HTTPS
- Built-in database options
- Easy environment variable management

### 2. Vercel

**Best for:** Static sites with serverless functions

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to staging
./scripts/deploy-staging.sh vercel
```

**Configuration:**
- Uses `vercel.staging.json`
- Edge functions for API routes
- Automatic deployments from Git
- Built-in analytics

### 3. Docker

**Best for:** Local staging or self-hosted environments

```bash
# Deploy with Docker Compose
./scripts/deploy-staging.sh docker

# Or manually
docker-compose -f docker-compose.staging.yml up -d
```

**Configuration:**
- Uses `docker-compose.staging.yml`
- Includes PostgreSQL, Redis, and Nginx
- Complete containerized environment

### 4. Local Staging

**Best for:** Development and testing

```bash
# Start local staging environment
./scripts/deploy-staging.sh local
```

## 🔧 Environment Setup

### 1. Create Staging Environment Variables

Copy and configure your staging environment:

```bash
cp .env.example .env.staging
```

**Required Variables:**
```env
# Database
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_staging_anon_key

# Authentication
JWT_SECRET=staging-specific-secret

# Payments (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_test_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key

# External APIs
ANTHROPIC_API_KEY=your_staging_key
OPENAI_API_KEY=your_staging_key
```

### 2. Set Up Staging Database

#### Option A: Supabase Staging Project

1. Create a new Supabase project for staging
2. Run the staging migration:
   ```sql
   -- Execute database/staging-migration.sql
   ```

#### Option B: Local PostgreSQL

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name postgres-staging \
  -e POSTGRES_DB=hausofbasquiat_staging \
  -e POSTGRES_USER=staging_user \
  -e POSTGRES_PASSWORD=staging_password \
  -p 5433:5432 \
  postgres:15-alpine
```

### 3. Configure GitHub Secrets

For automated deployments, add these secrets to your GitHub repository:

**Railway Deployment:**
- `RAILWAY_TOKEN`: Your Railway API token
- `RAILWAY_STAGING_SERVICE_ID`: Staging service ID

**Vercel Deployment:**
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your organization ID
- `VERCEL_PROJECT_ID`: Project ID

**Environment Variables:**
- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_ANON_KEY`
- `STAGING_STRIPE_PUBLISHABLE_KEY`
- And all other staging-specific variables

## 🔄 CI/CD Pipeline

### Automated Deployments

The GitHub Actions workflow (`.github/workflows/staging-deploy.yml`) automatically:

1. **Runs on:**
   - Push to `staging` or `develop` branches
   - Pull requests to `main`

2. **Steps:**
   - ✅ Run tests and security scans
   - 🏗️ Build application
   - 🚀 Deploy to staging
   - 🧪 Run E2E tests
   - 📊 Performance audit
   - 🗃️ Database migrations

### Manual Deployment

```bash
# Full deployment process
npm run staging:deploy

# Individual steps
npm run test
npm run build:staging
npm run deploy:staging
npm run test:e2e:staging
```

## 🔍 Testing and Validation

### Pre-Deployment Checks

```bash
# Run all pre-deployment checks
npm run staging:check

# Individual checks
npm run test          # Unit tests
npm run lint          # Code linting
npm run type-check    # TypeScript validation
npm audit --audit-level=high  # Security audit
```

### Post-Deployment Validation

```bash
# Health check
curl https://hausofbasquiat-staging.railway.app/health

# API validation
curl https://hausofbasquiat-staging.railway.app/api/health

# Database connectivity
npm run db:check:staging
```

### E2E Testing

```bash
# Run E2E tests against staging
PLAYWRIGHT_BASE_URL=https://hausofbasquiat-staging.railway.app npm run e2e

# Run specific test suites
npm run e2e:auth
npm run e2e:posts
npm run e2e:messaging
```

## 📊 Monitoring and Debugging

### Health Monitoring

**Endpoints:**
- `/health` - Application health
- `/api/health` - API health
- `/nginx-status` - Nginx status (Docker only)

**Response Example:**
```json
{
  "status": "healthy",
  "environment": "staging",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "staging-abc123",
  "database": "connected",
  "redis": "connected"
}
```

### Performance Monitoring

**Lighthouse CI:**
```bash
npm run lighthouse:staging
```

**Metrics Tracked:**
- Performance Score
- Accessibility Score
- Best Practices Score
- SEO Score
- Core Web Vitals

### Error Tracking

**Sentry Configuration:**
```env
SENTRY_DSN=your_staging_sentry_dsn
SENTRY_ENVIRONMENT=staging
```

**Custom Error Logging:**
```javascript
// Staging-specific error handling
if (import.meta.env.VITE_APP_ENV === 'staging') {
  console.error('[STAGING]', error);
}
```

## 🔒 Security Considerations

### Staging-Specific Security

1. **Rate Limiting:** More lenient than production
2. **CORS:** Allows localhost and staging domains
3. **Authentication:** Uses test credentials
4. **File Uploads:** Smaller size limits

### Security Headers

```nginx
# Staging-specific headers
add_header X-Environment "staging" always;
add_header X-Robots-Tag "noindex, nofollow" always;
```

### Access Control

```bash
# IP restriction for sensitive endpoints
location /admin {
    allow 192.168.1.0/24;  # Office network
    allow 10.0.0.0/8;      # VPN network
    deny all;
}
```

## 🛠️ Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm ci
npm run build
```

**2. Database Connection Issues**
```bash
# Check database status
npm run db:status:staging

# Test connection
psql "postgresql://user:pass@host:5432/db" -c "SELECT version();"
```

**3. Environment Variable Issues**
```bash
# Validate environment
npm run env:check:staging

# Debug environment
node -e "console.log(process.env)" | grep VITE_
```

**4. Deployment Timeouts**
```bash
# Increase timeout in deploy script
MAX_WAIT_TIME=600  # 10 minutes

# Check deployment logs
railway logs --service staging
```

### Debug Mode

Enable debug mode for detailed logging:

```env
VITE_ENABLE_DEBUG=true
DEBUG=app:*
```

## 📈 Scaling and Optimization

### Performance Optimization

```bash
# Bundle analysis
npm run build:analyze

# Performance testing
npm run test:performance:staging
```

### Resource Scaling

**Railway:**
```bash
# Scale resources
railway up --service staging --replicas 2
```

**Docker:**
```yaml
# docker-compose.staging.yml
services:
  app:
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

## 🔄 Migration and Rollback

### Database Migrations

```bash
# Run migrations
npm run migrate:staging

# Rollback migration
npm run migrate:rollback:staging

# Reset database (destructive)
npm run db:reset:staging
```

### Application Rollback

**Railway:**
```bash
# Rollback to previous deployment
railway rollback --service staging
```

**Vercel:**
```bash
# Promote previous deployment
vercel promote --scope staging
```

## 📝 Best Practices

### 1. Branch Strategy
- `main` → production
- `staging` → staging environment
- `develop` → development features

### 2. Testing Strategy
- All PRs trigger staging deployment
- E2E tests run on every staging deployment
- Performance tests run nightly

### 3. Data Management
- Use anonymized production data
- Regular cleanup of test data
- Backup before major changes

### 4. Security
- Separate credentials for staging
- No production data in staging
- Regular security scans

## 🎯 Deployment Checklist

**Pre-Deployment:**
- [ ] Tests passing
- [ ] Security scan clean
- [ ] Environment variables configured
- [ ] Database migrations ready

**Deployment:**
- [ ] Build successful
- [ ] Health checks passing
- [ ] E2E tests passing
- [ ] Performance metrics acceptable

**Post-Deployment:**
- [ ] Smoke tests complete
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Documentation updated

## 🆘 Support and Resources

### Documentation
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Team Contacts
- **DevOps:** devops@hausofbasquiat.com
- **Backend:** backend@hausofbasquiat.com
- **Frontend:** frontend@hausofbasquiat.com

### Emergency Procedures
1. Check health endpoints
2. Review deployment logs
3. Contact on-call engineer
4. Escalate to team lead if needed

---

*Built with ❤️ for the ballroom and voguing community*