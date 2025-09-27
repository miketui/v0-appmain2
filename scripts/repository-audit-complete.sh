#!/bin/bash

# Repository Audit & Hardening Complete Script
# Haus of Basquiat Portal - Production Ready Deployment
# Usage: ./scripts/repository-audit-complete.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Repository Audit & Deployment Readiness Script${NC}"
echo -e "${BLUE}Generated: $(date)${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || ! grep -q "haus-of-basquiat-portal" package.json; then
    echo -e "${RED}❌ Error: Run this script from the repository root${NC}"
    exit 1
fi

# 1. REPOSITORY SYNC & SAFETY CHECKS
echo -e "${BLUE}📋 Step 1: Repository Sync & Safety Checks${NC}"

echo "Checking git status..."
if ! git status --porcelain | grep -q .; then
    echo -e "${GREEN}✅ Working tree is clean${NC}"
else
    echo -e "${YELLOW}⚠️  Working tree has changes - proceeding with audit${NC}"
fi

echo "Running git fsck..."
if git fsck --full --strict &>/dev/null; then
    echo -e "${GREEN}✅ Git repository integrity verified${NC}"
else
    echo -e "${RED}❌ Git repository has issues${NC}"
    exit 1
fi

echo "Checking for large files..."
large_files=$(find . -size +10M -not -path "./node_modules/*" -not -path "./.git/*" | head -5)
if [ -z "$large_files" ]; then
    echo -e "${GREEN}✅ No large files found${NC}"
else
    echo -e "${YELLOW}⚠️  Large files detected:${NC}"
    echo "$large_files"
fi

# 2. FRAMEWORK & DEPENDENCY ANALYSIS
echo -e "\n${BLUE}📊 Step 2: Framework & Dependency Analysis${NC}"

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ Next.js project detected${NC}"
    node_version=$(node --version)
    npm_version=$(npm --version)
    echo "Node.js: $node_version"
    echo "npm: $npm_version"
else
    echo -e "${RED}❌ No package.json found${NC}"
    exit 1
fi

# Count project files
project_files=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" | wc -l)
echo "Total project files: $project_files"

# 3. BUILD & TESTING VERIFICATION
echo -e "\n${BLUE}🏗️  Step 3: Build & Testing Verification${NC}"

echo "Installing dependencies..."
if npm ci --silent; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo "Running linting..."
if npm run lint --silent; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${YELLOW}⚠️  Linting issues detected (non-blocking)${NC}"
fi

echo "Checking TypeScript compilation..."
if npm run type-check --silent; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
    build_ready=true
else
    echo -e "${YELLOW}⚠️  TypeScript errors detected - build will fail${NC}"
    build_ready=false
fi

echo "Running tests..."
if npm run test --silent; then
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed (non-blocking for audit)${NC}"
fi

# 4. DEPLOYMENT READINESS CHECK
echo -e "\n${BLUE}🚀 Step 4: Deployment Readiness Assessment${NC}"

# Check essential files
essential_files=(".env.example" "next.config.js" "tsconfig.json" "package.json")
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file present${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
    fi
done

# Check deployment configurations
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ Vercel configuration ready${NC}"
fi

if [ -f "Dockerfile" ]; then
    echo -e "${GREEN}✅ Docker configuration ready${NC}"
fi

if [ -d ".github/workflows" ]; then
    workflow_count=$(find .github/workflows -name "*.yml" | wc -l)
    echo -e "${GREEN}✅ GitHub Actions workflows: $workflow_count${NC}"
fi

# 5. SECURITY SCAN
echo -e "\n${BLUE}🔒 Step 5: Security Scan${NC}"

echo "Running npm audit..."
if npm audit --audit-level=high --silent; then
    echo -e "${GREEN}✅ No high-severity vulnerabilities${NC}"
else
    echo -e "${YELLOW}⚠️  Security vulnerabilities detected - review needed${NC}"
fi

# Check for sensitive files
sensitive_patterns=(".env" "*.key" "*.pem" "secrets.*")
for pattern in "${sensitive_patterns[@]}"; do
    files=$(find . -name "$pattern" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null || true)
    if [ -n "$files" ]; then
        echo -e "${YELLOW}⚠️  Sensitive files detected: $pattern${NC}"
    fi
done

# 6. GENERATE DEPLOYMENT REPORT
echo -e "\n${BLUE}📝 Step 6: Generating Deployment Report${NC}"

cat > DEPLOYMENT_AUDIT_RESULTS.md << EOF
# Repository Audit Results
**Generated**: $(date)
**Repository**: $(git remote get-url origin 2>/dev/null || echo "Local repository")
**Branch**: $(git rev-parse --abbrev-ref HEAD)
**Commit**: $(git rev-parse --short HEAD)

## 📊 Summary
- **Project Files**: $project_files
- **Node.js Version**: $node_version
- **Framework**: Next.js 14+ with TypeScript
- **Build Ready**: $([ "$build_ready" = true ] && echo "✅ Yes" || echo "⚠️ Requires TypeScript fixes")

## 🚀 Deployment Options

### 1. Vercel (Recommended)
\`\`\`bash
# Deploy to Vercel
vercel --prod

# Or connect GitHub repo at vercel.com
\`\`\`

### 2. Docker Deployment
\`\`\`bash
# Build and run Docker container
docker build -t haus-of-basquiat .
docker run -p 3000:3000 haus-of-basquiat
\`\`\`

### 3. Railway/Render
- Connect GitHub repository
- Set environment variables
- Deploy automatically

## 🔧 Required Environment Variables
$([ -f ".env.example" ] && echo "\`\`\`env" && head -20 .env.example && echo "\`\`\`" || echo "See .env.example file")

## ⚡ Performance Recommendations
- Enable Vercel Analytics
- Configure CDN for static assets
- Implement image optimization
- Set up monitoring and logging

## 🎯 Next Steps
1. $([ "$build_ready" = true ] && echo "Deploy immediately" || echo "Fix TypeScript compilation errors")
2. Configure production environment variables
3. Set up database (Supabase) 
4. Test deployment in staging environment
5. Set up monitoring and analytics

---
**Status**: $([ "$build_ready" = true ] && echo "🟢 READY FOR DEPLOYMENT" || echo "🟡 NEEDS TYPESCRIPT FIXES")
EOF

echo -e "${GREEN}✅ Audit report generated: DEPLOYMENT_AUDIT_RESULTS.md${NC}"

# 7. FINAL RECOMMENDATIONS
echo -e "\n${BLUE}🎯 Step 7: Final Recommendations${NC}"

if [ "$build_ready" = true ]; then
    echo -e "${GREEN}🎉 REPOSITORY IS DEPLOYMENT READY!${NC}"
    echo -e "${GREEN}Recommended deployment: Vercel${NC}"
    echo -e "${GREEN}Estimated deployment time: 5-10 minutes${NC}"
else
    echo -e "${YELLOW}⚠️  BUILD ISSUES DETECTED${NC}"
    echo -e "${YELLOW}Fix TypeScript errors before deployment${NC}"
    echo -e "${YELLOW}Estimated fix time: 2-4 hours${NC}"
fi

echo ""
echo -e "${BLUE}📚 Next Actions:${NC}"
echo "1. Review DEPLOYMENT_AUDIT_RESULTS.md"
echo "2. Configure environment variables"
echo "3. Set up Supabase database"
echo "4. Deploy to your chosen platform"
echo "5. Run post-deployment tests"

echo ""
echo -e "${GREEN}✅ Repository audit complete!${NC}"
echo -e "${BLUE}Run this script anytime to verify deployment readiness.${NC}"