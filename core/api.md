# API Reference

Complete list of Triva's core API.

## Configuration

### build(options)

Configure and initialize the server.

```javascript
import { build } from 'triva';

await build({
  env: 'development',
  logging: { enabled: true },
  cache: { type: 'memory' }
});
```

[Configuration Details](https://docs.trivajs.com/core/configuration)

### listen(port, callback)

Start the HTTP server.

```javascript
import { listen } from 'triva';

listen(3000, () => {
  console.log('Server running');
});
```

### use(middleware)

Add middleware to the application.

```javascript
import { use } from 'triva';

use((req, res, next) => {
  console.log('Request received');
  next();
});
```

[Middleware Guide](https://docs.trivajs.com/core/middleware)

## Route Methods

### get(path, handler)

Handle GET requests.

```javascript
import { get } from 'triva';

get('/users', (req, res) => {
  res.json({ users: [] });
});
```

### post(path, handler)

Handle POST requests.

```javascript
import { post } from 'triva';

post('/users', (req, res) => {
  res.json({ created: req.body });
});
```

### put(path, handler)

Handle PUT requests.

```javascript
import { put } from 'triva';

put('/users/:id', (req, res) => {
  res.json({ updated: req.params.id });
});
```

### del(path, handler)

Handle DELETE requests.

```javascript
import { del } from 'triva';

del('/users/:id', (req, res) => {
  res.json({ deleted: req.params.id });
});
```

### patch(path, handler)

Handle PATCH requests.

```javascript
import { patch } from 'triva';

patch('/users/:id', (req, res) => {
  res.json({ patched: req.params.id });
});
```

[Routing Guide](https://docs.trivajs.com/core/routing)

## Request Object

### req.method

HTTP method (GET, POST, etc.)

### req.url

Request URL path

### req.headers

Request headers object

### req.query

Query string parameters

```javascript
// /search?q=test&limit=10
req.query.q      // 'test'
req.query.limit  // '10'
```

### req.params

Route parameters

```javascript
// Route: /users/:id
// Request: /users/123
req.params.id  // '123'
```

### req.body

Parsed request body (JSON or text)

```javascript
// POST with JSON body
req.body.username  // Access properties
```

[Request Reference](https://docs.trivajs.com/core/request)

## Response Object

### res.json(data)

Send JSON response.

```javascript
res.json({ status: 'ok', data: [] });
```

### res.send(text)

Send text response.

```javascript
res.send('Hello World');
```

### res.status(code)

Set HTTP status code.

```javascript
res.status(404).json({ error: 'Not found' });
```

### res.redirect(url)

Redirect to another URL.

```javascript
res.redirect('/login');
```

### res.header(name, value)

Set response header.

```javascript
res.header('Content-Type', 'application/json');
```

[Response Reference](https://docs.trivajs.com/core/response)

## Cache Object

### cache.set(key, value, ttl)

Store value in cache.

```javascript
import { cache } from 'triva';

await cache.set('user:123', userData, 3600);
```

### cache.get(key)

Retrieve value from cache.

```javascript
const data = await cache.get('user:123');
```

### cache.delete(key)

Remove value from cache.

```javascript
await cache.delete('user:123');
```

### cache.clear()

Clear all cache entries.

```javascript
await cache.clear();
```

### cache.stats()

Get cache statistics.

```javascript
const stats = await cache.stats();
```

## Database Configuration

Database is configured in `build()`, not accessed directly:

```javascript
await build({
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  }
});
```

Supported adapters:
- memory
- redis
- mongodb
- postgresql
- mysql
- sqlite
- better-sqlite3
- supabase
- embedded

[Database Guide](https://docs.trivajs.com/database/overview)

## Next Steps

- [Routing Details](https://docs.trivajs.com/core/routing)
- [Request Object](https://docs.trivajs.com/core/request)
- [Response Object](https://docs.trivajs.com/core/response)
- [Configuration Options](https://docs.trivajs.com/core/configuration)
