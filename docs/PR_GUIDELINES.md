# Pull Request Guidelines

## PR Size and Scope Best Practices

Based on the experience from PR #13 (99 files changed, +2,395/-18,100 lines), here are guidelines for future architectural changes:

### ✅ Recommended PR Splitting Strategy

#### **Infrastructure Changes**
Split large infrastructure changes into focused PRs:

```bash
# PR 1: Docker and containerization
- Dockerfile
- Dockerfile.backend  
- docker-compose.yml
- .dockerignore

# PR 2: Build configuration
- next.config.js
- tsconfig.json updates
- package.json changes

# PR 3: Environment and security
- .env.example updates
- Security headers configuration
- Environment variable management
```

#### **Code Architecture Changes**
```bash
# PR 1: TypeScript improvements
- New type definitions
- Interface updates
- Type safety improvements

# PR 2: Authentication refactor
- Auth service updates
- Hook improvements
- Context provider changes

# PR 3: Legacy code cleanup
- Remove deprecated files
- Update imports
- Clean unused dependencies
```

#### **Documentation Updates**
```bash
# PR 1: Setup documentation
- COMPLETION_STATUS.md
- README updates
- Deployment guides

# PR 2: Integration documentation  
- API documentation
- Database schema docs
- Integration examples
```

### ⚠️ When Large PRs Are Acceptable

Large PRs are acceptable for:
- **Initial project setup** (bootstrap/scaffolding)
- **Major version upgrades** (Next.js 13 → 14)
- **Security patches** requiring multiple coordinated changes
- **End-of-cycle cleanup** before major releases

### 🎯 PR Size Guidelines

#### **Small PRs (Preferred)**
- **Files changed:** 1-10 files
- **Line changes:** <500 lines
- **Review time:** 15-30 minutes
- **Examples:** Bug fixes, feature additions, documentation updates

#### **Medium PRs (Use Sparingly)**
- **Files changed:** 11-25 files  
- **Line changes:** 500-2000 lines
- **Review time:** 1-2 hours
- **Examples:** Refactoring, new feature with multiple components

#### **Large PRs (Avoid When Possible)**
- **Files changed:** 25+ files
- **Line changes:** 2000+ lines
- **Review time:** 3+ hours
- **Examples:** Architectural changes, framework migrations

## Review Process Improvements

### **For Large PRs**
1. **Pre-review discussion:** Create GitHub issue describing the scope
2. **Architecture review:** Separate discussion of architectural decisions
3. **Incremental review:** Review in logical chunks, not all at once
4. **Multiple reviewers:** Assign domain experts for different areas
5. **Demo/walkthrough:** Schedule live walkthrough for complex changes

### **Documentation Requirements**
Large PRs (>25 files) must include:
- [ ] **Migration guide** for existing developers
- [ ] **Rollback plan** if deployment fails
- [ ] **Testing checklist** for QA verification
- [ ] **Performance impact** analysis
- [ ] **Security review** checklist

### **Commit Organization**
Structure commits logically for easier review:
```bash
feat(docker): add production-ready containerization
feat(config): add security headers and optimization  
feat(auth): improve TypeScript interfaces and error handling
cleanup: remove legacy React SPA components
docs: add comprehensive deployment and setup guides
```

## Quality Gates

### **Pre-PR Checklist**
Before opening large PRs:
- [ ] **Build passes** locally
- [ ] **Tests pass** (or test plan documented)
- [ ] **Type checking** passes
- [ ] **Linting** passes
- [ ] **Security scan** completed
- [ ] **Performance impact** evaluated

### **Review Requirements**
Large PRs require:
- [ ] **2+ approvals** from team leads
- [ ] **Security review** if touching auth/permissions
- [ ] **Performance review** if affecting core functionality
- [ ] **Documentation review** for public APIs

## Future Architecture Changes

### **Recommended Split for Common Changes**

#### **Database Schema Updates**
```bash
# PR 1: Schema changes
- Migration files
- Prisma schema updates

# PR 2: Application layer
- Updated types
- Service layer changes

# PR 3: UI updates
- Form updates
- Component changes
```

#### **New Feature Development**
```bash
# PR 1: Backend/API
- tRPC routes
- Database operations
- Server-side logic

# PR 2: Frontend components
- UI components
- Client-side state
- Styling

# PR 3: Integration & testing
- End-to-end integration
- Test coverage
- Documentation
```

---

## Tools and Automation

### **PR Size Monitoring**
Consider adding GitHub Actions to:
- **Flag large PRs** for special review process
- **Enforce PR templates** for large changes
- **Auto-assign reviewers** based on changed files

### **Review Tools**
- **GitHub CodeSee** for architectural visualization
- **Danger.js** for automated PR checks
- **SonarCloud** for code quality gates

---

*These guidelines help maintain code quality while enabling rapid development for the ballroom community platform.*