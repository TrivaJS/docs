# Configuration

Configure Triva by passing options into `new build(options)`.

## Baseline Example

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
    ban_threshold: 10,
    ban_ms: 3600000
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

app.listen(process.env.PORT || 3000);
```

## `env`

```javascript
const app = new build({
  env: 'development'
});
```

Accepted values in the current docs are `development` and `production`.

## `protocol` and `ssl`

Use these when Triva itself should create an HTTPS server.

```javascript
import { readFileSync } from 'fs';

const app = new build({
  protocol: 'https',
  ssl: {
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem')
  }
});
```

## `cache`

The cache block configures the adapter behind the exported `cache` singleton.

```javascript
const app = new build({
  cache: {
    type: 'mongodb',
    retention: 600000,
    limit: 100000,
    database: {
      uri: process.env.MONGODB_URI,
      database: 'triva_cache',
      collection: 'entries'
    }
  }
});
```

Important fields:

- `type`: adapter name such as `memory`, `redis`, `mongodb`, `postgresql`, `mysql`, `sqlite`, `better-sqlite3`, `embedded`, or `supabase`
- `retention`: default TTL in milliseconds
- `limit`: max cache size for memory-backed usage
- `cache_data`: set to `false` to disable caching behavior
- `database`: adapter-specific connection settings

## `throttle`

Throttle settings are consumed by the built-in throttle middleware. Because throttle counters are stored through the cache layer, configure `cache` alongside `throttle`.

```javascript
const app = new build({
  cache: { type: 'memory' },
  throttle: {
    limit: 100,
    window_ms: 60000,
    burst_limit: 20,
    burst_window_ms: 1000,
    ban_threshold: 5,
    ban_ms: 86400000,
    violation_decay_ms: 3600000,
    ua_rotation_threshold: 5,
    namespace: 'throttle'
  }
});
```

## `retention`

Retention config controls how many middleware-related records Triva keeps in memory.

```javascript
const app = new build({
  retention: {
    enabled: true,
    maxEntries: 100000
  }
});
```

## `errorTracking`

```javascript
const app = new build({
  errorTracking: {
    enabled: true,
    maxEntries: 10000,
    captureStackTrace: true,
    captureContext: true,
    captureSystemInfo: true
  }
});
```

You can also enable it with `errorTracking: true`.

## `middleware`

`middleware` is an alternative place to provide throttle and retention config.

```javascript
const app = new build({
  cache: { type: 'memory' },
  middleware: {
    throttle: {
      limit: 200,
      window_ms: 60000
    },
    retention: {
      enabled: true,
      maxEntries: 50000
    }
  }
});
```

## Adapter Examples

Redis:

```javascript
cache: {
  type: 'redis',
  database: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
}
```

MongoDB:

```javascript
cache: {
  type: 'mongodb',
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: 'triva_cache',
    collection: 'cache_entries'
  }
}
```

SQLite:

```javascript
cache: {
  type: 'sqlite',
  database: {
    filename: './triva.sqlite'
  }
}
```

## Not Part Of The Current Constructor API

These shapes appear in older docs and examples, but they are not the constructor surface to document now:

- `logging: { ... }`
- `https: { enabled: true, ... }`
- `autoRedirect: true`
- top-level `database: { ... }`

Use `protocol`, `ssl`, and `cache.database` instead.

## Related Docs

- [Core API](https://docs.trivajs.com/core/api)
- [Database Adapters](https://docs.trivajs.com/database/adapters)
- [HTTPS Deployment](https://docs.trivajs.com/deployment/https)
