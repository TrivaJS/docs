# Error Tracking Middleware

Centralized error capture, analysis, and debugging for production applications.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Accessing Errors](#accessing-errors)
- [Error Analysis](#error-analysis)
- [Production Monitoring](#production-monitoring)

---

## Overview

The error tracking middleware automatically captures and stores errors that occur during request processing:

### Features

**Automatic Capture** - All errors logged automatically
**Rich Context** - Request data, stack traces, User-Agent
**Error Categorization** - By type, phase, endpoint
**Stack Trace Storage** - Full stack traces preserved
**Real-Time Monitoring** - Query errors programmatically
**Production Ready** - Lightweight and performant

---

## Quick Start

### Enable Error Tracking

```javascript
import { build, errorTracker } from 'triva';

await build({
  errorTracking: {
    enabled: true
  }
});

// Access errors
const errors = await errorTracker.getAll();
console.log(`Total errors: ${errors.length}`);
```

### View Recent Errors

```javascript
import { errorTracker } from 'triva';

// Get last 10 errors
const recent = await errorTracker.getRecent(10);

recent.forEach(error => {
  console.log(`${error.timestamp}: ${error.message}`);
  console.log(`  Phase: ${error.phase}`);
  console.log(`  Route: ${error.pathname}`);
});
```

---

## Configuration

### Basic Setup

```javascript
await build({
  errorTracking: {
    enabled: true
  }
});
```

### Disable in Development

```javascript
await build({
  errorTracking: {
    enabled: process.env.NODE_ENV === 'production'
  }
});
```

---

## Accessing Errors

### Get All Errors

```javascript
const errors = await errorTracker.getAll();
console.log(`Total errors: ${errors.length}`);
```

### Get Recent Errors

```javascript
const recent = await errorTracker.getRecent(20);
```

### Filter by Error Type

```javascript
const errors = await errorTracker.getAll();

const validationErrors = errors.filter(e =>
  e.message.includes('validation')
);

const authErrors = errors.filter(e =>
  e.phase === 'middleware' && e.handler.includes('auth')
);
```

---

## Error Structure

### Complete Error Object

```javascript
{
  timestamp: "2026-02-12T10:45:23.456Z",
  message: "Cannot read property 'id' of undefined",
  stack: "TypeError: Cannot read property...\n  at handler...",
  phase: "route",           // 'middleware', 'route', 'request'
  handler: "route_handler",  // Handler that threw error
  pathname: "/api/users/123",
  uaData: {
    browser: "Chrome",
    os: "Windows",
    isBot: false
  },
  request: {
    method: "GET",
    url: "/api/users/123",
    headers: { ... },
    ip: "192.168.1.100"
  }
}
```

---

## Error Analysis

### Error Rate Tracking

```javascript
import { errorTracker } from 'triva';

setInterval(async () => {
  const errors = await errorTracker.getRecent(100);
  const errorRate = (errors.length / 100 * 100).toFixed(2);

  console.log(`Error rate: ${errorRate}%`);

  if (errorRate > 5) {
    await sendAlert(`High error rate: ${errorRate}%`);
  }
}, 60000);  // Check every minute
```

### Error Breakdown

```javascript
const errors = await errorTracker.getAll();

// By phase
const byPhase = errors.reduce((acc, err) => {
  acc[err.phase] = (acc[err.phase] || 0) + 1;
  return acc;
}, {});

// By endpoint
const byEndpoint = errors.reduce((acc, err) => {
  acc[err.pathname] = (acc[err.pathname] || 0) + 1;
  return acc;
}, {});

console.log('Errors by phase:', byPhase);
console.log('Errors by endpoint:', byEndpoint);
```

---

## Production Monitoring

### Real-Time Alerts

```javascript
import { errorTracker } from 'triva';

// Monitor for critical errors
setInterval(async () => {
  const errors = await errorTracker.getRecent(10);

  errors.forEach(error => {
    if (error.message.includes('database') ||
        error.message.includes('timeout')) {
      sendCriticalAlert({
        message: error.message,
        endpoint: error.pathname,
        time: error.timestamp
      });
    }
  });
}, 30000);  // Every 30 seconds
```

### Error Dashboard

```javascript
import { get } from 'triva';
import { errorTracker } from 'triva';

get('/admin/errors', async (req, res) => {
  const errors = await errorTracker.getAll();

  const dashboard = {
    total: errors.length,
    recent: await errorTracker.getRecent(10),
    byType: groupBy(errors, 'message'),
    byEndpoint: groupBy(errors, 'pathname'),
    timeline: errors.map(e => ({
      time: e.timestamp,
      message: e.message
    }))
  };

  res.json(dashboard);
});

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const val = item[key];
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}
```

---

## Best Practices

### 1. Clear Errors Regularly

```javascript
// Clear old errors weekly
setInterval(async () => {
  await errorTracker.clear();
  console.log('Error log cleared');
}, 7 * 24 * 60 * 60 * 1000);  // 7 days
```

### 2. Export for Analysis

```javascript
import { writeFile } from 'fs/promises';

const errors = await errorTracker.getAll();
await writeFile('errors.json', JSON.stringify(errors, null, 2));
```

### 3. Integrate with External Services

```javascript
// Send to Sentry, Rollbar, etc.
import * as Sentry from '@sentry/node';

const errors = await errorTracker.getRecent(10);
errors.forEach(error => {
  Sentry.captureException(new Error(error.message), {
    extra: {
      phase: error.phase,
      pathname: error.pathname
    }
  });
});
```

---

**Next:** [Custom Middleware](custom-middleware.md) | [Best Practices](best-practices.md)
