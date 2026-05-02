# Production

## Common Production Shape

```javascript
const app = new build({
  env: 'production',
  cache: {
    type: 'redis',
    retention: 300000,
    database: {
      host: process.env.REDIS_HOST,
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
```

## Production Checklist

- use an external adapter when cache durability matters
- set explicit throttle policy
- enable retention only for the amount of in-memory logging you want to keep
- enable error tracking if you need runtime error inspection
- terminate with HTTPS directly in Triva or behind infrastructure that handles TLS

## Related Docs

- [HTTPS](/deployment/https)
- [Throttling](/middleware/throttling)
- [Error Tracking](/middleware/error-tracking)
