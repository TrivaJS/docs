# Production-Ready Example

This example stays inside the constructor surface that the current Triva runtime actually uses.

## Example

```javascript
import { build } from 'triva';
import { readFileSync } from 'fs';

const app = new build({
  env: 'production',
  protocol: 'https',
  ssl: {
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem')
  },
  cache: {
    type: 'redis',
    retention: 300000,
    database: {
      url: process.env.REDIS_URL
    }
  },
  throttle: {
    limit: 1000,
    window_ms: 60000,
    burst_limit: 100,
    ban_threshold: 10
  },
  retention: {
    enabled: true,
    maxEntries: 100000
  },
  errorTracking: {
    enabled: true,
    maxEntries: 10000
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(443);
```

## Why These Pieces Matter

- HTTPS protects traffic in transit when Triva terminates TLS directly
- shared cache adapters support multi-instance deployments
- throttling protects public endpoints and depends on the cache layer
- retention and error tracking help with runtime visibility

## Related Docs

- [Production Deployment](https://docs.trivajs.com/deployment/production)
- [HTTPS Deployment](https://docs.trivajs.com/deployment/https)
- [Database Adapters](https://docs.trivajs.com/database/adapters)
