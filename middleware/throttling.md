# Throttling (Rate Limiting)

Prevent abuse by limiting request rates per IP address.

## Basic Setup

Enable throttling in `build()`:

```javascript
import { build, listen } from 'triva';

await build({
  env: 'development',
  throttle: {
    enabled: true,
    max: 100,        // Max requests
    window: 60000    // Time window (ms)
  }
});

listen(3000);
```

This allows 100 requests per IP address per 60 seconds (1 minute).

## Configuration Options

### throttle.enabled

Enable/disable throttling.

```javascript
throttle: {
  enabled: true  // or false
}
```

### throttle.max

Maximum requests allowed per window.

```javascript
throttle: {
  max: 100  // 100 requests per window
}
```

### throttle.window

Time window in milliseconds.

```javascript
throttle: {
  window: 60000  // 60 seconds
}
```

## Common Configurations

### Strict Rate Limiting

```javascript
await build({
  throttle: {
    enabled: true,
    max: 50,
    window: 60000  // 50 requests per minute
  }
});
```

### Moderate Rate Limiting

```javascript
await build({
  throttle: {
    enabled: true,
    max: 100,
    window: 60000  // 100 requests per minute
  }
});
```

### Lenient Rate Limiting

```javascript
await build({
  throttle: {
    enabled: true,
    max: 500,
    window: 60000  // 500 requests per minute
  }
});
```

### API Rate Limiting

```javascript
await build({
  throttle: {
    enabled: true,
    max: 1000,
    window: 3600000  // 1000 requests per hour
  }
});
```

## How It Works

Throttling tracks requests by IP address:

1. Each IP gets a counter
2. Counter increments with each request
3. When max is reached, requests are rejected with 429 status
4. Counter resets after the time window

## Response Headers

Throttle adds these headers:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Time when limit resets

## Handling Rate Limit Errors

When rate limit is exceeded, client receives:

```json
{
  "error": "Too Many Requests",
  "retryAfter": 30
}
```

Status code: `429 Too Many Requests`

## Development vs Production

### Development

```javascript
await build({
  env: 'development',
  throttle: {
    enabled: false  // Disabled for easier testing
  }
});
```

### Production

```javascript
await build({
  env: 'production',
  throttle: {
    enabled: true,
    max: 100,
    window: 60000
  }
});
```

## Example Application

```javascript
import { build, get, listen } from 'triva';

await build({
  env: 'production',
  throttle: {
    enabled: true,
    max: 100,
    window: 60000
  }
});

get('/api/data', (req, res) => {
  res.json({ data: 'protected by rate limiting' });
});

listen(3000);
```

Test with curl:

```bash
# Send 101 requests quickly
for i in {1..101}; do
  curl http://localhost:3000/api/data
done

# The 101st request will receive 429 status
```

## Best Practices

1. **Enable in production** - Always enable throttling for public APIs
2. **Adjust limits** - Set appropriate limits for your use case
3. **Monitor logs** - Check for rate limit hits
4. **Inform users** - Document rate limits in your API docs
5. **Use headers** - Check response headers for limit info

## Next Steps

- [Logging](https://docs.trivajs.com/middleware/logging)
- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking)
- [Custom Middleware](https://docs.trivajs.com/middleware/custom)
