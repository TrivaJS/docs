# Production Deployment

This guide focuses on the constructor options and deployment patterns that the current Triva runtime actually uses.

## Baseline App Configuration

```javascript
import { build } from 'triva';

const app = new build({
  env: 'production',
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
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(process.env.PORT || 3000);
```

## Environment Variables

Common values to externalize:

- `PORT`
- `NODE_ENV`
- `REDIS_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- certificate paths or secret references when using direct HTTPS

## Operational Notes

- use a shared cache backend such as Redis when running multiple instances
- keep throttling enabled on public routes and remember it depends on the cache layer
- add explicit request logging middleware if you need structured logs today
- run Triva behind a process manager, container platform, or supervisor
- validate user input before persisting or caching it

## TLS Strategy

Two normal options are:

1. terminate TLS at a reverse proxy and run Triva on HTTP internally
2. run Triva directly with `protocol: 'https'` and `ssl`

## Rollout Checklist

- run tests
- verify `/health`
- confirm cache connectivity
- confirm throttle behavior on public endpoints
- inspect error tracking output after deployment

## Related Docs

- [HTTPS Deployment](https://docs.trivajs.com/deployment/https)
- [Database Overview](https://docs.trivajs.com/database/overview)
- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking)
