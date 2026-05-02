# Database Quick Start

Get started with Triva's cache layer in minutes.

## Step 1: Choose an Adapter

Pick an adapter based on your needs:

- **memory** - Development, testing (default)
- **redis** - Production caching
- **mongodb** - Document storage
- **postgresql** - Relational data
- **sqlite** - Embedded apps

## Step 2: Configure in build()

```javascript
import { build, listen } from 'triva';

await build({
  env: 'development',
  cache: {
    type: 'memory'  // Start with memory
  }
});

listen(3000);
```

## Step 3: Use the cache

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: { type: 'memory' }
});

get('/set', async (req, res) => {
  await cache.set('mykey', 'myvalue', 60);
  res.json({ success: true });
});

get('/get', async (req, res) => {
  const value = await cache.get('mykey');
  res.json({ value });
});

listen(3000);
```

## Complete Example

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  env: 'development',
  cache: {
    type: 'memory',
    retention: 600
  }
});

// Store data
post('/api/users', async (req, res) => {
  const user = req.body;
  await cache.set(`user:${user.id}`, user, 3600);
  res.status(201).json(user);
});

// Retrieve data
get('/api/users/:id', async (req, res) => {
  const user = await cache.get(`user:${req.params.id}`);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// Delete data
get('/api/users/:id/delete', async (req, res) => {
  await cache.delete(`user:${req.params.id}`);
  res.json({ success: true });
});

// List keys
get('/api/users', async (req, res) => {
  const keys = await cache.keys('user:*');
  res.json({ keys });
});

listen(3000);
```

## Using Different Adapters

### Memory (Default)

```javascript
await build({
  cache: {
    type: 'memory',
    retention: 600  // 10 minutes
  }
});
```

### Redis

```javascript
await build({
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  }
});
```

### MongoDB

```javascript
await build({
  cache: {
    type: 'mongodb',
    url: 'mongodb://localhost:27017/myapp'
  }
});
```

### PostgreSQL

```javascript
await build({
  cache: {
    type: 'postgresql',
    url: 'postgresql://user:pass@localhost:5432/mydb'
  }
});
```

### SQLite

```javascript
await build({
  cache: {
    type: 'sqlite',
    filename: './cache.db'
  }
});
```

## Common Operations

### Store with TTL

```javascript
// Store for 1 hour
await cache.set('key', 'value', 3600);
```

### Store without TTL

```javascript
// Store permanently (or until adapter default)
await cache.set('key', 'value');
```

### Check if exists

```javascript
const exists = await cache.has('key');
if (exists) {
  console.log('Key exists');
}
```

### Get all keys

```javascript
const allKeys = await cache.keys('*');
```

### Clear all data

```javascript
await cache.clear();
```

### Get statistics

```javascript
const stats = await cache.stats();
console.log(stats);
```

## Practical Examples

### API Response Caching

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: { type: 'redis', url: 'redis://localhost:6379' }
});

get('/api/posts', async (req, res) => {
  const cacheKey = 'posts:all';
  
  // Try cache first
  let posts = await cache.get(cacheKey);
  
  if (!posts) {
    // Fetch from database
    posts = await fetchPostsFromDB();
    
    // Cache for 5 minutes
    await cache.set(cacheKey, posts, 300);
  }
  
  res.json({ posts, cached: !!posts });
});

listen(3000);
```

### Session Management

```javascript
import { build, cache, post, get, listen } from 'triva';

await build({
  cache: { type: 'redis', url: 'redis://localhost:6379' }
});

post('/login', async (req, res) => {
  const { username } = req.body;
  const sessionId = generateId();
  
  await cache.set(`session:${sessionId}`, { username }, 3600);
  
  res.json({ sessionId });
});

get('/profile', async (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = await cache.get(`session:${sessionId}`);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json(session);
});

listen(3000);
```

### Counter

```javascript
get('/increment', async (req, res) => {
  const count = await cache.get('counter') || 0;
  await cache.set('counter', count + 1);
  res.json({ count: count + 1 });
});
```

## Environment Variables

Use environment variables for production:

```javascript
await build({
  cache: {
    type: process.env.CACHE_TYPE || 'memory',
    url: process.env.CACHE_URL
  }
});
```

Example `.env`:

```bash
CACHE_TYPE=redis
CACHE_URL=redis://localhost:6379
```

## Testing

For tests, use memory adapter:

```javascript
// test.js
await build({
  cache: { type: 'memory' }
});

// Your tests...
await cache.set('test', 'value');
const value = await cache.get('test');
assert(value === 'value');
```

## Next Steps

- [Adapter List](https://docs.trivajs.com/database/adapters)
- [Redis Adapter](https://docs.trivajs.com/database/redis)
- [MongoDB Adapter](https://docs.trivajs.com/database/mongodb)
- [PostgreSQL Adapter](https://docs.trivajs.com/database/postgresql)
