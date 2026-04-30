# Memory Adapter

The memory adapter is built in and is the easiest place to start.

## Configuration

```javascript
import { build } from 'triva';

const app = new build({
  cache: {
    type: 'memory',
    retention: 300000
  }
});
```

## What It Is Good For

- local development
- tests
- single-process temporary storage

## Limitations

- data is lost when the process restarts
- data is not shared across multiple app instances
- memory usage stays inside the Node.js process

## Example

```javascript
import { build, cache } from 'triva';

const app = new build({ cache: { type: 'memory' } });

app.post('/api/temp', async (req, res) => {
  const body = await req.json();
  await cache.set(`temp:${body.id}`, body, 60000);
  res.status(201).json(body);
});

app.get('/api/temp/:id', async (req, res) => {
  const value = await cache.get(`temp:${req.params.id}`);
  res.json({ value });
});
```

## Related Docs

- [Redis Adapter](https://docs.trivajs.com/database/redis)
- [Database Overview](https://docs.trivajs.com/database/overview)
