# Throttling

Triva rate limiting is configured with the `throttle` option on the app.

## Basic Configuration

```javascript
const app = new build({
  throttle: {
    limit: 100,
    window_ms: 60000
  }
});
```

## Advanced Configuration

```javascript
const app = new build({
  throttle: {
    limit: 1000,
    window_ms: 60000,
    burst_limit: 100,
    burst_window_ms: 1000,
    ban_threshold: 10,
    ban_ms: 3600000,
    violation_decay_ms: 3600000,
    namespace: 'throttle'
  }
});
```

## Dynamic Policies

`policies` receives context for the current request and can override the base limits.

```javascript
const app = new build({
  throttle: {
    limit: 100,
    window_ms: 60000,
    policies: ({ context }) => {
      if (context.pathname?.startsWith('/api/admin')) {
        return { limit: 20, window_ms: 60000 };
      }

      if (context.pathname?.startsWith('/api/public')) {
        return { limit: 500, window_ms: 60000 };
      }

      return null;
    }
  }
});
```
