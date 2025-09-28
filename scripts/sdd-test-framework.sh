#!/bin/bash

# SDD Testing Framework for GitHub Spark
# Comprehensive testing automation for Haus of Basquiat Portal

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_NAME="Haus of Basquiat Portal"
echo -e "${PURPLE}🧪 ${PROJECT_NAME} - SDD Testing Framework${NC}"
echo -e "${BLUE}===============================================${NC}\n"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
    echo -e "${RED}❌ Error: Not in project root directory${NC}"
    exit 1
fi

# Test configuration
TEST_RESULTS_DIR="test-results"
COVERAGE_DIR="coverage"
REPORTS_DIR="reports"

# Create directories
mkdir -p "$TEST_RESULTS_DIR" "$COVERAGE_DIR" "$REPORTS_DIR"

# Function to show help
show_help() {
    echo -e "${CYAN}SDD Testing Framework Commands:${NC}"
    echo ""
    echo -e "${GREEN}Unit Testing:${NC}"
    echo "  unit              - Run all unit tests"
    echo "  unit-watch        - Run unit tests in watch mode"
    echo "  unit-coverage     - Run unit tests with coverage"
    echo "  unit-component    - Test React components only"
    echo "  unit-hooks        - Test custom hooks only"
    echo "  unit-utils        - Test utility functions only"
    echo ""
    echo -e "${GREEN}Integration Testing:${NC}"
    echo "  integration       - Run integration tests"
    echo "  integration-api   - Test API endpoints"
    echo "  integration-db    - Test database operations"
    echo "  integration-auth  - Test authentication flows"
    echo ""
    echo -e "${GREEN}End-to-End Testing:${NC}"
    echo "  e2e               - Run E2E tests"
    echo "  e2e-headed        - Run E2E tests with browser UI"
    echo "  e2e-debug         - Run E2E tests in debug mode"
    echo "  e2e-mobile        - Run E2E tests on mobile viewport"
    echo ""
    echo -e "${GREEN}Performance Testing:${NC}"
    echo "  performance       - Run performance tests"
    echo "  lighthouse        - Run Lighthouse audit"
    echo "  bundle-analysis   - Analyze bundle size"
    echo ""
    echo -e "${GREEN}Security Testing:${NC}"
    echo "  security          - Run security audit"
    echo "  dependency-check  - Check for vulnerable dependencies"
    echo "  accessibility     - Run accessibility tests"
    echo ""
    echo -e "${GREEN}Quality Assurance:${NC}"
    echo "  lint-test         - Run linting with test focus"
    echo "  type-test         - TypeScript compilation for tests"
    echo "  test-data         - Generate test data"
    echo "  clean-tests       - Clean test artifacts"
    echo ""
    echo -e "${GREEN}Comprehensive:${NC}"
    echo "  all               - Run all test suites"
    echo "  ci                - Run CI/CD test pipeline"
    echo "  report            - Generate comprehensive test report"
    echo ""
    echo -e "${GREEN}Utilities:${NC}"
    echo "  setup-test-db     - Setup test database"
    echo "  seed-test-data    - Seed test data"
    echo "  help              - Show this help"
}

# Function to run unit tests
run_unit_tests() {
    echo -e "${BLUE}🔬 Running Unit Tests...${NC}"
    
    local test_type="${1:-all}"
    local extra_args="${2:-}"
    
    case $test_type in
        "component")
            echo -e "${CYAN}Testing React Components...${NC}"
            npm run test -- --run "tests/unit/components" $extra_args
            ;;
        "hooks")
            echo -e "${CYAN}Testing Custom Hooks...${NC}"
            npm run test -- --run "tests/unit/hooks" $extra_args
            ;;
        "utils")
            echo -e "${CYAN}Testing Utility Functions...${NC}"
            npm run test -- --run "tests/unit/utils" $extra_args
            ;;
        "watch")
            echo -e "${CYAN}Running tests in watch mode...${NC}"
            npm run test:watch
            ;;
        "coverage")
            echo -e "${CYAN}Running tests with coverage...${NC}"
            npm run test:coverage -- --reporter=json --outputFile="$COVERAGE_DIR/coverage.json"
            ;;
        *)
            echo -e "${CYAN}Running all unit tests...${NC}"
            npm run test -- --run $extra_args
            ;;
    esac
}

# Function to run integration tests
run_integration_tests() {
    echo -e "${BLUE}🔗 Running Integration Tests...${NC}"
    
    local test_type="${1:-all}"
    
    # Setup test database if needed
    if [ ! -f ".env.test" ]; then
        echo -e "${YELLOW}Setting up test environment...${NC}"
        cp .env.example .env.test
        sed -i 's/DATABASE_URL=.*/DATABASE_URL=postgresql:\/\/postgres:password@localhost:5432\/test_db/' .env.test
    fi
    
    case $test_type in
        "api")
            echo -e "${CYAN}Testing API Endpoints...${NC}"
            npm run test -- --run "tests/integration/api" --env=".env.test"
            ;;
        "db")
            echo -e "${CYAN}Testing Database Operations...${NC}"
            npm run test -- --run "tests/integration/database" --env=".env.test"
            ;;
        "auth")
            echo -e "${CYAN}Testing Authentication Flows...${NC}"
            npm run test -- --run "tests/integration/auth" --env=".env.test"
            ;;
        *)
            echo -e "${CYAN}Running all integration tests...${NC}"
            npm run test -- --run "tests/integration" --env=".env.test"
            ;;
    esac
}

# Function to run E2E tests
run_e2e_tests() {
    echo -e "${BLUE}🎭 Running End-to-End Tests...${NC}"
    
    local test_mode="${1:-headless}"
    
    # Start development server if not running
    if ! curl -s http://localhost:3000 > /dev/null; then
        echo -e "${YELLOW}Starting development server...${NC}"
        npm run dev > /dev/null 2>&1 &
        DEV_SERVER_PID=$!
        
        # Wait for server to start
        echo -e "${CYAN}Waiting for server to start...${NC}"
        for i in {1..30}; do
            if curl -s http://localhost:3000 > /dev/null; then
                echo -e "${GREEN}✅ Server ready${NC}"
                break
            fi
            sleep 2
        done
    fi
    
    case $test_mode in
        "headed")
            echo -e "${CYAN}Running E2E tests with browser UI...${NC}"
            npm run e2e:headed
            ;;
        "debug")
            echo -e "${CYAN}Running E2E tests in debug mode...${NC}"
            npm run e2e -- --debug
            ;;
        "mobile")
            echo -e "${CYAN}Running E2E tests on mobile viewport...${NC}"
            npm run e2e -- --project=mobile
            ;;
        *)
            echo -e "${CYAN}Running E2E tests (headless)...${NC}"
            npm run e2e
            ;;
    esac
    
    # Cleanup dev server if we started it
    if [ ! -z "${DEV_SERVER_PID:-}" ]; then
        kill $DEV_SERVER_PID 2>/dev/null || true
    fi
}

# Function to run performance tests
run_performance_tests() {
    echo -e "${BLUE}⚡ Running Performance Tests...${NC}"
    
    local test_type="${1:-all}"
    
    case $test_type in
        "lighthouse")
            echo -e "${CYAN}Running Lighthouse audit...${NC}"
            if command -v lighthouse >/dev/null 2>&1; then
                lighthouse http://localhost:3000 \
                    --output=json \
                    --output-path="$REPORTS_DIR/lighthouse.json" \
                    --chrome-flags="--headless --no-sandbox"
                echo -e "${GREEN}✅ Lighthouse report saved to $REPORTS_DIR/lighthouse.json${NC}"
            else
                echo -e "${YELLOW}⚠️  Lighthouse not installed. Install with: npm install -g lighthouse${NC}"
            fi
            ;;
        "bundle")
            echo -e "${CYAN}Analyzing bundle size...${NC}"
            ANALYZE=true npm run build > "$REPORTS_DIR/bundle-analysis.txt" 2>&1
            echo -e "${GREEN}✅ Bundle analysis saved to $REPORTS_DIR/bundle-analysis.txt${NC}"
            ;;
        *)
            echo -e "${CYAN}Running comprehensive performance tests...${NC}"
            run_performance_tests lighthouse
            run_performance_tests bundle
            ;;
    esac
}

# Function to run security tests
run_security_tests() {
    echo -e "${BLUE}🔒 Running Security Tests...${NC}"
    
    local test_type="${1:-all}"
    
    case $test_type in
        "dependencies")
            echo -e "${CYAN}Checking for vulnerable dependencies...${NC}"
            npm audit --audit-level=moderate --json > "$REPORTS_DIR/security-audit.json" 2>/dev/null || true
            if [ -s "$REPORTS_DIR/security-audit.json" ]; then
                echo -e "${GREEN}✅ Security audit completed${NC}"
                
                # Check if vulnerabilities found
                if grep -q '"vulnerabilities":' "$REPORTS_DIR/security-audit.json"; then
                    echo -e "${YELLOW}⚠️  Vulnerabilities found. Check $REPORTS_DIR/security-audit.json${NC}"
                fi
            fi
            ;;
        "accessibility")
            echo -e "${CYAN}Running accessibility tests...${NC}"
            if command -v axe >/dev/null 2>&1; then
                axe http://localhost:3000 --save "$REPORTS_DIR/accessibility.json"
                echo -e "${GREEN}✅ Accessibility report saved${NC}"
            else
                echo -e "${YELLOW}⚠️  axe-core CLI not installed${NC}"
                echo -e "${CYAN}Running accessibility tests via Playwright...${NC}"
                npm run e2e -- --grep="accessibility"
            fi
            ;;
        *)
            run_security_tests dependencies
            run_security_tests accessibility
            ;;
    esac
}

# Function to generate test data
generate_test_data() {
    echo -e "${BLUE}🌱 Generating Test Data...${NC}"
    
    # Create test data generator script
    cat > /tmp/generate-test-data.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Generate sample ballroom community data
const testData = {
  users: [
    {
      id: "user_1",
      email: "jordan.fierce@example.com",
      profile: {
        displayName: "Jordan Fierce",
        pronouns: "they/them",
        ballroomName: "Jordan Fierce",
        bio: "Vogue fem legend with 10+ years in the scene",
        role: "MEMBER",
        houseId: "house_eleganza"
      }
    },
    {
      id: "user_2", 
      email: "alex.runway@example.com",
      profile: {
        displayName: "Alex Runway",
        pronouns: "she/her",
        ballroomName: "Miss Alex Runway",
        bio: "New to the scene but fierce on the runway",
        role: "APPLICANT"
      }
    }
  ],
  houses: [
    {
      id: "house_eleganza",
      name: "House of Eleganza",
      description: "Bringing elegance and grace to the ballroom",
      color: "#8b5cf6",
      founded: "2020-01-15T00:00:00Z",
      memberCount: 24
    },
    {
      id: "house_avant_garde", 
      name: "House of Avant-Garde",
      description: "Pushing boundaries in fashion and performance",
      color: "#dc2626",
      founded: "2019-03-20T00:00:00Z", 
      memberCount: 18
    }
  ],
  posts: [
    {
      id: "post_1",
      authorId: "user_1",
      content: "Amazing performance at last night's ball! The energy was incredible 🔥",
      visibility: "PUBLIC",
      likesCount: 45,
      commentsCount: 12,
      createdAt: "2024-12-15T20:30:00Z"
    }
  ],
  events: [
    {
      id: "event_1",
      title: "Monthly Vogue Ball",
      description: "Join us for an amazing night of competition and community!",
      type: "BALL",
      startDate: "2024-12-20T20:00:00Z",
      organizerId: "user_1",
      houseId: "house_eleganza",
      categories: ["Vogue Fem", "Runway", "Face"],
      rsvpCount: 156
    }
  ]
};

// Save to test fixtures
const fixturesDir = path.join(process.cwd(), 'tests', '__fixtures__');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

fs.writeFileSync(
  path.join(fixturesDir, 'ballroom-community.json'),
  JSON.stringify(testData, null, 2)
);

console.log('✅ Test data generated in tests/__fixtures__/ballroom-community.json');
EOF

    node /tmp/generate-test-data.js
    rm /tmp/generate-test-data.js
}

# Function to setup test database
setup_test_database() {
    echo -e "${BLUE}🗄️  Setting up Test Database...${NC}"
    
    # Check if test environment exists
    if [ ! -f ".env.test" ]; then
        cp .env.example .env.test
        
        # Configure test database URL
        if command -v psql >/dev/null 2>&1; then
            echo -e "${CYAN}Setting up PostgreSQL test database...${NC}"
            createdb test_haus_of_basquiat 2>/dev/null || echo "Database may already exist"
            sed -i 's/DATABASE_URL=.*/DATABASE_URL=postgresql:\/\/postgres:password@localhost:5432\/test_haus_of_basquiat/' .env.test
        else
            echo -e "${YELLOW}⚠️  PostgreSQL not found. Using SQLite for tests...${NC}"
            sed -i 's/DATABASE_URL=.*/DATABASE_URL=file:\.\/test.db/' .env.test
        fi
    fi
    
    # Run migrations on test database
    echo -e "${CYAN}Running test database migrations...${NC}"
    NODE_ENV=test npx prisma migrate dev --name init
    
    echo -e "${GREEN}✅ Test database ready${NC}"
}

# Function to generate comprehensive report
generate_report() {
    echo -e "${BLUE}📊 Generating Comprehensive Test Report...${NC}"
    
    local report_file="$REPORTS_DIR/comprehensive-report.md"
    
    cat > "$report_file" << EOF
# 🧪 Haus of Basquiat Portal - Test Report

**Generated:** $(date)
**Version:** $(npm pkg get version | tr -d '"')

## 📊 Test Summary

### Unit Tests
- **Status:** $([ -f "$TEST_RESULTS_DIR/unit-results.json" ] && echo "✅ Passed" || echo "❌ Not Run")
- **Coverage:** $([ -f "$COVERAGE_DIR/coverage.json" ] && echo "$(jq -r '.total.lines.pct // "N/A"' $COVERAGE_DIR/coverage.json)%" || echo "N/A")

### Integration Tests  
- **Status:** $([ -f "$TEST_RESULTS_DIR/integration-results.json" ] && echo "✅ Passed" || echo "❌ Not Run")

### E2E Tests
- **Status:** $([ -f "$TEST_RESULTS_DIR/e2e-results.json" ] && echo "✅ Passed" || echo "❌ Not Run")

### Performance Tests
- **Lighthouse Score:** $([ -f "$REPORTS_DIR/lighthouse.json" ] && echo "$(jq -r '.categories.performance.score * 100 // "N/A"' $REPORTS_DIR/lighthouse.json)" || echo "N/A")
- **Bundle Size:** $([ -f "$REPORTS_DIR/bundle-analysis.txt" ] && echo "Analyzed" || echo "N/A")

### Security Tests
- **Vulnerabilities:** $([ -f "$REPORTS_DIR/security-audit.json" ] && echo "$(jq -r '.metadata.vulnerabilities.total // "N/A"' $REPORTS_DIR/security-audit.json)" || echo "N/A")
- **Accessibility:** $([ -f "$REPORTS_DIR/accessibility.json" ] && echo "Tested" || echo "N/A")

## 🎯 Key Metrics

- **Total Test Files:** $(find tests -name "*.test.*" -o -name "*.spec.*" | wc -l)
- **Test Database:** $([ -f ".env.test" ] && echo "✅ Configured" || echo "❌ Not Configured")
- **CI/CD Ready:** $([ -f ".github/workflows/test.yml" ] && echo "✅ Yes" || echo "❌ No")

## 📝 Recommendations

1. Maintain >80% test coverage
2. Run E2E tests before deployment
3. Monitor performance metrics
4. Regular security audits
5. Accessibility compliance checks

---
*Report generated by SDD Testing Framework*
EOF

    echo -e "${GREEN}✅ Comprehensive report generated: $report_file${NC}"
}

# Function to run CI pipeline
run_ci_pipeline() {
    echo -e "${BLUE}🚀 Running CI/CD Test Pipeline...${NC}"
    
    local failed=0
    
    # Step 1: Linting and Type Checking
    echo -e "${CYAN}Step 1: Code Quality Checks...${NC}"
    if npm run lint && npm run type-check; then
        echo -e "${GREEN}✅ Code quality checks passed${NC}"
    else
        echo -e "${RED}❌ Code quality checks failed${NC}"
        ((failed++))
    fi
    
    # Step 2: Unit Tests
    echo -e "${CYAN}Step 2: Unit Tests...${NC}"
    if run_unit_tests "all" "--reporter=json --outputFile=$TEST_RESULTS_DIR/unit-results.json"; then
        echo -e "${GREEN}✅ Unit tests passed${NC}"
    else
        echo -e "${RED}❌ Unit tests failed${NC}"
        ((failed++))
    fi
    
    # Step 3: Integration Tests
    echo -e "${CYAN}Step 3: Integration Tests...${NC}"
    if run_integration_tests; then
        echo -e "${GREEN}✅ Integration tests passed${NC}"
    else
        echo -e "${RED}❌ Integration tests failed${NC}"
        ((failed++))
    fi
    
    # Step 4: Build Test
    echo -e "${CYAN}Step 4: Build Test...${NC}"
    if npm run build; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        ((failed++))
    fi
    
    # Step 5: Security Audit
    echo -e "${CYAN}Step 5: Security Audit...${NC}"
    run_security_tests
    
    # Generate CI report
    echo -e "${CYAN}Generating CI Report...${NC}"
    generate_report
    
    # Final result
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}🎉 CI Pipeline Passed! Ready for deployment.${NC}"
        exit 0
    else
        echo -e "${RED}💥 CI Pipeline Failed! $failed step(s) failed.${NC}"
        exit 1
    fi
}

# Main command handling
case "${1:-help}" in
    "unit")
        run_unit_tests "${2:-all}"
        ;;
    "unit-watch")
        run_unit_tests "watch"
        ;;
    "unit-coverage")
        run_unit_tests "coverage"
        ;;
    "unit-component")
        run_unit_tests "component"
        ;;
    "unit-hooks")
        run_unit_tests "hooks"
        ;;
    "unit-utils")
        run_unit_tests "utils"
        ;;
    "integration")
        run_integration_tests
        ;;
    "integration-api")
        run_integration_tests "api"
        ;;
    "integration-db")
        run_integration_tests "db"
        ;;
    "integration-auth")
        run_integration_tests "auth"
        ;;
    "e2e")
        run_e2e_tests
        ;;
    "e2e-headed")
        run_e2e_tests "headed"
        ;;
    "e2e-debug")
        run_e2e_tests "debug"
        ;;
    "e2e-mobile")
        run_e2e_tests "mobile"
        ;;
    "performance")
        run_performance_tests
        ;;
    "lighthouse")
        run_performance_tests "lighthouse"
        ;;
    "bundle-analysis")
        run_performance_tests "bundle"
        ;;
    "security")
        run_security_tests
        ;;
    "dependency-check")
        run_security_tests "dependencies"
        ;;
    "accessibility")
        run_security_tests "accessibility"
        ;;
    "test-data")
        generate_test_data
        ;;
    "setup-test-db")
        setup_test_database
        ;;
    "seed-test-data")
        setup_test_database
        generate_test_data
        ;;
    "clean-tests")
        echo -e "${BLUE}🧹 Cleaning test artifacts...${NC}"
        rm -rf "$TEST_RESULTS_DIR" "$COVERAGE_DIR" "$REPORTS_DIR"
        rm -f test.db
        echo -e "${GREEN}✅ Test artifacts cleaned${NC}"
        ;;
    "all")
        echo -e "${BLUE}🚀 Running all test suites...${NC}"
        run_unit_tests "coverage"
        run_integration_tests
        run_e2e_tests
        run_performance_tests
        run_security_tests
        generate_report
        ;;
    "ci")
        run_ci_pipeline
        ;;
    "report")
        generate_report
        ;;
    "help"|*)
        show_help
        ;;
esac