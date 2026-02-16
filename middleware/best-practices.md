# Middleware Best Practices

Production-ready patterns and guidelines for building robust Triva applications.

## Table of Contents

- [Design Principles](#design-principles)
- [Performance](#performance)
- [Security](#security)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Production Checklist](#production-checklist)

---

## Design Principles

### 1. Single Responsibility

Each middleware should do one thing well.

```javascript
// ✅ Good - single responsibility
function authMiddleware(req, res, next) {
  // Only handles authentication
  const token = req.headers.authorization;
  req.user = verifyToken(token);
  next();
}

function loggingMiddleware(req, res, next) {
  // Only handles logging
  console.log(`${req.method} ${req.url}`);
  next();
}

// ❌ Bad - multiple responsibilities
function godMiddleware(req, res, next) {
  verifyToken(req);
  logRequest(req);
  validateBody(req);
  checkPermissions(req);
  transformData(req);
  next();
}
```

### 2. Composability

Build small, reusable pieces.

```javascript
// ✅ Good - composable
function extractToken(req, res, next) {
  const authHeader = req.headers.authorization;
  req.token = authHeader?.split(' ')[1];
  next();
}

function verifyToken(req, res, next) {
  if (!req.token) {
    return res.status(401).json({ error: 'No token' });
  }
  req.user = jwt.verify(req.token, SECRET);
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Compose as needed
use(extractToken);
use(verifyToken);
get('/admin/*', requireRole('admin'));
```

### 3. Fail Fast

Validate early, return errors immediately.

```javascript
// ✅ Good - fail fast
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  // Check 1: Token exists
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  // Check 2: Token valid
  try {
    req.user = jwt.verify(token, SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Check 3: User active
  if (!req.user.active) {
    return res.status(403).json({ error: 'Account disabled' });
  }

  next();
}

// ❌ Bad - late validation
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, SECRET);
      if (req.user.active) {
        next();
      } else {
        res.status(403).json({ error: 'Account disabled' });
      }
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    res.status(401).json({ error: 'No token' });
  }
}
```

### 4. Defensive Programming

Don't trust input, handle all edge cases.

```javascript
// ✅ Good - defensive
function userIdMiddleware(req, res, next) {
  const userId = req.params.id;

  // Validate exists
  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  // Validate format
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  // Validate range
  const id = parseInt(userId);
  if (id < 1 || id > 999999999) {
    return res.status(400).json({ error: 'User ID out of range' });
  }

  req.userId = id;
  next();
}
```

---

## Performance

### 1. Avoid Synchronous Operations

```javascript
// ❌ Bad - blocks event loop
use((req, res, next) => {
  const data = fs.readFileSync('./config.json');
  req.config = JSON.parse(data);
  next();
});

// ✅ Good - async
use(async (req, res, next) => {
  try {
    const data = await fs.promises.readFile('./config.json');
    req.config = JSON.parse(data);
    next();
  } catch (error) {
    res.status(500).json({ error: 'Config load failed' });
  }
});

// ✅ Better - cache config
let configCache = null;

use((req, res, next) => {
  if (!configCache) {
    configCache = JSON.parse(fs.readFileSync('./config.json'));
  }
  req.config = configCache;
  next();
});
```

### 2. Cache Expensive Operations

```javascript
// ❌ Bad - database query every request
use(async (req, res, next) => {
  req.settings = await db.getSettings();
  next();
});

// ✅ Good - cache with TTL
const settingsCache = {
  data: null,
  expires: 0
};

use(async (req, res, next) => {
  const now = Date.now();

  if (!settingsCache.data || now > settingsCache.expires) {
    settingsCache.data = await db.getSettings();
    settingsCache.expires = now + 300000;  // 5 minutes
  }

  req.settings = settingsCache.data;
  next();
});
```

### 3. Early Exit for Fast Paths

```javascript
// ✅ Good - skip middleware for health checks
use((req, res, next) => {
  // Fast path - no middleware needed
  if (req.url === '/health' || req.url === '/ping') {
    return res.send('OK');
  }
  next();
});

// Expensive middleware below
use(authMiddleware);
use(databaseMiddleware);
```

### 4. Lazy Load Heavy Dependencies

```javascript
// ✅ Good - only load when needed
let heavyParser = null;

use((req, res, next) => {
  if (req.headers['content-type']?.includes('application/xml')) {
    if (!heavyParser) {
      heavyParser = require('heavy-xml-parser');
    }
    req.parseXML = heavyParser.parse;
  }
  next();
});
```

### 5. Batch Database Queries

```javascript
// ❌ Bad - N queries
use(async (req, res, next) => {
  req.user = await db.getUser(req.userId);
  req.profile = await db.getProfile(req.userId);
  req.settings = await db.getSettings(req.userId);
  next();
});

// ✅ Good - single query
use(async (req, res, next) => {
  const data = await db.getUserData(req.userId);
  req.user = data.user;
  req.profile = data.profile;
  req.settings = data.settings;
  next();
});
```

---

## Security

### 1. Validate All Input

```javascript
// ✅ Comprehensive validation
function validateUserInput(req, res, next) {
  const { email, password, name } = req.body;

  // Email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Password strength
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password too short' });
  }

  // Name sanitization
  if (name && /<[^>]*>/g.test(name)) {
    return res.status(400).json({ error: 'Invalid characters in name' });
  }

  next();
}
```

### 2. Rate Limit Aggressively

```javascript
// ✅ Different limits for different endpoints
await build({
  throttle: {
    limit: 1000,        // General limit
    window_ms: 60000
  }
});

// Stricter for auth endpoints
const authLimiter = createThrottle({
  limit: 5,            // Only 5 attempts
  window_ms: 60000,
  ban_threshold: 3,
  ban_ms: 3600000     // 1 hour ban
});

post('/auth/login', authLimiter, loginHandler);
post('/auth/register', authLimiter, registerHandler);
```

### 3. Sanitize Errors

```javascript
// ❌ Bad - leaks internal info
function errorHandler(err, req, res, next) {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    query: req.query
  });
}

// ✅ Good - safe error messages
function errorHandler(err, req, res, next) {
  // Log detailed error internally
  console.error('Error:', err);

  // Return generic message
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  });
}
```

### 4. Use Security Headers

```javascript
// ✅ Add security headers
function securityHeadersMiddleware(req, res, next) {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.header('Content-Security-Policy', "default-src 'self'");
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

use(securityHeadersMiddleware);
```

### 5. Prevent Timing Attacks

```javascript
// ❌ Bad - reveals if user exists
async function loginMiddleware(req, res, next) {
  const user = await db.findUser(req.body.email);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });  // Fast
  }

  const valid = await bcrypt.compare(req.body.password, user.hash);  // Slow

  if (!valid) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  next();
}

// ✅ Good - constant time
async function loginMiddleware(req, res, next) {
  const user = await db.findUser(req.body.email);

  // Always perform hash comparison
  const hash = user?.hash || '$2b$10$fakehashfakehashfakehashfakehashfakehash';
  const valid = await bcrypt.compare(req.body.password, hash);

  if (!user || !valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  next();
}
```

---

## Error Handling

### 1. Centralized Error Handler

```javascript
// ✅ Single error handler
function errorHandler(err, req, res, next) {
  // Log error
  console.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Send response
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    requestId: req.id
  });
}

// Apply as last middleware
use(errorHandler);
```

### 2. Async Error Wrapper

```javascript
// ✅ Wrapper for async middleware
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
}

// Usage
use(asyncHandler(async (req, res, next) => {
  req.data = await fetchData();  // Errors caught automatically
  next();
}));
```

### 3. Custom Error Classes

```javascript
// ✅ Typed errors
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
  }
}

class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

// Use in middleware
function authMiddleware(req, res, next) {
  if (!req.headers.authorization) {
    throw new UnauthorizedError('No token provided');
  }
  next();
}

// Handle in error handler
function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      error: err.message,
      field: err.field
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Default error
  res.status(500).json({ error: 'Internal server error' });
}
```

---

## Testing

### 1. Unit Test Middleware

```javascript
import assert from 'assert';

function testAuthMiddleware() {
  const middleware = authMiddleware;

  // Test 1: No token
  {
    const { req, res, next } = createMocks();
    middleware(req, res, next);
    assert.equal(res.statusCode, 401);
  }

  // Test 2: Invalid token
  {
    const { req, res, next } = createMocks();
    req.headers.authorization = 'Bearer invalid';
    middleware(req, res, next);
    assert.equal(res.statusCode, 401);
  }

  // Test 3: Valid token
  {
    const { req, res, next } = createMocks();
    req.headers.authorization = `Bearer ${validToken}`;
    let nextCalled = false;
    middleware(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  }

  console.log('✅ Auth middleware tests passed');
}
```

### 2. Integration Test Stack

```javascript
import { build, use, get } from 'triva';

async function testMiddlewareStack() {
  await build({ cache: { type: 'memory' } });

  const calls = [];

  use((req, res, next) => {
    calls.push('middleware1');
    next();
  });

  use((req, res, next) => {
    calls.push('middleware2');
    next();
  });

  get('/test', (req, res) => {
    calls.push('handler');
    res.json({ calls });
  });

  const response = await fetch('http://localhost:3000/test');
  const data = await response.json();

  assert.deepEqual(data.calls, ['middleware1', 'middleware2', 'handler']);
}
```

### 3. Test Error Handling

```javascript
function testErrorHandling() {
  const errorMiddleware = (req, res, next) => {
    throw new Error('Test error');
  };

  const errorHandler = (err, req, res, next) => {
    res.status(500).json({ error: err.message });
  };

  use(errorMiddleware);
  use(errorHandler);

  // Make request and verify error response
  // assert.equal(response.status, 500);
}
```

---

## Monitoring

### 1. Performance Metrics

```javascript
const metrics = {
  requests: 0,
  errors: 0,
  totalDuration: 0
};

use((req, res, next) => {
  const start = Date.now();

  metrics.requests++;

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.totalDuration += duration;

    if (res.statusCode >= 400) {
      metrics.errors++;
    }
  });

  next();
});

// Report metrics
setInterval(() => {
  const avgDuration = metrics.totalDuration / metrics.requests;
  const errorRate = (metrics.errors / metrics.requests * 100).toFixed(2);

  console.log({
    requests: metrics.requests,
    avgDuration: `${avgDuration.toFixed(2)}ms`,
    errorRate: `${errorRate}%`
  });
}, 60000);
```

### 2. Health Checks

```javascript
const health = {
  uptime: process.uptime(),
  database: 'unknown',
  cache: 'unknown'
};

use(async (req, res, next) => {
  if (req.url === '/health') {
    // Check database
    try {
      await db.ping();
      health.database = 'ok';
    } catch (error) {
      health.database = 'error';
    }

    // Check cache
    try {
      await cache.set('health-check', '1', 1000);
      health.cache = 'ok';
    } catch (error) {
      health.cache = 'error';
    }

    health.uptime = process.uptime();

    const allOk = health.database === 'ok' && health.cache === 'ok';
    return res.status(allOk ? 200 : 503).json(health);
  }

  next();
});
```

### 3. Alert on Anomalies

```javascript
const alerts = {
  errorThreshold: 0.05,  // 5%
  slowThreshold: 1000    // 1 second
};

use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Alert on slow requests
    if (duration > alerts.slowThreshold) {
      sendAlert({
        type: 'slow_request',
        url: req.url,
        duration
      });
    }

    // Alert on errors
    if (res.statusCode >= 500) {
      sendAlert({
        type: 'server_error',
        url: req.url,
        statusCode: res.statusCode
      });
    }
  });

  next();
});
```

---

## Production Checklist

### Before Deployment

- [ ] **Environment Variables** - All secrets in env vars
- [ ] **Error Handling** - Centralized error handler
- [ ] **Logging** - Production logging configured
- [ ] **Rate Limiting** - Throttle enabled
- [ ] **Security Headers** - All headers set
- [ ] **HTTPS** - SSL certificates configured
- [ ] **CORS** - Proper origins configured
- [ ] **Health Checks** - /health endpoint working
- [ ] **Monitoring** - Metrics collection enabled
- [ ] **Alerting** - Critical alerts configured
- [ ] **Tests** - All tests passing
- [ ] **Performance** - Load testing complete

### Configuration Template

```javascript
import { build, use } from 'triva';

// Production configuration
await build({
  env: 'production',

  protocol: 'https',
  ssl: {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT)
  },

  cache: {
    type: 'redis',
    database: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    }
  },

  throttle: {
    limit: 1000,
    window_ms: 60000,
    ban_threshold: 10,
    ban_ms: 3600000
  },

  redirects: {
    enabled: true,
    redirectAI: true,
    destination: '/api-docs'
  },

  retention: {
    enabled: false  // Use external logging
  }
});

// Middleware stack
use(securityHeadersMiddleware);
use(corsMiddleware);
use(requestIdMiddleware);
use(authMiddleware);
use(errorHandler);
```

---

## Summary

**Key Takeaways:**

1. **One responsibility** per middleware
2. **Fail fast** with early validation
3. **Cache** expensive operations
4. **Validate** all input
5. **Handle** all errors
6. **Test** thoroughly
7. **Monitor** in production

---

**Next Steps:**

- Review [Overview](overview.md) for middleware basics
- Check [Throttling](throttling.md) for rate limiting
- Read [Custom Middleware](custom-middleware.md) for advanced patterns
- See [Middleware Stack](middleware-stack.md) for execution order

---

**Questions?** [GitHub Issues](https://github.com/trivajs/triva/issues) | [Discord](https://discord.gg/triva)
