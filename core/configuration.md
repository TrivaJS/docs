# Configuration

Configure Triva via the `build()` function options.

## Basic Configuration

```javascript
import { build, listen } from 'triva';

await build({
  env: 'development',
  logging: {
    enabled: true,
    level: 'info'
  },
  cache: {
    type: 'memory'
  }
});

listen(3000);
```

## Environment

```javascript
await build({
  env: 'development'  // 'development' or 'production'
});
```

## Logging Options

```javascript
await build({
  logging: {
    enabled: true,
    level: 'info'  // 'debug', 'info', 'warn', 'error'
  }
});
```

## Throttling Options

```javascript
await build({
  throttle: {
    enabled: true,
    max: 100,           // Max requests
    window: 60000       // Time window (ms)
  }
});
```

## Cache Options

```javascript
await build({
  cache: {
    type: 'memory',      // 'memory' or 'redis'
    retention: 3600,     // Default TTL (seconds)
    url: 'redis://localhost:6379'  // For Redis
  }
});
```

## Database Options

```javascript
await build({
  database: {
    adapter: 'mongodb',
    url: 'mongodb://localhost:27017/mydb',
    poolSize: 10
  }
});
```

[Database Adapters](https://docs.trivajs.com/database/adapters)

## HTTPS Options

```javascript
import { build, listen } from 'triva';
import { readFileSync } from 'fs';

await build({
  https: {
    enabled: true,
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem')
  },
  autoRedirect: true  // HTTP → HTTPS
});

listen(443);
```

[HTTPS Guide](https://docs.trivajs.com/deployment/https)

## Environment Variables

```javascript
import { build, listen } from 'triva';

await build({
  env: process.env.NODE_ENV || 'development',
  logging: {
    enabled: process.env.NODE_ENV === 'production',
    level: process.env.LOG_LEVEL || 'info'
  },
  database: {
    adapter: process.env.DB_ADAPTER,
    url: process.env.DATABASE_URL
  }
});

listen(process.env.PORT || 3000);
```

## Full Example

```javascript
import { build, listen } from 'triva';
import { readFileSync } from 'fs';

await build({
  // Environment
  env: 'production',
  
  // Logging
  logging: {
    enabled: true,
    level: 'info'
  },
  
  // Rate limiting
  throttle: {
    enabled: true,
    max: 100,
    window: 60000
  },
  
  // Cache
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379',
    retention: 3600
  },
  
  // Database
  database: {
    adapter: 'mongodb',
    url: 'mongodb://localhost:27017/myapp'
  },
  
  // HTTPS
  https: {
    enabled: true,
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem')
  },
  autoRedirect: true,
  
  // Error tracking
  errorTracking: true
});

listen(443);
```

## Defaults

Default configuration:

```javascript
{
  env: 'development',
  logging: { enabled: false },
  throttle: { enabled: false },
  cache: { type: 'memory', retention: 3600 },
  https: { enabled: false },
  autoRedirect: false,
  errorTracking: false
}
```

## Next Steps

- [Database Configuration](https://docs.trivajs.com/database/overview)
- [Deployment Guide](https://docs.trivajs.com/deployment/production)
- [HTTPS Setup](https://docs.trivajs.com/deployment/https)
