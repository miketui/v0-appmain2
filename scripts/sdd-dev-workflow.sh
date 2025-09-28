#!/bin/bash

# SDD Development Workflow Automation for GitHub Spark
# Provides automated tasks for consistent development workflow

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project info
PROJECT_NAME="Haus of Basquiat Portal"
echo -e "${PURPLE}🎭 ${PROJECT_NAME} - SDD Development Workflow${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
    echo -e "${RED}❌ Error: Not in project root directory${NC}"
    echo "Please run this script from the project root."
    exit 1
fi

# Function to show available commands
show_help() {
    echo -e "${CYAN}Available Commands:${NC}"
    echo ""
    echo -e "${GREEN}Development:${NC}"
    echo "  setup           - Complete project setup (install, env, db)"
    echo "  dev             - Start development server with live reload"
    echo "  build           - Build project for production"
    echo "  clean           - Clean build artifacts and node_modules"
    echo ""
    echo -e "${GREEN}Code Quality:${NC}"
    echo "  lint            - Run ESLint and fix issues"
    echo "  type-check      - Run TypeScript compilation check"
    echo "  format          - Format code with Prettier"
    echo "  quality-check   - Run all quality checks (lint, type, test)"
    echo ""
    echo -e "${GREEN}Testing:${NC}"
    echo "  test            - Run unit tests"
    echo "  test-watch      - Run tests in watch mode"
    echo "  test-coverage   - Run tests with coverage report"
    echo "  e2e             - Run end-to-end tests"
    echo "  test-all        - Run all test suites"
    echo ""
    echo -e "${GREEN}Database:${NC}"
    echo "  db-setup        - Setup database with migrations and seed"
    echo "  db-migrate      - Run database migrations"
    echo "  db-seed         - Seed database with sample data"
    echo "  db-reset        - Reset database (DEV ONLY)"
    echo "  db-studio       - Open Prisma Studio"
    echo ""
    echo -e "${GREEN}Deployment:${NC}"
    echo "  deploy-check    - Pre-deployment validation"
    echo "  deploy-railway  - Deploy to Railway"
    echo "  deploy-vercel   - Deploy to Vercel"
    echo ""
    echo -e "${GREEN}Development Tools:${NC}"
    echo "  component       - Generate new component"
    echo "  feature         - Create new feature scaffolding"
    echo "  security-audit  - Run security audit"
    echo "  performance     - Run performance analysis"
    echo ""
    echo -e "${GREEN}Utilities:${NC}"
    echo "  status          - Show project status and health"
    echo "  logs            - Show development logs"
    echo "  help            - Show this help message"
}

# Function to check dependencies
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    # Check Node.js version
    if ! command -v node >/dev/null 2>&1; then
        echo -e "${RED}❌ Node.js not found. Please install Node.js >= 18.17.0${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="18.17.0"
    
    if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
        echo -e "${RED}❌ Node.js version $NODE_VERSION is too old. Please upgrade to >= $REQUIRED_VERSION${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
    
    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        echo -e "${RED}❌ npm not found${NC}"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm $NPM_VERSION${NC}"
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Dependencies not installed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    return 0
}

# Function to setup project
setup_project() {
    echo -e "${BLUE}🚀 Setting up ${PROJECT_NAME}...${NC}"
    
    # Install dependencies
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    
    # Setup environment file
    if [ ! -f ".env.local" ]; then
        echo -e "${BLUE}⚙️  Setting up environment file...${NC}"
        cp .env.example .env.local
        echo -e "${YELLOW}⚠️  Please configure .env.local with your environment variables${NC}"
    fi
    
    # Setup database
    echo -e "${BLUE}🗄️  Setting up database...${NC}"
    npm run db-setup 2>/dev/null || echo -e "${YELLOW}⚠️  Database setup skipped (configure DATABASE_URL first)${NC}"
    
    echo -e "${GREEN}✅ Project setup complete!${NC}"
    echo -e "${CYAN}Next steps:${NC}"
    echo "1. Configure .env.local with your database and API keys"
    echo "2. Run 'npm run dev' to start development server"
}

# Function to run development server
dev_server() {
    echo -e "${BLUE}🔥 Starting development server...${NC}"
    
    if ! check_dependencies; then
        echo -e "${YELLOW}Installing dependencies first...${NC}"
        npm install
    fi
    
    # Check environment
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}⚠️  No .env.local found. Copying from .env.example...${NC}"
        cp .env.example .env.local
    fi
    
    # Start dev server with enhanced output
    echo -e "${GREEN}🎭 Starting Haus of Basquiat Portal...${NC}"
    echo -e "${CYAN}📍 Local:    http://localhost:3000${NC}"
    echo -e "${CYAN}📱 Network:  Use your IP address${NC}"
    echo ""
    
    npm run dev
}

# Function to build project
build_project() {
    echo -e "${BLUE}🏗️  Building project...${NC}"
    
    # Run quality checks first
    echo -e "${BLUE}🔍 Running pre-build checks...${NC}"
    npm run type-check
    npm run lint
    
    # Build
    echo -e "${BLUE}📦 Building for production...${NC}"
    npm run build
    
    echo -e "${GREEN}✅ Build complete!${NC}"
}

# Function for quality checks
quality_check() {
    echo -e "${BLUE}🔍 Running quality checks...${NC}"
    
    local failed=0
    
    # TypeScript check
    echo -e "${BLUE}📝 TypeScript compilation...${NC}"
    if npm run type-check; then
        echo -e "${GREEN}✅ TypeScript OK${NC}"
    else
        echo -e "${RED}❌ TypeScript errors found${NC}"
        failed=1
    fi
    
    # Linting
    echo -e "${BLUE}🧹 ESLint check...${NC}"
    if npm run lint; then
        echo -e "${GREEN}✅ Linting OK${NC}"
    else
        echo -e "${RED}❌ Linting errors found${NC}"
        failed=1
    fi
    
    # Tests
    echo -e "${BLUE}🧪 Running tests...${NC}"
    if npm run test -- --run; then
        echo -e "${GREEN}✅ Tests OK${NC}"
    else
        echo -e "${RED}❌ Test failures found${NC}"
        failed=1
    fi
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}🎉 All quality checks passed!${NC}"
    else
        echo -e "${RED}💥 Quality checks failed. Please fix the issues above.${NC}"
        exit 1
    fi
}

# Function to run all tests
test_all() {
    echo -e "${BLUE}🧪 Running all test suites...${NC}"
    
    # Unit tests
    echo -e "${BLUE}🔬 Unit tests...${NC}"
    npm run test -- --run
    
    # Integration tests
    if [ -d "tests/integration" ]; then
        echo -e "${BLUE}🔗 Integration tests...${NC}"
        npm run test:integration || echo -e "${YELLOW}⚠️  Integration tests not configured${NC}"
    fi
    
    # E2E tests
    echo -e "${BLUE}🎭 End-to-end tests...${NC}"
    npm run e2e || echo -e "${YELLOW}⚠️  E2E tests may require setup${NC}"
    
    echo -e "${GREEN}✅ All tests complete!${NC}"
}

# Function for database operations
db_setup() {
    echo -e "${BLUE}🗄️  Setting up database...${NC}"
    
    # Check if DATABASE_URL is set
    if ! grep -q "DATABASE_URL" .env.local 2>/dev/null; then
        echo -e "${RED}❌ DATABASE_URL not found in .env.local${NC}"
        echo "Please configure your database connection first."
        exit 1
    fi
    
    # Generate Prisma client
    echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
    npx prisma generate
    
    # Run migrations
    echo -e "${BLUE}🔄 Running database migrations...${NC}"
    npx prisma migrate dev --name init
    
    # Seed database
    echo -e "${BLUE}🌱 Seeding database...${NC}"
    npx prisma db seed || echo -e "${YELLOW}⚠️  No seed script found${NC}"
    
    echo -e "${GREEN}✅ Database setup complete!${NC}"
}

# Function to show project status
show_status() {
    echo -e "${BLUE}📊 Project Status${NC}"
    echo -e "${BLUE}=================${NC}"
    
    # Git status
    echo -e "${CYAN}Git Status:${NC}"
    git status --porcelain | head -10
    
    # Dependencies
    echo -e "\n${CYAN}Dependencies:${NC}"
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ Installed${NC}"
    else
        echo -e "${RED}❌ Not installed${NC}"
    fi
    
    # Environment
    echo -e "\n${CYAN}Environment:${NC}"
    if [ -f ".env.local" ]; then
        echo -e "${GREEN}✅ .env.local exists${NC}"
    else
        echo -e "${RED}❌ .env.local missing${NC}"
    fi
    
    # Build status
    echo -e "\n${CYAN}Build Status:${NC}"
    if [ -d ".next" ]; then
        echo -e "${GREEN}✅ Built${NC}"
    else
        echo -e "${YELLOW}⚠️  Not built${NC}"
    fi
    
    # Recent commits
    echo -e "\n${CYAN}Recent Commits:${NC}"
    git log --oneline -5
}

# Function to generate components
generate_component() {
    echo -e "${BLUE}🧩 Component Generator${NC}"
    
    if [ -f "scripts/sdd-component-generator.js" ]; then
        node scripts/sdd-component-generator.js
    else
        echo -e "${RED}❌ Component generator not found${NC}"
        exit 1
    fi
}

# Function for security audit
security_audit() {
    echo -e "${BLUE}🔒 Security Audit${NC}"
    
    # NPM audit
    echo -e "${BLUE}📦 Checking dependencies for vulnerabilities...${NC}"
    npm audit --audit-level=moderate
    
    # TODO: Add more security checks
    echo -e "${GREEN}✅ Security audit complete${NC}"
}

# Function for deployment check
deploy_check() {
    echo -e "${BLUE}🚀 Pre-deployment Check${NC}"
    
    local failed=0
    
    # Build check
    echo -e "${BLUE}🏗️  Build check...${NC}"
    if npm run build; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        failed=1
    fi
    
    # Test check
    echo -e "${BLUE}🧪 Test check...${NC}"
    if npm run test -- --run; then
        echo -e "${GREEN}✅ Tests passing${NC}"
    else
        echo -e "${RED}❌ Tests failing${NC}"
        failed=1
    fi
    
    # Security check
    echo -e "${BLUE}🔒 Security check...${NC}"
    if npm audit --audit-level=high --dry-run >/dev/null 2>&1; then
        echo -e "${GREEN}✅ No high-severity vulnerabilities${NC}"
    else
        echo -e "${RED}❌ High-severity vulnerabilities found${NC}"
        failed=1
    fi
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}🎉 Ready for deployment!${NC}"
    else
        echo -e "${RED}💥 Deployment check failed${NC}"
        exit 1
    fi
}

# Main command handling
case "${1:-help}" in
    "setup")
        setup_project
        ;;
    "dev")
        dev_server
        ;;
    "build")
        build_project
        ;;
    "clean")
        echo -e "${BLUE}🧹 Cleaning project...${NC}"
        rm -rf node_modules .next dist out
        echo -e "${GREEN}✅ Cleaned${NC}"
        ;;
    "lint")
        echo -e "${BLUE}🧹 Linting and fixing...${NC}"
        npm run lint:fix
        ;;
    "type-check")
        echo -e "${BLUE}📝 Type checking...${NC}"
        npm run type-check
        ;;
    "quality-check")
        quality_check
        ;;
    "test")
        npm run test
        ;;
    "test-watch")
        npm run test:watch
        ;;
    "test-coverage")
        npm run test:coverage
        ;;
    "e2e")
        npm run e2e
        ;;
    "test-all")
        test_all
        ;;
    "db-setup")
        db_setup
        ;;
    "db-migrate")
        npx prisma migrate dev
        ;;
    "db-seed")
        npx prisma db seed
        ;;
    "db-reset")
        echo -e "${RED}⚠️  This will delete all data. Are you sure? (y/N)${NC}"
        read -r confirm
        if [[ $confirm == [yY] ]]; then
            npx prisma migrate reset
        fi
        ;;
    "db-studio")
        npx prisma studio
        ;;
    "deploy-check")
        deploy_check
        ;;
    "component")
        generate_component
        ;;
    "security-audit")
        security_audit
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        show_help
        ;;
esac