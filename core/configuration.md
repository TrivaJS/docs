# Configuration

Configure Triva via the options object.

## Basic Configuration

```javascript
const Triva = require('triva');

const app = new Triva({
  logging: {
    enabled: true,
    level: 'info'
  },
  cache: {
    adapter: 'memory'
  }
});
```

## Logging Options

```javascript
const app = new Triva({
  logging: {
    enabled: true,
    level: 'info'  // 'debug', 'info', 'warn', 'error'
  }
});
```

## Throttling Options

```javascript
const app = new Triva({
  throttle: {
    enabled: true,
    max: 100,           // Max requests
    window: 60000       // Time window (ms)
  }
});
```

## Cache Options

```javascript
const app = new Triva({
  cache: {
    adapter: 'memory',  // 'memory', 'redis'
    ttl: 3600,          // Default TTL (seconds)
    host: 'localhost',  // Redis host
    port: 6379          // Redis port
  }
});
```

## Database Options

```javascript
const app = new Triva({
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
const fs = require('fs');

const app = new Triva({
  https: {
    enabled: true,
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
  },
  autoRedirect: true  // HTTP → HTTPS
});
```

[HTTPS Guide](https://docs.trivajs.com/deployment/https)

## Environment Variables

```javascript
const app = new Triva({
  logging: {
    enabled: process.env.NODE_ENV === 'production',
    level: process.env.LOG_LEVEL || 'info'
  },
  database: {
    adapter: process.env.DB_ADAPTER,
    url: process.env.DATABASE_URL
  }
});
```

## Full Example

```javascript
const Triva = require('triva');
const fs = require('fs');

const app = new Triva({
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
    adapter: 'redis',
    host: 'localhost',
    port: 6379,
    ttl: 3600
  },
  
  // Database
  database: {
    adapter: 'mongodb',
    url: 'mongodb://localhost:27017/myapp'
  },
  
  // HTTPS
  https: {
    enabled: true,
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
  },
  autoRedirect: true,
  
  // Error tracking
  errorTracking: true
});

app.listen(443);
```

## Defaults

Default configuration:

```javascript
{
  logging: { enabled: false },
  throttle: { enabled: false },
  cache: { adapter: 'memory', ttl: 3600 },
  https: { enabled: false },
  autoRedirect: false,
  errorTracking: false
}
```

## Next Steps

- [Database Configuration](https://docs.trivajs.com/database/overview)
- [Deployment Guide](https://docs.trivajs.com/deployment/production)
- [HTTPS Setup](https://docs.trivajs.com/deployment/https)
