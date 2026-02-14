# Core Concepts

Understanding Triva's architecture and fundamental concepts.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Request/Response Cycle](#requestresponse-cycle)
- [Middleware System](#middleware-system)
- [Caching Layer](#caching-layer)
- [Extension System](#extension-system)

---

## Architecture Overview

Triva is a lightweight HTTP framework built on Node.js with a focus on simplicity and performance.

### Core Components

```
┌─────────────────────────────────────┐
│         Your Application            │
├─────────────────────────────────────┤
│      Triva Core Framework           │
│  ┌──────────┬──────────┬─────────┐  │
│  │ Routing  │Middleware│  Cache  │  │
│  └──────────┴──────────┴─────────┘  │
├─────────────────────────────────────┤
│        Node.js HTTP Server          │
└─────────────────────────────────────┘
```

**Layers**:
1. **HTTP Server** - Node.js built-in HTTP/HTTPS
2. **Core Framework** - Routing, middleware, caching
3. **Your Application** - Routes and business logic

### Design Philosophy

**Minimal Core**: Only essential features in core  
**Extension-Based**: Add features through extensions  
**Zero Dependencies**: Core has no npm dependencies  
**Performance First**: Optimized for speed  
**Developer Experience**: Simple, intuitive API  

---

## Request/Response Cycle

### Flow Diagram

```
1. HTTP Request arrives
   ↓
2. Middleware Chain (if any)
   ↓
3. Route Matching
   ↓
4. Route Handler
   ↓
5. Response Sent
```

### Detailed Flow

```javascript
import { build, use, get } from 'triva';

// 1. Build - Configure server
await build({
  cache: { type: 'memory' }
});

// 2. Middleware - Runs before routes
use((req, res, next) => {
  console.log('Middleware');
  next();
});

// 3. Route - Matches URL pattern
get('/api/data', (req, res) => {
  // 4. Handler - Your logic
  res.json({ data: [] });
  // 5. Response sent
});
```

### Request Object

Extended Node.js `IncomingMessage`:

```javascript
{
  method: 'GET',           // HTTP method
  url: '/api/users/123',   // Full URL
  pathname: '/api/users/123', // Path without query
  params: { id: '123' },   // Route parameters
  query: { page: '1' },    // Query string
  headers: { ... },        // Request headers
  
  // Helper methods
  json(),                  // Parse JSON body
  text()                   // Get text body
}
```

### Response Object

Extended Node.js `ServerResponse`:

```javascript
{
  statusCode: 200,         // HTTP status
  
  // Helper methods
  json(data),             // Send JSON
  send(text),             // Send text
  status(code),           // Set status
  header(name, value),    // Set header
  redirect(url)           // Redirect
}
```

---

## Middleware System

### What is Middleware?

Functions that process requests before they reach route handlers.

```javascript
function middleware(req, res, next) {
  // Process request
  req.timestamp = Date.now();
  
  // Pass to next middleware/route
  next();
}
```

### Middleware Types

**1. Global Middleware**

Runs on every request:

```javascript
use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

**2. Route-Specific Middleware**

Runs only on specific routes:

```javascript
get('/admin', authMiddleware, (req, res) => {
  res.json({ admin: true });
});
```

**3. Built-in Middleware**

Configured in `build()`:

```javascript
await build({
  throttle: { limit: 100 },      // Rate limiting
  redirects: { enabled: true },  // Auto-redirect
  retention: { enabled: true }   // Logging
});
```

### Execution Order

```javascript
// 1. Built-in middleware (from build config)
await build({ throttle: { limit: 100 } });

// 2. Global middleware (in order added)
use(middleware1);
use(middleware2);

// 3. Route-specific middleware
get('/api', routeMiddleware, handler);

// 4. Route handler
```

---

## Caching Layer

### Cache Architecture

```
Application
    ↓
Cache API (Unified)
    ↓
Adapter Layer
    ↓
┌─────┬──────┬───────┬────┐
Memory Redis MongoDB ...
```

### Cache API

**Unified interface** across all adapters:

```javascript
// Same code, different backends
await cache.set('key', value, ttl);
const data = await cache.get('key');
await cache.delete('key');
const keys = await cache.keys('pattern:*');
```

### Adapter Selection

```javascript
// Development - fast, no setup
await build({
  cache: { type: 'memory' }
});

// Production - persistent, distributed
await build({
  cache: {
    type: 'redis',
    database: {
      host: 'localhost',
      port: 6379
    }
  }
});
```

### Common Patterns

**Cache-Aside**:

```javascript
async function getData(id) {
  // Try cache first
  let data = await cache.get(`data:${id}`);
  if (data) return data;
  
  // Cache miss - fetch from DB
  data = await db.find(id);
  
  // Store in cache
  await cache.set(`data:${id}`, data, 300000);
  
  return data;
}
```

**Write-Through**:

```javascript
async function updateData(id, updates) {
  // Update DB
  const data = await db.update(id, updates);
  
  // Update cache
  await cache.set(`data:${id}`, data, 300000);
  
  return data;
}
```

---

## Extension System

### What are Extensions?

npm packages that add functionality to Triva.

### Types of Extensions

**1. Middleware Extensions**

Add request/response processing:

```javascript
import cors from '@triva/cors';

use(cors({
  origin: 'https://example.com'
}));
```

**2. Database Adapters**

Add cache backends:

```javascript
await build({
  cache: {
    type: 'dynamodb',  // Custom adapter
    database: { ... }
  }
});
```

**3. Utility Extensions**

Helper functions:

```javascript
import { sign, protect } from '@triva/jwt';

const token = sign(payload, secret);
get('/protected', protect(), handler);
```

### Extension Lifecycle

**1. Installation**:
```bash
npm install @triva/extension-name
```

**2. Import**:
```javascript
import extension from '@triva/extension-name';
```

**3. Configuration**:
```javascript
use(extension({
  option1: 'value1',
  option2: 'value2'
}));
```

**4. Usage**:
```javascript
// Extension adds functionality to req/res
get('/route', (req, res) => {
  // Use extension features
});
```

---

## Key Principles

### 1. Convention Over Configuration

Sensible defaults, minimal config required:

```javascript
// Minimal setup
await build({ cache: { type: 'memory' } });

get('/', (req, res) => {
  res.json({ hello: 'world' });
});

listen(3000);
```

### 2. Explicit Over Implicit

Clear, predictable behavior:

```javascript
// ✅ Good - explicit
await cache.set('key', value, 3600000);  // 1 hour TTL

// ❌ Bad - implicit
await cache.set('key', value);  // How long does it stay?
```

### 3. Composition Over Inheritance

Build features by combining functions:

```javascript
// Compose middleware
const authChain = [
  extractToken,
  verifyToken,
  loadUser
];

get('/api/profile', ...authChain, handler);
```

### 4. Fail Fast

Errors surface immediately:

```javascript
// ✅ Throws immediately if misconfigured
await build({
  cache: {
    type: 'redis'
    // Missing required 'database' config
  }
});
```

---

## Performance Characteristics

### Request Handling

- **Cold start**: ~1ms (first request)
- **Hot path**: <0.1ms (cached routes)
- **Middleware overhead**: ~0.01ms per middleware

### Memory Usage

- **Base**: ~10MB (core framework)
- **Memory cache**: ~2KB per entry (varies by data)
- **Per connection**: ~2KB

### Throughput

- **Simple routes**: 50,000+ req/sec
- **With middleware**: 30,000+ req/sec
- **With cache**: 40,000+ req/sec

*Benchmarks on Node 20, single core*

---

## Comparison with Express

### Similarities

- Middleware-based architecture
- Route handlers
- Request/response objects
- Plugin/extension system

### Differences

| Feature | Triva | Express |
|---------|-------|---------|
| **Dependencies** | Zero | 30+ packages |
| **Built-in cache** | ✅ Yes | ❌ No |
| **Async/await** | ✅ Native | ⚠️ Requires wrapper |
| **TypeScript** | ✅ Types included | ⚠️ @types/express |
| **Bundle size** | ~50KB | ~200KB |
| **Learning curve** | Lower | Higher |

### Migration Example

**Express**:
```javascript
const express = require('express');
const app = express();

app.get('/api/data', (req, res) => {
  res.json({ data: [] });
});

app.listen(3000);
```

**Triva**:
```javascript
import { build, get, listen } from 'triva';

await build({ cache: { type: 'memory' } });

get('/api/data', (req, res) => {
  res.json({ data: [] });
});

listen(3000);
```

---

## Next Steps

- **[Configuration Guide](configuration.md)** - All config options
- **[Routing Guide](routing.md)** - URL patterns and handlers
- **[Middleware Guide](../middleware/overview.md)** - Deep dive
- **[Performance Guide](performance.md)** - Optimization

---

**Questions?** [GitHub Discussions](https://github.com/trivajs/triva/discussions)
