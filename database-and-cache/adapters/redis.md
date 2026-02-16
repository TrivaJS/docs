# Redis Adapter

High-performance distributed cache using Redis for production environments.

## Overview

Redis is an in-memory data structure store, ideal for caching, session management, and real-time analytics.

### When to Use

✅ **Production** - High performance and reliability  
✅ **Distributed systems** - Shared cache across servers  
✅ **Real-time** - Sub-millisecond latency  
✅ **Session storage** - Fast user session management  
✅ **Rate limiting** - Distributed throttling  

---

## Installation

```bash
npm install redis
```

## Quick Start

```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'redis',
    database: {
      host: 'localhost',
      port: 6379,
      password: process.env.REDIS_PASSWORD,
      db: 0  // Database number (0-15)
    }
  }
});

// Use cache API
await cache.set('user:123', { name: 'John' }, 3600000);
const user = await cache.get('user:123');
```

---

## Configuration

### Basic Setup

```javascript
await build({
  cache: {
    type: 'redis',
    database: {
      host: 'localhost',
      port: 6379
    }
  }
});
```

### With Authentication

```javascript
await build({
  cache: {
    type: 'redis',
    database: {
      host: process.env.REDIS_HOST,
      port: 6379,
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME  // Redis 6+
    }
  }
});
```

### With TLS

```javascript
import fs from 'fs';

await build({
  cache: {
    type: 'redis',
    database: {
      host: 'redis.example.com',
      port: 6380,
      password: process.env.REDIS_PASSWORD,
      tls: {
        ca: fs.readFileSync('./ca.crt'),
        cert: fs.readFileSync('./client.crt'),
        key: fs.readFileSync('./client.key')
      }
    }
  }
});
```

### Redis Cluster

```javascript
await build({
  cache: {
    type: 'redis',
    database: {
      cluster: true,
      nodes: [
        { host: 'node1.redis.example.com', port: 6379 },
        { host: 'node2.redis.example.com', port: 6379 },
        { host: 'node3.redis.example.com', port: 6379 }
      ]
    }
  }
});
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `host` | string | Redis server hostname |
| `port` | number | Redis server port (default: 6379) |
| `password` | string | Redis password |
| `username` | string | Redis username (Redis 6+) |
| `db` | number | Database number (0-15) |
| `tls` | object | TLS configuration |
| `cluster` | boolean | Use Redis Cluster |
| `nodes` | array | Cluster nodes |

---

## Features

### Automatic TTL

```javascript
// TTL in milliseconds
await cache.set('session', data, 3600000);  // 1 hour

// Redis converts to seconds automatically
// SETEX session 3600 <data>
```

### Pattern Matching

```javascript
// Store keys
await cache.set('user:1', { name: 'Alice' });
await cache.set('user:2', { name: 'Bob' });
await cache.set('session:abc', { userId: 1 });

// Get all user keys
const userKeys = await cache.keys('user:*');
// ['user:1', 'user:2']

// Get all keys
const allKeys = await cache.keys('*');
```

### Atomic Operations

```javascript
// Increment
await cache.set('counter', 0);
// Use Redis INCR command directly if needed
```

---

## Best Practices

### 1. Use Connection Pooling

```javascript
// Triva handles connection pooling automatically
// Single connection reused for all operations
```

### 2. Set Appropriate TTLs

```javascript
// Short TTL for volatile data
await cache.set('stock:AAPL', price, 1000);  // 1 second

// Medium TTL for user data
await cache.set('user:123', userData, 300000);  // 5 minutes

// Long TTL for static data
await cache.set('config', configData, 86400000);  // 24 hours
```

### 3. Use Namespacing

```javascript
// Organized keys
await cache.set('prod:user:123', userData);
await cache.set('prod:session:abc', sessionData);
await cache.set('prod:cache:api-response', apiData);
```

### 4. Monitor Memory

```javascript
// Redis maxmemory policy
// Set in redis.conf:
// maxmemory 2gb
// maxmemory-policy allkeys-lru
```

### 5. Use Redis for Distributed Locking

```javascript
async function acquireLock(resource, timeout = 10000) {
  const lockKey = `lock:${resource}`;
  const lockValue = crypto.randomUUID();
  
  const acquired = await cache.set(lockKey, lockValue, timeout);
  return acquired ? lockValue : null;
}

async function releaseLock(resource, lockValue) {
  const lockKey = `lock:${resource}`;
  const current = await cache.get(lockKey);
  
  if (current === lockValue) {
    await cache.delete(lockKey);
    return true;
  }
  
  return false;
}
```

---

## Production Setup

### Redis Configuration

```bash
# /etc/redis/redis.conf

# Bind to specific interface
bind 127.0.0.1

# Require password
requirepass YOUR_STRONG_PASSWORD

# Set max memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Enable persistence (optional)
save 900 1
save 300 10
save 60 10000

# AOF persistence (optional)
appendonly yes
appendfsync everysec
```

### High Availability

```javascript
// Redis Sentinel for automatic failover
await build({
  cache: {
    type: 'redis',
    database: {
      sentinels: [
        { host: 'sentinel1', port: 26379 },
        { host: 'sentinel2', port: 26379 },
        { host: 'sentinel3', port: 26379 }
      ],
      name: 'mymaster',
      password: process.env.REDIS_PASSWORD
    }
  }
});
```

---

## Monitoring

### Redis CLI

```bash
# Connect to Redis
redis-cli -h localhost -p 6379 -a PASSWORD

# Monitor commands
MONITOR

# Get info
INFO

# Get memory usage
INFO memory

# Get key count
DBSIZE

# Get key sample
KEYS user:*

# Get specific key
GET user:123

# Delete key
DEL user:123
```

### Metrics

```javascript
// Track Redis operations
const metrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0
};

// Wrap cache operations
const originalGet = cache.get;
cache.get = async function(key) {
  const value = await originalGet.call(this, key);
  if (value) metrics.hits++;
  else metrics.misses++;
  return value;
};

// Report metrics
setInterval(() => {
  const total = metrics.hits + metrics.misses;
  const hitRate = total > 0 ? (metrics.hits / total * 100).toFixed(2) : 0;
  
  console.log({
    hitRate: `${hitRate}%`,
    hits: metrics.hits,
    misses: metrics.misses,
    sets: metrics.sets
  });
}, 60000);
```

---

## Troubleshooting

### Connection Failed

**Problem:** Cannot connect to Redis

**Solutions:**
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Check Redis logs
tail -f /var/log/redis/redis-server.log

# Check port is open
nc -zv localhost 6379

# Check password
redis-cli -a PASSWORD ping
```

### Out of Memory

**Problem:** Redis runs out of memory

**Solutions:**
```javascript
// Reduce TTLs
await cache.set(key, value, 300000);  // 5 min instead of 1 hour

// Set maxmemory policy
// In redis.conf:
// maxmemory-policy allkeys-lru

// Clear old keys
await cache.clear();
```

---

## Next Steps

- **[MongoDB Adapter](mongodb.md)** - Alternative persistence
- **[Performance Guide](../performance.md)** - Optimization tips
- **[Migration Guide](../migration.md)** - Switching adapters

---

**Questions?** [GitHub Issues](https://github.com/trivajs/triva/issues)
