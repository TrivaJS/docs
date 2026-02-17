# Core Concepts

Understanding Triva's architecture and design principles.

## Architecture Overview

Triva uses a function-based API with these core components:

1. **build()** - Configure and initialize the server
2. **HTTP Methods** - get(), post(), put(), del(), patch()
3. **Middleware** - use() for request processing
4. **Database** - database object for persistence
5. **Cache** - cache object for performance

## Request Lifecycle

```
Client Request
    ↓
HTTP Server
    ↓
Built-in Middleware (logging, throttling)
    ↓
Custom Middleware (use())
    ↓
Route Handler (get(), post(), etc.)
    ↓
Response
```

## Basic Application

```javascript
import { build, get, listen } from 'triva';

// Configure server
await build({
  env: 'development'
});

// Define routes
get('/path', (req, res) => {
  res.json({ message: 'Hello' });
});

// Start server
listen(3000);
```

## Request Object

The `req` object contains:

- `req.method` - HTTP method (GET, POST, etc.)
- `req.url` - Request URL
- `req.headers` - HTTP headers
- `req.query` - Query parameters
- `req.params` - Route parameters
- `req.body` - Request body (parsed automatically)

[Request Reference](https://docs.trivajs.com/core/request)

## Response Object

The `res` object provides:

- `res.json(data)` - Send JSON response
- `res.send(text)` - Send text response
- `res.status(code)` - Set status code
- `res.redirect(url)` - Redirect to URL
- `res.header(name, value)` - Set header

[Response Reference](https://docs.trivajs.com/core/response)

## Routing

Routes use function-based API:

```javascript
import { build, get, post, put, del, listen } from 'triva';

await build({ env: 'development' });

get('/users', getAllUsers);
post('/users', createUser);
get('/users/:id', getUser);
put('/users/:id', updateUser);
del('/users/:id', deleteUser);

listen(3000);
```

[Routing Guide](https://docs.trivajs.com/core/routing)

## Middleware

Middleware functions process requests:

```javascript
import { build, use, get, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

listen(3000);
```

Built-in middleware:
- Throttling (rate limiting)
- Logging
- Error tracking
- Body parsing (automatic)

[Middleware Guide](https://docs.trivajs.com/core/middleware)

## Database Integration

Optional database support with multiple adapters:

```javascript
import { build, cache, listen } from 'triva';

await build({
  env: 'development',
  database: {
    adapter: 'mongodb',
    url: 'mongodb://localhost:27017/mydb'
  }
});

await cache.insert('users', userData);
const users = await cache.find('users', {});

listen(3000);
```

[Database Guide](https://docs.trivajs.com/database/overview)

## Caching

Optional cache layer for performance:

```javascript
import { build, cache, listen } from 'triva';

await build({
  env: 'development',
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  }
});

await cache.set('key', value, ttl);
const value = await cache.get('key');

listen(3000);
```

[Caching Guide](https://docs.trivajs.com/database/quick-start)

## Configuration

Configure via build() options:

```javascript
await build({
  env: 'production',
  logging: { enabled: true, level: 'info' },
  throttle: { enabled: true, max: 100, window: 60000 },
  cache: { type: 'memory' },
  https: { enabled: true, key, cert }
});
```

[Configuration Guide](https://docs.trivajs.com/core/configuration)

## Error Handling

Handle errors with try/catch:

```javascript
get('/route', (req, res) => {
  try {
    // Your code
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

[Error Handling Guide](https://docs.trivajs.com/core/error-handling)

## Production Features

Built-in production capabilities:

- HTTPS support with auto-redirect from HTTP
- Rate limiting to prevent abuse
- Request logging for monitoring
- Error tracking for debugging
- Connection pooling for databases

## Next Steps

- [API Reference](https://docs.trivajs.com/core/api)
- [Routing Details](https://docs.trivajs.com/core/routing)
- [Middleware Details](https://docs.trivajs.com/core/middleware)
- [Examples](https://docs.trivajs.com/quick-start/examples)
