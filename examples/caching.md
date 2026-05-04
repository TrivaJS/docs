# Caching

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'memory',
    retention: 300000
  }
});

app.get('/api/stats', async (req, res) => {
  const cached = await cache.get('stats:latest');
  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }

  const stats = {
    users: 42,
    generatedAt: new Date().toISOString()
  };

  await cache.set('stats:latest', stats, 300000);
  res.json({ source: 'generated', data: stats });
});
```
