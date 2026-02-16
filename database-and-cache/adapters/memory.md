# Memory Adapter

In-memory cache for development, testing, and temporary data storage.

## Overview

The Memory adapter stores data in JavaScript memory using a Map. It's the fastest adapter but data is lost when the server restarts.

### When to Use

✅ **Development** - Fast iteration, no setup  
✅ **Testing** - Isolated test environments  
✅ **Temporary caching** - Session data, rate limiting  
✅ **Single-server deployments** - No distributed caching needed  

❌ **Production** - Data lost on restart  
❌ **Distributed systems** - Each server has separate cache  
❌ **Large datasets** - Limited by RAM  

---

## Quick Start

```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'memory',
    retention: 600000  // Optional: 10 minutes default TTL
  }
});

// Store data
await cache.set('user:123', { name: 'John', age: 30 });

// Retrieve data
const user = await cache.get('user:123');
console.log(user);  // { name: 'John', age: 30 }

// Delete data
await cache.delete('user:123');
```

---

## Configuration

### Basic Setup

```javascript
await build({
  cache: {
    type: 'memory'
  }
});
```

### With Default TTL

```javascript
await build({
  cache: {
    type: 'memory',
    retention: 3600000  // 1 hour default TTL
  }
});

// All keys expire in 1 hour unless specified otherwise
await cache.set('key1', 'value1');  // Expires in 1 hour
await cache.set('key2', 'value2', 7200000);  // Expires in 2 hours (overrides default)
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | - | Must be `'memory'` |
| `retention` | number | undefined | Default TTL in milliseconds |

---

## API Methods

### set(key, value, ttl?)

Store a value with optional TTL.

```javascript
// Without TTL - persists until deleted
await cache.set('permanent', { data: 'value' });

// With TTL - auto-expires
await cache.set('temporary', { data: 'value' }, 300000);  // 5 minutes

// Overrides default retention
await cache.set('custom', { data: 'value' }, 600000);  // 10 minutes
```

**Parameters:**
- `key` (string) - Unique identifier
- `value` (any) - Data to store (automatically serialized)
- `ttl` (number, optional) - Time to live in milliseconds

**Returns:** `Promise<void>`

### get(key)

Retrieve a value by key.

```javascript
const value = await cache.get('user:123');

if (value) {
  console.log('Found:', value);
} else {
  console.log('Not found or expired');
}
```

**Parameters:**
- `key` (string) - Key to retrieve

**Returns:** `Promise<any | null>` - Value or null if not found/expired

### delete(key)

Remove a key from cache.

```javascript
await cache.delete('user:123');

// Verify deletion
const value = await cache.get('user:123');
console.log(value);  // null
```

**Parameters:**
- `key` (string) - Key to delete

**Returns:** `Promise<void>`

### clear()

Remove all keys from cache.

```javascript
await cache.clear();

// Cache is now empty
const keys = await cache.keys('*');
console.log(keys);  // []
```

**Returns:** `Promise<void>`

### keys(pattern)

Get all keys matching a pattern.

```javascript
// Get all keys
const allKeys = await cache.keys('*');

// Get user keys
const userKeys = await cache.keys('user:*');

// Get specific pattern
const sessionKeys = await cache.keys('session:*');
```

**Parameters:**
- `pattern` (string) - Glob pattern (`*` for wildcard)

**Returns:** `Promise<string[]>` - Array of matching keys

---

## Features

### Automatic Expiration

```javascript
// Set with TTL
await cache.set('temp', 'data', 5000);  // 5 seconds

// Immediately available
console.log(await cache.get('temp'));  // 'data'

// Wait 6 seconds
await new Promise(resolve => setTimeout(resolve, 6000));

// Now expired
console.log(await cache.get('temp'));  // null
```

### Data Type Support

```javascript
// Strings
await cache.set('name', 'John Doe');

// Numbers
await cache.set('age', 30);
await cache.set('price', 19.99);

// Booleans
await cache.set('active', true);

// Objects
await cache.set('user', { id: 1, name: 'John' });

// Arrays
await cache.set('tags', ['javascript', 'node', 'triva']);

// Dates
await cache.set('created', new Date());

// null
await cache.set('empty', null);
```

### Pattern Matching

```javascript
// Store multiple keys
await cache.set('user:1', { name: 'Alice' });
await cache.set('user:2', { name: 'Bob' });
await cache.set('user:3', { name: 'Charlie' });
await cache.set('session:abc', { userId: 1 });
await cache.set('session:def', { userId: 2 });

// Get all users
const userKeys = await cache.keys('user:*');
console.log(userKeys);  // ['user:1', 'user:2', 'user:3']

// Get all sessions
const sessionKeys = await cache.keys('session:*');
console.log(sessionKeys);  // ['session:abc', 'session:def']

// Get all keys
const allKeys = await cache.keys('*');
console.log(allKeys.length);  // 5
```

---

## Performance

### Benchmarks

```javascript
// Write performance
console.time('write-1000');
for (let i = 0; i < 1000; i++) {
  await cache.set(`key:${i}`, { data: i });
}
console.timeEnd('write-1000');  // ~5ms

// Read performance
console.time('read-1000');
for (let i = 0; i < 1000; i++) {
  await cache.get(`key:${i}`);
}
console.timeEnd('read-1000');  // ~3ms
```

### Memory Usage

```javascript
// Estimate memory usage
const keys = await cache.keys('*');
const sampleSize = Math.min(100, keys.length);
let totalSize = 0;

for (let i = 0; i < sampleSize; i++) {
  const value = await cache.get(keys[i]);
  totalSize += JSON.stringify(value).length;
}

const avgSize = totalSize / sampleSize;
const estimatedTotal = (avgSize * keys.length) / 1024 / 1024;

console.log(`Estimated cache size: ${estimatedTotal.toFixed(2)} MB`);
```

---

## Best Practices

### 1. Set Appropriate TTLs

```javascript
// Short TTL for frequently changing data
await cache.set('stock:price', 100.50, 1000);  // 1 second

// Medium TTL for semi-static data
await cache.set('user:profile', userData, 300000);  // 5 minutes

// Long TTL for static data
await cache.set('config', configData, 3600000);  // 1 hour
```

### 2. Use Namespacing

```javascript
// Good - organized by type
await cache.set('user:123', userData);
await cache.set('user:123:settings', settingsData);
await cache.set('session:abc', sessionData);
await cache.set('rate-limit:192.168.1.1', requestCount);

// Bad - flat structure
await cache.set('123', userData);
await cache.set('abc', sessionData);
await cache.set('count', requestCount);
```

### 3. Clean Up Expired Keys

```javascript
// Memory adapter auto-cleans, but you can help
setInterval(async () => {
  const keys = await cache.keys('temp:*');
  for (const key of keys) {
    const value = await cache.get(key);
    if (!value) {
      await cache.delete(key);
    }
  }
}, 60000);  // Every minute
```

### 4. Monitor Memory Usage

```javascript
// Track memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  const heapUsed = (usage.heapUsed / 1024 / 1024).toFixed(2);
  
  console.log(`Heap used: ${heapUsed} MB`);
  
  if (heapUsed > 500) {
    console.warn('High memory usage - consider clearing cache');
  }
}, 60000);
```

### 5. Use for Development Only

```javascript
// Environment-specific configuration
const cacheConfig = {
  development: {
    type: 'memory',
    retention: 60000
  },
  production: {
    type: 'redis',
    database: {
      host: process.env.REDIS_HOST,
      port: 6379
    }
  }
};

await build({
  cache: cacheConfig[process.env.NODE_ENV]
});
```

---

## Limitations

### 1. Data Lost on Restart

```javascript
// Store data
await cache.set('important', 'data');

// Restart server
// ... server restarts ...

// Data is gone
const value = await cache.get('important');
console.log(value);  // null
```

**Solution:** Use persistent adapter for production (Redis, MongoDB, etc.)

### 2. Not Shared Between Servers

```javascript
// Server 1
await cache.set('user:123', userData);

// Server 2
const user = await cache.get('user:123');
console.log(user);  // null - different memory space
```

**Solution:** Use distributed cache (Redis, MongoDB)

### 3. Limited by RAM

```javascript
// Storing large dataset
for (let i = 0; i < 1000000; i++) {
  await cache.set(`key:${i}`, { data: 'value'.repeat(1000) });
}
// May cause out-of-memory error
```

**Solution:** Use disk-based adapter (SQLite, PostgreSQL)

---

## Use Cases

### Session Storage

```javascript
import crypto from 'crypto';

async function createSession(userId) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  
  await cache.set(`session:${sessionId}`, {
    userId,
    createdAt: Date.now()
  }, 3600000);  // 1 hour
  
  return sessionId;
}

async function getSession(sessionId) {
  return await cache.get(`session:${sessionId}`);
}

async function destroySession(sessionId) {
  await cache.delete(`session:${sessionId}`);
}
```

### Rate Limiting

```javascript
async function checkRateLimit(ip) {
  const key = `rate-limit:${ip}`;
  const requests = await cache.get(key) || 0;
  
  if (requests >= 100) {
    return false;  // Rate limit exceeded
  }
  
  await cache.set(key, requests + 1, 60000);  // 1 minute window
  return true;
}

// Usage in middleware
use(async (req, res, next) => {
  const allowed = await checkRateLimit(req.ip);
  
  if (!allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  next();
});
```

### API Response Cache

```javascript
async function getCachedData(key, fetcher, ttl = 300000) {
  // Try cache first
  let data = await cache.get(key);
  
  if (data) {
    return { data, source: 'cache' };
  }
  
  // Cache miss - fetch fresh data
  data = await fetcher();
  
  // Store in cache
  await cache.set(key, data, ttl);
  
  return { data, source: 'fresh' };
}

// Usage
get('/api/users', async (req, res) => {
  const { data, source } = await getCachedData(
    'users:all',
    () => db.users.findAll(),
    300000  // 5 minutes
  );
  
  res.header('X-Cache', source);
  res.json(data);
});
```

---

## Testing

### Unit Tests

```javascript
import assert from 'assert';

async function testMemoryAdapter() {
  await build({ cache: { type: 'memory' } });
  
  // Test set/get
  await cache.set('test', 'value');
  const value = await cache.get('test');
  assert.equal(value, 'value');
  
  // Test TTL
  await cache.set('temp', 'data', 100);
  await new Promise(resolve => setTimeout(resolve, 150));
  const expired = await cache.get('temp');
  assert.equal(expired, null);
  
  // Test delete
  await cache.set('del', 'value');
  await cache.delete('del');
  const deleted = await cache.get('del');
  assert.equal(deleted, null);
  
  // Test clear
  await cache.set('key1', 'val1');
  await cache.set('key2', 'val2');
  await cache.clear();
  const keys = await cache.keys('*');
  assert.equal(keys.length, 0);
  
  console.log('✅ Memory adapter tests passed');
}

testMemoryAdapter();
```

---

## Migration

### From Memory to Redis

```javascript
// Before (Memory)
await build({
  cache: {
    type: 'memory',
    retention: 600000
  }
});

// After (Redis)
await build({
  cache: {
    type: 'redis',
    database: {
      host: process.env.REDIS_HOST,
      port: 6379
    }
  }
});

// No code changes needed - same API!
```

---

## Troubleshooting

### High Memory Usage

**Problem:** Memory usage keeps growing

**Solution:**
```javascript
// Add memory monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`Memory: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
}, 10000);

// Reduce retention time
await build({
  cache: {
    type: 'memory',
    retention: 60000  // 1 minute instead of 10
  }
});

// Regular cleanup
setInterval(async () => {
  await cache.clear();
}, 3600000);  // Clear every hour
```

### Data Not Expiring

**Problem:** Keys not being cleaned up

**Cause:** Memory adapter cleans on access

**Solution:**
```javascript
// Access keys to trigger cleanup
setInterval(async () => {
  const keys = await cache.keys('*');
  for (const key of keys) {
    await cache.get(key);  // Triggers expiration check
  }
}, 60000);
```

---

## Next Steps

- **[Configuration Guide](../configuration.md)** - Advanced config
- **[Redis Adapter](redis.md)** - For production
- **[MongoDB Adapter](mongodb.md)** - For persistence
- **[Performance Guide](../performance.md)** - Optimization

---

**Questions?** [GitHub Issues](https://github.com/trivajs/triva/issues)
