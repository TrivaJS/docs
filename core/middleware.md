# Middleware

Triva supports both constructor-driven built-in middleware and custom middleware registered with `app.use()`.

## Custom Middleware

```javascript
const requestTimer = (req, res, next) => {
  req.startedAt = Date.now();
  next();
};

app.use(requestTimer);
```

## Route-Level Middleware

```javascript
const requireToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  next();
};

app.get('/admin', requireToken, (req, res) => {
  res.json({ ok: true });
});
```

## Built-In Middleware Configuration

Built-in middleware is configured on the app:

```javascript
const app = new build({
  throttle: { limit: 100, window_ms: 60000 },
  retention: { enabled: true, maxEntries: 10000 },
  errorTracking: { enabled: true }
});
```

## Related Docs

- [Middleware Overview](/middleware/overview)
- [Throttling](/middleware/throttling)
- [Error Tracking](/middleware/error-tracking)
