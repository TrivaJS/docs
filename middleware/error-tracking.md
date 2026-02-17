# Error Tracking

Automatic error capture, storage, and analysis.

## Basic Setup

Enable error tracking in `build()`:

```javascript
import { build, listen } from 'triva';

await build({
  env: 'development',
  errorTracking: {
    enabled: true
  }
});

listen(3000);
```

## Configuration

### errorTracking.enabled

Enable/disable error tracking.

```javascript
errorTracking: {
  enabled: true  // or false
}
```

## Accessing Errors

Use the `errorTracker` export:

```javascript
import { build, get, errorTracker, listen } from 'triva';

await build({
  env: 'development',
  errorTracking: {
    enabled: true
  }
});

get('/errors', async (req, res) => {
  const errors = await errorTracker.get();
  res.json(errors);
});

listen(3000);
```

## Error Tracker Methods

### errorTracker.capture(error, context)

Manually capture an error.

```javascript
import { errorTracker } from 'triva';

try {
  riskyOperation();
} catch (err) {
  await errorTracker.capture(err, {
    userId: req.user.id,
    action: 'riskyOperation'
  });
}
```

### errorTracker.get(filter)

Get all errors or filtered errors.

```javascript
// Get all errors
const allErrors = await errorTracker.get();

// Get unresolved errors
const unresolved = await errorTracker.get({ resolved: false });
```

### errorTracker.getById(id)

Get specific error by ID.

```javascript
const error = await errorTracker.getById('error-123');
```

### errorTracker.resolve(id)

Mark an error as resolved.

```javascript
await errorTracker.resolve('error-123');
```

### errorTracker.getStats()

Get error statistics.

```javascript
const stats = await errorTracker.getStats();
// { total: 50, resolved: 40, unresolved: 10 }
```

### errorTracker.clear()

Clear all errors.

```javascript
await errorTracker.clear();
```

## Error Entry Format

Each error entry contains:

```javascript
{
  id: 'error-123',
  timestamp: '2026-02-16T12:00:00.000Z',
  message: 'Cannot read property of undefined',
  stack: '...',
  type: 'TypeError',
  resolved: false,
  context: {
    url: '/api/users',
    method: 'GET',
    userId: '456'
  }
}
```

## Automatic Error Capture

Errors are automatically captured from:

1. Unhandled route errors
2. Middleware errors
3. Async handler rejections

```javascript
import { build, get, listen } from 'triva';

await build({
  env: 'development',
  errorTracking: { enabled: true }
});

get('/error', (req, res) => {
  throw new Error('This will be captured');
});

listen(3000);
```

## Manual Error Capture

Capture errors explicitly:

```javascript
import { build, get, errorTracker, listen } from 'triva';

await build({
  env: 'development',
  errorTracking: { enabled: true }
});

get('/risky', async (req, res) => {
  try {
    await riskyOperation();
    res.json({ success: true });
  } catch (err) {
    await errorTracker.capture(err, {
      userId: req.user?.id,
      operation: 'riskyOperation'
    });
    res.status(500).json({ error: 'Operation failed' });
  }
});

listen(3000);
```

## Admin Error Dashboard

Create an error viewer:

```javascript
import { build, get, errorTracker, listen } from 'triva';

await build({
  env: 'production',
  errorTracking: { enabled: true }
});

// List all errors
get('/admin/errors', async (req, res) => {
  const errors = await errorTracker.get();
  res.json(errors);
});

// Get unresolved errors
get('/admin/errors/unresolved', async (req, res) => {
  const errors = await errorTracker.get({ resolved: false });
  res.json(errors);
});

// Get specific error
get('/admin/errors/:id', async (req, res) => {
  const error = await errorTracker.getById(req.params.id);
  res.json(error);
});

// Resolve error
post('/admin/errors/:id/resolve', async (req, res) => {
  await errorTracker.resolve(req.params.id);
  res.json({ success: true });
});

// Error statistics
get('/admin/errors/stats', async (req, res) => {
  const stats = await errorTracker.getStats();
  res.json(stats);
});

listen(3000);
```

## Error Context

Add context to errors:

```javascript
import { build, get, errorTracker, listen } from 'triva';

await build({
  env: 'development',
  errorTracking: { enabled: true }
});

get('/api/process', async (req, res) => {
  try {
    await processData(req.body);
    res.json({ success: true });
  } catch (err) {
    await errorTracker.capture(err, {
      userId: req.user.id,
      data: req.body,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV
    });
    res.status(500).json({ error: 'Processing failed' });
  }
});

listen(3000);
```

## Environment-Specific

### Development

```javascript
await build({
  env: 'development',
  errorTracking: {
    enabled: true  // Capture all errors
  }
});
```

### Production

```javascript
await build({
  env: 'production',
  errorTracking: {
    enabled: true
  }
});
```

## Complete Example

```javascript
import { build, get, post, errorTracker, listen } from 'triva';

await build({
  env: 'production',
  errorTracking: { enabled: true }
});

// API routes
get('/api/data', async (req, res) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (err) {
    await errorTracker.capture(err, {
      userId: req.user?.id,
      endpoint: '/api/data'
    });
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Admin routes
get('/admin/errors', async (req, res) => {
  const errors = await errorTracker.get();
  res.json(errors);
});

get('/admin/errors/stats', async (req, res) => {
  const stats = await errorTracker.getStats();
  res.json(stats);
});

post('/admin/errors/:id/resolve', async (req, res) => {
  await errorTracker.resolve(req.params.id);
  res.json({ success: true });
});

listen(3000);
```

## Best Practices

1. **Enable in production** - Essential for monitoring
2. **Add context** - Include user info, request data
3. **Monitor regularly** - Check error dashboard
4. **Resolve errors** - Mark fixed errors as resolved
5. **Clean up** - Periodically clear old resolved errors
6. **Secure admin routes** - Protect error viewing endpoints

## Next Steps

- [Logging](https://docs.trivajs.com/middleware/logging)
- [Custom Middleware](https://docs.trivajs.com/middleware/custom)
- [Throttling](https://docs.trivajs.com/middleware/throttling)
