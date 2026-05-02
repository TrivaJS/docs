# Better-SQLite3 Adapter

Faster SQLite adapter with synchronous API.

## Installation

```bash
npm install better-sqlite3
```

## Configuration

```javascript
import { build, listen } from 'triva';

await build({
  cache: {
    type: 'better-sqlite3',
    filename: './cache.db'
  }
});

listen(3000);
```

## Options

```javascript
cache: {
  type: 'better-sqlite3',
  filename: './cache.db'
}
```

## Usage

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: {
    type: 'better-sqlite3',
    filename: './cache.db'
  }
});

get('/set', async (req, res) => {
  await cache.set('key', 'value', 3600);
  res.json({ success: true });
});

get('/get', async (req, res) => {
  const value = await cache.get('key');
  res.json({ value });
});

listen(3000);
```

## Features

- Faster than sqlite3
- Synchronous API (still works with async/await)
- Single-file database
- Zero configuration
- Better performance
- More reliable

## Why Better-SQLite3?

Better-SQLite3 is faster than sqlite3 because:

1. **Synchronous** - No callback overhead
2. **Simpler** - Less abstraction layers
3. **Optimized** - Better query optimization
4. **Safer** - Better error handling

## Performance Comparison

Better-SQLite3 is typically 2-3x faster than sqlite3 for cache operations.

## Use Cases

- Desktop applications
- Electron apps
- CLI tools
- Embedded systems
- High-performance embedded apps

## Best Practices

1. **Prefer over sqlite3** - Use better-sqlite3 instead of sqlite3
2. **Relative paths** - Use relative paths for portability
3. **Backup** - Backup the .db file regularly
4. **Single process** - Best for single-process apps

```javascript
await build({
  cache: {
    type: 'better-sqlite3',
    filename: process.env.DB_PATH || './cache.db'
  }
});
```

## Production Example

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  env: 'production',
  cache: {
    type: 'better-sqlite3',
    filename: './data/cache.db'
  }
});

post('/api/cache', async (req, res) => {
  await cache.set(req.body.key, req.body.value, 3600);
  res.json({ success: true });
});

get('/api/cache/:key', async (req, res) => {
  const value = await cache.get(req.params.key);
  res.json({ value });
});

listen(3000);
```

## Next Steps

- [SQLite Adapter](https://docs.trivajs.com/database/sqlite)
- [Embedded Adapter](https://docs.trivajs.com/database/embedded)
- [Quick Start](https://docs.trivajs.com/database/quick-start)
