# Quick Examples

Five quick examples to get you started with Triva.

## 1. Basic REST API

```javascript
import { build, get, post, put, del, listen } from 'triva';

await build({ env: 'development' });

let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

get('/api/users', (req, res) => {
  res.json(users);
});

get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  user ? res.json(user) : res.status(404).json({ error: 'Not found' });
});

post('/api/users', (req, res) => {
  const user = { id: users.length + 1, ...req.body };
  users.push(user);
  res.status(201).json(user);
});

listen(3000);
```

[Full REST API Example](https://docs.trivajs.com/examples/rest-api)

## 2. Middleware Usage

```javascript
import { build, get, use, listen } from 'triva';

await build({ env: 'development' });

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const logMiddleware = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
};

use(logMiddleware);

get('/public', (req, res) => {
  res.json({ message: 'Public endpoint' });
});

get('/private', authMiddleware, (req, res) => {
  res.json({ message: 'Private data' });
});

listen(3000);
```

[Middleware Guide](https://docs.trivajs.com/core/middleware)

## 3. Database Integration

```javascript
import { build, get, post, cache, listen } from 'triva';

await build({
  env: 'development',
  database: {
    adapter: 'mongodb',
    url: 'mongodb://localhost:27017/myapp'
  }
});

get('/api/posts', async (req, res) => {
  const posts = await cache.find('posts', {});
  res.json(posts);
});

post('/api/posts', async (req, res) => {
  const post = await cache.insert('posts', req.body);
  res.status(201).json(post);
});

listen(3000);
```

[Database Guide](https://docs.trivajs.com/database/overview)

## 4. Caching Layer

```javascript
import { build, get, cache, listen } from 'triva';

await build({
  env: 'development',
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  }
});

get('/api/expensive', async (req, res) => {
  const cacheKey = 'expensive-data';
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return res.json({ data: cached, cached: true });
  }
  
  const data = await performExpensiveOperation();
  await cache.set(cacheKey, data, 300);
  
  res.json({ data, cached: false });
});

async function performExpensiveOperation() {
  return { result: 'computed', timestamp: Date.now() };
}

listen(3000);
```

[Caching Guide](https://docs.trivajs.com/examples/caching)

## 5. HTTPS Server

```javascript
import { build, get, listen } from 'triva';
import { readFileSync } from 'fs';

await build({
  env: 'production',
  https: {
    enabled: true,
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem')
  },
  autoRedirect: true
});

get('/', (req, res) => {
  res.json({ secure: true });
});

listen(443);
```

[HTTPS Guide](https://docs.trivajs.com/deployment/https)

## Try These Next

- [Authentication Example](https://docs.trivajs.com/examples/authentication)
- [File Upload Example](https://docs.trivajs.com/examples/file-upload)
- [Error Handling Example](https://docs.trivajs.com/examples/error-handling)
- [Production Setup](https://docs.trivajs.com/examples/production-ready)

## Common Patterns

See the [Core Concepts](https://docs.trivajs.com/core/concepts) for more detailed explanations of routing, middleware, and request handling.
