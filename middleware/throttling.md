# Throttling

Triva can add throttle middleware during app startup. The throttle layer uses the configured cache backend to store counters.

## Basic Setup

```javascript
import { build } from 'triva';

const app = new build({
  cache: { type: 'memory' },
  throttle: {
    limit: 100,
    window_ms: 60000
  }
});

app.listen(3000);
```

## Important Options

- `limit`
- `window_ms`
- `burst_limit`
- `burst_window_ms`
- `ban_threshold`
- `ban_ms`
- `violation_decay_ms`
- `ua_rotation_threshold`
- `namespace`
- `policies`

## Example With Policies

```javascript
const app = new build({
  cache: { type: 'memory' },
  throttle: {
    limit: 500,
    window_ms: 60000,
    burst_limit: 50,
    policies: ({ context }) => {
      if (context.url.startsWith('/api/admin')) {
        return { limit: 50, window_ms: 60000 };
      }

      if (context.url.startsWith('/api/public')) {
        return { limit: 2000, window_ms: 60000 };
      }

      return null;
    }
  }
});
```

## Rejection Shape

When a request is restricted, the middleware responds with status `429` and a JSON body like:

```json
{
  "error": "throttled",
  "reason": "sliding_window"
}
```

Possible reasons include `sliding_window`, `burst_limit`, `ua_rotation`, `auto_ban`, and `invalid_identity`.

## Related Docs

- [Middleware Overview](https://docs.trivajs.com/middleware/overview)
- [Configuration](https://docs.trivajs.com/core/configuration)
