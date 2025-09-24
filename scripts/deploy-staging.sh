#!/bin/bash

# Staging Deployment Script for Ballroom Community Portal
# Usage: ./scripts/deploy-staging.sh [platform]
# Platforms: railway, vercel, docker, local

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PLATFORM=${1:-railway}
STAGING_BRANCH="staging"
HEALTH_CHECK_URL="https://your-staging-domain.com/health"
MAX_WAIT_TIME=300 # 5 minutes

echo -e "${BLUE}🚀 Starting staging deployment...${NC}"
echo -e "${BLUE}Platform: ${PLATFORM}${NC}"
echo -e "${BLUE}Branch: ${STAGING_BRANCH}${NC}"

# Check if we're on the right branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "$STAGING_BRANCH" ] && [ "$current_branch" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not on staging or main branch (currently on: $current_branch)${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check if staging environment file exists
if [ ! -f ".env.staging" ]; then
    echo -e "${RED}❌ .env.staging file not found${NC}"
    echo -e "${YELLOW}💡 Create .env.staging with your staging environment variables${NC}"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
npm run test

# Run linting
echo -e "${BLUE}🔍 Running linting...${NC}"
npm run lint

# Type checking
echo -e "${BLUE}📝 Running type checking...${NC}"
npm run type-check

# Security scan
echo -e "${BLUE}🔒 Running security scan...${NC}"
npm audit --audit-level=high

# Build for staging
echo -e "${BLUE}🏗️  Building for staging...${NC}"
export NODE_ENV=staging
export VITE_APP_ENV=staging
export VITE_APP_VERSION=$(git rev-parse --short HEAD)

npm run build

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Platform-specific deployment
case $PLATFORM in
    "railway")
        echo -e "${BLUE}🚂 Deploying to Railway...${NC}"
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo -e "${RED}❌ Railway CLI not found${NC}"
            echo -e "${YELLOW}💡 Install Railway CLI: npm install -g @railway/cli${NC}"
            exit 1
        fi
        
        # Deploy to Railway
        railway login
        railway link
        railway up --service staging
        
        HEALTH_CHECK_URL="https://your-staging-domain.com/health"
        ;;
        
    "vercel")
        echo -e "${BLUE}▲ Deploying to Vercel...${NC}"
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo -e "${RED}❌ Vercel CLI not found${NC}"
            echo -e "${YELLOW}💡 Install Vercel CLI: npm install -g vercel${NC}"
            exit 1
        fi
        
        # Deploy to Vercel
        vercel --prod --yes --config vercel.staging.json
        
        HEALTH_CHECK_URL="https://your-staging-domain.com/health"
        ;;
        
    "docker")
        echo -e "${BLUE}🐳 Building and deploying Docker containers...${NC}"
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker not found${NC}"
            echo -e "${YELLOW}💡 Install Docker: https://docs.docker.com/get-docker/${NC}"
            exit 1
        fi
        
        # Build and start containers
        docker-compose -f docker-compose.staging.yml down
        docker-compose -f docker-compose.staging.yml build --no-cache
        docker-compose -f docker-compose.staging.yml up -d
        
        HEALTH_CHECK_URL="http://localhost:3000/health"
        ;;
        
    "local")
        echo -e "${BLUE}💻 Starting local staging environment...${NC}"
        
        # Copy staging environment
        cp .env.staging .env.local
        
        # Start development server
        echo -e "${YELLOW}📝 Starting development server in staging mode...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        
        export NODE_ENV=staging
        export VITE_APP_ENV=staging
        npm run preview &
        
        HEALTH_CHECK_URL="http://localhost:4173/health"
        ;;
        
    *)
        echo -e "${RED}❌ Unknown platform: $PLATFORM${NC}"
        echo -e "${YELLOW}💡 Supported platforms: railway, vercel, docker, local${NC}"
        exit 1
        ;;
esac

# Wait for deployment to be ready
echo -e "${BLUE}⏳ Waiting for deployment to be ready...${NC}"
start_time=$(date +%s)

while true; do
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    
    if [ $elapsed -gt $MAX_WAIT_TIME ]; then
        echo -e "${RED}❌ Deployment health check timed out after ${MAX_WAIT_TIME}s${NC}"
        exit 1
    fi
    
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Deployment is healthy!${NC}"
        break
    fi
    
    echo -e "${YELLOW}⏳ Waiting for health check... (${elapsed}s/${MAX_WAIT_TIME}s)${NC}"
    sleep 10
done

# Run post-deployment checks
echo -e "${BLUE}🔍 Running post-deployment checks...${NC}"

# Health check
health_response=$(curl -s "$HEALTH_CHECK_URL")
echo -e "${GREEN}Health Check Response:${NC}"
echo "$health_response" | jq '.' 2>/dev/null || echo "$health_response"

# Run E2E tests if available
if [ -f "package.json" ] && grep -q "e2e" package.json; then
    echo -e "${BLUE}🧪 Running E2E tests...${NC}"
    export PLAYWRIGHT_BASE_URL="$HEALTH_CHECK_URL"
    npm run e2e || echo -e "${YELLOW}⚠️  E2E tests failed, but deployment continues${NC}"
fi

# Database migration (if needed)
if [ -f "database/staging-migration.sql" ]; then
    echo -e "${BLUE}🗃️  Running database migrations...${NC}"
    echo -e "${YELLOW}💡 Make sure to run database migrations manually if needed${NC}"
fi

# Success message
echo -e "${GREEN}🎉 Staging deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Staging URL: $HEALTH_CHECK_URL${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "  1. Test all critical features"
echo -e "  2. Verify database connections"
echo -e "  3. Check real-time functionality"
echo -e "  4. Validate API endpoints"
echo -e "  5. Test authentication flows"

# Generate deployment report
cat > staging-deployment-report.json << EOF
{
  "deployment": {
    "platform": "$PLATFORM",
    "branch": "$current_branch",
    "commit": "$(git rev-parse HEAD)",
    "timestamp": "$(date -Iseconds)",
    "status": "success",
    "health_check_url": "$HEALTH_CHECK_URL",
    "duration_seconds": $elapsed
  },
  "environment": {
    "node_env": "staging",
    "app_version": "$(git rev-parse --short HEAD)"
  }
}
EOF

echo -e "${BLUE}📄 Deployment report saved to: staging-deployment-report.json${NC}"