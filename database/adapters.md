# Database Adapters

Triva's cache layer supports several adapters. The shape is always the same at the top level:

```javascript
cache: {
  type: 'adapter-name',
  retention: 300000,
  database: {
    // adapter-specific connection settings
  }
}
```

## Built-In Adapters

### Memory

- install: none
- best for: development and tests

```javascript
cache: {
  type: 'memory',
  retention: 300000
}
```

### Embedded

- install: none
- best for: file-backed local storage

```javascript
cache: {
  type: 'embedded',
  database: {
    filename: './triva.db',
    encryptionKey: process.env.TRIVA_CACHE_KEY
  }
}
```

## Optional Adapters

### SQLite

```bash
npm install sqlite3
```

```javascript
cache: {
  type: 'sqlite',
  database: {
    filename: './triva.sqlite'
  }
}
```

### Better-SQLite3

```bash
npm install better-sqlite3
```

```javascript
cache: {
  type: 'better-sqlite3',
  database: {
    filename: './triva.db'
  }
}
```

### Redis

```bash
npm install redis
```

```javascript
cache: {
  type: 'redis',
  database: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
}
```

### MongoDB

```bash
npm install mongodb
```

```javascript
cache: {
  type: 'mongodb',
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: 'triva_cache',
    collection: 'cache_entries'
  }
}
```

### PostgreSQL

```bash
npm install pg
```

```javascript
cache: {
  type: 'postgresql',
  database: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: 'triva',
    tableName: 'triva_cache'
  }
}
```

### MySQL

```bash
npm install mysql2
```

```javascript
cache: {
  type: 'mysql',
  database: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'triva',
    tableName: 'triva_cache'
  }
}
```

### Supabase

```bash
npm install @supabase/supabase-js
```

```javascript
cache: {
  type: 'supabase',
  database: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    tableName: 'triva_cache'
  }
}
```

## Related Docs

- [Database Quick Start](https://docs.trivajs.com/database/quick-start)
- [Memory Adapter](https://docs.trivajs.com/database/memory)
- [Redis Adapter](https://docs.trivajs.com/database/redis)
- [MongoDB Adapter](https://docs.trivajs.com/database/mongodb)
