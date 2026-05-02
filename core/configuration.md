# Configuration

Triva configuration is passed to the `build` constructor.

## Common Shape

```javascript
import fs from 'fs';
import { build } from 'triva';

const app = new build({
  env: 'production',
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost-cert.pem')
  },
  cache: {
    type: 'redis',
    retention: 300000,
    database: {
      host: 'localhost',
      port: 6379
    }
  },
  throttle: {
    limit: 250,
    window_ms: 60000,
    burst_limit: 25,
    ban_threshold: 5
  },
  retention: {
    enabled: true,
    maxEntries: 10000
  },
  errorTracking: {
    enabled: true
  }
});
```

## Top-Level Options

- `env`: `'development' | 'production'`
- `protocol`: `'http' | 'https'`
- `ssl`: key and certificate for HTTPS
- `cache`: cache or adapter configuration
- `throttle`: rate-limiting config
- `retention`: in-memory log retention
- `errorTracking`: boolean or object
- `middleware`: optional combined `throttle` and `retention` config

## Cache Notes

Use `cache` for adapter selection and default TTL behavior.

```javascript
cache: {
  type: 'memory',
  retention: 600000,
  limit: 100000
}
```

Adapter-specific connection details live under `cache.database` for external stores.

## HTTPS Notes

To run HTTPS you must set:

- `protocol: 'https'`
- `ssl.key`
- `ssl.cert`

Triva does not use legacy docs keys like `https.enabled` or `autoRedirect`.

## Related Docs

- [API Reference](/core/api)
- [Throttling](/middleware/throttling)
- [Production](/deployment/production)
