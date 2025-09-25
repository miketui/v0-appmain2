# Monitoring & Observability Runbook

## Overview
This runbook covers monitoring, alerting, and observability practices for the Haus of Basquiat Portal.

## Monitoring Architecture

### Components
- **Application Metrics:** Custom monitoring service (`/lib/monitoring.ts`)
- **Health Checks:** `/api/health` and `/api/monitoring` endpoints
- **Error Tracking:** Built-in error collection and external integration ready
- **Alerting System:** Custom alerting service (`/lib/alerts.ts`)
- **Performance Monitoring:** Response time and resource usage tracking

### Data Flow
```
Application → Monitoring Service → Alerts Service → Notifications
     ↓              ↓                    ↓
  Metrics API   Health Checks      Slack/Email/Webhook
```

## Key Metrics

### Application Health Metrics
- **Status:** healthy/degraded/unhealthy
- **Uptime:** Process uptime in seconds
- **Memory Usage:** Heap used/total
- **Response Time:** Average response time (5-minute window)
- **Error Rate:** Errors per minute
- **Security Events:** Security events per 5 minutes

### Business Metrics
- **User Registrations:** New user applications per day
- **Active Users:** Daily/monthly active users
- **Posts Created:** Content creation rate
- **Messages Sent:** Communication activity
- **File Uploads:** Media usage

### Infrastructure Metrics
- **HTTP Requests:** Request count by status code
- **Database Connections:** Active connections
- **API Endpoint Performance:** Response times by endpoint
- **File Storage Usage:** Media storage consumption

## Monitoring Endpoints

### Health Check Endpoint
```bash
curl -s https://hausofbasquiat.com/api/health | jq '.'
```

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": 86400,
  "version": "1.0.0",
  "node_version": "v18.17.0",
  "memory": {
    "used": 134217728,
    "total": 268435456
  },
  "environment": "production"
}
```

### Monitoring Data Endpoint
```bash
# Get overall health status
curl -s https://hausofbasquiat.com/api/monitoring?type=health | jq '.'

# Get metrics from last hour
curl -s https://hausofbasquiat.com/api/monitoring?type=metrics&minutes=60 | jq '.'

# Get errors from last hour
curl -s https://hausofbasquiat.com/api/monitoring?type=errors&minutes=60 | jq '.'

# Get security events
curl -s https://hausofbasquiat.com/api/monitoring?type=security&minutes=60 | jq '.'

# Get all monitoring data
curl -s https://hausofbasquiat.com/api/monitoring | jq '.'
```

## Alert Configuration

### Default Alert Rules

#### High Error Rate
- **Trigger:** More than 10 errors in 5 minutes
- **Severity:** High
- **Cooldown:** 15 minutes
- **Action:** Page on-call engineer

#### Slow Response Time
- **Trigger:** Average response time > 2 seconds (5-minute window)
- **Severity:** Medium
- **Cooldown:** 10 minutes
- **Action:** Slack notification

#### Security Events Spike
- **Trigger:** More than 20 security events in 10 minutes
- **Severity:** Critical
- **Cooldown:** 30 minutes
- **Action:** Page security team

#### Application Unhealthy
- **Trigger:** Health check status = "unhealthy"
- **Severity:** Critical
- **Cooldown:** 5 minutes
- **Action:** Page on-call engineer

#### Failed Login Attempts
- **Trigger:** More than 5 failed login attempts from same IP in 15 minutes
- **Severity:** Medium
- **Cooldown:** 30 minutes
- **Action:** Security notification

### Managing Alert Rules

#### View Current Rules
```bash
curl -s https://hausofbasquiat.com/api/monitoring/alerts | jq '.rules'
```

#### Update Alert Rule
```bash
curl -X PUT https://hausofbasquiat.com/api/monitoring/alerts/high_error_rate \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false,
    "threshold": 20,
    "cooldown": 30
  }'
```

## Dashboards

### Real-Time Health Dashboard
```bash
#!/bin/bash
# health-dashboard.sh

while true; do
  clear
  echo "=== Haus of Basquiat Health Dashboard ==="
  echo "$(date)"
  echo

  # Overall health
  health=$(curl -s https://hausofbasquiat.com/api/monitoring?type=health)
  status=$(echo $health | jq -r '.status')
  echo "Status: $status"

  # Key metrics
  errors_1min=$(echo $health | jq -r '.metrics.errors_1min // 0')
  response_time=$(echo $health | jq -r '.metrics.avg_response_time_5min // 0')

  echo "Errors (1min): $errors_1min"
  echo "Avg Response Time: ${response_time}ms"
  echo

  # Recent alerts
  echo "=== Recent Alerts ==="
  curl -s https://hausofbasquiat.com/api/monitoring/alerts | jq -r '.alerts[:3][] | "\(.severity | ascii_upcase): \(.message) (\(.timestamp))"'

  sleep 30
done
```

### Performance Monitoring Script
```bash
#!/bin/bash
# performance-monitor.sh

echo "=== Performance Monitor ==="
echo "Timestamp,ResponseTime,MemoryUsed,ErrorCount"

while true; do
  timestamp=$(date -Iseconds)

  # Measure response time
  response_time=$(curl -w "%{time_total}" -o /dev/null -s https://hausofbasquiat.com/api/health)
  response_time=$(echo "$response_time * 1000" | bc -l)

  # Get memory usage
  memory_used=$(curl -s https://hausofbasquiat.com/api/health | jq '.memory.used')

  # Get error count (last minute)
  error_count=$(curl -s https://hausofbasquiat.com/api/monitoring?type=errors&minutes=1 | jq '.errors | length')

  echo "$timestamp,$response_time,$memory_used,$error_count"

  sleep 60
done
```

## Log Analysis

### Important Log Patterns

#### Error Patterns
```bash
# Application errors
railway logs --service production | grep -E "ERROR|FATAL"

# Authentication failures
railway logs --service production | grep "auth.*failed"

# Database errors
railway logs --service production | grep -E "database|prisma.*error"

# Performance issues
railway logs --service production | grep -E "slow|timeout"
```

#### Security Patterns
```bash
# Suspicious activities
railway logs --service production | grep -E "security|suspicious|blocked"

# Rate limiting
railway logs --service production | grep "rate.limit"

# Failed login attempts
railway logs --service production | grep "login.*failed"
```

#### Business Logic Errors
```bash
# File upload issues
railway logs --service production | grep "upload.*failed"

# Payment processing
railway logs --service production | grep -E "stripe|payment.*error"

# Email delivery
railway logs --service production | grep -E "sendgrid|email.*failed"
```

### Log Analysis Tools

#### Error Rate Analysis
```bash
#!/bin/bash
# error-rate.sh

echo "Error rate analysis (last 24 hours):"
echo

# Count errors by hour
railway logs --service production --since 24h | \
grep ERROR | \
awk '{print $1" "$2}' | \
cut -d: -f1-2 | \
sort | uniq -c | \
sort -nr
```

#### Top Error Messages
```bash
#!/bin/bash
# top-errors.sh

echo "Top error messages (last 24 hours):"
echo

railway logs --service production --since 24h | \
grep ERROR | \
awk -F'ERROR' '{print $2}' | \
sort | uniq -c | \
sort -nr | \
head -20
```

## Performance Monitoring

### Response Time Monitoring
```bash
# Monitor specific endpoints
endpoints=(
  "/"
  "/api/health"
  "/api/posts"
  "/api/users"
  "/auth/signin"
)

for endpoint in "${endpoints[@]}"; do
  echo "Testing $endpoint..."
  curl -w "Response time: %{time_total}s\n" -o /dev/null -s \
    https://hausofbasquiat.com$endpoint
done
```

### Load Testing
```bash
# Simple load test with Apache Bench
ab -n 100 -c 10 https://hausofbasquiat.com/api/health

# More comprehensive with curl
for i in {1..50}; do
  curl -w "%{time_total}\n" -o /dev/null -s https://hausofbasquiat.com/ &
done
wait
```

### Database Performance
```bash
# Check slow queries (if accessible)
psql $DATABASE_URL -c "
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;"

# Check active connections
psql $DATABASE_URL -c "
SELECT
  count(*) as active_connections,
  state
FROM pg_stat_activity
GROUP BY state;"
```

## Alerting Integration

### Slack Integration
Set `SLACK_WEBHOOK_URL` environment variable for alert notifications:

```bash
railway environment set SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### Email Notifications
Configure SendGrid for email alerts:

```bash
railway environment set SENDGRID_API_KEY=SG.your-api-key
railway environment set ALERT_EMAIL=alerts@hausofbasquiat.com
```

### Custom Webhook
Set up custom webhook for external monitoring systems:

```bash
railway environment set ALERT_WEBHOOK_URL=https://your-monitoring-system.com/webhook
```

## Troubleshooting Common Issues

### Monitoring Service Not Responding
```bash
# Check if monitoring endpoints are accessible
curl -I https://hausofbasquiat.com/api/health
curl -I https://hausofbasquiat.com/api/monitoring

# Check application logs
railway logs --service production | grep -E "monitoring|health"

# Restart if necessary
railway service restart
```

### Alerts Not Firing
```bash
# Check alert configuration
curl -s https://hausofbasquiat.com/api/monitoring/alerts | jq '.rules'

# Test alert conditions manually
# (Create test conditions to trigger alerts)

# Check notification settings
railway variables | grep -E "SLACK|EMAIL|WEBHOOK"
```

### High Memory Usage
```bash
# Monitor memory usage over time
watch -n 30 'curl -s https://hausofbasquiat.com/api/health | jq ".memory"'

# Check for memory leaks in logs
railway logs --service production | grep -E "memory|heap"

# Consider scaling up
railway scale --service production --memory 1GB
```

### Database Connection Issues
```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool usage
curl -s https://hausofbasquiat.com/api/monitoring?type=health | jq '.metrics'

# Monitor database connections
watch -n 30 'psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"'
```

## Best Practices

### Monitoring
1. **Monitor what matters** - Focus on user-impacting metrics
2. **Set appropriate thresholds** - Avoid alert fatigue
3. **Use multiple monitoring methods** - Health checks, metrics, logs
4. **Monitor dependencies** - Database, external APIs
5. **Track business metrics** - Not just technical metrics

### Alerting
1. **Clear escalation paths** - Know who to contact
2. **Actionable alerts** - Each alert should have clear next steps
3. **Alert grouping** - Avoid spam during incidents
4. **Regular alert review** - Tune thresholds based on experience
5. **Test alert systems** - Ensure notifications work

### Documentation
1. **Keep runbooks updated** - Update after incidents
2. **Document normal ranges** - What's expected vs abnormal
3. **Share knowledge** - Don't create single points of failure
4. **Regular reviews** - Review and improve monitoring strategy

## Monitoring Checklist

### Daily Checks
- [ ] Review overnight alerts
- [ ] Check error rate trends
- [ ] Monitor response time metrics
- [ ] Verify backup completion
- [ ] Check resource utilization

### Weekly Checks
- [ ] Review alert rule effectiveness
- [ ] Analyze performance trends
- [ ] Check log storage usage
- [ ] Review security events
- [ ] Test monitoring systems

### Monthly Checks
- [ ] Review and tune alert thresholds
- [ ] Analyze long-term trends
- [ ] Update monitoring documentation
- [ ] Plan capacity upgrades
- [ ] Review incident patterns