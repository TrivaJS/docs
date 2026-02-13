# Logging Middleware

Complete guide to Triva's request/response logging system with User-Agent parsing and analytics.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Accessing Logs](#accessing-logs)
- [Filtering & Querying](#filtering--querying)
- [User-Agent Parsing](#user-agent-parsing)
- [Log Structure](#log-structure)
- [Export & Analysis](#export--analysis)
- [Best Practices](#best-practices)

---

## Overview

The logging middleware automatically captures detailed information about every request and response:

### Features

**Automatic Capture** - No manual logging required
**Rich Context** - Method, URL, headers, IP, timing
**User-Agent Parsing** - Browser, OS, device detection
**Configurable Retention** - Memory-efficient storage
**Powerful Filtering** - Query logs by any field
**Export Formats** - JSON, CSV, or custom
**Performance Tracking** - Response times and patterns

### What Gets Logged

```javascript
{
  timestamp: "2026-02-12T10:30:45.123Z",
  method: "POST",
  url: "/api/users",
  pathname: "/api/users",
  query: { limit: "10" },
  headers: { ... },
  ip: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  uaData: {
    browser: "Chrome",
    version: "120.0",
    os: "Windows",
    device: "Desktop"
  },
  statusCode: 201,
  duration: 45,  // milliseconds
  throttle: {
    restricted: false,
    reason: "ok"
  }
}
```

---

## Quick Start

### Enable Logging

```javascript
import { build, log } from 'triva';

// Enable with defaults
await build({
  retention: {
    enabled: true,
    maxEntries: 100000  // Keep last 100k requests
  }
});

// Access logs
const allLogs = await log.getAll();
console.log(`Total requests: ${allLogs.length}`);
```

### Basic Usage

```javascript
import { log } from 'triva';

// Get all logs
const logs = await log.getAll();

// Get recent logs
const recent = await log.getRecent(50);

// Filter logs
const postRequests = await log.filter({ method: 'POST' });
const errors = await log.filter({ statusCode: 500 });

// Clear logs
await log.clear();
```

---

## Configuration

### Basic Configuration

```javascript
await build({
  retention: {
    enabled: true,        // Enable logging
    maxEntries: 100000    // Maximum log entries
  }
});
```

### Disabled Logging

```javascript
// Disable for production (if desired)
await build({
  retention: {
    enabled: false
  }
});

// Or omit retention config entirely
await build({
  cache: { type: 'redis' }
  // No retention = no logging
});
```

### Production Configuration

```javascript
await build({
  retention: {
    enabled: process.env.NODE_ENV !== 'production',
    maxEntries: 50000  // Smaller for production
  }
});
```

### Storage Considerations

```javascript
// Memory usage estimation
const avgLogSize = 2000;  // ~2KB per log entry
const maxEntries = 100000;
const estimatedMemory = avgLogSize * maxEntries / 1024 / 1024;
console.log(`Estimated memory: ${estimatedMemory}MB`);  // ~195MB

// Adjust based on available memory
await build({
  retention: {
    enabled: true,
    maxEntries: 10000  // Smaller footprint (~20MB)
  }
});
```

---

## Accessing Logs

### Get All Logs

```javascript
import { log } from 'triva';

const logs = await log.getAll();
console.log(`Total requests: ${logs.length}`);

// Iterate through logs
logs.forEach(entry => {
  console.log(`${entry.method} ${entry.url} - ${entry.statusCode}`);
});
```

### Get Recent Logs

```javascript
// Get last 100 requests
const recent = await log.getRecent(100);

// Most recent first
recent.forEach(entry => {
  console.log(entry.timestamp, entry.url);
});
```

### Get Specific Log

```javascript
// Logs are stored with keys like: log:request:timestamp:random
const specificLog = await cache.get('log:request:1676234567890:abc123');
```

---

## Filtering & Querying

### Filter by Method

```javascript
// Get all POST requests
const posts = await log.filter({ method: 'POST' });

// Get all GET requests
const gets = await log.filter({ method: 'GET' });

// Multiple methods
const mutations = await log.filter({
  method: ['POST', 'PUT', 'DELETE']
});
```

### Filter by Status Code

```javascript
// All successful requests
const success = await log.filter({ statusCode: 200 });

// All errors
const errors = await log.filter({ statusCode: 500 });

// 4xx errors
const clientErrors = logs.filter(log =>
  log.statusCode >= 400 && log.statusCode < 500
);

// 5xx errors
const serverErrors = logs.filter(log =>
  log.statusCode >= 500
);
```

### Filter by URL Pattern

```javascript
// All API requests
const apiLogs = logs.filter(log =>
  log.url.startsWith('/api/')
);

// Specific endpoint
const userLogs = logs.filter(log =>
  log.pathname === '/api/users'
);

// Pattern matching
const adminLogs = logs.filter(log =>
  log.url.includes('/admin/')
);
```

### Filter by IP Address

```javascript
// Specific IP
const ipLogs = logs.filter(log =>
  log.ip === '192.168.1.100'
);

// IP range
const localLogs = logs.filter(log =>
  log.ip.startsWith('192.168.')
);
```

### Filter by Time Range

```javascript
// Last hour
const oneHourAgo = Date.now() - (60 * 60 * 1000);
const recentLogs = logs.filter(log =>
  new Date(log.timestamp) > oneHourAgo
);

// Specific date range
const start = new Date('2026-02-12T00:00:00Z');
const end = new Date('2026-02-12T23:59:59Z');
const todayLogs = logs.filter(log => {
  const date = new Date(log.timestamp);
  return date >= start && date <= end;
});
```

### Complex Filtering

```javascript
// POST requests that failed in last hour
const recentFailures = logs.filter(log => {
  const oneHourAgo = Date.now() - 3600000;
  return log.method === 'POST' &&
         log.statusCode >= 400 &&
         new Date(log.timestamp) > oneHourAgo;
});

// Slow requests (>1 second)
const slowRequests = logs.filter(log =>
  log.duration > 1000
);

// Throttled requests
const throttled = logs.filter(log =>
  log.throttle?.restricted === true
);
```

---

## User-Agent Parsing

### Parsed UA Data

Every log entry includes parsed User-Agent data:

```javascript
{
  uaData: {
    browser: "Chrome",
    version: "120.0.6099.109",
    os: "Windows",
    osVersion: "10",
    device: "Desktop",
    isBot: false,
    isMobile: false,
    isTablet: false
  }
}
```

### Browser Statistics

```javascript
const logs = await log.getAll();

// Count by browser
const browsers = logs.reduce((acc, log) => {
  const browser = log.uaData?.browser || 'Unknown';
  acc[browser] = (acc[browser] || 0) + 1;
  return acc;
}, {});

console.log('Browser distribution:', browsers);
// { Chrome: 1523, Safari: 891, Firefox: 432, ... }
```

### OS Statistics

```javascript
// Count by operating system
const osStat = logs.reduce((acc, log) => {
  const os = log.uaData?.os || 'Unknown';
  acc[os] = (acc[os] || 0) + 1;
  return acc;
}, {});

console.log('OS distribution:', osStat);
// { Windows: 2145, macOS: 543, Linux: 312, ... }
```

### Device Statistics

```javascript
// Count by device type
const devices = logs.reduce((acc, log) => {
  const device = log.uaData?.device || 'Unknown';
  acc[device] = (acc[device] || 0) + 1;
  return acc;
}, {});

console.log('Device distribution:', devices);
// { Desktop: 2456, Mobile: 987, Tablet: 123 }
```

### Bot Detection

```javascript
// Filter bot traffic
const botLogs = logs.filter(log => log.uaData?.isBot);
console.log(`Bot requests: ${botLogs.length}`);

// Filter human traffic
const humanLogs = logs.filter(log => !log.uaData?.isBot);
console.log(`Human requests: ${humanLogs.length}`);

// Bot breakdown
const bots = botLogs.reduce((acc, log) => {
  const browser = log.uaData?.browser || 'Unknown Bot';
  acc[browser] = (acc[browser] || 0) + 1;
  return acc;
}, {});

console.log('Bot types:', bots);
// { Googlebot: 234, Bingbot: 123, ... }
```

### Mobile vs Desktop

```javascript
// Mobile requests
const mobile = logs.filter(log => log.uaData?.isMobile);
const mobilePercent = (mobile.length / logs.length * 100).toFixed(2);
console.log(`Mobile traffic: ${mobilePercent}%`);

// Desktop requests
const desktop = logs.filter(log => log.uaData?.device === 'Desktop');
const desktopPercent = (desktop.length / logs.length * 100).toFixed(2);
console.log(`Desktop traffic: ${desktopPercent}%`);
```

---

## Log Structure

### Complete Log Entry

```javascript
{
  // Request identification
  timestamp: "2026-02-12T10:30:45.123Z",
  method: "POST",
  url: "/api/users?limit=10",
  pathname: "/api/users",
  query: {
    limit: "10"
  },

  // Headers
  headers: {
    "host": "api.example.com",
    "content-type": "application/json",
    "authorization": "Bearer [REDACTED]",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept": "application/json",
    "content-length": "124"
  },

  // Client information
  ip: "192.168.1.100",
  userAgent: "Mozilla/5.0...",

  // Parsed User-Agent data
  uaData: {
    browser: "Chrome",
    version: "120.0.6099.109",
    os: "Windows",
    osVersion: "10",
    device: "Desktop",
    isBot: false,
    isMobile: false,
    isTablet: false
  },

  // Response information
  statusCode: 201,
  duration: 45,

  // Throttle information (if throttling enabled)
  throttle: {
    restricted: false,
    reason: "ok",
    uaData: { ... }
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp |
| `method` | string | HTTP method (GET, POST, etc.) |
| `url` | string | Full URL with query string |
| `pathname` | string | URL path without query |
| `query` | object | Parsed query parameters |
| `headers` | object | Request headers |
| `ip` | string | Client IP address |
| `userAgent` | string | Raw User-Agent string |
| `uaData` | object | Parsed UA information |
| `statusCode` | number | HTTP response code |
| `duration` | number | Response time in ms |
| `throttle` | object | Throttle status (if enabled) |

---

## Export & Analysis

### Export to JSON

```javascript
import { writeFile } from 'fs/promises';

// Export all logs
const logs = await log.getAll();
await writeFile('logs.json', JSON.stringify(logs, null, 2));
console.log(`Exported ${logs.length} logs to logs.json`);
```

### Export to CSV

```javascript
import { writeFile } from 'fs/promises';

// Convert to CSV
function logsToCSV(logs) {
  const headers = ['timestamp', 'method', 'url', 'ip', 'statusCode', 'duration'];
  const rows = logs.map(log =>
    headers.map(h => log[h] || '').join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

const logs = await log.getAll();
const csv = logsToCSV(logs);
await writeFile('logs.csv', csv);
```

### Analytics Dashboard

```javascript
class LogAnalytics {
  constructor(logs) {
    this.logs = logs;
  }

  getTotalRequests() {
    return this.logs.length;
  }

  getRequestsByMethod() {
    return this.logs.reduce((acc, log) => {
      acc[log.method] = (acc[log.method] || 0) + 1;
      return acc;
    }, {});
  }

  getRequestsByStatus() {
    return this.logs.reduce((acc, log) => {
      const status = Math.floor(log.statusCode / 100) * 100;
      acc[`${status}s`] = (acc[`${status}s`] || 0) + 1;
      return acc;
    }, {});
  }

  getAverageResponseTime() {
    const total = this.logs.reduce((sum, log) => sum + (log.duration || 0), 0);
    return (total / this.logs.length).toFixed(2);
  }

  getTopEndpoints(limit = 10) {
    const counts = this.logs.reduce((acc, log) => {
      acc[log.pathname] = (acc[log.pathname] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([path, count]) => ({ path, count }));
  }

  getErrorRate() {
    const errors = this.logs.filter(log => log.statusCode >= 400).length;
    return (errors / this.logs.length * 100).toFixed(2);
  }

  getSlowestRequests(limit = 10) {
    return [...this.logs]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit);
  }

  generateReport() {
    return {
      total: this.getTotalRequests(),
      methods: this.getRequestsByMethod(),
      statuses: this.getRequestsByStatus(),
      avgResponseTime: `${this.getAverageResponseTime()}ms`,
      errorRate: `${this.getErrorRate()}%`,
      topEndpoints: this.getTopEndpoints(5),
      slowest: this.getSlowestRequests(5)
    };
  }
}

// Usage
const logs = await log.getAll();
const analytics = new LogAnalytics(logs);
console.log(analytics.generateReport());
```

### Real-Time Monitoring

```javascript
// Monitor logs in real-time
setInterval(async () => {
  const logs = await log.getRecent(100);

  // Calculate metrics
  const errors = logs.filter(log => log.statusCode >= 400);
  const avgTime = logs.reduce((sum, log) => sum + log.duration, 0) / logs.length;

  console.log(`Last 100 requests:`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Avg time: ${avgTime.toFixed(2)}ms`);
  console.log(`  Requests/min: ${logs.length}`);
}, 60000);  // Every minute
```

---

## Best Practices

### 1. Configure Retention Appropriately

```javascript
// Development - Keep everything
await build({
  retention: {
    enabled: true,
    maxEntries: 100000
  }
});

// Production - Be conservative
await build({
  retention: {
    enabled: true,
    maxEntries: 10000  // Only recent logs
  }
});

// High-traffic production - Disable or use external logging
await build({
  retention: {
    enabled: false  // Use external logging service
  }
});
```

### 2. Regular Log Rotation

```javascript
// Clear logs daily
setInterval(async () => {
  const logs = await log.getAll();

  // Export before clearing
  await writeFile(
    `logs-${new Date().toISOString()}.json`,
    JSON.stringify(logs)
  );

  // Clear logs
  await log.clear();
  console.log('Logs rotated');
}, 86400000);  // 24 hours
```

### 3. Filter Sensitive Data

```javascript
// Don't log authorization tokens
const logs = await log.getAll();
const sanitized = logs.map(log => ({
  ...log,
  headers: {
    ...log.headers,
    authorization: log.headers.authorization ? '[REDACTED]' : undefined,
    cookie: log.headers.cookie ? '[REDACTED]' : undefined
  }
}));

await writeFile('sanitized-logs.json', JSON.stringify(sanitized));
```

### 4. Set Up Alerts

```javascript
// Alert on high error rate
setInterval(async () => {
  const logs = await log.getRecent(100);
  const errors = logs.filter(log => log.statusCode >= 500);
  const errorRate = errors.length / logs.length;

  if (errorRate > 0.1) {  // >10% errors
    await sendAlert({
      message: `High error rate: ${(errorRate * 100).toFixed(2)}%`,
      errors: errors.length,
      total: logs.length
    });
  }
}, 60000);  // Check every minute
```

### 5. Performance Monitoring

```javascript
// Track slow endpoints
setInterval(async () => {
  const logs = await log.getRecent(1000);

  const byEndpoint = logs.reduce((acc, log) => {
    if (!acc[log.pathname]) {
      acc[log.pathname] = { times: [], count: 0 };
    }
    acc[log.pathname].times.push(log.duration);
    acc[log.pathname].count++;
    return acc;
  }, {});

  // Calculate average times
  Object.entries(byEndpoint).forEach(([path, data]) => {
    const avg = data.times.reduce((a, b) => a + b, 0) / data.count;
    if (avg > 1000) {  // Slower than 1 second
      console.warn(`Slow endpoint: ${path} - ${avg.toFixed(2)}ms average`);
    }
  });
}, 300000);  // Every 5 minutes
```

### 6. Use External Logging for Production

```javascript
// For high-traffic production, use external services
import winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Custom logging middleware
use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Date.now() - start
    });
  });

  next();
});
```

---

## Examples

### API Analytics Dashboard

```javascript
import { log } from 'triva';
import { get } from 'triva';

get('/analytics', async (req, res) => {
  const logs = await log.getAll();
  const analytics = new LogAnalytics(logs);

  res.json({
    summary: analytics.generateReport(),
    browsers: getBrowserStats(logs),
    devices: getDeviceStats(logs),
    topIPs: getTopIPs(logs)
  });
});

function getBrowserStats(logs) {
  return logs.reduce((acc, log) => {
    const browser = log.uaData?.browser || 'Unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});
}

function getDeviceStats(logs) {
  return logs.reduce((acc, log) => {
    const device = log.uaData?.device || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});
}

function getTopIPs(logs, limit = 10) {
  const counts = logs.reduce((acc, log) => {
    acc[log.ip] = (acc[log.ip] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}
```

### Error Investigation Tool

```javascript
get('/errors/investigate', async (req, res) => {
  const logs = await log.getAll();
  const errors = logs.filter(log => log.statusCode >= 500);

  const investigation = {
    total: errors.length,
    byEndpoint: groupBy(errors, 'pathname'),
    byIP: groupBy(errors, 'ip'),
    timeline: getTimeline(errors),
    recentErrors: errors.slice(0, 10)
  };

  res.json(investigation);
});

function groupBy(logs, field) {
  return logs.reduce((acc, log) => {
    const key = log[field];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function getTimeline(logs) {
  return logs.map(log => ({
    timestamp: log.timestamp,
    endpoint: log.pathname,
    status: log.statusCode
  }));
}
```

---

## Next Steps

- **[Throttling Guide](throttling.md)** - Rate limiting integration
- **[Auto-Redirect Guide](auto-redirect.md)** - Bot traffic handling
- **[Error Tracking Guide](error-tracking.md)** - Error management
- **[Best Practices](best-practices.md)** - Production patterns

---

**Need help?** Check [GitHub Issues](https://github.com/trivajs/triva/issues) or [Discord](https://discord.gg/triva).
