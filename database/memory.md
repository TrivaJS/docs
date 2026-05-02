# Memory Adapter

In-memory cache storage (default adapter).

## Installation

No installation needed (built-in).

## Configuration

```javascript
import { build, listen } from 'triva';

await build({
  cache: {
    type: 'memory',
    retention: 600  // TTL in seconds
  }
});

listen(3000);
```

## Options

```javascript
cache: {
  type: 'memory',
  retention: 600  // Default TTL (seconds)
}
```

## Usage

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: { type: 'memory' }
});

get('/set', async (req, res) => {
  await cache.set('key', 'value', 60);
  res.json({ success: true });
});

get('/get', async (req, res) => {
  const value = await cache.get('key');
  res.json({ value });
});

listen(3000);
```

## Features

- Fastest performance
- Zero dependencies
- Simple setup
- Automatic cleanup (TTL)
- Thread-safe

## How It Works

Data is stored in JavaScript objects in RAM:

```javascript
{
  "key": {
    value: "value",
    expires: Date.now() + ttl
  }
}
```

## Use Cases

- Development
- Testing
- Temporary data
- Fast access needed
- Simple applications

## Limitations

1. **No persistence** - Data lost on restart
2. **Memory limited** - Limited by RAM
3. **Single process** - Not shared across processes
4. **No distribution** - Can't scale horizontally

## Best Practices

1. **Development** - Perfect for dev/test
2. **Set TTL** - Prevent memory leaks
3. **Monitor memory** - Watch memory usage
4. **Production** - Use Redis for production

```javascript
await build({
  cache: {
    type: process.env.NODE_ENV === 'production' ? 'redis' : 'memory'
  }
});
```

## Production Example

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  env: 'development',
  cache: { type: 'memory', retention: 600 }
});

post('/api/temp', async (req, res) => {
  await cache.set(`temp:${req.body.id}`, req.body, 60);
  res.json({ success: true });
});

get('/api/temp/:id', async (req, res) => {
  const data = await cache.get(`temp:${req.params.id}`);
  res.json({ data });
});

listen(3000);
```

## When to Use

### Use Memory When:
- Developing locally
- Running tests
- Temporary data only
- Single server deployment

### Use Redis Instead When:
- Production environment
- Data must persist
- Multiple servers
- Large datasets

## Next Steps

- [Redis Adapter](https://docs.trivajs.com/database/redis)
- [Embedded Adapter](https://docs.trivajs.com/database/embedded)
- [Quick Start](https://docs.trivajs.com/database/quick-start)
