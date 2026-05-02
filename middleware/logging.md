# Logging

Built-in request/response logging with storage and search capabilities.

## Basic Setup

Enable logging in `build()`:

```javascript
import { build, listen } from 'triva';

await build({
  env: 'development',
  logging: {
    enabled: true,
    level: 'info'
  }
});

listen(3000);
```

## Configuration Options

### logging.enabled

Enable/disable logging.

```javascript
logging: {
  enabled: true  // or false
}
```

### logging.level

Set log level.

```javascript
logging: {
  level: 'info'  // 'debug', 'info', 'warn', 'error'
}
```

## Log Levels

### debug

Logs everything including debug information.

```javascript
logging: { level: 'debug' }
```

### info

Logs informational messages and above.

```javascript
logging: { level: 'info' }
```

### warn

Logs warnings and errors only.

```javascript
logging: { level: 'warn' }
```

### error

Logs errors only.

```javascript
logging: { level: 'error' }
```

## Accessing Logs

Use the `log` export to access stored logs:

```javascript
import { build, get, log, listen } from 'triva';

await build({
  env: 'development',
  logging: {
    enabled: true,
    level: 'info'
  }
});

get('/logs', async (req, res) => {
  const logs = await log.get();
  res.json(logs);
});

listen(3000);
```

## Log Methods

### log.get(filter)

Get all logs or filtered logs.

```javascript
import { log } from 'triva';

// Get all logs
const allLogs = await log.get();

// Get filtered logs
const errorLogs = await log.get({ level: 'error' });
```

### log.search(query)

Search logs by text.

```javascript
const results = await log.search('error');
```

### log.getStats()

Get logging statistics.

```javascript
const stats = await log.getStats();
// { total: 1000, byLevel: { info: 800, error: 200 } }
```

### log.clear()

Clear all logs.

```javascript
await log.clear();
```

### log.export(filter, filename)

Export logs to file.

```javascript
await log.export({ level: 'error' }, 'errors.json');
```

## Log Entry Format

Each log entry contains:

```javascript
{
  timestamp: '2026-02-16T12:00:00.000Z',
  level: 'info',
  method: 'GET',
  url: '/api/users',
  status: 200,
  duration: 45,  // milliseconds
  ip: '127.0.0.1'
}
```

## Common Use Cases

### View Recent Logs

```javascript
import { build, get, log, listen } from 'triva';

await build({
  env: 'development',
  logging: { enabled: true }
});

get('/admin/logs', async (req, res) => {
  const logs = await log.get();
  res.json(logs.slice(-100));  // Last 100 logs
});

listen(3000);
```

### View Error Logs

```javascript
get('/admin/errors', async (req, res) => {
  const errors = await log.get({ level: 'error' });
  res.json(errors);
});
```

### Log Statistics

```javascript
get('/admin/stats', async (req, res) => {
  const stats = await log.getStats();
  res.json(stats);
});
```

### Search Logs

```javascript
get('/admin/search', async (req, res) => {
  const query = req.query.q;
  const results = await log.search(query);
  res.json(results);
});
```

## Environment-Specific Logging

### Development

```javascript
await build({
  env: 'development',
  logging: {
    enabled: true,
    level: 'debug'  // Verbose logging
  }
});
```

### Production

```javascript
await build({
  env: 'production',
  logging: {
    enabled: true,
    level: 'warn'  // Only warnings and errors
  }
});
```

## Complete Example

```javascript
import { build, get, log, listen } from 'triva';

await build({
  env: 'production',
  logging: {
    enabled: true,
    level: 'info'
  }
});

// API routes
get('/api/data', (req, res) => {
  res.json({ data: 'example' });
});

// Admin log viewer
get('/admin/logs', async (req, res) => {
  const logs = await log.get();
  res.json(logs);
});

get('/admin/logs/errors', async (req, res) => {
  const errors = await log.get({ level: 'error' });
  res.json(errors);
});

get('/admin/logs/search', async (req, res) => {
  const results = await log.search(req.query.q);
  res.json(results);
});

get('/admin/logs/stats', async (req, res) => {
  const stats = await log.getStats();
  res.json(stats);
});

listen(3000);
```

## Best Practices

1. **Enable in production** - Essential for debugging
2. **Set appropriate level** - Use 'warn' or 'error' in production
3. **Monitor regularly** - Check logs for issues
4. **Clean up old logs** - Use `log.clear()` periodically
5. **Secure admin endpoints** - Protect log viewer routes

## Next Steps

- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking)
- [Throttling](https://docs.trivajs.com/middleware/throttling)
- [Custom Middleware](https://docs.trivajs.com/middleware/custom)
