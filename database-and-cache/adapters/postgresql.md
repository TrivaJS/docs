# PostgreSQL Adapter

Enterprise-grade relational database for persistent caching with ACID guarantees.

## Overview

PostgreSQL is a powerful, open-source relational database system with strong ACID compliance, advanced querying, and JSON support.

### When to Use

✅ **Enterprise applications** - ACID compliance required  
✅ **Complex data** - Relational data with joins  
✅ **JSON support** - JSONB for flexible schema  
✅ **Transactions** - Multi-operation consistency  
✅ **Production** - Mature, battle-tested  

---

## Installation

```bash
npm install pg
```

## Quick Start

```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'postgresql',
    database: {
      host: 'localhost',
      port: 5432,
      database: 'myapp',
      user: 'postgres',
      password: process.env.PG_PASSWORD,
      tableName: 'cache'  // Optional
    }
  }
});

await cache.set('user:123', { name: 'John' });
```

---

## Configuration

### Local PostgreSQL

```javascript
await build({
  cache: {
    type: 'postgresql',
    database: {
      host: 'localhost',
      port: 5432,
      database: 'myapp',
      user: 'postgres',
      password: 'password',
      tableName: 'cache'
    }
  }
});
```

### Cloud PostgreSQL (AWS RDS, Google Cloud SQL)

```javascript
await build({
  cache: {
    type: 'postgresql',
    database: {
      host: process.env.PG_HOST,
      port: 5432,
      database: process.env.PG_DATABASE,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
});
```

### Connection Pooling

```javascript
await build({
  cache: {
    type: 'postgresql',
    database: {
      host: 'localhost',
      port: 5432,
      database: 'myapp',
      user: 'postgres',
      password: 'password',
      max: 20,        // Pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    }
  }
});
```

---

## Features

### Automatic Table Creation

Triva creates the cache table automatically:

```sql
CREATE TABLE IF NOT EXISTS cache (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  expire_at TIMESTAMP
);

CREATE INDEX idx_cache_expire_at ON cache(expire_at);
```

### JSONB Support

Data stored as JSONB for performance:

```javascript
await cache.set('user:123', {
  name: 'John',
  tags: ['javascript', 'node'],
  meta: { created: new Date() }
});

// PostgreSQL: { value: '{"name":"John",...}' }
```

### TTL Cleanup

Background cleanup of expired keys:

```sql
-- Runs periodically
DELETE FROM cache WHERE expire_at < NOW();
```

---

## Best Practices

### 1. Use Connection Pooling

```javascript
// Configured automatically by Triva
// Reuses connections efficiently
```

### 2. Create Indexes

```sql
-- Already created by Triva
CREATE INDEX idx_cache_expire_at ON cache(expire_at);

-- Additional indexes for patterns
CREATE INDEX idx_cache_key_pattern ON cache(key text_pattern_ops);
```

### 3. Regular Maintenance

```sql
-- Vacuum to reclaim space
VACUUM ANALYZE cache;

-- Reindex for performance
REINDEX TABLE cache;
```

### 4. Monitor Table Size

```sql
SELECT 
  pg_size_pretty(pg_total_relation_size('cache')) as total_size,
  pg_size_pretty(pg_relation_size('cache')) as table_size,
  pg_size_pretty(pg_indexes_size('cache')) as indexes_size;
```

---

## Production Setup

### PostgreSQL Configuration

**postgresql.conf:**
```ini
# Connection
max_connections = 100
shared_buffers = 256MB

# Performance
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 64MB

# Write-ahead log
wal_level = replica
max_wal_size = 1GB
```

### Create Database & User

```sql
CREATE DATABASE myapp;
CREATE USER trivauser WITH PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE myapp TO trivauser;
```

---

## Monitoring

### Query Performance

```sql
-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%cache%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table stats
SELECT * FROM pg_stat_user_tables WHERE relname = 'cache';

-- Index usage
SELECT * FROM pg_stat_user_indexes WHERE relname = 'cache';
```

---

## Troubleshooting

### Connection Issues

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Check connections
psql -h localhost -U postgres -d myapp

# Check logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

### Performance Issues

```sql
-- Analyze table
ANALYZE cache;

-- Check bloat
SELECT 
  schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename = 'cache';

-- Vacuum if needed
VACUUM FULL cache;
```

---

**Next:** [MySQL](mysql.md) | [Supabase](supabase.md) | [Performance Guide](../performance.md)
