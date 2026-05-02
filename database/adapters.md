# Database Adapters

Triva supports 9 database adapters for the cache layer.

## Available Adapters

### In-Memory Storage

1. **Memory** - Fast in-memory cache (default)
   - No external dependencies
   - Data lost on restart
   - Best for: Development, testing

### File-Based Storage

2. **Embedded** - JSON file storage
   - Stores data in JSON file
   - Persists across restarts
   - Best for: Small apps, prototyping

3. **SQLite** - SQLite database
   - Requires `sqlite3` package
   - Single-file database
   - Best for: Embedded apps, desktop apps

4. **Better-SQLite3** - Faster SQLite
   - Requires `better-sqlite3` package
   - Synchronous, faster than SQLite
   - Best for: Performance-critical embedded apps

### Production Databases

5. **Redis** - Redis cache server
   - Requires `redis` package
   - Industry-standard caching
   - Best for: Production caching, sessions

6. **MongoDB** - MongoDB database
   - Requires `mongodb` package
   - Document storage
   - Best for: Document-based apps

7. **PostgreSQL** - PostgreSQL database
   - Requires `pg` package
   - Relational database
   - Best for: Complex queries, relations

8. **MySQL** - MySQL database
   - Requires `mysql2` package
   - Relational database
   - Best for: Traditional web apps

9. **Supabase** - Supabase (PostgreSQL)
   - Requires `@supabase/supabase-js` package
   - PostgreSQL with extras
   - Best for: Supabase projects

## Comparison

| Adapter | Persistence | Performance | Dependencies | Best For |
|---------|------------|-------------|--------------|----------|
| Memory | No | Fastest | None | Development |
| Embedded | Yes | Fast | None | Prototypes |
| SQLite | Yes | Fast | `sqlite3` | Embedded |
| Better-SQLite3 | Yes | Faster | `better-sqlite3` | Embedded (fast) |
| Redis | Yes | Very Fast | `redis` | Production |
| MongoDB | Yes | Fast | `mongodb` | Documents |
| PostgreSQL | Yes | Fast | `pg` | Relations |
| MySQL | Yes | Fast | `mysql2` | Traditional |
| Supabase | Yes | Fast | `@supabase/supabase-js` | Supabase |

## Configuration Examples

### Memory

```javascript
await build({
  cache: {
    type: 'memory',
    retention: 600
  }
});
```

[Memory Details](https://docs.trivajs.com/database/memory)

### Embedded

```javascript
await build({
  cache: {
    type: 'embedded',
    filename: './cache.json'
  }
});
```

[Embedded Details](https://docs.trivajs.com/database/embedded)

### SQLite

```javascript
await build({
  cache: {
    type: 'sqlite',
    filename: './cache.db'
  }
});
```

[SQLite Details](https://docs.trivajs.com/database/sqlite)

### Better-SQLite3

```javascript
await build({
  cache: {
    type: 'better-sqlite3',
    filename: './cache.db'
  }
});
```

[Better-SQLite3 Details](https://docs.trivajs.com/database/better-sqlite3)

### Redis

```javascript
await build({
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  }
});
```

[Redis Details](https://docs.trivajs.com/database/redis)

### MongoDB

```javascript
await build({
  cache: {
    type: 'mongodb',
    url: 'mongodb://localhost:27017/myapp'
  }
});
```

[MongoDB Details](https://docs.trivajs.com/database/mongodb)

### PostgreSQL

```javascript
await build({
  cache: {
    type: 'postgresql',
    url: 'postgresql://user:pass@localhost:5432/mydb'
  }
});
```

[PostgreSQL Details](https://docs.trivajs.com/database/postgresql)

### MySQL

```javascript
await build({
  cache: {
    type: 'mysql',
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mydb'
  }
});
```

[MySQL Details](https://docs.trivajs.com/database/mysql)

### Supabase

```javascript
await build({
  cache: {
    type: 'supabase',
    url: 'https://your-project.supabase.co',
    key: 'your-anon-key'
  }
});
```

[Supabase Details](https://docs.trivajs.com/database/supabase)

## Installation

### Memory & Embedded

No installation needed (built-in).

### SQLite

```bash
npm install sqlite3
```

### Better-SQLite3

```bash
npm install better-sqlite3
```

### Redis

```bash
npm install redis
```

### MongoDB

```bash
npm install mongodb
```

### PostgreSQL

```bash
npm install pg
```

### MySQL

```bash
npm install mysql2
```

### Supabase

```bash
npm install @supabase/supabase-js
```

## Switching Adapters

Switching adapters is simple - just change configuration:

```javascript
// Development
await build({
  cache: { type: 'memory' }
});

// Production
await build({
  cache: {
    type: 'redis',
    url: process.env.REDIS_URL
  }
});
```

The cache API remains the same regardless of adapter.

## Choosing an Adapter

### Development

Use **memory** for speed:

```javascript
cache: { type: 'memory' }
```

### Testing

Use **memory** for isolation:

```javascript
cache: { type: 'memory' }
```

### Production

Use **Redis** for caching:

```javascript
cache: {
  type: 'redis',
  url: process.env.REDIS_URL
}
```

### Document Storage

Use **MongoDB**:

```javascript
cache: {
  type: 'mongodb',
  url: process.env.MONGODB_URL
}
```

### Relational Data

Use **PostgreSQL**:

```javascript
cache: {
  type: 'postgresql',
  url: process.env.DATABASE_URL
}
```

### Embedded Apps

Use **SQLite** or **better-sqlite3**:

```javascript
cache: {
  type: 'better-sqlite3',
  filename: './data.db'
}
```

## Next Steps

- [Quick Start](https://docs.trivajs.com/database/quick-start)
- [Redis Adapter](https://docs.trivajs.com/database/redis)
- [MongoDB Adapter](https://docs.trivajs.com/database/mongodb)
- [PostgreSQL Adapter](https://docs.trivajs.com/database/postgresql)
