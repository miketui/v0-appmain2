# Incident Response Runbook

## Overview
This runbook provides procedures for responding to production incidents in the Haus of Basquiat Portal.

## Incident Classification

### Severity Levels

#### P0 - Critical
- **Definition:** Complete service outage affecting all users
- **Examples:** Application completely down, database unavailable, security breach
- **Response Time:** 15 minutes
- **Resolution Time Target:** 1 hour

#### P1 - High
- **Definition:** Major functionality impacted, affecting most users
- **Examples:** Authentication system down, core features broken
- **Response Time:** 30 minutes
- **Resolution Time Target:** 4 hours

#### P2 - Medium
- **Definition:** Important functionality degraded, affecting some users
- **Examples:** Slow response times, intermittent errors, non-critical features broken
- **Response Time:** 2 hours
- **Resolution Time Target:** 24 hours

#### P3 - Low
- **Definition:** Minor issues with minimal user impact
- **Examples:** Cosmetic bugs, non-essential features affected
- **Response Time:** Next business day
- **Resolution Time Target:** 1 week

## Incident Response Workflow

### 1. Detection & Alerting

#### Automated Detection Sources
- **Monitoring alerts** → Slack #haus-of-basquiat-alerts
- **Health check failures** → PagerDuty/OnCall system
- **Error rate spikes** → Sentry notifications
- **User reports** → Support email/Slack

#### Manual Detection
- User reports via email, Slack, or social media
- Internal team member discoveries
- Partner/vendor notifications

### 2. Initial Response (0-15 minutes)

#### Incident Commander Actions
1. **Acknowledge the incident** in monitoring systems
2. **Assess severity** using classification above
3. **Create incident channel** in Slack: `#incident-YYYY-MM-DD-description`
4. **Page additional team members** based on severity
5. **Begin status page updates** if customer-facing

#### Team Assembly (by severity)
- **P0/P1:** Full on-call team + management
- **P2:** Primary on-call + backup
- **P3:** Primary on-call only

### 3. Investigation & Diagnosis (15-60 minutes)

#### Information Gathering
```bash
# Check application health
curl -f https://hausofbasquiat.com/api/health

# Check monitoring dashboard
curl -s https://hausofbasquiat.com/api/monitoring?type=health | jq '.'

# Review recent deployments
railway deployments --service production

# Check error logs
railway logs --service production --tail 100 | grep ERROR

# Check infrastructure status
railway status
```

#### Key Investigation Areas
1. **Recent Changes**
   - Deployments in last 24 hours
   - Configuration changes
   - Database migrations
   - External service updates

2. **System Metrics**
   - CPU, memory, disk usage
   - Database connections
   - Network connectivity
   - Response times

3. **External Dependencies**
   - Supabase status
   - Railway platform status
   - CDN status
   - Third-party API status

#### Documentation During Investigation
- **Timeline of events** in incident channel
- **Hypotheses tested** and results
- **Commands run** and outputs
- **Team member assignments**

### 4. Mitigation & Resolution

#### Immediate Mitigation Options
1. **Traffic Routing**
   ```bash
   # Enable maintenance mode
   railway environment set MAINTENANCE_MODE=true

   # Route traffic to backup
   # (Platform-specific commands)
   ```

2. **Scaling Resources**
   ```bash
   # Scale up application
   railway scale --service production --replicas 3

   # Scale up database
   # (Contact Railway support for database scaling)
   ```

3. **Rollback Deployment**
   ```bash
   # Rollback to previous version
   railway rollback

   # Verify rollback
   curl -f https://hausofbasquiat.com/api/health
   ```

4. **Database Recovery**
   ```bash
   # Check database connectivity
   psql $DATABASE_URL -c "SELECT version();"

   # Restore from backup if needed
   pg_restore -d $DATABASE_URL backup.dump
   ```

#### Resolution Verification
```bash
# Full system health check
curl -s https://hausofbasquiat.com/api/monitoring?type=health

# Test critical user flows
# - Authentication
# - Core features
# - API endpoints

# Monitor for stability (15+ minutes)
watch -n 60 'curl -s https://hausofbasquiat.com/api/monitoring?type=metrics'
```

### 5. Communication

#### Internal Communication
- **Incident Channel:** Real-time updates in `#incident-YYYY-MM-DD`
- **Management Updates:** Every 30 minutes for P0/P1, hourly for P2
- **Status Meetings:** Every 2 hours for extended incidents

#### External Communication
- **Status Page:** Update within 30 minutes of detection
- **Social Media:** For widespread outages affecting many users
- **Email Updates:** For subscribed users (if applicable)
- **User Support:** Respond to support tickets with incident info

#### Communication Templates

**Status Page - Initial Update:**
```
🔴 We're investigating reports of [brief description].
We're working to resolve this as quickly as possible.
Updates will be posted here.
Posted: [timestamp]
```

**Status Page - Resolution:**
```
✅ This incident has been resolved.
All systems are operating normally.
We apologize for any inconvenience.
Posted: [timestamp]
```

### 6. Post-Incident Activities

#### Immediate (within 24 hours)
- [ ] **All-clear communication** to stakeholders
- [ ] **Incident summary** in incident channel
- [ ] **Timeline documentation** with key events
- [ ] **Monitoring alert review** - did alerts fire correctly?

#### Follow-up (within 1 week)
- [ ] **Post-mortem document** created
- [ ] **Root cause analysis** completed
- [ ] **Action items identified** and assigned
- [ ] **Process improvements** documented
- [ ] **Runbook updates** based on lessons learned

## Common Incident Scenarios

### Scenario 1: Complete Application Outage

**Symptoms:**
- 503/504 errors on all endpoints
- Health check failing
- No response from application

**Investigation Steps:**
```bash
# Check application status
railway status --service production

# Check logs for startup errors
railway logs --service production --tail 50

# Verify environment variables
railway variables --service production

# Check resource limits
railway metrics --service production
```

**Common Causes & Solutions:**
- **Out of memory:** Scale up or optimize memory usage
- **Configuration error:** Verify environment variables
- **Database connection:** Check database status and connections
- **Failed deployment:** Rollback to previous version

### Scenario 2: Authentication System Failure

**Symptoms:**
- Users can't log in
- 401 errors on protected routes
- Magic link emails not working

**Investigation Steps:**
```bash
# Test authentication endpoint
curl -X POST https://hausofbasquiat.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check Supabase status
curl -f "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Verify JWT configuration
railway variables | grep JWT
```

**Common Causes & Solutions:**
- **JWT secrets mismatch:** Verify and update secrets
- **Supabase outage:** Check Supabase status page
- **Email service down:** Check SendGrid/email provider
- **Database issue:** Check user_profiles table access

### Scenario 3: High Error Rate

**Symptoms:**
- Multiple 500 errors in logs
- User reports of broken functionality
- Error monitoring alerts

**Investigation Steps:**
```bash
# Check error patterns
railway logs --service production | grep -E "(ERROR|500)" | tail -20

# Check monitoring metrics
curl -s https://hausofbasquiat.com/api/monitoring?type=errors | jq '.summary'

# Check resource usage
railway metrics --service production

# Test specific endpoints
curl -v https://hausofbasquiat.com/api/posts
curl -v https://hausofbasquiat.com/api/users
```

**Common Causes & Solutions:**
- **Database overload:** Optimize queries, scale database
- **Memory leaks:** Restart application, investigate code
- **External API issues:** Check third-party status
- **Code bugs:** Rollback or hotfix deployment

### Scenario 4: Database Performance Issues

**Symptoms:**
- Slow API responses
- Database timeouts
- High database CPU/memory

**Investigation Steps:**
```bash
# Check database metrics
# (Platform-specific monitoring)

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
psql $DATABASE_URL -c "
  SELECT query, mean_time, calls
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"

# Check database locks
psql $DATABASE_URL -c "SELECT * FROM pg_locks WHERE NOT granted;"
```

**Common Causes & Solutions:**
- **Slow queries:** Optimize or add indexes
- **Connection pool exhaustion:** Increase pool size
- **Lock contention:** Identify and fix blocking queries
- **Database overload:** Scale up database resources

## Escalation Procedures

### When to Escalate
- Incident severity increases during response
- Resolution time targets are at risk
- Additional expertise needed
- External vendor engagement required

### Escalation Contacts
1. **Technical Escalation:** Senior Engineer → Engineering Manager → CTO
2. **Business Escalation:** Incident Commander → Product Manager → CEO
3. **External Vendor:** Direct contact or support tickets

### Escalation Timeline
- **P0:** Escalate after 30 minutes if not resolved
- **P1:** Escalate after 2 hours if not resolved
- **P2:** Escalate after 8 hours if not resolved

## Tools & Resources

### Monitoring & Alerting
- **Application Monitoring:** `/api/monitoring` endpoint
- **Infrastructure:** Railway dashboard
- **Database:** Railway database metrics
- **External Services:** Status pages for Supabase, SendGrid, etc.

### Communication
- **Slack:** #haus-of-basquiat-alerts, incident channels
- **Status Page:** [Your status page URL]
- **Email:** alerts@hausofbasquiat.com

### Documentation
- **Runbooks:** `/docs/runbooks/`
- **Architecture:** `/docs/architecture/`
- **API Docs:** `/docs/api/`

## Incident Response Checklist

### During Incident
- [ ] Incident acknowledged in monitoring system
- [ ] Severity assessed and classified
- [ ] Incident Slack channel created
- [ ] Appropriate team members paged
- [ ] Status page updated (if customer-facing)
- [ ] Investigation timeline documented
- [ ] Mitigation actions taken
- [ ] Resolution verified
- [ ] All-clear communicated

### Post-Incident
- [ ] Post-mortem scheduled within 48 hours
- [ ] Incident summary documented
- [ ] Root cause analysis completed
- [ ] Action items created and assigned
- [ ] Runbooks updated based on learnings
- [ ] Monitoring/alerting improvements identified
- [ ] Process improvements documented

## Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** P0/P1/P2/P3
**Incident Commander:** [Name]

## Summary
Brief description of what happened and impact.

## Timeline
- HH:MM - Event 1
- HH:MM - Event 2
- HH:MM - Resolution

## Root Cause
Technical root cause of the incident.

## Impact
- Users affected: X
- Duration: X hours
- Revenue impact: $X
- Services affected: List

## What Went Well
- Positive aspects of response

## What Could Be Improved
- Areas for improvement

## Action Items
- [ ] Action 1 (Owner: Name, Due: Date)
- [ ] Action 2 (Owner: Name, Due: Date)

## Lessons Learned
Key takeaways and process improvements.
```