# MongoDB Adapter

NoSQL document database for production-grade persistent caching.

## Overview

MongoDB is a document-oriented NoSQL database that provides flexible schema, horizontal scaling, and powerful querying capabilities.

### When to Use

✅ **Production** - Persistent, reliable storage  
✅ **Scalable systems** - Horizontal scaling with sharding  
✅ **Flexible data** - Schema-less document storage  
✅ **Complex queries** - Rich query language  
✅ **Distributed** - Shared cache across servers  

❌ **Sub-millisecond latency** - Use Redis instead  
❌ **Simple key-value** - Memory/Redis simpler  

---

## Installation

```bash
npm install mongodb
```

## Quick Start

```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://localhost:27017/myapp',
      collection: 'cache'  // Collection name
    }
  }
});

// Use cache API
await cache.set('user:123', { name: 'John', age: 30 });
const user = await cache.get('user:123');
```

---

## Configuration

### Local MongoDB

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

### MongoDB Atlas (Cloud)

```javascript
await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: process.env.MONGODB_URI,
      // mongodb+srv://username:password@cluster.mongodb.net/dbname
      collection: 'cache'
    }
  }
});
```

### With Authentication

```javascript
await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://username:password@host:27017/dbname',
      collection: 'cache',
      options: {
        authSource: 'admin',
        ssl: true
      }
    }
  }
});
```

### Replica Set

```javascript
await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://host1:27017,host2:27017,host3:27017/myapp?replicaSet=rs0',
      collection: 'cache',
      options: {
        readPreference: 'primaryPreferred',
        w: 'majority'
      }
    }
  }
});
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `uri` | string | MongoDB connection string |
| `collection` | string | Collection name (default: 'cache') |
| `options` | object | MongoDB connection options |

---

## Features

### Automatic TTL Indexes

MongoDB automatically cleans up expired documents using TTL indexes.

```javascript
// Set with TTL
await cache.set('session', data, 3600000);  // 1 hour

// MongoDB creates: { expireAt: new Date(Date.now() + 3600000) }
// Background task removes expired docs automatically
```

### Document Structure

```javascript
// Internal MongoDB document structure
{
  _id: 'user:123',              // Cache key
  value: { name: 'John' },      // Your data
  expireAt: ISODate('2026-02-13T05:00:00Z'),  // TTL
  createdAt: ISODate('2026-02-13T04:00:00Z')
}
```

### Rich Querying

```javascript
// Pattern matching
const userKeys = await cache.keys('user:*');

// MongoDB query: { _id: { $regex: /^user:/ } }
```

### Transactions Support

MongoDB supports multi-document transactions (replica sets only).

```javascript
// Triva handles this automatically
await cache.set('key1', 'value1');
await cache.set('key2', 'value2');
```

---

## Best Practices

### 1. Use Connection Pooling

```javascript
// Triva handles pooling automatically
// Default pool size: 10 connections
```

### 2. Create Indexes

```javascript
// TTL index created automatically on expireAt
// Additional indexes for performance:

// In MongoDB shell:
db.cache.createIndex({ createdAt: 1 });
db.cache.createIndex({ expireAt: 1 });
```

### 3. Monitor Collection Size

```javascript
// Check collection stats regularly
// In MongoDB shell:
db.cache.stats();

// Or in Node.js:
const db = client.db('myapp');
const stats = await db.collection('cache').stats();
console.log(`Size: ${stats.size / 1024 / 1024}MB`);
```

### 4. Set Appropriate TTLs

```javascript
// Short TTL for volatile data
await cache.set('stock:price', price, 5000);  // 5 seconds

// Medium TTL for user data
await cache.set('user:profile', userData, 600000);  // 10 minutes

// Long TTL for static data
await cache.set('config', configData, 86400000);  // 24 hours
```

### 5. Handle Large Documents

```javascript
// MongoDB has 16MB document limit
const largeData = { /* ... */ };
const size = JSON.stringify(largeData).length;

if (size > 15 * 1024 * 1024) {  // 15MB safety margin
  console.warn('Document too large for MongoDB');
  // Consider GridFS or breaking into chunks
}
```

---

## Production Setup

### MongoDB Configuration

**mongod.conf:**
```yaml
# Storage
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Network
net:
  port: 27017
  bindIp: 127.0.0.1

# Security
security:
  authorization: enabled

# Replication (for production)
replication:
  replSetName: rs0
```

### Create User

```javascript
// In MongoDB shell
use admin
db.createUser({
  user: "trivaAdmin",
  pwd: "securePassword",
  roles: [
    { role: "readWrite", db: "myapp" }
  ]
});
```

### Replica Set Setup

```bash
# Initialize replica set
mongosh
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
});
```

### Sharding (Optional)

For very large datasets:

```javascript
// Enable sharding on database
sh.enableSharding("myapp");

// Shard collection
sh.shardCollection("myapp.cache", { _id: "hashed" });
```

---

## Monitoring

### MongoDB Compass

GUI tool for monitoring:
- Collection statistics
- Query performance
- Index usage
- Real-time metrics

### MongoDB Shell

```javascript
// Connect
mongosh mongodb://localhost:27017/myapp

// Collection stats
db.cache.stats();

// Count documents
db.cache.countDocuments();

// Find documents
db.cache.find({ _id: /^user:/ }).limit(10);

// Check indexes
db.cache.getIndexes();

// Current operations
db.currentOp();
```

### Performance Metrics

```javascript
// Track cache operations
const metrics = {
  reads: 0,
  writes: 0,
  deletes: 0,
  hits: 0,
  misses: 0
};

// Wrap cache.get
const originalGet = cache.get;
cache.get = async function(key) {
  metrics.reads++;
  const value = await originalGet.call(this, key);
  if (value) metrics.hits++;
  else metrics.misses++;
  return value;
};

// Report every minute
setInterval(() => {
  const hitRate = metrics.reads > 0 
    ? (metrics.hits / metrics.reads * 100).toFixed(2) 
    : 0;
  
  console.log({
    reads: metrics.reads,
    writes: metrics.writes,
    hitRate: `${hitRate}%`
  });
}, 60000);
```

---

## Troubleshooting

### Connection Failed

**Problem:** Cannot connect to MongoDB

**Solutions:**

```bash
# Check MongoDB is running
systemctl status mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh mongodb://localhost:27017

# Check authentication
mongosh mongodb://username:password@localhost:27017/myapp
```

### Slow Queries

**Problem:** Cache operations slow

**Solutions:**

```javascript
// Enable profiling
db.setProfilingLevel(1, { slowms: 100 });

// Check slow queries
db.system.profile.find({ millis: { $gt: 100 } });

// Create indexes
db.cache.createIndex({ expireAt: 1 });

// Analyze query
db.cache.find({ _id: /^user:/ }).explain("executionStats");
```

### Collection Growing Too Large

**Problem:** Cache collection uses too much space

**Solutions:**

```javascript
// Reduce default TTLs
await build({
  cache: {
    type: 'mongodb',
    retention: 3600000  // 1 hour default
  }
});

// Manual cleanup
db.cache.deleteMany({ 
  expireAt: { $lt: new Date() } 
});

// Compact collection
db.runCommand({ compact: 'cache' });
```

### TTL Not Working

**Problem:** Expired documents not being deleted

**Cause:** TTL monitor runs every 60 seconds

**Solutions:**

```javascript
// Check TTL index exists
db.cache.getIndexes();

// Recreate TTL index
db.cache.dropIndex('expireAt_1');
db.cache.createIndex(
  { expireAt: 1 },
  { expireAfterSeconds: 0 }
);

// Manual cleanup if needed
db.cache.deleteMany({ 
  expireAt: { $lt: new Date() } 
});
```

---

## Performance Tips

### 1. Use Projections

```javascript
// Fetch only needed fields
// (Triva does this automatically)
db.cache.find(
  { _id: 'user:123' },
  { value: 1, _id: 0 }
);
```

### 2. Connection Pooling

```javascript
// Configure pool size
await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://localhost:27017/myapp',
      options: {
        maxPoolSize: 20,
        minPoolSize: 5
      }
    }
  }
});
```

### 3. Read Preference

```javascript
// For read-heavy workloads
await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://localhost:27017/myapp',
      options: {
        readPreference: 'secondaryPreferred'
      }
    }
  }
});
```

### 4. Write Concern

```javascript
// Balance between speed and durability
await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://localhost:27017/myapp',
      options: {
        w: 1,  // Acknowledge from primary only (faster)
        // w: 'majority'  // Acknowledge from majority (safer)
      }
    }
  }
});
```

---

## Migration

### From Memory to MongoDB

```javascript
// Before (Memory)
await build({
  cache: { type: 'memory' }
});

// After (MongoDB)
await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://localhost:27017/myapp'
    }
  }
});

// No code changes needed - same API!
```

### Data Migration Script

```javascript
// Migrate from one MongoDB to another
import { MongoClient } from 'mongodb';

const source = new MongoClient('mongodb://source:27017');
const target = new MongoClient('mongodb://target:27017');

await source.connect();
await target.connect();

const sourceColl = source.db('myapp').collection('cache');
const targetColl = target.db('myapp').collection('cache');

const docs = await sourceColl.find({}).toArray();
await targetColl.insertMany(docs);

console.log(`Migrated ${docs.length} documents`);
```

---

## Use Cases

### Session Storage

```javascript
import crypto from 'crypto';

async function createSession(userId, data) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  
  await cache.set(`session:${sessionId}`, {
    userId,
    data,
    createdAt: new Date()
  }, 86400000);  // 24 hours
  
  return sessionId;
}

async function getSession(sessionId) {
  return await cache.get(`session:${sessionId}`);
}
```

### User Profile Cache

```javascript
async function getUserProfile(userId) {
  const cacheKey = `profile:${userId}`;
  
  // Try cache first
  let profile = await cache.get(cacheKey);
  
  if (profile) {
    return profile;
  }
  
  // Cache miss - fetch from database
  profile = await db.users.findOne({ _id: userId });
  
  // Store in cache for 10 minutes
  await cache.set(cacheKey, profile, 600000);
  
  return profile;
}
```

### API Response Cache

```javascript
async function getCachedAPIResponse(endpoint) {
  const cacheKey = `api:${endpoint}`;
  
  // Check cache
  let response = await cache.get(cacheKey);
  
  if (response) {
    return { ...response, cached: true };
  }
  
  // Fetch fresh data
  response = await fetch(`https://api.example.com${endpoint}`);
  const data = await response.json();
  
  // Cache for 5 minutes
  await cache.set(cacheKey, data, 300000);
  
  return { ...data, cached: false };
}
```

---

## Comparison with Other Adapters

| Feature | MongoDB | Redis | Memory |
|---------|---------|-------|--------|
| **Persistence** | ✅ Disk | ⚠️ Optional | ❌ RAM only |
| **Speed** | ⚡⚡⚡ | ⚡⚡⚡⚡ | ⚡⚡⚡⚡⚡ |
| **Distributed** | ✅ Yes | ✅ Yes | ❌ No |
| **Complex queries** | ✅ Yes | ⚠️ Limited | ❌ No |
| **TTL** | ✅ Auto | ✅ Auto | ✅ Manual |
| **Schema** | ✅ Flexible | ❌ Key-value | ❌ Key-value |
| **Scaling** | ✅ Sharding | ✅ Cluster | ❌ Single server |

---

## Next Steps

- **[Redis Adapter](redis.md)** - For faster caching
- **[PostgreSQL Adapter](postgresql.md)** - For relational data
- **[Configuration Guide](../configuration.md)** - Advanced config
- **[Performance Guide](../performance.md)** - Optimization

---

**Questions?** [GitHub Issues](https://github.com/trivajs/triva/issues)
