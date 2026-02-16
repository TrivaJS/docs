# Custom Middleware

Complete guide to building your own middleware for Triva applications.

## Table of Contents

- [Overview](#overview)
- [Middleware Basics](#middleware-basics)
- [Creating Middleware](#creating-middleware)
- [Common Patterns](#common-patterns)
- [Advanced Techniques](#advanced-techniques)
- [Testing](#testing)
- [Best Practices](#best-practices)

---

## Overview

Custom middleware allows you to extend Triva's functionality with your own request/response processing logic.

### What You Can Build

- Authentication systems
- Authorization checks
- Request validation
- Response compression
- Custom logging
- Request transformation
- Caching strategies
- API key validation
- And much more...

---

## Middleware Basics

### Signature

```javascript
function middleware(req, res, next) {
  // req  - Request object (Node.js IncomingMessage)
  // res  - Response object (Node.js ServerResponse)
  // next - Function to call next middleware
}
```

### Execution Flow

```javascript
// Middleware 1
function first(req, res, next) {
  console.log('First middleware');
  next();  // Pass to next middleware
}

// Middleware 2
function second(req, res, next) {
  console.log('Second middleware');
  next();
}

// Middleware 3 - Terminates
function third(req, res, next) {
  console.log('Third middleware');
  res.json({ message: 'Done' });
  // Don't call next() - request ends here
}

// Apply middleware
use(first);
use(second);
use(third);

// Output:
// First middleware
// Second middleware
// Third middleware
// → Response sent
```

---

## Creating Middleware

### Simple Middleware

```javascript
import { use } from 'triva';

// Add timestamp to request
function timestampMiddleware(req, res, next) {
  req.timestamp = Date.now();
  next();
}

use(timestampMiddleware);

// Use in routes
get('/', (req, res) => {
  res.json({ timestamp: req.timestamp });
});
```

### Middleware with Configuration

```javascript
// Factory function pattern
function createLogger(options = {}) {
  const { prefix = '[LOG]', enabled = true } = options;

  return (req, res, next) => {
    if (!enabled) return next();

    console.log(`${prefix} ${req.method} ${req.url}`);
    next();
  };
}

// Usage
use(createLogger({ prefix: '[API]', enabled: true }));
```

### Async Middleware

```javascript
function asyncMiddleware(req, res, next) {
  // Option 1: Use async/await
  (async () => {
    try {
      req.user = await fetchUser(req.headers.authorization);
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  })();
}

// Option 2: Use Promises
function asyncMiddleware2(req, res, next) {
  fetchUser(req.headers.authorization)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => {
      res.status(401).json({ error: 'Unauthorized' });
    });
}

use(asyncMiddleware);
```

---

## Common Patterns

### 1. Authentication Middleware

```javascript
import jwt from 'jsonwebtoken';

function authMiddleware(req, res, next) {
  // Extract token
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'No authorization header'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'No token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      details: error.message
    });
  }
}

// Apply globally
use(authMiddleware);

// Or per-route
get('/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

### 2. Role-Based Authorization

```javascript
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
}

// Usage
get('/admin/users', requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin only' });
});

get('/moderator/posts', requireRole('admin', 'moderator'), (req, res) => {
  res.json({ message: 'Admin or moderator' });
});
```

### 3. Request Validation

```javascript
function validateBody(schema) {
  return async (req, res, next) => {
    // Only validate POST/PUT/PATCH
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }

    try {
      // Parse body
      const body = await req.json();

      // Validate against schema
      const errors = [];

      for (const [field, rules] of Object.entries(schema)) {
        const value = body[field];

        // Required check
        if (rules.required && !value) {
          errors.push(`${field} is required`);
          continue;
        }

        // Type check
        if (value && rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be ${rules.type}`);
        }

        // Min length
        if (value && rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        // Custom validator
        if (value && rules.validator && !rules.validator(value)) {
          errors.push(rules.message || `${field} is invalid`);
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      req.body = body;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON' });
    }
  };
}

// Usage
const userSchema = {
  email: {
    required: true,
    type: 'string',
    validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: 'Invalid email format'
  },
  password: {
    required: true,
    type: 'string',
    minLength: 8
  },
  age: {
    type: 'number',
    validator: (v) => v >= 18,
    message: 'Must be 18 or older'
  }
};

post('/api/users', validateBody(userSchema), (req, res) => {
  res.json({ user: req.body });
});
```

### 4. CORS Middleware

```javascript
function corsMiddleware(options = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = false,
    maxAge = 86400
  } = options;

  return (req, res, next) => {
    // Set CORS headers
    if (Array.isArray(origin)) {
      const requestOrigin = req.headers.origin;
      if (origin.includes(requestOrigin)) {
        res.header('Access-Control-Allow-Origin', requestOrigin);
      }
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', methods.join(','));
    res.header('Access-Control-Allow-Headers', allowedHeaders.join(','));
    res.header('Access-Control-Max-Age', maxAge.toString());

    if (credentials) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }

    next();
  };
}

// Usage
use(corsMiddleware({
  origin: ['https://example.com', 'https://app.example.com'],
  credentials: true
}));
```

### 5. Request ID Tracking

```javascript
import crypto from 'crypto';

function requestIdMiddleware(req, res, next) {
  // Use existing ID or generate new
  const requestId =
    req.headers['x-request-id'] ||
    crypto.randomUUID();

  req.id = requestId;
  res.header('X-Request-ID', requestId);

  next();
}

use(requestIdMiddleware);

// Use in logs
get('/', (req, res) => {
  console.log(`[${req.id}] Handling request`);
  res.json({ requestId: req.id });
});
```

### 6. Response Time Tracking

```javascript
function responseTimeMiddleware(req, res, next) {
  const start = Date.now();

  // Intercept response end
  const originalEnd = res.end;

  res.end = function(...args) {
    const duration = Date.now() - start;
    res.header('X-Response-Time', `${duration}ms`);

    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.url} - ${duration}ms`);
    }

    // Call original end
    originalEnd.apply(res, args);
  };

  next();
}

use(responseTimeMiddleware);
```

### 7. Request Size Limit

```javascript
function sizeLimitMiddleware(maxBytes = 1024 * 1024) {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: 'Request entity too large',
        limit: maxBytes,
        received: contentLength
      });
    }

    next();
  };
}

// Limit to 5MB
use(sizeLimitMiddleware(5 * 1024 * 1024));
```

### 8. API Version Middleware

```javascript
function apiVersionMiddleware(req, res, next) {
  // Get version from header or URL
  const versionHeader = req.headers['api-version'];
  const urlVersion = req.url.match(/^\/v(\d+)\//)?.[1];

  req.apiVersion = versionHeader || urlVersion || '1';

  // Add version to response
  res.header('API-Version', req.apiVersion);

  next();
}

use(apiVersionMiddleware);

// Use in routes
get('/api/users', (req, res) => {
  if (req.apiVersion === '2') {
    // V2 logic
    res.json({ version: 2, users: [] });
  } else {
    // V1 logic
    res.json({ users: [] });
  }
});
```

---

## Advanced Techniques

### Conditional Middleware

```javascript
function conditionalMiddleware(condition, middleware) {
  return (req, res, next) => {
    if (condition(req)) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}

// Only log API requests
use(conditionalMiddleware(
  (req) => req.url.startsWith('/api/'),
  loggerMiddleware
));
```

### Middleware Composition

```javascript
function compose(...middlewares) {
  return (req, res, next) => {
    let index = 0;

    function dispatch() {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];
      middleware(req, res, dispatch);
    }

    dispatch();
  };
}

// Usage
const authChain = compose(
  extractToken,
  verifyToken,
  loadUser
);

use(authChain);
```

### Error Handling Wrapper

```javascript
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
}

// Usage
use(asyncHandler(async (req, res, next) => {
  req.data = await fetchData();
  next();
}));
```

### Middleware with Cleanup

```javascript
function resourceMiddleware(req, res, next) {
  // Acquire resource
  const connection = acquireConnection();
  req.connection = connection;

  // Cleanup on response finish
  res.on('finish', () => {
    connection.release();
    console.log('Connection released');
  });

  // Cleanup on error
  res.on('error', () => {
    connection.release();
    console.log('Connection released (error)');
  });

  next();
}
```

---

## Testing

### Unit Testing

```javascript
import assert from 'assert';

// Create mock objects
function createMocks() {
  const req = {
    method: 'GET',
    url: '/',
    headers: {}
  };

  const res = {
    statusCode: 200,
    headers: {},
    headersSent: false,

    header(key, value) {
      this.headers[key] = value;
      return this;
    },

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(data) {
      this.body = data;
      this.headersSent = true;
    },

    send(data) {
      this.body = data;
      this.headersSent = true;
    }
  };

  let nextCalled = false;
  const next = () => { nextCalled = true; };

  return { req, res, next, nextCalled: () => nextCalled };
}

// Test authentication middleware
function testAuthMiddleware() {
  const { req, res, next, nextCalled } = createMocks();

  // Test: No token
  authMiddleware(req, res, next);
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled(), false);

  console.log('✅ Auth middleware tests passed');
}

testAuthMiddleware();
```

### Integration Testing

```javascript
import { build, get, use } from 'triva';

async function testMiddlewareChain() {
  // Setup
  await build({ cache: { type: 'memory' } });

  const callOrder = [];

  use((req, res, next) => {
    callOrder.push('first');
    next();
  });

  use((req, res, next) => {
    callOrder.push('second');
    next();
  });

  get('/test', (req, res) => {
    callOrder.push('handler');
    res.json({ order: callOrder });
  });

  // Test with HTTP request
  const response = await fetch('http://localhost:3000/test');
  const data = await response.json();

  assert.deepEqual(data.order, ['first', 'second', 'handler']);
  console.log('✅ Middleware chain test passed');
}
```

---

## Best Practices

### 1. Always Call next()

```javascript
// ✅ Good
function middleware(req, res, next) {
  doSomething();
  next();  // Continue chain
}

// ❌ Bad - chain breaks
function middleware(req, res, next) {
  doSomething();
  // Forgot next()
}
```

### 2. Handle Errors Properly

```javascript
// ✅ Good
function middleware(req, res, next) {
  try {
    doSomething();
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ❌ Bad - unhandled error crashes server
function middleware(req, res, next) {
  doSomething();  // Might throw
  next();
}
```

### 3. Keep Middleware Focused

```javascript
// ✅ Good - single responsibility
function authMiddleware(req, res, next) {
  // Only handles authentication
  verifyToken(req.headers.authorization);
  next();
}

// ❌ Bad - too many responsibilities
function godMiddleware(req, res, next) {
  verifyToken();
  checkPermissions();
  validateRequest();
  logRequest();
  transformData();
  next();
}
```

### 4. Use Configuration Functions

```javascript
// ✅ Good - configurable
function createLogger(options) {
  return (req, res, next) => {
    if (options.enabled) {
      console.log(`${options.prefix} ${req.url}`);
    }
    next();
  };
}

// ❌ Bad - hardcoded
function logger(req, res, next) {
  console.log(req.url);
  next();
}
```

### 5. Document Your Middleware

```javascript
/**
 * Authentication middleware using JWT tokens.
 *
 * Expects Authorization header: "Bearer <token>"
 * Adds req.user object with decoded token data.
 *
 * @param {IncomingMessage} req - Request object
 * @param {ServerResponse} res - Response object
 * @param {Function} next - Next middleware function
 *
 * @example
 * use(authMiddleware);
 * get('/protected', (req, res) => {
 *   console.log(req.user.id);
 * });
 */
function authMiddleware(req, res, next) {
  // Implementation
}
```

### 6. Test Edge Cases

```javascript
// Test all paths
function testMiddleware() {
  // Test: Valid input
  // Test: Invalid input
  // Test: Missing input
  // Test: Async errors
  // Test: Next() called
  // Test: Response sent
}
```

---

## Complete Example

```javascript
import { build, use, get, post } from 'triva';
import jwt from 'jsonwebtoken';

// 1. Request ID middleware
function requestIdMiddleware(req, res, next) {
  req.id = crypto.randomUUID();
  res.header('X-Request-ID', req.id);
  next();
}

// 2. CORS middleware
function corsMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');

  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  next();
}

// 3. Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// 4. Logging middleware
function loggingMiddleware(req, res, next) {
  console.log(`[${req.id}] ${req.method} ${req.url}`);
  next();
}

// Apply middleware
await build({ cache: { type: 'memory' } });

use(requestIdMiddleware);
use(corsMiddleware);
use(loggingMiddleware);

// Public route - no auth
get('/public', (req, res) => {
  res.json({ message: 'Public data' });
});

// Protected route - requires auth
get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected data',
    user: req.user
  });
});

listen(3000);
```

---

## Next Steps

- **[Middleware Stack](middleware-stack.md)** - Understanding execution order
- **[Best Practices](best-practices.md)** - Production patterns
- **[Throttling](throttling.md)** - Built-in rate limiting
- **[Logging](logging.md)** - Built-in request logging

---

**Need help?** [GitHub Issues](https://github.com/trivajs/triva/issues) | [Discord](https://discord.gg/triva)
