# Core API Reference

Complete API reference for Triva's core functions.

## build(config)

Configure and initialize the Triva server.

**Parameters:**
- `config` (object) - Configuration object

**Returns:** `Promise<void>`

**Example:**
```javascript
import { build } from 'triva';

await build({
  env: 'production',
  protocol: 'https',
  cache: { type: 'redis' },
  throttle: { limit: 100, window_ms: 60000 }
});
```

**Config Options:**

| Option | Type | Description |
|--------|------|-------------|
| `env` | string | 'development', 'production', or 'test' |
| `protocol` | string | 'http' or 'https' |
| `ssl` | object | SSL configuration (for HTTPS) |
| `cache` | object | Cache adapter configuration |
| `throttle` | object | Rate limiting configuration |
| `redirects` | object | Auto-redirect configuration |
| `retention` | object | Logging configuration |
| `errorTracking` | object | Error tracking configuration |

---

## get(path, ...handlers)

Register a GET route.

**Parameters:**
- `path` (string) - URL path pattern
- `handlers` (function[]) - One or more request handlers

**Returns:** `void`

**Examples:**
```javascript
import { get } from 'triva';

// Simple route
get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

// With parameters
get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});

// With middleware
get('/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Multiple handlers
get('/chain', handler1, handler2, handler3);
```

---

## post(path, ...handlers)

Register a POST route.

**Parameters:**
- `path` (string) - URL path pattern
- `handlers` (function[]) - One or more request handlers

**Returns:** `void`

**Example:**
```javascript
import { post } from 'triva';

post('/api/users', async (req, res) => {
  const data = await req.json();
  res.status(201).json({ user: data });
});
```

---

## put(path, ...handlers)

Register a PUT route.

**Parameters:**
- `path` (string) - URL path pattern
- `handlers` (function[]) - One or more request handlers

**Returns:** `void`

**Example:**
```javascript
import { put } from 'triva';

put('/api/users/:id', async (req, res) => {
  const data = await req.json();
  res.json({ updated: true });
});
```

---

## del(path, ...handlers)

Register a DELETE route.

**Parameters:**
- `path` (string) - URL path pattern
- `handlers` (function[]) - One or more request handlers

**Returns:** `void`

**Example:**
```javascript
import { del } from 'triva';

del('/api/users/:id', (req, res) => {
  res.status(204).send();
});
```

---

## patch(path, ...handlers)

Register a PATCH route.

**Parameters:**
- `path` (string) - URL path pattern
- `handlers` (function[]) - One or more request handlers

**Returns:** `void`

**Example:**
```javascript
import { patch } from 'triva';

patch('/api/users/:id', async (req, res) => {
  const updates = await req.json();
  res.json({ patched: true });
});
```

---

## use(middleware)

Register global middleware.

**Parameters:**
- `middleware` (function) - Middleware function

**Returns:** `void`

**Example:**
```javascript
import { use } from 'triva';

use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

---

## listen(port, callback?)

Start the HTTP/HTTPS server.

**Parameters:**
- `port` (number) - Port number
- `callback` (function, optional) - Called when server starts

**Returns:** `Server` - Node.js HTTP/HTTPS server instance

**Examples:**
```javascript
import { listen } from 'triva';

// Basic
listen(3000);

// With callback
listen(3000, () => {
  console.log('Server running on port 3000');
});

// Store server instance
const server = listen(3000);

// Close server later
server.close();
```

---

## Request Object (req)

Extended Node.js IncomingMessage with additional properties.

### req.params

Route parameters object.

**Type:** `object`

**Example:**
```javascript
// Route: /users/:id/posts/:postId
// URL: /users/123/posts/456

get('/users/:id/posts/:postId', (req, res) => {
  console.log(req.params);
  // { id: '123', postId: '456' }
});
```

### req.query

Query string parameters object.

**Type:** `object`

**Example:**
```javascript
// URL: /search?q=triva&page=2

get('/search', (req, res) => {
  console.log(req.query);
  // { q: 'triva', page: '2' }
});
```

### req.json()

Parse request body as JSON.

**Returns:** `Promise<any>`

**Example:**
```javascript
post('/api/users', async (req, res) => {
  const body = await req.json();
  console.log(body);
  // { name: 'John', email: 'john@example.com' }
});
```

### req.text()

Get request body as text.

**Returns:** `Promise<string>`

**Example:**
```javascript
post('/api/text', async (req, res) => {
  const text = await req.text();
  console.log(text);
  // "Plain text content"
});
```

### req.headers

Request headers object.

**Type:** `object`

**Example:**
```javascript
get('/', (req, res) => {
  console.log(req.headers['user-agent']);
  console.log(req.headers['content-type']);
});
```

### req.method

HTTP method.

**Type:** `string`

**Example:**
```javascript
use((req, res, next) => {
  console.log(req.method);  // 'GET', 'POST', etc.
  next();
});
```

### req.url

Full URL including query string.

**Type:** `string`

**Example:**
```javascript
get('/*', (req, res) => {
  console.log(req.url);
  // '/api/users?page=2'
});
```

---

## Response Object (res)

Node.js ServerResponse with helper methods.

### res.json(data)

Send JSON response.

**Parameters:**
- `data` (any) - Data to serialize as JSON

**Returns:** `void`

**Example:**
```javascript
get('/api/data', (req, res) => {
  res.json({ 
    success: true,
    data: [1, 2, 3]
  });
});
```

### res.send(data)

Send text response.

**Parameters:**
- `data` (string) - Text to send

**Returns:** `void`

**Example:**
```javascript
get('/health', (req, res) => {
  res.send('OK');
});
```

### res.status(code)

Set HTTP status code.

**Parameters:**
- `code` (number) - HTTP status code

**Returns:** `res` (chainable)

**Example:**
```javascript
post('/api/users', (req, res) => {
  res.status(201).json({ created: true });
});

get('/not-found', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});
```

### res.header(name, value)

Set response header.

**Parameters:**
- `name` (string) - Header name
- `value` (string) - Header value

**Returns:** `res` (chainable)

**Example:**
```javascript
get('/api/data', (req, res) => {
  res.header('X-Custom-Header', 'value');
  res.header('Cache-Control', 'no-cache');
  res.json({ data: [] });
});
```

### res.redirect(url)

Redirect to URL.

**Parameters:**
- `url` (string) - Destination URL

**Returns:** `void`

**Example:**
```javascript
get('/old-url', (req, res) => {
  res.redirect('/new-url');
});

// With status code
get('/moved', (req, res) => {
  res.status(301).redirect('/new-location');
});
```

---

## Cache API

### cache.set(key, value, ttl?)

Store value in cache.

**Parameters:**
- `key` (string) - Cache key
- `value` (any) - Value to store
- `ttl` (number, optional) - Time to live in milliseconds

**Returns:** `Promise<void>`

**Example:**
```javascript
import { cache } from 'triva';

await cache.set('user:123', { name: 'John' });
await cache.set('temp', 'data', 5000);  // 5 second TTL
```

### cache.get(key)

Get value from cache.

**Parameters:**
- `key` (string) - Cache key

**Returns:** `Promise<any | null>`

**Example:**
```javascript
const user = await cache.get('user:123');
if (user) {
  console.log(user);
} else {
  console.log('Not found');
}
```

### cache.delete(key)

Delete key from cache.

**Parameters:**
- `key` (string) - Cache key

**Returns:** `Promise<void>`

**Example:**
```javascript
await cache.delete('user:123');
```

### cache.clear()

Clear all cache entries.

**Returns:** `Promise<void>`

**Example:**
```javascript
await cache.clear();
```

### cache.keys(pattern)

Get keys matching pattern.

**Parameters:**
- `pattern` (string) - Glob pattern

**Returns:** `Promise<string[]>`

**Example:**
```javascript
const userKeys = await cache.keys('user:*');
const allKeys = await cache.keys('*');
```

---

**See also:**
- [Routing Guide](../guides/routing.md)
- [Middleware Guide](../middleware/overview.md)
- [Database Guide](../database-and-cache/overview.md)
