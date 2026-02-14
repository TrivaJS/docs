# Performance Guide

Optimization strategies for high-performance Triva applications.

## Table of Contents

- [Benchmarking](#benchmarking)
- [Cache Optimization](#cache-optimization)
- [Middleware Optimization](#middleware-optimization)
- [Database Optimization](#database-optimization)
- [Production Tuning](#production-tuning)

---

## Benchmarking

### Measure First

Always benchmark before and after optimizations:

```javascript
// Simple benchmark
console.time('request');
await fetch('http://localhost:3000/api/data');
console.timeEnd('request');
```

### Load Testing

**Using autocannon**:
```bash
npm install -g autocannon

# 10 connections, 10 seconds
autocannon -c 10 -d 10 http://localhost:3000

# Results:
# Req/Sec: 15,234
# Latency: 0.65ms avg
```

**Using Apache Bench**:
```bash
# 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:3000/

# Results:
# Requests per second: 12,456
# Time per request: 0.80ms
```

---

## Cache Optimization

### 1. Choose Right Adapter

**Development**:
```javascript
// Memory - fastest, no setup
cache: { type: 'memory' }
```

**Production (High Performance)**:
```javascript
// Redis - sub-millisecond latency
cache: {
  type: 'redis',
  database: {
    host: 'localhost',
    port: 6379
  }
}
```

**Production (Distributed)**:
```javascript
// MongoDB - good for complex queries
cache: {
  type: 'mongodb',
  database: {
    uri: process.env.MONGODB_URI
  }
}
```

### 2. Set Appropriate TTLs

```javascript
// ❌ Bad - no TTL, cache grows forever
await cache.set('user:123', userData);

// ✅ Good - appropriate TTL
await cache.set('user:123', userData, 300000);  // 5 min

// Different TTLs for different data
await cache.set('static:config', config, 3600000);    // 1 hour
await cache.set('volatile:price', price, 1000);       // 1 second
```

### 3. Cache at Multiple Levels

```javascript
// L1: In-memory (fastest)
const memCache = new Map();

// L2: Redis (fast, distributed)
async function getData(key) {
  // Try L1 first
  if (memCache.has(key)) {
    return memCache.get(key);
  }
  
  // Try L2
  let data = await cache.get(key);
  
  if (!data) {
    // Cache miss - fetch from DB
    data = await db.find(key);
    
    // Store in both levels
    await cache.set(key, data, 300000);
  }
  
  // Store in L1
  memCache.set(key, data);
  setTimeout(() => memCache.delete(key), 60000);  // 1 min L1 TTL
  
  return data;
}
```

### 4. Batch Operations

```javascript
// ❌ Bad - sequential calls
for (const id of userIds) {
  const user = await cache.get(`user:${id}`);
  users.push(user);
}

// ✅ Good - batch get (if adapter supports)
const keys = userIds.map(id => `user:${id}`);
const users = await Promise.all(
  keys.map(key => cache.get(key))
);
```

---

## Middleware Optimization

### 1. Minimize Middleware

```javascript
// ❌ Bad - too many middleware
use(middleware1);
use(middleware2);
use(middleware3);
use(middleware4);
use(middleware5);

// ✅ Good - combined where possible
use(combinedMiddleware);
```

### 2. Early Exit Pattern

```javascript
// ✅ Fast path for health checks
use((req, res, next) => {
  if (req.url === '/health') {
    return res.send('OK');  // Skip all other middleware
  }
  next();
});

// Heavy middleware below
use(expensiveAuth);
use(expensiveLogging);
```

### 3. Conditional Middleware

```javascript
// ✅ Only apply when needed
use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    return authMiddleware(req, res, next);
  }
  next();
});
```

### 4. Avoid Sync Operations

```javascript
// ❌ Bad - blocks event loop
use((req, res, next) => {
  const data = fs.readFileSync('./config.json');
  req.config = JSON.parse(data);
  next();
});

// ✅ Good - async
const configCache = JSON.parse(
  fs.readFileSync('./config.json')
);

use((req, res, next) => {
  req.config = configCache;  // Instant
  next();
});
```

---

## Database Optimization

### 1. Connection Pooling

**Redis**:
```javascript
// Triva handles this automatically
// Single connection reused
```

**MongoDB**:
```javascript
cache: {
  type: 'mongodb',
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 20,
      minPoolSize: 5
    }
  }
}
```

**PostgreSQL**:
```javascript
cache: {
  type: 'postgresql',
  database: {
    host: 'localhost',
    max: 20,  // Pool size
    idleTimeoutMillis: 30000
  }
}
```

### 2. Query Optimization

**Use indexes**:
```sql
-- MongoDB
db.cache.createIndex({ expireAt: 1 });
db.cache.createIndex({ key: 1 });

-- PostgreSQL
CREATE INDEX idx_cache_key ON cache(key);
CREATE INDEX idx_cache_expire ON cache(expire_at);
```

### 3. Limit Result Size

```javascript
// ❌ Bad - fetch everything
const keys = await cache.keys('*');

// ✅ Good - specific pattern
const keys = await cache.keys('user:*');
```

---

## Production Tuning

### 1. Node.js Optimization

**Increase memory**:
```bash
node --max-old-space-size=4096 server.js
```

**Use clustering**:
```javascript
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const cpus = os.cpus().length;
  
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
} else {
  // Worker process
  await build({ cache: { type: 'redis' } });
  listen(3000);
}
```

### 2. Process Manager

**PM2**:
```bash
# Install
npm install -g pm2

# Start with clustering
pm2 start server.js -i max

# Monitor
pm2 monit
```

**PM2 ecosystem.config.js**:
```javascript
module.exports = {
  apps: [{
    name: 'triva-app',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 3. Compression

```javascript
import { use } from 'triva';
import compression from '@triva/compression';

use(compression({
  level: 6,        // Balance speed/size
  threshold: 1024  // Only compress >1KB
}));
```

### 4. Keep-Alive

```javascript
import { build } from 'triva';

await build({
  cache: { type: 'redis' },
  keepAliveTimeout: 65000  // 65 seconds
});
```

---

## Monitoring Performance

### 1. Response Time Tracking

```javascript
use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
    
    if (duration > 1000) {
      console.warn('Slow request detected!');
    }
  });
  
  next();
});
```

### 2. Memory Monitoring

```javascript
setInterval(() => {
  const usage = process.memoryUsage();
  console.log({
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`
  });
}, 60000);
```

### 3. Event Loop Lag

```javascript
let lastCheck = Date.now();

setInterval(() => {
  const now = Date.now();
  const lag = now - lastCheck - 1000;
  
  if (lag > 100) {
    console.warn(`Event loop lag: ${lag}ms`);
  }
  
  lastCheck = now;
}, 1000);
```

---

## Performance Checklist

### Application Level
- [ ] Appropriate cache adapter chosen
- [ ] TTLs configured for all cache entries
- [ ] Middleware minimized and optimized
- [ ] Early exit patterns implemented
- [ ] No synchronous I/O in hot paths

### Database Level
- [ ] Connection pooling configured
- [ ] Indexes created on cache tables
- [ ] Query patterns optimized
- [ ] Batch operations where possible

### Server Level
- [ ] Clustering enabled (multi-core)
- [ ] Process manager configured (PM2)
- [ ] Compression enabled
- [ ] Keep-alive enabled
- [ ] Memory limits set

### Monitoring
- [ ] Response time tracking
- [ ] Memory monitoring
- [ ] Event loop lag detection
- [ ] Error rate tracking
- [ ] Cache hit rate monitoring

---

## Benchmarks

Typical performance on modern hardware:

| Scenario | Requests/sec | Latency (avg) |
|----------|--------------|---------------|
| Simple route (no cache) | 50,000+ | <1ms |
| With memory cache | 45,000+ | <1ms |
| With Redis cache | 35,000+ | 1-2ms |
| With middleware chain | 30,000+ | 1-3ms |
| Full stack (auth + cache) | 20,000+ | 2-5ms |

*Node.js 20, single core, Intel i7*

---

**Next**: [Monitoring Guide](monitoring.md) | [Scaling Guide](scaling.md)
