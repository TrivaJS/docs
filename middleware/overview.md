# Middleware Overview

Triva middleware falls into two groups:

- built-in runtime middleware configured through constructor options
- application middleware registered with `app.use()` or attached to routes

## Built-In Runtime Middleware

```javascript
const app = new build({
  throttle: { limit: 100, window_ms: 60000 },
  retention: { enabled: true, maxEntries: 10000 },
  errorTracking: { enabled: true }
});
```

## Custom Middleware

```javascript
const stampRequest = (req, res, next) => {
  req.receivedAt = Date.now();
  next();
};

app.use(stampRequest);
```

## Route-Level Middleware

```javascript
const requireApiKey = (req, res, next) => {
  if (req.headers['x-api-key'] !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

app.get('/admin', requireApiKey, (req, res) => {
  res.json({ ok: true });
});
```
