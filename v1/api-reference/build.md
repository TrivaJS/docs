# build()

Configure and initialize the Triva server.

## Signature

```javascript
async build(config: BuildConfig): Promise<void>
```

## Parameters

### config (object)

Configuration object with the following options:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `env` | string | No | Environment: 'development', 'production', 'test' |
| `protocol` | string | No | Protocol: 'http' or 'https' (default: 'http') |
| `ssl` | object | No | SSL configuration for HTTPS |
| `cache` | object | No | Cache adapter configuration |
| `throttle` | object | No | Rate limiting configuration |
| `redirects` | object | No | Auto-redirect configuration |
| `retention` | object | No | Logging configuration |
| `errorTracking` | object | No | Error tracking configuration |

## Returns

`Promise<void>` - Resolves when server is configured

## Examples

### Basic HTTP Server

```javascript
import { build } from 'triva';

await build({
  env: 'development',
  cache: {
    type: 'memory'
  }
});
```

### HTTPS Server

```javascript
import { build } from 'triva';
import fs from 'fs';

await build({
  env: 'production',
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./ssl/private.key'),
    cert: fs.readFileSync('./ssl/certificate.crt'),
    ca: fs.readFileSync('./ssl/ca.crt')  // Optional
  },
  cache: {
    type: 'redis',
    database: {
      host: 'localhost',
      port: 6379
    }
  }
});
```

### Production Configuration

```javascript
await build({
  env: 'production',
  protocol: 'https',
  ssl: {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  },
  cache: {
    type: 'redis',
    database: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD
    }
  },
  throttle: {
    limit: 1000,
    window_ms: 60000,
    burst_limit: 50,
    ban_threshold: 10,
    ban_ms: 3600000
  },
  redirects: {
    enabled: true,
    redirectAI: true,
    redirectBots: false,
    destination: '/api-docs'
  },
  retention: {
    enabled: true,
    maxEntries: 50000
  },
  errorTracking: {
    enabled: true
  }
});
```

## Configuration Options

### Environment (env)

Controls environment-specific behavior.

**Type:** `'development' | 'production' | 'test'`

**Default:** `'development'`

**Example:**
```javascript
await build({
  env: process.env.NODE_ENV || 'development'
});
```

### Protocol

HTTP or HTTPS server.

**Type:** `'http' | 'https'`

**Default:** `'http'`

**Example:**
```javascript
await build({
  protocol: 'https'
});
```

### SSL Configuration

SSL/TLS certificates for HTTPS.

**Type:** `object`

**Properties:**
- `key` (Buffer | string) - Private key
- `cert` (Buffer | string) - Certificate
- `ca` (Buffer | string) - Certificate authority (optional)

**Example:**
```javascript
await build({
  protocol: 'https',
  ssl: {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
  }
});
```

### Cache Configuration

Database adapter for caching.

**Type:** `object`

**Properties:**
- `type` (string) - Adapter type: 'memory', 'redis', 'mongodb', etc.
- `retention` (number) - Default TTL in milliseconds
- `database` (object) - Database-specific configuration

**Example:**
```javascript
await build({
  cache: {
    type: 'mongodb',
    retention: 600000,  // 10 minutes
    database: {
      uri: 'mongodb://localhost:27017/myapp',
      collection: 'cache'
    }
  }
});
```

**See:** [Cache Configuration Guide](../database-and-cache/configuration.md)

### Throttle Configuration

Rate limiting and DDoS protection.

**Type:** `object`

**Properties:**
- `limit` (number) - Max requests per window
- `window_ms` (number) - Time window in milliseconds
- `burst_limit` (number) - Max burst requests
- `ban_threshold` (number) - Violations before ban
- `ban_ms` (number) - Ban duration in milliseconds

**Example:**
```javascript
await build({
  throttle: {
    limit: 100,           // 100 requests
    window_ms: 60000,     // Per minute
    burst_limit: 20,      // Max 20 in quick succession
    ban_threshold: 5,     // Ban after 5 violations
    ban_ms: 86400000     // 24 hour ban
  }
});
```

**See:** [Throttling Guide](../middleware/throttling.md)

### Redirects Configuration

Auto-redirect for AI, bots, and crawlers.

**Type:** `object`

**Properties:**
- `enabled` (boolean) - Enable auto-redirect
- `redirectAI` (boolean) - Redirect AI traffic
- `redirectBots` (boolean) - Redirect search bots
- `redirectCrawlers` (boolean) - Redirect crawlers
- `destination` (string | function) - Where to redirect
- `statusCode` (number) - HTTP status code (301, 302, etc.)
- `whitelist` (string[]) - Never redirect these User-Agents

**Example:**
```javascript
await build({
  redirects: {
    enabled: true,
    redirectAI: true,
    redirectBots: false,
    destination: '/api-docs',
    statusCode: 302,
    whitelist: ['Googlebot', 'Bingbot']
  }
});
```

**See:** [Auto-Redirect Guide](../middleware/auto-redirect.md)

### Retention Configuration

Request/response logging.

**Type:** `object`

**Properties:**
- `enabled` (boolean) - Enable logging
- `maxEntries` (number) - Maximum log entries to keep

**Example:**
```javascript
await build({
  retention: {
    enabled: true,
    maxEntries: 100000
  }
});
```

**See:** [Logging Guide](../middleware/logging.md)

### Error Tracking Configuration

Centralized error capture.

**Type:** `object`

**Properties:**
- `enabled` (boolean) - Enable error tracking

**Example:**
```javascript
await build({
  errorTracking: {
    enabled: true
  }
});
```

**See:** [Error Tracking Guide](../middleware/error-tracking.md)

## Error Handling

```javascript
try {
  await build({
    cache: {
      type: 'redis',
      database: {
        host: 'invalid-host'
      }
    }
  });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
```

## Notes

- Must be called before defining routes
- Can only be called once per application
- Asynchronous - always use `await`
- Global configuration affects all routes

## Complete Example

```javascript
import { build, get, post, listen } from 'triva';
import fs from 'fs';

// Configure server
await build({
  env: process.env.NODE_ENV,
  protocol: 'https',
  ssl: {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  },
  cache: {
    type: 'redis',
    database: {
      host: process.env.REDIS_HOST,
      port: 6379,
      password: process.env.REDIS_PASSWORD
    }
  },
  throttle: {
    limit: 1000,
    window_ms: 60000
  },
  redirects: {
    enabled: true,
    redirectAI: true
  }
});

// Define routes
get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

post('/api/data', async (req, res) => {
  const data = await req.json();
  res.status(201).json(data);
});

// Start server
listen(3000);
```

## See Also

- [listen()](listen.md) - Start the server
- [Configuration Guide](../guides/configuration.md) - Detailed configuration
- [Deployment Guide](../guides/deployment.md) - Production setup
- [Database Adapters](../database-and-cache/adapters/) - Cache options
