#!/bin/bash
set -euo pipefail

echo "🧹 Starting comprehensive repository cleanup..."
echo "Removing unnecessary files and Vercel/Supabase references..."

# ============================================================================
# REMOVE REDUNDANT DEPLOYMENT DOCUMENTATION
# ============================================================================

echo "📚 Removing redundant deployment documentation..."

# Remove old deployment guides (keep only essential ones)
rm -f DEPLOYMENT-READY.md
rm -f DEPLOYMENT.md
rm -f DEPLOYMENT_GUIDE.md
rm -f DEPLOYMENT_READY.md
rm -f PRODUCTION_ASSESSMENT.md
rm -f PRODUCTION_READY.md
rm -f PRODUCTION_SETUP.md
rm -f STAGING-DEPLOYMENT.md
rm -f SUPABASE_DEPLOYMENT_GUIDE.md
rm -f VERCEL_DEPLOY.md

# Remove redundant status files
rm -f BACKEND_COMPLETE.md
rm -f COMPLETION_STATUS.md
rm -f IMPLEMENTATION_SUMMARY.md
rm -f INTEGRATION_DEMO.md
rm -f LIVE_INTEGRATION_SUCCESS.md
rm -f PAGES_DEMO.md
rm -f GEMINI.md

# Remove duplicate README files
rm -f "README 2.md"

# ============================================================================
# REMOVE VERCEL CONFIGURATION FILES
# ============================================================================

echo "🗑️  Removing Vercel configuration files..."

rm -f vercel.json
rm -f vercel.staging.json

# ============================================================================
# REMOVE STAGING AND REDUNDANT DOCKER FILES
# ============================================================================

echo "🐳 Cleaning up Docker and staging files..."

rm -f Dockerfile.staging
rm -f Dockerfile.backend
rm -f docker-compose.staging.yml
rm -f railway.staging.json

# Keep main Dockerfile and docker-compose.yml for Railway

# ============================================================================
# REMOVE DUPLICATE JAVASCRIPT FILES
# ============================================================================

echo "🔄 Removing duplicate JavaScript files..."

# Remove numbered duplicates (keep the clean versions)
rm -f "chat 2.js"
rm -f "documents 2.js"
rm -f "payments 2.js"
rm -f "posts 2.js"
rm -f "users 2.js"
rm -f "package 2.json"

# Remove individual API test files (redundant with main tests)
rm -f chat.js
rm -f documents.js
rm -f payments.js
rm -f posts.js
rm -f users.js

# ============================================================================
# REMOVE TEST FILES WITH SUPABASE REFERENCES
# ============================================================================

echo "🧪 Removing test files with Supabase references..."

rm -f test-supabase-connection.js
rm -f test-live-integration.js
rm -f test-backend.js

# ============================================================================
# REMOVE SUPABASE-SPECIFIC FILES
# ============================================================================

echo "🗄️  Removing Supabase-specific configuration files..."

rm -f supabase-auth-config.md
rm -f supabase-auth-setup.md
rm -f supabase-complete-setup.sql
rm -f supabase-realtime-functions.sql
rm -f supabase-setup.sql
rm -f supabase-storage-setup.sql
rm -f supabase-storage.sql
rm -f supabase-webhooks.sql
rm -f setup-admin.sql

# Remove monitoring files (we'll use Railway's built-in monitoring)
rm -f monitoring-dashboard.sql
rm -f monitoring-setup.md

# ============================================================================
# CLEAN UP APP-MAIN FOLDER
# ============================================================================

echo "📁 Cleaning up App-main folder..."

if [ -d "App-main" ]; then
    rm -rf App-main
fi

# ============================================================================
# REMOVE REDUNDANT E2E AND SPEC FILES
# ============================================================================

echo "🧪 Cleaning up test files..."

rm -f e2e_spec.js

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo "✅ Repository cleanup completed!"
echo ""
echo "📊 Removed file categories:"
echo "  • Redundant deployment documentation (10+ files)"
echo "  • Vercel configuration files (2 files)"
echo "  • Staging and redundant Docker files (4 files)"
echo "  • Duplicate JavaScript files (8+ files)"
echo "  • Supabase-specific files (10+ files)"
echo "  • Test files with old references (3 files)"
echo "  • Redundant folders and miscellaneous files"
echo ""
echo "📁 Kept essential files:"
echo "  • Main Dockerfile (for Railway deployment)"
echo "  • docker-compose.yml (for local development)"
echo "  • railway.json (Railway configuration)"
echo "  • render.yaml (Render alternative)"
echo "  • fly.toml (Fly.io alternative)"
echo "  • DEPLOYMENT_RUNBOOK.md (main deployment guide)"
echo "  • DATABASE_* guides (alternatives documentation)"
echo "  • Core application files"
echo ""
echo "🚀 Repository is now clean and ready for Railway deployment!"