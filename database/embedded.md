# Embedded Adapter

File-based JSON storage for simple applications.

## Installation

No installation needed (built-in).

## Configuration

```javascript
import { build, listen } from 'triva';

await build({
  cache: {
    type: 'embedded',
    filename: './cache.json'
  }
});

listen(3000);
```

## Options

```javascript
cache: {
  type: 'embedded',
  filename: './cache.json'  // Path to JSON file
}
```

## Usage

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: {
    type: 'embedded',
    filename: './cache.json'
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

- Zero dependencies
- Human-readable (JSON)
- Simple file storage
- Persistent across restarts
- Easy debugging

## How It Works

Data is stored in a JSON file:

```json
{
  "key": {
    "value": "value",
    "expires": 1708123456789
  }
}
```

## Use Cases

- Prototyping
- Small apps
- Configuration storage
- Development
- Learning

## Limitations

1. **Not for production** - No locking, poor performance
2. **Small datasets** - File grows with data
3. **No concurrency** - Multiple processes may conflict
4. **File I/O** - Slower than memory/database

## Best Practices

1. **Development only** - Don't use in production
2. **Small data** - Keep dataset small
3. **Backup** - Backup the JSON file
4. **Relative paths** - Use relative paths

```javascript
cache: {
  type: 'embedded',
  filename: './data/cache.json'
}
```

## Production Example

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  env: 'development',  // Development only
  cache: {
    type: 'embedded',
    filename: './cache.json'
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

- [Memory Adapter](https://docs.trivajs.com/database/memory)
- [SQLite Adapter](https://docs.trivajs.com/database/sqlite)
- [Quick Start](https://docs.trivajs.com/database/quick-start)
