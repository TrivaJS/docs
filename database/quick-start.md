# Database Quick Start

## Start with Memory

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'memory',
    retention: 600000
  }
});

app.post('/settings', async (req, res) => {
  const body = await req.json();
  await cache.set('settings:current', body, 600000);
  res.status(201).json({ saved: true, data: body });
});

app.get('/settings', async (req, res) => {
  const settings = await cache.get('settings:current');
  res.json({ settings });
});
```

## Move to an External Adapter

```javascript
const app = new build({
  cache: {
    type: 'redis',
    retention: 600000,
    database: {
      host: 'localhost',
      port: 6379
    }
  }
});
```

The runtime cache calls stay the same when you switch adapters.
