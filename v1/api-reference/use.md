# use()

Register global middleware.

## Signature

```javascript
use(middleware: Middleware): void
```

## Parameters

- `middleware` (function) - Middleware function

### Middleware Signature

```javascript
function middleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): void
```

## Example

### Basic Middleware

```javascript
import { use } from 'triva';

use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

### Multiple Middleware

```javascript
// Request ID
use((req, res, next) => {
  req.id = Math.random().toString(36);
  next();
});

// Timestamp
use((req, res, next) => {
  req.timestamp = Date.now();
  next();
});

// CORS
use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
```

### Async Middleware

```javascript
use(async (req, res, next) => {
  try {
    req.user = await fetchUser(req.headers.authorization);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});
```

### Conditional Middleware

```javascript
use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    // Apply auth only to API routes
    return authMiddleware(req, res, next);
  }
  next();
});
```

## Execution Order

Middleware executes in the order registered:

```javascript
use(middleware1);  // Runs first
use(middleware2);  // Runs second
use(middleware3);  // Runs third
```

## Notes

- Middleware runs on every request
- Must call `next()` to continue chain
- Applied globally to all routes
- Runs before route handlers

## See Also

- [Custom Middleware Guide](../middleware/custom-middleware.md)
- [Middleware Stack](../middleware/middleware-stack.md)
- [Best Practices](../middleware/best-practices.md)
