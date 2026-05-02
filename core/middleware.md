# Middleware

Middleware functions process requests before they reach route handlers.

## How Middleware Works

Middleware executes in order:

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
```

Each middleware can:
- Execute code
- Modify req/res objects
- Call `next()` to pass control
- End the request/response cycle

## Basic Middleware

```javascript
import { build, use, get, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

get('/', (req, res) => {
  res.send('Hello');
});

listen(3000);
```

## Built-in Middleware

Triva includes production-ready middleware via configuration:

### Logging

```javascript
import { build, listen } from 'triva';

await build({
  env: 'development',
  logging: {
    enabled: true,
    level: 'info'
  }
});

listen(3000);
```

### Throttling (Rate Limiting)

```javascript
import { build, listen } from 'triva';

await build({
  env: 'development',
  throttle: {
    enabled: true,
    max: 100,
    window: 60000
  }
});

listen(3000);
```

### Error Tracking

```javascript
import { build, listen } from 'triva';

await build({
  env: 'development',
  errorTracking: true
});

listen(3000);
```

[Middleware Details](https://docs.trivajs.com/middleware/overview)

## Custom Middleware

### Request Logging

```javascript
import { build, use, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});

listen(3000);
```

### Authentication

```javascript
import { build, use, listen } from 'triva';

await build({ env: 'development' });

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = verifyToken(token);
  next();
};

use(authenticate);

listen(3000);
```

### Request ID

```javascript
import { build, use, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  req.id = generateId();
  res.header('X-Request-ID', req.id);
  next();
});

listen(3000);
```

## Middleware Execution Order

```javascript
import { build, use, get, listen } from 'triva';

await build({ env: 'development' });

// Global middleware (runs for all routes)
use(loggingMiddleware);
use(authMiddleware);

// Route-specific middleware
get('/public', (req, res) => {
  res.send('Public');
});

get('/private', adminOnly, (req, res) => {
  res.send('Private');
});

listen(3000);
```

Execution order:
1. Global middleware (in order added)
2. Route-specific middleware
3. Route handler

## Route-Specific Middleware

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

const checkAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

get('/admin', checkAdmin, (req, res) => {
  res.json({ admin: true });
});

listen(3000);
```

Multiple middleware:

```javascript
get('/protected',
  authenticate,
  checkPermission,
  logAccess,
  (req, res) => {
    res.json({ data: 'protected' });
  }
);
```

## Error Handling

Middleware can handle errors:

```javascript
import { build, use, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  try {
    // Your code
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

listen(3000);
```

[Error Handling Guide](https://docs.trivajs.com/core/error-handling)

## Common Patterns

### CORS Middleware

```javascript
import { build, use, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

listen(3000);
```

Or use the [CORS Extension](https://docs.trivajs.com/extensions/cors)

### Timeout Middleware

```javascript
import { build, use, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  const timeout = setTimeout(() => {
    res.status(408).json({ error: 'Request timeout' });
  }, 30000);
  
  res.on('finish', () => clearTimeout(timeout));
  next();
});

listen(3000);
```

### Body Size Limit

```javascript
import { build, use, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  let size = 0;
  req.on('data', chunk => {
    size += chunk.length;
    if (size > 1048576) { // 1MB
      res.status(413).json({ error: 'Payload too large' });
      req.connection.destroy();
    }
  });
  next();
});

listen(3000);
```

## Next Steps

- [Error Handling](https://docs.trivajs.com/core/error-handling)
- [Middleware Details](https://docs.trivajs.com/middleware/overview)
- [Extensions](https://docs.trivajs.com/extensions/overview)
