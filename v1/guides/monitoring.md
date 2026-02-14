# Monitoring Guide

Application monitoring and observability for Triva applications.

## Table of Contents

- [Built-in Logging](#built-in-logging)
- [Error Tracking](#error-tracking)
- [Health Checks](#health-checks)
- [Metrics Collection](#metrics-collection)
- [External Services](#external-services)

---

## Built-in Logging

### Enable Request Logging

```javascript
await build({
  retention: {
    enabled: true,
    maxEntries: 100000
  }
});
```

### Access Logs

```javascript
import { log } from 'triva';

// Get all logs
const logs = await log.getAll();

// Get recent logs
const recent = await log.getRecent(100);

// Filter logs
const errors = await log.filter({ statusCode: 500 });
const apiLogs = logs.filter(log => log.url.startsWith('/api/'));
```

### Log Structure

```javascript
{
  timestamp: "2026-02-14T10:30:45.123Z",
  method: "GET",
  url: "/api/users",
  statusCode: 200,
  duration: 45,
  ip: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  uaData: {
    browser: "Chrome",
    os: "Windows",
    device: "Desktop"
  }
}
```

---

## Error Tracking

### Enable Error Tracking

```javascript
await build({
  errorTracking: {
    enabled: true
  }
});
```

### Access Errors

```javascript
import { errorTracker } from 'triva';

// Get all errors
const errors = await errorTracker.getAll();

// Get recent errors
const recent = await errorTracker.getRecent(20);

// Filter by type
const serverErrors = errors.filter(e => 
  e.message.includes('database')
);
```

### Error Structure

```javascript
{
  timestamp: "2026-02-14T10:45:23.456Z",
  message: "Database connection failed",
  stack: "Error: Database connection failed\n  at...",
  phase: "route",
  handler: "route_handler",
  pathname: "/api/users",
  request: {
    method: "GET",
    url: "/api/users",
    ip: "192.168.1.100"
  }
}
```

---

## Health Checks

### Basic Health Check

```javascript
import { get } from 'triva';

get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
```

### Detailed Health Check

```javascript
get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks: {}
  };
  
  // Check cache
  try {
    await cache.set('health-check', '1', 1000);
    health.checks.cache = 'ok';
  } catch (error) {
    health.checks.cache = 'error';
    health.status = 'degraded';
  }
  
  // Check database (if using one)
  try {
    await db.ping();
    health.checks.database = 'ok';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'error';
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

## Metrics Collection

### Request Metrics

```javascript
const metrics = {
  requests: 0,
  errors: 0,
  totalDuration: 0,
  statusCodes: {}
};

use((req, res, next) => {
  const start = Date.now();
  metrics.requests++;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.totalDuration += duration;
    
    const status = res.statusCode;
    metrics.statusCodes[status] = (metrics.statusCodes[status] || 0) + 1;
    
    if (status >= 400) {
      metrics.errors++;
    }
  });
  
  next();
});

// Expose metrics endpoint
get('/metrics', (req, res) => {
  const avgDuration = metrics.totalDuration / metrics.requests;
  const errorRate = (metrics.errors / metrics.requests * 100).toFixed(2);
  
  res.json({
    requests: metrics.requests,
    errors: metrics.errors,
    errorRate: `${errorRate}%`,
    avgDuration: `${avgDuration.toFixed(2)}ms`,
    statusCodes: metrics.statusCodes
  });
});
```

### System Metrics

```javascript
get('/metrics/system', (req, res) => {
  const usage = process.memoryUsage();
  
  res.json({
    uptime: process.uptime(),
    memory: {
      rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`
    },
    cpu: process.cpuUsage()
  });
});
```

---

## External Services

### Sentry Integration

```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Error handler
use((err, req, res, next) => {
  Sentry.captureException(err);
  res.status(500).json({ error: 'Internal server error' });
});
```

### DataDog Integration

```javascript
import tracer from 'dd-trace';

tracer.init({
  service: 'triva-app',
  env: process.env.NODE_ENV
});

// Middleware
use((req, res, next) => {
  const span = tracer.scope().active();
  span?.setTag('http.method', req.method);
  span?.setTag('http.url', req.url);
  next();
});
```

---

## Alerting

### Email Alerts

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendAlert(message) {
  await transporter.sendMail({
    from: 'alerts@example.com',
    to: 'admin@example.com',
    subject: '⚠️ Triva Alert',
    text: message
  });
}

// Use in monitoring
setInterval(async () => {
  const errors = await errorTracker.getRecent(10);
  
  if (errors.length > 5) {
    await sendAlert(`High error rate: ${errors.length} errors in last check`);
  }
}, 60000);
```

### Slack Integration

```javascript
async function sendSlackAlert(message) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: message,
      channel: '#alerts'
    })
  });
}
```

---

## Dashboard Example

```javascript
import { get } from 'triva';
import { log, errorTracker } from 'triva';

get('/dashboard', async (req, res) => {
  const logs = await log.getRecent(1000);
  const errors = await errorTracker.getAll();
  
  const dashboard = {
    overview: {
      totalRequests: logs.length,
      totalErrors: errors.length,
      uptime: process.uptime()
    },
    
    requests: {
      byMethod: groupBy(logs, 'method'),
      byStatus: groupByStatus(logs),
      topEndpoints: getTopEndpoints(logs, 10)
    },
    
    performance: {
      avgResponseTime: getAvgDuration(logs),
      slowestRequests: getSlowestRequests(logs, 5)
    },
    
    errors: {
      recent: errors.slice(0, 10),
      byType: groupBy(errors, 'message')
    }
  };
  
  res.json(dashboard);
});

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}
```

---

**Next**: [Error Handling Guide](error-handling.md) | [Testing Guide](testing.md)
