# Production Ready

```javascript
import { build, cache, cookieParser } from 'triva';

const app = new build({
  env: 'production',
  cache: {
    type: 'redis',
    retention: 300000,
    database: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || '6379')
    }
  },
  throttle: {
    limit: 1000,
    window_ms: 60000,
    burst_limit: 100
  },
  retention: {
    enabled: true,
    maxEntries: 100000
  },
  errorTracking: {
    enabled: true,
    maxEntries: 50000
  }
});

app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.get('/api/public/data', async (req, res) => {
  const cached = await cache.get('public:data');
  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }

  const data = { generatedAt: new Date().toISOString() };
  await cache.set('public:data', data, 300000);
  res.json({ source: 'generated', data });
});
```
