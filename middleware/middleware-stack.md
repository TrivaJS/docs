# Middleware Stack

Understanding middleware execution order and how to optimize your middleware chain.

## Table of Contents

- [What is the Stack?](#what-is-the-stack)
- [Execution Order](#execution-order)
- [Built-in Middleware Order](#built-in-middleware-order)
- [Custom Middleware Placement](#custom-middleware-placement)
- [Stack Optimization](#stack-optimization)
- [Common Mistakes](#common-mistakes)

---

## What is the Stack?

The middleware stack is the ordered sequence of middleware functions that process each request.

### Visualization

```
Request
  ↓
[Middleware 1] → Redirect bots?
  ↓
[Middleware 2] → Rate limiting
  ↓
[Middleware 3] → CORS headers
  ↓
[Middleware 4] → Authentication
  ↓
[Middleware 5] → Logging
  ↓
Route Handler → Process request
  ↓
Response
```

---

## Execution Order

### How Middleware Executes

```javascript
import { build, use, get } from 'triva';

await build({ cache: { type: 'memory' } });

// Middleware 1
use((req, res, next) => {
  console.log('1: Before');
  next();
  console.log('1: After');
});

// Middleware 2
use((req, res, next) => {
  console.log('2: Before');
  next();
  console.log('2: After');
});

// Route
get('/', (req, res) => {
  console.log('Handler');
  res.json({ ok: true });
});

// Request → Output:
// 1: Before
// 2: Before
// Handler
// 2: After
// 1: After
```

### Stack vs Onion Model

```
Stack Model (Linear):
Request → M1 → M2 → M3 → Handler → Response

Onion Model (Nested):
Request → [M1 → [M2 → [M3 → Handler] ← M3] ← M2] ← M1 → Response
```

---

## Built-in Middleware Order

### Default Order in Triva

```javascript
await build({
  // 1. Auto-Redirect (earliest)
  redirects: {
    enabled: true,
    redirectBots: true
  },

  // 2. Throttle (after redirect)
  throttle: {
    limit: 100,
    window_ms: 60000
  },

  // 3. Logging (after throttle)
  retention: {
    enabled: true
  },

  // 4. Error Tracking (last)
  errorTracking: {
    enabled: true
  }
});
```

### Why This Order?

**1. Redirects First**
- Fastest to execute
- Routes unwanted traffic early
- Saves processing for other middleware

**2. Throttle Second**
- Blocks excessive requests
- Prevents resource exhaustion
- Works after redirects (don't throttle redirected traffic)

**3. Logging Third**
- Logs successful requests
- Doesn't log throttled/redirected requests
- More meaningful logs

**4. Error Tracking Last**
- Catches errors from all middleware
- Comprehensive error coverage

---

## Custom Middleware Placement

### Recommended Stack

```javascript
await build({
  // Built-in middleware
  redirects: { enabled: true },
  throttle: { limit: 100, window_ms: 60000 },
  retention: { enabled: true }
});

// 1. CORS (allow cross-origin)
use(corsMiddleware);

// 2. Request ID (tracking)
use(requestIdMiddleware);

// 3. Body parser (if needed)
use(bodyParserMiddleware);

// 4. Authentication
use(authMiddleware);

// 5. Authorization
use(authorizationMiddleware);

// 6. Request validation
use(validationMiddleware);

// 7. Your custom logic
use(customBusinessLogic);

// 8. Routes (last)
get('/api/users', handler);
```

### Placement Guidelines

| Type | Position | Reason |
|------|----------|--------|
| **Security** (CORS, Helmet) | Early | Apply to all requests |
| **Tracking** (Request ID) | Early | Track entire request lifecycle |
| **Authentication** | Middle | After parsing, before business logic |
| **Authorization** | After Auth | Needs user context |
| **Validation** | After Auth | Validate authenticated requests |
| **Business Logic** | Late | Last before routes |
| **Error Handling** | Last | Catch all errors |

---

## Stack Optimization

### 1. Early Exit Pattern

```javascript
// ✅ Good - exit early for health checks
use((req, res, next) => {
  if (req.url === '/health') {
    return res.send('OK');  // Skip all other middleware
  }
  next();
});

// Other expensive middleware here
use(expensiveAuth);
use(expensiveValidation);
```

### 2. Conditional Middleware

```javascript
// Only apply auth to API routes
use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
});
```

### 3. Middleware Groups

```javascript
// Public routes - minimal middleware
function publicStack() {
  return [
    corsMiddleware,
    rateLimitMiddleware
  ];
}

// Protected routes - full middleware
function protectedStack() {
  return [
    corsMiddleware,
    authMiddleware,
    authorizationMiddleware,
    validationMiddleware
  ];
}

// Apply groups
get('/public/*', ...publicStack());
get('/api/*', ...protectedStack());
```

### 4. Lazy Loading

```javascript
// Load expensive middleware only when needed
const heavyMiddleware = null;

use((req, res, next) => {
  if (req.url.startsWith('/admin/')) {
    if (!heavyMiddleware) {
      heavyMiddleware = require('./heavy-middleware');
    }
    heavyMiddleware(req, res, next);
  } else {
    next();
  }
});
```

---

## Common Mistakes

### Mistake 1: Wrong Order

```javascript
// ❌ Bad - auth before CORS
use(authMiddleware);
use(corsMiddleware);

// Preflight OPTIONS requests fail
// Browser can't get CORS headers

// ✅ Good - CORS first
use(corsMiddleware);
use(authMiddleware);
```

### Mistake 2: Expensive Middleware Early

```javascript
// ❌ Bad - database query for every request
use(async (req, res, next) => {
  req.config = await db.getConfig();  // Slow!
  next();
});

use(healthCheckMiddleware);  // Even for health checks

// ✅ Good - health check first
use((req, res, next) => {
  if (req.url === '/health') return res.send('OK');
  next();
});

use(async (req, res, next) => {
  req.config = await db.getConfig();
  next();
});
```

### Mistake 3: Not Calling next()

```javascript
// ❌ Bad - breaks chain
use((req, res, next) => {
  console.log('Logging');
  // Forgot next() - chain stops here
});

use((req, res, next) => {
  // Never executes
  req.authenticated = true;
  next();
});

// ✅ Good - always call next()
use((req, res, next) => {
  console.log('Logging');
  next();  // Continue chain
});
```

### Mistake 4: Async Without Error Handling

```javascript
// ❌ Bad - unhandled promise rejection
use(async (req, res, next) => {
  await db.query();  // Might fail
  next();
});

// ✅ Good - proper error handling
use(async (req, res, next) => {
  try {
    await db.query();
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Mistake 5: Modifying res After Sent

```javascript
// ❌ Bad - response already sent
use((req, res, next) => {
  res.json({ message: 'Hello' });
  next();  // Response already sent!
});

use((req, res, next) => {
  res.header('X-Custom', 'value');  // Error: Headers already sent
  next();
});

// ✅ Good - don't call next() after sending
use((req, res, next) => {
  res.json({ message: 'Hello' });
  // Don't call next()
});
```

---

## Performance Analysis

### Measuring Middleware Performance

```javascript
function measureMiddleware(name, middleware) {
  return (req, res, next) => {
    const start = Date.now();

    middleware(req, res, () => {
      const duration = Date.now() - start;
      console.log(`${name}: ${duration}ms`);
      next();
    });
  };
}

// Wrap middleware
use(measureMiddleware('CORS', corsMiddleware));
use(measureMiddleware('Auth', authMiddleware));
use(measureMiddleware('Validation', validationMiddleware));

// Output:
// CORS: 0ms
// Auth: 15ms
// Validation: 3ms
```

### Optimizing Slow Middleware

```javascript
// Before: 500ms database query on every request
use(async (req, res, next) => {
  req.settings = await db.getSettings();  // Slow!
  next();
});

// After: Cache settings, refresh every 5 minutes
let cachedSettings = null;
let lastFetch = 0;

use(async (req, res, next) => {
  const now = Date.now();

  if (!cachedSettings || now - lastFetch > 300000) {
    cachedSettings = await db.getSettings();
    lastFetch = now;
  }

  req.settings = cachedSettings;
  next();
});

// Result: <1ms instead of 500ms
```

---

## Debugging the Stack

### Visualizing Execution

```javascript
let depth = 0;

function debugMiddleware(name) {
  return (req, res, next) => {
    const indent = '  '.repeat(depth);
    console.log(`${indent}→ ${name} (enter)`);

    depth++;
    next();
    depth--;

    console.log(`${indent}← ${name} (exit)`);
  };
}

use(debugMiddleware('CORS'));
use(debugMiddleware('Auth'));
use(debugMiddleware('Handler'));

// Output:
// → CORS (enter)
//   → Auth (enter)
//     → Handler (enter)
//     ← Handler (exit)
//   ← Auth (exit)
// ← CORS (exit)
```

### Tracking next() Calls

```javascript
function trackNext(middleware, name) {
  return (req, res, next) => {
    let nextCalled = false;

    middleware(req, res, () => {
      if (nextCalled) {
        console.warn(`⚠️  ${name} called next() twice!`);
      }
      nextCalled = true;
      next();
    });

    setTimeout(() => {
      if (!nextCalled && !res.headersSent) {
        console.warn(`⚠️  ${name} forgot to call next()!`);
      }
    }, 1000);
  };
}
```

---

## Best Practices

### 1. Document Your Stack

```javascript
/**
 * Middleware Stack:
 *
 * 1. CORS - Allow cross-origin requests
 * 2. Request ID - Track requests
 * 3. Rate Limit - 100 req/min
 * 4. Auth - JWT verification
 * 5. Validation - Schema validation
 * 6. Business Logic - Custom logic
 */

use(corsMiddleware);
use(requestIdMiddleware);
use(rateLimitMiddleware);
use(authMiddleware);
use(validationMiddleware);
use(businessLogicMiddleware);
```

### 2. Group Related Middleware

```javascript
// Security middleware
const securityStack = [
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware
];

// Auth middleware
const authStack = [
  extractTokenMiddleware,
  verifyTokenMiddleware,
  loadUserMiddleware
];

// Apply groups
securityStack.forEach(use);
authStack.forEach(use);
```

### 3. Test the Stack

```javascript
// Test middleware order
async function testStack() {
  const order = [];

  use((req, res, next) => {
    order.push('first');
    next();
  });

  use((req, res, next) => {
    order.push('second');
    next();
  });

  get('/test', (req, res) => {
    order.push('handler');
    res.json({ order });
  });

  const res = await fetch('http://localhost:3000/test');
  const data = await res.json();

  console.assert(
    JSON.stringify(data.order) === JSON.stringify(['first', 'second', 'handler']),
    'Middleware order incorrect'
  );
}
```

### 4. Monitor Performance

```javascript
// Track slow middleware
const slowMiddleware = [];

function monitorPerformance(name, middleware) {
  return (req, res, next) => {
    const start = Date.now();

    middleware(req, res, () => {
      const duration = Date.now() - start;

      if (duration > 100) {  // Slow threshold
        slowMiddleware.push({ name, duration, url: req.url });
      }

      next();
    });
  };
}

// Report slow middleware
setInterval(() => {
  if (slowMiddleware.length > 0) {
    console.warn('Slow middleware detected:', slowMiddleware);
    slowMiddleware.length = 0;
  }
}, 60000);
```

---

## Complete Example

```javascript
import { build, use, get } from 'triva';

// Setup
await build({
  redirects: { enabled: true },
  throttle: { limit: 100, window_ms: 60000 }
});

// 1. Early exit for health checks
use((req, res, next) => {
  if (req.url === '/health') {
    return res.send('OK');
  }
  next();
});

// 2. CORS
use(corsMiddleware);

// 3. Request ID
use(requestIdMiddleware);

// 4. Conditional auth
use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
});

// 5. Logging (after auth)
use(loggingMiddleware);

// Routes
get('/public', (req, res) => {
  res.json({ public: true });
});

get('/api/protected', (req, res) => {
  res.json({ user: req.user });
});

listen(3000);
```

---

## Next Steps

- **[Custom Middleware](custom-middleware.md)** - Build your own
- **[Best Practices](best-practices.md)** - Production patterns
- **[Throttling](throttling.md)** - Rate limiting
- **[Logging](logging.md)** - Request logging

---

**Questions?** [GitHub Issues](https://github.com/trivajs/triva/issues)
