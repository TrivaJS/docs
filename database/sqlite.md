# SQLite Adapter

Use SQLite as the cache backend for embedded applications.

## Installation

```bash
npm install sqlite3
```

## Configuration

```javascript
import { build, listen } from 'triva';

await build({
  cache: {
    type: 'sqlite',
    filename: './cache.db'
  }
});

listen(3000);
```

## Options

```javascript
cache: {
  type: 'sqlite',
  filename: './cache.db'  // Path to database file
}
```

## Usage

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: {
    type: 'sqlite',
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

- Single-file database
- Zero configuration
- Cross-platform
- Persistent storage
- SQL queries available
- Serverless

## Use Cases

- Desktop applications
- Mobile apps
- Embedded systems
- Small web apps
- Development/testing

## Best Practices

1. **Relative paths** - Use relative paths for portability
2. **Backup** - Backup the .db file regularly
3. **One writer** - SQLite doesn't handle concurrent writes well
4. **Use Better-SQLite3** - For better performance, use better-sqlite3 adapter

```javascript
cache: {
  type: 'better-sqlite3',  // Faster
  filename: './cache.db'
}
```

## Production Example

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  env: 'production',
  cache: {
    type: 'sqlite',
    filename: './data/cache.db'
  }
});

post('/api/settings', async (req, res) => {
  await cache.set('settings', req.body);
  res.json({ success: true });
});

get('/api/settings', async (req, res) => {
  const settings = await cache.get('settings');
  res.json({ settings });
});

listen(3000);
```

## Next Steps

- [Better-SQLite3 Adapter](https://docs.trivajs.com/database/better-sqlite3)
- [Embedded Adapter](https://docs.trivajs.com/database/embedded)
- [Quick Start](https://docs.trivajs.com/database/quick-start)
