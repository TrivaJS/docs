# Custom Middleware

Write your own middleware functions for request/response processing.

## Basic Custom Middleware

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

## Middleware Signature

Middleware functions receive three arguments:

```javascript
function middleware(req, res, next) {
  // req - Request object
  // res - Response object
  // next - Function to call next middleware
}
```

## Calling next()

Always call `next()` to pass control:

```javascript
use((req, res, next) => {
  console.log('Before route handler');
  next();  // Continue to next middleware/handler
});
```

## Stopping the Chain

Don't call `next()` to stop:

```javascript
use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
    // next() not called - chain stops here
  }
  next();
});
```

## Common Middleware Patterns

### Request Logging

```javascript
import { build, use, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  
  next();
});

listen(3000);
```

### Authentication

```javascript
use((req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

### Request ID

```javascript
use((req, res, next) => {
  req.id = generateUniqueId();
  res.header('X-Request-ID', req.id);
  next();
});
```

### Timing Header

```javascript
use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.header('X-Response-Time', `${duration}ms`);
  });
  
  next();
});
```

### CORS (Manual)

```javascript
use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  
  next();
});
```

Or use [@triva/cors](https://docs.trivajs.com/middleware/cors) extension.

### Body Size Limit

```javascript
use((req, res, next) => {
  let size = 0;
  const limit = 1048576; // 1MB
  
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > limit) {
      res.status(413).json({ error: 'Payload too large' });
      req.connection.destroy();
    }
  });
  
  next();
});
```

### API Key Validation

```javascript
use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  if (!isValidApiKey(apiKey)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  next();
});
```

### IP Whitelist

```javascript
use((req, res, next) => {
  const allowedIPs = ['127.0.0.1', '192.168.1.100'];
  const clientIP = req.socket.remoteAddress;
  
  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
});
```

## Multiple Middleware

Chain multiple middleware functions:

```javascript
import { build, use, get, listen } from 'triva';

await build({ env: 'development' });

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const timer = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

use(logger);
use(timer);
use(auth);

get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

listen(3000);
```

## Route-Specific Middleware

Apply middleware to specific routes:

```javascript
import { build, get, listen } from 'triva';

await build({ env: 'development' });

const requireAdmin = (req, res, next) => {
  if (!req.user?.admin) {
    return res.status(403).json({ error: 'Admin required' });
  }
  next();
};

get('/public', (req, res) => {
  res.json({ message: 'Public' });
});

get('/admin', requireAdmin, (req, res) => {
  res.json({ message: 'Admin only' });
});

listen(3000);
```

## Error Handling Middleware

Handle errors in middleware:

```javascript
use((req, res, next) => {
  try {
    // Your logic
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Async Middleware

Use async/await in middleware:

```javascript
use(async (req, res, next) => {
  try {
    req.user = await fetchUserFromDatabase(req.headers.authorization);
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});
```

## Complete Example

```javascript
import { build, use, get, post, listen } from 'triva';

await build({ env: 'production' });

// Request logger
use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Request ID
use((req, res, next) => {
  req.id = `req-${Date.now()}-${Math.random()}`;
  res.header('X-Request-ID', req.id);
  next();
});

// Authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = verifyToken(token);
  next();
};

// Admin check
const requireAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(403).json({ error: 'Admin required' });
  }
  next();
};

// Public routes
get('/public', (req, res) => {
  res.json({ message: 'Public data' });
});

// Protected routes
get('/private', authenticate, (req, res) => {
  res.json({ message: 'Private data', user: req.user });
});

// Admin routes
get('/admin', authenticate, requireAdmin, (req, res) => {
  res.json({ message: 'Admin data' });
});

listen(3000);
```

## Best Practices

1. **Always call next()** - Unless you're ending the response
2. **Handle errors** - Use try/catch for error handling
3. **Keep it simple** - Each middleware should do one thing
4. **Order matters** - Place middleware in logical order
5. **Use route-specific** - Apply middleware only where needed
6. **Avoid blocking** - Don't do heavy sync operations
7. **Test thoroughly** - Test middleware with various scenarios

## Next Steps

- [Middleware Order](https://docs.trivajs.com/middleware/order)
- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking)
- [Throttling](https://docs.trivajs.com/middleware/throttling)
