# MySQL Adapter

Popular relational database for persistent caching.

## Overview

MySQL is a widely-used open-source relational database, ideal for traditional SQL applications.

### When to Use

✅ **Shared hosting** - Widely available  
✅ **Legacy systems** - Existing MySQL infrastructure  
✅ **Traditional SQL** - Familiar SQL dialect  
✅ **WordPress/PHP** - Common stack  

---

## Installation

```bash
npm install mysql2
```

## Quick Start

```javascript
import { build, cache } from 'triva';

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

await cache.set('user:123', { name: 'John' });
```

---

## Configuration

### Local MySQL

```javascript
await build({
  cache: {
    type: 'mysql',
    database: {
      host: 'localhost',
      port: 3306,
      database: 'myapp',
      user: 'root',
      password: 'password'
    }
  }
});
```

### Cloud MySQL (AWS RDS, Google Cloud SQL)

```javascript
await build({
  cache: {
    type: 'mysql',
    database: {
      host: process.env.MYSQL_HOST,
      port: 3306,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      ssl: {
        rejectUnauthorized: true
      }
    }
  }
});
```

---

## Features

### Automatic Table Creation

```sql
CREATE TABLE IF NOT EXISTS cache (
  `key` VARCHAR(255) PRIMARY KEY,
  `value` JSON NOT NULL,
  `expire_at` DATETIME NULL,
  INDEX idx_expire_at (expire_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### JSON Support

MySQL 5.7+ supports JSON columns:

```javascript
await cache.set('data', { complex: 'object' });
// Stored as JSON in MySQL
```

---

## Best Practices

### 1. Use InnoDB Engine

```sql
-- Already default in Triva setup
ENGINE=InnoDB
```

### 2. Regular Cleanup

```sql
-- Delete expired entries
DELETE FROM cache WHERE expire_at < NOW();
```

### 3. Optimize Table

```sql
OPTIMIZE TABLE cache;
```

---

## Production Setup

**my.cnf:**
```ini
[mysqld]
max_connections = 100
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
```

---

**Next:** [Supabase](supabase.md) | [SQLite](sqlite.md)
