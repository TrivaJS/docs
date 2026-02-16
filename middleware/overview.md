# Middleware Overview

Triva's middleware system provides powerful request/response processing capabilities. This guide covers the complete middleware architecture and how to use it effectively.

## Table of Contents

- [What is Middleware?](#what-is-middleware)
- [Built-in Middleware](#built-in-middleware)
- [How Middleware Works](#how-middleware-works)
- [Quick Start](#quick-start)
- [Middleware Order](#middleware-order)
- [Common Use Cases](#common-use-cases)

---

## What is Middleware?

Middleware are functions that execute during the request-response cycle. They can:

- Modify requests before they reach route handlers
- Modify responses before sending to clients
- Terminate requests early (authentication, rate limiting)
- Add data to request objects
- Log requests and errors
- Handle errors centrally

### Middleware Flow

```
Incoming Request
      ↓
[Middleware 1] → Transform request
      ↓
[Middleware 2] → Check authentication
      ↓
[Middleware 3] → Rate limiting
      ↓
Route Handler → Process request
      ↓
[Response] → Send to client
```

---

## Built-in Middleware

Triva includes several production-ready middleware:

### 1. Throttle Middleware

Rate limiting and DDoS protection.

```javascript
await build({
  throttle: {
    limit: 100,              // Max requests
    window_ms: 60000,        // Per minute
    burst_limit: 20,         // Max burst
    ban_threshold: 5,        // Violations before ban
    ban_ms: 86400000        // 24 hour ban
  }
});
```

**Features:**
- Sliding window rate limiting
- Burst protection
- Automatic IP banning
- Bot detection

[Full Throttling Guide →](throttling.md)

### 2. Request Logger

Comprehensive request/response logging.

```javascript
import { log } from 'triva';

await build({
  retention: {
    enabled: true,
    maxEntries: 100000
  }
});

// Access logs
const logs = await log.getAll();
const filtered = await log.filter({ method: 'POST' });
```

**Features:**
- Request details (method, URL, headers)
- Response status and timing
- User-Agent parsing
- Configurable retention

[Full Logging Guide →](logging.md)

### 3. Auto-Redirect

Intelligent traffic routing for AI, bots, and crawlers.

```javascript
await build({
  redirects: {
    enabled: true,
    redirectAI: true,           // Claude, GPT, Gemini
    redirectBots: true,         // Googlebot, Bingbot
    redirectCrawlers: true,     // Archive.org
    destination: '/api-docs',
    whitelist: ['Googlebot']    // Exceptions
  }
});
```

**Features:**
- 65+ User-Agent patterns
- Custom redirect rules
- Whitelist support
- Dynamic destinations

[Full Auto-Redirect Guide →](auto-redirect.md)

### 4. Error Tracker

Centralized error capture and analysis.

```javascript
import { errorTracker } from 'triva';

await build({
  errorTracking: {
    enabled: true
  }
});

// Access errors
const errors = await errorTracker.getAll();
const recent = await errorTracker.getRecent(10);
```

**Features:**
- Automatic error capture
- Error categorization
- Stack trace storage
- Error analytics

[Full Error Tracking Guide →](error-tracking.md)

---

## How Middleware Works

### Middleware Signature

```javascript
function middleware(req, res, next) {
  // req  - Request object
  // res  - Response object
  // next - Call to continue to next middleware
}
```

### Execution Flow

```javascript
// Middleware 1: Add timestamp
function timestamp(req, res, next) {
  req.timestamp = Date.now();
  next();  // ✅ Continue to next middleware
}

// Middleware 2: Check authentication
function auth(req, res, next) {
  if (!req.headers.authorization) {
    res.status(401).json({ error: 'Unauthorized' });
    return;  // ❌ Stop here, don't call next()
  }
  next();  // ✅ Continue
}

// Middleware 3: Log request
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

// Apply middleware
use(timestamp);
use(auth);
use(logger);
```

### Order Matters!

```javascript
// ✅ Correct order
use(timestamp);      // 1. Add timestamp first
use(auth);          // 2. Check auth
use(rateLimiter);   // 3. Rate limit authenticated users
use(logger);        // 4. Log successful requests

// ❌ Wrong order
use(logger);        // Logs even blocked requests
use(rateLimiter);   // Limits before auth check
use(auth);          // Auth happens last
```

---

## Quick Start

### Basic Usage

```javascript
import { build, use, get } from 'triva';

// Build server
await build({
  cache: { type: 'memory' }
});

// Add custom middleware
use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.url}`);
  next();
});

// Define routes
get('/', (req, res) => {
  res.json({ message: 'Hello!' });
});
```

### With Built-in Middleware

```javascript
await build({
  // Throttling
  throttle: {
    limit: 100,
    window_ms: 60000
  },

  // Logging
  retention: {
    enabled: true,
    maxEntries: 50000
  },

  // Auto-redirect
  redirects: {
    enabled: true,
    redirectAI: true,
    destination: '/api-docs'
  },

  // Error tracking
  errorTracking: {
    enabled: true
  }
});
```

### Custom Middleware Chain

```javascript
import { build, use, get } from 'triva';

// CORS middleware
use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

// Request ID middleware
use((req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.header('X-Request-ID', req.id);
  next();
});

// Timing middleware
use((req, res, next) => {
  const start = Date.now();

  // Intercept response end
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    res.header('X-Response-Time', `${duration}ms`);
    originalEnd.apply(res, args);
  };

  next();
});

// Routes
get('/', (req, res) => {
  res.json({ id: req.id });
});
```

---

## Middleware Order

### Recommended Order

```javascript
await build({
  // 1. Redirects (before everything)
  redirects: {
    enabled: true,
    redirectBots: true
  },

  // 2. Throttling (after redirects)
  throttle: {
    limit: 100,
    window_ms: 60000
  },

  // 3. Logging (after throttle)
  retention: {
    enabled: true
  }
});

// 4. CORS (allow cross-origin)
use(corsMiddleware);

// 5. Authentication
use(authMiddleware);

// 6. Request parsing (if needed)
use(bodyParserMiddleware);

// 7. Your custom middleware
use(customMiddleware);

// 8. Routes (last)
get('/', handler);
```

### Why This Order?

1. **Redirects** - Route unwanted traffic early
2. **Throttle** - Block excessive requests
3. **Logging** - Log successful requests
4. **CORS** - Handle preflight requests
5. **Auth** - Verify identity
6. **Parsing** - Process request body
7. **Custom** - Your business logic
8. **Routes** - Handle the request

---

## Common Use Cases

### 1. Authentication Middleware

```javascript
import jwt from 'jsonwebtoken';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Apply to all routes
use(authMiddleware);

// Or specific routes only
get('/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

### 2. CORS Middleware

```javascript
function corsMiddleware(req, res, next) {
  const allowedOrigins = [
    'https://example.com',
    'https://app.example.com'
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  next();
}

use(corsMiddleware);
```

### 3. Request Validation

```javascript
function validateJson(req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];

    if (!contentType?.includes('application/json')) {
      return res.status(400).json({
        error: 'Content-Type must be application/json'
      });
    }
  }

  next();
}

use(validateJson);
```

### 4. API Key Middleware

```javascript
function apiKeyMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // Validate against database or cache
  const valid = await validateApiKey(apiKey);

  if (!valid) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  req.apiKey = apiKey;
  next();
}

// Apply to API routes only
get('/api/*', apiKeyMiddleware);
```

### 5. Request Timeout

```javascript
function timeoutMiddleware(ms = 30000) {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.writableEnded) {
        res.status(408).json({ error: 'Request timeout' });
      }
    }, ms);

    // Clear timeout when response ends
    res.on('finish', () => clearTimeout(timeout));

    next();
  };
}

use(timeoutMiddleware(10000));  // 10 second timeout
```

### 6. Request Size Limit

```javascript
function sizeLimitMiddleware(maxBytes = 1024 * 1024) {  // 1MB
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: 'Request too large',
        max: maxBytes,
        received: contentLength
      });
    }

    next();
  };
}

use(sizeLimitMiddleware(5 * 1024 * 1024));  // 5MB limit
```

### 7. Request ID Tracking

```javascript
import crypto from 'crypto';

function requestIdMiddleware(req, res, next) {
  // Use existing ID or generate new one
  const requestId = req.headers['x-request-id'] ||
                    crypto.randomUUID();

  req.id = requestId;
  res.header('X-Request-ID', requestId);

  next();
}

use(requestIdMiddleware);

// Use in logs
get('/', (req, res) => {
  console.log(`[${req.id}] Processing request`);
  res.json({ requestId: req.id });
});
```

### 8. Response Compression

```javascript
import zlib from 'zlib';

function compressionMiddleware(req, res, next) {
  const acceptEncoding = req.headers['accept-encoding'] || '';

  // Check if client supports gzip
  if (!acceptEncoding.includes('gzip')) {
    return next();
  }

  // Override json method to compress
  const originalJson = res.json;
  res.json = function(data) {
    const json = JSON.stringify(data);

    zlib.gzip(json, (err, compressed) => {
      if (err) return originalJson.call(res, data);

      res.header('Content-Encoding', 'gzip');
      res.header('Content-Type', 'application/json');
      res.end(compressed);
    });
  };

  next();
}

use(compressionMiddleware);
```

---

## Error Handling in Middleware

### Basic Error Handling

```javascript
function errorHandlingMiddleware(req, res, next) {
  try {
    // Your middleware logic
    next();
  } catch (error) {
    console.error('Middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Async Error Handling

```javascript
function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);  // Pass errors to error handler
  };
}

// Usage
use(asyncMiddleware(async (req, res, next) => {
  req.user = await fetchUser(req.headers.authorization);
  next();
}));
```

### Global Error Handler

```javascript
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Custom error types
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Default error
  res.status(500).json({ error: 'Internal server error' });
}

// Apply as last middleware
use(errorHandler);
```

---

## Testing Middleware

```javascript
import assert from 'assert';

// Test helper
function createMocks() {
  const req = {
    headers: {},
    method: 'GET',
    url: '/'
  };

  const res = {
    statusCode: 200,
    headers: {},
    header: function(key, value) {
      this.headers[key] = value;
    },
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.body = data;
    }
  };

  const next = () => {};

  return { req, res, next };
}

// Test auth middleware
const { req, res, next } = createMocks();
req.headers.authorization = 'Bearer valid-token';

authMiddleware(req, res, next);
assert.equal(res.statusCode, 200);
```

---

## Performance Considerations

### 1. Keep Middleware Lightweight

```javascript
// ❌ Heavy operation in middleware
use((req, res, next) => {
  const data = expensiveDatabaseQuery();  // Slow!
  req.data = data;
  next();
});

// ✅ Do heavy operations in route handlers
use((req, res, next) => {
  req.timestamp = Date.now();  // Fast!
  next();
});
```

### 2. Avoid Unnecessary Middleware

```javascript
// ❌ Apply to all routes
use(expensiveMiddleware);

// ✅ Apply only where needed
get('/admin/*', expensiveMiddleware);
```

### 3. Early Exit

```javascript
// ✅ Exit early when possible
use((req, res, next) => {
  if (req.url === '/health') {
    return res.send('OK');  // Don't run other middleware
  }
  next();
});
```

---

## Best Practices

1. **Always call `next()`** - Unless you're ending the request
2. **Order matters** - Put fastest/most common first
3. **Handle errors** - Use try/catch in async middleware
4. **Keep it simple** - One responsibility per middleware
5. **Test thoroughly** - Middleware affects all routes
6. **Document well** - Explain what each middleware does
7. **Monitor performance** - Track middleware execution time
8. **Use built-in first** - Don't reinvent the wheel

---

## Next Steps

- **[Throttling Guide](throttling.md)** - Rate limiting and DDoS protection
- **[Logging Guide](logging.md)** - Request/response logging
- **[Auto-Redirect Guide](auto-redirect.md)** - Smart traffic routing
- **[Error Tracking Guide](error-tracking.md)** - Error management
- **[Custom Middleware](custom-middleware.md)** - Build your own
- **[Middleware Stack](middleware-stack.md)** - Execution order
- **[Best Practices](best-practices.md)** - Production tips

---

**Questions?** Check the [API Reference](../api-reference/) or [open an issue](https://github.com/trivajs/triva/issues).
