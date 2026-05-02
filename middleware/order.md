# Middleware Execution Order

Understanding the order in which middleware executes.

## Execution Flow

```
Request
  ↓
1. Built-in Redirect Middleware (if enabled)
  ↓
2. Built-in Throttle Middleware (if enabled)
  ↓
3. Built-in Cookie Parser (always)
  ↓
4. Custom Middleware (via use())
  ↓
5. Route Handler
  ↓
6. Response
  ↓
7. Error Tracking (if error occurs)
```

## Built-in Middleware Order

Built-in middleware executes in this order:

### 1. Redirects

HTTP to HTTPS redirects (if configured).

```javascript
await build({
  redirects: {
    enabled: true,
    rules: [{ from: '/old', to: '/new' }]
  }
});
```

### 2. Throttling

Rate limiting checks (if enabled).

```javascript
await build({
  throttle: {
    enabled: true,
    max: 100,
    window: 60000
  }
});
```

### 3. Cookie Parser

Cookie parsing (always enabled, no config needed).

### 4. Logging

Request/response logging (if enabled).

```javascript
await build({
  logging: {
    enabled: true,
    level: 'info'
  }
});
```

## Custom Middleware Order

Custom middleware executes in the order added:

```javascript
import { build, use, get, listen } from 'triva';

await build({ env: 'development' });

// Executes FIRST
use((req, res, next) => {
  console.log('Middleware 1');
  next();
});

// Executes SECOND
use((req, res, next) => {
  console.log('Middleware 2');
  next();
});

// Executes THIRD
use((req, res, next) => {
  console.log('Middleware 3');
  next();
});

get('/', (req, res) => {
  console.log('Route handler');
  res.send('Hello');
});

listen(3000);
```

Output:
```
Middleware 1
Middleware 2
Middleware 3
Route handler
```

## Route-Specific Middleware

Route middleware executes after global middleware:

```javascript
import { build, use, get, listen } from 'triva';

await build({ env: 'development' });

// Global middleware (runs for ALL routes)
use((req, res, next) => {
  console.log('Global middleware');
  next();
});

const routeMiddleware = (req, res, next) => {
  console.log('Route middleware');
  next();
};

get('/', routeMiddleware, (req, res) => {
  console.log('Route handler');
  res.send('Hello');
});

listen(3000);
```

Output:
```
Global middleware
Route middleware
Route handler
```

## Complete Order Example

```javascript
import { build, use, get, listen } from 'triva';

await build({
  env: 'development',
  
  // 1. Redirects (if configured)
  redirects: {
    enabled: true,
    rules: []
  },
  
  // 2. Throttle
  throttle: {
    enabled: true,
    max: 100,
    window: 60000
  },
  
  // 3. Cookie parser (automatic)
  
  // 4. Logging
  logging: {
    enabled: true,
    level: 'info'
  },
  
  // 5. Error tracking
  errorTracking: {
    enabled: true
  }
});

// 6. Custom global middleware
use((req, res, next) => {
  console.log('Custom middleware 1');
  next();
});

use((req, res, next) => {
  console.log('Custom middleware 2');
  next();
});

// 7. Route-specific middleware
const auth = (req, res, next) => {
  console.log('Auth middleware');
  next();
};

// 8. Route handler
get('/', auth, (req, res) => {
  console.log('Route handler');
  res.send('Hello');
});

listen(3000);
```

Request flow for `GET /`:
```
1. Redirect check (if configured)
2. Throttle check (if enabled)
3. Cookie parsing
4. Logging (request logged)
5. Custom middleware 1
6. Custom middleware 2
7. Auth middleware
8. Route handler
9. Logging (response logged)
10. Error tracking (if error occurred)
```

## Stopping the Chain

Middleware can stop the chain by not calling `next()`:

```javascript
import { build, use, get, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  console.log('Middleware 1');
  next();
});

use((req, res, next) => {
  console.log('Middleware 2');
  res.status(401).json({ error: 'Unauthorized' });
  // next() NOT called - chain stops here
});

use((req, res, next) => {
  console.log('Middleware 3');  // NEVER executes
  next();
});

get('/', (req, res) => {
  console.log('Handler');  // NEVER executes
  res.send('Hello');
});

listen(3000);
```

Output:
```
Middleware 1
Middleware 2
```

## Order Best Practices

### 1. Authentication Early

Place authentication middleware near the top:

```javascript
use(authMiddleware);
use(otherMiddleware);
```

### 2. Logging First

Log all requests by placing logger first:

```javascript
use(logger);
use(auth);
```

### 3. Error Handler Last

Error middleware should be last:

```javascript
use(middleware1);
use(middleware2);
use(errorHandler);  // Last
```

### 4. Route-Specific When Possible

Use route-specific middleware instead of global when appropriate:

```javascript
// Instead of:
use(adminOnly);
get('/users', handler);
get('/admin', handler);

// Do:
get('/users', handler);
get('/admin', adminOnly, handler);
```

## Common Patterns

### Authentication + Logging

```javascript
import { build, use, get, listen } from 'triva';

await build({
  logging: { enabled: true }
});

// Logger first to log all requests
use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Auth second
use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

get('/', (req, res) => {
  res.send('Hello');
});

listen(3000);
```

### Public + Protected Routes

```javascript
import { build, use, get, listen } from 'triva';

await build({ env: 'development' });

const auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Public routes (no auth)
get('/public', (req, res) => {
  res.json({ message: 'Public' });
});

// Protected routes (with auth)
get('/private', auth, (req, res) => {
  res.json({ message: 'Private' });
});

listen(3000);
```

## Debugging Order

Add logging to see execution order:

```javascript
import { build, use, get, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  console.log('1. Global middleware A');
  next();
});

use((req, res, next) => {
  console.log('2. Global middleware B');
  next();
});

const routeMW = (req, res, next) => {
  console.log('3. Route middleware');
  next();
};

get('/', routeMW, (req, res) => {
  console.log('4. Route handler');
  res.send('Hello');
});

listen(3000);
```

## Next Steps

- [Custom Middleware](https://docs.trivajs.com/middleware/custom)
- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking)
- [Configuration](https://docs.trivajs.com/core/configuration)
