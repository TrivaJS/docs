# Database & Cache Overview

Triva provides a powerful, flexible caching system with support for multiple database adapters. This guide covers everything you need to know about Triva's database and caching capabilities.

## Table of Contents

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [Concepts](#concepts)
- [Available Adapters](#available-adapters)
- [Common Patterns](#common-patterns)
- [Performance Considerations](#performance-considerations)
- [Best Practices](#best-practices)

---

## Introduction

### What is the Cache System?

Triva's cache system provides a unified API for storing and retrieving data across different storage backends. Whether you need in-memory caching for speed, persistent storage with Redis, or database-backed caching with MongoDB, Triva provides a consistent interface.

### Key Features

✅ **Unified API** - Same code works with any adapter  
✅ **Multiple Adapters** - 9 built-in adapters plus custom support  
✅ **TTL Support** - Automatic expiration for all adapters  
✅ **Pattern Matching** - Search and delete keys by pattern  
✅ **Type Safety** - Automatic serialization/deserialization  
✅ **Zero Config** - Works out of the box with memory adapter  
✅ **Production Ready** - Battle-tested in production environments  

### Architecture

```
Your Application
       ↓
  Cache API (Unified Interface)
       ↓
   Adapter Layer
       ↓
┌──────┴──────┬──────────┬──────────┐
Memory    MongoDB    Redis   PostgreSQL ...
```

---

## Quick Start

### 1. Basic Memory Cache (Zero Dependencies)

```javascript
import { build, cache } from 'triva';

// Build with default memory cache
await build({
  cache: {
    type: 'memory',
    retention: 600000  // 10 minutes
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

### 2. Redis Cache (Production)

```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'redis',
    database: {
      host: 'localhost',
      port: 6379,
      password: process.env.REDIS_PASSWORD
    }
  }
});

// Same API - different backend!
await cache.set('session:abc', { userId: 123, token: 'xyz' }, 3600000);
```

### 3. MongoDB Cache (Persistent + Flexible)

```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: process.env.MONGODB_URI,
      collection: 'cache'
    }
  }
});

// Complex objects stored seamlessly
await cache.set('order:456', {
  items: [{ id: 1, qty: 2 }, { id: 2, qty: 1 }],
  total: 49.99,
  timestamp: new Date()
});
```

---

## Concepts

### Cache Keys

Keys are strings that identify cached values. Best practices:

**✅ Good Key Patterns:**
```javascript
'user:123'
'session:abc123def456'
'product:sku:XYZ789'
'api:github:user:octocat'
'rate-limit:192.168.1.1'
```

**❌ Poor Key Patterns:**
```javascript
'123' // Not descriptive
'john' // Ambiguous
'data' // Too generic
'user-with-id-123' // Use colons instead
```

**Naming Convention:**
```
resource:identifier:subresource
```

Examples:
```javascript
await cache.set('user:123', userData);
await cache.set('user:123:settings', userSettings);
await cache.set('user:123:orders', userOrders);
await cache.set('product:abc:inventory', inventoryData);
```

### Time-To-Live (TTL)

TTL controls how long data stays in the cache before automatic deletion.

```javascript
// TTL in milliseconds
await cache.set('temp:data', value, 60000);  // 1 minute
await cache.set('session', value, 3600000);  // 1 hour
await cache.set('token', value, 86400000);   // 24 hours

// No TTL = data persists until manually deleted
await cache.set('permanent', value);
```

**Common TTL Values:**
```javascript
const TTL = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000
};

await cache.set('data', value, TTL.FIVE_MINUTES);
```

### Data Types

The cache API handles various data types automatically:

```javascript
// Strings
await cache.set('name', 'John Doe');

// Numbers
await cache.set('count', 42);
await cache.set('price', 19.99);

// Booleans
await cache.set('is_active', true);

// Objects
await cache.set('user', { id: 123, name: 'John' });

// Arrays
await cache.set('tags', ['node', 'javascript', 'cache']);

// Dates (stored as ISO strings)
await cache.set('created_at', new Date());

// null/undefined
await cache.set('empty', null);
```

**Retrieval:**
```javascript
const name = await cache.get('name');  // "John Doe"
const count = await cache.get('count');  // 42
const user = await cache.get('user');  // { id: 123, name: 'John' }
const missing = await cache.get('nonexistent');  // null
```

### Pattern Matching

Search for keys using wildcards:

```javascript
// Get all user keys
const userKeys = await cache.keys('user:*');
// ['user:123', 'user:456', 'user:789']

// Get specific user data keys
const userDataKeys = await cache.keys('user:123:*');
// ['user:123:settings', 'user:123:orders', 'user:123:profile']

// Get all session keys
const sessions = await cache.keys('session:*');

// Get all keys (use with caution!)
const allKeys = await cache.keys('*');
```

**Deleting by Pattern:**
```javascript
// Delete all sessions
const sessionKeys = await cache.keys('session:*');
for (const key of sessionKeys) {
  await cache.delete(key);
}

// Helper function for batch delete
async function deletePattern(pattern) {
  const keys = await cache.keys(pattern);
  await Promise.all(keys.map(key => cache.delete(key)));
  return keys.length;
}

await deletePattern('temp:*');  // Delete all temp keys
```

---

## Available Adapters

### Built-in Adapters (No Dependencies)

#### 1. Memory Adapter
- **Type:** `memory`
- **Dependencies:** None
- **Use Case:** Development, testing, temporary caching
- **Pros:** Fast, zero setup
- **Cons:** Data lost on restart, limited by RAM

```javascript
await build({
  cache: {
    type: 'memory',
    retention: 600000  // Optional default TTL
  }
});
```

#### 2. Embedded Adapter
- **Type:** `embedded`
- **Dependencies:** None
- **Use Case:** Small apps, persistent local storage
- **Pros:** Encrypted, no database needed
- **Cons:** File-based, slower than memory

```javascript
await build({
  cache: {
    type: 'embedded',
    database: {
      filepath: './cache/data.enc',
      key: process.env.ENCRYPTION_KEY  // 256-bit key
    }
  }
});
```

### External Adapters (Require npm install)

#### 3. SQLite Adapter
- **Type:** `sqlite`
- **Install:** `npm install sqlite3`
- **Use Case:** Single-server apps, development
- **Pros:** SQL, portable, serverless
- **Cons:** Concurrent writes limited

```javascript
await build({
  cache: {
    type: 'sqlite',
    database: {
      filepath: './cache.db',
      tableName: 'cache'  // Optional
    }
  }
});
```

#### 4. Better-SQLite3 Adapter
- **Type:** `better-sqlite3`
- **Install:** `npm install better-sqlite3`
- **Use Case:** Faster SQLite alternative
- **Pros:** Synchronous, faster, simpler
- **Cons:** No async support

```javascript
await build({
  cache: {
    type: 'better-sqlite3',
    database: {
      filepath: './cache.db',
      tableName: 'cache'
    }
  }
});
```

#### 5. MongoDB Adapter
- **Type:** `mongodb`
- **Install:** `npm install mongodb`
- **Use Case:** Production, distributed systems
- **Pros:** Scalable, flexible, TTL indexes
- **Cons:** Requires MongoDB server

```javascript
await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://localhost:27017/myapp',
      collection: 'cache'
    }
  }
});
```

#### 6. Redis Adapter
- **Type:** `redis`
- **Install:** `npm install redis`
- **Use Case:** Production, high-performance caching
- **Pros:** Extremely fast, distributed, pub/sub
- **Cons:** In-memory (costs for large datasets)

```javascript
await build({
  cache: {
    type: 'redis',
    database: {
      host: 'localhost',
      port: 6379,
      password: process.env.REDIS_PASSWORD,
      db: 0
    }
  }
});
```

#### 7. PostgreSQL Adapter
- **Type:** `postgresql`
- **Install:** `npm install pg`
- **Use Case:** Enterprise, relational data
- **Pros:** ACID, JSON support, mature
- **Cons:** Heavier than Redis/MongoDB

```javascript
await build({
  cache: {
    type: 'postgresql',
    database: {
      host: 'localhost',
      port: 5432,
      database: 'myapp',
      user: 'postgres',
      password: process.env.PG_PASSWORD,
      tableName: 'cache'
    }
  }
});
```

#### 8. MySQL Adapter
- **Type:** `mysql`
- **Install:** `npm install mysql2`
- **Use Case:** Legacy systems, shared hosting
- **Pros:** Widely supported, mature
- **Cons:** JSON support limited (older versions)

```javascript
await build({
  cache: {
    type: 'mysql',
    database: {
      host: 'localhost',
      port: 3306,
      database: 'myapp',
      user: 'root',
      password: process.env.MYSQL_PASSWORD,
      tableName: 'cache'
    }
  }
});
```

#### 9. Supabase Adapter
- **Type:** `supabase`
- **Install:** `npm install @supabase/supabase-js`
- **Use Case:** Serverless, JAMstack apps
- **Pros:** Managed, real-time, auth included
- **Cons:** Vendor lock-in

```javascript
await build({
  cache: {
    type: 'supabase',
    database: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY,
      tableName: 'cache'
    }
  }
});
```

---

## Common Patterns

### 1. Cache-Aside Pattern

Most common caching pattern:

```javascript
async function getUser(id) {
  // Try cache first
  const cached = await cache.get(`user:${id}`);
  if (cached) {
    return cached;
  }
  
  // Cache miss - fetch from database
  const user = await db.users.findById(id);
  
  // Store in cache for next time
  await cache.set(`user:${id}`, user, 3600000);  // 1 hour
  
  return user;
}
```

### 2. Write-Through Pattern

Update cache and database together:

```javascript
async function updateUser(id, updates) {
  // Update database
  const user = await db.users.update(id, updates);
  
  // Update cache immediately
  await cache.set(`user:${id}`, user, 3600000);
  
  return user;
}
```

### 3. Cache Invalidation

Remove stale data:

```javascript
async function deleteUser(id) {
  // Delete from database
  await db.users.delete(id);
  
  // Invalidate cache
  await cache.delete(`user:${id}`);
  await cache.delete(`user:${id}:settings`);
  await cache.delete(`user:${id}:orders`);
}
```

### 4. Lazy Loading with TTL

```javascript
async function getProductInventory(sku) {
  const key = `product:${sku}:inventory`;
  
  let inventory = await cache.get(key);
  if (inventory) return inventory;
  
  inventory = await fetchInventoryFromWarehouse(sku);
  await cache.set(key, inventory, 300000);  // 5 minutes
  
  return inventory;
}
```

### 5. Session Management

```javascript
import crypto from 'crypto';

async function createSession(userId) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  
  await cache.set(`session:${sessionId}`, {
    userId,
    createdAt: new Date(),
    lastAccess: new Date()
  }, 86400000);  // 24 hours
  
  return sessionId;
}

async function getSession(sessionId) {
  const session = await cache.get(`session:${sessionId}`);
  
  if (session) {
    // Update last access
    session.lastAccess = new Date();
    await cache.set(`session:${sessionId}`, session, 86400000);
  }
  
  return session;
}

async function destroySession(sessionId) {
  await cache.delete(`session:${sessionId}`);
}
```

---

## Performance Considerations

### Adapter Performance Comparison

| Adapter | Read Speed | Write Speed | Use Case |
|---------|-----------|-------------|----------|
| Memory | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡⚡ | Dev/testing |
| Redis | ⚡⚡⚡⚡ | ⚡⚡⚡⚡ | Production cache |
| MongoDB | ⚡⚡⚡ | ⚡⚡⚡ | Persistent data |
| PostgreSQL | ⚡⚡ | ⚡⚡ | Enterprise/ACID |
| SQLite | ⚡⚡⚡ | ⚡⚡ | Single-server |
| MySQL | ⚡⚡ | ⚡⚡ | Shared hosting |

### Memory vs. Disk

**Memory-Based (Memory, Redis):**
- ✅ Extremely fast (microseconds)
- ✅ Simple setup
- ❌ Limited by RAM
- ❌ Data lost on restart (unless Redis persistence)

**Disk-Based (SQLite, Embedded):**
- ✅ Unlimited storage (disk space)
- ✅ Data persists
- ❌ Slower (milliseconds)
- ❌ I/O bottleneck

**Database-Based (MongoDB, PostgreSQL, MySQL):**
- ✅ Scalable
- ✅ Queryable
- ✅ ACID guarantees (PostgreSQL, MySQL)
- ❌ Network latency
- ❌ More complex setup

### Optimization Tips

**1. Use TTL Wisely**
```javascript
// Don't cache data that changes frequently
await cache.set('stock:price', price, 1000);  // 1 second

// Cache static data longer
await cache.set('product:details', product, 86400000);  // 24 hours
```

**2. Batch Operations**
```javascript
// ❌ Slow - multiple network calls
for (const id of userIds) {
  await cache.get(`user:${id}`);
}

// ✅ Better - batch if adapter supports
const keys = userIds.map(id => `user:${id}`);
// (Implementation depends on adapter)
```

**3. Key Naming for Performance**
```javascript
// ✅ Short, descriptive keys
'u:123'  // user:123
'p:abc'  // product:abc

// ❌ Very long keys waste memory
'application_user_with_identifier_123'
```

---

## Best Practices

### 1. Environment-Specific Configuration

```javascript
const cacheConfig = {
  development: {
    type: 'memory',
    retention: 60000  // 1 minute
  },
  production: {
    type: 'redis',
    database: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD
    }
  },
  test: {
    type: 'memory'
  }
};

await build({
  cache: cacheConfig[process.env.NODE_ENV]
});
```

### 2. Error Handling

```javascript
try {
  await cache.set('key', value);
} catch (error) {
  console.error('Cache error:', error);
  // Don't let cache failures break your app
  // Fall back to database query
}
```

### 3. Monitoring

```javascript
// Track cache hit/miss ratio
let hits = 0, misses = 0;

async function getCached(key) {
  const value = await cache.get(key);
  if (value) {
    hits++;
    console.log(`Cache hit rate: ${(hits / (hits + misses) * 100).toFixed(2)}%`);
  } else {
    misses++;
  }
  return value;
}
```

### 4. Security

```javascript
// ✅ Never cache sensitive data without encryption
await cache.set('credit-card', encrypted(cardData), 300000);

// ✅ Use environment variables for credentials
const password = process.env.REDIS_PASSWORD;

// ✅ Validate keys to prevent injection
function sanitizeKey(key) {
  return key.replace(/[^a-zA-Z0-9:-]/g, '');
}
```

### 5. Testing

```javascript
// Use memory cache for tests
if (process.env.NODE_ENV === 'test') {
  await build({ cache: { type: 'memory' } });
}

// Clear cache between tests
beforeEach(async () => {
  await cache.clear();
});
```

---

## Next Steps

- **[Configuration Guide](configuration.md)** - Detailed adapter configuration
- **[Adapter Guides](adapters/)** - Deep dives into each adapter
- **[Custom Adapters](custom-adapters.md)** - Build your own
- **[Performance Tuning](performance.md)** - Optimization strategies
- **[Migration Guide](migration.md)** - Switching between adapters

---

**Questions?** See our [API Reference](../api-reference/cache/) or [open an issue](https://github.com/trivajs/triva/issues).
