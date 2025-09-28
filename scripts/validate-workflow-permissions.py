#!/usr/bin/env python3
"""
Validate GitHub Actions workflow permissions.

This script checks all workflow files in .github/workflows/ to ensure they have
appropriate permissions configured for their operations.
"""

import os
import yaml
import sys
from pathlib import Path

# Define expected permissions for different types of operations
OPERATION_PERMISSIONS = {
    'security_scan': ['contents', 'security-events'],
    'docker_build': ['contents', 'packages'],
    'deployment': ['contents', 'deployments'],
    'testing': ['contents', 'checks'],
    'pull_request': ['contents', 'pull-requests'],
    'pages': ['contents', 'pages', 'id-token'],
}

# Keywords that suggest certain operations
OPERATION_KEYWORDS = {
    'security_scan': ['sarif', 'codeql', 'security', 'vulnerability', 'audit'],
    'docker_build': ['docker', 'registry', 'ghcr.io', 'packages'],
    'deployment': ['deploy', 'railway', 'vercel', 'render', 'production'],
    'testing': ['test', 'check', 'lint', 'coverage'],
    'pull_request': ['pull_request', 'pr'],
    'pages': ['pages', 'github-pages'],
}

def load_workflow(filepath):
    """Load and parse a workflow YAML file."""
    try:
        with open(filepath, 'r') as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"❌ Error loading {filepath}: {e}")
        return None

def detect_operations(workflow_content):
    """Detect what operations a workflow performs based on keywords."""
    operations = set()
    content_str = str(workflow_content).lower()
    
    for operation, keywords in OPERATION_KEYWORDS.items():
        if any(keyword in content_str for keyword in keywords):
            operations.add(operation)
    
    return operations

def check_permissions(workflow_content, detected_operations):
    """Check if workflow has appropriate permissions for detected operations."""
    issues = []
    
    # Get workflow-level permissions
    workflow_permissions = workflow_content.get('permissions', {})
    
    # Check each detected operation
    for operation in detected_operations:
        required_perms = OPERATION_PERMISSIONS.get(operation, [])
        
        for perm in required_perms:
            if perm not in workflow_permissions:
                issues.append(f"Missing '{perm}' permission for {operation} operations")
    
    return issues

def validate_workflow_file(filepath):
    """Validate a single workflow file."""
    print(f"\n📋 Checking {filepath.name}...")
    
    workflow = load_workflow(filepath)
    if not workflow:
        return False
    
    # Check basic YAML structure
    # Note: 'on' becomes True in YAML parsing due to boolean interpretation
    if True not in workflow and 'on' not in workflow:
        print(f"❌ Missing trigger configuration")
        return False
    
    if 'jobs' not in workflow:
        print(f"❌ Missing 'jobs' configuration")
        return False
    
    # Detect operations and check permissions
    operations = detect_operations(workflow)
    if operations:
        print(f"🔍 Detected operations: {', '.join(operations)}")
        issues = check_permissions(workflow, operations)
        
        if issues:
            print("⚠️  Permission issues found:")
            for issue in issues:
                print(f"   - {issue}")
            return False
        else:
            print("✅ Permissions look good")
    else:
        print("ℹ️  No sensitive operations detected")
    
    return True

def main():
    """Main validation function."""
    workflows_dir = Path('.github/workflows')
    
    if not workflows_dir.exists():
        print(f"❌ Workflows directory not found: {workflows_dir}")
        sys.exit(1)
    
    print("🔐 GitHub Actions Workflow Permissions Validator")
    print("=" * 50)
    
    workflow_files = list(workflows_dir.glob('*.yml')) + list(workflows_dir.glob('*.yaml'))
    
    if not workflow_files:
        print("❌ No workflow files found")
        sys.exit(1)
    
    print(f"Found {len(workflow_files)} workflow files")
    
    all_valid = True
    
    for workflow_file in sorted(workflow_files):
        valid = validate_workflow_file(workflow_file)
        all_valid = all_valid and valid
    
    print("\n" + "=" * 50)
    
    if all_valid:
        print("✅ All workflows have appropriate permissions!")
        sys.exit(0)
    else:
        print("❌ Some workflows need permission updates")
        sys.exit(1)

if __name__ == '__main__':
    main()