# GitHub Workflow Permissions Guide

This document explains the permissions configuration for GitHub Actions workflows in this repository.

## Overview

GitHub Actions workflows require explicit permissions to access repository resources and external services. Without proper permissions, workflows may fail with permission errors when trying to:

- Read repository contents
- Write to security events (SARIF uploads)
- Push Docker images to registries  
- Create/update pull requests
- Manage deployment status
- Write test results and checks

## Permission Categories

### Core Permissions

- **`contents: read`** - Required to checkout repository code and read files
- **`contents: write`** - Required to create commits, tags, and modify repository content
- **`actions: read`** - Required to access workflow run information and artifacts
- **`checks: write`** - Required to create check runs and update test results

### Security & Quality

- **`security-events: write`** - Required to upload SARIF files from security scanners (CodeQL, ESLint, Trivy)
- **`packages: read`** - Required to read packages from registries
- **`packages: write`** - Required to push Docker images to GitHub Container Registry

### Deployment & Operations  

- **`deployments: write`** - Required to create and update deployment statuses
- **`pull-requests: write`** - Required to create, update, and comment on pull requests
- **`pages: write`** - Required to deploy to GitHub Pages
- **`id-token: write`** - Required for OIDC token generation with external services

## Workflow-Specific Permissions

### CI/CD Pipeline (`ci.yml`)
```yaml
permissions:
  contents: read
  security-events: write
  actions: read
  checks: write
  pull-requests: write
```

**Rationale:** Needs to read code, upload test results, and report security scan results.

### Production Deploy (`production-deploy.yml`)
```yaml
permissions:
  contents: read
  security-events: write
  actions: read
  checks: write
  deployments: write
  pull-requests: write
```

**Rationale:** Full deployment pipeline with security scanning, testing, and deployment status updates.

### Staging Deploy (`staging-deploy.yml`)
```yaml
permissions:
  contents: read
  security-events: write
  actions: read
  checks: write
  deployments: write
  pull-requests: write
  packages: read
```

**Rationale:** Similar to production but includes package reading for dependency management.

### Docker Deploy (`docker-deploy.yml`)
```yaml
permissions:
  contents: read
  packages: write
  deployments: write
  actions: read
```

**Rationale:** Builds and pushes Docker images, then deploys to multiple platforms.

### Security Scan (`security-scan.yml`)
```yaml
permissions:
  contents: read
  security-events: write
  actions: read
  checks: write
```

**Rationale:** Runs multiple security tools and uploads SARIF results to GitHub Security tab.

### Railway Deploy (`railway-deploy.yml`)
```yaml
permissions:
  contents: read
  deployments: write
  actions: read
  checks: write
```

**Rationale:** Deploys application to Railway platform with status updates.

### Visual Testing (`visual-testing.yml`)
```yaml
permissions:
  contents: read
  checks: write
  actions: read
```

**Rationale:** Runs screenshot tests and uploads visual regression results.

### Page Map Screenshots (`page-map-screenshots.yml`)
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

**Rationale:** Generates page screenshots and deploys to GitHub Pages.

## Best Practices

1. **Principle of Least Privilege**: Only grant the minimum permissions required for each workflow
2. **Job-Level Permissions**: Use job-level permissions for fine-grained control when needed
3. **Environment Protection**: Use environment protection rules for production deployments
4. **Secret Management**: Store sensitive tokens in GitHub Secrets, never in code
5. **Regular Audits**: Review and update permissions as workflows evolve

## Common Permission Errors

### "Resource not accessible by integration"
- **Cause**: Missing required permission
- **Solution**: Add the appropriate permission to the workflow or job

### "Package write forbidden" 
- **Cause**: Missing `packages: write` permission
- **Solution**: Add `packages: write` for Docker registry operations

### "SARIF upload failed"
- **Cause**: Missing `security-events: write` permission  
- **Solution**: Add `security-events: write` for security scan uploads

### "Cannot create deployment"
- **Cause**: Missing `deployments: write` permission
- **Solution**: Add `deployments: write` for deployment status updates

## Security Considerations

- **Token Scope**: GitHub tokens are automatically scoped to the repository
- **External Access**: Additional permissions may be needed for external service integrations
- **Branch Protection**: Some operations may require admin permissions on protected branches
- **Organization Settings**: Organization-level security settings may restrict available permissions

## Testing Permissions

To validate workflow permissions:

1. Check YAML syntax: `python3 -c "import yaml; yaml.safe_load(open('workflow.yml'))"`
2. Review GitHub Actions logs for permission errors
3. Test with minimal permissions first, then add as needed
4. Use `github.token` for authenticated API calls within workflows

## Migration Notes

When updating existing workflows:

1. **Backup**: Always backup working workflows before changes
2. **Gradual Rollout**: Test permission changes on feature branches first
3. **Monitor**: Watch for permission errors in workflow runs
4. **Documentation**: Update this guide when adding new workflows or permissions

---

*Last updated: $(date)*
*For questions or issues, please create an issue in this repository.*