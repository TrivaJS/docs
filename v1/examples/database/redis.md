# Redis Example

Redis integration for caching and sessions.

## Using Triva's Redis Adapter

```javascript
import { build, get, cache, listen } from 'triva';

await build({
  cache: {
    type: 'redis',
    database: {
      host: 'localhost',
      port: 6379
    }
  }
});

// Cache API usage
get('/api/data/:id', async (req, res) => {
  const cached = await cache.get(`data:${req.params.id}`);
  
  if (cached) {
    return res.json({ data: cached, cached: true });
  }
  
  // Fetch from database
  const data = await fetchFromDatabase(req.params.id);
  
  // Cache for 5 minutes
  await cache.set(`data:${req.params.id}`, data, 300000);
  
  res.json({ data, cached: false });
});

listen(3000);
```

## Session Storage

```javascript
import { build, post, get, use, listen, cache } from 'triva';
import { randomUUID } from 'crypto';

await build({
  cache: { type: 'redis', database: { host: 'localhost' } }
});

// Session middleware
use(async (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  
  if (sessionId) {
    req.session = await cache.get(`session:${sessionId}`);
  }
  
  next();
});

// Login
post('/auth/login', async (req, res) => {
  const { email, password } = await req.json();
  
  // Validate user...
  const user = { id: '123', email };
  
  const sessionId = randomUUID();
  await cache.set(`session:${sessionId}`, { user }, 86400000); // 24 hours
  
  res.json({ sessionId });
});

// Protected route
get('/api/profile', (req, res) => {
  if (!req.session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({ user: req.session.user });
});

listen(3000);
```

---

**[Back to Examples](../README.md)**
