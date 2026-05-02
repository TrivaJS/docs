# Quick Start Examples

Use these patterns as the fastest way to see how Triva is meant to be used.

## JSON API

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.get('/status', (req, res) => {
  res.json({ ok: true });
});

app.post('/echo', async (req, res) => {
  const body = await req.json();
  res.status(201).json({ received: body });
});

app.listen(3000);
```

## Route Builder

```javascript
app.route('/api/items')
  .get((req, res) => res.json({ items: [] }))
  .post(async (req, res) => {
    const body = await req.json();
    res.status(201).json({ created: body });
  });
```

## Cache-Backed Endpoint

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: { type: 'memory', retention: 300000 }
});

app.get('/stats', async (req, res) => {
  const cached = await cache.get('stats:latest');
  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }

  const stats = { requests: 42, generatedAt: new Date().toISOString() };
  await cache.set('stats:latest', stats, 300000);
  res.json({ source: 'generated', data: stats });
});
```

## HTTPS

```javascript
const app = new build({
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem')
  }
});
```

## Read Next

- [REST API Example](/examples/rest-api)
- [Caching Example](/examples/caching)
- [Production Ready Example](/examples/production-ready)
