# Configuration Guide

Complete reference for all Triva configuration options.

## Table of Contents

- [Build Configuration](#build-configuration)
- [Server Options](#server-options)
- [Cache Configuration](#cache-configuration)
- [Middleware Configuration](#middleware-configuration)
- [Environment Variables](#environment-variables)

---

## Build Configuration

The `build()` function accepts a configuration object:

```javascript
await build({
  env: 'production',
  protocol: 'https',
  ssl: { ... },
  cache: { ... },
  throttle: { ... },
  redirects: { ... },
  retention: { ... },
  errorTracking: { ... }
});
```

---

## Server Options

### env

Environment mode.

**Type**: `'development' | 'production' | 'test'`  
**Default**: `'development'`

```javascript
await build({
  env: process.env.NODE_ENV || 'development'
});
```

### protocol

HTTP or HTTPS server.

**Type**: `'http' | 'https'`  
**Default**: `'http'`

```javascript
await build({
  protocol: 'https',
  ssl: { ... }
});
```

### ssl

SSL/TLS configuration for HTTPS.

**Type**: `object`

```javascript
import fs from 'fs';

await build({
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./ssl/private.key'),
    cert: fs.readFileSync('./ssl/certificate.crt'),
    ca: fs.readFileSync('./ssl/ca.crt')  // Optional
  }
});
```

---

## Cache Configuration

### cache.type

Database adapter to use.

**Type**: `string`  
**Options**: `'memory'`, `'redis'`, `'mongodb'`, `'postgresql'`, `'mysql'`, `'sqlite'`, `'better-sqlite3'`, `'supabase'`, `'embedded'`

```javascript
await build({
  cache: {
    type: 'redis'
  }
});
```

### cache.retention

Default TTL for cache entries.

**Type**: `number` (milliseconds)  
**Default**: `undefined` (no expiration)

```javascript
await build({
  cache: {
    type: 'memory',
    retention: 600000  // 10 minutes
  }
});
```

### cache.database

Database-specific configuration.

**Type**: `object` (varies by adapter)

**Redis**:
```javascript
cache: {
  type: 'redis',
  database: {
    host: 'localhost',
    port: 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0
  }
}
```

**MongoDB**:
```javascript
cache: {
  type: 'mongodb',
  database: {
    uri: process.env.MONGODB_URI,
    collection: 'cache'
  }
}
```

**PostgreSQL**:
```javascript
cache: {
  type: 'postgresql',
  database: {
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: process.env.PG_PASSWORD,
    tableName: 'cache'
  }
}
```

---

## Middleware Configuration

### throttle

Rate limiting configuration.

**Type**: `object | false`

```javascript
await build({
  throttle: {
    limit: 100,              // Requests per window
    window_ms: 60000,        // Time window (1 minute)
    burst_limit: 20,         // Max burst
    ban_threshold: 5,        // Violations before ban
    ban_ms: 86400000,       // Ban duration (24 hours)
    ban_penalty_multiplier: 2,  // Multiply ban time
    max_violations: 100,     // Track last N violations
    cleanup_interval: 300000,   // Cleanup frequency
    whitelist: [],           // IPs to never throttle
    blacklist: [],           // IPs to always block
    bot_multiplier: 0.5      // Reduce limits for bots
  }
});
```

**Disable**:
```javascript
await build({
  throttle: false
});
```

### redirects

Auto-redirect configuration.

**Type**: `object | false`

```javascript
await build({
  redirects: {
    enabled: true,
    redirectAI: true,           // AI bots
    redirectBots: false,        // Search bots
    redirectCrawlers: true,     // Crawlers
    destination: '/api-docs',   // Where to redirect
    statusCode: 302,            // HTTP status
    whitelist: ['Googlebot'],   // Never redirect
    customRules: []             // Custom rules
  }
});
```

**Disable**:
```javascript
await build({
  redirects: false
});
```

### retention

Request logging configuration.

**Type**: `object | false`

```javascript
await build({
  retention: {
    enabled: true,
    maxEntries: 100000  // Max log entries
  }
});
```

**Disable**:
```javascript
await build({
  retention: false
});
```

### errorTracking

Error tracking configuration.

**Type**: `object | false`

```javascript
await build({
  errorTracking: {
    enabled: true
  }
});
```

---

## Environment Variables

Triva respects these environment variables:

### NODE_ENV

Environment mode.

```bash
NODE_ENV=production node server.js
```

```javascript
await build({
  env: process.env.NODE_ENV
});
```

### PORT

Server port.

```bash
PORT=8080 node server.js
```

```javascript
listen(process.env.PORT || 3000);
```

### Database Connection Strings

**Redis**:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secret
```

**MongoDB**:
```bash
MONGODB_URI=mongodb://localhost:27017/myapp
```

**PostgreSQL**:
```bash
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=myapp
PG_USER=postgres
PG_PASSWORD=secret
```

### JWT Secret

```bash
JWT_SECRET=your-secret-key-here
```

---

## Complete Example

```javascript
import { build, get, listen } from 'triva';
import fs from 'fs';

await build({
  // Environment
  env: process.env.NODE_ENV || 'development',
  
  // HTTPS
  protocol: 'https',
  ssl: {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  },
  
  // Cache
  cache: {
    type: 'redis',
    retention: 600000,
    database: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD
    }
  },
  
  // Rate limiting
  throttle: {
    limit: 1000,
    window_ms: 60000,
    burst_limit: 50,
    ban_threshold: 10,
    ban_ms: 3600000
  },
  
  // Auto-redirect
  redirects: {
    enabled: true,
    redirectAI: true,
    redirectBots: false,
    destination: '/api-docs'
  },
  
  // Logging
  retention: {
    enabled: true,
    maxEntries: 50000
  },
  
  // Error tracking
  errorTracking: {
    enabled: true
  }
});

// Routes
get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
listen(process.env.PORT || 3000);
```

---

**See Also**:
- [Core Concepts](core-concepts.md)
- [Database Adapters](../database-and-cache/adapters/)
- [Middleware Guides](../middleware/)
