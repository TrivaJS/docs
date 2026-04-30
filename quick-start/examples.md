# Quick Examples

A few short examples that match the current Triva API.

## 1. REST-Style Routes

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find((entry) => entry.id === Number(req.params.id));

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

app.post('/api/users', async (req, res) => {
  const body = await req.json();
  const user = { id: users.length + 1, ...body };
  users.push(user);
  res.status(201).json(user);
});

app.listen(3000);
```

## 2. Custom Middleware

```javascript
const requireAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/private', requireAuth, (req, res) => {
  res.json({ secret: true });
});
```

## 3. Cache-Aside Pattern

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'redis',
    retention: 300000,
    database: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  }
});

app.get('/api/posts/:id', async (req, res) => {
  const key = `post:${req.params.id}`;
  const cached = await cache.get(key);

  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }

  const post = await loadPost(req.params.id);
  await cache.set(key, post, 300000);
  res.json({ source: 'origin', data: post });
});
```

## 4. JWT Authentication

```javascript
import { sign, protect } from '@triva/jwt';

app.post('/auth/login', async (req, res) => {
  const { email, password } = await req.json();
  const user = await verifyCredentials(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token });
});

app.get('/api/profile', protect(), (req, res) => {
  res.json({ user: req.user });
});
```

## 5. Direct HTTPS Startup

```javascript
import { readFileSync } from 'fs';

const secureApp = new build({
  protocol: 'https',
  ssl: {
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem')
  }
});

secureApp.get('/', (req, res) => {
  res.json({ secure: true });
});

secureApp.listen(3443);
```

## Related Docs

- [REST API Example](https://docs.trivajs.com/examples/rest-api)
- [Authentication Example](https://docs.trivajs.com/examples/authentication)
- [Caching Example](https://docs.trivajs.com/examples/caching)
- [HTTPS Deployment](https://docs.trivajs.com/deployment/https)
