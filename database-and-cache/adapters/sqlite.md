# SQLite Adapter

Serverless SQL database for single-server applications.

## Overview

SQLite is a self-contained, serverless SQL database engine.

### When to Use

✅ **Single-server apps** - No database server needed  
✅ **Development** - Easy setup  
✅ **Edge computing** - Embedded database  
✅ **Prototypes** - Quick start  

❌ **High concurrency** - Limited write concurrency  
❌ **Distributed** - Single file, not distributed  

---

## Installation

```bash
npm install sqlite3
```

## Quick Start

```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'sqlite',
    database: {
      filepath: './cache.db',
      tableName: 'cache'
    }
  }
});

await cache.set('user:123', { name: 'John' });
```

---

## Configuration

```javascript
await build({
  cache: {
    type: 'sqlite',
    database: {
      filepath: './data/cache.db',  // File location
      tableName: 'cache'
    }
  }
});
```

### In-Memory Database

```javascript
await build({
  cache: {
    type: 'sqlite',
    database: {
      filepath: ':memory:',  // RAM-only
      tableName: 'cache'
    }
  }
});
```

---

## Features

### Automatic Table Creation

```sql
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expire_at INTEGER
);

CREATE INDEX idx_expire_at ON cache(expire_at);
```

### File-Based Storage

- Single file database
- Easy backup (copy file)
- Portable across systems

---

## Best Practices

### 1. Regular Backups

```bash
# Copy database file
cp cache.db cache.db.backup

# Or use SQLite backup command
sqlite3 cache.db ".backup cache.db.backup"
```

### 2. Vacuum Periodically

```sql
VACUUM;
```

### 3. Use WAL Mode

```sql
PRAGMA journal_mode=WAL;
```

---

**Next:** [Better-SQLite3](better-sqlite3.md) | [Embedded](embedded.md)
